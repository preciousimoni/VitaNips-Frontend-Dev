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
      whileHover={{ y: -4 }}
      className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 border-4 border-black overflow-hidden group"
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-accent rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <DocumentTextIcon className="h-6 w-6 text-primary-900" />
              </div>
              <div>
                <h3 className="font-black text-primary-900 text-xl font-display uppercase tracking-tight">
                  {claim.claim_number || `CLAIM #${claim.id}`}
                </h3>
                {claim.user_insurance_display?.plan?.provider?.name && (
                  <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-wide">
                    {claim.user_insurance_display.plan.provider.name} • {claim.user_insurance_display.plan.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider ${statusInfo.bgColor} ${statusInfo.color} border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
          >
            <statusInfo.icon className="h-5 w-5" />
            {statusInfo.text}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-cream-50 rounded-2xl p-4 border-2 border-primary-900/10">
            <div className="flex items-center gap-2 mb-2">
              <BuildingOfficeIcon className="h-5 w-5 text-accent" />
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Medical Provider</span>
            </div>
            <p className="text-base font-bold text-primary-900">{claim.provider_name}</p>
          </div>

          <div className="bg-cream-50 rounded-2xl p-4 border-2 border-primary-900/10">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDaysIcon className="h-5 w-5 text-accent" />
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Service Date</span>
            </div>
            <p className="text-base font-bold text-primary-900">
              {formatDateDisplay(claim.service_date)}
            </p>
          </div>

          <div className="bg-cream-50 rounded-2xl p-4 border-2 border-primary-900/10 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <BanknotesIcon className="h-5 w-5 text-accent" />
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Amount Claimed</span>
            </div>
            <p className="text-xl font-black text-primary-900 relative z-10">
              ₦{parseFloat(claim.claimed_amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {claim.approved_amount && (
            <div className="bg-green-100 rounded-2xl p-4 border-2 border-green-600 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <CheckCircleIcon className="h-5 w-5 text-green-700" />
                <span className="text-xs font-black text-green-800 uppercase tracking-widest">Amount Approved</span>
              </div>
              <p className="text-xl font-black text-green-800 relative z-10">
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
          <div className="mb-6 p-5 bg-white rounded-2xl border-2 border-gray-200">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description of Service</p>
            <p className="text-sm font-medium text-gray-800 leading-relaxed">{claim.service_description}</p>
          </div>
        )}

        {/* Dates and Notes */}
        <div className="flex flex-wrap gap-6 text-xs text-gray-500 pt-6 border-t-2 border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
            <span>
              SUBMITTED: <span className="font-bold text-gray-700">{formatDateDisplay(claim.date_submitted)}</span>
            </span>
          </div>
          {claim.date_processed && (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <CheckCircleIcon className="h-4 w-4 text-gray-400" />
              <span>
                PROCESSED: <span className="font-bold text-gray-700">{formatDateDisplay(claim.date_processed)}</span>
              </span>
            </div>
          )}
        </div>

        {claim.notes && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <p className="text-xs font-black text-yellow-800 uppercase tracking-widest mb-1">Notes from Admin</p>
            <p className="text-sm font-bold text-yellow-900">{claim.notes}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClaimListItem;
