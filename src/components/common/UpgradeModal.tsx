// src/components/common/UpgradeModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  XMarkIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  feature?: string;
  currentLimit?: number;
  showFeatures?: boolean;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  title = "Upgrade to Premium",
  message = "Unlock unlimited appointments and premium features",
  feature,
  currentLimit,
  showFeatures = true
}) => {
  if (!isOpen) return null;

  const premiumFeatures = [
    "Unlimited appointments",
    "Priority booking",
    "Advanced health analytics",
    "Health report exports",
    "24/7 chat support",
    "Medication reminders"
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-50 inline-block align-bottom bg-white rounded-3xl shadow-2xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          >
            <div className="bg-white px-6 py-6 sm:px-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                    <StarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">{message}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              {/* Limit Reached Message */}
              {currentLimit !== undefined && (
                <div className="bg-gradient-to-r from-primary/10 to-emerald-50 rounded-2xl p-6 mb-6 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <ExclamationTriangleIcon className="h-6 w-6 text-primary" />
                    <h4 className="font-bold text-gray-900">Monthly Limit Reached</h4>
                  </div>
                  <p className="text-gray-700">
                    You've used all {currentLimit} of your free appointments this month.
                    {feature && (
                      <span className="block mt-2 font-semibold">
                        Upgrade to continue using {feature}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Premium Features */}
              {showFeatures && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-4">Premium Features Include:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircleIconSolid className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border-2 border-yellow-200">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-4xl font-black text-gray-900">
                      ₦4,999
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    or ₦49,990/year (Save 17%)
                  </p>
                  <Link
                    to="/subscription"
                    onClick={onClose}
                    className="inline-block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    View Plans & Upgrade
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Maybe Later
                </button>
                <Link
                  to="/subscription"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-center"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default UpgradeModal;

