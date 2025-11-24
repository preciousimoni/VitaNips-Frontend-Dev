import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    CalendarDaysIcon, 
    ClockIcon, 
    VideoCameraIcon, 
    BuildingOfficeIcon, 
    MagnifyingGlassIcon,
    FunnelIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    ChevronRightIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { getUserAppointments, cancelAppointment } from '../api/appointments';
import { Appointment } from '../types/appointments';
import Spinner from '../components/ui/Spinner';
import { ConfirmDialog } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO, isToday, isPast, isFuture } from 'date-fns';
import toast from 'react-hot-toast';

type TabType = 'upcoming' | 'completed' | 'cancelled';

const AppointmentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const isDoctor = user?.is_doctor;

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all appointments - pagination could be added later
            const response = await getUserAppointments({ ordering: '-date,-start_time' });
            setAppointments(response.results);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            toast.error('Could not load your schedule.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleCancelClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedAppointmentId(id);
        setShowCancelDialog(true);
    };

    const handleConfirmCancel = async () => {
        if (!selectedAppointmentId) return;
        setIsCancelling(true);
        try {
            await cancelAppointment(selectedAppointmentId);
            toast.success('Appointment cancelled successfully.');
            setShowCancelDialog(false);
            fetchAppointments(); // Refresh list
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            toast.error('Failed to cancel appointment. Please try again.');
        } finally {
            setIsCancelling(false);
            setSelectedAppointmentId(null);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        // 1. Filter by Tab
        const aptDate = parseISO(apt.date); // Assuming 'YYYY-MM-DD'
        // Combine date and time for precise comparison if needed, but status is usually sufficient source of truth
        const isCompletedStatus = ['completed', 'no_show'].includes(apt.status);
        const isCancelledStatus = ['cancelled'].includes(apt.status);
        
        // Basic tab logic
        if (activeTab === 'upcoming') {
            if (isCompletedStatus || isCancelledStatus) return false;
            // Also verify date isn't far in past if status is still 'scheduled' (stale data handling)
            // But let's trust status for now to keep it simple, or check if it's today or future
            // const now = new Date();
            // const aptDateTime = parseISO(`${apt.date}T${apt.start_time}`);
            return true; 
        }
        if (activeTab === 'completed') return isCompletedStatus;
        if (activeTab === 'cancelled') return isCancelledStatus;
        
        return true;
    }).filter(apt => {
        // 2. Filter by Search
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const otherPartyName = isDoctor ? apt.patient_name : apt.doctor_name;
        return (
            otherPartyName?.toLowerCase().includes(query) ||
            apt.reason?.toLowerCase().includes(query) ||
            apt.date.includes(query)
        );
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center"><CheckCircleIcon className="w-3 h-3 mr-1"/> Confirmed</span>;
            case 'scheduled':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center"><CalendarDaysIcon className="w-3 h-3 mr-1"/> Scheduled</span>;
            case 'completed':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center"><CheckCircleIcon className="w-3 h-3 mr-1"/> Completed</span>;
            case 'cancelled':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center"><XCircleIcon className="w-3 h-3 mr-1"/> Cancelled</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status}</span>;
        }
    };

    const formatTimeDisplay = (timeStr: string) => {
        try {
            const [hours, minutes] = timeStr.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes));
            return format(date, 'h:mm a');
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <CalendarDaysIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isDoctor ? 'Manage Schedule' : 'My Appointments'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {isDoctor ? 'View and manage your patient consultations' : 'Track your upcoming visits and history'}
                            </p>
                        </div>
                    </div>
                    
                    {!isDoctor && (
                        <button 
                            onClick={() => navigate('/doctors')}
                            className="hidden sm:flex items-center px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm gap-2"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Book New
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Controls Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    {/* Tabs */}
                    <div className="flex p-1 bg-white rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
                        {(['upcoming', 'completed', 'cancelled'] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                                    activeTab === tab 
                                        ? 'bg-primary text-white shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search & Filter */}
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={isDoctor ? "Search patients..." : "Search doctors or reasons..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Spinner size="lg" />
                        <p className="mt-4 text-gray-500 font-medium">Loading your schedule...</p>
                    </div>
                ) : filteredAppointments.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredAppointments.map((apt) => {
                            const aptDate = parseISO(apt.date);
                            const isAptToday = isToday(aptDate);
                            const otherPartyName = isDoctor ? apt.patient_name || 'Unknown Patient' : apt.doctor_name || 'Unknown Doctor';
                            
                            return (
                                <div 
                                    key={apt.id}
                                    onClick={() => navigate(`/appointments/${apt.id}`)}
                                    className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    {/* Status accent line */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                        apt.status === 'confirmed' ? 'bg-green-500' : 
                                        apt.status === 'scheduled' ? 'bg-blue-500' : 
                                        apt.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'
                                    }`}></div>

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-4">
                                        {/* Date & Time Box */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 group-hover:border-primary/20 transition-colors">
                                                <span className="text-xs font-bold text-gray-500 uppercase">
                                                    {format(aptDate, 'MMM')}
                                                </span>
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {format(aptDate, 'd')}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {formatTimeDisplay(apt.start_time)}
                                                    </h3>
                                                    {isAptToday && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">
                                                            Today
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-500 text-sm flex items-center gap-1">
                                                    <ClockIcon className="h-4 w-4" />
                                                    {format(aptDate, 'EEEE')} • {apt.duration || 30} mins
                                                </p>
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="flex-1 md:px-8">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {otherPartyName.substring(0,2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{otherPartyName}</p>
                                                    <p className="text-xs text-gray-500">{isDoctor ? 'Patient' : 'Doctor'}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-1">
                                                <span className="font-medium text-gray-800">Reason:</span> {apt.reason}
                                            </p>
                                        </div>

                                        {/* Status & Type */}
                                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                                            {getStatusBadge(apt.status)}
                                            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                                                apt.appointment_type === 'virtual' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
                                            }`}>
                                                {apt.appointment_type === 'virtual' ? (
                                                    <>
                                                        <VideoCameraIcon className="h-3 w-3" /> Virtual
                                                    </>
                                                ) : (
                                                    <>
                                                        <BuildingOfficeIcon className="h-3 w-3" /> In-Person
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 justify-end">
                                            {activeTab === 'upcoming' && (
                                                <>
                                                    {apt.status === 'confirmed' && apt.appointment_type === 'virtual' && isAptToday && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/appointments/${apt.id}/call`);
                                                            }}
                                                            className="px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2"
                                                        >
                                                            <VideoCameraIcon className="h-4 w-4" />
                                                            Join
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => handleCancelClick(apt.id, e)}
                                                        className="px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                                <ChevronRightIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalendarDaysIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {activeTab === 'upcoming' ? 'No upcoming appointments' : 
                             activeTab === 'completed' ? 'No completed appointments' : 
                             'No cancelled appointments'}
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            {activeTab === 'upcoming' 
                                ? (isDoctor ? "You don't have any appointments scheduled recently." : "You don't have any appointments scheduled. Find a doctor and book your next visit.")
                                : "Your history for this category is empty."}
                        </p>
                        {!isDoctor && activeTab === 'upcoming' && (
                            <button 
                                onClick={() => navigate('/doctors')}
                                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 inline-flex items-center gap-2"
                            >
                                <MagnifyingGlassIcon className="h-5 w-5" />
                                Find a Doctor
                            </button>
                        )}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
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

export default AppointmentsPage;