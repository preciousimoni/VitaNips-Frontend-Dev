import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeftIcon, CalendarIcon, ClockIcon, VideoCameraIcon, BuildingOfficeIcon,
    CheckCircleIcon, XCircleIcon, InformationCircleIcon, TrashIcon, UserIcon,
    ArrowPathIcon, MapPinIcon, SparklesIcon,
    ClipboardDocumentCheckIcon, ShieldCheckIcon, BanknotesIcon,
    DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { getAppointmentDetails, cancelAppointment, updateAppointment } from '../api/appointments';
import { Appointment } from '../types/appointments';
import { createDoctorPrescription, DoctorPrescriptionPayload } from '../api/doctorPortal';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';
import DoctorPrescriptionForm from '../features/doctor_portal/components/DoctorPrescriptionForm';
import TestRequestForm from '../features/doctor_portal/components/TestRequestForm';
import { BeakerIcon } from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '../utils/date';
import Spinner from '../components/ui/Spinner';
// import ErrorMessage from '../components/ui/ErrorMessage';
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

    const { user } = useAuth();
    const isDoctor = user?.is_doctor || false;

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    const [isMarkingCompleted, setIsMarkingCompleted] = useState<boolean>(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState<boolean>(false);
    const [isSubmittingPrescription, setIsSubmittingPrescription] = useState<boolean>(false);
    const [showTestRequestModal, setShowTestRequestModal] = useState<boolean>(false);
    
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

    const { text: statusText, icon: StatusIcon } = getStatusInfo(appointment.status);

    return (
        <div className="min-h-screen bg-cream-50 pb-12 font-sans">
            {/* Hero Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-primary-900 overflow-hidden mb-8 rounded-b-[3rem] border-b-4 border-l-4 border-r-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mx-4 mt-4 md:mx-6"
            >
                <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.button
                            onClick={() => navigate('/appointments')}
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 text-black bg-white px-4 py-2 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold mb-8"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                            Back to Appointments
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-400 border-2 border-black text-black font-black text-sm mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <SparklesIcon className="h-4 w-4 mr-2" />
                            APPOINTMENT DETAILS
                        </motion.div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 font-display uppercase tracking-tight flex flex-col md:flex-row md:items-center gap-2 md:gap-4 drop-shadow-md">
                                    Appointment
                                    <span className="relative inline-block text-yellow-400">
                                        #{appointment.id}
                                    </span>
                                </h1>
                                <p className="text-xl text-white/90 font-bold border-l-4 border-yellow-400 pl-4 mt-4">
                                    {formatDate(appointment.date)} • {formatTime(appointment.start_time)}
                                </p>
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className={`inline-flex items-center px-6 py-3 rounded-xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black uppercase tracking-wide ${
                                    appointment.status === 'confirmed' ? 'bg-green-400 text-black' :
                                    appointment.status === 'completed' ? 'bg-gray-400 text-black' :
                                    appointment.status === 'cancelled' ? 'bg-red-500 text-white' :
                                    'bg-white text-black'
                                }`}
                            >
                                <StatusIcon className="h-6 w-6 mr-2" />
                                {statusText}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <div className="max-w-5xl mx-auto px-6 md:px-12 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-4 border-black"
                >

                    <div className="p-8 sm:p-10 space-y-10">
                        {/* Doctor Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.01 }}
                            className="bg-primary-50 rounded-[2rem] p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group"
                        >
                            <div className="flex items-center space-x-6 relative z-10">
                                <motion.div
                                    whileHover={{ rotate: 12, scale: 1.1 }}
                                    className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <UserIcon className="h-10 w-10 text-black" />
                                </motion.div>
                                <div className="flex-1">
                                    <p className="text-xs font-black text-black uppercase tracking-widest mb-1 bg-yellow-400 inline-block px-2 py-0.5 rounded-md border border-black">Healthcare Provider</p>
                                    <Link 
                                        to={`/doctors/${appointment.doctor}`} 
                                        className="text-3xl font-black text-black hover:underline decoration-4 decoration-primary-900 underline-offset-4 transition-all block font-display uppercase tracking-tight"
                                    >
                                        {appointment.doctor_name || `Dr. ID ${appointment.doctor}`}
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
                                    bgColor: 'bg-blue-100',
                                    iconColor: 'bg-blue-500',
                                    delay: 0.1
                                },
                                {
                                    icon: ClockIcon,
                                    label: 'Time',
                                    value: `${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`,
                                    bgColor: 'bg-green-100',
                                    iconColor: 'bg-green-500',
                                    delay: 0.2
                                },
                                {
                                    icon: appointment.appointment_type === 'virtual' ? VideoCameraIcon : BuildingOfficeIcon,
                                    label: 'Consultation Type',
                                    value: appointment.appointment_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                    bgColor: appointment.appointment_type === 'virtual' ? 'bg-purple-100' : 'bg-teal-100',
                                    iconColor: appointment.appointment_type === 'virtual' ? 'bg-purple-500' : 'bg-teal-500',
                                    delay: 0.3
                                },
                                ...(appointment.appointment_type !== 'virtual' ? [{
                                    icon: MapPinIcon,
                                    label: 'Location',
                                    value: 'Medical Center',
                                    bgColor: 'bg-red-100',
                                    iconColor: 'bg-red-500',
                                    delay: 0.4
                                }] : [])
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: item.delay }}
                                    whileHover={{ y: -4, boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
                                    className={`flex items-center p-6 rounded-2xl ${item.bgColor} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}
                                >
                                    <div className={`h-14 w-14 rounded-xl ${item.iconColor} flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mr-5 flex-shrink-0`}>
                                        <item.icon className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-black uppercase tracking-widest mb-1 opacity-70">{item.label}</p>
                                        <p className="text-xl font-black text-black">{item.value}</p>
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
                                className="bg-teal-50 rounded-[2rem] p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <div className="flex items-center gap-4 mb-6 pb-4 border-b-4 border-black/10">
                                    <div className="p-3 bg-teal-500 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <ShieldCheckIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-black uppercase font-display">Insurance Coverage</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Insurance Plan</p>
                                        <p className="text-lg font-black text-black">
                                            {appointment.user_insurance.plan.provider.name}
                                        </p>
                                        <p className="text-sm font-bold text-gray-600">
                                            {appointment.user_insurance.plan.name} ({appointment.user_insurance.plan.plan_type})
                                        </p>
                                    </div>
                                    {appointment.consultation_fee && (
                                        <>
                                            <div className="bg-white rounded-xl p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Consultation Fee</p>
                                                <p className="text-lg font-black text-black">
                                                    ₦{parseFloat(appointment.consultation_fee).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </p>
                                            </div>
                                            {appointment.insurance_covered_amount && (
                                                <div className="bg-green-100 rounded-xl p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                    <p className="text-xs font-black text-green-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                        <CheckCircleIcon className="h-3.5 w-3.5" />
                                                        Covered by Insurance
                                                    </p>
                                                    <p className="text-lg font-black text-green-900">
                                                        ₦{parseFloat(appointment.insurance_covered_amount).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                            {appointment.patient_copay && (
                                                <div className="bg-blue-100 rounded-xl p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                    <p className="text-xs font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                        <BanknotesIcon className="h-3.5 w-3.5" />
                                                        Your Out-of-Pocket
                                                    </p>
                                                    <p className="text-lg font-black text-blue-900">
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
                                    <div className="mt-6 p-4 bg-primary-100 rounded-xl border-4 border-black flex items-center gap-3">
                                        <CheckCircleIcon className="h-6 w-6 text-primary-900" />
                                        <p className="text-sm text-primary-900 font-bold uppercase tracking-wide">
                                            Insurance claim has been automatically generated
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Reason & Notes */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-primary-900 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <InformationCircleIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-black font-display uppercase">Reason for Visit</h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border-4 border-black text-black font-medium leading-relaxed text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    {appointment.reason || <span className="italic text-gray-400">Not specified</span>}
                                </div>
                            </motion.div>
                            
                            {appointment.notes && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-blue-500 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <CheckCircleIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-black text-black font-display uppercase">Doctor's Notes</h3>
                                    </div>
                                    <div className="bg-blue-50 p-6 rounded-2xl border-4 border-black text-blue-900 font-medium leading-relaxed whitespace-pre-wrap text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
                                className="bg-amber-100 border-4 border-black rounded-2xl p-6 flex items-center text-black font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <InformationCircleIcon className="h-8 w-8 mr-4 text-black" />
                                <p className="text-lg">A follow-up is recommended for this appointment.</p>
                            </motion.div>
                        )}

                        {/* Test Request & Results Section - For Follow-up Appointments */}
                        {appointment.is_followup && appointment.linked_test_request && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-orange-50 rounded-[2rem] p-8 border-4 border-black relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6"
                            >
                                <div className="flex items-start gap-6 relative z-10">
                                    <div className="p-4 bg-orange-500 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                                        <BeakerIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-black mb-2 font-display uppercase">Test Request: {appointment.linked_test_request.test_name}</h3>
                                        {appointment.linked_test_request.test_description && (
                                            <p className="text-black font-bold mb-4 text-lg">{appointment.linked_test_request.test_description}</p>
                                        )}
                                        
                                        {/* Test Results Section */}
                                        {appointment.test_results && appointment.test_results.length > 0 ? (
                                            <div className="mb-4">
                                                <h4 className="text-lg font-black text-black mb-3">Test Results ({appointment.test_results.length})</h4>
                                                <div className="space-y-3">
                                                    {appointment.test_results.map((result) => (
                                                        <div key={result.id} className="bg-white rounded-xl border-2 border-black p-4 flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-black text-black">{result.description || result.filename}</p>
                                                                {result.document_type && (
                                                                    <p className="text-sm font-bold text-gray-600">Type: {result.document_type}</p>
                                                                )}
                                                                <p className="text-xs font-bold text-gray-500 mt-1">
                                                                    Uploaded: {new Date(result.uploaded_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <a
                                                                href={result.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="ml-4 px-4 py-2 bg-primary-900 text-white font-black rounded-lg border-2 border-black hover:bg-primary-800 transition-colors flex items-center gap-2"
                                                            >
                                                                <DocumentArrowDownIcon className="h-4 w-4" />
                                                                View
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-4">
                                                <p className="text-black font-bold">⏳ Waiting for patient to upload test results</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Prescription Prompt Banner - For Completed Appointments */}
                        {appointment.status === 'completed' && isDoctor && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className={`rounded-[2rem] p-8 border-4 border-black relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                                    appointment.is_followup && appointment.linked_test_request && (!appointment.test_results || appointment.test_results.length === 0)
                                        ? 'bg-yellow-100' 
                                        : 'bg-purple-100'
                                }`}
                            >
                                <div className="flex items-start gap-6 relative z-10">
                                    <div className={`p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 ${
                                        appointment.is_followup && appointment.linked_test_request && (!appointment.test_results || appointment.test_results.length === 0)
                                            ? 'bg-yellow-500' 
                                            : 'bg-purple-500'
                                    }`}>
                                        <ClipboardDocumentCheckIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-black mb-2 font-display uppercase">
                                            {appointment.is_followup && appointment.linked_test_request && (!appointment.test_results || appointment.test_results.length === 0)
                                                ? 'Waiting for Test Results'
                                                : 'Ready to Write Prescription'
                                            }
                                        </h3>
                                        <p className="text-black font-bold leading-relaxed mb-6 text-lg">
                                            {appointment.is_followup && appointment.linked_test_request && (!appointment.test_results || appointment.test_results.length === 0)
                                                ? 'Please wait for the patient to upload test results before writing a prescription.'
                                                : 'This appointment has been completed. You can now write a prescription for the patient.'
                                            }
                                        </p>
                                        {!(appointment.is_followup && appointment.linked_test_request && (!appointment.test_results || appointment.test_results.length === 0)) && (
                                            <motion.button
                                                onClick={() => setShowPrescriptionModal(true)}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-8 py-4 bg-black text-white font-black rounded-xl hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex items-center gap-2 uppercase tracking-wide border-2 border-white"
                                            >
                                                <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                                Write Prescription Now
                                            </motion.button>
                                        )}
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
                                className="bg-purple-50 rounded-[2rem] p-8 border-4 border-black relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <div className="flex items-start gap-6 relative z-10">
                                    <div className="p-4 bg-purple-500 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                                        <VideoCameraIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-black mb-3 font-display uppercase">Virtual Consultation</h3>
                                        <p className="text-black font-bold leading-relaxed mb-6 text-lg">
                                            This is a virtual appointment. You can join the video call 15 minutes before the scheduled time. Make sure you have a stable internet connection and a quiet environment.
                                        </p>
                                        {canJoinCall && (
                                            <div className="flex items-center gap-3 px-6 py-3 bg-green-300 rounded-xl border-4 border-black w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <div className="h-3 w-3 bg-black rounded-full animate-pulse"></div>
                                                <span className="text-black font-black uppercase tracking-wide">You can join now!</span>
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
                        className="bg-gray-50 p-8 border-t-4 border-black flex flex-wrap gap-4 justify-end"
                    >
                        {canMarkAsCompleted && (
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleMarkAsCompleted}
                                disabled={isMarkingCompleted}
                                className="px-8 py-4 bg-green-500 text-black font-black text-lg rounded-xl hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black uppercase tracking-wide"
                            >
                                {isMarkingCompleted ? 'Marking...' : '✓ Mark as Completed'}
                            </motion.button>
                        )}

                        {appointment.status === 'completed' && isDoctor && (
                            <>
                                {/* Only show prescription button if not a test follow-up OR if test results are uploaded */}
                                {!(appointment.is_followup && appointment.linked_test_request && (!appointment.test_results || appointment.test_results.length === 0)) && (
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowPrescriptionModal(true)}
                                        className="px-8 py-4 bg-purple-500 text-white font-black rounded-xl hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black flex items-center uppercase tracking-wide"
                                    >
                                        <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                                        Write Prescription
                                    </motion.button>
                                )}
                                {/* Only show test request button for non-follow-up appointments */}
                                {!appointment.is_followup && (
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowTestRequestModal(true)}
                                        className="px-8 py-4 bg-orange-500 text-white font-black rounded-xl hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black flex items-center uppercase tracking-wide"
                                    >
                                        <BeakerIcon className="h-5 w-5 mr-2" />
                                        Request Test
                                    </motion.button>
                                )}
                            </>
                        )}

                        {/* Patient: View Test Requests Button */}
                        {!isDoctor && (
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/test-requests')}
                                className="px-8 py-4 bg-orange-500 text-white font-black rounded-xl hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black flex items-center uppercase tracking-wide"
                            >
                                <BeakerIcon className="h-5 w-5 mr-2" />
                                View Test Requests
                            </motion.button>
                        )}

                        {canCancel && (
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCancel} 
                                disabled={isCancelling} 
                                className="px-8 py-4 bg-white text-red-600 font-black rounded-xl hover:bg-red-50 border-4 border-red-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
                            >
                                <TrashIcon className="h-5 w-5 mr-2" />
                                {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                            </motion.button>
                        )}
                        
                        {showScheduleFollowUp && (
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleScheduleFollowUp}
                                className="px-8 py-4 bg-blue-500 text-white font-black rounded-xl hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black flex items-center uppercase tracking-wide"
                            >
                                <ArrowPathIcon className="h-5 w-5 mr-2" />
                                Schedule Follow-up
                            </motion.button>
                        )}

                        {canJoinCall && (
                            <motion.div
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link 
                                    to={`/appointments/${appointment.id}/call`} 
                                    className="px-10 py-4 bg-green-500 text-black font-black rounded-xl hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black flex items-center uppercase tracking-wide"
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

            {/* Test Request Modal */}
            {appointment && appointment.status === 'completed' && isDoctor && (
                <Modal
                    isOpen={showTestRequestModal}
                    onClose={() => setShowTestRequestModal(false)}
                    title=""
                >
                    <TestRequestForm
                        appointmentId={appointment.id}
                        patientName={appointment.patient_name || `Patient ID ${appointment.user}`}
                        onSuccess={() => {
                            setShowTestRequestModal(false);
                            fetchAppointment();
                            toast.success('Test request created! Patient will be notified.');
                        }}
                        onCancel={() => setShowTestRequestModal(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default AppointmentDetailPage;