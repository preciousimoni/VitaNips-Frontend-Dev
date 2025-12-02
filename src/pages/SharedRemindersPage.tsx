// src/pages/SharedRemindersPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BellAlertIcon,
    PlusIcon,
    UserGroupIcon,
    ShareIcon,
    UserIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentSubscription } from '../api/payments';
import { UserSubscription } from '../types/payments';
import PageWrapper from '../components/common/PageWrapper';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface SharedReminder {
    id: number;
    medicationName: string;
    dosage: string;
    time: string;
    frequency: string;
    sharedWith: string[];
    createdBy: string;
    isActive: boolean;
}

const SharedRemindersPage: React.FC = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [sharedReminders, setSharedReminders] = useState<SharedReminder[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const sub = await getCurrentSubscription();
                setSubscription(sub);
                
                // TODO: Fetch shared reminders from API
                // For now, using mock data
                setSharedReminders([
                    {
                        id: 1,
                        medicationName: 'Vitamin D',
                        dosage: '1 tablet',
                        time: '08:00 AM',
                        frequency: 'Daily',
                        sharedWith: ['John Doe', 'Jane Doe'],
                        createdBy: 'You',
                        isActive: true,
                    },
                    {
                        id: 2,
                        medicationName: 'Calcium',
                        dosage: '2 tablets',
                        time: '06:00 PM',
                        frequency: 'Daily',
                        sharedWith: ['Jane Doe'],
                        createdBy: 'John Doe',
                        isActive: true,
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

    if (loading) {
        return (
            <PageWrapper title="Shared Reminders">
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            </PageWrapper>
        );
    }

    if (!isFamilyPlan) {
        return (
            <PageWrapper title="Shared Reminders">
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 pb-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
                        >
                            <div className="p-4 bg-violet-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                <ShareIcon className="h-12 w-12 text-violet-600" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4">
                                Shared Reminders - Family Plan Feature
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Shared reminders allow you to create medication reminders that are visible to all family members. 
                                This feature is available exclusively for Family Plan subscribers.
                            </p>
                            <Link
                                to="/subscription"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
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
        <PageWrapper title="Shared Reminders">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 pb-12">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 pt-20 pb-16 overflow-hidden">
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
                                        <ShareIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-white">
                                        Shared Reminders
                                    </h1>
                                </div>
                                <p className="text-xl text-white/90 max-w-2xl">
                                    Create medication reminders that are visible to all family members. Perfect for shared medications and family health coordination.
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all"
                            >
                                <PlusIcon className="h-6 w-6" />
                                Create Shared Reminder
                            </motion.button>
                        </motion.div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    {/* Info Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-violet-50 border border-violet-200 rounded-2xl p-6 mb-8"
                    >
                        <div className="flex items-start gap-4">
                            <UserGroupIcon className="h-6 w-6 text-violet-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-violet-900 mb-2">How Shared Reminders Work</h3>
                                <ul className="text-sm text-violet-700 space-y-1">
                                    <li>• Shared reminders are visible to all family members in your Family Plan</li>
                                    <li>• Any family member can create, edit, or delete shared reminders</li>
                                    <li>• Perfect for vitamins, supplements, or medications taken by multiple family members</li>
                                    <li>• Each family member will receive notifications for shared reminders</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Shared Reminders List */}
                    {sharedReminders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100"
                        >
                            <ShareIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Shared Reminders Yet</h3>
                            <p className="text-gray-600 mb-6">
                                Create your first shared reminder to help your family stay on track with medications.
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Create First Shared Reminder
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sharedReminders.map((reminder, index) => (
                                <motion.div
                                    key={reminder.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BellAlertIcon className="h-5 w-5 text-violet-600" />
                                                <h3 className="font-black text-gray-900 text-lg">
                                                    {reminder.medicationName}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Created by: <span className="font-semibold">{reminder.createdBy}</span>
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            reminder.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {reminder.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-600">Dosage:</span>
                                            <span className="font-semibold text-gray-900">{reminder.dosage}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-600">Time:</span>
                                            <span className="font-semibold text-gray-900">{reminder.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-600">Frequency:</span>
                                            <span className="font-semibold text-gray-900">{reminder.frequency}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <UserGroupIcon className="h-4 w-4 text-gray-400" />
                                            <span className="text-xs font-semibold text-gray-600">Shared with:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {reminder.sharedWith.map((member, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs font-medium"
                                                >
                                                    {member}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Link to Personal Reminders */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Personal Reminders</h3>
                                <p className="text-sm text-gray-600">
                                    Manage your personal medication reminders that are only visible to you.
                                </p>
                            </div>
                            <Link
                                to="/medication-reminders"
                                className="px-6 py-3 bg-violet-100 text-violet-600 rounded-xl font-semibold hover:bg-violet-200 transition-all"
                            >
                                View Personal Reminders
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default SharedRemindersPage;

