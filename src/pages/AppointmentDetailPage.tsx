import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon, CalendarIcon, ClockIcon, VideoCameraIcon, BuildingOfficeIcon,
    CheckCircleIcon, XCircleIcon, InformationCircleIcon, TrashIcon, UserIcon,
    ArrowPathIcon, MapPinIcon
} from '@heroicons/react/24/outline';
import { getAppointmentDetails, cancelAppointment } from '../api/appointments';
import { Appointment } from '../types/appointments';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate, formatTime } from '../utils/date';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
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

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    
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

    if (isLoading) return <div className="flex justify-center items-center min-h-screen bg-gray-50"><Spinner size="lg" /></div>;
    
    if (error || !appointment) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircleIcon className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Appointment</h2>
                    <p className="text-gray-500 mb-6">{error || "Appointment not found."}</p>
                    <Link to="/appointments" className="btn-primary w-full block text-center">
                        Back to Appointments
                    </Link>
                </div>
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

    const { text: statusText, color: statusColor, bgColor: statusBgColor, icon: StatusIcon } = getStatusInfo(appointment.status);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link to="/appointments" className="inline-flex items-center text-gray-500 hover:text-primary mb-6 transition-colors group">
                    <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
                    Back to Appointments
                </Link>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
                            <p className="text-gray-500 text-sm mt-1">ID: #{appointment.id}</p>
                        </div>
                        <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${statusColor} ${statusBgColor}`}>
                            <StatusIcon className="h-5 w-5 mr-2" />
                            {statusText}
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Doctor Info Card */}
                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center space-x-4 border border-gray-100">
                            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                                <UserIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Doctor</p>
                                <Link to={`/doctors/${appointment.doctor}`} className="text-lg font-bold text-gray-900 hover:text-primary transition-colors">
                                    {appointment.doctor_name || `Dr. ID ${appointment.doctor}`}
                                </Link>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                <CalendarIcon className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Date</p>
                                    <p className="text-lg font-semibold text-gray-900">{formatDate(appointment.date)}</p>
                                </div>
                            </div>
                            <div className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                <ClockIcon className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Time</p>
                                    <p className="text-lg font-semibold text-gray-900">{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</p>
                                </div>
                            </div>
                            <div className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                {appointment.appointment_type === 'virtual' ?
                                    <VideoCameraIcon className="h-6 w-6 text-purple-600 mr-4 mt-1 flex-shrink-0" /> :
                                    <BuildingOfficeIcon className="h-6 w-6 text-teal-600 mr-4 mt-1 flex-shrink-0" />}
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Consultation Type</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">{appointment.appointment_type.replace('_', '-')}</p>
                                </div>
                            </div>
                            {appointment.appointment_type !== 'virtual' && (
                                <div className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                    <MapPinIcon className="h-6 w-6 text-red-500 mr-4 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Location</p>
                                        <p className="text-lg font-semibold text-gray-900">Medical Center</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reason & Notes */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Reason for Visit</h3>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed">
                                    {appointment.reason || <span className="italic text-gray-400">Not specified</span>}
                                </div>
                            </div>
                            
                            {appointment.notes && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Doctor's Notes</h3>
                                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-blue-900 leading-relaxed whitespace-pre-wrap">
                                        {appointment.notes}
                                    </div>
                                </div>
                            )}
                        </div>

                        {appointment.followup_required && !showScheduleFollowUp && (
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center text-orange-800 font-medium">
                                <InformationCircleIcon className="h-5 w-5 mr-3" />
                                A follow-up is recommended for this appointment.
                            </div>
                        )}
                    </div>

                    {/* Actions Footer */}
                    <div className="bg-gray-50 p-6 sm:p-8 border-t border-gray-100 flex flex-wrap gap-4 justify-end">
                        {canCancel && (
                            <button 
                                onClick={handleCancel} 
                                disabled={isCancelling} 
                                className="px-6 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center shadow-sm"
                            >
                                <TrashIcon className="h-5 w-5 mr-2" />
                                {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                            </button>
                        )}
                        
                        {showScheduleFollowUp && (
                            <button
                                onClick={handleScheduleFollowUp}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center"
                            >
                                <ArrowPathIcon className="h-5 w-5 mr-2" />
                                Schedule Follow-up
                            </button>
                        )}

                        {canJoinCall && (
                            <Link 
                                to={`/appointments/${appointment.id}/call`} 
                                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-green-200 flex items-center transform hover:-translate-y-0.5"
                            >
                                <VideoCameraIcon className="h-5 w-5 mr-2" />
                                Join Virtual Call
                            </Link>
                        )}
                    </div>
                </div>
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
        </div>
    );
};

export default AppointmentDetailPage;