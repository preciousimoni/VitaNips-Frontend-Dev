// src/pages/UserInsurancePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { getUserInsurances, addUserInsurance, updateUserInsurance, deleteUserInsurance } from '../api/insurance';
import { UserInsurance, UserInsurancePayload } from '../types/insurance';
import UserInsuranceCard from '../features/insurance/components/UserInsuranceCard';
import UserInsuranceForm from '../features/insurance/components/UserInsuranceForm';
import Modal from '../components/common/Modal';
import Skeleton from '../components/ui/Skeleton';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const UserInsurancePage: React.FC = () => {
  const navigate = useNavigate();
  const [insurances, setInsurances] = useState<UserInsurance[]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingInsurance, setEditingInsurance] = useState<UserInsurance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const sortInsurances = (data: UserInsurance[]) => {
    return data.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      const nameA = a.plan?.provider?.name || '';
      const nameB = b.plan?.provider?.name || '';
      return nameA.localeCompare(nameB);
    });
  };

  const loadInitialInsurances = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsurances([]);
    setNextPageUrl(null);
    setTotalCount(0);
    try {
      const response = await getUserInsurances();
      if (response && Array.isArray(response.results)) {
        setInsurances(sortInsurances(response.results));
        setNextPageUrl(response.next);
        setTotalCount(response.count);
      } else {
        console.warn("Received unexpected insurance response:", response);
        setError("Failed to process insurance data.");
        setInsurances([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load your insurance records.";
      setError(errorMessage);
      console.error(err);
      setInsurances([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMoreInsurances = async () => {
    if (!nextPageUrl || isLoadingMore) return;
    setIsLoadingMore(true);
    setError(null);
    try {
      const response = await getUserInsurances(nextPageUrl);
      if (response && Array.isArray(response.results)) {
        setInsurances(prev => sortInsurances([...prev, ...response.results]));
        setNextPageUrl(response.next);
      } else {
        console.warn("Received unexpected insurance response on load more:", response);
        setError("Failed to process additional insurance data.");
        setNextPageUrl(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load more insurance plans.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadInitialInsurances();
  }, [loadInitialInsurances]);

  const handleAddClick = () => {
    setEditingInsurance(null);
    setShowFormModal(true);
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
    setEditingInsurance(null);
  };

  const handleFormSubmit = async (payload: UserInsurancePayload, id?: number) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await updateUserInsurance(id, payload);
        toast.success('Insurance plan updated successfully!');
      } else {
        await addUserInsurance(payload);
        toast.success('Insurance plan added successfully!');
      }
      setShowFormModal(false);
      setEditingInsurance(null);
      await loadInitialInsurances();
    } catch (err: any) {
      console.error("Failed to save insurance:", err);
      const errorMsg = err?.response?.data?.detail || err?.message || "Failed to save insurance plan.";
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (insurance: UserInsurance) => {
    setEditingInsurance(insurance);
    setShowFormModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteUserInsurance(deleteId);
      toast.success('Insurance plan removed successfully!');
      setShowConfirmDialog(false);
      setDeleteId(null);
      await loadInitialInsurances();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove insurance plan.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setDeleteId(null);
  };

  const primaryInsurance = insurances.find(ins => ins.is_primary);

  return (

    <div className="min-h-screen bg-cream-50 font-sans">
      {/* Hero Section */}
      <div className="relative bg-primary-900 rounded-b-[3rem] overflow-hidden mb-12 shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mx-4 mt-4 md:mx-6">
          <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="text-white">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="bg-accent p-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3">
                              <ShieldCheckIcon className="h-10 w-10 text-primary-900" />
                          </div>
                          <h1 className="text-4xl md:text-5xl font-black text-amber-400 font-display uppercase tracking-tight">
                              Insurance Plans
                          </h1>
                      </div>
                      <p className="text-white/90 text-lg font-bold max-w-xl opacity-90 pl-2">
                          Manage your health insurance coverage and view benefits
                      </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                      <button 
                        onClick={() => navigate('/insurance/claims')}
                        className="px-6 py-3 bg-white/10 border-2 border-white/20 text-white rounded-xl hover:bg-white hover:text-primary-900 transition-all font-bold text-sm flex items-center justify-center gap-2"
                      >
                          <DocumentTextIcon className="h-5 w-5" />
                          View Claims
                      </button>
                      <button 
                          onClick={() => {
                              setEditingInsurance(null);
                              setShowFormModal(true);
                          }}
                          className="px-6 py-3 bg-accent text-primary-900 rounded-xl hover:bg-white hover:scale-105 transition-all font-black text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                      >
                          <PlusIcon className="h-5 w-5" />
                          Add New Plan
                      </button>
                  </div>
              </div>

              {/* Primary Insurance Badge */}
              {primaryInsurance && (
                <div className="mt-8 p-4 bg-white/10 rounded-2xl border-2 border-white/20 inline-block">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-accent" />
                    <div>
                      <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Primary Insurance</p>
                      <p className="text-white font-black text-lg">
                        {primaryInsurance.plan.provider.name} - {primaryInsurance.plan.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Modal
          isOpen={showFormModal}
          onClose={handleFormCancel}
          title={editingInsurance ? 'Edit Insurance Plan' : 'Add Insurance Plan'}
        >
          <UserInsuranceForm
            initialData={editingInsurance}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isSubmitting}
          />
        </Modal>

        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Remove Insurance Plan"
          message="Are you sure you want to remove this insurance plan? This action cannot be undone."
          confirmText="Remove"
          cancelText="Cancel"
          isLoading={isDeleting}
        />

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton count={3} height="200px" />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border-4 border-red-200 rounded-[2rem] text-center shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
            <p className="text-red-900 font-black text-lg">{error}</p>
          </div>
        ) : (
          <>
            {totalCount > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-600 mb-6"
              >
                Showing {insurances.length} of {totalCount} plan{totalCount !== 1 ? 's' : ''}
              </motion.p>
            )}

            {insurances.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {insurances.map((ins, index) => (
                  <motion.div
                    key={ins.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <UserInsuranceCard
                      insurance={ins}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
                <div className="inline-block mb-6 p-6 bg-cream-50 rounded-full border-4 border-black">
                  <ShieldCheckIcon className="h-24 w-24 text-primary-900 mx-auto" />
                </div>
                <h3 className="text-3xl font-black text-primary-900 mb-2 font-display">No Insurance Plans Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto font-medium text-lg">
                  Add your health insurance plans to manage coverage, view digital cards, and track claims.
                </p>
                <button
                  onClick={handleAddClick}
                  className="px-8 py-4 bg-primary-900 text-white rounded-xl font-black text-lg hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-y-[2px] flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="h-6 w-6" />
                  Add Your First Plan
                </button>
              </div>
            )}

            {nextPageUrl && (
              <div className="mt-8 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMoreInsurances}
                  disabled={isLoadingMore}
                  className="px-8 py-4 bg-white border-2 border-primary-900 text-primary-900 rounded-xl font-black hover:bg-primary-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Plans'}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserInsurancePage;
