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
      <div className="min-h-screen bg-cream-50 pb-12 font-sans">
        {/* Hero Section */}
        <div className="relative bg-black rounded-b-[3rem] border-b-4 border-l-4 border-r-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mx-4 mt-4 md:mx-6 overflow-hidden pt-20 pb-24">
          <div className="relative max-w-7xl mx-auto px-6 md:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center justify-center p-4 bg-yellow-400 rounded-2xl mb-8 border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] rotate-[-3deg]">
                <SparklesIcon className="h-10 w-10 text-black" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight font-display drop-shadow-md">
                Explore Your <span className="text-yellow-400 underline decoration-4 underline-offset-4 decoration-white">Capabilities</span>
              </h1>
              <p className="text-xl md:text-2xl text-white font-bold opacity-90 max-w-3xl mx-auto mb-10 leading-relaxed">
                Discover all the powerful tools available to manage your health journey. 
                {isPremium ? ' You have full access to our premium suite.' : ' Upgrade to unlock the full potential of VitaNips.'}
              </p>

              {subscription && (
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-xl border-4 border-gray-200 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                  <span className="text-black text-sm uppercase tracking-widest font-black">Current Plan:</span>
                  <span className={`font-black text-lg ${isPremium ? 'text-primary-900 bg-yellow-300 px-2 rounded-md border-2 border-black' : 'text-gray-500'}`}>
                    {subscription.plan?.name || 'Free Plan'}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    className={`block h-full relative overflow-hidden rounded-[2.5rem] transition-all duration-300 group border-4 border-black ${
                      isLocked 
                        ? 'bg-gray-100 shadow-none hover:bg-gray-200' 
                        : 'bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
                    }`}
                  >
                    {/* Card Content */}
                    <div className="p-8">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-8">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:rotate-3 ${
                          isLocked 
                            ? 'bg-gray-300 text-gray-500' 
                            : `bg-white ${feature.color}`
                        }`}>
                          <feature.icon className="h-8 w-8 text-current" />
                        </div>
                        
                        {/* Badges */}
                        {isLocked ? (
                          <span className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-300 text-gray-600 text-xs font-black uppercase tracking-widest border-2 border-gray-400">
                            Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-4 py-2 rounded-xl bg-green-300 text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            Active
                          </span>
                        )}
                      </div>

                      <h3 className={`text-2xl font-black mb-4 font-display uppercase tracking-tight ${isLocked ? 'text-gray-500' : 'text-black'}`}>
                        {feature.name}
                      </h3>
                      <p className={`text-base font-bold leading-relaxed ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                    </div>

                    {/* Footer / Action Area */}
                    <div className={`px-8 py-6 border-t-4 border-black ${
                      isLocked ? 'bg-gray-200' : 'bg-yellow-50 group-hover:bg-yellow-100 transition-colors'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-black uppercase tracking-wide ${
                          isLocked ? 'text-gray-500' : 'text-black'
                        }`}>
                          {isLocked ? 'Upgrade to Unlock' : 'Open Feature'}
                        </span>
                        {isLocked ? (
                          <div className="w-10 h-10 rounded-xl bg-gray-300 flex items-center justify-center border-2 border-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500">
                              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                            <ArrowRightIcon className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
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

