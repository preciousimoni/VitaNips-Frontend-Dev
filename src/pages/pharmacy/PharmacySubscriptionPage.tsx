import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ShieldCheckIcon, 
  CreditCardIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { getPharmacySubscription, renewPharmacySubscription, PharmacySubscriptionRecord } from '../../api/payments';
import axiosInstance from '../../api/axiosInstance';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/date';

const PharmacySubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<PharmacySubscriptionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const sub = await getPharmacySubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      // Don't show error toast if it's just 404 (inactive)
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      await axiosInstance.post('/payments/subscriptions/pharmacy/activate/');
      toast.success('Subscription activated successfully!');
      // Refresh subscription data
      await fetchSubscription();
    } catch (error: any) {
      console.error('Activation error:', error);
      toast.error(error.response?.data?.error || 'Failed to activate subscription');
    } finally {
      setActivating(false);
    }
  };

  const handleRenew = async () => {
    setRenewing(true);
    try {
      // Hardcoded plan ID 1 for Standard Registration
      const response = await renewPharmacySubscription(1);
      
      if (response.payment_url) {
        toast.success('Redirecting to payment...');
        window.location.href = response.payment_url;
      } else {
        toast.success('Subscription renewed successfully!');
        fetchSubscription();
      }
    } catch (error: any) {
      console.error('Failed to renew subscription:', error);
      toast.error(error.response?.data?.error || 'Failed to renew subscription');
    } finally {
      setRenewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  const isActive = subscription?.status === 'active' && subscription?.is_active;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className={`p-8 text-white text-center ${isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}>
            <div className="mx-auto bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm shadow-lg">
              <ShieldCheckIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-2">Pharmacy Registration</h2>
            <p className="text-white/90 text-lg font-medium">
              {isActive ? 'Your pharmacy is fully registered and active.' : 'Your registration is inactive or expired.'}
            </p>
          </div>

          <div className="p-8 md:p-12">
            {isActive ? (
              <div className="space-y-8">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
                  <CheckCircleIcon className="h-8 w-8 text-emerald-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Active Subscription</h3>
                    <p className="text-emerald-700">
                      You have full access to receive orders and manage your inventory.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Plan</p>
                    <p className="text-xl font-black text-gray-900">{subscription?.plan?.name || 'Standard Plan'}</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Expires On</p>
                    <p className="text-xl font-black text-gray-900">{formatDate(subscription?.current_period_end)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex items-start gap-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-orange-900 mb-2">Action Required</h3>
                    <p className="text-orange-700">
                      Your pharmacy registration is inactive. You cannot receive new orders until you renew your subscription.
                    </p>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-primary/30 transition-all shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-gray-900">Standard Registration</h3>
                    <span className="text-2xl font-black text-primary">₦50,000<span className="text-sm text-gray-500 font-medium">/year</span></span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-600">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                      Unlimited Medication Orders
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                      Inventory Management System
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                      Verified Pharmacy Badge
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                      Priority Support
                    </li>
                  </ul>
                  
                  {/* Activate Button for Already Paid Users */}
                  <button
                    onClick={handleActivate}
                    disabled={activating}
                    className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                  >
                    {activating ? (
                      <>
                        <Spinner size="sm" className="mr-3 text-white" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-6 w-6 mr-2" />
                        Activate Paid Subscription
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-emerald-700 mb-4 bg-emerald-50 p-2 rounded-lg">
                    Already paid? Click above to activate your subscription.
                  </p>
                  
                  <button
                    onClick={handleRenew}
                    disabled={renewing}
                    className="w-full py-4 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {renewing ? (
                      <>
                        <Spinner size="sm" className="mr-3 text-white" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="h-6 w-6 mr-2" />
                        Pay & Renew Subscription
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-4">
                    Secure payment via Flutterwave. Your subscription will be active immediately after payment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PharmacySubscriptionPage;
