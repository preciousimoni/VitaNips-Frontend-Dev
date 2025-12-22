// src/features/appointments/components/AppointmentBookingForm.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentPayload, Appointment } from '../../../types/appointments';
import { DoctorAvailability } from '../../../types/doctors';
import { createAppointment } from '../../../api/appointments';
import { formatTime } from '../../../utils';
import { appointmentBookingSchema, AppointmentBookingFormData } from '../../../schemas/appointmentSchema';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMessages';
import { 
    CalendarDaysIcon, 
    UserIcon, 
    VideoCameraIcon, 
    UserGroupIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { getUserInsurances } from '../../../api/insurance';
import { UserInsurance } from '../../../types/insurance';
import PaymentModal from '../../../components/payment/PaymentModal';
import UpgradeModal from '../../../components/common/UpgradeModal';
import { checkSubscriptionStatus, SubscriptionStatus } from '../../../api/payments';
import { Link } from 'react-router-dom';

interface AppointmentBookingFormProps {
    doctorId: number;
    doctorName: string;
    doctorConsultationFee: number | null;
    availability: DoctorAvailability[];
    onBookingSuccess: (newAppointment: Appointment) => void;
    onCancel: () => void;
    isFollowUp?: boolean;
    originalAppointmentId?: number;
    prefillReason?: string;
    testRequestId?: number; // For linking test request to follow-up appointment
}

const generateTimeSlots = (start: string, end: string, intervalMinutes = 30): string[] => {
    const slots: string[] = [];
    const startTime = new Date(`1970-01-01T${start}Z`);
    const endTime = new Date(`1970-01-01T${end}Z`);

    let currentTime = startTime;
    while (currentTime < endTime) {
        const hours = currentTime.getUTCHours().toString().padStart(2, '0');
        const minutes = currentTime.getUTCMinutes().toString().padStart(2, '0');
        slots.push(`${hours}:${minutes}`);
        currentTime = new Date(currentTime.getTime() + intervalMinutes * 60000);
    }
    return slots;
};

const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
    doctorId,
    doctorName,
    doctorConsultationFee,
    availability,
    onBookingSuccess,
    onCancel,
    isFollowUp,
    originalAppointmentId,
    prefillReason,
    testRequestId
}) => {
    // Calculate discounted fee for follow-up appointments (50% off)
    const followUpDiscount = 0.5; // 50% discount
    const originalFee = doctorConsultationFee || 0;
    const discountedFee = isFollowUp ? originalFee * followUpDiscount : originalFee;
    const discountAmount = isFollowUp ? originalFee - discountedFee : 0;
    const [appointmentType, setAppointmentType] = useState<'in_person' | 'virtual'>('in_person');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [userInsurances, setUserInsurances] = useState<UserInsurance[]>([]);
    const [loadingInsurances, setLoadingInsurances] = useState<boolean>(false);
    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
    const [pendingAppointmentData, setPendingAppointmentData] = useState<AppointmentBookingFormData | null>(null);
    const [pendingAppointmentId, setPendingAppointmentId] = useState<number | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
    const [upgradeModalData, setUpgradeModalData] = useState<{ limit?: number; message?: string } | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [checkingSubscription, setCheckingSubscription] = useState<boolean>(true);

    // React Hook Form setup
    const {
        register,
        handleSubmit: handleFormSubmit,
        watch,
        setValue,
        formState: { errors: formErrors }
    } = useForm<AppointmentBookingFormData>({
        resolver: zodResolver(appointmentBookingSchema) as any,
        defaultValues: {
            doctor: doctorId,
            date: '',
            start_time: '',
            reason: prefillReason || '',
            notes: '',
            user_insurance_id: null
        }
    });

    const selectedDate = watch('date');
    const selectedTime = watch('start_time');

    useEffect(() => {
        if (isFollowUp && prefillReason) {
            setValue('reason', prefillReason);
        }
    }, [isFollowUp, prefillReason, setValue]);

    // Fetch user's insurance plans
    useEffect(() => {
        const fetchInsurances = async () => {
            setLoadingInsurances(true);
            try {
                const response = await getUserInsurances();
                if (response && Array.isArray(response.results)) {
                    setUserInsurances(response.results);
                    // Auto-select primary insurance if available
                    const primary = response.results.find(ins => ins.is_primary);
                    if (primary) {
                        setValue('user_insurance_id', primary.id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch insurance plans:', err);
            } finally {
                setLoadingInsurances(false);
            }
        };
        fetchInsurances();
    }, [setValue]);

    // Fetch subscription status
    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const status = await checkSubscriptionStatus();
                setSubscriptionStatus(status);
            } catch (error) {
                console.error("Failed to check subscription status:", error);
            } finally {
                setCheckingSubscription(false);
            }
        };
        fetchSubscription();
    }, []);

    useEffect(() => {
        if (selectedDate && availability.length > 0) {
            const dateObj = new Date(selectedDate + 'T00:00:00Z');
            const dayOfWeek = dateObj.getUTCDay();
            const djangoDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

            const slotsForDay = availability
                .filter(slot => slot.day_of_week === djangoDayOfWeek && slot.is_available)
                .flatMap(slot => generateTimeSlots(slot.start_time, slot.end_time));

            setAvailableSlots(slotsForDay);
            setValue('start_time', ''); // Reset time when date changes
        } else {
            setAvailableSlots([]);
            setValue('start_time', '');
        }
    }, [selectedDate, availability, setValue]);

    const calculateEndTime = (startTime: string, durationMinutes = 30): string => {
        if (!startTime) return '';
        try {
            const [hours, minutes] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);
            const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
            return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        } catch {
            return '';
        }
    };

    const today = new Date().toISOString().split('T')[0];

    const createAppointmentWithPayment = async (data: AppointmentBookingFormData, paymentReference?: string) => {
        setError(null);
        setIsSubmitting(true);
        
        const endTime = calculateEndTime(data.start_time);
        if (!endTime) {
            setError("Invalid start time selected, cannot calculate end time.");
            toast.error("Invalid start time.");
            setIsSubmitting(false);
            return;
        }

                const payload: AppointmentPayload = {
                    doctor: doctorId,
                    date: data.date,
                    start_time: data.start_time,
                    end_time: endTime,
                    appointment_type: appointmentType,
                    reason: data.reason.trim(),
                    notes: data.notes?.trim() || undefined,
                    user_insurance_id: data.user_insurance_id ? (typeof data.user_insurance_id === 'string' ? parseInt(data.user_insurance_id, 10) : data.user_insurance_id) : null,
                    payment_reference: paymentReference || undefined,
                    original_appointment_id: originalAppointmentId || undefined,
                    test_request_id: testRequestId || undefined,
                };

        try {
            const newAppointment = await createAppointment(payload);
            toast.success('Appointment booked successfully!');
            onBookingSuccess(newAppointment);
            setShowPaymentModal(false);
            setPendingAppointmentData(null);
        } catch (err: unknown) {
            console.error("Appointment booking error:", err);
            const axiosError = err as { response?: { data?: unknown; status?: number } };
            const errorData = axiosError.response?.data;
            
            // Log full error for debugging - CHECK THIS IN CONSOLE!
            console.log("🔍 Full error response:", {
                status: axiosError.response?.status,
                data: errorData,
                fullError: err
            });
            
            // Check if it's an appointment limit error
            if (errorData && typeof errorData === 'object' && 'error' in errorData) {
                const errorObj = errorData as { error?: string; message?: string; current_count?: number; limit?: number; upgrade_url?: string };
                if (errorObj.error === 'Appointment limit reached') {
                    setUpgradeModalData({
                        limit: errorObj.limit,
                        message: errorObj.message
                    });
                    setShowUpgradeModal(true);
                    setIsSubmitting(false);
                    return;
                }
            }
            
            // Use the error utility to get user-friendly message
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            
            // Show styled toast notification
            toast.error(errorMessage, { 
                duration: 6000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    maxWidth: '500px',
                    boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                },
                icon: '❌'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = async (data: AppointmentBookingFormData) => {
        // Convert insurance ID to number if it's a string (from select field)
        const insuranceId = data.user_insurance_id 
            ? (typeof data.user_insurance_id === 'string' ? parseInt(data.user_insurance_id, 10) : data.user_insurance_id)
            : null;
        const selectedInsurance = insuranceId 
            ? userInsurances.find(ins => ins.id === insuranceId)
            : null;

        // Check if payment is required (no insurance AND consultation fee exists)
        // Use discounted fee for follow-ups
        const feeToUse = isFollowUp ? discountedFee : (doctorConsultationFee || 0);
        const hasConsultationFee = feeToUse > 0;
        const requiresPayment = !selectedInsurance && hasConsultationFee;

        if (requiresPayment) {
            // Create appointment first with payment_status='pending' to reserve the slot
            try {
                setError(null);
                setIsSubmitting(true);
                
                const endTime = calculateEndTime(data.start_time);
                if (!endTime) {
                    setError("Invalid start time selected, cannot calculate end time.");
                    toast.error("Invalid start time.");
                    setIsSubmitting(false);
                    return;
                }

                const payload: AppointmentPayload = {
                    doctor: doctorId,
                    date: data.date,
                    start_time: data.start_time,
                    end_time: endTime,
                    appointment_type: appointmentType,
                    reason: data.reason.trim(),
                    notes: data.notes?.trim() || undefined,
                    user_insurance_id: insuranceId,
                    // No payment_reference yet - will be added after payment
                    original_appointment_id: originalAppointmentId || undefined,
                    test_request_id: testRequestId || undefined,
                };

                // Create appointment with pending payment status
                const newAppointment = await createAppointment(payload);
                
                // Store appointment ID and show payment modal
                setPendingAppointmentData(data);
                setPendingAppointmentId(newAppointment.id);
                setShowPaymentModal(true);
                setIsSubmitting(false);
            } catch (err: unknown) {
                console.error("Appointment booking error:", err);
                const axiosError = err as { response?: { data?: unknown; status?: number } };
                const errorData = axiosError.response?.data;
                
                // Check if it's an appointment limit error
                if (errorData && typeof errorData === 'object' && 'error' in errorData) {
                    const errorObj = errorData as { error?: string; message?: string; current_count?: number; limit?: number; upgrade_url?: string };
                    if (errorObj.error === 'Appointment limit reached') {
                        setUpgradeModalData({
                            limit: errorObj.limit,
                            message: errorObj.message
                        });
                        setShowUpgradeModal(true);
                        setIsSubmitting(false);
                        return;
                    }
                }
                
                // Parse Django REST Framework validation errors
                let errorMessage = "Failed to book appointment. Please check your input and try again.";
                if (errorData && typeof errorData === 'object') {
                    const errorMessages: string[] = [];
                    
                    Object.entries(errorData).forEach(([key, val]) => {
                        if (Array.isArray(val)) {
                            val.forEach(msg => {
                                if (typeof msg === 'string') {
                                    errorMessages.push(`${key === 'detail' || key === 'non_field_errors' ? '' : key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ') + ': '}${msg}`);
                                }
                            });
                        } else if (typeof val === 'string') {
                            errorMessages.push(val);
                        } else if (typeof val === 'object' && val !== null) {
                            errorMessages.push(`${key}: ${JSON.stringify(val)}`);
                        }
                    });
                    
                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join('. ');
                    } else {
                        errorMessage = JSON.stringify(errorData);
                    }
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }
                
                setError(errorMessage);
                toast.error(errorMessage, { 
                    duration: 6000,
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        maxWidth: '500px'
                    }
                });
                setIsSubmitting(false);
            }
        } else {
            // No payment required (insurance covers it or no fee), proceed directly
            try {
                await createAppointmentWithPayment(data);
            } catch (err: unknown) {
                const errorData = (err as { response?: { data?: unknown } }).response?.data;
                
                // Check if it's an appointment limit error
                if (errorData && typeof errorData === 'object' && 'error' in errorData) {
                    const errorObj = errorData as { error?: string; message?: string; current_count?: number; limit?: number; upgrade_url?: string };
                    if (errorObj.error === 'Appointment limit reached') {
                        setUpgradeModalData({
                            limit: errorObj.limit,
                            message: errorObj.message
                        });
                        setShowUpgradeModal(true);
                        setIsSubmitting(false);
                        return;
                    }
                }
                
                // Re-throw other errors
                throw err;
            }
        }
    };

    const handlePaymentSuccess = async (_paymentReference: string) => {
        // Payment success is handled by PaymentCallbackPage now
        // This callback is kept for backward compatibility but won't be called
        // since we redirect to Flutterwave
    };

    const getAvailableDays = useMemo(() => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return availability
            .filter(slot => slot.is_available)
            .map(slot => days[slot.day_of_week])
            .filter((day, index, arr) => arr.indexOf(day) === index);
    }, [availability]);

    return (
        <>
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-8 font-sans">
            {/* Header */}
            <div className="border-b-2 border-primary-900/5 pb-6">
                <h3 className="text-xl font-bold text-primary-900 flex items-center font-display">
                    <CalendarDaysIcon className="h-6 w-6 mr-3 text-accent" />
                    {isFollowUp ? "Schedule Follow-up" : "Book New Appointment"}
                </h3>
                <p className="text-sm font-medium text-gray-500 mt-2 flex items-center bg-cream-50 w-fit px-3 py-1 rounded-lg">
                    <UserIcon className="h-4 w-4 mr-2" />
                    With: <span className='font-black text-primary-900 ml-1'>{doctorName}</span>
                </p>
                {getAvailableDays.length > 0 && (
                    <p className="text-xs font-bold text-accent uppercase tracking-wider mt-3">
                        Available: {getAvailableDays.join(', ')}
                    </p>
                )}
            </div>

            {/* Subscription Status Banner */}
            {!checkingSubscription && subscriptionStatus && !subscriptionStatus.has_premium && (
                <div className={`rounded-xl p-4 border ${
                    (subscriptionStatus.remaining_free_appointments || 0) > 0 
                        ? 'bg-blue-50 border-blue-100' 
                        : 'bg-orange-50 border-orange-100'
                }`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                            (subscriptionStatus.remaining_free_appointments || 0) > 0 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-orange-100 text-orange-600'
                        }`}>
                            <ShieldCheckIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold text-sm ${
                                (subscriptionStatus.remaining_free_appointments || 0) > 0 
                                    ? 'text-blue-900' 
                                    : 'text-orange-900'
                            }`}>
                                {(subscriptionStatus.remaining_free_appointments || 0) > 0 
                                    ? 'Free Plan Access' 
                                    : 'Consultation Limit Reached'}
                            </h4>
                            <p className={`text-xs mt-1 ${
                                (subscriptionStatus.remaining_free_appointments || 0) > 0 
                                    ? 'text-blue-700' 
                                    : 'text-orange-700'
                            }`}>
                                {(subscriptionStatus.remaining_free_appointments || 0) > 0 
                                    ? `You have ${subscriptionStatus.remaining_free_appointments} free consultation${(subscriptionStatus.remaining_free_appointments || 0) !== 1 ? 's' : ''} remaining.` 
                                    : 'You have used all your free consultations. Upgrade to Premium for unlimited access.'}
                            </p>
                            
                            {(subscriptionStatus.remaining_free_appointments || 0) === 0 && (
                                <Link 
                                    to="/subscription" 
                                    className="inline-block mt-3 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors"
                                >
                                    Upgrade Now
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-lg"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-red-900 mb-1">Booking Error</p>
                            <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Date Selection */}
            <div>
                <label htmlFor="date" className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-3">
                    Select Date *
                </label>
                <input 
                    type="date" 
                    id="date" 
                    {...register('date')}
                    min={today}
                    className={`w-full bg-cream-50 border-2 border-primary-900/10 rounded-xl p-4 text-primary-900 font-bold focus:border-primary-900 focus:ring-0 transition-colors ${formErrors.date ? 'border-red-300 focus:border-red-500' : ''}`}
                />
                {formErrors.date && (
                    <p className="text-red-600 text-sm font-bold mt-2 flex items-center"><ExclamationTriangleIcon className="h-4 w-4 mr-1"/>{formErrors.date.message}</p>
                )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
                <div>
                    <label htmlFor="start_time" className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-3">
                        Time Slot *
                    </label>
                    {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {availableSlots.map(slot => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setValue('start_time', slot, { shouldValidate: true })}
                                    className={`py-3 px-4 rounded-xl font-bold border-2 transition-all ${
                                        selectedTime === slot
                                            ? 'bg-primary-900 text-white border-primary-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px] shadow-none'
                                            : 'bg-white text-gray-700 border-primary-900/10 hover:border-primary-900 hover:bg-cream-50'
                                    }`}
                                >
                                    {formatTime(slot)}
                                </button>
                            ))}
                            {/* Hidden select for form validation logic consistency if needed, but managing via setValue above */}
                            <select {...register('start_time')} className="hidden"><option value={selectedTime}>{selectedTime}</option></select>
                        </div>
                    ) : (
                        <div className="bg-orange-50 border-2 border-orange-100 rounded-xl p-6">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-6 w-6 text-orange-400 mr-3" />
                                <div className="text-sm text-orange-900">
                                    <p className="font-black text-lg">Fully Booked</p>
                                    <p className="mt-1 font-medium">No slots left for this date. Please try another day.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {formErrors.start_time && (
                        <p className="text-red-600 text-sm font-bold mt-2 flex items-center"><ExclamationTriangleIcon className="h-4 w-4 mr-1"/>{formErrors.start_time.message}</p>
                    )}
                </div>
            )}

            {/* Appointment Type */}
            <div>
                <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-3">Appointment Type *</label>
                <div className="grid grid-cols-2 gap-4">
                    <label className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                        appointmentType === 'in_person' 
                            ? 'border-primary-900 bg-primary-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px] shadow-none' 
                            : 'border-primary-900/10 bg-white hover:border-primary-900 hover:bg-cream-50'
                    }`}>
                        <input 
                            type="radio" 
                            name="appointmentType" 
                            value="in_person"
                            checked={appointmentType === 'in_person'}
                            onChange={() => setAppointmentType('in_person')}
                            className="sr-only"
                        />
                        <UserGroupIcon className={`h-8 w-8 mb-3 ${appointmentType === 'in_person' ? 'text-accent' : 'text-gray-400'}`} />
                        <div className="text-center">
                            <div className={`font-black text-lg ${appointmentType === 'in_person' ? 'text-white' : 'text-gray-900'}`}>
                                In-Person
                            </div>
                            <div className={`text-xs font-bold mt-1 ${appointmentType === 'in_person' ? 'text-white/70' : 'text-gray-500'}`}>Visit the clinic</div>
                        </div>
                        {appointmentType === 'in_person' && (
                            <CheckCircleIcon className="h-6 w-6 text-white absolute top-3 right-3" />
                        )}
                    </label>
                    
                    <label className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                        appointmentType === 'virtual' 
                            ? 'border-primary-900 bg-primary-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px] shadow-none' 
                            : 'border-primary-900/10 bg-white hover:border-primary-900 hover:bg-cream-50'
                    }`}>
                        <input 
                            type="radio" 
                            name="appointmentType" 
                            value="virtual"
                            checked={appointmentType === 'virtual'}
                            onChange={() => setAppointmentType('virtual')}
                            className="sr-only"
                        />
                        <VideoCameraIcon className={`h-8 w-8 mb-3 ${appointmentType === 'virtual' ? 'text-accent' : 'text-gray-400'}`} />
                        <div className="text-center">
                            <div className={`font-black text-lg ${appointmentType === 'virtual' ? 'text-white' : 'text-gray-900'}`}>
                                Virtual
                            </div>
                            <div className={`text-xs font-bold mt-1 ${appointmentType === 'virtual' ? 'text-white/70' : 'text-gray-500'}`}>Video consultation</div>
                        </div>
                        {appointmentType === 'virtual' && (
                            <CheckCircleIcon className="h-6 w-6 text-white absolute top-3 right-3" />
                        )}
                    </label>
                </div>
            </div>

            {/* Cost Summary */}
            {doctorConsultationFee !== null && doctorConsultationFee !== undefined && doctorConsultationFee > 0 && (
                <div className="bg-primary-900 rounded-2xl p-6 relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    
                    {isFollowUp && (
                        <div className="relative z-10 mb-4 p-3 bg-green-500/20 border-2 border-green-400 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-black uppercase tracking-widest text-green-300">Follow-up Discount</span>
                                <span className="text-lg font-black text-green-300">50% OFF</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold opacity-80 line-through">Original: ₦{parseFloat(originalFee.toString()).toLocaleString()}</span>
                                <span className="text-xs font-bold text-green-300">Save: ₦{parseFloat(discountAmount.toString()).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="relative z-10 flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                        <span className="text-sm font-bold opacity-80 uppercase tracking-widest">
                            {isFollowUp ? 'Follow-up Fee' : 'Consultation Fee'}
                        </span>
                        <span className="text-3xl font-black font-display text-accent">
                            ₦{parseFloat((isFollowUp ? discountedFee : doctorConsultationFee).toString()).toLocaleString()}
                        </span>
                    </div>
                    
                    {watch('user_insurance_id') ? (
                        <p className="relative z-10 text-sm font-medium bg-white/10 p-3 rounded-xl flex items-center border border-white/20">
                            <ShieldCheckIcon className="h-5 w-5 mr-3 text-accent" />
                            Insurance will be applied.
                        </p>
                    ) : (
                        <div className="relative z-10 mt-3">
                            <button
                                type="button"
                                onClick={handleFormSubmit(onSubmit)}
                                disabled={isSubmitting || !selectedDate || !selectedTime || !watch('reason') || (watch('reason')?.length || 0) < 10}
                                className="w-full py-4 px-6 bg-white text-primary-900 font-black text-lg rounded-xl hover:bg-accent hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                            >
                                <CheckCircleIcon className="h-6 w-6" />
                                Proceed to Payment
                            </button>
                            <p className="text-xs text-white/60 mt-3 text-center font-bold uppercase tracking-wider">
                                Secure Payment with Flutterwave
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Insurance Selection */}
            {userInsurances.length > 0 && (
                <div>
                    <label htmlFor="user_insurance_id" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <ShieldCheckIcon className="h-5 w-5 text-primary" />
                        Insurance Plan (Optional)
                    </label>
                    <select
                        id="user_insurance_id"
                        {...register('user_insurance_id')}
                        className={`w-full bg-cream-50 border-2 border-primary-900/10 rounded-xl p-4 text-primary-900 font-bold focus:border-primary-900 focus:ring-0 transition-colors ${formErrors.user_insurance_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        disabled={loadingInsurances}
                    >
                        <option value="">No Insurance</option>
                        {userInsurances.map((insurance) => (
                            <option key={insurance.id} value={insurance.id}>
                                {insurance.plan.provider.name} - {insurance.plan.name}
                                {insurance.is_primary ? ' (Primary)' : ''}
                            </option>
                        ))}
                    </select>
                    {watch('user_insurance_id') && (
                        <div className="mt-2 p-3 bg-primary-50 rounded-lg border border-primary-200">
                            <p className="text-xs text-gray-600">
                                <span className="font-semibold">Note:</span> Insurance coverage will be calculated automatically. 
                                A claim will be generated after your appointment is completed.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Reason */}
            <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    {isFollowUp ? "Reason for Follow-up *" : "Reason for Appointment *"}
                </label>
                <textarea 
                    id="reason" 
                    {...register('reason')}
                    rows={isFollowUp ? 3 : 5} 
                    className={`w-full bg-cream-50 border-2 border-primary-900/10 rounded-xl p-4 text-lg font-medium text-primary-900 focus:border-primary-900 focus:ring-0 transition-colors placeholder:text-gray-400 ${formErrors.reason ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Please describe your symptoms, concerns, or reason for the appointment..."
                />
                {formErrors.reason && (
                    <p className="text-red-600 text-sm font-bold mt-2 flex items-center"><ExclamationTriangleIcon className="h-4 w-4 mr-1"/>{formErrors.reason.message}</p>
                )}
                <p className="text-xs font-bold text-gray-400 mt-2 text-right uppercase tracking-wider">
                    {watch('reason')?.length || 0}/500 chars (min 10)
                </p>
            </div>

            {/* Notes */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                </label>
                <textarea 
                    id="notes" 
                    {...register('notes')}
                    rows={3} 
                    className={`w-full bg-cream-50 border-2 border-primary-900/10 rounded-xl p-4 text-base font-medium text-primary-900 focus:border-primary-900 focus:ring-0 transition-colors placeholder:text-gray-400 ${formErrors.notes ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Any other information for the doctor..."
                />
                {formErrors.notes && (
                    <p className="text-red-600 text-sm font-bold mt-2 flex items-center"><ExclamationTriangleIcon className="h-4 w-4 mr-1"/>{formErrors.notes.message}</p>
                )}
                <p className="text-xs font-bold text-gray-400 mt-2 text-right uppercase tracking-wider">
                    {watch('notes')?.length || 0}/1000 chars
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-8 border-t-2 border-primary-900/5">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    disabled={isSubmitting}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={
                        isSubmitting || 
                        !selectedTime || 
                        availableSlots.length === 0 || 
                        (!!(!checkingSubscription && subscriptionStatus && !subscriptionStatus.has_premium && (subscriptionStatus.remaining_free_appointments || 0) <= 0))
                    }
                    className="bg-primary-900 text-white font-black text-lg px-8 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Processing...
                        </>
                    ) : (
                        'Confirm Booking'
                    )}
                </button>
            </div>
        </form>

        {/* Payment Modal */}
        {showPaymentModal && doctorConsultationFee !== null && doctorConsultationFee !== undefined && doctorConsultationFee > 0 && pendingAppointmentData && pendingAppointmentId && (
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    setPendingAppointmentData(null);
                    setPendingAppointmentId(null);
                }}
                amount={parseFloat((isFollowUp ? discountedFee : doctorConsultationFee).toString())}
                paymentType="appointment"
                paymentForId={pendingAppointmentId}
                title={isFollowUp ? "Follow-up Consultation Payment" : "Consultation Payment"}
                description={`Payment for ${isFollowUp ? 'follow-up ' : ''}consultation with ${doctorName} on ${new Date(pendingAppointmentData.date).toLocaleDateString()} at ${pendingAppointmentData.start_time}`}
                onPaymentSuccess={handlePaymentSuccess}
            />
        )}

        {/* Upgrade Modal */}
        <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => {
                setShowUpgradeModal(false);
                setUpgradeModalData(null);
            }}
            title="Appointment Limit Reached"
            message={upgradeModalData?.message || "Upgrade to Premium for unlimited appointments"}
            feature="appointments"
            currentLimit={upgradeModalData?.limit}
        />
        </>
    );
};

export default AppointmentBookingForm;