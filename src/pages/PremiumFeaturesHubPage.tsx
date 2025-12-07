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
  const isFamily = subscriptionTier === 'family';

  const allFeatures: Feature[] = [
    {
      id: 'health_tracking',
      name: 'Health Tracking',
      description: 'Track vitals, nutrition, exercise, and sleep patterns',
      icon: HeartIcon,
      path: '/health/vitals',
      color: 'text-rose-500',
      gradient: 'from-rose-500 to-red-600',
      available: true,
    },
    {
      id: 'basic_reminders',
      name: 'Basic Reminders',
      description: 'Set and manage medication and appointment reminders',
      icon: BellAlertIcon,
      path: '/medication-reminders',
      color: 'text-amber-500',
      gradient: 'from-amber-500 to-orange-600',
      available: true,
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
      available: isFamily,
    },
    {
      id: 'shared_reminders',
      name: 'Shared Reminders',
      description: 'Create and share reminders with family members (Family Plan only)',
      icon: BellAlertIcon,
      path: '/family/reminders',
      color: 'text-violet-500',
      gradient: 'from-violet-500 to-purple-600',
      available: isFamily,
    },
  ];

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
    <PageWrapper title="Features Hub">
      <div className="min-h-screen bg-gray-50 pb-12">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 pt-20 pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/10" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 border border-white/10">
                <SparklesIcon className="h-8 w-8 text-yellow-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                Explore Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Capabilities</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Discover all the powerful tools available to manage your health journey. 
                {isPremium ? ' You have full access to our premium suite.' : ' Upgrade to unlock the full potential of VitaNips.'}
              </p>

              {subscription && (
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full border border-white/10">
                  <span className="text-gray-400 text-sm uppercase tracking-wider font-bold">Current Plan:</span>
                  <span className={`font-bold ${isPremium ? 'text-yellow-400' : 'text-white'}`}>
                    {subscription.plan?.name || 'Free Plan'}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allFeatures.map((feature, index) => {
              const isLocked = !feature.available;
              
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={isLocked ? '/subscription' : feature.path}
                    className={`block h-full relative overflow-hidden rounded-3xl transition-all duration-300 group ${
                      isLocked 
                        ? 'bg-white border border-gray-200 hover:border-primary/30' 
                        : 'bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    {/* Card Content */}
                    <div className="p-8">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          isLocked 
                            ? 'bg-gray-100 text-gray-400' 
                            : `bg-gradient-to-br ${feature.gradient} text-white shadow-lg`
                        }`}>
                          <feature.icon className="h-7 w-7" />
                        </div>
                        
                        {/* Badges */}
                        {isLocked ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wide">
                            Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wide">
                            Active
                          </span>
                        )}
                      </div>

                      <h3 className={`text-xl font-bold mb-3 ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                        {feature.name}
                      </h3>
                      <p className={`text-sm leading-relaxed ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                    </div>

                    {/* Footer / Action Area */}
                    <div className={`px-8 py-4 border-t ${
                      isLocked ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${
                          isLocked ? 'text-gray-400' : 'text-primary'
                        }`}>
                          {isLocked ? 'Upgrade to Unlock' : 'Open Feature'}
                        </span>
                        {isLocked ? (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-500">
                              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <ArrowRightIcon className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                        )}
                      </div>
                    </div>

                    {/* Locked Overlay Effect */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] pointer-events-none" />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PremiumFeaturesHubPage;

