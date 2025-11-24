import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { ShoppingBagIcon, FireIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { getFoodLogs, createFoodLog, updateFoodLog, deleteFoodLog } from '../api/healthLogs';
import { FoodLog, FoodPayload } from '../types/healthLogs';
import FoodLogListItem from '../features/health/components/FoodLogListItem';
import FoodLogForm from '../features/health/components/FoodLogForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/ui/Spinner';
import HealthHeader from '../features/health/components/HealthHeader';
import HealthStatCard from '../features/health/components/HealthStatCard';

const FoodLogPage: React.FC = () => {
    const [logs, setLogs] = useState<FoodLog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingLog, setEditingLog] = useState<FoodLog | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Stats
    const [todayCalories, setTodayCalories] = useState<number>(0);

    const sortLogs = (data: FoodLog[]): FoodLog[] => {
        return [...data].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
    };

    const calculateTodayStats = (data: FoodLog[]) => {
        const today = new Date().toDateString();
        const todayLogs = data.filter(log => new Date(log.datetime).toDateString() === today);
        const calories = todayLogs.reduce((acc, log) => acc + (log.calories || 0), 0);
        setTodayCalories(calories);
    };

    const fetchLogs = useCallback(async (url: string | null = null, reset: boolean = true) => {
        if (url) setIsLoadingMore(true);
        else if (reset) { setIsLoading(true); setLogs([]); setNextPageUrl(null); setTotalCount(0); }
        setError(null);

        try {
            const response = await getFoodLogs(url);
            const newLogs = response.results;
            const sorted = sortLogs(url ? [...prev, ...newLogs] : newLogs);
            setLogs(sorted);
            if (reset) calculateTodayStats(sorted);
            setNextPageUrl(response.next);
            if (reset || !url) setTotalCount(response.count);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load food logs.";
            setError(errorMessage);
        } finally { setIsLoading(false); setIsLoadingMore(false); }
    }, []);

    useEffect(() => { fetchLogs(null, true); }, [fetchLogs]);

    const handleAddClick = () => { setEditingLog(null); setShowFormModal(true); };
    const handleEditClick = (log: FoodLog) => { setEditingLog(log); setShowFormModal(true); };
    const handleFormCancel = () => { setShowFormModal(false); setEditingLog(null); };

    const handleFormSubmit = async (payload: FoodPayload, id?: number) => {
        setIsSubmittingForm(true);
        try {
            if (id) await updateFoodLog(id, payload);
            else await createFoodLog(payload);
            setShowFormModal(false); setEditingLog(null);
            await fetchLogs(null, true);
            toast.success(id ? "Meal updated" : "Meal logged");
        } catch (err) {
            toast.error("Failed to save meal");
        } finally { setIsSubmittingForm(false); }
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowConfirmDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        const toastId = toast.loading("Deleting entry...");
        try {
            await deleteFoodLog(deleteId);
            toast.success("Entry deleted.", { id: toastId });
            setShowConfirmDialog(false);
            setDeleteId(null);
            await fetchLogs(null, true);
        } catch (err) {
            toast.error("Failed to delete.", { id: toastId });
        } finally { setIsDeleting(false); }
    };

    const handleCancelDelete = () => { setShowConfirmDialog(false); setDeleteId(null); };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
            <HealthHeader
                title="Food Journal"
                subtitle="Track your nutrition and eating habits."
                icon={ShoppingBagIcon}
                gradientFrom="from-emerald-500"
                gradientTo="to-green-600"
                shadowColor="shadow-emerald-500/30"
                actionButton={
                    <button 
                        onClick={handleAddClick} 
                        className="btn bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 border-none rounded-xl px-5 py-3 flex items-center transition-all hover:scale-105 active:scale-95"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Log Meal
                    </button>
                }
            />

            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingLog ? 'Edit Meal' : 'Log New Meal'}>
                <FoodLogForm initialData={editingLog} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmittingForm} />
            </Modal>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Meal?"
                message="Are you sure you want to delete this meal entry?"
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                isDangerous={true}
            />

            {/* Stats */}
            {!isLoading && logs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <HealthStatCard 
                        label="Today's Calories" 
                        value={todayCalories} 
                        unit="kcal" 
                        icon={FireIcon} 
                        color="orange" 
                        delay={0.1}
                    />
                    <HealthStatCard 
                        label="Total Meals Logged" 
                        value={totalCount} 
                        unit="meals" 
                        icon={ShoppingBagIcon} 
                        color="emerald" 
                        delay={0.2}
                    />
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden min-h-[400px] relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-16 -mt-16"></div>

                {isLoading && logs.length === 0 && (
                    <div className="p-6 space-y-6">
                        <Skeleton className="h-24 rounded-2xl" />
                        <Skeleton className="h-24 rounded-2xl" />
                    </div>
                )}

                {error && (
                    <div className="p-12 text-center">
                        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl inline-block font-medium">{error}</div>
                    </div>
                )}

                {!isLoading && !error && logs.length === 0 && (
                    <EmptyState 
                        icon={ShoppingBagIcon}
                        title="No meals logged"
                        description="Start tracking your breakfast, lunch, dinner, and snacks."
                        actionLabel="Log First Meal"
                        onAction={handleAddClick}
                    />
                )}

                {logs.length > 0 && (
                    <div className="relative z-10">
                         <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-20">
                            <h3 className="font-bold text-gray-900">Recent Meals</h3>
                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{totalCount} Records</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {logs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50/80 transition-colors"
                                    >
                                        <div className="p-5">
                                            <FoodLogListItem log={log} onEdit={handleEditClick} onDelete={handleDelete} />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                 {nextPageUrl && !isLoadingMore && (
                    <div className="p-8 border-t border-gray-50 text-center bg-gray-50/30">
                         <button onClick={() => fetchLogs(nextPageUrl, false)} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded-xl text-sm font-medium shadow-sm">Load Older Records</button>
                    </div>
                )}
                
                {isLoadingMore && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        <Spinner size="sm" className="inline-block mr-2" /> Loading more entries...
                    </div>
                )}
            </div>
             {!isLoading && !nextPageUrl && totalCount > 0 && logs.length === totalCount && (
                <p className="text-center text-gray-300 text-xs mt-8 font-medium uppercase tracking-widest">End of History</p>
            )}
        </div>
    );
};
export default FoodLogPage;
