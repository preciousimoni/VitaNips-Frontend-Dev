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
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Hero Section */}
      {/* Hero Section */}
      <div className="relative bg-primary overflow-hidden">
          <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-90" />
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-white"
                  >
                      <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                          <ShieldCheckIcon className="h-8 w-8 md:h-10 md:w-10 text-emerald-300" />
                          Insurance Plans
                      </h1>
                      <p className="text-white/90 text-base md:text-lg max-w-xl">
                          Manage your health insurance coverage and view benefits
                      </p>
                  </motion.div>

                  <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
                  >
                      <button 
                        onClick={() => navigate('/insurance/claims')}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                          <DocumentTextIcon className="h-5 w-5" />
                          View Claims
                      </button>
                      <button 
                          onClick={() => {
                              setEditingInsurance(null);
                              setShowFormModal(true);
                          }}
                          className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-50 transition-colors font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                      >
                          <PlusIcon className="h-5 w-5" />
                          Add New Plan
                      </button>
                  </motion.div>
              </div>

              {/* Primary Insurance Badge */}
              {primaryInsurance && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 inline-block"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                    <div>
                      <p className="text-white/90 text-sm font-medium">Primary Insurance</p>
                      <p className="text-white font-bold">
                        {primaryInsurance.plan.provider.name} - {primaryInsurance.plan.name}
                      </p>
                    </div>
                  </div>
                </motion.div>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-center"
          >
            <p className="text-red-600 font-medium">{error}</p>
          </motion.div>
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
                  <ShieldCheckIcon className="h-20 w-20 text-gray-300 mx-auto" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Insurance Plans Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Add your health insurance plans to manage coverage, view digital cards, and track claims.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddClick}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Your First Plan
                </motion.button>
              </motion.div>
            )}

            {nextPageUrl && (
              <div className="mt-8 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMoreInsurances}
                  disabled={isLoadingMore}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
