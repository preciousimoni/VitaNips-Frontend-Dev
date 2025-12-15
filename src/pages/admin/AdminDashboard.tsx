// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  BuildingStorefrontIcon,
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
                gradient: 'bg-blue-500',
                bgGradient: 'bg-blue-50',
                description: `${stats.users.active} active, ${stats.users.new_this_month} new this month`,
                link: '/admin/users',
            },
            {
                title: 'Doctors',
                value: stats.doctors.total,
                icon: ShieldCheckIcon,
                gradient: 'bg-green-500',
                bgGradient: 'bg-green-50',
                description: `${stats.doctors.verified} verified, ${stats.doctors.pending_verification} pending`,
                link: '/admin/doctors',
            },
            {
                title: 'Pharmacies',
                value: stats.pharmacies.total,
                icon: BuildingStorefrontIcon,
                gradient: 'bg-purple-500',
                bgGradient: 'bg-purple-50',
                description: `${stats.pharmacies.active} active, ${stats.pharmacies.inactive} inactive`,
                link: '/admin/pharmacies',
            },
            {
                title: 'Appointments',
                value: stats.appointments?.this_month || stats.appointments?.total || 0,
                icon: CalendarDaysIcon,
                gradient: 'bg-orange-500', 
                bgGradient: 'bg-orange-50',
                description: `${stats.appointments?.today || 0} today, ${stats.appointments?.total || 0} total`,
                link: '/admin/appointments',
            },
            {
                title: 'Orders',
                value: stats.orders?.total || 0,
                icon: ClipboardDocumentListIcon,
                gradient: 'bg-indigo-500',
                bgGradient: 'bg-indigo-50',
                description: `${stats.orders?.pending || 0} pending`,
                link: null, 
            },
        ]
        : [];

    const quickLinks = [
        {
            title: 'User Management',
            description: 'Manage user accounts and permissions',
            icon: UsersIcon,
            gradient: 'from-blue-500 to-cyan-500',
            borderColor: 'border-blue-500',
            shadowColor: 'shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]',
            link: '/admin/users',
        },
        {
            title: 'Doctor Verification',
            description: 'Review and verify doctor applications',
            icon: ShieldCheckIcon,
            gradient: 'from-green-500 to-emerald-500',
            borderColor: 'border-green-500',
            shadowColor: 'shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]',
            link: '/admin/doctors',
        },
        {
            title: 'Pharmacy Management',
            description: 'Manage pharmacy partners',
            icon: BuildingStorefrontIcon,
            gradient: 'from-purple-500 to-pink-500',
            borderColor: 'border-purple-500',
            shadowColor: 'shadow-[4px_4px_0px_0px_rgba(168,85,247,1)]',
            link: '/admin/pharmacies',
        },
        {
            title: 'System Analytics',
            description: 'View platform statistics and reports',
            icon: ChartBarIcon,
            gradient: 'from-orange-500 to-red-500',
            borderColor: 'border-orange-500',
            shadowColor: 'shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]',
            link: '/admin/analytics',
        },
        {
            title: 'Django Admin',
            description: 'Access full Django admin panel',
            icon: ShieldCheckIcon,
            gradient: 'from-gray-600 to-gray-800',
            borderColor: 'border-gray-800',
            shadowColor: 'shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]',
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
        <div className="min-h-screen bg-cream-50">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative bg-primary-900 pt-20 pb-32 sm:pt-24 sm:pb-40 overflow-hidden border-b-8 border-black"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

                {/* Floating Icon Cards - Hardened */}
                <motion.div
                    className="absolute top-1/4 left-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                    <ShieldCheckIcon className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div
                    className="absolute bottom-1/4 right-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
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
                        className="inline-flex items-center px-5 py-2 rounded-xl bg-black border-2 border-white/30 text-white text-sm font-black uppercase tracking-wider mb-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        ADMINISTRATOR PORTAL
                    </motion.div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 font-display tracking-tight">
                                Welcome,{' '}
                                <span className="relative inline-block">
                                    <span className="relative z-10">{user?.first_name || user?.username || 'Administrator'}</span>
                                    <motion.span
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.8, duration: 0.8 }}
                                        className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400 -z-0 transform -rotate-1"
                                    ></motion.span>
                                </span>
                            </h1>
                            <p className="text-xl text-white/90 font-bold max-w-2xl mt-4">Manage your VitaNips platform efficiently.</p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="inline-flex items-center px-6 py-3 rounded-2xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black bg-emerald-400 text-black hover:bg-emerald-300 transition-colors cursor-default"
                        >
                            <CheckCircleIcon className="h-6 w-6 mr-2" />
                            System Operational
                        </motion.div>
                    </div>
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
                                whileHover={{ y: -5, shadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                                className={`relative bg-white rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-6 overflow-hidden group ${
                                    stat.link ? 'cursor-pointer' : 'cursor-default transition-all'
                                }`}
                                onClick={() => stat.link && navigate(stat.link)}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                     <Icon className="w-24 h-24 text-black transform rotate-12" />
                                </div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 ${stat.gradient} rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-3xl font-black text-black">
                                            {stat.value}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-black text-black mb-1 uppercase tracking-wider">
                                        {stat.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 font-bold bg-gray-100 inline-block px-2 py-1 rounded-lg border border-gray-300">{stat.description}</p>
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
                    className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-4 border-black p-6 sm:p-8 mb-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-black rounded-xl text-white shadow-[4px_4px_0px_0px_rgba(255,165,0,1)]">
                            <SparklesIcon className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-black text-black font-display uppercase tracking-tight">Administration Tools</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickLinks.map((link, index) => {
                            const Icon = link.icon;
                            // Add extra properties to satisfy type checking if needed, or cast as any if types are strict
                            const extendedLink = link as any;
                            
                            const content = (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + index * 0.05 }}
                                    whileHover={{ y: -4, x: 2, shadow: extendedLink.shadowColor || 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex items-start space-x-4 p-5 bg-white rounded-2xl transition-all group border-4 ${extendedLink.borderColor || 'border-black'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer`}
                                >
                                    <div className={`p-3 bg-gradient-to-br ${link.gradient} rounded-xl border-2 border-black shadow-sm flex-shrink-0`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-black text-lg mb-1 uppercase tracking-tight">
                                            {link.title}
                                        </p>
                                        <p className="text-sm text-gray-600 font-bold">{link.description}</p>
                                    </div>
                                    <ArrowRightIcon className="h-6 w-6 text-black stroke-[3]" />
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
                        className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-6 overflow-hidden"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-500 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">
                                <CheckCircleIcon className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-black text-black font-display uppercase">System Status</h2>
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
                                    className="flex items-center justify-between p-4 bg-cream-50 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                                >
                                    <span className="text-black font-black uppercase tracking-wide text-sm">{item.label}</span>
                                    <span className="flex items-center text-emerald-700 font-black bg-white px-3 py-1 rounded-lg border border-black">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
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
                        className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-6 overflow-hidden"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-500 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">
                                <BellAlertIcon className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-black text-black font-display uppercase">Recent Activity</h2>
                        </div>
                        {loadingActivities ? (
                            <div className="flex justify-center py-8">
                                <Spinner size="sm" />
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 text-center">
                                <p className="text-gray-500 font-bold">No recent admin actions</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Activity logs will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {activities.map((activity, index) => {
                                    const getIcon = () => {
                                        const colorClass = 'text-white';
                                        
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
                                        return activity.color === 'green' ? 'bg-emerald-500' :
                                               activity.color === 'red' ? 'bg-red-500' :
                                               activity.color === 'blue' ? 'bg-blue-500' :
                                               activity.color === 'orange' ? 'bg-orange-500' : 'bg-gray-500';
                                    };

                                    return (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + index * 0.05 }}
                                            className="flex items-start gap-3 p-3 bg-cream-50 rounded-xl border-2 border-black hover:bg-white hover:translate-x-1 transition-all"
                                        >
                                            <div className={`flex-shrink-0 p-2 rounded-lg border-2 border-black ${getBgColor()}`}>
                                                {getIcon()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-black line-clamp-2 leading-tight">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 font-medium">
                                                    <span className="bg-white px-1.5 py-0.5 rounded border border-black/20">{activity.actor_name}</span>
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
                    className="bg-yellow-100 border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex items-start gap-4">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="p-3 bg-black flex-shrink-0 rounded-xl text-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
                        >
                            <BellAlertIcon className="h-6 w-6" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-black text-black font-display uppercase tracking-wide mb-2">Admin Notice</h3>
                            <p className="text-sm font-bold text-black border-l-4 border-black pl-3 py-1">
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
