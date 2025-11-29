// src/pages/UserOrderDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeftIcon,
    ShoppingBagIcon,
    SparklesIcon,
    ShieldCheckIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ClockIcon,
    TruckIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { getUserOrderDetail } from '../api/orders';
import { MedicationOrder } from '../types/pharmacy';
import { initializePayment, verifyPayment } from '../api/payments';
import axiosInstance from '../api/axiosInstance';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { formatDate } from '../utils/date';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getUserInsurances } from '../api/insurance';
import { UserInsurance } from '../types/insurance';

// Manual Payment Verification Component
const ManualPaymentVerification: React.FC<{ orderId: number; onVerified: () => void }> = ({ orderId, onVerified }) => {
    const [paymentRef, setPaymentRef] = useState<string>('');
    const [isVerifying, setIsVerifying] = useState<boolean>(false);

    const handleVerify = async () => {
        if (!paymentRef.trim()) {
            toast.error('Please enter a payment reference');
            return;
        }

        setIsVerifying(true);
        try {
            // Update order with payment reference
            const response = await axiosInstance.patch(`/pharmacy/orders/${orderId}/`, {
                payment_reference: paymentRef.trim()
            });
            
            console.log('Manual verification - Order updated:', response.data);
            console.log('Manual verification - Payment status:', response.data.payment_status);
            
            if (response.data.payment_status === 'paid') {
                toast.success('Payment verified successfully!');
                onVerified();
            } else {
                toast.success('Payment reference added. Refreshing order...');
                setTimeout(() => {
                    onVerified();
                }, 1000);
            }
            setPaymentRef('');
        } catch (error: any) {
            console.error('Manual verification error:', error);
            toast.error(error.response?.data?.error || 'Failed to verify payment. Please check the reference and try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="space-y-2">
            <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="Enter transaction reference (e.g., FLW-MOCK-...)"
                className="w-full px-4 py-2 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                disabled={isVerifying}
            />
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerify}
                disabled={isVerifying || !paymentRef.trim()}
                className="w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isVerifying ? (
                    <>
                        <Spinner size="sm" />
                        Verifying...
                    </>
                ) : (
                    <>
                        <CheckCircleIcon className="h-4 w-4" />
                        Verify with Reference
                    </>
                )}
            </motion.button>
        </div>
    );
};

const UserOrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { user } = useAuth();
    const [order, setOrder] = useState<MedicationOrder | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
    const [userInsurances, setUserInsurances] = useState<UserInsurance[]>([]);
    const [selectedInsuranceId, setSelectedInsuranceId] = useState<number | null>(null);
    const [isUpdatingInsurance, setIsUpdatingInsurance] = useState<boolean>(false);
    const [loadingInsurances, setLoadingInsurances] = useState<boolean>(false);

    const fetchOrder = useCallback(async () => {
        if (!orderId) {
            setError("Order ID not found.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching order:', orderId);
            const fetchedOrder = await getUserOrderDetail(parseInt(orderId, 10));
            console.log('Order fetched successfully:', fetchedOrder);
            setOrder(fetchedOrder);
        } catch (err: any) {
            console.error('Failed to fetch order:', err);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);
            
            // Don't redirect on 401/403 - let the auth interceptor handle it
            // Just show error message
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('You do not have permission to view this order.');
            } else if (err.response?.status === 404) {
                setError('Order not found.');
            } else {
                setError('Failed to load order details. Please try again.');
            }
            setOrder(null);
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    // Fetch user's insurance plans
    useEffect(() => {
        const fetchInsurances = async () => {
            setLoadingInsurances(true);
            try {
                const response = await getUserInsurances();
                if (response && Array.isArray(response.results)) {
                    setUserInsurances(response.results);
                    // Auto-select primary insurance if available and order doesn't have insurance
                    if (!order?.user_insurance) {
                        const primary = response.results.find(ins => ins.is_primary);
                        if (primary) {
                            setSelectedInsuranceId(primary.id);
                        }
                    } else {
                        setSelectedInsuranceId(order.user_insurance.id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch insurance plans:', err);
            } finally {
                setLoadingInsurances(false);
            }
        };
        fetchInsurances();
    }, [order?.user_insurance]);

    // Update selected insurance when order changes
    useEffect(() => {
        if (order?.user_insurance) {
            setSelectedInsuranceId(order.user_insurance.id);
        } else {
            setSelectedInsuranceId(null);
        }
    }, [order?.user_insurance]);

    // Periodically check payment status if payment is pending
    useEffect(() => {
        if (!order || order.payment_status === 'paid') return;

        // Check payment status every 3 seconds if payment is pending (for up to 2 minutes)
        let attempts = 0;
        const maxAttempts = 40; // 40 attempts * 3 seconds = 2 minutes
        
        const interval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                console.log('Stopped checking payment status after max attempts');
                clearInterval(interval);
                return;
            }

            try {
                console.log(`Checking payment status for order ${order.id} (attempt ${attempts})`);
                const updatedOrder = await getUserOrderDetail(order.id);
                console.log('Current payment status:', updatedOrder.payment_status);
                
                if (updatedOrder.payment_status === 'paid') {
                    console.log('Payment status updated to paid!');
                    setOrder(updatedOrder);
                    toast.success('Payment confirmed!');
                    clearInterval(interval);
                } else if (updatedOrder.payment_reference && !order.payment_reference) {
                    // Payment reference was added, try to verify it
                    console.log('Payment reference found, attempting verification:', updatedOrder.payment_reference);
                    setOrder(updatedOrder);
                    if (updatedOrder.payment_reference) {
                        handleVerifyAndUpdatePayment(updatedOrder.payment_reference);
                    }
                }
            } catch (err) {
                console.error('Failed to check payment status:', err);
            }
        }, 3000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order?.id, order?.payment_status, order?.payment_reference]);

    // Check for payment callback on initial load (before order loads)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tx_ref = urlParams.get('tx_ref');
        const transaction_id = urlParams.get('transaction_id');
        const status = urlParams.get('status');
        
        // Flutterwave can return either tx_ref or transaction_id
        const reference = tx_ref || transaction_id;
        
        if (reference && (status === 'successful' || status === 'completed')) {
            console.log('Payment callback detected on page load:', { reference, status, orderId });
            // Store in sessionStorage to verify after order loads
            sessionStorage.setItem(`payment_callback_${orderId}`, JSON.stringify({ reference, status }));
            
            // Clean up URL to prevent re-verification on refresh
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('tx_ref');
            newUrl.searchParams.delete('transaction_id');
            newUrl.searchParams.delete('status');
            window.history.replaceState({}, document.title, newUrl.pathname);
        }
    }, [orderId]);

    // Check for payment callback after order loads
    useEffect(() => {
        if (!order) return;
        
        // First, check sessionStorage for callback data
        const storedCallback = sessionStorage.getItem(`payment_callback_${orderId}`);
        if (storedCallback) {
            try {
                const { reference, status } = JSON.parse(storedCallback);
                console.log('Processing stored payment callback:', { reference, status });
                sessionStorage.removeItem(`payment_callback_${orderId}`);
                handleVerifyAndUpdatePayment(reference);
                return;
            } catch (e) {
                console.error('Failed to parse stored callback:', e);
                sessionStorage.removeItem(`payment_callback_${orderId}`);
            }
        }
        
        // Also check URL parameters (in case they're still there)
        const urlParams = new URLSearchParams(window.location.search);
        const tx_ref = urlParams.get('tx_ref');
        const transaction_id = urlParams.get('transaction_id');
        const status = urlParams.get('status');
        
        const reference = tx_ref || transaction_id;
        
        if (reference && (status === 'successful' || status === 'completed')) {
            console.log('Payment callback detected from URL:', { reference, status });
            handleVerifyAndUpdatePayment(reference);
            // Clean up URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('tx_ref');
            newUrl.searchParams.delete('transaction_id');
            newUrl.searchParams.delete('status');
            window.history.replaceState({}, document.title, newUrl.pathname);
        }
        
        // Auto-verify if order has payment_reference but status is still pending
        // Only do this once per order load to avoid infinite loops
        if (order.payment_reference && 
            order.payment_status === 'pending' && 
            !isProcessingPayment &&
            !sessionStorage.getItem(`auto_verified_${order.id}`)) {
            console.log('Auto-verifying payment for order with reference:', order.payment_reference);
            sessionStorage.setItem(`auto_verified_${order.id}`, 'true');
            // Small delay to ensure order is fully loaded
            setTimeout(() => {
                if (order.payment_reference) {
                    handleVerifyAndUpdatePayment(order.payment_reference);
                }
            }, 500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order?.id, order?.payment_reference, order?.payment_status]);

    const handleVerifyAndUpdatePayment = async (reference: string) => {
        if (!order) return;
        
        // Prevent duplicate verification
        if (isProcessingPayment) {
            console.log('Payment verification already in progress');
            return;
        }
        
        // If payment is already paid, don't verify again
        if (order.payment_status === 'paid' && order.payment_reference === reference) {
            console.log('Payment already verified and paid');
            return;
        }
        
        setIsProcessingPayment(true);
        console.log('Verifying payment with reference:', reference, 'for order:', order.id);
        
        try {
            const verification = await verifyPayment(reference);
            console.log('Payment verification result:', verification);
            
            if (verification.verified && order) {
                // Use the reference from verification response if available, otherwise use the reference
                const paymentRef = (verification as any).tx_ref || verification.reference || reference;
                
                // Update order with payment reference using the user-facing endpoint
                try {
                    console.log('Updating order with payment reference:', paymentRef);
                    const response = await axiosInstance.patch(`/pharmacy/orders/${order.id}/`, {
                        payment_reference: paymentRef
                    });
                    console.log('Order updated successfully:', response.data);
                    console.log('Payment status in response:', response.data.payment_status);
                    toast.success('Payment verified successfully!');
                    // Wait a bit before refreshing to ensure backend has processed
                    setTimeout(async () => {
                        await fetchOrder(); // Refresh order data
                    }, 1000);
                } catch (updateError: any) {
                    console.error('Failed to update order with payment reference:', updateError);
                    console.error('Error details:', updateError.response?.data);
                    console.error('Error status:', updateError.response?.status);
                    // Even if update fails, payment is verified, so show success but warn
                    toast.error(`Payment verified but update failed: ${updateError.response?.data?.error || updateError.message}. Please contact support.`);
                    await fetchOrder(); // Refresh anyway
                }
            } else {
                console.error('Payment verification failed:', verification);
                toast.error(verification.message || 'Payment verification failed');
            }
        } catch (error: any) {
            console.error('Payment verification error:', error);
            console.error('Error details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            toast.error(error.response?.data?.error || error.message || 'Failed to verify payment. Please contact support.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleUpdateInsurance = async () => {
        if (!order || !selectedInsuranceId) return;
        
        setIsUpdatingInsurance(true);
        try {
            const response = await axiosInstance.patch(`/pharmacy/orders/${order.id}/`, {
                user_insurance_id: selectedInsuranceId
            });
            setOrder(response.data);
            toast.success('Insurance plan updated successfully!');
            // Refresh order to get updated insurance coverage
            await fetchOrder();
        } catch (error: any) {
            console.error('Failed to update insurance:', error);
            toast.error(error.response?.data?.error || 'Failed to update insurance plan.');
        } finally {
            setIsUpdatingInsurance(false);
        }
    };

    const handleRemoveInsurance = async () => {
        if (!order) return;
        
        setIsUpdatingInsurance(true);
        try {
            const response = await axiosInstance.patch(`/pharmacy/orders/${order.id}/`, {
                user_insurance_id: null
            });
            setOrder(response.data);
            setSelectedInsuranceId(null);
            toast.success('Insurance plan removed successfully!');
            await fetchOrder();
        } catch (error: any) {
            console.error('Failed to remove insurance:', error);
            toast.error(error.response?.data?.error || 'Failed to remove insurance plan.');
        } finally {
            setIsUpdatingInsurance(false);
        }
    };

    const handlePayNow = async () => {
        if (!order || !order.total_amount) return;
        
        // Calculate amount to pay (total amount minus insurance coverage, or patient copay)
        const amountToPay = order.patient_copay 
            ? parseFloat(order.patient_copay) 
            : parseFloat(order.total_amount);
        
        // If insurance covers everything, no payment needed
        if (order.user_insurance && amountToPay <= 0) {
            toast.success('Your insurance covers this order. No payment required!');
            return;
        }
        
        try {
            const response = await initializePayment({
                amount: amountToPay,
                email: user?.email || '',
                payment_type: 'medication_order',
                payment_for_id: order.id,
                callback_url: `${window.location.origin}/payment/callback`
            });

            if (response.authorization_url) {
                // Store payment info in sessionStorage for callback page
                sessionStorage.setItem(`payment_info_${order.id}`, JSON.stringify({
                    orderId: order.id,
                    paymentType: 'medication_order',
                    originalReference: response.reference,
                    txRef: response.tx_ref || response.reference
                }));
                console.log('Stored payment info:', { orderId: order.id, reference: response.reference });
                window.location.href = response.authorization_url;
            } else {
                toast.error('Failed to get payment URL');
            }
        } catch (error: any) {
            console.error('Payment initialization error:', error);
            toast.error(error.response?.data?.error || 'Failed to initialize payment.');
        }
    };

    const getStatusInfo = (status: MedicationOrder['status']) => {
        switch (status) {
            case 'pending': return { icon: ClockIcon, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-100', label: 'Pending' };
            case 'processing': return { icon: ShoppingBagIcon, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100', label: 'Processing' };
            case 'ready': return { icon: CheckCircleIcon, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100', label: 'Ready' };
            case 'delivering': return { icon: TruckIcon, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-100', label: 'Delivering' };
            case 'completed': return { icon: CheckCircleIcon, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100', label: 'Completed' };
            case 'cancelled': return { icon: XCircleIcon, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-100', label: 'Cancelled' };
            default: return { icon: ShoppingBagIcon, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-100', label: 'Unknown' };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center p-4">
                <ErrorMessage message={error || 'Order not found'} onRetry={fetchOrder} />
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    // Payment is required if: total_amount exists, payment not paid, and (no insurance OR insurance doesn't cover full amount)
    const requiresPayment = order.total_amount && 
                           order.payment_status !== 'paid' && 
                           parseFloat(order.total_amount) > 0 &&
                           (!order.user_insurance || (order.patient_copay && parseFloat(order.patient_copay) > 0));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden"
            >
                <motion.div
                    className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                    animate={{ x: [-100, 200], y: [-50, 100], rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                ></motion.div>
                <motion.div
                    className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                    animate={{ x: [100, -200], y: [50, -100], rotate: [360, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                ></motion.div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/orders"
                        className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back to Orders
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold uppercase tracking-wider mb-6"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        ORDER #{order.id}
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                        Medication Order Details
                    </h1>
                    <p className="text-lg text-white/90">Track your medication order status and payment.</p>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50" />
                    </svg>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Status Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl ${statusInfo.bgColor} border-2 ${statusInfo.borderColor}`}>
                                        <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">Order Status</h3>
                                        <p className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Requirement Card */}
                        {requiresPayment && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-xl shadow-gray-200/50 p-8 border-2 border-orange-200"
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-4 bg-orange-100 rounded-2xl">
                                        <ExclamationCircleIcon className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Required</h3>
                                        <p className="text-gray-700 mb-4">
                                            Complete payment to proceed with your order.
                                        </p>

                                        {/* Insurance Selection */}
                                        {userInsurances.length > 0 && (
                                            <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-primary/20">
                                                <label htmlFor="insurance-select" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <ShieldCheckIcon className="h-5 w-5 text-primary" />
                                                    Use Insurance Plan (Optional)
                                                </label>
                                                <div className="flex gap-3">
                                                    <select
                                                        id="insurance-select"
                                                        value={selectedInsuranceId || ''}
                                                        onChange={(e) => setSelectedInsuranceId(e.target.value ? Number(e.target.value) : null)}
                                                        disabled={loadingInsurances || isUpdatingInsurance}
                                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="">No Insurance</option>
                                                        {userInsurances.map((insurance) => (
                                                            <option key={insurance.id} value={insurance.id}>
                                                                {insurance.plan.provider.name} - {insurance.plan.name}
                                                                {insurance.is_primary ? ' (Primary)' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {selectedInsuranceId !== (order?.user_insurance?.id || null) && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={selectedInsuranceId ? handleUpdateInsurance : handleRemoveInsurance}
                                                            disabled={isUpdatingInsurance || loadingInsurances}
                                                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                        >
                                                            {isUpdatingInsurance ? (
                                                                <>
                                                                    <Spinner size="sm" />
                                                                    Updating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ShieldCheckIcon className="h-5 w-5" />
                                                                    {selectedInsuranceId ? 'Apply' : 'Remove'}
                                                                </>
                                                            )}
                                                        </motion.button>
                                                    )}
                                                </div>
                                                {order?.user_insurance && (
                                                    <div className="mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm font-semibold text-gray-700">Insurance Coverage:</span>
                                                            <span className="text-lg font-black text-green-700">
                                                                ₦{order.insurance_covered_amount ? parseFloat(order.insurance_covered_amount).toLocaleString() : '0'}
                                                            </span>
                                                        </div>
                                                        {order.patient_copay && parseFloat(order.patient_copay) > 0 && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-semibold text-gray-700">Your Copay:</span>
                                                                <span className="text-lg font-black text-orange-600">
                                                                    ₦{parseFloat(order.patient_copay).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {order.patient_copay && parseFloat(order.patient_copay) === 0 && (
                                                            <p className="text-sm text-green-700 font-semibold mt-2">
                                                                ✓ Your insurance covers the full amount. No payment required!
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-orange-200">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-gray-700">Total Amount:</span>
                                                    <span className="text-2xl font-black text-orange-600">
                                                        ₦{parseFloat(order.total_amount).toLocaleString()}
                                                    </span>
                                                </div>
                                                {order?.user_insurance && order.insurance_covered_amount && (
                                                    <>
                                                        <div className="flex justify-between items-center text-green-700 border-t pt-3">
                                                            <span className="text-sm font-semibold">Insurance Coverage:</span>
                                                            <span className="text-lg font-bold">
                                                                -₦{parseFloat(order.insurance_covered_amount).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        {order.patient_copay && parseFloat(order.patient_copay) > 0 && (
                                                            <div className="flex justify-between items-center border-t pt-3">
                                                                <span className="text-lg font-bold text-gray-900">Amount to Pay:</span>
                                                                <span className="text-2xl font-black text-orange-600">
                                                                    ₦{parseFloat(order.patient_copay).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handlePayNow}
                                            disabled={isProcessingPayment || (order?.user_insurance && order.patient_copay && parseFloat(order.patient_copay) === 0)}
                                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {isProcessingPayment ? (
                                                <>
                                                    <Spinner size="sm" />
                                                    Processing...
                                                </>
                                            ) : order?.user_insurance && order.patient_copay && parseFloat(order.patient_copay) === 0 ? (
                                                <>
                                                    <CheckCircleIcon className="h-6 w-6" />
                                                    Fully Covered by Insurance
                                                </>
                                            ) : (
                                                <>
                                                    <BanknotesIcon className="h-6 w-6" />
                                                    Pay {order?.user_insurance && order.patient_copay ? `₦${parseFloat(order.patient_copay).toLocaleString()}` : `₦${order?.total_amount ? parseFloat(order.total_amount).toLocaleString() : '0'}`}
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Payment Status */}
                        {order.payment_status && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className={`rounded-3xl shadow-xl shadow-gray-200/50 p-8 border-2 ${
                                    order.payment_status === 'paid' ? 'bg-green-50 border-green-200' : 
                                    order.payment_status === 'failed' ? 'bg-red-50 border-red-200' : 
                                    'bg-yellow-50 border-yellow-200'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl ${
                                        order.payment_status === 'paid' ? 'bg-green-100' : 
                                        order.payment_status === 'failed' ? 'bg-red-100' : 
                                        'bg-yellow-100'
                                    }`}>
                                        <BanknotesIcon className={`h-8 w-8 ${
                                            order.payment_status === 'paid' ? 'text-green-600' : 
                                            order.payment_status === 'failed' ? 'text-red-600' : 
                                            'text-yellow-600'
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-gray-900 mb-1">Payment Status</h3>
                                        <p className={`text-lg font-bold capitalize ${
                                            order.payment_status === 'paid' ? 'text-green-600' : 
                                            order.payment_status === 'failed' ? 'text-red-600' : 
                                            'text-yellow-600'
                                        }`}>
                                            {order.payment_status === 'paid' ? 'Paid' : 
                                             order.payment_status === 'failed' ? 'Failed' : 
                                             'Pending'}
                                        </p>
                                        {order.payment_reference && (
                                            <p className="text-sm text-gray-600 mt-2">Reference: {order.payment_reference}</p>
                                        )}
                                        {order.payment_status === 'pending' && (
                                            <div className="mt-4 space-y-3">
                                                {order.payment_reference ? (
                                                    <>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => {
                                                                if (order.payment_reference) {
                                                                    handleVerifyAndUpdatePayment(order.payment_reference);
                                                                }
                                                            }}
                                                            disabled={isProcessingPayment}
                                                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            {isProcessingPayment ? (
                                                                <>
                                                                    <Spinner size="sm" />
                                                                    Verifying...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircleIcon className="h-5 w-5" />
                                                                    Verify Payment
                                                                </>
                                                            )}
                                                        </motion.button>
                                                        <p className="text-xs text-gray-500 text-center">
                                                            Payment reference found. Click to verify payment status.
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-3">
                                                            <p className="text-sm font-semibold text-yellow-900 mb-2">
                                                                Payment completed but status not updated?
                                                            </p>
                                                            <p className="text-xs text-yellow-700 mb-3">
                                                                If you completed payment on Flutterwave, enter your transaction reference below to verify:
                                                            </p>
                                                            <ManualPaymentVerification 
                                                                orderId={order.id}
                                                                onVerified={fetchOrder}
                                                            />
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={async () => {
                                                                setIsProcessingPayment(true);
                                                                try {
                                                                    // Refresh order to check if payment was processed
                                                                    await fetchOrder();
                                                                    toast.success('Order status refreshed');
                                                                } catch (err) {
                                                                    console.error('Failed to refresh order:', err);
                                                                    toast.error('Failed to refresh order status');
                                                                } finally {
                                                                    setIsProcessingPayment(false);
                                                                }
                                                            }}
                                                            disabled={isProcessingPayment}
                                                            className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            {isProcessingPayment ? (
                                                                <>
                                                                    <Spinner size="sm" />
                                                                    Checking...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ClockIcon className="h-5 w-5" />
                                                                    Refresh Order Status
                                                                </>
                                                            )}
                                                        </motion.button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Order Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100"
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-6">Order Items</h3>
                            <div className="space-y-4">
                                {order.items?.map((item, index) => (
                                    <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900">{item.medication_name_text || 'Medication'}</p>
                                                <p className="text-sm text-gray-600">{item.dosage_text || 'Dosage not specified'}</p>
                                                <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                            </div>
                                            {item.price_per_unit && (
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">₦{parseFloat(item.price_per_unit).toLocaleString()} each</p>
                                                    {item.total_price && (
                                                        <p className="font-bold text-gray-900">₦{parseFloat(item.total_price).toLocaleString()}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {order.total_amount && (
                                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-700">Total Amount:</span>
                                        <span className="text-3xl font-black text-primary">
                                            ₦{parseFloat(order.total_amount).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100"
                        >
                            <h3 className="text-xl font-black text-gray-900 mb-6">Order Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Order Date</p>
                                    <p className="font-bold text-gray-900">{formatDate(order.order_date)}</p>
                                </div>
                                {order.pharmacy_details && (
                                    <div>
                                        <p className="text-sm text-gray-600">Pharmacy</p>
                                        <p className="font-bold text-gray-900">{order.pharmacy_details.name}</p>
                                        {order.pharmacy_details.address && (
                                            <p className="text-sm text-gray-600 mt-1">{order.pharmacy_details.address}</p>
                                        )}
                                    </div>
                                )}
                                {order.pickup_or_delivery_date && (
                                    <div>
                                        <p className="text-sm text-gray-600">Pickup/Delivery Date</p>
                                        <p className="font-bold text-gray-900">{formatDate(order.pickup_or_delivery_date)}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-600">Delivery Type</p>
                                    <p className="font-bold text-gray-900">{order.is_delivery ? 'Home Delivery' : 'Pickup'}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Insurance Info */}
                        {order.user_insurance && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl shadow-xl shadow-gray-200/50 p-8 border-2 border-teal-200"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <ShieldCheckIcon className="h-6 w-6 text-teal-600" />
                                    <h3 className="text-xl font-black text-gray-900">Insurance Coverage</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Insurance Plan</p>
                                        <p className="font-bold text-gray-900">
                                            {order.user_insurance.plan.provider.name} - {order.user_insurance.plan.name}
                                        </p>
                                    </div>
                                    {order.insurance_covered_amount && (
                                        <div>
                                            <p className="text-sm text-gray-600">Covered Amount</p>
                                            <p className="font-bold text-green-700">
                                                ₦{parseFloat(order.insurance_covered_amount).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {order.patient_copay && (
                                        <div>
                                            <p className="text-sm text-gray-600">Your Copay</p>
                                            <p className="font-bold text-blue-700">
                                                ₦{parseFloat(order.patient_copay).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserOrderDetailPage;

