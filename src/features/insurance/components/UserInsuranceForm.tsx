// src/features/insurance/components/UserInsuranceForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Spinner from '../../../components/ui/Spinner';
import { UserInsurance, UserInsurancePayload, InsurancePlan } from '../../../types/insurance';
import { getAvailablePlans, verifyInsuranceDetails } from '../../../api/insurance';
import toast from 'react-hot-toast';

interface UserInsuranceFormProps {
  initialData?: UserInsurance | null;
  onSubmit: (payload: UserInsurancePayload, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const UserInsuranceForm: React.FC<UserInsuranceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<Partial<UserInsurancePayload>>({
    plan: undefined,
    policy_number: '',
    group_number: null,
    member_id: '',
    start_date: '',
    end_date: null,
    is_primary: false,
  });
  const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<{ valid: boolean; message?: string } | null>(null);

  useEffect(() => {
    setLoadingPlans(true);
    getAvailablePlans()
      .then((response) => {
        if (response && Array.isArray(response.results)) {
          setAvailablePlans(response.results);
        } else {
          console.warn('Received unexpected available plans structure:', response);
          setError('Failed to process available insurance plans.');
          setAvailablePlans([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching available plans:', err);
        setError('Failed to load available insurance plans.');
        setAvailablePlans([]);
      })
      .finally(() => setLoadingPlans(false));
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        plan: initialData.plan.id,
        policy_number: initialData.policy_number || '',
        group_number: initialData.group_number || null,
        member_id: initialData.member_id || '',
        start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
        end_date: initialData.end_date ? initialData.end_date.split('T')[0] : null,
        is_primary: initialData.is_primary || false,
      });
    } else {
      setFormData({
        plan: undefined,
        policy_number: '',
        group_number: null,
        member_id: '',
        start_date: '',
        end_date: null,
        is_primary: false,
      });
    }
    setError(null);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    let processedValue: string | number | boolean | null = value;
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'plan') {
      processedValue = value ? parseInt(value, 10) : null;
    } else if ((name === 'end_date' || name === 'group_number') && value === '') {
      processedValue = null;
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    // Clear verification status when fields change
    if (name === 'member_id' || name === 'policy_number' || name === 'plan') {
      setVerificationStatus(null);
    }
  };

  const handleVerify = async () => {
    if (!formData.plan || !formData.member_id || !formData.policy_number) {
      toast.error('Please fill in Plan, Member ID, and Policy Number before verifying.');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus(null);
    setError(null);

    try {
      const result = await verifyInsuranceDetails({
        plan_id: formData.plan as number,
        member_id: formData.member_id,
        policy_number: formData.policy_number,
      });

      setVerificationStatus({
        valid: result.valid,
        message: result.message || result.error,
      });

      if (result.valid) {
        toast.success(result.message || 'Insurance details verified successfully!');
      } else {
        toast.error(result.error || result.message || 'Verification failed. Please check your details.');
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Failed to verify insurance details.';
      setVerificationStatus({
        valid: false,
        message: errorMsg,
      });
      toast.error(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.plan || !formData.policy_number || !formData.member_id || !formData.start_date) {
      setError('Insurance Plan, Policy Number, Member ID, and Start Date are required.');
      return;
    }

    const payload: UserInsurancePayload = {
      plan: formData.plan as number,
      policy_number: formData.policy_number,
      group_number: formData.group_number || null,
      member_id: formData.member_id,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      is_primary: formData.is_primary || false,
    };

    try {
      await onSubmit(payload, initialData?.id);
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'Failed to save insurance record.');
    }
  };

  const selectedPlan = availablePlans.find((p) => p.id === formData.plan);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
        >
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </motion.div>
      )}

      <div className="space-y-5">
        {/* Insurance Plan Selection */}
        <div>
          <label htmlFor="plan" className="block text-sm font-bold text-gray-700 mb-2">
            Insurance Plan <span className="text-red-500">*</span>
          </label>
          <select
            name="plan"
            id="plan"
            required
            value={formData.plan ?? ''}
            onChange={handleChange}
            disabled={loadingPlans}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:bg-gray-100"
          >
            <option value="" disabled>
              {loadingPlans ? 'Loading plans...' : '-- Select a Plan --'}
            </option>
            {availablePlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.provider.name} - {plan.name} ({plan.plan_type})
              </option>
            ))}
          </select>
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 bg-primary-50 rounded-xl border-2 border-primary-200"
            >
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="h-5 w-5 text-primary-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{selectedPlan.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedPlan.description}</p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-gray-600">
                      Premium: <span className="font-bold text-primary">₦{parseFloat(selectedPlan.monthly_premium).toLocaleString()}/mo</span>
                    </span>
                    <span className="text-gray-600">
                      Deductible: <span className="font-bold">₦{parseFloat(selectedPlan.annual_deductible).toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Member ID */}
        <div>
          <label htmlFor="member_id" className="block text-sm font-bold text-gray-700 mb-2">
            Member ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="member_id"
            id="member_id"
            required
            value={formData.member_id ?? ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="Enter your member ID"
          />
        </div>

        {/* Policy Number */}
        <div>
          <label htmlFor="policy_number" className="block text-sm font-bold text-gray-700 mb-2">
            Policy Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="policy_number"
            id="policy_number"
            required
            value={formData.policy_number ?? ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="Enter your policy number"
          />
        </div>

        {/* Verification Section */}
        {formData.plan && formData.member_id && formData.policy_number && (
          <div>
            <motion.button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || !formData.plan || !formData.member_id || !formData.policy_number}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold hover:from-primary-dark hover:to-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary-200"
            >
              {isVerifying ? (
                <>
                  <Spinner size="sm" color="text-white" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Verify Member ID & Policy Number</span>
                </>
              )}
            </motion.button>

            {verificationStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 p-4 rounded-xl border-2 ${
                  verificationStatus.valid
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {verificationStatus.valid ? (
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${
                      verificationStatus.valid ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                      {verificationStatus.valid ? 'Verification Successful' : 'Verification Failed'}
                    </p>
                    {verificationStatus.message && (
                      <p className={`text-xs mt-1 ${
                        verificationStatus.valid ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {verificationStatus.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Group Number */}
        <div>
          <label htmlFor="group_number" className="block text-sm font-bold text-gray-700 mb-2">
            Group Number <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            name="group_number"
            id="group_number"
            value={formData.group_number ?? ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="Enter group number if applicable"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-bold text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              id="start_date"
              required
              value={formData.start_date ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-bold text-gray-700 mb-2">
              End Date <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="date"
              name="end_date"
              id="end_date"
              value={formData.end_date ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Primary Checkbox */}
        <div className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
          <input
            type="checkbox"
            name="is_primary"
            id="is_primary"
            checked={formData.is_primary ?? false}
            onChange={handleChange}
            className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="is_primary" className="ml-3 block text-sm font-semibold text-gray-900">
            Set as Primary Insurance Plan
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          disabled={isSubmitting || loadingPlans}
          whileHover={{ scale: isSubmitting || loadingPlans ? 1 : 1.05 }}
          whileTap={{ scale: isSubmitting || loadingPlans ? 1 : 0.95 }}
          className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" />
              Saving...
            </>
          ) : initialData ? (
            'Update Plan'
          ) : (
            'Add Plan'
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default UserInsuranceForm;
