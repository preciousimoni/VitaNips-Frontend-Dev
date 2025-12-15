// src/pages/UserClaimsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  PlusIcon,

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
    <div className="min-h-screen bg-cream-50 font-sans">
      {/* Halo/Hero Section */}
      <div className="relative bg-primary-900 rounded-b-[3rem] overflow-hidden mb-12 shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mx-4 mt-4 md:mx-6">
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
          >
            <div>
              <motion.button
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/insurance')}
                className="inline-flex items-center text-white/80 hover:text-amber-400 mb-6 transition-colors font-bold tracking-wide"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                BACK TO INSURANCE
              </motion.button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-accent p-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
                    <DocumentTextIcon className="h-10 w-10 text-primary-900" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-amber-400 font-display uppercase tracking-tight">
                  Insurance Claims
                </h1>
              </div>
              
              <p className="text-xl text-white font-medium max-w-xl leading-relaxed opacity-90 ml-2">
                Submit and track your insurance claims with ease.
              </p>
            </div>

            <motion.button
              whileHover={{ y: -4, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddClick}
              className="px-8 py-4 bg-white text-primary-900 rounded-2xl font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 transition-all"
            >
              <PlusIcon className="h-6 w-6 stroke-3" />
              SUBMIT NEW CLAIM
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
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
            className="p-6 bg-red-500 text-white border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center my-8"
          >
            <p className="font-black text-xl uppercase tracking-wide">{error}</p>
          </motion.div>
        )}

        {!isLoading && !error && claims.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-[3rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] px-6"
          >
            <div className="inline-block mb-6 relative">
                <div className="absolute inset-0 bg-accent rounded-full blur-xl opacity-20 transform scale-150"></div>
                <DocumentTextIcon className="h-24 w-24 text-primary-900 relative z-10" />
            </div>
            <h3 className="text-3xl font-black text-primary-900 mb-4 font-display uppercase">No Claims Submitted Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg font-medium">
              Submit your insurance claims here to track their status and get reimbursed for medical expenses.
            </p>
            <motion.button
              whileHover={{ y: -4, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddClick}
              type="button"
              className="px-8 py-4 bg-primary-900 text-white rounded-2xl font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 mx-auto transition-all"
            >
              <PlusIcon className="h-6 w-6" />
              SUBMIT YOUR FIRST CLAIM
            </motion.button>
          </motion.div>
        )}

        {claims.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {totalCount > 0 && (
              <div className="bg-primary-900/5 inline-block px-4 py-2 rounded-xl border-2 border-primary-900/10 mb-4">
                  <p className="text-primary-900 font-bold">
                    Showing {claims.length} of {totalCount} claim{totalCount !== 1 ? 's' : ''}
                  </p>
              </div>
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
          <div className="mt-12 text-center">
            <motion.button
              whileHover={{ y: -4, boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fetchClaims(nextPageUrl, false)}
              className="px-8 py-4 bg-white text-primary-900 rounded-2xl font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wide"
            >
              Load More Claims
            </motion.button>
          </div>
        )}

        {isLoadingMore && (
          <p className="text-center text-gray-600 py-8 font-bold animate-pulse">Loading more claims...</p>
        )}

        {!isLoading && !nextPageUrl && totalCount > 0 && claims.length === totalCount && (
          <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs mt-12">
            — All claims loaded —
          </p>
        )}
      </div>
    </div>
  );
};

export default UserClaimsPage;
