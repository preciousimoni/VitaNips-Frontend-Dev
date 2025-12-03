// src/pages/FamilyDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    UserGroupIcon,
    PlusIcon,
    HeartIcon,
    CalendarDaysIcon,
    BellAlertIcon,
    ChartBarIcon,
    UserIcon,
    PencilIcon,
    TrashIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentSubscription } from '../api/payments';
import { UserSubscription } from '../types/payments';
import PageWrapper from '../components/common/PageWrapper';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface FamilyMember {
    id: number;
    name: string;
    email: string;
    relationship: string;
    dateOfBirth?: string;
    profilePicture?: string;
    healthStatus?: 'good' | 'needs_attention' | 'critical';
    upcomingAppointments?: number;
    activeReminders?: number;
}

const FamilyDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const sub = await getCurrentSubscription();
                setSubscription(sub);
                
                // TODO: Fetch family members from API
                // For now, using mock data
                setFamilyMembers([
                    {
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com',
                        relationship: 'Spouse',
                        dateOfBirth: '1985-05-15',
                        healthStatus: 'good',
                        upcomingAppointments: 2,
                        activeReminders: 5,
                    },
                    {
                        id: 2,
                        name: 'Jane Doe',
                        email: 'jane@example.com',
                        relationship: 'Child',
                        dateOfBirth: '2010-08-20',
                        healthStatus: 'good',
                        upcomingAppointments: 1,
                        activeReminders: 3,
                    },
                ]);
            } catch (err) {
                console.error('Failed to load subscription:', err);
                toast.error('Failed to load subscription data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadData();
        }
    }, [user]);

    const subscriptionTier = subscription?.plan?.tier || 'free';
    const isFamilyPlan = subscriptionTier === 'family';
    const maxMembers = subscription?.plan?.max_family_members || 5;
    const currentCount = familyMembers.length + 1; // +1 for the account owner

    if (loading) {
        return (
            <PageWrapper title="Family Dashboard">
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            </PageWrapper>
        );
    }

    if (!isFamilyPlan) {
        return (
            <PageWrapper title="Family Dashboard">
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30 pb-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
                        >
                            <div className="p-4 bg-pink-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                <UserGroupIcon className="h-12 w-12 text-pink-600" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4">
                                Family Dashboard - Premium Feature
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                The Family Dashboard is available exclusively for Family Plan subscribers. 
                                Upgrade to manage health for up to 5 family members.
                            </p>
                            <Link
                                to="/subscription"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <SparklesIcon className="h-5 w-5" />
                                Upgrade to Family Plan
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Family Dashboard">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30 pb-12">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 pt-20 pb-16 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.1, scale: 1 }}
                        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"
                    />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <UserGroupIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-white">
                                        Family Dashboard
                                    </h1>
                                </div>
                                <p className="text-xl text-white/90 max-w-2xl">
                                    Manage health for your entire family. Track appointments, medications, and health data for up to {maxMembers} family members.
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowAddMemberModal(true)}
                                disabled={currentCount >= maxMembers}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-pink-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="h-6 w-6" />
                                Add Family Member
                            </motion.button>
                        </motion.div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    {/* Account Owner Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-pink-500"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-pink-100 rounded-xl">
                                    <UserIcon className="h-8 w-8 text-pink-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">
                                        {user?.first_name} {user?.last_name} (You)
                                    </h3>
                                    <p className="text-sm text-gray-600">Account Owner</p>
                                </div>
                            </div>
                            <Link
                                to="/profile"
                                className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg font-semibold hover:bg-pink-200 transition-all"
                            >
                                Manage Profile
                            </Link>
                        </div>
                    </motion.div>

                    {/* Family Members Grid */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-gray-900">Family Members</h2>
                            <span className="text-sm text-gray-600">
                                {currentCount} / {maxMembers} members
                            </span>
                        </div>

                        {familyMembers.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100"
                            >
                                <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Family Members Added</h3>
                                <p className="text-gray-600 mb-6">
                                    Add family members to start managing their health together.
                                </p>
                                <button
                                    onClick={() => setShowAddMemberModal(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    Add First Family Member
                                </button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {familyMembers.map((member, index) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-pink-100 rounded-lg">
                                                    <UserIcon className="h-6 w-6 text-pink-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-900">{member.name}</h3>
                                                    <p className="text-sm text-gray-600">{member.relationship}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all">
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">
                                                    {member.upcomingAppointments || 0} Upcoming Appointments
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <BellAlertIcon className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">
                                                    {member.activeReminders || 0} Active Reminders
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <HeartIcon className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600 capitalize">
                                                    Health: {member.healthStatus || 'Good'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <Link
                                                to={`/family/member/${member.id}`}
                                                className="text-sm font-semibold text-pink-600 hover:text-pink-700"
                                            >
                                                View Full Profile →
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link
                            to="/family/reminders"
                            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 rounded-xl">
                                    <BellAlertIcon className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Shared Reminders</h3>
                                    <p className="text-sm text-gray-600">Manage family reminders</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/health/analytics"
                            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Family Analytics</h3>
                                    <p className="text-sm text-gray-600">View health insights</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/appointments"
                            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <CalendarDaysIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">All Appointments</h3>
                                    <p className="text-sm text-gray-600">View family appointments</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default FamilyDashboardPage;

