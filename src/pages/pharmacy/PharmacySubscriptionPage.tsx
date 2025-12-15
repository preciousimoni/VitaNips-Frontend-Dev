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
    <div className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all mb-8 w-fit"
        >
          <ArrowLeftIcon className="h-5 w-5 stroke-[3]" />
          Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-4 border-black"
        >
          <div className={`p-8 text-white text-center border-b-4 border-black relative overflow-hidden ${isActive ? 'bg-emerald-600' : 'bg-orange-600'}`}>
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 mx-auto bg-black w-24 h-24 rounded-2xl flex items-center justify-center mb-4 border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transform rotate-3">
              <ShieldCheckIcon className={`h-12 w-12 ${isActive ? 'text-emerald-400' : 'text-orange-400'}`} />
            </div>
            <h2 className="relative z-10 text-3xl font-black mb-2 font-display uppercase tracking-wide text-white drop-shadow-md">Pharmacy Registration</h2>
            <p className="relative z-10 text-white font-bold text-lg bg-black/20 inline-block px-4 py-1 rounded-lg backdrop-blur-sm border border-white/10">
              {isActive ? 'Your pharmacy is fully registered and active.' : 'Your registration is inactive or expired.'}
            </p>
          </div>

          <div className="p-8 md:p-12">
            {isActive ? (
              <div className="space-y-8">
                <div className="bg-emerald-100 border-2 border-black rounded-2xl p-6 flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="bg-emerald-500 rounded-xl p-2 border-2 border-black text-white shrink-0">
                    <CheckCircleIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wide">Active Subscription</h3>
                    <p className="text-emerald-900 font-bold">
                      You have full access to receive orders and manage your inventory.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-cream-50 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <p className="text-xs text-black font-black uppercase tracking-wider mb-2 opacity-70">Plan</p>
                    <p className="text-2xl font-black text-black font-display tracking-tight">{subscription?.plan?.name || 'Standard Plan'}</p>
                  </div>
                  <div className="p-6 bg-cream-50 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <p className="text-xs text-black font-black uppercase tracking-wider mb-2 opacity-70">Expires On</p>
                    <p className="text-2xl font-black text-black font-display tracking-tight">{formatDate(subscription?.current_period_end)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-orange-100 border-2 border-black rounded-2xl p-6 flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="bg-orange-500 rounded-xl p-2 border-2 border-black text-white shrink-0">
                    <ExclamationTriangleIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wide">Action Required</h3>
                    <p className="text-orange-900 font-bold">
                      Your pharmacy registration is inactive. You cannot receive new orders until you renew your subscription.
                    </p>
                  </div>
                </div>

                <div className="bg-white border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <ShieldCheckIcon className="w-64 h-64 text-black transform rotate-12 translate-x-12 -translate-y-12" />
                   </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                    <h3 className="text-3xl font-black text-black font-display uppercase tracking-tight">Standard Registration</h3>
                    <div className="bg-black text-white px-4 py-2 rounded-xl transform -rotate-2 border-2 border-gray-800 shadow-lg">
                        <span className="text-3xl font-black">₦50,000</span>
                        <span className="text-sm font-bold text-gray-300 ml-1">/year</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8 bg-cream-50 p-6 rounded-2xl border-2 border-black relative z-10">
                    <li className="flex items-center text-black font-bold">
                      <div className="bg-emerald-500 rounded-full p-0.5 mr-3 border-2 border-black text-white">
                        <CheckCircleIcon className="h-4 w-4" />
                      </div>
                      Unlimited Medication Orders
                    </li>
                    <li className="flex items-center text-black font-bold">
                      <div className="bg-emerald-500 rounded-full p-0.5 mr-3 border-2 border-black text-white">
                         <CheckCircleIcon className="h-4 w-4" />
                      </div>
                      Inventory Management System
                    </li>
                    <li className="flex items-center text-black font-bold">
                      <div className="bg-emerald-500 rounded-full p-0.5 mr-3 border-2 border-black text-white">
                         <CheckCircleIcon className="h-4 w-4" />
                      </div>
                      Verified Pharmacy Badge
                    </li>
                    <li className="flex items-center text-black font-bold">
                       <div className="bg-emerald-500 rounded-full p-0.5 mr-3 border-2 border-black text-white">
                        <CheckCircleIcon className="h-4 w-4" />
                       </div>
                      Priority Support
                    </li>
                  </ul>
                  
                  {/* Activate Button for Already Paid Users */}
                  <div className="relative z-10 space-y-4">
                      <button
                        onClick={handleActivate}
                        disabled={activating}
                        className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wide rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mb-3"
                      >
                        {activating ? (
                          <>
                            <Spinner size="sm" className="mr-3 text-white" />
                            Activating...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-6 w-6 mr-2 stroke-[2.5]" />
                            Activate Paid Subscription
                          </>
                        )}
                      </button>
                      
                      <div className="text-center font-bold text-xs text-emerald-800 bg-emerald-100 p-2 rounded-lg border border-emerald-300 mx-auto w-fit">
                        Already paid? Click above to activate your subscription.
                      </div>
                      
                      <div className="border-t-2 border-dashed border-black my-6"></div>

                      <button
                        onClick={handleRenew}
                        disabled={renewing}
                        className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white font-black uppercase tracking-wide rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                      >
                        {renewing ? (
                          <>
                            <Spinner size="sm" className="mr-3 text-white" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <CreditCardIcon className="h-6 w-6 mr-2 stroke-[2.5]" />
                            Pay & Renew Subscription
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs font-bold text-gray-500 mt-4 uppercase tracking-wide">
                        Secure payment via Flutterwave. Active immediately.
                      </p>
                  </div>
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
