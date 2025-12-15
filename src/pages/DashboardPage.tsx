import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    HeartIcon,
    ShieldExclamationIcon,
    ShoppingBagIcon,
    FireIcon,
    MoonIcon,
    CalendarDaysIcon,
    BellAlertIcon,
    ArrowRightIcon,
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
    SparklesIcon,
    ShieldCheckIcon,
    CubeIcon,
    TruckIcon,
    ExclamationCircleIcon,
    DocumentTextIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

import { getUserAppointments } from '../api/appointments';
import { getMedicationReminders } from '../api/medicationReminders';
import { getVitalSigns } from '../api/healthLogs';
import { getUnreadNotificationCount } from '../api/notifications';
import { getUserOrders } from '../api/orders';
import { getUserPrescriptions } from '../api/prescriptions';
import VitalSignForm from '../features/health/components/VitalSignForm';
import Modal from '../components/common/Modal';
import { createVitalSign } from '../api/healthLogs';
import { VitalSignPayload } from '../types/healthLogs';
import { Appointment } from '../types/appointments';
import { MedicationReminder } from '../types/reminders';
import { VitalSignLog } from '../types/healthLogs';
import { MedicationOrder } from '../types/pharmacy';
import { Prescription } from '../types/prescriptions';
import ErrorMessage from '../components/ui/ErrorMessage';
// import Spinner from '../components/ui/Spinner';
import Skeleton from '../components/ui/Skeleton';
import { formatDate, formatTime } from '../utils/date';
import toast from 'react-hot-toast';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
};

// Reusable Empty State Component - Poster Style
const EmptyState: React.FC<{
    icon: React.ElementType;
    message: string;
    actionLabel: string;
    actionLink: string;
}> = ({ icon: Icon, message, actionLabel, actionLink }) => (
    <div className="text-center py-12 px-6 bg-white rounded-[2.5rem] border-2 border-primary-900/5 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4 border-2 border-primary-100">
            <Icon className="h-8 w-8 text-primary-900" />
        </div>
        <p className="text-primary-900/70 text-base mb-6 font-medium max-w-xs">{message}</p>
        <Link 
            to={actionLink} 
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-900 text-sm font-bold rounded-xl text-primary-900 hover:bg-primary-900 hover:text-white transition-all uppercase tracking-wider"
        >
            {actionLabel}
        </Link>
    </div>
);

// Quick Action Button - Poster Style
const QuickActionButton: React.FC<{
    icon: React.ElementType;
    label: string;
    href: string;
    colorClass: string; // Changed from color gradient to solid color class
    description: string;
}> = ({ icon: Icon, label, href, colorClass, description }) => (
    <Link
        to={href}
        className="group relative overflow-hidden bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 border-2 border-primary-900/5 hover:border-primary-900 block h-full"
    >
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${colorClass} border-2 border-black/5 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-7 w-7" />
        </div>
        
        <h3 className="font-bold text-primary-900 mb-2 text-xl font-display">{label}</h3>
        <p className="text-sm text-primary-900/60 leading-relaxed mb-8">{description}</p>
        
        <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-900 transition-colors">
            <ArrowRightIcon className="h-5 w-5 text-primary-900 group-hover:text-white transition-colors" />
        </div>
    </Link>
);

// Helper function to determine health status
const getHealthStatus = (value: number | null | undefined, type: 'bp_systolic' | 'bp_diastolic' | 'heart_rate' | 'temperature'): { status: 'normal' | 'warning' | 'critical', label: string, color: string } => {
    if (!value) return { status: 'normal', label: '', color: '' };
    
    switch (type) {
        case 'bp_systolic':
            if (value >= 140) return { status: 'critical', label: 'High', color: 'text-red-600' };
            if (value >= 120) return { status: 'warning', label: 'Elevated', color: 'text-amber-600' };
            return { status: 'normal', label: 'Normal', color: 'text-primary' };
        case 'bp_diastolic':
            if (value >= 90) return { status: 'critical', label: 'High', color: 'text-red-600' };
            if (value >= 80) return { status: 'warning', label: 'Elevated', color: 'text-amber-600' };
            return { status: 'normal', label: 'Normal', color: 'text-primary' };
        case 'heart_rate':
            if (value >= 100 || value < 60) return { status: 'warning', label: value >= 100 ? 'High' : 'Low', color: 'text-amber-600' };
            return { status: 'normal', label: 'Normal', color: 'text-primary' };
        case 'temperature':
            if (value >= 38) return { status: 'critical', label: 'Fever', color: 'text-red-600' };
            if (value >= 37.5) return { status: 'warning', label: 'Elevated', color: 'text-amber-600' };
            return { status: 'normal', label: 'Normal', color: 'text-primary' };
        default:
            return { status: 'normal', label: '', color: '' };
    }
};

