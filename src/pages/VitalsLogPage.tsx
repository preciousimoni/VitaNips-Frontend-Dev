import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { HeartIcon, ScaleIcon, FireIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { getVitalSigns, createVitalSign, updateVitalSign, deleteVitalSign } from '../api/healthLogs';
import { VitalSignLog, VitalSignPayload } from '../types/healthLogs';
import VitalSignLogListItem from '../features/health/components/VitalSignLogListItem';
import VitalSignForm from '../features/health/components/VitalSignForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/ui/Spinner';
import HealthHeader from '../features/health/components/HealthHeader';
import HealthStatCard from '../features/health/components/HealthStatCard';

const VitalsLogPage: React.FC = () => {
    const [logs, setLogs] = useState<VitalSignLog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingLog, setEditingLog] = useState<VitalSignLog | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Stats
    const [latestLog, setLatestLog] = useState<VitalSignLog | null>(null);

    const sortLogs = (data: VitalSignLog[]): VitalSignLog[] => {
        return [...data].sort((a, b) => new Date(b.date_recorded).getTime() - new Date(a.date_recorded).getTime());
    };

    const fetchLogs = useCallback(async (url: string | null = null, reset: boolean = true) => {
        if (url) setIsLoadingMore(true);
        else if (reset) {
            setIsLoading(true);
            setLogs([]);
            setNextPageUrl(null);
            setTotalCount(0);
        }
        setError(null);

        try {
            const response = await getVitalSigns(url);
            const newLogs = response.results;
            setLogs(currentLogs => {
                const sorted = sortLogs(url ? [...currentLogs, ...newLogs] : newLogs);
                if (sorted.length > 0) setLatestLog(sorted[0]);
                return sorted;
            });
            setNextPageUrl(response.next);
            if (reset || !url) setTotalCount(response.count);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load vital signs.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs(null, true);
    }, [fetchLogs]);

    const handleAddClick = () => {
        setEditingLog(null);
        setShowFormModal(true);
    };
    const handleEditClick = (log: VitalSignLog) => {
        setEditingLog(log);
        setShowFormModal(true);
    };
    const handleFormCancel = () => {
        setShowFormModal(false);
        setEditingLog(null);
    };

    const handleFormSubmit = async (payload: VitalSignPayload, id?: number) => {
        setIsSubmittingForm(true);
        try {
            if (id) await updateVitalSign(id, payload);
            else await createVitalSign(payload);
            setShowFormModal(false);
            setEditingLog(null);
            await fetchLogs(null, true);
            toast.success(id ? "Vitals updated successfully" : "Vitals logged successfully");
        } catch (err) {
            toast.error("Failed to save vitals");
        } finally {
            setIsSubmittingForm(false);
        }
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
            await deleteVitalSign(deleteId);
            toast.success("Vitals log entry deleted.", { id: toastId });
            setShowConfirmDialog(false);
            setDeleteId(null);
            await fetchLogs(null, true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete entry.";
            toast.error(errorMessage, { id: toastId });
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
                title="Vital Signs"
                subtitle="Track your essential health metrics over time."
                icon={HeartIcon}
                gradientFrom="from-rose-500"
                gradientTo="to-red-600"
                shadowColor="shadow-rose-500/30"
                actionButton={
                    <button 
                        onClick={handleAddClick} 
                        className="btn bg-black text-white border-4 border-black/20 hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] rounded-2xl px-6 py-4 flex items-center transition-all hover:scale-105 active:scale-95 font-bold uppercase tracking-wide"
                    >
                        <PlusIcon className="h-6 w-6 mr-2" />
                        Log Vitals
                    </button>
                }
            />

            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingLog ? 'Edit Vitals' : 'Log New Vitals'}>
                <VitalSignForm initialData={editingLog} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmittingForm} />
            </Modal>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Entry?"
                message="This record will be permanently removed from your health history."
                confirmText="Delete Record"
                cancelText="Cancel"
                isLoading={isDeleting}
                isDangerous={true}
            />

            {/* Quick Stats Row */}
            {!isLoading && logs.length > 0 && latestLog && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                    <HealthStatCard 
                        label="Last Heart Rate" 
                        value={latestLog.heart_rate || '—'} 
                        unit="bpm" 
                        icon={HeartIcon} 
                        color="rose" 
                        delay={0.1}
                    />
                    <HealthStatCard 
                        label="Last Blood Pressure" 
                        value={latestLog.systolic_pressure && latestLog.diastolic_pressure ? `${latestLog.systolic_pressure}/${latestLog.diastolic_pressure}` : '—'} 
                        unit="mmHg" 
                        icon={ArrowPathIcon} 
                        color="blue" 
                        delay={0.2}
                    />
                    <HealthStatCard 
                        label="Current Weight" 
                        value={latestLog.weight || '—'} 
                        unit="kg" 
                        icon={ScaleIcon} 
                        color="indigo" 
                        delay={0.3}
                    />
                    <HealthStatCard 
                        label="Temperature" 
                        value={latestLog.temperature || '—'} 
                        unit="°C" 
                        icon={FireIcon} 
                        color="orange" 
                        delay={0.4}
                    />
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden min-h-[400px] relative">
                
                {isLoading && logs.length === 0 && (
                    <div className="p-8 space-y-6">
                        <Skeleton className="h-32 rounded-3xl" />
                        <Skeleton className="h-32 rounded-3xl" />
                        <Skeleton className="h-32 rounded-3xl" />
                    </div>
                )}

                {error && (
                    <div className="p-12 text-center">
                        <div className="bg-red-100 text-red-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-8 py-6 rounded-2xl inline-block font-bold">
                            {error}
                        </div>
                    </div>
                )}

                {!isLoading && !error && logs.length === 0 && (
                    <div className="p-12">
                        <EmptyState 
                            icon={HeartIcon}
                            title="No vitals recorded"
                            description="Start tracking your health by logging your first vital signs entry."
                            actionLabel="Log Vitals Now"
                            onAction={handleAddClick}
                        />
                    </div>
                )}

                {logs.length > 0 && (
                    <div className="relative z-10">
                        <div className="px-8 py-6 border-b-4 border-black flex justify-between items-center bg-yellow-50 sticky top-0 z-20">
                            <h3 className="font-black text-2xl text-black uppercase tracking-tight">History</h3>
                            <span className="text-xs font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-1.5 rounded-lg">{totalCount} RECORDS</span>
                        </div>
                        <div className="divide-y-2 divide-gray-100">
                            <AnimatePresence>
                                {logs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="p-6 md:p-8">
                                            <VitalSignLogListItem
                                                log={log}
                                                onEdit={handleEditClick}
                                                onDelete={handleDelete}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {nextPageUrl && !isLoadingMore && (
                    <div className="p-8 border-t-4 border-black text-center bg-gray-50">
                        <button
                            onClick={() => fetchLogs(nextPageUrl, false)}
                            className="btn bg-white border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 px-8 py-3 rounded-xl text-sm font-bold transition-all uppercase tracking-wide"
                        >
                            Load Older Records
                        </button>
                    </div>
                )}

                {isLoadingMore && (
                    <div className="p-8 text-center text-black font-bold text-sm bg-gray-50 border-t-4 border-black">
                        <Spinner size="sm" className="inline-block mr-2" /> Loading more entries...
                    </div>
                )}
            </div>
            
            {!isLoading && !nextPageUrl && totalCount > 0 && logs.length === totalCount && (
                <div className="flex justify-center mt-12">
                   <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
                </div>
            )}
        </div>
    );
};
export default VitalsLogPage;
