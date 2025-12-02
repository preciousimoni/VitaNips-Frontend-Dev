// src/pages/PremiumFeaturesPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  getPremiumFeatures,
  purchasePremiumFeature,
  subscribePremiumSOS,
  cancelPremiumSOS,
  PremiumFeaturesList
} from '../api/payments';
import Spinner from '../components/ui/Spinner';
import PageWrapper from '../components/common/PageWrapper';

const PremiumFeaturesPage: React.FC = () => {
  const [featuresData, setFeaturesData] = useState<PremiumFeaturesList | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const data = await getPremiumFeatures();
      setFeaturesData(data);
    } catch (error: any) {
      toast.error('Failed to load premium features');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (featureKey: string) => {
    setPurchasing(featureKey);
    try {
      const result = await purchasePremiumFeature(featureKey);
      // Redirect to payment page
      window.location.href = result.payment_url;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to purchase feature');
      setPurchasing(null);
    }
  };

  const handleSOSSubscribe = async () => {
    setPurchasing('premium_sos');
    try {
      const result = await subscribePremiumSOS();
      window.location.href = result.payment_url;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to subscribe');
      setPurchasing(null);
    }
  };

  const getFeatureIcon = (key: string) => {
    switch (key) {
      case 'health_report':
        return DocumentTextIcon;
      case 'priority_booking':
        return StarIcon;
      case 'extended_consultation':
        return ClockIcon;
      case 'premium_sos':
        return ShieldCheckIcon;
      default:
        return CheckCircleIcon;
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

  if (!featuresData) {
    return null;
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Premium Features</h1>
          <p className="text-lg text-gray-600">
            Enhance your healthcare experience with premium features
          </p>
          {featuresData.has_premium && (
            <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
              <StarIcon className="h-5 w-5" />
              Premium Member
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(featuresData.features).map(([key, feature]) => {
            const Icon = getFeatureIcon(key);
            const isFree = feature.is_free;
            const isSOS = key === 'premium_sos';

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-primary to-emerald-600 rounded-xl">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{feature.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    {isFree ? (
                      <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        <CheckCircleIcon className="h-4 w-4" />
                        Free for Premium Users
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-gray-900">
                          ₦{parseFloat(feature.price).toLocaleString()}
                        </span>
                        {isSOS && (
                          <span className="text-gray-600">/month</span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => isSOS ? handleSOSSubscribe() : handlePurchase(key)}
                    disabled={isFree || purchasing === key}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      isFree
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:shadow-lg disabled:opacity-50'
                    }`}
                  >
                    {purchasing === key ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner size="sm" />
                        Processing...
                      </span>
                    ) : isFree ? (
                      'Included in Your Plan'
                    ) : isSOS ? (
                      'Subscribe Now'
                    ) : (
                      'Purchase Now'
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Upgrade Prompt */}
        {!featuresData.has_premium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-8 text-white text-center"
          >
            <h3 className="text-2xl font-black mb-2">Upgrade to Premium</h3>
            <p className="text-primary-100 mb-6">
              Get access to all premium features and save money on individual purchases
            </p>
            <a
              href="/subscription"
              className="inline-block bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              View Plans
            </a>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};

export default PremiumFeaturesPage;

