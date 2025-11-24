import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    UserIcon,
    SparklesIcon
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
                return (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center shadow-md"
                    >
                        <CheckCircleIcon className="w-4 h-4 mr-1.5"/> Confirmed
                    </motion.span>
                );
            case 'scheduled':
                return (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center shadow-md"
                    >
                        <CalendarDaysIcon className="w-4 h-4 mr-1.5"/> Scheduled
                    </motion.span>
                );
            case 'completed':
                return (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-gray-500 to-gray-600 text-white flex items-center shadow-md"
                    >
                        <CheckCircleIcon className="w-4 h-4 mr-1.5"/> Completed
                    </motion.span>
                );
            case 'cancelled':
                return (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white flex items-center shadow-md"
                    >
                        <XCircleIcon className="w-4 h-4 mr-1.5"/> Cancelled
                    </motion.span>
                );
            default:
                return <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 shadow-sm">{status}</span>;
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-primary via-primary-dark to-emerald-700 overflow-hidden mb-8"
            >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-5"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                                <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                    <CalendarDaysIcon className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <div className="text-white">
                                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                                    {isDoctor ? 'Manage Schedule' : 'My Appointments'}
                                    <SparklesIcon className="h-8 w-8 text-yellow-300 animate-pulse" />
                                </h1>
                                <p className="text-white/90 text-base md:text-lg">
                                    {isDoctor ? 'View and manage your patient consultations' : 'Track your upcoming visits and health journey'}
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
                                    <span className="flex items-center gap-1">
                                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                                        {filteredAppointments.filter(a => a.status === 'confirmed').length} Confirmed
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                                        {filteredAppointments.filter(a => a.status === 'scheduled').length} Scheduled
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                        
                        {!isDoctor && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/doctors')}
                                className="group relative px-6 py-3 bg-white text-primary rounded-xl font-bold hover:shadow-2xl transition-all duration-300 flex items-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <PlusIcon className="h-5 w-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                                <span className="relative z-10">Book New Appointment</span>
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
                    </svg>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Controls Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8"
                >
                    {/* Tabs */}
                    <div className="relative flex p-1.5 bg-white rounded-2xl border border-gray-200 shadow-lg w-full md:w-auto backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl"></div>
                        {(['upcoming', 'completed', 'cancelled'] as TabType[]).map((tab, index) => (
                            <motion.button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
                                    activeTab === tab 
                                        ? 'text-white shadow-lg' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab === 'upcoming' && <ClockIcon className="h-4 w-4" />}
                                    {tab === 'completed' && <CheckCircleIcon className="h-4 w-4" />}
                                    {tab === 'cancelled' && <XCircleIcon className="h-4 w-4" />}
                                    {tab}
                                </span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Search & Filter */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative w-full md:w-96"
                    >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={isDoctor ? "Search patients..." : "Search doctors or reasons..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all shadow-lg hover:shadow-xl"
                        />
                    </motion.div>
                </motion.div>

                {/* Content Grid */}
                {isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <Spinner size="lg" />
                        <p className="mt-4 text-gray-600 font-medium">Loading your schedule...</p>
                    </motion.div>
                ) : filteredAppointments.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="grid gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                        {filteredAppointments.map((apt, index) => {
                            const aptDate = parseISO(apt.date);
                            const isAptToday = isToday(aptDate);
                            const otherPartyName = isDoctor ? apt.patient_name || 'Unknown Patient' : apt.doctor_name || 'Unknown Doctor';
                            
                            return (
                                <motion.div 
                                    key={apt.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -4 }}
                                    onClick={() => navigate(`/appointments/${apt.id}`)}
                                    className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                >
                                    {/* Gradient Background Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    {/* Status accent line */}
                                    <motion.div 
                                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                            apt.status === 'confirmed' ? 'bg-gradient-to-b from-green-400 to-green-600' : 
                                            apt.status === 'scheduled' ? 'bg-gradient-to-b from-blue-400 to-blue-600' : 
                                            apt.status === 'cancelled' ? 'bg-gradient-to-b from-red-400 to-red-600' : 'bg-gray-300'
                                        }`}
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: index * 0.05 + 0.2 }}
                                    ></motion.div>

                                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-4">
                                        {/* Date & Time Box */}
                                        <div className="flex items-center gap-4">
                                            <motion.div 
                                                whileHover={{ scale: 1.05, rotate: 2 }}
                                                className="relative flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20 group-hover:border-primary/40 transition-all shadow-md"
                                            >
                                                <div className="absolute inset-0 bg-white/50 rounded-2xl backdrop-blur-sm"></div>
                                                <span className="relative text-xs font-bold text-primary uppercase tracking-wide">
                                                    {format(aptDate, 'MMM')}
                                                </span>
                                                <span className="relative text-3xl font-black text-gray-900">
                                                    {format(aptDate, 'd')}
                                                </span>
                                            </motion.div>

                        <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                        {formatTimeDisplay(apt.start_time)}
                                                    </h3>
                                                    {isAptToday && (
                                                        <motion.span 
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white uppercase tracking-wide shadow-lg"
                                                        >
                                                            Today
                                                        </motion.span>
                            )}
                        </div>
                                                <p className="text-gray-600 text-sm flex items-center gap-2 font-medium">
                                                    <ClockIcon className="h-4 w-4 text-primary" />
                                                    {format(aptDate, 'EEEE')} • {apt.duration || 30} mins
                                                </p>
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="flex-1 md:px-8">
                                            <div className="flex items-center gap-3 mb-3">
                                                <motion.div 
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-base shadow-lg"
                                                >
                                                    {otherPartyName.substring(0,2).toUpperCase()}
                                                </motion.div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-base group-hover:text-primary transition-colors">{otherPartyName}</p>
                                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{isDoctor ? 'Patient' : 'Doctor'}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                <p className="text-sm text-gray-700 line-clamp-2">
                                                    <span className="font-bold text-gray-900">Reason:</span> {apt.reason}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status & Type */}
                                        <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                            {getStatusBadge(apt.status)}
                                            <motion.div 
                                                whileHover={{ scale: 1.05 }}
                                                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl shadow-md ${
                                                    apt.appointment_type === 'virtual' 
                                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
                                                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                                }`}
                                            >
                                                {apt.appointment_type === 'virtual' ? (
                                                    <>
                                                        <VideoCameraIcon className="h-4 w-4" /> Virtual
                                                    </>
                                                ) : (
                                                    <>
                                                        <BuildingOfficeIcon className="h-4 w-4" /> In-Person
                                                    </>
                                                )}
                                            </motion.div>
                    </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 justify-end">
                                            {activeTab === 'upcoming' && (
                                                <>
                                                    {apt.status === 'confirmed' && apt.appointment_type === 'virtual' && isAptToday && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/appointments/${apt.id}/call`);
                                                            }}
                                                            className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-bold rounded-xl hover:shadow-xl transition-all shadow-lg flex items-center gap-2"
                                                        >
                                                            <VideoCameraIcon className="h-5 w-5" />
                                                            Join Call
                                                        </motion.button>
                                                    )}
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => handleCancelClick(apt.id, e)}
                                                        className="px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                                                    >
                                                        Cancel
                                                    </motion.button>
                                                </>
                                            )}
                                            <motion.button 
                                                whileHover={{ x: 5 }}
                                                className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                            >
                                                <ChevronRightIcon className="h-6 w-6" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white rounded-3xl border-2 border-gray-200 shadow-xl relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
                        
                        <div className="relative z-10">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                className="relative inline-block mb-6"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-2xl"></div>
                                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                                    <CalendarDaysIcon className="h-12 w-12 text-gray-400" />
                                </div>
                            </motion.div>
                            
                            <motion.h3 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-bold text-gray-900 mb-3"
                            >
                                {activeTab === 'upcoming' ? 'No upcoming appointments' : 
                                 activeTab === 'completed' ? 'No completed appointments' : 
                                 'No cancelled appointments'}
                            </motion.h3>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-600 max-w-md mx-auto mb-8 text-base"
                            >
                                {activeTab === 'upcoming' 
                                    ? (isDoctor ? "You don't have any appointments scheduled recently." : "You don't have any appointments scheduled. Find a doctor and book your next visit.")
                                    : "Your history for this category is empty."}
                            </motion.p>
                            
                            {!isDoctor && activeTab === 'upcoming' && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/doctors')}
                                    className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:shadow-2xl transition-all shadow-lg shadow-primary/30 inline-flex items-center gap-3"
                                >
                                    <MagnifyingGlassIcon className="h-6 w-6" />
                                    Find a Doctor
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
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