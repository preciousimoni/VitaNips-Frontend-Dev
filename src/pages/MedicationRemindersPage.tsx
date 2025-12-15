// src/pages/MedicationRemindersPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BellAlertIcon, PlusIcon } from '@heroicons/react/24/solid';
import {
    BellSlashIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ClockIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getMedicationReminders,
    createMedicationReminder,
    updateMedicationReminder,
    deleteMedicationReminder,
} from '../api/medicationReminders';
import { MedicationReminder, MedicationReminderPayload } from '../types/reminders';
import MedicationReminderListItem from '../features/pharmacy/components/MedicationReminderListItem';
import MedicationReminderForm from '../features/pharmacy/components/MedicationReminderForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PageWrapper from '../components/common/PageWrapper';
import Spinner from '../components/ui/Spinner';

const MedicationRemindersPage: React.FC = () => {
    const [reminders, setReminders] = useState<MedicationReminder[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingReminder, setEditingReminder] = useState<MedicationReminder | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Filter and search states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

    const sortReminders = (data: MedicationReminder[]): MedicationReminder[] => {
        return [...data].sort((a, b) => {
            if (a.is_active && !b.is_active) return -1;
            if (!a.is_active && b.is_active) return 1;
            const timeA = a.time_of_day || "00:00";
            const timeB = b.time_of_day || "00:00";
            if (timeA < timeB) return -1;
            if (timeA > timeB) return 1;
            return (a.medication_display?.name || '').localeCompare(b.medication_display?.name || '');
        });
    };

    const fetchReminders = useCallback(async (url: string | null = null, reset: boolean = true) => {
        if (url) {
            setIsLoadingMore(true);
        } else if (reset) {
            setIsLoading(true);
            setReminders([]);
            setNextPageUrl(null);
            setTotalCount(0);
        }
        setError(null);

        try {
            const response = await getMedicationReminders(url);
            if (response && Array.isArray(response.results)) {
                const newReminders = response.results;
                setReminders(prev => sortReminders(url ? [...prev, ...newReminders] : newReminders));
                setNextPageUrl(response.next);
                if (reset || !url) {
                    setTotalCount(response.count);
                }
            } else {
                console.warn("Unexpected reminders response:", response);
                setError("Failed to process reminders data.");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load medication reminders.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchReminders(null, true);
    }, [fetchReminders]);

    // Filter and search reminders
    const filteredReminders = useMemo(() => {
        let filtered = reminders;

        // Filter by active status
        if (filterActive === 'active') {
            filtered = filtered.filter(r => r.is_active);
        } else if (filterActive === 'inactive') {
            filtered = filtered.filter(r => !r.is_active);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r => 
                r.medication_display?.name?.toLowerCase().includes(query) ||
                r.dosage?.toLowerCase().includes(query) ||
                r.notes?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [reminders, filterActive, searchQuery]);

    // Calculate statistics
    const stats = useMemo(() => {
        const active = reminders.filter(r => r.is_active).length;
        const inactive = reminders.filter(r => !r.is_active).length;
        const today = new Date();
        const todayReminders = reminders.filter(r => {
            if (!r.is_active) return false;
            const startDate = r.start_date ? new Date(r.start_date) : null;
            const endDate = r.end_date ? new Date(r.end_date) : null;
            if (startDate && today < startDate) return false;
            if (endDate && today > endDate) return false;
            return true;
        }).length;

        return { total: reminders.length, active, inactive, today: todayReminders };
    }, [reminders]);

    const handleAddClick = () => {
        setEditingReminder(null);
        setShowFormModal(true);
    };

    const handleEditClick = (reminder: MedicationReminder) => {
        setEditingReminder(reminder);
        setShowFormModal(true);
    };

    const handleFormCancel = () => {
        setShowFormModal(false);
        setEditingReminder(null);
    };

    const handleFormSubmit = async (payload: MedicationReminderPayload, id?: number) => {
        setIsSubmittingForm(true);
        try {
            if (id) {
                await updateMedicationReminder(id, payload);
            } else {
                await createMedicationReminder(payload);
            }
            setShowFormModal(false);
            setEditingReminder(null);
            await fetchReminders(null, true);
        } catch (err) {
            console.error("Failed to save reminder from page handler:", err);
            throw err;
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
        const toastId = toast.loading("Deleting reminder...");
        setError(null);
        try {
            await deleteMedicationReminder(deleteId);
            toast.success("Reminder deleted successfully.", { id: toastId });
            setShowConfirmDialog(false);
            setDeleteId(null);
            await fetchReminders(null, true);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to delete reminder.";
            setError(errorMsg);
            toast.error(errorMsg, { id: toastId });
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmDialog(false);
        setDeleteId(null);
    };

    const handleToggleActive = async (id: number, newActiveState: boolean) => {
        const originalReminders = [...reminders];
        setReminders(prev => prev.map(r => r.id === id ? { ...r, is_active: newActiveState } : r));

        try {
            await updateMedicationReminder(id, { is_active: newActiveState });
            toast.success(`Reminder ${newActiveState ? 'activated' : 'deactivated'}.`);
        } catch (error) {
            console.error("Failed to toggle reminder active state", error);
            setReminders(originalReminders);
            toast.error("Could not update reminder status. Please try again.");
        }
    };

    return (
        <PageWrapper title="Medication Reminders">
            <div className="min-h-screen bg-cream-50 pb-12">
                {/* Hero Section */}
                <div className="bg-primary-900 rounded-b-[3rem] border-b-4 border-l-4 border-r-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mb-12 relative overflow-hidden mx-4 mt-4">
                    <div className="relative max-w-7xl mx-auto px-6 py-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-4 bg-yellow-400 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <BellAlertIcon className="h-8 w-8 text-black" />
                                    </div>
                                    <h1 className="text-5xl md:text-6xl font-black text-white font-display uppercase tracking-tight">
                                        Medication <span className="text-yellow-400 block md:inline">Reminders</span>
                                    </h1>
                                </div>
                                <p className="text-xl text-white/90 max-w-2xl font-bold ml-1">
                                    Never miss a dose. Set up reminders to stay on track with your medications.
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddClick}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black text-lg rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wide"
                            >
                                <PlusIcon className="h-6 w-6" />
                                Add Reminder
                            </motion.button>
                        </motion.div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[2rem] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-black text-gray-500 uppercase tracking-wider">Total Reminders</p>
                                <div className="p-2 bg-yellow-100 rounded-lg border-2 border-black">
                                    <BellAlertIcon className="h-5 w-5 text-black" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-black font-display">{stats.total}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[2rem] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-black text-gray-500 uppercase tracking-wider">Active</p>
                                <div className="p-2 bg-green-100 rounded-lg border-2 border-black">
                                    <CheckCircleIcon className="h-5 w-5 text-black" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-black font-display">{stats.active}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-[2rem] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-black text-gray-500 uppercase tracking-wider">Inactive</p>
                                <div className="p-2 bg-gray-100 rounded-lg border-2 border-black">
                                    <BellSlashIcon className="h-5 w-5 text-black" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-black font-display">{stats.inactive}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-[2rem] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-black text-gray-500 uppercase tracking-wider">Today's Reminders</p>
                                <div className="p-2 bg-blue-100 rounded-lg border-2 border-black">
                                    <ClockIcon className="h-5 w-5 text-black" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-black font-display">{stats.today}</p>
                        </motion.div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="bg-white rounded-2xl p-4 mb-12 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-black" />
                                <input
                                    type="text"
                                    placeholder="Search reminders..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent focus:border-black focus:bg-white rounded-xl focus:ring-0 transition-all font-bold placeholder-gray-500 text-black text-lg"
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                                <FunnelIcon className="h-6 w-6 text-black" />
                                <div className="flex bg-gray-100 rounded-xl p-1.5 border-2 border-transparent">
                                    {(['all', 'active', 'inactive'] as const).map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setFilterActive(filter)}
                                            className={`px-6 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-all border-2 ${
                                                filterActive === filter
                                                    ? 'bg-white text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'text-gray-500 border-transparent hover:text-black'
                                            }`}
                                        >
                                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-red-100 border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <p className="text-red-900 font-bold">{error}</p>
                        </motion.div>
                    )}

                    {/* Loading State */}
                    {isLoading && reminders.length === 0 && (
                        <div className="flex items-center justify-center py-20">
                            <Spinner size="lg" />
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && filteredReminders.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-6"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="p-6 bg-yellow-400 border-4 border-black rounded-full w-28 h-28 mx-auto mb-8 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <BellAlertIcon className="h-12 w-12 text-black" />
                                </div>
                                <h3 className="text-3xl font-black text-black mb-4 font-display uppercase">
                                    {searchQuery || filterActive !== 'all' ? 'No Reminders Found' : 'No Reminders Yet'}
                                </h3>
                                <p className="text-xl text-gray-500 font-bold mb-8">
                                    {searchQuery || filterActive !== 'all'
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Stay on track with your medications by adding a reminder.'}
                                </p>
                                {(!searchQuery && filterActive === 'all') && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAddClick}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-black text-lg rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wide"
                                    >
                                        <PlusIcon className="h-6 w-6" />
                                        Add Your First Reminder
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Reminders List */}
                    <AnimatePresence mode="wait">
                        {filteredReminders.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                {filteredReminders.map((reminder, index) => (
                                    <motion.div
                                        key={reminder.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <MedicationReminderListItem
                                            reminder={reminder}
                                            onEdit={handleEditClick}
                                            onDelete={handleDelete}
                                            onToggleActive={handleToggleActive}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Load More */}
                    {nextPageUrl && !isLoadingMore && (
                        <div className="mt-12 text-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => fetchReminders(nextPageUrl, false)}
                                className="px-8 py-4 bg-white text-black font-black text-lg rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all uppercase tracking-wide"
                            >
                                Load More Reminders
                            </motion.button>
                        </div>
                    )}
                    {isLoadingMore && (
                        <div className="mt-12 text-center">
                            <Spinner size="md" />
                            <p className="text-gray-600 mt-4 font-bold">Loading more reminders...</p>
                        </div>
                    )}
                    {!isLoading && !nextPageUrl && totalCount > 0 && reminders.length === totalCount && (
                        <p className="text-center text-gray-500 font-bold mt-12 pb-8">
                            All {totalCount} reminder{totalCount !== 1 ? 's' : ''} loaded.
                        </p>
                    )}
                </div>

                {/* Form Modal */}
                <Modal
                    isOpen={showFormModal}
                    onClose={handleFormCancel}
                    title={editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
                >
                    <MedicationReminderForm
                        initialData={editingReminder}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        isSubmitting={isSubmittingForm}
                    />
                </Modal>

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showConfirmDialog}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    title="Delete Medication Reminder"
                    message="Are you sure you want to delete this reminder? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    isLoading={isDeleting}
                />
            </div>
        </PageWrapper>
    );
};

export default MedicationRemindersPage;
