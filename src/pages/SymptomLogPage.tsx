import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { ShieldExclamationIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { getSymptomLogs, createSymptomLog, updateSymptomLog, deleteSymptomLog } from '../api/healthLogs';
import { SymptomLog, SymptomPayload } from '../types/healthLogs';
import SymptomLogListItem from '../features/health/components/SymptomLogListItem';
import SymptomLogForm from '../features/health/components/SymptomLogForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/ui/Spinner';
import HealthHeader from '../features/health/components/HealthHeader';
import HealthStatCard from '../features/health/components/HealthStatCard';

const SymptomLogPage: React.FC = () => {
    const [logs, setLogs] = useState<SymptomLog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingLog, setEditingLog] = useState<SymptomLog | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const [latestSymptom, setLatestSymptom] = useState<SymptomLog | null>(null);

    const sortLogs = (data: SymptomLog[]): SymptomLog[] => {
        return [...data].sort((a, b) => new Date(b.date_experienced).getTime() - new Date(a.date_experienced).getTime());
    };

    const fetchLogs = useCallback(async (url: string | null = null, reset: boolean = true) => {
        if (url) setIsLoadingMore(true);
        else if (reset) { setIsLoading(true); setLogs([]); setNextPageUrl(null); setTotalCount(0); }
        setError(null);

        try {
            const response = await getSymptomLogs(url);
            const newLogs = response.results;
            const sorted = sortLogs(url ? [...prev, ...newLogs] : newLogs);
            setLogs(sorted);
            if (sorted.length > 0) setLatestSymptom(sorted[0]);
            setNextPageUrl(response.next);
            if (reset || !url) setTotalCount(response.count);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load symptom logs.";
            setError(errorMessage);
        } finally { setIsLoading(false); setIsLoadingMore(false); }
    }, []);

    useEffect(() => { fetchLogs(null, true); }, [fetchLogs]);

    const handleAddClick = () => { setEditingLog(null); setShowFormModal(true); };
    const handleEditClick = (log: SymptomLog) => { setEditingLog(log); setShowFormModal(true); };
    const handleFormCancel = () => { setShowFormModal(false); setEditingLog(null); };

    const handleFormSubmit = async (payload: SymptomPayload, id?: number) => {
        setIsSubmittingForm(true);
        try {
            if (id) await updateSymptomLog(id, payload);
            else await createSymptomLog(payload);
            setShowFormModal(false); setEditingLog(null);
            await fetchLogs(null, true);
            toast.success(id ? "Symptom updated" : "Symptom logged");
        } catch (err) {
            toast.error("Failed to save symptom");
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
            await deleteSymptomLog(deleteId);
            toast.success("Entry deleted.", { id: toastId });
            setShowConfirmDialog(false);
            setDeleteId(null);
            await fetchLogs(null, true);
        } catch (err) {
            toast.error("Failed to delete.", { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmDialog(false);
        setDeleteId(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
            <HealthHeader
                title="Symptoms Log"
                subtitle="Record how you're feeling to help identify patterns."
                icon={ShieldExclamationIcon}
                gradientFrom="from-amber-500"
                gradientTo="to-orange-600"
                shadowColor="shadow-amber-500/30"
                actionButton={
                    <button 
                        onClick={handleAddClick} 
                        className="btn bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 border-none rounded-xl px-5 py-3 flex items-center transition-all hover:scale-105 active:scale-95"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Log Symptom
                    </button>
                }
            />

            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingLog ? 'Edit Symptom' : 'Log New Symptom'}>
                <SymptomLogForm initialData={editingLog} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmittingForm} />
            </Modal>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Symptom?"
                message="Are you sure? This cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                isDangerous={true}
            />

            {/* Stats */}
            {!isLoading && logs.length > 0 && latestSymptom && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <HealthStatCard 
                        label="Latest Symptom" 
                        value={latestSymptom.symptom} 
                        unit="" 
                        icon={ShieldExclamationIcon} 
                        color="amber" 
                        delay={0.1}
                    />
                    <HealthStatCard 
                        label="Severity" 
                        value={latestSymptom.severity === 1 ? 'Mild' : latestSymptom.severity === 2 ? 'Moderate' : latestSymptom.severity === 3 ? 'Severe' : 'Very Severe'} 
                        unit="" 
                        icon={ExclamationTriangleIcon} 
                        color={latestSymptom.severity > 2 ? 'red' : 'green'} 
                        delay={0.2}
                    />
                     <HealthStatCard 
                        label="Total Logs" 
                        value={totalCount} 
                        unit="entries" 
                        icon={ShieldExclamationIcon} 
                        color="blue" 
                        delay={0.3}
                    />
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden min-h-[400px] relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-16 -mt-16"></div>

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
                        icon={ShieldExclamationIcon}
                        title="No symptoms logged"
                        description="Keep track of your symptoms to monitor your health condition."
                        actionLabel="Log Symptom"
                        onAction={handleAddClick}
                    />
                )}

                {logs.length > 0 && (
                    <div className="relative z-10">
                        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-20">
                            <h3 className="font-bold text-gray-900">Recent Symptoms</h3>
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
                                            <SymptomLogListItem log={log} onEdit={handleEditClick} onDelete={handleDelete} />
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
export default SymptomLogPage;
