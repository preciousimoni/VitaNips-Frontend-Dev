import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowLeftIcon, CalendarIcon, ClockIcon, VideoCameraIcon, BuildingOfficeIcon,
    CheckCircleIcon, XCircleIcon, InformationCircleIcon, TrashIcon, UserIcon,
    ArrowPathIcon, MapPinIcon, SparklesIcon, PhoneIcon, EnvelopeIcon,
    ClipboardDocumentCheckIcon, ShieldCheckIcon, BanknotesIcon
} from '@heroicons/react/24/outline';
import { getAppointmentDetails, cancelAppointment, updateAppointment } from '../api/appointments';
import { Appointment } from '../types/appointments';
import { createDoctorPrescription, DoctorPrescriptionPayload } from '../api/doctorPortal';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';
import DoctorPrescriptionForm from '../features/doctor_portal/components/DoctorPrescriptionForm';
import { formatDate, formatTime } from '../utils/date';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const getStatusInfo = (status: Appointment['status']): { text: string; color: string; bgColor: string; icon: React.ElementType } => {
    switch (status) {
        case 'scheduled': return { text: 'Scheduled', color: 'text-blue-700', bgColor: 'bg-blue-50', icon: InformationCircleIcon };
        case 'confirmed': return { text: 'Confirmed', color: 'text-green-700', bgColor: 'bg-green-50', icon: CheckCircleIcon };
        case 'completed': return { text: 'Completed', color: 'text-gray-700', bgColor: 'bg-gray-50', icon: CheckCircleIcon };
        case 'cancelled': return { text: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-50', icon: XCircleIcon };
        case 'no_show': return { text: 'No Show', color: 'text-orange-700', bgColor: 'bg-orange-50', icon: XCircleIcon };
        default: return { text: status, color: 'text-gray-700', bgColor: 'bg-gray-50', icon: InformationCircleIcon };
    }
};

const AppointmentDetailPage: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    
    // All hooks must be called before any conditional returns
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    const { user } = useAuth();
    const isDoctor = user?.is_doctor || false;

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    const [isMarkingCompleted, setIsMarkingCompleted] = useState<boolean>(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState<boolean>(false);
    const [isSubmittingPrescription, setIsSubmittingPrescription] = useState<boolean>(false);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    const fetchAppointment = useCallback(async () => {
        if (!appointmentId) { setError("Appointment ID not found."); setIsLoading(false); return; }
        const id = parseInt(appointmentId, 10);
        if (isNaN(id)) { setError("Invalid Appointment ID."); setIsLoading(false); return; }
        setIsLoading(true); setError(null);
        try {
            const data = await getAppointmentDetails(id);
            setAppointment(data);
        } catch (err) {
            console.error("Fetch appointment error:", err);
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setError("Appointment not found. It may have been deleted or does not exist.");
            } else {
            const errorMessage = err instanceof Error ? err.message : "Failed to load appointment details.";
            setError(errorMessage); 
            }
            setAppointment(null);
        } finally { setIsLoading(false); }
    }, [appointmentId]);

    useEffect(() => {
        fetchAppointment();
    }, [fetchAppointment]);

    const handleCancel = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmCancel = async () => {
        if (!appointment) return;
        setIsCancelling(true);
        setError(null);
        const toastId = toast.loading("Cancelling appointment...");
        try {
            await cancelAppointment(appointment.id);
            toast.success('Appointment cancelled successfully.', { id: toastId });
            setShowConfirmDialog(false);
            fetchAppointment(); 
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to cancel appointment.";
            setError(errorMsg);
            toast.error(errorMsg, { id: toastId });
            console.error("Cancel appointment error:", err);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleScheduleFollowUp = () => {
        if (!appointment) return;

        const doctorId = appointment.doctor; 
        const originalDate = formatDate(appointment.date);
        const reasonSummary = appointment.reason.length > 30 ? appointment.reason.substring(0, 27) + "..." : appointment.reason;

        const followUpReason = `Follow-up for appointment on ${originalDate} (Reason: ${reasonSummary})`;

        navigate(`/doctors/${doctorId}`, {
            state: {
                isFollowUp: true,
                originalAppointmentId: appointment.id,
                prefillReason: followUpReason,
                openBookingModalDirectly: true 
            }
        });
    };

    const handleMarkAsCompleted = async () => {
        if (!appointment) return;
        setIsMarkingCompleted(true);
        setError(null);
        const toastId = toast.loading("Marking appointment as completed...");
        try {
            const updatedAppointment = await updateAppointment(appointment.id, { status: 'completed' });
            setAppointment(updatedAppointment);
            toast.success('Appointment marked as completed!', { id: toastId });
            // Automatically open prescription modal after marking as completed
            setTimeout(() => {
                setShowPrescriptionModal(true);
            }, 500);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to mark appointment as completed.";
            setError(errorMsg);
            toast.error(errorMsg, { id: toastId });
            console.error("Mark as completed error:", err);
        } finally {
            setIsMarkingCompleted(false);
        }
    };

    const handlePrescriptionSubmit = async (payload: DoctorPrescriptionPayload) => {
        setIsSubmittingPrescription(true);
        try {
            await createDoctorPrescription(payload);
            toast.success('Prescription created successfully!');
            setShowPrescriptionModal(false);
            fetchAppointment(); // Refresh appointment data
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to create prescription.";
            toast.error(errorMsg);
            console.error("Create prescription error:", err);
            throw err; // Re-throw so form can handle it
        } finally {
            setIsSubmittingPrescription(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
                <Spinner size="lg" />
            </div>
        );
    }
    
    if (error || !appointment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 text-center max-w-md w-full"
                >
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <XCircleIcon className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Unable to Load Appointment</h2>
                    <p className="text-gray-600 mb-8">{error || "Appointment not found."}</p>
                    <Link 
                        to="/appointments" 
                        className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back to Appointments
                    </Link>
                </motion.div>
            </div>
        );
    }

    const now = new Date();
    const appointmentStartDateTime = new Date(`${appointment.date}T${appointment.start_time}`);
    const appointmentEndDateTime = new Date(`${appointment.date}T${appointment.end_time}`);

    const joinWindowStart = new Date(appointmentStartDateTime.getTime() - 15 * 60000); 
    const callInProgressOrJoinable = now >= joinWindowStart && now <= appointmentEndDateTime; 

    const canCancel = ['scheduled', 'confirmed'].includes(appointment.status) && appointmentStartDateTime > now;
    const canJoinCall = appointment.appointment_type === 'virtual' &&
        ['scheduled', 'confirmed'].includes(appointment.status) &&
        callInProgressOrJoinable;

    const showScheduleFollowUp = appointment.status === 'completed' || (appointment.followup_required && appointment.status !== 'cancelled');
    
    // Doctor can mark appointment as completed if it's scheduled or confirmed
    const canMarkAsCompleted = isDoctor && ['scheduled', 'confirmed'].includes(appointment.status) && !isMarkingCompleted;

    const { text: statusText, color: statusColor, bgColor: statusBgColor, icon: StatusIcon } = getStatusInfo(appointment.status);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
            {/* Hero Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 overflow-hidden mb-8"
            >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-10">
                    <motion.div 
                        style={{ y }}
                        className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"
                    ></motion.div>
                    <motion.div 
                        style={{ y: y2 }}
                        className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"
                    ></motion.div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.button
                            onClick={() => navigate('/appointments')}
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 font-bold"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                            Back to Appointments
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-sm mb-4"
                        >
                            <SparklesIcon className="h-4 w-4 mr-2" />
                            APPOINTMENT DETAILS
                        </motion.div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                                    Appointment{' '}
                                    <span className="relative inline-block">
                                        #{appointment.id}
                                        <motion.span
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: 0.8, duration: 0.8 }}
                                            className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400/30"
                                        ></motion.span>
                                    </span>
                                </h1>
                                <p className="text-lg text-white/90">
                                    {formatDate(appointment.date)} • {formatTime(appointment.start_time)}
                                </p>
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className={`inline-flex items-center px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border-2 ${
                                    appointment.status === 'confirmed' ? 'bg-white/20 backdrop-blur-sm border-white/30 text-white' :
                                    appointment.status === 'completed' ? 'bg-white/20 backdrop-blur-sm border-white/30 text-white' :
                                    appointment.status === 'cancelled' ? 'bg-red-500/20 backdrop-blur-sm border-red-300/30 text-white' :
                                    'bg-white/20 backdrop-blur-sm border-white/30 text-white'
                                }`}
                            >
                                <StatusIcon className="h-6 w-6 mr-2" />
                                {statusText}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
                    </svg>
                            </div>
            </motion.div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100"
                >

                    <div className="p-8 sm:p-10 space-y-8">
                        {/* Doctor Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="bg-gradient-to-br from-primary/5 to-emerald-500/5 rounded-3xl p-6 border-2 border-primary/20 relative overflow-hidden group"
                        >
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 90, 0]
                                }}
                                transition={{ duration: 10, repeat: Infinity }}
                                className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"
                            ></motion.div>
                            
                            <div className="flex items-center space-x-6 relative z-10">
                                <motion.div
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                    className="h-16 w-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
                                >
                                    <UserIcon className="h-8 w-8 text-white" />
                                </motion.div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Healthcare Provider</p>
                                    <Link 
                                        to={`/doctors/${appointment.doctor}`} 
                                        className="text-2xl font-black text-gray-900 hover:text-primary transition-colors inline-flex items-center gap-2 group/link"
                                    >
                                        {appointment.doctor_name || `Dr. ID ${appointment.doctor}`}
                                        <ArrowLeftIcon className="h-5 w-5 rotate-180 text-primary opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                    </Link>
                        </div>
                            </div>
                        </motion.div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    icon: CalendarIcon,
                                    label: 'Date',
                                    value: formatDate(appointment.date),
                                    gradient: 'from-blue-500 to-cyan-500',
                                    delay: 0.1
                                },
                                {
                                    icon: ClockIcon,
                                    label: 'Time',
                                    value: `${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`,
                                    gradient: 'from-emerald-500 to-teal-500',
                                    delay: 0.2
                                },
                                {
                                    icon: appointment.appointment_type === 'virtual' ? VideoCameraIcon : BuildingOfficeIcon,
                                    label: 'Consultation Type',
                                    value: appointment.appointment_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                    gradient: appointment.appointment_type === 'virtual' ? 'from-purple-500 to-pink-500' : 'from-teal-500 to-cyan-500',
                                    delay: 0.3
                                },
                                ...(appointment.appointment_type !== 'virtual' ? [{
                                    icon: MapPinIcon,
                                    label: 'Location',
                                    value: 'Medical Center',
                                    gradient: 'from-red-500 to-rose-500',
                                    delay: 0.4
                                }] : [])
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: item.delay }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="flex items-start p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 hover:border-primary/30 transition-all shadow-sm hover:shadow-lg group"
                                >
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg mr-4 flex-shrink-0`}
                                    >
                                        <item.icon className="h-6 w-6 text-white" />
                                    </motion.div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{item.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Insurance Information */}
                        {appointment.user_insurance && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                className="bg-gradient-to-br from-teal-50 to-primary-50 rounded-3xl p-6 border-2 border-teal-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-gradient-to-br from-teal-500 to-primary-500 rounded-xl">
                                        <ShieldCheckIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900">Insurance Coverage</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Insurance Plan</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {appointment.user_insurance.plan.provider.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {appointment.user_insurance.plan.name} ({appointment.user_insurance.plan.plan_type})
                                        </p>
                                    </div>
                                    {appointment.consultation_fee && (
                                        <>
                                            <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Consultation Fee</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    ₦{parseFloat(appointment.consultation_fee).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </p>
                                            </div>
                                            {appointment.insurance_covered_amount && (
                                                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                                                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                        <CheckCircleIcon className="h-3.5 w-3.5" />
                                                        Covered by Insurance
                                                    </p>
                                                    <p className="text-lg font-bold text-green-700">
                                                        ₦{parseFloat(appointment.insurance_covered_amount).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                            {appointment.patient_copay && (
                                                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                                                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                        <BanknotesIcon className="h-3.5 w-3.5" />
                                                        Your Out-of-Pocket
                                                    </p>
                                                    <p className="text-lg font-bold text-blue-700">
                                                        ₦{parseFloat(appointment.patient_copay).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                {appointment.insurance_claim_generated && (
                                    <div className="mt-4 p-3 bg-primary-100 rounded-xl border border-primary-300">
                                        <p className="text-sm text-primary-800 font-semibold flex items-center gap-2">
                                            <CheckCircleIcon className="h-5 w-5" />
                                            Insurance claim has been automatically generated
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Reason & Notes */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gradient-to-br from-primary to-emerald-600 rounded-xl">
                                        <InformationCircleIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900">Reason for Visit</h3>
                    </div>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 rounded-2xl border-2 border-gray-200 text-gray-700 leading-relaxed text-lg">
                                    {appointment.reason || <span className="italic text-gray-400">Not specified</span>}
                    </div>
                            </motion.div>
                            
                    {appointment.notes && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                                            <CheckCircleIcon className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900">Doctor's Notes</h3>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 text-blue-900 leading-relaxed whitespace-pre-wrap text-lg shadow-sm">
                                        {appointment.notes}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {appointment.followup_required && !showScheduleFollowUp && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 }}
                                className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 flex items-center text-orange-900 font-bold shadow-lg"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <InformationCircleIcon className="h-6 w-6 mr-4 text-orange-600" />
                                </motion.div>
                                <p className="text-lg">A follow-up is recommended for this appointment.</p>
                            </motion.div>
                        )}

                        {/* Prescription Prompt Banner - For Completed Appointments */}
                        {appointment.status === 'completed' && isDoctor && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-200 relative overflow-hidden"
                            >
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 90, 0]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity }}
                                    className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl"
                                ></motion.div>
                                
                                <div className="flex items-start gap-6 relative z-10">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-lg flex-shrink-0"
                                    >
                                        <ClipboardDocumentCheckIcon className="h-8 w-8 text-white" />
                                    </motion.div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">Ready to Write Prescription</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                                            This appointment has been completed. You can now write a prescription for the patient.
                                        </p>
                                        <motion.button
                                            onClick={() => setShowPrescriptionModal(true)}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                            Write Prescription Now
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Virtual Consultation Info */}
                        {appointment.appointment_type === 'virtual' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-200 relative overflow-hidden"
                            >
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 90, 0]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity }}
                                    className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl"
                                ></motion.div>
                                
                                <div className="flex items-start gap-6 relative z-10">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex-shrink-0"
                                    >
                                        <VideoCameraIcon className="h-8 w-8 text-white" />
                                    </motion.div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-gray-900 mb-3">Virtual Consultation</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                                            This is a virtual appointment. You can join the video call 15 minutes before the scheduled time. Make sure you have a stable internet connection and a quiet environment.
                                        </p>
                                        {canJoinCall && (
                                            <div className="flex items-center gap-3 px-4 py-2 bg-green-100 rounded-xl border border-green-300 w-fit">
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="h-3 w-3 bg-green-500 rounded-full"
                                                ></motion.div>
                                                <span className="text-green-800 font-bold">You can join now!</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                </div>

                    {/* Actions Footer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-gradient-to-br from-gray-50 to-white p-8 border-t-2 border-gray-200 flex flex-wrap gap-4 justify-end"
                    >
                        {canMarkAsCompleted && (
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleMarkAsCompleted}
                                disabled={isMarkingCompleted}
                                className="px-10 py-5 bg-gradient-to-r from-primary to-emerald-600 text-white font-black text-lg rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50 flex items-center shadow-xl border-4 border-white/20"
                            >
                                <motion.div
                                    animate={isMarkingCompleted ? { rotate: 360 } : {}}
                                    transition={{ duration: 1, repeat: isMarkingCompleted ? Infinity : 0, ease: "linear" }}
                                >
                                    <CheckCircleIcon className="h-6 w-6 mr-3" />
                                </motion.div>
                                {isMarkingCompleted ? 'Marking as Completed...' : '✓ Mark Consultation as Completed'}
                            </motion.button>
                        )}

                        {appointment.status === 'completed' && isDoctor && (
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowPrescriptionModal(true)}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all shadow-lg flex items-center"
                            >
                                <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                                Write Prescription
                            </motion.button>
                        )}

                    {canCancel && (
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCancel} 
                                disabled={isCancelling} 
                                className="px-8 py-4 border-2 border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl"
                            >
                                <TrashIcon className="h-5 w-5 mr-2" />
                                {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                            </motion.button>
                        )}
                        
                    {showScheduleFollowUp && (
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            onClick={handleScheduleFollowUp}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-xl transition-all shadow-lg flex items-center"
                        >
                            <ArrowPathIcon className="h-5 w-5 mr-2" />
                            Schedule Follow-up
                            </motion.button>
                        )}

                        {canJoinCall && (
                            <motion.div
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link 
                                    to={`/appointments/${appointment.id}/call`} 
                                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all shadow-lg flex items-center"
                                >
                                    <VideoCameraIcon className="h-6 w-6 mr-2" />
                                    Join Virtual Call
                                </Link>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Appointment"
                message="Are you sure you want to cancel this appointment? This action cannot be undone."
                confirmText="Yes, Cancel It"
                cancelText="No, Keep It"
                isLoading={isCancelling}
                isDangerous={true}
            />

            {/* Prescription Modal */}
            {appointment && appointment.status === 'completed' && isDoctor && (
                <Modal
                    isOpen={showPrescriptionModal}
                    onClose={() => setShowPrescriptionModal(false)}
                    title={`Write Prescription for ${appointment.patient_name || 'Patient'}`}
                >
                    <DoctorPrescriptionForm
                        appointmentId={appointment.id}
                        patientName={appointment.patient_name || `Patient ID ${appointment.user}`}
                        appointmentDate={appointment.date}
                        onSubmit={handlePrescriptionSubmit}
                        onCancel={() => setShowPrescriptionModal(false)}
                        isSubmitting={isSubmittingPrescription}
                    />
                </Modal>
            )}
        </div>
    );
};

export default AppointmentDetailPage;