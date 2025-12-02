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

interface AppointmentBookingFormProps {
    doctorId: number;
    doctorName: string;
    doctorConsultationFee: number | null;
    availability: DoctorAvailability[];
    onBookingSuccess: (newAppointment: Appointment) => void;
    onCancel: () => void;
    isFollowUp?: boolean;
    prefillReason?: string;
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
    prefillReason
}) => {
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

    // React Hook Form setup
    const {
        register,
        handleSubmit: handleFormSubmit,
        watch,
        setValue,
        formState: { errors: formErrors }
    } = useForm<AppointmentBookingFormData>({
        resolver: zodResolver(appointmentBookingSchema),
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
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
        const hasConsultationFee = doctorConsultationFee !== null && 
                                   doctorConsultationFee !== undefined && 
                                   Number(doctorConsultationFee) > 0;
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

    const handlePaymentSuccess = async (paymentReference: string) => {
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
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <CalendarDaysIcon className="h-6 w-6 mr-2 text-primary" />
                    {isFollowUp ? "Schedule Follow-up" : "Book New Appointment"}
                </h3>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    With: <span className='font-medium ml-1'>{doctorName}</span>
                </p>
                {getAvailableDays.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                        Available: {getAvailableDays.join(', ')}
                    </p>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-2 border-red-300 rounded-xl p-4 shadow-lg"
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
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date *
                </label>
                <input 
                    type="date" 
                    id="date" 
                    {...register('date')}
                    min={today}
                    className={`input-field ${formErrors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.date && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.date.message}</p>
                )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
                <div>
                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Available Time Slot *
                    </label>
                    {availableSlots.length > 0 ? (
                        <select 
                            id="start_time" 
                            {...register('start_time')}
                            className={`input-field ${formErrors.start_time ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        >
                            <option value="">-- Select Time --</option>
                            {availableSlots.map(slot => (
                                <option key={slot} value={slot}>
                                    {formatTime(slot)}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                                <div className="text-sm text-yellow-700">
                                    <p className="font-medium">No Available Slots</p>
                                    <p className="mt-1">No available slots found for this date. Please select another date or contact the clinic.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {formErrors.start_time && (
                        <p className="text-red-600 text-sm mt-1">{formErrors.start_time.message}</p>
                    )}
                </div>
            )}

            {/* Appointment Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Appointment Type *</label>
                <div className="grid grid-cols-2 gap-3">
                    <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        appointmentType === 'in_person' 
                            ? 'border-primary bg-primary-light' 
                            : 'border-gray-300 hover:border-gray-400'
                    }`}>
                        <input 
                            type="radio" 
                            name="appointmentType" 
                            value="in_person"
                            checked={appointmentType === 'in_person'}
                            onChange={() => setAppointmentType('in_person')}
                            className="sr-only"
                        />
                        <UserGroupIcon className={`h-5 w-5 mr-2 ${appointmentType === 'in_person' ? 'text-primary' : 'text-gray-400'}`} />
                        <div>
                            <div className={`font-medium ${appointmentType === 'in_person' ? 'text-primary' : 'text-gray-700'}`}>
                                In-Person
                            </div>
                            <div className="text-xs text-gray-500">Visit the clinic</div>
                        </div>
                        {appointmentType === 'in_person' && (
                            <CheckCircleIcon className="h-5 w-5 text-primary absolute top-2 right-2" />
                        )}
                    </label>
                    
                    <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        appointmentType === 'virtual' 
                            ? 'border-primary bg-primary-light' 
                            : 'border-gray-300 hover:border-gray-400'
                    }`}>
                        <input 
                            type="radio" 
                            name="appointmentType" 
                            value="virtual"
                            checked={appointmentType === 'virtual'}
                            onChange={() => setAppointmentType('virtual')}
                            className="sr-only"
                        />
                        <VideoCameraIcon className={`h-5 w-5 mr-2 ${appointmentType === 'virtual' ? 'text-primary' : 'text-gray-400'}`} />
                        <div>
                            <div className={`font-medium ${appointmentType === 'virtual' ? 'text-primary' : 'text-gray-700'}`}>
                                Virtual
                            </div>
                            <div className="text-xs text-gray-500">Video consultation</div>
                        </div>
                        {appointmentType === 'virtual' && (
                            <CheckCircleIcon className="h-5 w-5 text-primary absolute top-2 right-2" />
                        )}
                    </label>
                </div>
            </div>

            {/* Cost Summary */}
            {doctorConsultationFee !== null && doctorConsultationFee !== undefined && doctorConsultationFee > 0 && (
                <div className="bg-gradient-to-br from-primary/10 to-emerald-50 rounded-xl p-4 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Consultation Fee:</span>
                        <span className="text-lg font-black text-primary">₦{parseFloat(doctorConsultationFee.toString()).toLocaleString()}</span>
                    </div>
                    {watch('user_insurance_id') ? (
                        <p className="text-xs text-gray-600 mt-2 flex items-center">
                            <ShieldCheckIcon className="h-4 w-4 mr-1" />
                            Insurance will be applied to reduce your cost
                        </p>
                    ) : (
                        <div className="mt-3">
                            <p className="text-xs text-orange-700 mb-3 flex items-center">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                Payment required before appointment confirmation
                            </p>
                            <button
                                type="button"
                                onClick={handleFormSubmit(onSubmit)}
                                disabled={isSubmitting || !selectedDate || !selectedTime || !watch('reason') || (watch('reason')?.length || 0) < 10}
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <CheckCircleIcon className="h-5 w-5" />
                                Proceed to Payment
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Complete the form above, then click to pay
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
                        className={`input-field ${formErrors.user_insurance_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                    rows={isFollowUp ? 3 : 4} 
                    className={`input-field ${formErrors.reason ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Please describe your symptoms, concerns, or reason for the appointment..."
                />
                {formErrors.reason && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.reason.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {watch('reason')?.length || 0}/500 characters (minimum 10 required)
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
                    className={`input-field ${formErrors.notes ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Any other information for the doctor..."
                />
                {formErrors.notes && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.notes.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {watch('notes')?.length || 0}/1000 characters
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting || !selectedTime || availableSlots.length === 0}
                    className="btn-primary inline-flex items-center px-6 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Booking...
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
                amount={parseFloat(doctorConsultationFee.toString())}
                paymentType="appointment"
                paymentForId={pendingAppointmentId}
                title="Consultation Payment"
                description={`Payment for consultation with ${doctorName} on ${new Date(pendingAppointmentData.date).toLocaleDateString()} at ${pendingAppointmentData.start_time}`}
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