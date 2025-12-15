
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CalendarDaysIcon, 
    PlusIcon, 
    ClockIcon, 
    VideoCameraIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowLeftIcon,
    SparklesIcon,
    BuildingOfficeIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid';
import { 
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getUserAppointments, cancelAppointment } from '../api/appointments';
import { Appointment } from '../types/appointments';
import Spinner from '../components/ui/Spinner';
import { ConfirmDialog } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO, isToday } from 'date-fns';
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
                    <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide bg-green-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1.5"/> Confirmed
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide bg-blue-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-1.5"/> Scheduled
                    </span>
                );
            case 'completed':
                return (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide bg-gray-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1.5"/> Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center">
                        <XCircleIcon className="w-4 h-4 mr-1.5"/> Cancelled
                    </span>
                );
            default:
                return <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-300">{status}</span>;
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

    const calculateDuration = (start: string, end: string) => {
        try {
            const startDate = new Date(`1970-01-01T${start}`);
            const endDate = new Date(`1970-01-01T${end}`);
            const diff = (endDate.getTime() - startDate.getTime()) / 60000;
            return diff > 0 ? diff : 30;
        } catch (e) {
            return 30;
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 pb-12 font-sans">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-primary-900 pt-16 pb-20 md:pt-20 md:pb-24 overflow-hidden rounded-b-[3rem] border-b-4 border-l-4 border-r-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mx-4 mt-4 md:mx-6 mb-12"
            >
                <div className="relative max-w-7xl mx-auto px-6 md:px-12">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link 
                            to="/dashboard" 
                            className="inline-flex items-center text-black bg-white px-5 py-2.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold group"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Back to Dashboard
                        </Link>
                    </motion.div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col md:flex-row md:items-center gap-6"
                        >
                            <div className="relative">
                                <div className="p-4 bg-yellow-400 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <CalendarDaysIcon className="h-10 w-10 text-black" />
                                </div>
                            </div>
                            <div className="text-white">
                                <h1 className="text-3xl md:text-5xl font-black mb-2 flex flex-wrap items-center gap-3 font-display uppercase tracking-tight">
                                    {isDoctor ? 'Manage Schedule' : 'My Appointments'}
                                    <SparklesIcon className="h-8 w-8 text-yellow-400 animate-pulse" />
                                </h1>
                                <p className="text-white/90 text-lg max-w-md font-bold border-l-4 border-yellow-400 pl-4 py-1">
                                    {isDoctor ? 'View and manage your patient consultations' : 'Track your upcoming visits and health journey'}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 mt-4 text-sm font-bold">
                                    <span className="flex items-center gap-2 bg-green-500 text-black px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="h-2 w-2 bg-black rounded-full animate-pulse"></div>
                                        {filteredAppointments.filter(a => a.status === 'confirmed').length} Confirmed
                                    </span>
                                    <span className="flex items-center gap-2 bg-blue-400 text-black px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="h-2 w-2 bg-black rounded-full animate-pulse"></div>
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
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/doctors')}
                                className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-2xl font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3"
                            >
                                <PlusIcon className="h-6 w-6" />
                                <span>Book New Appointment</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-4 relative z-10">
                {/* Controls Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10"
                >
                    {/* Tabs */}
                    <div className="flex p-2 bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full md:w-auto overflow-x-auto no-scrollbar gap-2">
                        {(['upcoming', 'completed', 'cancelled'] as TabType[]).map((tab) => (
                            <motion.button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-black transition-all capitalize border-2 ${
                                    activeTab === tab 
                                        ? 'bg-primary text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                                        : 'bg-gray-100 text-gray-600 border-transparent hover:border-black hover:bg-white'
                                }`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
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
                            <MagnifyingGlassIcon className="h-5 w-5 text-black" />
                        </div>
                        <input
                            type="text"
                            placeholder={isDoctor ? "Search patients..." : "Search doctors or reasons..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 border-4 border-black rounded-2xl bg-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:bg-yellow-50 font-bold text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        />
                    </motion.div>
                </motion.div>

                {/* Content Grid */}
                {isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Spinner size="lg" />
                        <p className="mt-6 text-black font-bold text-lg">Loading your schedule...</p>
                    </motion.div>
                ) : filteredAppointments.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-8"
                    >
                        {/* Group appointments by date */}
                        {(() => {
                            const groupedByDate: Record<string, Appointment[]> = {};
                            filteredAppointments.forEach(apt => {
                                const dateKey = format(parseISO(apt.date), 'yyyy-MM-dd');
                                if (!groupedByDate[dateKey]) {
                                    groupedByDate[dateKey] = [];
                                }
                                groupedByDate[dateKey].push(apt);
                            });

                            // Sort dates
                            const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
                                new Date(a).getTime() - new Date(b).getTime()
                            );

                            return sortedDates.map((dateKey, groupIndex) => {
                                const dateAppointments = groupedByDate[dateKey]
                                    .sort((a, b) => a.start_time.localeCompare(b.start_time));
                                const date = parseISO(dateKey);
                                const isTodayDate = isToday(date);
                                const isTomorrow = format(date, 'yyyy-MM-dd') === format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
                                
                                return (
                                    <motion.div
                                        key={dateKey}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: groupIndex * 0.1 }}
                                        className="space-y-6"
                                    >
                                        {/* Date Header */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <CalendarDaysIcon className="h-6 w-6 text-black" />
                                                <span className="font-black text-black text-lg uppercase tracking-tight">
                                                    {isTodayDate ? 'Today' : isTomorrow ? 'Tomorrow' : format(date, 'EEEE, MMMM d, yyyy')}
                                                </span>
                                                <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-black rounded-lg border-2 border-black">
                                                    {dateAppointments.length}
                                                </span>
                                            </div>
                                            <div className="flex-1 h-1 bg-black rounded-full opacity-20"></div>
                                        </div>

                                        {/* Appointments for this date */}
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            <AnimatePresence mode="popLayout">
                                                {dateAppointments.map((apt, index) => {
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
                                                            whileHover={{ y: -6, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                                                            onClick={() => navigate(`/appointments/${apt.id}`)}
                                                            className="group bg-white rounded-[2rem] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer relative overflow-hidden"
                                                        >
                                                            {/* Status Indicator Top Bar */}
                                                            <div className={`absolute top-0 left-0 right-0 h-3 border-b-4 border-black ${
                                                                apt.status === 'confirmed' ? 'bg-green-500' : 
                                                                apt.status === 'scheduled' ? 'bg-blue-400' : 
                                                                apt.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'
                                                            }`}></div>
                                                            
                                                            <div className="pt-4 space-y-4">
                                                                {/* Time & Status Row */}
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <ClockIcon className="h-5 w-5 text-black" />
                                                                            <h3 className="text-2xl font-black text-black group-hover:text-primary-700 transition-colors">
                                                                                {formatTimeDisplay(apt.start_time)}
                                                                            </h3>
                                                                        </div>
                                                                        <p className="text-sm text-gray-600 font-bold bg-gray-100 px-2 py-0.5 rounded-md border border-gray-300 inline-block">
                                                                            {calculateDuration(apt.start_time, apt.end_time)} mins
                                                                        </p>
                                                                    </div>
                                                                    <div className="scale-90 origin-top-right">
                                                                        {getStatusBadge(apt.status)}
                                                                    </div>
                                                                </div>

                                                                {/* Doctor/Patient Info */}
                                                                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border-2 border-black">
                                                                    <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                                                                        {otherPartyName.substring(0,2).toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-black text-black text-base truncate">
                                                                            {otherPartyName}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                                                            {isDoctor ? 'Patient' : 'Doctor'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Reason */}
                                                                <div className="bg-yellow-50 rounded-xl p-4 border-2 border-black">
                                                                    <p className="text-sm text-black line-clamp-2">
                                                                        <span className="font-black uppercase text-xs tracking-wide block mb-1">Reason for Visit</span>
                                                                        <span className="font-medium">{apt.reason || 'General Consultation'}</span>
                                                                    </p>
                                                                </div>

                                                                {/* Type & Actions Row */}
                                                                <div className="flex items-center justify-between pt-2">
                                                                    <div className={`flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                                                        apt.appointment_type === 'virtual' 
                                                                            ? 'bg-purple-100 text-purple-900' 
                                                                            : 'bg-orange-100 text-orange-900'
                                                                    }`}>
                                                                        {apt.appointment_type === 'virtual' ? (
                                                                            <>
                                                                                <VideoCameraIcon className="h-4 w-4" /> Virtual
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <BuildingOfficeIcon className="h-4 w-4" /> In-Person
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        {activeTab === 'upcoming' && (
                                                                            <>
                                                                                {apt.status === 'confirmed' && apt.appointment_type === 'virtual' && isAptToday && (
                                                                                    <motion.button
                                                                                        whileHover={{ scale: 1.1, rotate: -2 }}
                                                                                        whileTap={{ scale: 0.95 }}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            navigate(`/appointments/${apt.id}/call`);
                                                                                        }}
                                                                                        className="p-2 bg-green-500 text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-400 transition-colors"
                                                                                        title="Join Call"
                                                                                    >
                                                                                        <VideoCameraIcon className="h-5 w-5" />
                                                                                    </motion.button>
                                                                                )}
                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.1, rotate: 2 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    onClick={(e) => handleCancelClick(apt.id, e)}
                                                                                    className="p-2 bg-white text-red-600 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-50 transition-colors"
                                                                                    title="Cancel Appointment"
                                                                                >
                                                                                    <XCircleIcon className="h-5 w-5" />
                                                                                </motion.button>
                                                                            </>
                                                                        )}
                                                                        <motion.div 
                                                                            className="p-2 bg-black text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                                                                        >
                                                                            <ChevronRightIcon className="h-5 w-5" />
                                                                        </motion.div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            });
                        })()}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    >
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-6 p-6 bg-gray-100 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <CalendarDaysIcon className="h-16 w-16 text-gray-400" />
                            </div>
                            
                            <h3 className="text-3xl font-black text-black mb-3">
                                {activeTab === 'upcoming' ? 'No upcoming appointments' : 
                                 activeTab === 'completed' ? 'No completed appointments' : 
                                 'No cancelled appointments'}
                            </h3>
                            
                            <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg font-medium">
                                {activeTab === 'upcoming' 
                                    ? (isDoctor ? "You don't have any appointments scheduled recently." : "You don't have any appointments scheduled. Find a doctor and book your next visit.")
                                    : "Your history for this category is empty."}
                            </p>
                            
                            {!isDoctor && activeTab === 'upcoming' && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/doctors')}
                                    className="px-8 py-4 bg-primary text-white font-black rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all inline-flex items-center gap-3 uppercase tracking-wider"
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
            />
        </div>
    );
};

export default AppointmentsPage;