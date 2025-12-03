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
        return 'from-yellow-400 to-orange-500';
      case 'family':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600">
            Unlock premium features and get unlimited access to healthcare services
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && currentSubscription.is_active && currentSubscription.plan && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-6 mb-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Current Plan: {currentSubscription.plan?.name || 'Unknown'}</h3>
                <p className="text-primary-100">
                  Renews on {currentSubscription.current_period_end ? new Date(currentSubscription.current_period_end).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No subscription plans available.</p>
            <p className="text-sm text-gray-500">
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

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (plan.id || 0) * 0.1 }}
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden border-2 ${
                  isCurrentPlan ? 'border-primary' : 'border-gray-200'
                } ${plan.tier === 'premium' ? 'ring-4 ring-yellow-200' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                    Current Plan
                  </div>
                )}

                <div className={`bg-gradient-to-br ${getPlanColor(plan.tier || 'free')} p-8 text-white`}>
                  <Icon className="h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-black mb-2">{plan.name || 'Unknown Plan'}</h3>
                  <p className="text-white/90 text-sm">{plan.description || ''}</p>
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-black text-gray-900">
                        ₦{parseFloat(plan.monthly_price || '0').toLocaleString()}
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                    {plan.annual_price && parseFloat(plan.monthly_price || '0') > 0 && (
                      <div className="text-sm text-gray-600">
                        or ₦{parseFloat(plan.annual_price).toLocaleString()}/year
                        <span className="text-green-600 font-semibold ml-2">
                          (Save {Math.round((1 - parseFloat(plan.annual_price) / (parseFloat(plan.monthly_price || '1') * 12)) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features && typeof plan.features === 'object' && Object.entries(plan.features)
                      .filter(([key, value]) => {
                        // Only show features that are True (enabled)
                        if (typeof value === 'boolean' && value) return true;
                        // Show unlimited appointments
                        if (key === 'max_appointments_per_month' && value === null) return true;
                        return false;
                      })
                      .map(([key, value]) => {
                        // Format feature names for display
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
                        
                        if (key === 'max_appointments_per_month' && value === null) {
                          return (
                            <li key={key} className="flex items-center gap-2">
                              <CheckCircleIconSolid className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">Unlimited Appointments</span>
                            </li>
                          );
                        }
                        
                        if (typeof value === 'boolean' && value) {
                          return (
                            <li key={key} className="flex items-center gap-2">
                              <CheckCircleIconSolid className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">
                                {featureNames[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </li>
                          );
                        }
                        return null;
                      })}
                  </ul>

                  {!isFree && (
                    <div className="space-y-3">
                      <button
                        onClick={() => handleSubscribe(plan.id, 'monthly')}
                        disabled={isCurrentPlan || subscribing === plan.id}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${
                          isCurrentPlan
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:shadow-lg'
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
                          className={`w-full py-3 rounded-xl font-bold transition-all border-2 ${
                            isCurrentPlan
                              ? 'border-gray-200 text-gray-500 cursor-not-allowed'
                              : 'border-primary text-primary hover:bg-primary/10'
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
    </PageWrapper>
  );
};

export default SubscriptionPage;

