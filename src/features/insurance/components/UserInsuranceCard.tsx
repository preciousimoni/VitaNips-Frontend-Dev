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


  if (!plan || !provider) {
    return (
      <div className="bg-white p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-red-500">
        <p className="text-sm text-red-900 font-bold mb-2 uppercase tracking-wide">Incomplete Insurance Data</p>
        <p className="text-xs text-red-700 mb-4 font-medium">
          Policy: {insurance.policy_number || 'N/A'}. Please edit or remove this entry.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(insurance)}
            className="text-primary-900 hover:text-white p-2 rounded-lg border-2 border-primary-900 hover:bg-primary-900 transition-colors"
            title="Edit"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(insurance.id)}
            className="text-red-600 hover:text-white p-2 rounded-lg border-2 border-red-600 hover:bg-red-600 transition-colors"
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
        whileHover={{ y: -4 }}
        className={`bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 border-4 border-black overflow-hidden group relative`}
      >
        {/* Primary Badge */}
        {insurance.is_primary && (
          <div className="bg-primary-900 text-white px-6 py-2 flex items-center gap-2 border-b-4 border-black">
            <CheckCircleIcon className="h-5 w-5 text-accent" />
            <span className="font-black text-sm uppercase tracking-wider">Primary Insurance</span>
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-accent p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <ShieldCheckIcon className="h-6 w-6 text-primary-900" />
                </div>
                <h3 className="font-black text-primary-900 text-2xl font-display leading-none">{provider.name}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-primary-100 text-primary-900 border-2 border-primary-900/10">
                  {plan.plan_type}
                </span>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-wide">
                  {plan.name}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(insurance)}
                className="p-2 text-primary-900 border-2 border-transparent hover:border-black rounded-xl hover:bg-cream-50 transition-all"
                title="Edit"
              >
                <PencilSquareIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => onDelete(insurance.id)}
                className="p-2 text-red-500 border-2 border-transparent hover:border-red-500 rounded-xl hover:bg-red-50 transition-all"
                title="Delete"
              >
                <TrashIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-cream-50 rounded-xl p-4 border-2 border-primary-900/10">
              <span className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wide">Member ID</span>
              <span className="text-sm font-black text-primary-900 font-mono">{insurance.member_id}</span>
            </div>
            <div className="bg-cream-50 rounded-xl p-4 border-2 border-primary-900/10">
              <span className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wide">Policy #</span>
              <span className="text-sm font-black text-primary-900 font-mono">{insurance.policy_number}</span>
            </div>
            {insurance.group_number && (
              <div className="bg-cream-50 rounded-xl p-4 border-2 border-primary-900/10">
                <span className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wide">Group #</span>
                <span className="text-sm font-black text-primary-900 font-mono">{insurance.group_number}</span>
              </div>
            )}
            <div className="bg-cream-50 rounded-xl p-4 border-2 border-primary-900/10">
              <span className="text-xs font-bold text-gray-500 block mb-1 flex items-center gap-1 uppercase tracking-wide">
                <CalendarDaysIcon className="h-3.5 w-3.5" />
                Effective
              </span>
              <span className="text-sm font-black text-primary-900">
                {formatDate(insurance.start_date)}
                {insurance.end_date ? ` - ${formatDate(insurance.end_date)}` : ' - Current'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t-2 border-gray-100 pt-6">
            <button
              onClick={() => setShowDigitalCardModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-primary-900 text-white rounded-xl font-black text-lg hover:bg-black transition-all group border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
            >
              <ViewCardIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
              View Digital Card
            </button>
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
