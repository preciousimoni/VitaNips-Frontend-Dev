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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 pb-12">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 pt-20 pb-24 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.1, scale: 1 }}
                        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"
                    />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <BellAlertIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-white">
                                        Medication Reminders
                                    </h1>
                                </div>
                                <p className="text-xl text-white/90 max-w-2xl">
                                    Never miss a dose. Set up reminders to stay on track with your medications.
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAddClick}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all relative z-10"
                            >
                                <PlusIcon className="h-6 w-6" />
                                Add Reminder
                            </motion.button>
                        </motion.div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Reminders</p>
                                    <p className="text-3xl font-black text-gray-900 mt-2">{stats.total}</p>
                                </div>
                                <div className="p-3 bg-amber-100 rounded-xl">
                                    <BellAlertIcon className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-3xl font-black text-green-600 mt-2">{stats.active}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Inactive</p>
                                    <p className="text-3xl font-black text-gray-500 mt-2">{stats.inactive}</p>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <BellSlashIcon className="h-6 w-6 text-gray-500" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Today's Reminders</p>
                                    <p className="text-3xl font-black text-blue-600 mt-2">{stats.today}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <ClockIcon className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search reminders by medication, dosage, or notes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <FunnelIcon className="h-5 w-5 text-gray-400" />
                                <div className="flex bg-gray-100 rounded-xl p-1">
                                    {(['all', 'active', 'inactive'] as const).map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setFilterActive(filter)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                filterActive === filter
                                                    ? 'bg-white text-amber-600 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
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
                            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
                        >
                            <p className="text-red-700 text-sm">{error}</p>
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
                            className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="p-4 bg-amber-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                    <BellAlertIcon className="h-12 w-12 text-amber-600" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">
                                    {searchQuery || filterActive !== 'all' ? 'No Reminders Found' : 'No Reminders Yet'}
                                </h3>
                                <p className="text-gray-600 mb-8">
                                    {searchQuery || filterActive !== 'all'
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Stay on track with your medications by adding a reminder.'}
                                </p>
                                {(!searchQuery && filterActive === 'all') && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleAddClick}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <PlusIcon className="h-5 w-5" />
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
                                className="space-y-4"
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
                        <div className="mt-8 text-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fetchReminders(nextPageUrl, false)}
                                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                Load More Reminders
                            </motion.button>
                        </div>
                    )}
                    {isLoadingMore && (
                        <div className="mt-8 text-center">
                            <Spinner size="md" />
                            <p className="text-gray-600 mt-4 text-sm">Loading more reminders...</p>
                        </div>
                    )}
                    {!isLoading && !nextPageUrl && totalCount > 0 && reminders.length === totalCount && (
                        <p className="text-center text-gray-500 text-sm mt-8">
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
