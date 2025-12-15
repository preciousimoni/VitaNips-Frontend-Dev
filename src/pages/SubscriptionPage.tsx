// src/pages/SubscriptionPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  subscribeToPlan,
  cancelSubscription,
  SubscriptionPlan,
  UserSubscription
} from '../api/payments';
import Spinner from '../components/ui/Spinner';
import PageWrapper from '../components/common/PageWrapper';

const SubscriptionPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, subscriptionData] = await Promise.all([
        getSubscriptionPlans(),
        getCurrentSubscription()
      ]);
      
      // Ensure plans is an array
      const plansArray = Array.isArray(plansData) ? plansData : [];
      
      // Log for debugging
      console.log('Subscription plans data:', plansData);
      console.log('Plans array:', plansArray);
      
      // Filter out any invalid plans
      const validPlans = plansArray.filter(plan => 
        plan && 
        typeof plan === 'object' && 
        plan.id && 
        plan.tier && 
        plan.name
      );
      
      setPlans(validPlans);
      setCurrentSubscription(subscriptionData);
      
      if (validPlans.length === 0) {
        console.warn('No subscription plans found. Make sure to run: python manage.py create_subscription_plans');
        if (plansArray.length > 0) {
          console.warn('Plans data exists but is invalid:', plansArray);
        }
      }
    } catch (error: any) {
      toast.error('Failed to load subscription plans');
      console.error('Subscription plans error:', error);
      console.error('Error response:', error.response?.data);
      setPlans([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: number, billingCycle: 'monthly' | 'annual' = 'monthly') => {
    setSubscribing(planId);
    try {
      const result = await subscribeToPlan(planId, billingCycle);
      // Redirect to payment page
      window.location.href = result.payment_url;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to subscribe');
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      await cancelSubscription();
      toast.success('Subscription cancelled successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return StarIcon;
      case 'family':
        return UserGroupIcon;
      default:
        return SparklesIcon;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-yellow-400';
      case 'family':
        return 'bg-purple-400';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream-50 pb-12">
        {/* Hero Header */}
        <div className="bg-primary-900 rounded-b-[3rem] border-b-4 border-l-4 border-r-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mb-12 relative overflow-hidden mx-4 mt-4">
          <div className="relative max-w-7xl mx-auto px-6 py-16 text-center">
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-white font-display uppercase tracking-tight">
              Choose Your <span className="text-yellow-400">Power</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-bold">
              Unlock premium features and get unlimited access to healthcare services with our solid plans.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Current Subscription Status */}
          {currentSubscription && currentSubscription.is_active && currentSubscription.plan && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-400 rounded-2xl p-6 mb-12 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="inline-block bg-black text-white px-3 py-1 rounded-lg text-sm font-black uppercase tracking-wider mb-2">
                    Active Plan
                  </div>
                  <h3 className="text-3xl font-black text-black font-display uppercase">{currentSubscription.plan?.name || 'Unknown'}</h3>
                  <p className="text-black font-bold mt-1">
                    Renews on {currentSubscription.current_period_end ? new Date(currentSubscription.current_period_end).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-white border-4 border-black text-black font-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:scale-95 transition-all uppercase tracking-wide"
                >
                  Cancel Subscription
                </button>
              </div>
            </motion.div>
          )}

          {/* Plans Grid */}
          {plans.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8">
              <p className="text-2xl font-black text-black mb-4">No subscription plans available.</p>
              <p className="text-lg text-gray-600 font-bold">
                Please contact support or check if plans have been configured.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {plans
                .filter((plan): plan is SubscriptionPlan => {
                  if (!plan || typeof plan !== 'object') return false;
                  if (!('id' in plan) || !plan.id) return false;
                  if (!('tier' in plan) || !plan.tier) return false;
                  return true;
                })
                .map((plan) => {
              const Icon = getPlanIcon(plan.tier);
              const isCurrentPlan = currentSubscription?.plan?.id === plan.id && currentSubscription?.is_active;
              const isFree = plan.tier === 'free';
              const headerColor = getPlanColor(plan.tier || 'free');

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (plan.id || 0) * 0.1 }}
                  className={`relative bg-white rounded-[2.5rem] overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col`}
                >
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4 z-10 bg-black text-white px-4 py-2 rounded-xl border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] text-xs font-black uppercase tracking-wider">
                      Current Plan
                    </div>
                  )}

                  <div className={`${headerColor} p-8 border-b-4 border-black relative`}>
                    <div className="bg-white w-16 h-16 rounded-2xl border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Icon className="h-8 w-8 text-black" />
                    </div>
                    <h3 className="text-4xl font-black text-black font-display uppercase tracking-tight mb-2">{plan.name || 'Unknown Plan'}</h3>
                    <p className="text-black font-bold text-base leading-tight opacity-90">{plan.description || ''}</p>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-8 p-6 bg-gray-50 rounded-2xl border-4 border-black/10">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-black text-black tracking-tight">
                          ₦{parseFloat(plan.monthly_price || '0').toLocaleString()}
                        </span>
                        <span className="text-gray-500 font-bold ml-2 uppercase text-sm">/month</span>
                      </div>
                      {plan.annual_price && parseFloat(plan.monthly_price || '0') > 0 && (
                        <div className="text-center mt-3">
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-black px-3 py-1 rounded-lg border-2 border-green-200 uppercase tracking-wide">
                            Save {Math.round((1 - parseFloat(plan.annual_price) / (parseFloat(plan.monthly_price || '1') * 12)) * 100)}% yearly
                          </span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features && typeof plan.features === 'object' && Object.entries(plan.features)
                        .filter(([key, value]) => {
                          if (typeof value === 'boolean' && value) return true;
                          if (key === 'max_appointments_per_month' && value === null) return true;
                          return false;
                        })
                        .map(([key, value]) => {
                          const featureNames: Record<string, string> = {
                            '24_7_support': '24/7 Support',
                            'export_reports': 'Export Reports',
                            'health_tracking': 'Health Tracking',
                            'priority_booking': 'Priority Booking',
                            'advanced_analytics': 'Advanced Analytics',
                            'medication_reminders': 'Medication Reminders',
                            'basic_reminders': 'Basic Reminders',
                            'family_dashboard': 'Family Dashboard',
                            'shared_reminders': 'Shared Reminders',
                            'max_appointments_per_month': 'Unlimited Appointments',
                          };
                          
                          let displayName = featureNames[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          if (key === 'max_appointments_per_month' && value === null) {
                            displayName = 'Unlimited Appointments';
                          }

                          return (
                            <li key={key} className="flex items-start gap-3">
                              <CheckCircleIconSolid className="h-6 w-6 text-black flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 font-bold leading-tight">
                                {displayName}
                              </span>
                            </li>
                          );
                        })}
                    </ul>

                    {!isFree && (
                      <div className="space-y-4 mt-auto">
                        <button
                          onClick={() => handleSubscribe(plan.id, 'monthly')}
                          disabled={isCurrentPlan || subscribing === plan.id}
                          className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wide border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            isCurrentPlan
                              ? 'bg-gray-100 text-gray-400 border-gray-300 shadow-none cursor-not-allowed'
                              : 'bg-primary text-white hover:bg-primary-600'
                          }`}
                        >
                          {subscribing === plan.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <Spinner size="sm" />
                              Processing...
                            </span>
                          ) : isCurrentPlan ? (
                            'Current Plan'
                          ) : (
                            'Subscribe Monthly'
                          )}
                        </button>
                        {plan.annual_price && (
                          <button
                            onClick={() => handleSubscribe(plan.id, 'annual')}
                            disabled={isCurrentPlan || subscribing === plan.id}
                            className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wide border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                              isCurrentPlan
                                ? 'bg-gray-50 text-gray-300 border-gray-200 shadow-none cursor-not-allowed'
                                : 'bg-white text-black hover:bg-gray-50'
                            }`}
                          >
                            Subscribe Annually
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
            .filter(Boolean)}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default SubscriptionPage;

