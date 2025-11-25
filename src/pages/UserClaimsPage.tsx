// src/pages/UserClaimsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  PlusIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { getUserClaims, createInsuranceClaim } from '../api/insuranceClaims';
import { InsuranceClaim, InsuranceClaimPayload } from '../types/insuranceClaims';
import ClaimListItem from '../features/insurance/components/ClaimListItem';
import ClaimSubmissionForm from '../features/insurance/components/ClaimSubmissionForm';
import Modal from '../components/common/Modal';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const UserClaimsPage: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

  const sortClaims = (data: InsuranceClaim[]): InsuranceClaim[] => {
    return [...data].sort(
      (a, b) => new Date(b.date_submitted).getTime() - new Date(a.date_submitted).getTime()
    );
  };

  const fetchClaims = useCallback(
    async (url: string | null = null, reset: boolean = true) => {
      if (url) setIsLoadingMore(true);
      else if (reset) {
        setIsLoading(true);
        setClaims([]);
        setNextPageUrl(null);
        setTotalCount(0);
      }
      setError(null);

      try {
        const response = await getUserClaims(url);
        const newClaims = response.results;
        setClaims((prev) => sortClaims(url ? [...prev, ...newClaims] : newClaims));
        setNextPageUrl(response.next);
        if (reset || !url) setTotalCount(response.count);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load your insurance claims.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchClaims(null, true);
  }, [fetchClaims]);

  const handleAddClick = () => {
    setShowFormModal(true);
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
  };

  const handleFormSubmit = async (payload: InsuranceClaimPayload) => {
    setIsSubmittingForm(true);
    try {
      await createInsuranceClaim(payload);
      toast.success('Insurance claim submitted successfully!');
      setShowFormModal(false);
      await fetchClaims(null, true);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to submit claim.';
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-primary-600">
        {/* Animated Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -60, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-primary-500/20 rounded-full blur-3xl"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div>
              <motion.button
                whileHover={{ x: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/insurance')}
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Insurance
              </motion.button>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                <SparklesIcon className="h-6 w-6 text-white/80" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Insurance Claims
              </h1>
              <p className="text-lg text-white/90">
                Submit and track your insurance claims
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddClick}
              className="px-6 py-3 bg-white text-teal-600 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Submit New Claim
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Modal
          isOpen={showFormModal}
          onClose={handleFormCancel}
          title="Submit New Insurance Claim"
        >
          <ClaimSubmissionForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isSubmittingForm}
          />
        </Modal>

        {isLoading && claims.length === 0 && (
          <div className="space-y-4">
            <Skeleton count={5} height="150px" />
          </div>
        )}

        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-center my-4"
          >
            <p className="text-red-600 font-medium">{error}</p>
          </motion.div>
        )}

        {!isLoading && !error && claims.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-3xl shadow-lg border-2 border-gray-100"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block mb-4"
            >
              <DocumentTextIcon className="h-20 w-20 text-gray-300 mx-auto" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Claims Submitted Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Submit your insurance claims here to track their status and get reimbursed for
              medical expenses.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddClick}
              type="button"
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg flex items-center gap-2 mx-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Submit Your First Claim
            </motion.button>
          </motion.div>
        )}

        {claims.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {totalCount > 0 && (
              <p className="text-sm text-gray-600 mb-4">
                Showing {claims.length} of {totalCount} claim{totalCount !== 1 ? 's' : ''}
              </p>
            )}
            {claims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ClaimListItem claim={claim} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {nextPageUrl && !isLoadingMore && (
          <div className="mt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchClaims(nextPageUrl, false)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
            >
              Load More Claims
            </motion.button>
          </div>
        )}

        {isLoadingMore && (
          <p className="text-center text-gray-600 py-4 text-sm">Loading more...</p>
        )}

        {!isLoading && !nextPageUrl && totalCount > 0 && claims.length === totalCount && (
          <p className="text-center text-gray-500 text-sm mt-6">
            All {totalCount} claim{totalCount !== 1 ? 's' : ''} loaded.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserClaimsPage;
