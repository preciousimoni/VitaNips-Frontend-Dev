// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BellAlertIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { getAdminStats, AdminStats, getAdminRecentActivity, AdminActivity } from '../../api/admin';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import { formatRelativeTime } from '../../utils/date';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activities, setActivities] = useState<AdminActivity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch (err) {
                setError('Failed to fetch admin statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchActivities = async () => {
            try {
                setLoadingActivities(true);
                const data = await getAdminRecentActivity();
                setActivities(data.activities);
            } catch (err) {
                console.error('Failed to fetch recent activities:', err);
            } finally {
                setLoadingActivities(false);
            }
        };

        fetchStats();
        fetchActivities();
    }, []);

    const statsCards = stats
        ? [
            {
                title: 'Total Users',
                value: stats.users.total,
                icon: UsersIcon,
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50',
                description: `${stats.users.active} active, ${stats.users.new_this_month} new this month`,
                link: '/admin/users',
            },
            {
                title: 'Doctors',
                value: stats.doctors.total,
                icon: ShieldCheckIcon,
                gradient: 'from-green-500 to-emerald-500',
                bgGradient: 'from-green-50 to-emerald-50',
                description: `${stats.doctors.verified} verified, ${stats.doctors.pending_verification} pending`,
                link: '/admin/doctors',
            },
            {
                title: 'Pharmacies',
                value: stats.pharmacies.total,
                icon: BuildingStorefrontIcon,
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-50 to-pink-50',
                description: `${stats.pharmacies.active} active, ${stats.pharmacies.inactive} inactive`,
                link: '/admin/pharmacies',
            },
            {
                title: 'Appointments',
                value: stats.appointments?.this_month || stats.appointments?.total || 0,
                icon: CalendarDaysIcon,
                gradient: 'from-orange-500 to-red-500',
                bgGradient: 'from-orange-50 to-red-50',
                description: `${stats.appointments?.today || 0} today, ${stats.appointments?.total || 0} total`,
                link: '/admin/appointments', // Link to admin appointments management page
            },
            {
                title: 'Orders',
                value: stats.orders?.total || 0,
                icon: ClipboardDocumentListIcon,
                gradient: 'from-indigo-500 to-blue-500',
                bgGradient: 'from-indigo-50 to-blue-50',
                description: `${stats.orders?.pending || 0} pending`,
                link: null, // No dedicated admin orders page yet - make non-clickable
            },
        ]
        : [];

    const quickLinks = [
        {
            title: 'User Management',
            description: 'Manage user accounts and permissions',
            icon: UsersIcon,
            gradient: 'from-blue-500 to-cyan-500',
            link: '/admin/users',
        },
        {
            title: 'Doctor Verification',
            description: 'Review and verify doctor applications',
            icon: ShieldCheckIcon,
            gradient: 'from-green-500 to-emerald-500',
            link: '/admin/doctors',
        },
        {
            title: 'Pharmacy Management',
            description: 'Manage pharmacy partners',
            icon: BuildingStorefrontIcon,
            gradient: 'from-purple-500 to-pink-500',
            link: '/admin/pharmacies',
        },
        {
            title: 'System Analytics',
            description: 'View platform statistics and reports',
            icon: ChartBarIcon,
            gradient: 'from-orange-500 to-red-500',
            link: '/admin/analytics',
        },
        {
            title: 'Django Admin',
            description: 'Access full Django admin panel',
            icon: ShieldCheckIcon,
            gradient: 'from-gray-600 to-gray-800',
            link: '/admin/',
            external: true,
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-3xl shadow-2xl border border-red-100 text-center max-w-md w-full"
                >
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                    >
                        Retry
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black pt-20 pb-32 sm:pt-24 sm:pb-40 overflow-hidden"
            >
                {/* Animated Blobs */}
                <motion.div
                    className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                    animate={{ x: [-100, 200], y: [-50, 100], rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                ></motion.div>
                <motion.div
                    className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                    animate={{ x: [100, -200], y: [50, -100], rotate: [360, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                ></motion.div>

                {/* Floating Icon Cards */}
                <motion.div
                    className="absolute top-1/4 left-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                    <ShieldCheckIcon className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div
                    className="absolute bottom-1/4 right-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
                    animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                >
                    <ChartBarIcon className="h-8 w-8 text-white" />
                </motion.div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold uppercase tracking-wider mb-6"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        ADMINISTRATOR PORTAL
                    </motion.div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                                Welcome,{' '}
                                <span className="relative inline-block">
                                    <span className="relative z-10">{user?.first_name || user?.username || 'Administrator'}</span>
                                    <motion.span
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.8, duration: 0.8 }}
                                        className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400/30 -z-0"
                                    ></motion.span>
                                </span>
                            </h1>
                            <p className="text-lg text-white/90">Manage your VitaNips platform efficiently.</p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="inline-flex items-center px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border-2 bg-white/20 backdrop-blur-sm border-white/30 text-white"
                        >
                            <CheckCircleIcon className="h-6 w-6 mr-2" />
                            System Operational
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8"
                >
                    {statsCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className={`relative bg-white rounded-3xl shadow-lg border border-gray-100 p-6 overflow-hidden group ${
                                    stat.link ? 'cursor-pointer' : 'cursor-default'
                                }`}
                                onClick={() => stat.link && navigate(stat.link)}
                            >
                                {/* Animated background blob */}
                                <motion.div
                                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full blur-3xl opacity-20`}
                                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                ></motion.div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <motion.div
                                            whileHover={{ rotate: 360, scale: 1.1 }}
                                            transition={{ duration: 0.6 }}
                                            className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg`}
                                        >
                                            <Icon className="h-6 w-6 text-white" />
                                        </motion.div>
                                        <span className="text-3xl font-black text-gray-900 group-hover:text-primary transition-colors">
                                            {stat.value}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wider">
                                        {stat.title}
                                    </h3>
                                    <p className="text-xs text-gray-600">{stat.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Quick Links Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 p-6 sm:p-8 mb-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="p-3 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl shadow-lg"
                        >
                            <SparklesIcon className="h-6 w-6 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-black text-gray-900">Administration Tools</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickLinks.map((link, index) => {
                            const Icon = link.icon;
                            const content = (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + index * 0.05 }}
                                    whileHover={{ x: 5, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-start space-x-4 p-5 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 rounded-2xl transition-all group border-2 border-transparent hover:border-primary/20 shadow-sm hover:shadow-md cursor-pointer"
                                >
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        className={`p-3 bg-gradient-to-br ${link.gradient} rounded-xl shadow-lg flex-shrink-0`}
                                    >
                                        <Icon className="h-6 w-6 text-white" />
                                    </motion.div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 group-hover:text-primary transition-colors text-lg mb-1">
                                            {link.title}
                                        </p>
                                        <p className="text-sm text-gray-600">{link.description}</p>
                                    </div>
                                    <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
                                </motion.div>
                            );

                            if (link.external) {
                                return (
                                    <a
                                        key={index}
                                        href={link.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {content}
                                    </a>
                                );
                            }

                            return (
                                <Link key={index} to={link.link}>
                                    {content}
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>

                {/* System Status & Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* System Status */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg"
                            >
                                <CheckCircleIcon className="h-6 w-6 text-white" />
                            </motion.div>
                            <h2 className="text-xl font-black text-gray-900">System Status</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'API Status', status: 'Operational', color: 'green' },
                                { label: 'Database', status: 'Connected', color: 'green' },
                                { label: 'Background Tasks', status: 'Running', color: 'green' },
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                >
                                    <span className="text-gray-700 font-medium">{item.label}</span>
                                    <span className="flex items-center text-green-600 font-bold">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                        {item.status}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg"
                            >
                                <BellAlertIcon className="h-6 w-6 text-white" />
                            </motion.div>
                            <h2 className="text-xl font-black text-gray-900">Recent Activity</h2>
                        </div>
                        {loadingActivities ? (
                            <div className="flex justify-center py-8">
                                <Spinner size="sm" />
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="space-y-3 text-sm text-gray-600">
                                <p className="text-gray-500 italic">No recent admin actions</p>
                                <p className="text-xs text-gray-400 mt-4">
                                    Activity logs will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {activities.map((activity, index) => {
                                    const getIcon = () => {
                                        const colorClass = activity.color === 'green' ? 'text-green-600' :
                                                         activity.color === 'red' ? 'text-red-600' :
                                                         activity.color === 'blue' ? 'text-blue-600' :
                                                         activity.color === 'orange' ? 'text-orange-600' : 'text-gray-600';
                                        
                                        switch (activity.icon) {
                                            case 'check-circle':
                                                return <CheckCircleIcon className={`h-4 w-4 ${colorClass}`} />;
                                            case 'x-circle':
                                                return <XCircleIcon className={`h-4 w-4 ${colorClass}`} />;
                                            case 'clock':
                                                return <ClockIcon className={`h-4 w-4 ${colorClass}`} />;
                                            case 'user-plus':
                                                return <UserIcon className={`h-4 w-4 ${colorClass}`} />;
                                            case 'user-minus':
                                                return <UserIcon className={`h-4 w-4 ${colorClass}`} />;
                                            default:
                                                return <BellAlertIcon className={`h-4 w-4 ${colorClass}`} />;
                                        }
                                    };

                                    const getBgColor = () => {
                                        return activity.color === 'green' ? 'bg-green-50' :
                                               activity.color === 'red' ? 'bg-red-50' :
                                               activity.color === 'blue' ? 'bg-blue-50' :
                                               activity.color === 'orange' ? 'bg-orange-50' : 'bg-gray-50';
                                    };

                                    return (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + index * 0.05 }}
                                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            <div className={`flex-shrink-0 p-2 rounded-lg ${getBgColor()}`}>
                                                {getIcon()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span>{activity.actor_name}</span>
                                                    <span>•</span>
                                                    <span>{formatRelativeTime(activity.timestamp)}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Admin Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-6 shadow-lg"
                >
                    <div className="flex items-start gap-4">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg flex-shrink-0"
                        >
                            <BellAlertIcon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-black text-yellow-900 mb-2">Admin Notice</h3>
                            <p className="text-sm text-yellow-800">
                                Some administrative features are still under development. 
                                Use the Django admin panel for full system management capabilities.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
