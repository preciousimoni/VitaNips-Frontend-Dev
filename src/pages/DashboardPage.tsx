import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
    UserIcon,
    SparklesIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

import { getUserAppointments } from '../api/appointments';
import { getMedicationReminders } from '../api/medicationReminders';
import { getVitalSigns } from '../api/healthLogs';
import { getUnreadNotificationCount } from '../api/notifications';
import { Appointment } from '../types/appointments';
import { MedicationReminder } from '../types/reminders';
import { VitalSignLog } from '../types/healthLogs';
import ErrorMessage from '../components/ui/ErrorMessage';
import Spinner from '../components/ui/Spinner';
import Skeleton from '../components/ui/Skeleton';
import { formatDate, formatTime } from '../utils/date';

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

// Reusable Card Header Component
const DashboardCardHeader: React.FC<{
    icon: React.ElementType;
    title: string;
    count: number;
    isLoading: boolean;
    gradient: string;
    badgeColor: string;
    actionLink?: string;
}> = ({ icon: Icon, title, count, isLoading, gradient, badgeColor, actionLink }) => (
    <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center font-display">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mr-3 shadow-lg shadow-primary/10`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <span>{title}</span>
        </h2>
        <div className="flex items-center space-x-3">
            <span className={`text-xs font-bold ${badgeColor} px-3 py-1 rounded-full border border-opacity-20`}>
                {isLoading ? <Spinner size="sm" /> : `${count} Active`}
            </span>
            {actionLink && (
                <Link to={actionLink} className="text-gray-400 hover:text-primary transition-colors">
                    <ArrowRightIcon className="h-5 w-5" />
                </Link>
            )}
        </div>
    </div>
);

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
        className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
        <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full group-hover:opacity-20 transition-opacity`}></div>
        
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        
        <h3 className="font-bold text-gray-900 mb-1 text-lg group-hover:text-primary transition-colors">{label}</h3>
        <p className="text-sm text-gray-500 relative z-10">{description}</p>
    </Link>
);

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

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

    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [notificationsLoading, setNotificationsLoading] = useState<boolean>(true);

    const fetchDashboardData = useCallback(async () => {
        // Fetch Appointments
        setAppointmentsLoading(true);
        setAppointmentsError(null);
        try {
            const response = await getUserAppointments({ page: 1, ordering: 'date,start_time' });
            const now = new Date();
            const upcoming = response.results.filter(app => {
                const appDateTime = new Date(`${app.date}T${app.start_time}`);
                return appDateTime >= now && (app.status === 'scheduled' || app.status === 'confirmed');
            });
            setUpcomingAppointments(upcoming);
            if (upcoming.length > 0) {
                setNextAppointment(upcoming[0]);
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
            const recent = response.results.slice(0, 3);
            setRecentVitals(recent);
        } catch (err) {
            console.error("Failed to fetch vitals for dashboard:", err);
            setVitalsError("Could not load vitals.");
        } finally {
            setVitalsLoading(false);
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
            name: t('healthSections.symptoms.name', 'Symptoms'), 
            path: '/health/symptoms', 
            icon: ShieldExclamationIcon, 
            description: t('healthSections.symptoms.description', "Record how you're feeling."),
            gradient: 'from-orange-500 to-amber-600'
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

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex-1"
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold uppercase tracking-wider text-white">
                                    <SparklesIcon className="h-4 w-4 inline mr-2" />
                                    Dashboard Overview
                                </span>
                                <span className="text-sm text-white/80 font-medium">{formatDate(new Date().toISOString())}</span>
                            </motion.div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-white tracking-tight">
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},{' '}
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
                            <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                                {t('welcomeMessage', "Your health dashboard is updated. You have")}{' '}
                                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{upcomingAppointments.length} upcoming appointments</span>{' '}
                                {t('and')}{' '}
                                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{activeReminders.length} active reminders</span>.
                            </p>
                        </motion.div>
                        
                        {/* Notification Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Link to="/notifications" className="relative group">
                                <motion.div 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all shadow-lg"
                                >
                                    <BellAlertIcon className="h-8 w-8 text-white" />
                                    {unreadCount > 0 && (
                                        <motion.span 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold ring-4 ring-primary animate-pulse"
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
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-primary to-teal-600 rounded-2xl shadow-lg">
                        <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 font-display">Quick Actions</h2>
                        <p className="text-gray-600 text-sm">Access key features instantly</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                        >
                            <QuickActionButton {...action} />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Appointments & Vitals */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                    {/* Upcoming Appointments */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        <DashboardCardHeader
                            icon={CalendarDaysIcon}
                            title="Appointments"
                            count={upcomingAppointments.length}
                            isLoading={appointmentsLoading}
                            gradient="from-blue-500 to-cyan-500"
                            badgeColor="text-blue-600 bg-blue-50 border-blue-100"
                            actionLink="/appointments"
                        />
                        
                        {appointmentsLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-24 w-full rounded-2xl" />
                                <Skeleton className="h-24 w-full rounded-2xl" />
                            </div>
                        ) : appointmentsError ? (
                            <ErrorMessage message={appointmentsError} onRetry={fetchDashboardData} />
                        ) : upcomingAppointments.length > 0 && nextAppointment ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Up Next</span>
                                                <h3 className="text-xl font-bold text-gray-900 mt-1">Dr. {nextAppointment.doctor}</h3>
                                                <p className="text-blue-600/80 text-sm font-medium">{nextAppointment.specialty || 'General Practice'}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                                {getAppointmentStatusIcon(nextAppointment.status)}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center">
                                                <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-500" />
                                                {formatDate(nextAppointment.date)}
                                            </div>
                                            <div className="flex items-center">
                                                <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
                                                {formatTime(nextAppointment.start_time)}
                                            </div>
                                        </div>
                                        
                                        {nextAppointment.appointment_type === 'virtual' && (
                                            <div className="inline-flex items-center px-3 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-bold">
                                                Virtual Consultation
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {upcomingAppointments.length > 1 && (
                                    <div className="pl-4 border-l-2 border-gray-100 space-y-4 mt-4">
                                        {upcomingAppointments.slice(1, 3).map(apt => (
                                            <div key={apt.id} className="flex justify-between items-center group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">Dr. {apt.doctor}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(apt.date)}</p>
                                                </div>
                                                <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
                                            </div>
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
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        <DashboardCardHeader
                            icon={HeartIcon}
                            title="Recent Vitals"
                            count={recentVitals.length}
                            isLoading={vitalsLoading}
                            gradient="from-rose-500 to-red-600"
                            badgeColor="text-rose-600 bg-rose-50 border-rose-100"
                            actionLink="/health/vitals"
                        />
                        
                        {vitalsLoading ? (
                            <div className="grid grid-cols-3 gap-4">
                                <Skeleton className="h-24 rounded-2xl" />
                                <Skeleton className="h-24 rounded-2xl" />
                                <Skeleton className="h-24 rounded-2xl" />
                            </div>
                        ) : vitalsError ? (
                            <ErrorMessage message={vitalsError} onRetry={fetchDashboardData} />
                        ) : recentVitals.length > 0 ? (
                            <div className="space-y-4">
                                {recentVitals.map((vital, index) => (
                                    <div key={vital.id} className={`flex items-center justify-between p-4 rounded-2xl ${index === 0 ? 'bg-rose-50/50 border border-rose-100' : 'bg-gray-50 border border-gray-100'}`}>
                                        <div className="flex items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${index === 0 ? 'bg-rose-100 text-rose-600' : 'bg-white text-gray-400'}`}>
                                                <HeartIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{formatDate(vital.date_recorded.split('T')[0])}</p>
                                                <div className="flex items-center space-x-3 mt-1">
                                                    {vital.systolic_pressure && (
                                                        <span className="font-bold text-gray-900">{vital.systolic_pressure}/{vital.diastolic_pressure} <span className="text-xs font-normal text-gray-500">mmHg</span></span>
                                                    )}
                                                    {vital.heart_rate && (
                                                        <span className="font-bold text-gray-900">{vital.heart_rate} <span className="text-xs font-normal text-gray-500">bpm</span></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {index === 0 && (
                                            <span className="text-xs font-bold text-rose-600 bg-white px-2 py-1 rounded-md shadow-sm">Latest</span>
                                        )}
                                    </div>
                                ))}
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
                </motion.div>

                {/* Right Column - Reminders & Health Log Links */}
                <motion.div variants={itemVariants} className="space-y-8">
                    {/* Medication Reminders */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        <DashboardCardHeader
                            icon={BellAlertIcon}
                            title="Medications"
                            count={activeReminders.length}
                            isLoading={remindersLoading}
                            gradient="from-amber-500 to-orange-500"
                            badgeColor="text-amber-600 bg-amber-50 border-amber-100"
                            actionLink="/medication-reminders"
                        />
                        
                        {remindersLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full rounded-2xl" />
                                <Skeleton className="h-20 w-full rounded-2xl" />
                            </div>
                        ) : remindersError ? (
                            <ErrorMessage message={remindersError} onRetry={fetchDashboardData} />
                        ) : activeReminders.length > 0 && nextReminder ? (
                            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-amber-800 text-xs font-bold uppercase mb-2">Next Dose</p>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{nextReminder.medication_display.name}</h3>
                                    <div className="flex items-center text-amber-700 font-medium mt-2">
                                        <ClockIcon className="h-5 w-5 mr-2" />
                                        {formatTime(nextReminder.time_of_day)}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-amber-200/50">
                                        {nextReminder.dosage} • {nextReminder.frequency}
                                    </p>
                                </div>
                                <div className="absolute right-0 bottom-0 opacity-10">
                                    <ShoppingBagIcon className="h-32 w-32 -mr-8 -mb-8 text-amber-600" />
                                </div>
                            </div>
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
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center font-display">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 shadow-lg shadow-primary/10">
                                <PlusIcon className="h-5 w-5 text-white" />
                            </div>
                            Log Health Data
                        </h2>
                        <div className="space-y-3">
                            {healthSections.map((section) => (
                                <Link
                                    key={section.path}
                                    to={section.path}
                                    className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                        <section.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{section.name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{section.description}</p>
                                    </div>
                                    <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
            </motion.div>
        </div>
    );
};

export default DashboardPage;
