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

// Reusable Empty State Component
const EmptyState: React.FC<{
    icon: React.ElementType;
    message: string;
    actionLabel: string;
    actionLink: string;
}> = ({ icon: Icon, message, actionLabel, actionLink }) => (
    <div className="text-center py-8 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
            <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm mb-4 font-medium">{message}</p>
        <Link 
            to={actionLink} 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
        >
            {actionLabel}
        </Link>
    </div>
);

// Quick Action Button
const QuickActionButton: React.FC<{
    icon: React.ElementType;
    label: string;
    href: string;
    color: string;
    description: string;
}> = ({ icon: Icon, label, href, color, description }) => (
    <Link
        to={href}
        className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary/20"
    >
        <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full group-hover:opacity-20 transition-opacity`}></div>
        
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        
        <h3 className="font-bold text-gray-900 mb-1.5 text-lg group-hover:text-primary transition-colors font-display">{label}</h3>
        <p className="text-sm text-gray-500 relative z-10 leading-relaxed">{description}</p>
        
        <ArrowRightIcon className="absolute bottom-4 right-4 h-5 w-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
            gradient: 'from-rose-500 to-red-600'
        },
        { 
            name: t('healthSections.food.name', 'Nutrition'), 
            path: '/health/food', 
            icon: ShoppingBagIcon, 
            description: t('healthSections.food.description', "Keep a journal of your meals."),
            gradient: 'from-emerald-500 to-green-600'
        },
        { 
            name: t('healthSections.exercise.name', 'Exercise'), 
            path: '/health/exercise', 
            icon: FireIcon, 
            description: t('healthSections.exercise.description', "Monitor physical activity."),
            gradient: 'from-blue-500 to-indigo-600'
        },
        { 
            name: t('healthSections.sleep.name', 'Sleep'), 
            path: '/health/sleep', 
            icon: MoonIcon, 
            description: t('healthSections.sleep.description', "Track your sleep quality."),
            gradient: 'from-violet-500 to-purple-600'
        },
    ];

    const quickActions = [
        {
            icon: PlusIcon,
            label: 'Book Appointment',
            href: '/doctors',
            color: 'from-blue-500 to-cyan-500',
            description: 'Find and schedule with a doctor'
        },
        {
            icon: ShoppingBagIcon,
            label: 'Pharmacy',
            href: '/pharmacies',
            color: 'from-emerald-500 to-teal-500',
            description: 'Order refills & find locations'
        },
        {
            icon: ShieldCheckIcon,
            label: 'Insurance',
            href: '/insurance',
            color: 'from-teal-500 to-primary-500',
            description: 'Manage plans & claims'
        },
        {
            icon: ShieldExclamationIcon,
            label: 'Emergency',
            href: '/emergency',
            color: 'from-rose-500 to-red-600',
            description: 'Contacts & SOS features'
        },
        {
            icon: BellAlertIcon,
            label: 'Reminders',
            href: '/medication-reminders',
            color: 'from-amber-500 to-orange-500',
            description: 'Manage your daily schedule'
        },
        {
            icon: SparklesIcon,
            label: 'Premium Features',
            href: '/premium-hub',
            color: 'from-purple-500 to-indigo-600',
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 overflow-hidden mb-8"
            >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-10 md:py-14">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
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
                                className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap"
                            >
                                <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold uppercase tracking-wider text-white">
                                    <SparklesIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-1.5 sm:mr-2" />
                                    <span className="hidden sm:inline">Dashboard Overview</span>
                                    <span className="sm:hidden">Dashboard</span>
                                </span>
                                <span className="text-xs sm:text-sm text-white/80 font-medium">{formatDate(new Date().toISOString())}</span>
                            </motion.div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-white tracking-tight font-display">
                                Good {getGreeting()},{' '}
                                <span className="relative inline-block">
                                    <span className="relative z-10">{user?.first_name || 'User'}</span>
                                    <motion.span 
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.5, duration: 0.6 }}
                                        className="absolute bottom-2 left-0 right-0 h-3 bg-yellow-400/30 -z-0"
                                    ></motion.span>
                                </span>
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                                {t('welcomeMessage', "Your health dashboard is updated. You have")}{' '}
                                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded text-xs sm:text-sm">{upcomingAppointments.length} upcoming appointments</span>{' '}
                                {t('and')}{' '}
                                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded text-xs sm:text-sm">{activeReminders.length} active reminders</span>.
                            </p>
                        </motion.div>
                        
                        {/* Notification Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex-shrink-0"
                        >
                            <Link to="/notifications" className="relative group">
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all shadow-lg"
                                >
                                    <BellAlertIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                    {unreadCount > 0 && (
                                        <motion.span 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-red-500 text-white text-xs font-bold ring-2 sm:ring-4 ring-primary animate-pulse"
                                        >
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </motion.span>
                                    )}
                                </motion.div>
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
                    </svg>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div 
                className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 space-y-6 sm:space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Quick Actions - Streamlined */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-primary to-teal-600 rounded-xl sm:rounded-2xl shadow-lg">
                            <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 font-display">Quick Actions</h2>
                            <p className="text-gray-600 text-xs sm:text-sm">Access key features instantly</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 p-4 sm:p-6 md:p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center font-display">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-2 sm:mr-3 shadow-lg shadow-primary/10">
                                        <CalendarDaysIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                    <span>Appointments</span>
                                </h2>
                                <Link 
                                    to="/appointments" 
                                    className="text-xs sm:text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                                >
                                    <span className="hidden sm:inline">View All</span>
                                    <span className="sm:hidden">All</span>
                                    <ArrowRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Link>
                            </div>
                            
                            {appointmentsLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-28 w-full rounded-2xl" />
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                </div>
                            ) : appointmentsError ? (
                                <ErrorMessage message={appointmentsError} onRetry={fetchDashboardData} />
                            ) : upcomingAppointments.length > 0 && nextAppointment ? (
                                <div className="space-y-4">
                                    <Link to={`/appointments/${nextAppointment.id}`}>
                                        <motion.div 
                                            whileHover={{ scale: 1.01 }}
                                            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100 relative overflow-hidden cursor-pointer group"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-30 blur-2xl"></div>
                                            
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1">
                                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 inline-block">Up Next</span>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1 font-display">Dr. {nextAppointment.doctor}</h3>
                                                        <p className="text-blue-600/80 text-sm font-medium">{nextAppointment.specialty || 'General Practice'}</p>
                                                    </div>
                                                    <div className="bg-white p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                                        {getAppointmentStatusIcon(nextAppointment.status)}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                                    <div className="flex items-center bg-white/60 px-3 py-1.5 rounded-lg">
                                                        <CalendarDaysIcon className="h-4 w-4 mr-2 text-blue-500" />
                                                        <span className="font-medium">{formatDate(nextAppointment.date)}</span>
                                                    </div>
                                                    <div className="flex items-center bg-white/60 px-3 py-1.5 rounded-lg">
                                                        <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                                                        <span className="font-medium">{formatTime(nextAppointment.start_time)}</span>
                                                    </div>
                                                </div>

                                                {nextAppointment.appointment_type === 'virtual' && (
                                                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
                                                        <SparklesIcon className="h-3 w-3 mr-1.5" />
                                                        Virtual Consultation
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </Link>
                                    
                                    {upcomingAppointments.length > 1 && (
                                        <div className="space-y-2">
                                            {upcomingAppointments.slice(1, 4).map(apt => (
                                                <Link key={apt.id} to={`/appointments/${apt.id}`}>
                                                    <motion.div 
                                                        whileHover={{ x: 4 }}
                                                        className="flex justify-between items-center group hover:bg-gray-50 p-3 rounded-xl transition-colors border border-gray-100"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-800 text-sm mb-1">Dr. {apt.doctor}</p>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                <span>{formatDate(apt.date)}</span>
                                                                <span>•</span>
                                                                <span>{formatTime(apt.start_time)}</span>
                                                            </div>
                                                        </div>
                                                        <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={CalendarDaysIcon}
                                    message="No upcoming appointments scheduled."
                                    actionLabel="Book Appointment"
                                    actionLink="/doctors"
                                />
                            )}
                        </div>

                        {/* Vital Signs */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 p-4 sm:p-6 md:p-8 border border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center font-display">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mr-2 sm:mr-3 shadow-lg shadow-primary/10">
                                        <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                    <span>Recent Vitals</span>
                                </h2>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                        onClick={() => setShowQuickVitalModal(true)}
                                        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg active:scale-95 sm:hover:scale-105 transition-all duration-200 touch-manipulation"
                                    >
                                        <PlusIcon className="h-4 w-4 flex-shrink-0" />
                                        <span className="hidden sm:inline">Quick Log</span>
                                        <span className="sm:hidden">Log</span>
                                    </button>
                                    <Link 
                                        to="/health/vitals" 
                                        className="text-xs sm:text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 px-2 sm:px-0"
                                    >
                                        <span className="hidden sm:inline">View All</span>
                                        <span className="sm:hidden">All</span>
                                        <ArrowRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Link>
                                </div>
                            </div>
                            
                            {vitalsLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                    <Skeleton className="h-32 sm:h-28 rounded-2xl" />
                                    <Skeleton className="h-32 sm:h-28 rounded-2xl" />
                                    <Skeleton className="h-32 sm:h-28 rounded-2xl" />
                                </div>
                            ) : vitalsError ? (
                                <ErrorMessage message={vitalsError} onRetry={fetchDashboardData} />
                            ) : recentVitals.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex flex-col p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all cursor-pointer touch-manipulation ${
                                                    index === 0 
                                                        ? 'bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-200 shadow-sm' 
                                                        : 'bg-gray-50 border border-gray-200 hover:border-gray-300 active:bg-gray-100'
                                                }`}
                                                onClick={() => navigate('/health/vitals')}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                        index === 0 ? 'bg-rose-100 text-rose-600' : 'bg-white text-gray-400'
                                                    }`}>
                                                        <HeartIcon className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {index === 0 && (
                                                            <span className="text-xs font-bold text-rose-600 bg-white px-2 py-1 rounded-md shadow-sm">Latest</span>
                                                        )}
                                                        {(bpStatus.status === 'critical' || hrStatus.status === 'critical') && index === 0 && (
                                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
                                                    {formatDate(vital.date_recorded.split('T')[0])}
                                                </p>
                                                <div className="space-y-2">
                                                    {vital.systolic_pressure && vital.diastolic_pressure && (
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-lg font-bold text-gray-900">{vital.systolic_pressure}/{vital.diastolic_pressure}</span>
                                                                <span className="text-xs font-normal text-gray-500 ml-1">mmHg</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {bpTrend && (
                                                                    bpTrend === 'up' ? (
                                                                        <ArrowTrendingUpIcon className={`h-4 w-4 ${bpStatus.status === 'critical' ? 'text-red-600' : bpStatus.status === 'warning' ? 'text-amber-600' : 'text-primary'}`} />
                                                                    ) : bpTrend === 'down' ? (
                                                                        <ArrowTrendingDownIcon className={`h-4 w-4 ${bpStatus.status === 'normal' ? 'text-primary' : 'text-amber-600'}`} />
                                                                    ) : null
                                                                )}
                                                                {bpStatus.status !== 'normal' && (
                                                                    <span className={`text-xs font-bold ${bpStatus.color}`}>{bpStatus.label}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {vital.heart_rate && (
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-lg font-bold text-gray-900">{vital.heart_rate}</span>
                                                                <span className="text-xs font-normal text-gray-500 ml-1">bpm</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {hrTrend && (
                                                                    hrTrend === 'up' ? (
                                                                        <ArrowTrendingUpIcon className={`h-4 w-4 ${hrStatus.status === 'warning' ? 'text-amber-600' : 'text-primary'}`} />
                                                                    ) : hrTrend === 'down' ? (
                                                                        <ArrowTrendingDownIcon className={`h-4 w-4 ${hrStatus.status === 'normal' ? 'text-primary' : 'text-amber-600'}`} />
                                                                    ) : null
                                                                )}
                                                                {hrStatus.status !== 'normal' && (
                                                                    <span className={`text-xs font-bold ${hrStatus.color}`}>{hrStatus.label}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {vital.temperature && (
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-sm font-bold text-gray-900">{vital.temperature.toFixed(1)}°C</span>
                                                            </div>
                                                            {getHealthStatus(vital.temperature, 'temperature').status !== 'normal' && (
                                                                <span className={`text-xs font-bold ${getHealthStatus(vital.temperature, 'temperature').color}`}>
                                                                    {getHealthStatus(vital.temperature, 'temperature').label}
                                                                </span>
                                                            )}
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
                                    message="Start tracking your health today."
                                    actionLabel="Log First Entry"
                                    actionLink="/health/vitals"
                                />
                            )}
                        </div>

                        {/* Recent Orders Section - Moved to main content area */}
                        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 p-6 md:p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center font-display">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg shadow-primary/10">
                                        <CubeIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <span>Recent Orders</span>
                                </h2>
                                <Link 
                                    to="/orders" 
                                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                                >
                                    View All
                                    <ArrowRightIcon className="h-4 w-4" />
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
                                    message="No orders yet. Forward a prescription to a pharmacy to create an order."
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
                                                        color: 'bg-orange-100 text-orange-800 border-orange-200', 
                                                        icon: ClockIcon,
                                                        label: 'Pending'
                                                    };
                                                case 'processing':
                                                    return { 
                                                        color: 'bg-amber-100 text-amber-800 border-amber-200', 
                                                        icon: ClockIcon,
                                                        label: 'Processing'
                                                    };
                                                case 'ready':
                                                    return { 
                                                        color: 'bg-blue-100 text-blue-800 border-blue-200', 
                                                        icon: CubeIcon,
                                                        label: 'Ready'
                                                    };
                                                case 'delivering':
                                                    return { 
                                                        color: 'bg-purple-100 text-purple-800 border-purple-200', 
                                                        icon: TruckIcon,
                                                        label: 'Delivering'
                                                    };
                                                case 'completed':
                                                    return { 
                                                        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
                                                        icon: CheckCircleIcon,
                                                        label: 'Completed'
                                                    };
                                                case 'cancelled':
                                                    return { 
                                                        color: 'bg-red-100 text-red-800 border-red-200', 
                                                        icon: ExclamationCircleIcon,
                                                        label: 'Cancelled'
                                                    };
                                                default:
                                                    return { 
                                                        color: 'bg-gray-100 text-gray-800 border-gray-200', 
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
                                                className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer"
                                                onClick={() => navigate('/orders')}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={`p-2.5 rounded-lg ${statusInfo.color} border-2 flex-shrink-0`}>
                                                        <StatusIcon className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <h3 className="font-bold text-gray-900 text-sm">
                                                                Order #{order.id}
                                                            </h3>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusInfo.color} border`}>
                                                                {statusInfo.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                                                            {order.pharmacy_details && (
                                                                <span className="font-medium truncate">
                                                                    {order.pharmacy_details.name}
                                                                </span>
                                                            )}
                                                            {order.order_date && (
                                                                <span className="text-gray-500">
                                                                    {formatDate(order.order_date, 'MMM dd, yyyy')}
                                                                </span>
                                                            )}
                                                            {order.total_amount && (
                                                                <span className="font-semibold text-gray-900">
                                                                    ₦{parseFloat(order.total_amount).toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
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
                        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 p-6 md:p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center font-display">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-3 shadow-lg shadow-primary/10">
                                        <DocumentTextIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <span>Prescriptions</span>
                                </h2>
                                <Link 
                                    to="/prescriptions" 
                                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                                >
                                    View All
                                    <ArrowRightIcon className="h-4 w-4" />
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
                                                className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer group ${
                                                    index === 0 
                                                        ? 'bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 border-indigo-100' 
                                                        : 'bg-gray-50 border-gray-100 hover:border-indigo-200'
                                                }`}
                                            >
                                                {index === 0 && (
                                                    <div className="absolute right-0 bottom-0 opacity-10">
                                                        <DocumentTextIcon className="h-24 w-24 -mr-6 -mb-6 text-indigo-600" />
                                                    </div>
                                                )}
                                                <div className="relative z-10">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            {index === 0 && (
                                                                <p className="text-indigo-800 text-xs font-bold uppercase mb-2 tracking-wider">Most Recent</p>
                                                            )}
                                                            <h3 className="text-lg font-bold text-gray-900 mb-1 font-display">
                                                                {prescription.diagnosis || 'Prescription'}
                                                            </h3>
                                                            {prescription.items && prescription.items.length > 0 && (
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    {prescription.items.length} {prescription.items.length === 1 ? 'medication' : 'medications'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {index === 0 && (
                                                            <div className="bg-white p-2 rounded-xl shadow-sm">
                                                                <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center text-indigo-700 text-xs font-medium bg-white/60 px-3 py-1.5 rounded-lg w-fit">
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
                        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 p-6 md:p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center font-display">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mr-3 shadow-lg shadow-primary/10">
                                        <BellAlertIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <span>Medications</span>
                                </h2>
                                <Link 
                                    to="/medication-reminders" 
                                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                                >
                                    View All
                                    <ArrowRightIcon className="h-4 w-4" />
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
                                    className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-amber-100 overflow-hidden"
                                >
                                    <div className="absolute right-0 bottom-0 opacity-10">
                                        <ShoppingBagIcon className="h-32 w-32 -mr-8 -mb-8 text-amber-600" />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-amber-800 text-xs font-bold uppercase mb-2 tracking-wider">Next Dose</p>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">{nextReminder.medication_display.name}</h3>
                                        <div className="flex items-center text-amber-700 font-semibold mb-3 bg-white/60 px-3 py-1.5 rounded-lg w-fit">
                                            <ClockIcon className="h-5 w-5 mr-2" />
                                            {formatTime(nextReminder.time_of_day)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t border-amber-200/50">
                                            <span className="font-medium">{nextReminder.dosage}</span>
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
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 p-4 sm:p-6 md:p-8 border border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center font-display">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-2 sm:mr-3 shadow-lg shadow-primary/10">
                                        <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                    Log Health Data
                                </h2>
                                <Link 
                                    to="/health" 
                                    className="text-xs sm:text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 self-start sm:self-auto"
                                >
                                    <span className="hidden sm:inline">View All</span>
                                    <span className="sm:hidden">All</span>
                                    <ArrowRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {healthSections.filter(section => section.path !== '/health/vitals').map((section) => (
                                    <Link
                                        key={section.path}
                                        to={section.path}
                                        className="flex items-center p-3 sm:p-4 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all group border border-transparent hover:border-gray-200 hover:shadow-sm touch-manipulation"
                                    >
                                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-md group-active:scale-95 sm:group-hover:scale-110 transition-transform flex-shrink-0`}>
                                            <section.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                        </div>
                                        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors mb-0.5 font-display">{section.name}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-1">{section.description}</p>
                                        </div>
                                        <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                                    </Link>
                                ))}
                            </div>
                            {/* Quick Action Button */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <Link
                                    to="/health/vitals"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white text-sm font-bold shadow-md shadow-primary/20 active:scale-95 sm:hover:shadow-lg sm:hover:scale-[1.02] transition-all duration-200 touch-manipulation"
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
