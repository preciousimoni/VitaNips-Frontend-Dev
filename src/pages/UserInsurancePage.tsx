// src/pages/UserInsurancePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  PlusIcon,
  DocumentTextIcon,
  SparklesIcon,
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
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-teal-600">
        {/* Animated Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -60, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-teal-500/20 rounded-full blur-3xl"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <SparklesIcon className="h-6 w-6 text-white/80" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Insurance Management
              </h1>
              <p className="text-lg text-white/90">
                Manage your health insurance plans and claims
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/insurance/claims')}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border-2 border-white/20 flex items-center gap-2"
              >
                <DocumentTextIcon className="h-5 w-5" />
                View Claims
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddClick}
                className="px-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Plan
              </motion.button>
            </div>
          </motion.div>

          {/* Primary Insurance Badge */}
          {primaryInsurance && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20"
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
