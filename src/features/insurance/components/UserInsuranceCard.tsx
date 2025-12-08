// src/features/insurance/components/UserInsuranceCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  IdentificationIcon as ViewCardIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { UserInsurance } from '../../../types/insurance';
import DigitalInsuranceCardModal from './DigitalInsuranceCardModal';
import { useAuth } from '../../../contexts/AuthContext';

interface UserInsuranceCardProps {
  insurance: UserInsurance;
  onEdit: (insurance: UserInsurance) => void;
  onDelete: (id: number) => void;
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

const UserInsuranceCard: React.FC<UserInsuranceCardProps> = ({
  insurance,
  onEdit,
  onDelete,
}) => {
  const [showDigitalCardModal, setShowDigitalCardModal] = useState(false);
  const { user } = useAuth();

  const provider = insurance.plan?.provider;
  const plan = insurance.plan;
  const placeholderLogo = '/default-provider-logo.png';

  if (!plan || !provider) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-red-200">
        <p className="text-sm text-red-700 font-medium mb-2">Incomplete Insurance Data</p>
        <p className="text-xs text-red-600 mb-4">
          Policy: {insurance.policy_number || 'N/A'}. Please edit or remove this entry.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(insurance)}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(insurance.id)}
            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  const memberName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || 'N/A';

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
          insurance.is_primary
            ? 'border-primary-500 ring-2 ring-primary-200'
            : 'border-gray-100'
        } overflow-hidden group`}
      >
        {/* Primary Badge */}
        {insurance.is_primary && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="font-bold text-sm">Primary Insurance</span>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <img
                  src={provider.logo || placeholderLogo}
                  alt={`${provider.name} Logo`}
                  className="h-16 w-16 object-contain rounded-xl p-2 border-2 border-gray-200 bg-gray-50"
                  onError={(e) => (e.currentTarget.src = placeholderLogo)}
                />
                {insurance.is_primary && (
                  <div className="absolute -top-1 -right-1">
                    <ShieldCheckIcon className="h-6 w-6 text-primary-500" />
                  </div>
                )}
              </motion.div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-xl mb-1">{provider.name}</h3>
                <p className="text-sm text-primary font-semibold mb-1">
                  {plan.name}
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {plan.plan_type}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(insurance)}
                className="p-2 text-blue-500 hover:text-blue-700 rounded-xl hover:bg-blue-50 transition-colors"
                title="Edit"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(insurance.id)}
                className="p-2 text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <span className="text-xs font-medium text-gray-500 block mb-1">Member ID</span>
              <span className="text-sm font-bold text-gray-900">{insurance.member_id}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <span className="text-xs font-medium text-gray-500 block mb-1">Policy #</span>
              <span className="text-sm font-bold text-gray-900">{insurance.policy_number}</span>
            </div>
            {insurance.group_number && (
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-xs font-medium text-gray-500 block mb-1">Group #</span>
                <span className="text-sm font-bold text-gray-900">{insurance.group_number}</span>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-3">
              <span className="text-xs font-medium text-gray-500 block mb-1 flex items-center gap-1">
                <CalendarDaysIcon className="h-3.5 w-3.5" />
                Effective
              </span>
              <span className="text-sm font-bold text-gray-900">
                {formatDate(insurance.start_date)}
                {insurance.end_date ? ` - ${formatDate(insurance.end_date)}` : ' - Current'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-4">
            <motion.button
              whileHover={{ x: 5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDigitalCardModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-50 to-teal-50 text-primary-700 rounded-xl font-semibold hover:from-primary-100 hover:to-teal-100 transition-all group border-2 border-primary-200"
            >
              <ViewCardIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              View Digital Card
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Digital Card Modal */}
      {insurance && (
        <DigitalInsuranceCardModal
          isOpen={showDigitalCardModal}
          onClose={() => setShowDigitalCardModal(false)}
          insurance={
            { ...insurance, user_name: memberName } as UserInsurance & { user_name: string }
          }
        />
      )}
    </>
  );
};

export default UserInsuranceCard;
