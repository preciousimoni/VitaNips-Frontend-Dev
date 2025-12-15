// src/pages/pharmacy/PharmacyOrderDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeftIcon, ShieldCheckIcon, CheckCircleIcon, 
    PencilIcon, XMarkIcon, CalculatorIcon 
} from '@heroicons/react/24/outline';
import { getPharmacyOrderDetail, updatePharmacyOrder } from '../../api/pharmacy';
import { MedicationOrder, MedicationOrderUpdatePayload } from '../../types/pharmacy';
import axios from 'axios';
import toast from 'react-hot-toast';

const PharmacyOrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();

    const [order, setOrder] = useState<MedicationOrder | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [showPriceModal, setShowPriceModal] = useState<boolean>(false);
    const [itemPrices, setItemPrices] = useState<Record<number, string>>({});
    const [totalAmount, setTotalAmount] = useState<string>('');
    const [isSavingPrice, setIsSavingPrice] = useState<boolean>(false);

    const fetchOrder = useCallback(async () => {
        if (!orderId) {
            setError("Order ID not found.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        setUpdateError(null);
        try {
            const fetchedOrder = await getPharmacyOrderDetail(parseInt(orderId, 10));
            setOrder(fetchedOrder);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load order details.";
            setError(errorMessage);
            console.error(err);
            setOrder(null);
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    // Auto-refresh order data periodically if payment is pending
    useEffect(() => {
        if (!orderId || !order || order.payment_status === 'paid') return;

        // Check payment status every 5 seconds if payment is pending (for up to 2 minutes)
        let attempts = 0;
        const maxAttempts = 24; // 24 attempts * 5 seconds = 2 minutes
        
        const interval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(interval);
                return;
            }

            try {
                const orderIdNum = parseInt(orderId, 10);
                if (isNaN(orderIdNum)) {
                    console.error('Invalid orderId:', orderId);
                    clearInterval(interval);
                    return;
                }
                
                console.log(`Checking payment status for order ${orderIdNum} (attempt ${attempts})`);
                const updatedOrder = await getPharmacyOrderDetail(orderIdNum);
                console.log('Current payment status:', updatedOrder.payment_status);
                
                if (updatedOrder.payment_status === 'paid') {
                    console.log('Payment status updated to paid!');
                    setOrder(updatedOrder);
                    toast.success('Payment confirmed!');
                    clearInterval(interval);
                }
            } catch (err) {
                console.error('Failed to check payment status:', err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [orderId, order?.payment_status]);

    // Initialize prices when order loads
    useEffect(() => {
        if (order) {
            const prices: Record<number, string> = {};
            order.items?.forEach(item => {
                if (item.price_per_unit) {
                    prices[item.id] = parseFloat(item.price_per_unit).toString();
                }
            });
            setItemPrices(prices);
            if (order.total_amount) {
                setTotalAmount(parseFloat(order.total_amount).toString());
            }
        }
    }, [order]);

    const calculateTotal = useCallback(() => {
        let calculatedTotal = 0;
        order?.items?.forEach(item => {
            const price = itemPrices[item.id];
            if (price) {
                const itemTotal = parseFloat(price) * (item.quantity || 1);
                calculatedTotal += itemTotal;
            }
        });
        return calculatedTotal;
    }, [order, itemPrices]);

    const handleOpenPriceModal = () => {
        if (order) {
            setShowPriceModal(true);
            // Initialize with current values or empty
            const prices: Record<number, string> = {};
            order.items?.forEach(item => {
                prices[item.id] = item.price_per_unit ? parseFloat(item.price_per_unit).toString() : '';
            });
            setItemPrices(prices);
            setTotalAmount(order.total_amount ? parseFloat(order.total_amount).toString() : '');
        }
    };

    const handleSavePrices = async () => {
        if (!orderId || !order) return;
        
        setIsSavingPrice(true);
        try {
            const orderIdNum = parseInt(orderId, 10);
            if (isNaN(orderIdNum)) {
                toast.error('Invalid order ID');
                setIsSavingPrice(false);
                return;
            }
            
            // Calculate total from item prices if total is not manually set
            let finalTotal = totalAmount ? parseFloat(totalAmount) : calculateTotal();
            
            if (isNaN(finalTotal) || finalTotal <= 0) {
                toast.error('Please set valid prices for items or enter a total amount');
                setIsSavingPrice(false);
                return;
            }

            // Update order with total_amount
            const updatedOrder = await updatePharmacyOrder(orderIdNum, {
                total_amount: finalTotal.toString()
            } as Partial<MedicationOrderUpdatePayload>);

            setOrder(updatedOrder);
            setShowPriceModal(false);
            toast.success('Order pricing updated successfully! Patient can now see the amount to pay.');
        } catch (err: any) {
            console.error('Failed to update prices:', err);
            let errorMessage = 'Failed to update prices';
            if (err.response?.data) {
                const errorData = err.response.data;
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (typeof errorData === 'object') {
                    // Extract first error message from validation errors
                    const errors = Object.values(errorData).flat();
                    if (errors.length > 0) {
                        errorMessage = Array.isArray(errors[0]) ? errors[0][0] : errors[0];
                    }
                }
            }
            toast.error(errorMessage);
        } finally {
            setIsSavingPrice(false);
        }
    };

    const handleStatusUpdate = async (newStatus: MedicationOrder['status']) => {
        if (!orderId || !order) return;
        setIsUpdating(true);
        setUpdateError(null);
        const payload: Partial<MedicationOrderUpdatePayload> = { status: newStatus };
        try {
            const orderIdNum = parseInt(orderId, 10);
            if (isNaN(orderIdNum)) {
                setUpdateError("Invalid order ID");
                setIsUpdating(false);
                return;
            }
            const updatedOrder = await updatePharmacyOrder(orderIdNum, payload);
            setOrder(updatedOrder);
        } catch (err) {
            let message = "Failed to update order status. Please try again.";
            if (axios.isAxiosError(err) && err.response?.data) {
                const backendError = err.response.data;
                if (backendError.detail) {
                    message = backendError.detail;
                } else if (backendError.status && Array.isArray(backendError.status) && backendError.status.length > 0) {
                    message = `Status: ${backendError.status.join(', ')}`;
                } else if (typeof backendError === 'string') {
                    message = backendError;
                } else {
                    const errorMessages = Object.values(backendError).flat();
                    if (errorMessages.length > 0) {
                        message = errorMessages.join(' ');
                    }
                }
            } else if (err instanceof Error && err.message) {
                message = err.message;
            }
            setUpdateError(message);
            console.error("Order Update Error:", axios.isAxiosError(err) ? err.response?.data || err : err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <p className="text-muted text-center py-10">Loading order details...</p>;
    }

    if (error) {
        return <p className="text-red-600 text-center py-10">{error}</p>;
    }

    if (!order) {
        return <p className="text-muted text-center py-10">Order not found.</p>;
    }

    return (
        <div className="min-h-screen bg-cream-50 pb-12 pt-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link 
                    to="/pharmacy/orders" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all mb-8"
                >
                    <ArrowLeftIcon className="h-5 w-5 stroke-[3]" /> 
                    Back to Orders
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-black font-display tracking-tight">
                        Order Details #{order.id}
                    </h1>
                    <div className={`px-4 py-2 rounded-xl font-black text-sm border-2 border-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                        order.status === 'pending' ? 'bg-orange-100 text-orange-900' :
                        order.status === 'processing' ? 'bg-amber-100 text-amber-900' :
                        order.status === 'ready' ? 'bg-blue-100 text-blue-900' :
                        order.status === 'delivering' ? 'bg-purple-100 text-purple-900' :
                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-900' :
                        'bg-red-100 text-red-900'
                    }`}>
                        {order.status}
                    </div>
                </div>

                {updateError && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 text-red-900 p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 font-bold"
                    >
                        {updateError}
                    </motion.div>
                )}

                <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {/* Basic Info Header */}
                    <div className="p-8 border-b-4 border-black bg-cream-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-black text-black uppercase tracking-wider">Patient</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {typeof order.user === 'object' && order.user
                                        ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() || order.user.username || order.user.email || 'N/A'
                                        : typeof order.user === 'number'
                                        ? `User ID: ${order.user}`
                                        : 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-black uppercase tracking-wider">Order Date</p>
                                <p className="text-xl font-bold text-gray-800">{new Date(order.order_date).toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-black uppercase tracking-wider">Prescription ID</p>
                                <p className="text-xl font-bold text-gray-800">{order.prescription ?? 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-black uppercase tracking-wider">Delivery Method</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-gray-800">{order.is_delivery ? 'Home Delivery' : 'Pickup at Pharmacy'}</span>
                                    {order.is_delivery && order.delivery_address && (
                                        <span className="text-sm text-gray-600 font-medium">({order.delivery_address})</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-black font-display">Items Ordered</h3>
                            {order.status === 'pending' && !order.total_amount && (
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleOpenPriceModal}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl border-2 border-black hover:bg-gray-800 transition-colors text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                                >
                                    <CalculatorIcon className="h-5 w-5" />
                                    Set Prices & Total
                                </motion.button>
                            )}
                            {order.status === 'pending' && order.total_amount && (
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleOpenPriceModal}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl border-2 border-black hover:bg-gray-50 transition-colors text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <PencilIcon className="h-5 w-5 stroke-[2.5]" />
                                    Update Prices
                                </motion.button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {(order.items || []).map(item => (
                                <div key={item.id} className="bg-cream-50 p-4 rounded-2xl border-2 border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="font-bold text-lg text-black">{item.medication_name_text || item.medication_name}</p>
                                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600 mt-1">
                                            <span className="bg-white px-2 py-1 rounded-lg border border-black text-xs uppercase tracking-wide text-black">{item.dosage_text || item.dosage}</span>
                                            <span>Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {item.price_per_unit ? (
                                            <p className="font-black text-xl text-black">
                                                ₦{parseFloat(item.price_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-medium text-gray-500">/ unit</span>
                                            </p>
                                        ) : (
                                            <span className="inline-block px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm font-bold">Price Pending</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-cream-100 rounded-2xl border-4 border-black border-dashed flex flex-col sm:flex-row justify-between items-center gap-4">
                            <span className="text-xl font-black text-black font-display uppercase tracking-wide">Total Amount</span>
                            <div className="text-right">
                                <span className="text-4xl font-black text-black block">
                                    {order.total_amount 
                                        ? `₦${parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : 'Pending Calculation'}
                                </span>
                                {!order.total_amount && (
                                    <p className="text-sm font-bold text-orange-600 mt-1 flex items-center gap-1 justify-end">
                                        <CalculatorIcon className="h-4 w-4" /> Set prices to enable payment
                                    </p>
                                )}
                            </div>
                        </div>
                    
                    {/* Insurance Information */}
                    {order.user_insurance && (
                        <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border-4 border-black">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-200 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <ShieldCheckIcon className="h-6 w-6 text-black" />
                                </div>
                                <h4 className="font-black text-xl text-black font-display uppercase tracking-wide">Insurance Coverage</h4>
                            </div>
                            <div className="space-y-3 font-medium text-black">
                                <p>
                                    <span className="font-black uppercase tracking-wide text-xs opacity-70 block mb-1">Plan</span>
                                    <span className="text-lg">{order.user_insurance.plan.provider.name} - {order.user_insurance.plan.name}</span>
                                </p>
                                {order.total_amount && order.insurance_covered_amount && (
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="p-4 bg-white rounded-xl border-2 border-black">
                                            <p className="font-black uppercase text-xs text-green-700 mb-1">Covered Amount</p>
                                            <p className="text-xl font-black text-black">₦{parseFloat(order.insurance_covered_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        {order.patient_copay && (
                                            <div className="p-4 bg-white rounded-xl border-2 border-black">
                                                <p className="font-black uppercase text-xs text-blue-700 mb-1">Patient Copay</p>
                                                <p className="text-xl font-black text-black">₦{parseFloat(order.patient_copay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {order.insurance_claim_generated && (
                                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold text-sm">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        <span>Insurance claim generated automatically</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="px-8 py-6 border-t-4 border-black bg-cream-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <h3 className="font-black text-black uppercase tracking-wide text-sm mb-2">Notes</h3>
                        <p className={`text-sm font-medium ${order.notes ? 'text-black' : 'text-gray-400 italic'}`}>
                            {order.notes || "No notes available for this order."}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-max">
                        <h3 className="font-black text-black uppercase tracking-wide text-sm mb-1 self-start md:self-end">Update Status</h3>
                        <div className='flex flex-wrap gap-2'>
                            {order.status === 'pending' && (
                                <button 
                                    onClick={() => handleStatusUpdate('processing')} 
                                    disabled={!!(isUpdating || (order.total_amount && !order.user_insurance && order.payment_status && order.payment_status !== 'paid'))} 
                                    className='px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none'
                                >
                                    Mark as Processing
                                </button>
                            )}
                            {order.status === 'processing' && (
                                <button 
                                    onClick={() => handleStatusUpdate('ready')} 
                                    disabled={!!(isUpdating || (order.total_amount && !order.user_insurance && order.payment_status && order.payment_status !== 'paid'))} 
                                    className='px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-700 hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none'
                                >
                                    Mark as Ready
                                </button>
                            )}
                            {(order.status === 'pending' || order.status === 'processing') && (
                                <button 
                                    onClick={() => handleStatusUpdate('cancelled')} 
                                    disabled={isUpdating} 
                                    className='px-6 py-2.5 bg-white text-red-600 font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-50 hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
                        {(order.total_amount && !order.user_insurance && order.payment_status !== 'paid') && (
                            <p className="text-xs font-bold text-orange-600 flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-lg border border-orange-200">
                                ⚠ Payment pending from patient
                            </p>
                        )}
                    </div>
                </div>
                </div>
            </div>

            {/* Price Setting Modal */}
            <AnimatePresence>
                {showPriceModal && order && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ pointerEvents: 'auto' }}>
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0" style={{ pointerEvents: 'none' }}>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowPriceModal(false)}
                                className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
                                style={{ pointerEvents: 'auto' }}
                            />

                            {/* Modal */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-block align-bottom bg-white rounded-3xl shadow-2xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative"
                                style={{ pointerEvents: 'auto' }}
                            >
                                <div className="bg-white rounded-[2rem] overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-between p-6 border-b-4 border-black bg-cream-50">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-black rounded-xl text-white shadow-[4px_4px_0px_0px_rgba(255,165,0,1)]">
                                                <CalculatorIcon className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-black font-display uppercase tracking-tight">Set Order Pricing</h3>
                                                <p className="font-bold text-gray-500">Order #{order.id}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent hover:border-black"
                                            onClick={() => setShowPriceModal(false)}
                                        >
                                            <XMarkIcon className="h-8 w-8 text-black stroke-[3]" />
                                        </button>
                                    </div>

                                    {/* Items Pricing */}
                                    <div className="p-8">
                                        <div className="mb-8">
                                            <h4 className="text-lg font-black text-black uppercase tracking-wide mb-4">Item Prices</h4>
                                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                                {(order.items || []).map((item) => (
                                                    <div key={item.id} className="p-4 bg-cream-50 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                            <div className="flex-1">
                                                                <p className="font-bold text-lg text-black">{item.medication_name_text || item.medication_name || 'Medication'}</p>
                                                                <p className="text-sm font-medium text-gray-600">{item.dosage_text || item.dosage || 'Dosage not specified'}</p>
                                                                <p className="text-xs font-bold bg-white border border-black px-2 py-0.5 rounded-md inline-block mt-2">Qty: {item.quantity}</p>
                                                            </div>
                                                            <div className="w-full sm:w-48">
                                                                <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                                                                    Price per unit (₦)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    value={itemPrices[item.id] || ''}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        setItemPrices(prev => ({ ...prev, [item.id]: value }));
                                                                        // Auto-calculate total if not manually set
                                                                        if (!totalAmount) {
                                                                            const newPrices = { ...itemPrices, [item.id]: value };
                                                                            let calc = 0;
                                                                            order?.items?.forEach(i => {
                                                                                const p = i.id === item.id ? value : newPrices[i.id];
                                                                                if (p) calc += parseFloat(p) * (i.quantity || 1);
                                                                            });
                                                                            setTotalAmount(calc > 0 ? calc.toString() : '');
                                                                        }
                                                                    }}
                                                                    className="w-full px-4 py-2 border-2 border-black rounded-xl focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-lg"
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Total Amount */}
                                        <div className="mb-8 p-6 bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-xl font-black text-black">
                                                    TOTAL AMOUNT (₦)
                                                </label>
                                                <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                    Calculated: ₦{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={totalAmount}
                                                onChange={(e) => setTotalAmount(e.target.value)}
                                                className="w-full px-4 py-3 border-b-4 border-black bg-transparent focus:outline-none text-4xl font-black text-black placeholder-gray-300"
                                                placeholder="0.00"
                                            />
                                            <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wide">
                                                Manual override allowed
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t-2 border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setShowPriceModal(false)}
                                                className="w-full sm:w-auto px-6 py-3 border-2 border-black rounded-xl text-sm font-bold text-black hover:bg-gray-100 focus:outline-none transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSavePrices}
                                                disabled={isSavingPrice || (!totalAmount && calculateTotal() <= 0)}
                                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-black text-white text-sm font-bold rounded-xl border-2 border-transparent hover:border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:translate-y-[-2px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {isSavingPrice ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                                        Save Prices
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PharmacyOrderDetailPage;