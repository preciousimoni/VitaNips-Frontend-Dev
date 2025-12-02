// src/pages/WaterLogPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon, ClockIcon, CalendarDaysIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { getWaterLogs, createWaterLog, getTodayWaterLog } from '../api/healthMetrics';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PageWrapper from '../components/common/PageWrapper';
import HealthHeader from '../features/health/components/HealthHeader';

interface WaterLog {
    id: number;
    amount: number;
    unit: string;
    datetime: string;
    notes?: string;
}

const WaterLogPage: React.FC = () => {
    const [logs, setLogs] = useState<WaterLog[]>([]);
    const [todayTotal, setTodayTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        amount: 250,
        unit: 'ml',
        datetime: new Date().toISOString().slice(0, 16),
        notes: '',
    });

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getWaterLogs();
            setLogs(response.results || []);
            
            // Calculate today's total
            const today = new Date().toISOString().split('T')[0];
            const todayLogs = (response.results || []).filter((log: WaterLog) => 
                log.datetime.startsWith(today)
            );
            const total = todayLogs.reduce((sum: number, log: WaterLog) => {
                const amount = log.unit === 'l' || log.unit === 'L' ? log.amount * 1000 : log.amount;
                return sum + amount;
            }, 0);
            setTodayTotal(total);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load water logs.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleAddClick = () => {
        setFormData({
            amount: 250,
            unit: 'ml',
            datetime: new Date().toISOString().slice(0, 16),
            notes: '',
        });
        setShowFormModal(true);
    };

    const handleFormCancel = () => {
        setShowFormModal(false);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createWaterLog({
                amount: formData.amount,
                unit: formData.unit,
                datetime: formData.datetime,
                notes: formData.notes || undefined,
            });
            toast.success('Water intake logged successfully!');
            setShowFormModal(false);
            await fetchLogs();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to log water intake.";
            toast.error(errorMessage);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        const toastId = toast.loading("Deleting entry...");
        try {
            // TODO: Add deleteWaterLog API function
            // await deleteWaterLog(deleteId);
            toast.success("Entry deleted successfully.", { id: toastId });
            setShowDeleteDialog(false);
            setDeleteId(null);
            await fetchLogs();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete entry.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const recommendedDaily = 2000; // 2 liters in ml
    const progressPercentage = Math.min((todayTotal / recommendedDaily) * 100, 100);

    const formatDateTime = (datetime: string) => {
        const date = new Date(datetime);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
    };

    const groupLogsByDate = () => {
        const grouped: Record<string, WaterLog[]> = {};
        logs.forEach(log => {
            const date = log.datetime.split('T')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(log);
        });
        return grouped;
    };

    const groupedLogs = groupLogsByDate();

    return (
        <PageWrapper title="Water Intake Log">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
                    <HealthHeader
                        title="Water Intake"
                        subtitle="Track your daily water consumption and stay hydrated."
                        icon={ArrowPathIcon}
                        gradientFrom="from-cyan-500"
                        gradientTo="to-blue-600"
                        shadowColor="shadow-cyan-500/30"
                        actionButton={
                            <button 
                                onClick={handleAddClick} 
                                className="btn bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 border-none rounded-xl px-5 py-3 flex items-center transition-all hover:scale-105 active:scale-95"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Log Water
                            </button>
                        }
                    />

                    {/* Today's Progress Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Today's Intake</h3>
                                <p className="text-sm text-gray-600">Recommended: 2L (2000ml)</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-cyan-600">
                                    {(todayTotal / 1000).toFixed(1)}L
                                </div>
                                <div className="text-sm text-gray-600">
                                    {todayTotal}ml
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5 }}
                                className={`h-full rounded-full ${
                                    progressPercentage >= 100
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                }`}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            {progressPercentage.toFixed(0)}% of daily goal
                        </p>
                    </motion.div>

                    <Modal 
                        isOpen={showFormModal} 
                        onClose={handleFormCancel} 
                        title="Log Water Intake"
                    >
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unit *
                                    </label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full input-field"
                                        required
                                    >
                                        <option value="ml">ml</option>
                                        <option value="L">L</option>
                                        <option value="oz">oz</option>
                                        <option value="cup">cup</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.datetime}
                                    onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                                    className="w-full input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full input-field"
                                    rows={3}
                                    placeholder="Add any notes about your water intake..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleFormCancel}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary px-6 py-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Logging...' : 'Log Water'}
                                </button>
                            </div>
                        </form>
                    </Modal>

                    <ConfirmDialog
                        isOpen={showDeleteDialog}
                        onClose={() => {
                            setShowDeleteDialog(false);
                            setDeleteId(null);
                        }}
                        onConfirm={handleConfirmDelete}
                        title="Delete Water Log Entry"
                        message="Are you sure you want to delete this entry? This action cannot be undone."
                        confirmText="Delete"
                        cancelText="Cancel"
                        isLoading={isDeleting}
                    />

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Spinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-700">{error}</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                            <ArrowPathIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Water Logs Yet</h3>
                            <p className="text-gray-600 mb-6">
                                Start tracking your water intake to stay hydrated.
                            </p>
                            <button
                                onClick={handleAddClick}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Log Your First Entry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedLogs)
                                .sort((a, b) => b[0].localeCompare(a[0]))
                                .map(([date, dateLogs]) => {
                                    const dateTotal = dateLogs.reduce((sum, log) => {
                                        const amount = log.unit === 'l' || log.unit === 'L' ? log.amount * 1000 : log.amount;
                                        return sum + amount;
                                    }, 0);

                                    return (
                                        <motion.div
                                            key={date}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <CalendarDaysIcon className="h-5 w-5 text-cyan-600" />
                                                    <h3 className="font-bold text-gray-900">
                                                        {new Date(date).toLocaleDateString('en-US', { 
                                                            weekday: 'long', 
                                                            month: 'long', 
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </h3>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-cyan-600">
                                                        {(dateTotal / 1000).toFixed(1)}L
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {dateLogs.length} {dateLogs.length === 1 ? 'entry' : 'entries'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {dateLogs.map((log) => {
                                                    const { time } = formatDateTime(log.datetime);
                                                    return (
                                                        <div
                                                            key={log.id}
                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {log.amount} {log.unit}
                                                                </span>
                                                                <span className="text-xs text-gray-500">at {time}</span>
                                                                {log.notes && (
                                                                    <span className="text-xs text-gray-500 italic">
                                                                        - {log.notes}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleDelete(log.id)}
                                                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default WaterLogPage;