// Helper function to calculate trend
const getTrend = (current: number | null | undefined, previous: number | null | undefined): 'up' | 'down' | 'stable' | null => {
    if (!current || !previous) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 2) return 'stable';
    return diff > 0 ? 'up' : 'down';
};

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Check if Flutterwave redirected here with payment callback parameters
    // This MUST run first, before any other effects
    useEffect(() => {
        const tx_ref = searchParams.get('tx_ref');
        const transaction_id = searchParams.get('transaction_id');
        const status = searchParams.get('status');
        
        console.log('Dashboard: Checking for payment callback params', { tx_ref, transaction_id, status, allParams: Object.fromEntries(searchParams.entries()) });
        
        // If payment callback parameters are present, redirect to payment callback page immediately
        // Check for any status that indicates payment (successful, completed, or even just having tx_ref/transaction_id)
        if (tx_ref || transaction_id) {
            console.log('Payment callback detected on dashboard, redirecting to callback page immediately', { tx_ref, transaction_id, status });
            const params = new URLSearchParams();
            if (tx_ref) params.set('tx_ref', tx_ref);
            if (transaction_id) params.set('transaction_id', transaction_id);
            if (status) params.set('status', status);
            // Use replace: true to prevent back button issues and redirect IMMEDIATELY
            // Don't wait for anything else
            window.location.href = `/payment/callback?${params.toString()}`;
            return; // Exit early
        }
    }, [searchParams]); // Remove navigate from dependencies to ensure this runs immediately

    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
    const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(true);
    const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

    const [activeReminders, setActiveReminders] = useState<MedicationReminder[]>([]);
    const [nextReminder, setNextReminder] = useState<MedicationReminder | null>(null);
    const [remindersLoading, setRemindersLoading] = useState<boolean>(true);
    const [remindersError, setRemindersError] = useState<string | null>(null);

    const [recentVitals, setRecentVitals] = useState<VitalSignLog[]>([]);
    const [vitalsLoading, setVitalsLoading] = useState<boolean>(true);
    const [vitalsError, setVitalsError] = useState<string | null>(null);

    const [recentOrders, setRecentOrders] = useState<MedicationOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
    const [prescriptionsLoading, setPrescriptionsLoading] = useState<boolean>(true);
    const [prescriptionsError, setPrescriptionsError] = useState<string | null>(null);

    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [_notificationsLoading, setNotificationsLoading] = useState<boolean>(true);

    // Quick Vital Sign Logging
    const [showQuickVitalModal, setShowQuickVitalModal] = useState<boolean>(false);
    const [isSubmittingVital, setIsSubmittingVital] = useState<boolean>(false);

    const handleQuickVitalSubmit = async (payload: VitalSignPayload) => {
        setIsSubmittingVital(true);
        try {
            await createVitalSign(payload);
            setShowQuickVitalModal(false);
            await fetchDashboardData();
            toast.success('Vitals logged successfully');
        } catch (err) {
            toast.error('Failed to log vitals');
        } finally {
            setIsSubmittingVital(false);
        }
    };

    const fetchDashboardData = useCallback(async () => {
        // Fetch Appointments
        setAppointmentsLoading(true);
        setAppointmentsError(null);
        try {
            const response = await getUserAppointments({ page: 1, ordering: '-date,-start_time' });
            const now = new Date();
            const upcoming = response.results.filter(app => {
                const appDateTime = new Date(`${app.date}T${app.start_time}`);
                return appDateTime >= now && (app.status === 'scheduled' || app.status === 'confirmed');
            });
            
            // Sort by date and time to ensure earliest upcoming appointment is first (for next appointment)
            // But keep the list in reverse order (latest first) for display
            const sortedUpcoming = upcoming.sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.start_time}`).getTime();
                const dateTimeB = new Date(`${b.date}T${b.start_time}`).getTime();
                return dateTimeA - dateTimeB;
            });
            
            // Reverse to show latest first in the list
            const reversedUpcoming = [...sortedUpcoming].reverse();
            
            setUpcomingAppointments(reversedUpcoming);
            if (sortedUpcoming.length > 0) {
                setNextAppointment(sortedUpcoming[0]);
            } else {
                setNextAppointment(null);
            }
        } catch (err) {
            console.error("Failed to fetch appointments for dashboard:", err);
            setAppointmentsError("Could not load appointments.");
        } finally {
            setAppointmentsLoading(false);
        }

        // Fetch Medication Reminders
        setRemindersLoading(true);
        setRemindersError(null);
        try {
            const response = await getMedicationReminders({ page: 1 });
            const active = response.results.filter(rem => rem.is_active);
            const sortedActive = active.sort((a, b) => {
                const timeA = a.time_of_day;
                const timeB = b.time_of_day;
                return timeA.localeCompare(timeB);
            });
            setActiveReminders(sortedActive);
            if (sortedActive.length > 0) {
                setNextReminder(sortedActive[0]);
            }
        } catch (err) {
            console.error("Failed to fetch reminders for dashboard:", err);
            setRemindersError("Could not load reminders.");
        } finally {
            setRemindersLoading(false);
        }

        // Fetch Recent Vital Signs (last 3)
        setVitalsLoading(true);
        setVitalsError(null);
        try {
            const response = await getVitalSigns({ page: 1 });
            // Sort by date_recorded descending (latest first) on client side
            const sorted = [...response.results].sort((a, b) => {
                const dateAStr = a.date_recorded || a.created_at || '';
                const dateBStr = b.date_recorded || b.created_at || '';
                if (!dateAStr && !dateBStr) return 0;
                if (!dateAStr) return 1;
                if (!dateBStr) return -1;
                const dateA = new Date(dateAStr).getTime();
                const dateB = new Date(dateBStr).getTime();
                if (isNaN(dateA) || isNaN(dateB)) return 0;
                return dateB - dateA; // Latest first
            });
            const recent = sorted.slice(0, 3);
            setRecentVitals(recent);
        } catch (err) {
            console.error("Failed to fetch vitals for dashboard:", err);
            setVitalsError("Could not load vitals.");
        } finally {
            setVitalsLoading(false);
        }

        // Fetch Recent Orders (last 5)
        setOrdersLoading(true);
        setOrdersError(null);
        try {
            const response = await getUserOrders({ ordering: '-order_date' });
            const orders = (Array.isArray(response) ? response : response.results) || [];
            // Sort by order_date descending (latest first) as fallback
            // Use order_date only (MedicationOrder doesn't have created_at)
            const sorted = Array.isArray(orders) ? [...orders].sort((a, b) => {
                const dateAStr = a.order_date || '';
                const dateBStr = b.order_date || '';
                if (!dateAStr && !dateBStr) return 0;
                if (!dateAStr) return 1; // Put items without dates at the end
                if (!dateBStr) return -1;
                const dateA = new Date(dateAStr).getTime();
                const dateB = new Date(dateBStr).getTime();
                if (isNaN(dateA) || isNaN(dateB)) return 0;
                return dateB - dateA; // Latest first
            }) : [];
            const recent = sorted.slice(0, 5);
            setRecentOrders(recent);
        } catch (err) {
            console.error("Failed to fetch orders for dashboard:", err);
            setOrdersError("Could not load orders.");
        } finally {
            setOrdersLoading(false);
        }

        // Fetch Recent Prescriptions (last 2)
        setPrescriptionsLoading(true);
        setPrescriptionsError(null);
        try {
            const response = await getUserPrescriptions({ page: 1, ordering: '-date_prescribed' });
            // Sort by date_prescribed descending (latest first) as fallback
            // Use date_prescribed first, then created_at as fallback
            const sorted = [...response.results].sort((a, b) => {
                const dateAStr = a.date_prescribed || a.created_at || '';
                const dateBStr = b.date_prescribed || b.created_at || '';
                if (!dateAStr && !dateBStr) return 0;
                if (!dateAStr) return 1; // Put items without dates at the end
                if (!dateBStr) return -1;
                const dateA = new Date(dateAStr).getTime();
                const dateB = new Date(dateBStr).getTime();
                if (isNaN(dateA) || isNaN(dateB)) return 0;
                return dateB - dateA; // Latest first
            });
            const recent = sorted.slice(0, 2);
            setRecentPrescriptions(recent);
        } catch (err) {
            console.error("Failed to fetch prescriptions for dashboard:", err);
            setPrescriptionsError("Could not load prescriptions.");
        } finally {
            setPrescriptionsLoading(false);
        }

        // Fetch Unread Notifications Count
        setNotificationsLoading(true);
        try {
            const countData = await getUnreadNotificationCount();
            setUnreadCount(countData.unread_count || 0);
        } catch (err) {
            console.error("Failed to fetch notification count:", err);
            setUnreadCount(0);
        } finally {
            setNotificationsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user, fetchDashboardData]);

    const healthSections = [
        { 
            name: t('healthSections.vitals.name', 'Log Vitals'), 
            path: '/health/vitals', 
            icon: HeartIcon, 
            description: t('healthSections.vitals.description', "Track your BP & heart rate."),
            colorClass: 'bg-rose-100 text-rose-700'
        },
        { 
            name: t('healthSections.food.name', 'Nutrition'), 
            path: '/health/food', 
            icon: ShoppingBagIcon, 
            description: t('healthSections.food.description', "Keep a journal of your meals."),
            colorClass: 'bg-emerald-100 text-emerald-700'
        },
        { 
            name: t('healthSections.exercise.name', 'Exercise'), 
            path: '/health/exercise', 
            icon: FireIcon, 
            description: t('healthSections.exercise.description', "Monitor physical activity."),
            colorClass: 'bg-blue-100 text-blue-700'
        },
        { 
            name: t('healthSections.sleep.name', 'Sleep'), 
            path: '/health/sleep', 
            icon: MoonIcon, 
            description: t('healthSections.sleep.description', "Track your sleep quality."),
            colorClass: 'bg-violet-100 text-violet-700'
        },
    ];

    const quickActions = [
        {
            icon: PlusIcon,
            label: 'Book Appointment',
            href: '/doctors',
            colorClass: 'bg-blue-100 text-blue-700',
            description: 'Find and schedule with a doctor'
        },
        {
            icon: ShoppingBagIcon,
            label: 'Pharmacy',
            href: '/pharmacies',
            colorClass: 'bg-emerald-100 text-emerald-700',
            description: 'Order refills & find locations'
        },
        {
            icon: ShieldCheckIcon,
            label: 'Insurance',
            href: '/insurance',
            colorClass: 'bg-teal-100 text-teal-700',
            description: 'Manage plans & claims'
        },
        {
            icon: ShieldExclamationIcon,
            label: 'Emergency',
            href: '/emergency',
            colorClass: 'bg-rose-100 text-rose-700',
            description: 'Contacts & SOS features'
        },
        {
            icon: BellAlertIcon,
            label: 'Reminders',
            href: '/medication-reminders',
            colorClass: 'bg-amber-100 text-amber-700',
            description: 'Manage your daily schedule'
        },
        {
            icon: SparklesIcon,
            label: 'Premium Features',
            href: '/premium-hub',
            colorClass: 'bg-purple-100 text-purple-700',
            description: 'Access all premium features'
        },
    ];

    const getAppointmentStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
            case 'scheduled':
                return <ClockIcon className="h-5 w-5 text-blue-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Morning';
        if (hour < 18) return 'Afternoon';
        return 'Evening';
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-12">
            {/* Hero Header Section - Poster Style */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-primary-900 overflow-hidden mb-12 rounded-b-[3rem] mx-2 pt-8"
            >
                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 pb-24">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex-1 min-w-0"
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-3 mb-6"
                            >
                                <span className="px-5 py-2 rounded-full bg-white text-primary-900 border border-primary-800 text-xs font-bold uppercase tracking-widest shadow-lg">
                                    <SparklesIcon className="h-4 w-4 inline mr-2 text-accent" />
                                    Your Health Hub
                                </span>
                                <span className="text-sm text-white/60 font-medium font-mono">{formatDate(new Date().toISOString())}</span>
                            </motion.div>
                            
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-white mb-6 leading-tight">
                                Good {getGreeting()},{' '}
                                <span className="text-accent relative">
                                    {user?.first_name || 'User'}
                                </span>
                            </h1>
                            
                            <p className="text-lg md:text-xl text-white/80 max-w-2xl font-light">
                                {t('welcomeMessage', "Overview update:")}{' '}
                                <span className="text-white font-medium border-b border-white/30">{upcomingAppointments.length} appointments</span>{' '}
                                {t('and')}{' '}
                                <span className="text-white font-medium border-b border-white/30">{activeReminders.length} reminders</span>.
                            </p>
                        </motion.div>
                        
                        {/* Notification Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex-shrink-0 self-start md:self-center"
                        >
                            <Link to="/notifications" className="relative group block">
                                <motion.div 
                                    whileHover={{ rotate: 5 }}
                                    className="p-5 bg-accent text-white rounded-2xl hover:bg-accent-hover transition-colors shadow-xl border-4 border-white/10"
                                >
                                    <BellAlertIcon className="h-8 w-8" />
                                    {unreadCount > 0 && (
                                        <div className="absolute -top-2 -right-2 flex items-center justify-center h-8 w-8 rounded-full bg-white text-primary-900 text-sm font-black border-4 border-primary-900">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </div>
                                    )}
                                </motion.div>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div 
                className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12 -mt-16 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Quick Actions - Sticker Style */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-4 mb-8 pl-2">
                        <div className="w-3 h-12 bg-accent rounded-full"></div>
                        <div>
                            <h2 className="text-3xl font-display font-bold text-primary-900">Quick Actions</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {quickActions.filter(action => 
                            // Remove reminders from quick actions since it's in main content
                            action.label !== 'Reminders'
                        ).map((action, index) => (
                            <motion.div
                                key={action.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                            >
                                <QuickActionButton {...action} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {/* Left Column - Appointments & Vitals */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
                        {/* Upcoming Appointments */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border-2 border-primary-900/5">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-display font-bold text-primary-900 flex items-center">
                                    <CalendarDaysIcon className="h-8 w-8 text-primary-900 mr-3" />
                                    <span>Appointments</span>
                                </h2>
                                <Link 
                                    to="/appointments" 
                                    className="px-4 py-2 bg-primary-50 text-primary-900 rounded-lg text-sm font-bold hover:bg-primary-900 hover:text-white transition-colors"
                                >
                                    View All
                                </Link>
                            </div>
                            
                            {appointmentsLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-32 w-full rounded-3xl" />
                                    <Skeleton className="h-24 w-full rounded-3xl" />
                                </div>
                            ) : appointmentsError ? (
                                <ErrorMessage message={appointmentsError} onRetry={fetchDashboardData} />
                            ) : upcomingAppointments.length > 0 && nextAppointment ? (
                                <div className="space-y-6">
                                    <Link to={`/appointments/${nextAppointment.id}`} className="block">
                                        <motion.div 
                                            whileHover={{ scale: 1.01 }}
                                            className="bg-primary-900 text-white rounded-[2rem] p-8 relative overflow-hidden group"
                                        >
                                            {/* Abstract Geometric Decoration */}
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10 pointer-events-none"></div>
                                            
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <span className="inline-block px-3 py-1 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-md mb-3">Up Next</span>
                                                        <h3 className="text-3xl font-display font-bold text-white mb-1">Dr. {nextAppointment.doctor}</h3>
                                                        <p className="text-white/70 text-lg">{nextAppointment.specialty || 'General Practice'}</p>
                                                    </div>
                                                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                                                        {getAppointmentStatusIcon(nextAppointment.status)}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                                                        <CalendarDaysIcon className="h-5 w-5 mr-3 text-accent" />
                                                        <span className="font-bold text-lg">{formatDate(nextAppointment.date)}</span>
                                                    </div>
                                                    <div className="flex items-center bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                                                        <ClockIcon className="h-5 w-5 mr-3 text-accent" />
                                                        <span className="font-bold text-lg">{formatTime(nextAppointment.start_time)}</span>
                                                    </div>
                                                </div>

                                                {nextAppointment.appointment_type === 'virtual' && (
                                                    <div className="mt-4 inline-flex items-center px-3 py-1 bg-white/10 rounded-lg text-sm text-white/90">
                                                        <SparklesIcon className="h-4 w-4 mr-2" />
                                                        Virtual Consultation
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </Link>
                                    
                                    {upcomingAppointments.length > 1 && (
                                        <div className="space-y-3">
                                            {upcomingAppointments.slice(1, 4).map(apt => (
                                                <Link key={apt.id} to={`/appointments/${apt.id}`}>
                                                    <motion.div 
                                                        whileHover={{ x: 4 }}
                                                        className="flex justify-between items-center group hover:bg-primary-50 p-4 rounded-2xl transition-colors border-l-4 border-transparent hover:border-primary-900"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-primary-900 text-lg mb-1">Dr. {apt.doctor}</p>
                                                            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                                                <span>{formatDate(apt.date)}</span>
                                                                <span>•</span>
                                                                <span>{formatTime(apt.start_time)}</span>
                                                            </div>
                                                        </div>
                                                        <ArrowRightIcon className="h-5 w-5 text-gray-300 group-hover:text-primary-900 transition-colors" />
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={CalendarDaysIcon}
                                    message="No upcoming appointments."
                                    actionLabel="Book Now"
                                    actionLink="/doctors"
                                />
                            )}
                        </div>

                        {/* Vital Signs */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border-2 border-primary-900/5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                                <h2 className="text-2xl font-bold text-primary-900 flex items-center font-display">
                                    <HeartIcon className="h-8 w-8 text-primary-900 mr-3" />
                                    <span>Recent Vitals</span>
                                </h2>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowQuickVitalModal(true)}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold shadow-md hover:bg-accent-hover active:scale-95 transition-all"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Log
                                    </button>
                                    <Link 
                                        to="/health/vitals" 
                                        className="text-sm font-bold text-primary-900 bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-900 hover:text-white transition-colors"
                                    >
                                        History
                                    </Link>
                                </div>
                            </div>
                            
                            {vitalsLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Skeleton className="h-32 rounded-3xl" />
                                    <Skeleton className="h-32 rounded-3xl" />
                                    <Skeleton className="h-32 rounded-3xl" />
                                </div>
                            ) : vitalsError ? (
                                <ErrorMessage message={vitalsError} onRetry={fetchDashboardData} />
                            ) : recentVitals.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {recentVitals.map((vital, index) => {
                                        const previousVital = index < recentVitals.length - 1 ? recentVitals[index + 1] : null;
                                        const bpStatus = getHealthStatus(vital.systolic_pressure, 'bp_systolic');
                                        const hrStatus = getHealthStatus(vital.heart_rate, 'heart_rate');
                                        const bpTrend = getTrend(vital.systolic_pressure, previousVital?.systolic_pressure);
                                        const hrTrend = getTrend(vital.heart_rate, previousVital?.heart_rate);
                                        
                                        return (
                                            <motion.div 
                                                key={vital.id}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                className={`flex flex-col p-5 rounded-[2rem] transition-all cursor-pointer border-2 ${
                                                    index === 0 
                                                        ? 'bg-rose-50 border-rose-200' 
                                                        : 'bg-gray-50 border-gray-100 hover:border-primary-100'
                                                }`}
                                                onClick={() => navigate('/health/vitals')}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                        index === 0 ? 'bg-rose-100 text-rose-600' : 'bg-white text-gray-400'
                                                    }`}>
                                                        <HeartIcon className="h-5 w-5" />
                                                    </div>
                                                    {index === 0 && (
                                                        <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-1 rounded-lg uppercase tracking-wider">Latest</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
                                                    {formatDate(vital.date_recorded.split('T')[0])}
                                                </p>
                                                <div className="space-y-3">
                                                    {vital.systolic_pressure && vital.diastolic_pressure && (
                                                        <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg">
                                                            <div>
                                                                <span className="text-lg font-black text-primary-900">{vital.systolic_pressure}/{vital.diastolic_pressure}</span>
                                                                <span className="text-[10px] text-gray-400 ml-1">mmHg</span>
                                                            </div>
                                                            {bpStatus.status !== 'normal' && (
                                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {vital.heart_rate && (
                                                        <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg">
                                                            <div>
                                                                <span className="text-lg font-black text-primary-900">{vital.heart_rate}</span>
                                                                <span className="text-[10px] text-gray-400 ml-1">bpm</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={HeartIcon}
                                    message="Start tracking your health."
                                    actionLabel="Log Vitals"
                                    actionLink="/health/vitals"
                                />
                            )}
                        </div>

                        {/* Recent Orders Section */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border-2 border-primary-900/5">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-primary-900 flex items-center font-display">
                                    <CubeIcon className="h-8 w-8 text-primary-900 mr-3" />
                                    <span>Recent Orders</span>
                                </h2>
                                <Link 
                                    to="/orders" 
                                    className="px-4 py-2 bg-primary-50 text-primary-900 rounded-lg text-sm font-bold hover:bg-primary-900 hover:text-white transition-colors"
                                >
                                    View All
                                </Link>
                            </div>

                            {ordersLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-20 rounded-2xl" />
                                    ))}
                                </div>
                            ) : ordersError ? (
                                <ErrorMessage message={ordersError} />
                            ) : recentOrders.length === 0 ? (
                                <EmptyState
                                    icon={CubeIcon}
                                    message="No orders yet."
                                    actionLabel="View Prescriptions"
                                    actionLink="/prescriptions"
                                />
                            ) : (
                                <div className="space-y-3">
                                    {recentOrders.map((order) => {
                                        const getStatusInfo = (status: string) => {
                                            switch (status) {
                                                case 'pending':
                                                    return { 
                                                        color: 'bg-orange-50 text-orange-900 border-orange-200', 
                                                        icon: ClockIcon,
                                                        label: 'Pending'
                                                    };
                                                case 'processing':
                                                    return { 
                                                        color: 'bg-amber-50 text-amber-900 border-amber-200', 
                                                        icon: ClockIcon,
                                                        label: 'Processing'
                                                    };
                                                case 'ready':
                                                    return { 
                                                        color: 'bg-blue-50 text-blue-900 border-blue-200', 
                                                        icon: CubeIcon,
                                                        label: 'Ready'
                                                    };
                                                case 'delivering':
                                                    return { 
                                                        color: 'bg-purple-50 text-purple-900 border-purple-200', 
                                                        icon: TruckIcon,
                                                        label: 'Delivering'
                                                    };
                                                case 'completed':
                                                    return { 
                                                        color: 'bg-emerald-50 text-emerald-900 border-emerald-200', 
                                                        icon: CheckCircleIcon,
                                                        label: 'Completed'
                                                    };
                                                case 'cancelled':
                                                    return { 
                                                        color: 'bg-red-50 text-red-900 border-red-200', 
                                                        icon: ExclamationCircleIcon,
                                                        label: 'Cancelled'
                                                    };
                                                default:
                                                    return { 
                                                        color: 'bg-gray-50 text-gray-900 border-gray-200', 
                                                        icon: ClockIcon,
                                                        label: status
                                                    };
                                            }
                                        };

                                        const statusInfo = getStatusInfo(order.status);
                                        const StatusIcon = statusInfo.icon;

                                        return (
                                            <motion.div
                                                key={order.id}
                                                whileHover={{ x: 4 }}
                                                className="group flex items-center justify-between p-5 rounded-2xl bg-white border-2 border-primary-900/5 hover:border-primary-900 hover:shadow-sm transition-all cursor-pointer"
                                                onClick={() => navigate('/orders')}
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={`p-3 rounded-xl ${statusInfo.color} border-2 flex-shrink-0`}>
                                                        <StatusIcon className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                            <h3 className="font-bold text-primary-900 text-base">
                                                                Order #{order.id}
                                                            </h3>
                                                            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${statusInfo.color} border uppercase tracking-wider`}>
                                                                {statusInfo.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium flex-wrap">
                                                            {order.pharmacy_details && (
                                                                <span className="truncate max-w-[150px]">
                                                                    {order.pharmacy_details.name}
                                                                </span>
                                                            )}
                                                            {order.total_amount && (
                                                                <span className="text-primary-900 font-bold bg-primary-50 px-2 py-0.5 rounded">
                                                                    ₦{parseFloat(order.total_amount).toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRightIcon className="h-5 w-5 text-gray-300 group-hover:text-primary-900 transition-colors flex-shrink-0 ml-2" />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column - Prescriptions, Medications & Health Logs */}
                    <motion.div variants={itemVariants} className="space-y-6 md:space-y-8">
                        {/* Prescriptions */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border-2 border-primary-900/5">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-primary-900 flex items-center font-display">
                                    <DocumentTextIcon className="h-7 w-7 text-primary-900 mr-2" />
                                    <span>Prescriptions</span>
                                </h2>
                                <Link 
                                    to="/prescriptions" 
                                    className="text-sm font-bold text-primary-900 underline decoration-2 underline-offset-4 hover:text-accent transition-colors"
                                >
                                    All Scripts
                                </Link>
                            </div>
                            
                            {prescriptionsLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full rounded-2xl" />
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                </div>
                            ) : prescriptionsError ? (
                                <ErrorMessage message={prescriptionsError} onRetry={fetchDashboardData} />
                            ) : recentPrescriptions.length > 0 ? (
                                <div className="space-y-3">
                                    {recentPrescriptions.map((prescription, index) => (
                                        <Link key={prescription.id} to={`/prescriptions`}>
                                            <motion.div 
                                                whileHover={{ scale: 1.01, x: 4 }}
                                                className={`relative rounded-[1.5rem] p-5 border-2 transition-all cursor-pointer group ${
                                                    index === 0 
                                                        ? 'bg-primary-900 text-white border-primary-900' 
                                                        : 'bg-gray-50 border-gray-100 hover:border-primary-900'
                                                }`}
                                            >
                                                {index === 0 && (
                                                    <div className="absolute right-0 bottom-0 opacity-10">
                                                        <DocumentTextIcon className="h-24 w-24 -mr-6 -mb-6 text-white" />
                                                    </div>
                                                )}
                                                <div className="relative z-10">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            {index === 0 && (
                                                                <p className="text-accent text-xs font-bold uppercase mb-2 tracking-wider">Latest</p>
                                                            )}
                                                            <h3 className={`text-lg font-bold mb-1 font-display ${index === 0 ? 'text-white' : 'text-primary-900'}`}>
                                                                {prescription.diagnosis || 'Prescription'}
                                                            </h3>
                                                            {prescription.items && prescription.items.length > 0 && (
                                                                <p className={`text-sm mb-2 ${index === 0 ? 'text-white/70' : 'text-gray-500'}`}>
                                                                    {prescription.items.length} {prescription.items.length === 1 ? 'medication' : 'medications'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {index === 0 && (
                                                            <div className="bg-white/10 p-2 rounded-xl">
                                                                <DocumentTextIcon className="h-5 w-5 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`flex items-center text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg w-fit ${
                                                        index === 0 ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                                        {formatDate(prescription.date_prescribed)}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={DocumentTextIcon}
                                    message="No prescriptions yet."
                                    actionLabel="View Prescriptions"
                                    actionLink="/prescriptions"
                                />
                            )}
                        </div>

                        {/* Medication Reminders */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border-2 border-primary-900/5">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-primary-900 flex items-center font-display">
                                    <BellAlertIcon className="h-7 w-7 text-primary-900 mr-2" />
                                    <span>Medications</span>
                                </h2>
                                <Link 
                                    to="/medication-reminders" 
                                    className="text-sm font-bold text-primary-900 underline decoration-2 underline-offset-4 hover:text-accent transition-colors"
                                >
                                    All Reminders
                                </Link>
                            </div>
                            
                            {remindersLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full rounded-2xl" />
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                </div>
                            ) : remindersError ? (
                                <ErrorMessage message={remindersError} onRetry={fetchDashboardData} />
                            ) : activeReminders.length > 0 && nextReminder ? (
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    className="relative bg-amber-50 rounded-[2rem] p-6 border-2 border-amber-200 overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <p className="text-amber-700 text-xs font-black uppercase mb-3 tracking-widest border-b-2 border-amber-200 inline-block pb-1">Next Dose</p>
                                        <h3 className="text-2xl font-bold text-primary-900 mb-3 font-display">{nextReminder.medication_display.name}</h3>
                                        <div className="flex items-center text-amber-900 font-bold mb-4 bg-white px-4 py-2 rounded-xl w-fit shadow-sm border border-amber-100">
                                            <ClockIcon className="h-5 w-5 mr-2 text-amber-600" />
                                            {formatTime(nextReminder.time_of_day)}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-amber-800/80 font-medium pt-3 border-t-2 border-amber-200/50">
                                            <span className="bg-amber-100 px-2 py-0.5 rounded-md">{nextReminder.dosage}</span>
                                            <span className="text-amber-400">•</span>
                                            <span>{nextReminder.frequency}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <EmptyState
                                    icon={BellAlertIcon}
                                    message="No active reminders."
                                    actionLabel="Add Medication"
                                    actionLink="/medication-reminders"
                                />
                            )}
                        </div>

                        {/* Health Log Shortcuts */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border-2 border-primary-900/5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-8">
                                <h2 className="text-xl font-bold text-primary-900 flex items-center font-display">
                                    <PlusIcon className="h-6 w-6 text-primary-900 mr-2" />
                                    Log Health Data
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {healthSections.filter(section => section.path !== '/health/vitals').map((section) => (
                                    <Link
                                        key={section.path}
                                        to={section.path}
                                        className="flex items-center p-4 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all group border-2 border-transparent hover:border-gray-200 touch-manipulation"
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${section.colorClass} flex items-center justify-center border-2 border-black/5 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                            <section.icon className="h-6 w-6" />
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                            <h4 className="text-base font-bold text-primary-900 font-display">{section.name}</h4>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{section.description}</p>
                                        </div>
                                        <ArrowRightIcon className="h-5 w-5 text-gray-300 group-hover:text-primary-900 transition-colors flex-shrink-0 ml-2" />
                                    </Link>
                                ))}
                            </div>
                            {/* Quick Action Button */}
                            <div className="mt-8 pt-6 border-t-2 border-gray-100">
                                <Link
                                    to="/health/vitals"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl bg-primary-900 text-white text-sm font-bold shadow-lg hover:bg-primary-800 transition-all uppercase tracking-wider"
                                >
                                    <HeartIcon className="h-5 w-5" />
                                    <span>Log Vital Signs</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Quick Vital Sign Log Modal */}
            <Modal 
                isOpen={showQuickVitalModal} 
                onClose={() => setShowQuickVitalModal(false)} 
                title="Quick Log Vital Signs"
            >
                <VitalSignForm
                    initialData={null}
                    onSubmit={handleQuickVitalSubmit}
                    onCancel={() => setShowQuickVitalModal(false)}
                    isSubmitting={isSubmittingVital}
                />
            </Modal>
        </div>
    );
};

export default DashboardPage;
