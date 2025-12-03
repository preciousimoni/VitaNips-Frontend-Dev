// src/pages/pharmacy/PharmacyOrderDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeftIcon, ShieldCheckIcon, BanknotesIcon, CheckCircleIcon, 
    ExclamationCircleIcon, PencilIcon, XMarkIcon, CalculatorIcon 
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
        <div>
            <Link to="/portal/orders" className="inline-flex items-center text-primary hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Orders
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Details #{order.id}</h1>

            {updateError && <p className="text-red-500 bg-red-50 p-2 rounded mb-3 text-sm">{updateError}</p>}

            <div className="bg-white p-6 rounded shadow space-y-4">
                {/* Basic Info */}
                <div>
                    <h3 className="font-semibold">Status: <span className={`capitalize px-2 py-0.5 rounded text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{order.status}</span></h3>
                    <p>Order Date: {new Date(order.order_date).toLocaleString()}</p>
                    <p>Patient: {
                        typeof order.user === 'object' && order.user
                            ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() || order.user.username || order.user.email || 'N/A'
                            : typeof order.user === 'number'
                            ? `User ID: ${order.user}`
                            : 'N/A'
                    }</p>
                    <p>Prescription ID: {order.prescription ?? 'N/A'}</p>
                    <p>Delivery: {order.is_delivery ? 'Yes' : 'No'}</p>
                    {order.is_delivery && <p>Address: {order.delivery_address ?? 'N/A'}</p>}
                </div>

                {/* Items */}
                <div>
                    <div className="flex items-center justify-between border-t pt-3 mt-3">
                        <h3 className="font-semibold">Items</h3>
                        {order.status === 'pending' && !order.total_amount && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleOpenPriceModal}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                            >
                                <CalculatorIcon className="h-4 w-4" />
                                Set Prices & Total
                            </motion.button>
                        )}
                        {order.status === 'pending' && order.total_amount && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleOpenPriceModal}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                                <PencilIcon className="h-4 w-4" />
                                Update Prices
                            </motion.button>
                        )}
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                        {(order.items || []).map(item => (
                            <li key={item.id}>
                                {item.medication_name_text || item.medication_name} ({item.dosage_text || item.dosage}) - Qty: {item.quantity}
                                {item.price_per_unit ? ` @ ₦${parseFloat(item.price_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ' (Price Pending)'}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-700">Total Amount:</span>
                            <span className="text-2xl font-black text-primary">
                                {order.total_amount 
                                    ? `₦${parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    : 'Pending Calculation'}
                            </span>
                        </div>
                        {!order.total_amount && (
                            <p className="text-sm text-gray-600 mt-2">
                                ⚠ Set prices to enable payment. Patient will see this amount on their order page.
                            </p>
                        )}
                    </div>
                    
                    {/* Insurance Information */}
                    {order.user_insurance && (
                        <div className="mt-4 p-4 bg-teal-50 rounded-xl border-2 border-teal-200">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheckIcon className="h-5 w-5 text-teal-600" />
                                <h4 className="font-bold text-gray-900">Insurance Coverage</h4>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Plan:</span> {order.user_insurance.plan.provider.name} - {order.user_insurance.plan.name}
                                </p>
                                {order.total_amount && order.insurance_covered_amount && (
                                    <>
                                        <p className="text-green-700 font-semibold">
                                            Covered: ₦{parseFloat(order.insurance_covered_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        {order.patient_copay && (
                                            <p className="text-blue-700 font-semibold">
                                                Patient Pays: ₦{parseFloat(order.patient_copay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        )}
                                    </>
                                )}
                                {order.insurance_claim_generated && (
                                    <p className="text-primary-700 font-semibold flex items-center gap-1 mt-2">
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Insurance claim generated automatically
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="font-semibold border-t pt-3 mt-3">Notes</h3>
                    <p className='text-sm'>{order.notes || <span className='italic text-muted'>No notes</span>}</p>
                </div>

                <div className='border-t pt-4 mt-4'>
                    <h3 className="font-semibold mb-2">Update Status</h3>
                    <div className='flex gap-2'>
                        {order.status === 'pending' && (
                            <button 
                                onClick={() => handleStatusUpdate('processing')} 
                                disabled={isUpdating || (order.total_amount && !order.user_insurance && (order.payment_status !== 'paid' && order.payment_status))} 
                                className='btn-primary py-1 px-3 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                            >
                                Mark as Processing
                            </button>
                        )}
                        {order.status === 'processing' && (
                            <button 
                                onClick={() => handleStatusUpdate('ready')} 
                                disabled={isUpdating || (order.total_amount && !order.user_insurance && (order.payment_status !== 'paid' && order.payment_status))} 
                                className='btn-primary py-1 px-3 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50'
                            >
                                Mark as Ready
                            </button>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && (
                            <button onClick={() => handleStatusUpdate('cancelled')} disabled={isUpdating} className='px-3 py-1 border border-red-500 text-red-600 rounded text-sm hover:bg-red-50 disabled:opacity-50'>Cancel Order</button>
                        )}
                    </div>
                    {(order.total_amount && !order.user_insurance && order.payment_status !== 'paid') && (
                        <p className="text-xs text-orange-600 mt-2">⚠ Payment must be completed by patient before order can proceed.</p>
                    )}

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
                                <div className="bg-white px-6 py-6 sm:px-8">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-gradient-to-br from-primary to-emerald-600 rounded-xl">
                                                <CalculatorIcon className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">Set Order Pricing</h3>
                                                <p className="text-sm text-gray-600">Order #{order.id}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                            onClick={() => setShowPriceModal(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Items Pricing */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Item Prices</h4>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {(order.items || []).map((item) => (
                                                <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900">{item.medication_name_text || item.medication_name || 'Medication'}</p>
                                                            <p className="text-sm text-gray-600">{item.dosage_text || item.dosage || 'Dosage not specified'}</p>
                                                            <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                                        </div>
                                                        <div className="w-32">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                                                        order.items.forEach(i => {
                                                                            const p = i.id === item.id ? value : newPrices[i.id];
                                                                            if (p) calc += parseFloat(p) * (i.quantity || 1);
                                                                        });
                                                                        setTotalAmount(calc > 0 ? calc.toString() : '');
                                                                    }
                                                                }}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total Amount */}
                                    <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-lg font-bold text-gray-900">
                                                Total Amount (₦)
                                            </label>
                                            <span className="text-sm text-gray-600">
                                                Calculated: ₦{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={totalAmount}
                                            onChange={(e) => setTotalAmount(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-2xl font-bold text-primary"
                                            placeholder="Enter total amount"
                                        />
                                        <p className="text-xs text-gray-600 mt-2">
                                            You can manually override the calculated total or let it auto-calculate from item prices.
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setShowPriceModal(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSavePrices}
                                            disabled={isSavingPrice || (!totalAmount && calculateTotal() <= 0)}
                                            className="btn-primary inline-flex items-center px-6 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
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
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PharmacyOrderDetailPage;