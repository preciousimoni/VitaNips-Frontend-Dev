// src/components/payment/PaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    CreditCardIcon,
    LockClosedIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';
import { initializePayment, verifyPayment, CommissionBreakdown } from '../../api/payments';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    paymentType: 'appointment' | 'medication_order';
    paymentForId: number;
    title?: string;
    description?: string;
    onPaymentSuccess: (paymentReference: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    amount,
    paymentType,
    paymentForId,
    title,
    description,
    onPaymentSuccess
}) => {
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'ussd'>('card');
    const [paymentReference, setPaymentReference] = useState<string | null>(null);
    const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);
    const [commissionBreakdown, setCommissionBreakdown] = useState<CommissionBreakdown | null>(null);

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiry(e.target.value);
        setCardExpiry(formatted);
    };

    const handleInitializePayment = async () => {
        setIsInitializing(true);
        try {
            const response = await initializePayment({
                amount: amount,
                email: user?.email || '',
                payment_type: paymentType,
                payment_for_id: paymentForId,
                callback_url: `${window.location.origin}/payment/callback`
            });

            setPaymentReference(response.reference || response.tx_ref);
            setAuthorizationUrl(response.authorization_url);
            
            // Store commission breakdown if available
            if (response.commission_breakdown) {
                setCommissionBreakdown(response.commission_breakdown);
            }
            
            // For card payments, redirect to Flutterwave payment page
            if (paymentMethod === 'card' && response.authorization_url) {
                window.location.href = response.authorization_url;
            } else {
                toast.success('Payment initialized. Please complete the transaction.');
            }
        } catch (error: any) {
            console.error('Payment initialization error:', error);
            toast.error(error.response?.data?.error || 'Failed to initialize payment. Please try again.');
        } finally {
            setIsInitializing(false);
        }
    };

    const handleVerifyPayment = async (reference: string) => {
        setIsProcessing(true);
        try {
            const response = await verifyPayment(reference);
            
            if (response.verified) {
                toast.success('Payment verified successfully!');
                onPaymentSuccess(reference);
                onClose();
            } else {
                toast.error(response.message || 'Payment verification failed');
            }
        } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error('Failed to verify payment. Please contact support.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Check for payment callback (when returning from Flutterwave)
    useEffect(() => {
        if (isOpen) {
            const urlParams = new URLSearchParams(window.location.search);
            const tx_ref = urlParams.get('tx_ref');
            const status = urlParams.get('status');
            
            if (tx_ref && status === 'successful') {
                handleVerifyPayment(tx_ref);
            } else if (tx_ref && status === 'cancelled') {
                toast.error('Payment was cancelled');
                onClose();
            }
        }
    }, [isOpen]);

    const handlePayment = async () => {
        if (paymentMethod === 'card') {
            // Initialize payment and redirect to Paystack
            await handleInitializePayment();
        } else if (paymentMethod === 'bank_transfer') {
            // Show bank transfer details
            toast.info('Please complete bank transfer. Order will be confirmed once payment is verified.');
            onClose();
        } else if (paymentMethod === 'ussd') {
            // Show USSD instructions
            toast.info('Please complete USSD payment. Order will be confirmed once payment is verified.');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-50 inline-block align-bottom bg-white rounded-3xl shadow-2xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full pointer-events-auto"
                    >
                        <div className="bg-white px-6 py-6 sm:px-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-primary to-emerald-600 rounded-xl">
                                        <CreditCardIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">Complete Payment</h3>
                                        <p className="text-sm text-gray-600">Secure payment for your appointment</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6 text-gray-400" />
                                </button>
                            </div>

                            {/* Appointment Summary - Only show for appointments */}
                            {paymentType === 'appointment' && description && (
                                <div className="bg-gradient-to-br from-primary/10 to-emerald-50 rounded-2xl p-6 mb-6 border border-primary/20">
                                    <h4 className="font-bold text-gray-900 mb-4">Appointment Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        {description && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Details:</span>
                                                    <span className="font-semibold text-gray-900 text-right max-w-xs">{description}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="border-t border-primary/20 pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                                                <span className="text-2xl font-black text-primary">₦{amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Order Summary - Only show for medication orders */}
                            {paymentType === 'medication_order' && (
                                <div className="bg-gradient-to-br from-primary/10 to-emerald-50 rounded-2xl p-6 mb-6 border border-primary/20">
                                    <h4 className="font-bold text-gray-900 mb-4">Order Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        {description && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Details:</span>
                                                <span className="font-semibold text-gray-900 text-right max-w-xs">{description}</span>
                                            </div>
                                        )}
                                        {commissionBreakdown && (
                                            <div className="mt-3 pt-3 border-t border-primary/20">
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Platform Fee ({commissionBreakdown.commission_rate}):</span>
                                                        <span className="font-semibold">₦{parseFloat(commissionBreakdown.platform_commission).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Provider Receives:</span>
                                                        <span className="font-semibold">₦{parseFloat(commissionBreakdown.provider_net_amount).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="border-t border-primary/20 pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                                                <span className="text-2xl font-black text-primary">₦{amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Generic Summary - If no description provided */}
                            {!description && (
                                <div className="bg-gradient-to-br from-primary/10 to-emerald-50 rounded-2xl p-6 mb-6 border border-primary/20">
                                    {commissionBreakdown && (
                                        <div className="mb-3 pb-3 border-b border-primary/20">
                                            <div className="space-y-1 text-xs">
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Platform Fee ({commissionBreakdown.commission_rate}):</span>
                                                    <span className="font-semibold">₦{parseFloat(commissionBreakdown.platform_commission).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Provider Receives:</span>
                                                    <span className="font-semibold">₦{parseFloat(commissionBreakdown.provider_net_amount).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                                        <span className="text-2xl font-black text-primary">₦{amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Payment Method Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Payment Method</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'card', label: 'Card', icon: CreditCardIcon },
                                        { id: 'bank_transfer', label: 'Bank Transfer', icon: CreditCardIcon },
                                        { id: 'ussd', label: 'USSD', icon: CreditCardIcon }
                                    ].map((method) => {
                                        const Icon = method.icon;
                                        return (
                                            <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id as 'card' | 'bank_transfer' | 'ussd')}
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    paymentMethod === method.id
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <Icon className={`h-6 w-6 mx-auto mb-2 ${paymentMethod === method.id ? 'text-primary' : 'text-gray-400'}`} />
                                                <span className={`text-sm font-semibold ${paymentMethod === method.id ? 'text-primary' : 'text-gray-600'}`}>
                                                    {method.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Card Payment Info */}
                            {paymentMethod === 'card' && (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                                    <h4 className="font-bold text-blue-900 mb-3">Card Payment</h4>
                                    <p className="text-sm text-blue-800 mb-4">
                                        You will be redirected to a secure payment page to complete your transaction.
                                    </p>
                                    {authorizationUrl && (
                                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                                            <p className="text-xs text-blue-800">
                                                <strong>Note:</strong> If you were not redirected automatically, 
                                                <a href={authorizationUrl} className="text-blue-600 underline ml-1">click here</a> to continue.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Bank Transfer Info */}
                            {paymentMethod === 'bank_transfer' && (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                                    <h4 className="font-bold text-blue-900 mb-3">Bank Transfer Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Bank:</span>
                                            <span className="font-semibold text-blue-900">VitaNips Bank</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Account Number:</span>
                                            <span className="font-semibold text-blue-900">1234567890</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Account Name:</span>
                                            <span className="font-semibold text-blue-900">VitaNips Healthcare</span>
                                        </div>
                                        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                                            <p className="text-xs text-blue-800">
                                                <strong>Note:</strong> Please include your email as the transfer reference. 
                                                Your appointment will be confirmed once payment is verified.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* USSD Info */}
                            {paymentMethod === 'ussd' && (
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                                    <h4 className="font-bold text-green-900 mb-3">USSD Payment</h4>
                                    <div className="space-y-2 text-sm">
                                        <p className="text-green-800 mb-4">
                                            Dial <strong>*737*{amount}#</strong> on your mobile phone to complete payment.
                                        </p>
                                        <div className="p-3 bg-white rounded-lg border border-green-200">
                                            <p className="text-xs text-green-800">
                                                <strong>Note:</strong> After completing the USSD transaction, 
                                                your appointment will be automatically confirmed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Notice */}
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-6">
                                <LockClosedIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-600">
                                    Your payment is secured with 256-bit SSL encryption. 
                                    We do not store your card details.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Spinner size="sm" />
                                            Verifying Payment...
                                        </>
                                    ) : isInitializing ? (
                                        <>
                                            <Spinner size="sm" />
                                            Initializing...
                                        </>
                                    ) : (
                                        <>
                                            Pay ₦{amount.toLocaleString()}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;

