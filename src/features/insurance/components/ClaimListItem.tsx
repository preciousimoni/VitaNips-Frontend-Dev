// src/features/insurance/components/ClaimListItem.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  BanknotesIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { InsuranceClaim, ClaimStatus } from '../../../types/insuranceClaims';

interface ClaimListItemProps {
  claim: InsuranceClaim;
}

const formatDateDisplay = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const getStatusInfo = (status: ClaimStatus): {
  text: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
} => {
  switch (status) {
    case 'submitted':
      return {
        text: 'Submitted',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: InformationCircleIcon,
      };
    case 'in_review':
      return {
        text: 'In Review',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: ClockIcon,
      };
    case 'additional_info':
      return {
        text: 'Info Requested',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        icon: InformationCircleIcon,
      };
    case 'approved':
      return {
        text: 'Approved',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: CheckCircleIcon,
      };
    case 'partially_approved':
      return {
        text: 'Partially Approved',
        color: 'text-teal-700',
        bgColor: 'bg-teal-100',
        icon: CheckCircleIcon,
      };
    case 'denied':
      return {
        text: 'Denied',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: ExclamationTriangleIcon,
      };
    case 'paid':
      return {
        text: 'Paid',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-100',
        icon: CheckCircleIcon,
      };
    default:
      return {
        text: status,
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: InformationCircleIcon,
      };
  }
};

const ClaimListItem: React.FC<ClaimListItemProps> = ({ claim }) => {
  const statusInfo = getStatusInfo(claim.status);

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 overflow-hidden group"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-100 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Claim: {claim.claim_number || `ID ${claim.id}`}
                </h3>
                {claim.user_insurance_display?.plan?.provider?.name && (
                  <p className="text-sm text-gray-600 mt-1">
                    {claim.user_insurance_display.plan.provider.name} -{' '}
                    {claim.user_insurance_display.plan.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${statusInfo.bgColor} ${statusInfo.color} border-2 border-current/20`}
          >
            <statusInfo.icon className="h-5 w-5" />
            {statusInfo.text}
          </motion.div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
              <span className="text-xs font-medium text-gray-500">Medical Provider</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{claim.provider_name}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
              <span className="text-xs font-medium text-gray-500">Service Date</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {formatDateDisplay(claim.service_date)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BanknotesIcon className="h-5 w-5 text-gray-500" />
              <span className="text-xs font-medium text-gray-500">Amount Claimed</span>
            </div>
            <p className="text-lg font-bold text-primary">
              ₦{parseFloat(claim.claimed_amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {claim.approved_amount && (
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-xs font-medium text-green-700">Amount Approved</span>
              </div>
              <p className="text-lg font-bold text-green-700">
                ₦{parseFloat(claim.approved_amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
        </div>

        {/* Service Description */}
        {claim.service_description && (
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-1">Service Description</p>
            <p className="text-sm text-gray-700">{claim.service_description}</p>
          </div>
        )}

        {/* Dates and Notes */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <CalendarDaysIcon className="h-4 w-4" />
            <span>
              Submitted: <span className="font-semibold">{formatDateDisplay(claim.date_submitted)}</span>
            </span>
          </div>
          {claim.date_processed && (
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4" />
              <span>
                Processed: <span className="font-semibold">{formatDateDisplay(claim.date_processed)}</span>
              </span>
            </div>
          )}
        </div>

        {claim.notes && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-900 mb-1">Notes</p>
            <p className="text-xs text-gray-700">{claim.notes}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClaimListItem;
