// src/pages/PremiumFeaturesHubPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  BellAlertIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentSubscription } from '../api/payments';
import { UserSubscription } from '../types/payments';
import Spinner from '../components/ui/Spinner';
import PageWrapper from '../components/common/PageWrapper';

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  gradient: string;
  available: boolean;
}

const PremiumFeaturesHubPage: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const sub = await getCurrentSubscription();
        setSubscription(sub);
      } catch (err) {
        console.error('Failed to load subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSubscription();
    }
  }, [user]);

  const subscriptionTier = subscription?.plan?.tier || 'free';
  const isPremium = subscriptionTier === 'premium' || subscriptionTier === 'family';

  const allFeatures: Feature[] = [
    {
      id: 'health_tracking',
      name: 'Health Tracking',
      description: 'Track vitals, nutrition, exercise, and sleep patterns',
      icon: HeartIcon,
      path: '/health/vitals',
      color: 'text-rose-500',
      gradient: 'from-rose-500 to-red-600',
      available: true, // Available to all
    },
    {
      id: 'basic_reminders',
      name: 'Basic Reminders',
      description: 'Set and manage medication and appointment reminders',
      icon: BellAlertIcon,
      path: '/medication-reminders',
      color: 'text-amber-500',
      gradient: 'from-amber-500 to-orange-600',
      available: true, // Available to all
    },
    {
      id: '24_7_support',
      name: '24/7 Support',
      description: 'Get help anytime with our round-the-clock customer support',
      icon: ChatBubbleLeftRightIcon,
      path: '/help',
      color: 'text-blue-500',
      gradient: 'from-blue-500 to-cyan-600',
      available: isPremium,
    },
    {
      id: 'export_reports',
      name: 'Export Reports',
      description: 'Download comprehensive health reports in PDF format',
      icon: DocumentArrowDownIcon,
      path: '/health/analytics',
      color: 'text-emerald-500',
      gradient: 'from-emerald-500 to-teal-600',
      available: isPremium,
    },
    {
      id: 'priority_booking',
      name: 'Priority Booking',
      description: 'Skip the queue and get guaranteed same-day appointments',
      icon: ClockIcon,
      path: '/doctors',
      color: 'text-purple-500',
      gradient: 'from-purple-500 to-indigo-600',
      available: isPremium,
    },
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'Deep insights into your health trends and predictions',
      icon: ChartBarIcon,
      path: '/health/analytics',
      color: 'text-indigo-500',
      gradient: 'from-indigo-500 to-purple-600',
      available: isPremium,
    },
    {
      id: 'medication_reminders',
      name: 'Medication Reminders',
      description: 'Advanced medication tracking with smart notifications',
      icon: BellAlertIcon,
      path: '/medication-reminders',
      color: 'text-green-500',
      gradient: 'from-green-500 to-emerald-600',
      available: isPremium,
    },
    {
      id: 'unlimited_appointments',
      name: 'Unlimited Appointments',
      description: 'Book as many appointments as you need, no limits',
      icon: CalendarDaysIcon,
      path: '/appointments',
      color: 'text-teal-500',
      gradient: 'from-teal-500 to-cyan-600',
      available: isPremium,
    },
    {
      id: 'family_dashboard',
      name: 'Family Dashboard',
      description: 'Manage health for up to 5 family members (Family Plan only)',
      icon: UserGroupIcon,
      path: '/family/dashboard',
      color: 'text-pink-500',
      gradient: 'from-pink-500 to-rose-600',
      available: subscriptionTier === 'family',
    },
    {
      id: 'shared_reminders',
      name: 'Shared Reminders',
      description: 'Create and share reminders with family members (Family Plan only)',
      icon: BellAlertIcon,
      path: '/family/reminders',
      color: 'text-violet-500',
      gradient: 'from-violet-500 to-purple-600',
      available: subscriptionTier === 'family',
    },
  ];

  const availableFeatures = allFeatures.filter(f => f.available);
  const premiumOnlyFeatures = allFeatures.filter(f => f.available && !['health_tracking', 'basic_reminders'].includes(f.id));

  if (loading) {
    return (
      <PageWrapper title="Premium Features">
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Premium Features Hub">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-primary via-emerald-600 to-teal-600 pt-20 pb-16 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.1, scale: 1 }}
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <SparklesIcon className="h-8 w-8 text-yellow-300" />
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  Premium Features Hub
                </h1>
              </div>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {isPremium
                  ? `Welcome to your ${subscriptionTier === 'family' ? 'Family' : 'Premium'} Plan! Access all your premium features below.`
                  : 'Upgrade to Premium or Family Plan to unlock advanced features'}
              </p>
              {subscription && (
                <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                  <span className="text-white font-semibold">
                    {subscription.plan?.name || 'Active Plan'}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <SparklesIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Unlock Premium Features
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Upgrade to Premium or Family Plan to access advanced health tracking, analytics, priority booking, and more.
                  </p>
                  <Link
                    to="/subscription"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    View Plans
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Premium Features Section */}
          {isPremium && premiumOnlyFeatures.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-primary" />
                Premium Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumOnlyFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={feature.path}
                      className="block h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                    >
                      <div className={`bg-gradient-to-br ${feature.gradient} p-6 text-white`}>
                        <feature.icon className="h-10 w-10 mb-3" />
                        <h3 className="text-xl font-black mb-2">{feature.name}</h3>
                        <p className="text-white/90 text-sm">{feature.description}</p>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-600">Access Feature</span>
                          <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Available Features */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              All Available Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (premiumOnlyFeatures.length + index) * 0.05 }}
                >
                  <Link
                    to={feature.path}
                    className="block h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                  >
                    <div className={`bg-gradient-to-br ${feature.gradient} p-6 text-white`}>
                      <feature.icon className="h-10 w-10 mb-3" />
                      <h3 className="text-xl font-black mb-2">{feature.name}</h3>
                      <p className="text-white/90 text-sm">{feature.description}</p>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">Access Feature</span>
                        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PremiumFeaturesHubPage;

