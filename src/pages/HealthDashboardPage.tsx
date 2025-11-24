import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getVitalSigns, getHealthInsights } from '@api/healthMetrics';
import PageWrapper from '@components/common/PageWrapper';
import VitalSignChart from '@features/health/components/VitalSignChart';
import QuickHealthLogger from '@features/health/components/QuickHealthLogger';
import { InformationCircleIcon, ExclamationTriangleIcon, HeartIcon, SparklesIcon, ChartBarIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const HealthDashboardPage = () => {
    const { data: vitalsResponse, isLoading: isLoadingVitals } = useQuery({
        queryKey: ['vitalSigns'],
        queryFn: () => getVitalSigns({ limit: 30 }) // Last 30 records
    });

    const { data: insightsResponse, isLoading: isLoadingInsights } = useQuery({
        queryKey: ['healthInsights'],
        queryFn: () => getHealthInsights()
    });

    const vitals = vitalsResponse?.results || [];
    const insights = insightsResponse?.results || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 overflow-hidden mb-8"
            >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                    >
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                                <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                    <HeartIcon className="h-12 w-12 text-white animate-pulse" />
                                </div>
                            </div>
                            <div className="text-white">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider mb-3 border border-white/30"
                                >
                                    <SparklesIcon className="h-4 w-4 mr-2" />
                                    Health Tracking Dashboard
                                </motion.div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Your Health Journey</h1>
                                <p className="text-white/90 text-base md:text-lg">
                                    Monitor your vital signs and track your wellness progress
                                </p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap gap-3"
                        >
                            {[
                                { label: 'Vitals', href: '/health/vitals', icon: HeartIcon },
                                { label: 'Exercise', href: '/health/exercise', icon: ChartBarIcon },
                                { label: 'Goals', href: '/health/goals', icon: TrophyIcon }
                            ].map((link, index) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl font-medium border border-white/30 transition-all text-white text-sm"
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
                    </svg>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {(isLoadingVitals && isLoadingInsights) ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl shadow-lg p-6 h-96 animate-pulse"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl shadow-lg p-6 h-64 animate-pulse"></div>
                                <div className="bg-white rounded-3xl shadow-lg p-6 h-64 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl shadow-lg p-6 h-48 animate-pulse"></div>
                            <div className="bg-white rounded-3xl shadow-lg p-6 h-96 animate-pulse"></div>
                        </div>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Main Content - Charts */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100 hover:shadow-2xl transition-shadow relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full blur-3xl opacity-50"></div>
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                                            <ChartBarIcon className="h-6 w-6 text-red-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">Blood Pressure Trends</h3>
                                    </div>
                                    <VitalSignChart data={vitals} type="blood_pressure" />
                                </div>
                            </motion.div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-100 hover:shadow-2xl transition-shadow relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-100 to-red-100 rounded-full blur-2xl opacity-50"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 bg-gradient-to-br from-rose-100 to-red-100 rounded-lg">
                                                <HeartIcon className="h-5 w-5 text-rose-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">Heart Rate</h3>
                                        </div>
                                        <VitalSignChart data={vitals} type="heart_rate" />
                                    </div>
                                </motion.div>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-100 hover:shadow-2xl transition-shadow relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-50"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                                                <ChartBarIcon className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">Weight</h3>
                                        </div>
                                        <VitalSignChart data={vitals} type="weight" />
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Sidebar - Quick Actions & Insights */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <QuickHealthLogger />
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-100 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-50"></div>
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                                            <SparklesIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Health Insights</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {insights.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                                                    <InformationCircleIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 text-sm">No new insights available.</p>
                                                <p className="text-gray-400 text-xs mt-1">Keep logging your health data!</p>
                                            </div>
                                        ) : (
                                            insights.map((insight, index) => (
                                                <motion.div 
                                                    key={insight.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.6 + index * 0.1 }}
                                                    className={`p-4 rounded-2xl border-l-4 shadow-md hover:shadow-lg transition-shadow ${
                                                        insight.priority === 'high' ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-500' : 
                                                        insight.insight_type === 'achievement' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500' : 
                                                        'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500'
                                                    }`}
                                                >
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 mr-3">
                                                            <div className={`p-2 rounded-xl ${
                                                                insight.priority === 'high' ? 'bg-red-100' :
                                                                insight.insight_type === 'achievement' ? 'bg-green-100' : 'bg-blue-100'
                                                            }`}>
                                                                {insight.priority === 'high' ? (
                                                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                                                ) : insight.insight_type === 'achievement' ? (
                                                                    <TrophyIcon className="h-5 w-5 text-green-600" />
                                                                ) : (
                                                                    <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-900">{insight.title}</h4>
                                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{insight.description}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HealthDashboardPage;

