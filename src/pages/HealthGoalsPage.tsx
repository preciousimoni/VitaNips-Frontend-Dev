// src/pages/HealthGoalsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { 
    FireIcon, 
    HeartIcon, 
    MoonIcon, 
    ScaleIcon,
    ArrowPathIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    ClockIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { getHealthGoals, createHealthGoal, updateHealthGoal, deleteHealthGoal } from '../api/healthMetrics';
import { HealthGoal } from '../types/health';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PageWrapper from '../components/common/PageWrapper';
import HealthHeader from '../features/health/components/HealthHeader';

interface HealthGoalFormData {
    goal_type: string;
    custom_type?: string;
    target_value: number;
    unit: string;
    start_date: string;
    target_date: string;
    frequency: string;
    reminders_enabled: boolean;
    notes?: string;
}

const HealthGoalsPage: React.FC = () => {
    const [goals, setGoals] = useState<HealthGoal[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const [formData, setFormData] = useState<HealthGoalFormData>({
        goal_type: 'exercise',
        target_value: 0,
        unit: 'minutes',
        start_date: new Date().toISOString().split('T')[0],
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'daily',
        reminders_enabled: true,
    });

    const goalTypes = [
        { value: 'exercise', label: 'Exercise', icon: FireIcon, unit: 'minutes' },
        { value: 'weight', label: 'Weight', icon: ScaleIcon, unit: 'kg' },
        { value: 'steps', label: 'Steps', icon: HeartIcon, unit: 'steps' },
        { value: 'water', label: 'Water Intake', icon: ArrowPathIcon, unit: 'liters' },
        { value: 'sleep', label: 'Sleep', icon: MoonIcon, unit: 'hours' },
        { value: 'custom', label: 'Custom', icon: TrophyIcon, unit: '' },
    ];

    const fetchGoals = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getHealthGoals();
            setGoals(response.results || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load health goals.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const handleAddClick = () => {
        setEditingGoal(null);
        setFormData({
            goal_type: 'exercise',
            target_value: 0,
            unit: 'minutes',
            start_date: new Date().toISOString().split('T')[0],
            target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            frequency: 'daily',
            reminders_enabled: true,
        });
        setShowFormModal(true);
    };

    const handleEditClick = (goal: HealthGoal) => {
        setEditingGoal(goal);
        setFormData({
            goal_type: goal.goal_type,
            custom_type: goal.custom_type || '',
            target_value: goal.target_value,
            unit: goal.unit,
            start_date: goal.start_date,
            target_date: goal.target_date,
            frequency: goal.frequency,
            reminders_enabled: goal.reminders_enabled,
            notes: goal.notes || '',
        });
        setShowFormModal(true);
    };

    const handleFormCancel = () => {
        setShowFormModal(false);
        setEditingGoal(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload: any = {
                goal_type: formData.goal_type,
                target_value: formData.target_value,
                unit: formData.unit,
                start_date: formData.start_date,
                target_date: formData.target_date,
                frequency: formData.frequency,
                reminders_enabled: formData.reminders_enabled,
            };

            if (formData.goal_type === 'custom' && formData.custom_type) {
                payload.custom_type = formData.custom_type;
            }
            if (formData.notes) {
                payload.notes = formData.notes;
            }

            if (editingGoal) {
                await updateHealthGoal(editingGoal.id, payload);
                toast.success('Goal updated successfully!');
            } else {
                await createHealthGoal(payload);
                toast.success('Goal created successfully!');
            }

            setShowFormModal(false);
            setEditingGoal(null);
            await fetchGoals();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to save goal.";
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
        const toastId = toast.loading("Deleting goal...");
        try {
            await deleteHealthGoal(deleteId);
            toast.success("Goal deleted successfully.", { id: toastId });
            setShowDeleteDialog(false);
            setDeleteId(null);
            await fetchGoals();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete goal.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const getGoalIcon = (goalType: string) => {
        const type = goalTypes.find(t => t.value === goalType);
        return type?.icon || TrophyIcon;
    };

    const getGoalLabel = (goalType: string, customType?: string) => {
        if (goalType === 'custom' && customType) return customType;
        const type = goalTypes.find(t => t.value === goalType);
        return type?.label || goalType;
    };

    const getProgressPercentage = (goal: HealthGoal) => {
        if (goal.target_value === 0) return 0;
        return Math.min((goal.current_value / goal.target_value) * 100, 100);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'active':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'abandoned':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <PageWrapper title="Health Goals">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
                    <HealthHeader
                        title="Health Goals"
                        subtitle="Set and track your health and fitness goals."
                        icon={TrophyIcon}
                        gradientFrom="from-blue-500"
                        gradientTo="to-indigo-600"
                        shadowColor="shadow-blue-500/30"
                        actionButton={
                            <button 
                                onClick={handleAddClick} 
                                className="btn bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 border-none rounded-xl px-5 py-3 flex items-center transition-all hover:scale-105 active:scale-95"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Set Goal
                            </button>
                        }
                    />

                    <Modal 
                        isOpen={showFormModal} 
                        onClose={handleFormCancel} 
                        title={editingGoal ? 'Edit Goal' : 'Set New Goal'}
                    >
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Goal Type *
                                </label>
                                <select
                                    value={formData.goal_type}
                                    onChange={(e) => {
                                        const selectedType = goalTypes.find(t => t.value === e.target.value);
                                        setFormData({
                                            ...formData,
                                            goal_type: e.target.value,
                                            unit: selectedType?.unit || '',
                                        });
                                    }}
                                    className="w-full input-field"
                                    required
                                >
                                    {goalTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formData.goal_type === 'custom' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Custom Goal Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.custom_type || ''}
                                        onChange={(e) => setFormData({ ...formData, custom_type: e.target.value })}
                                        className="w-full input-field"
                                        placeholder="e.g., Meditation, Yoga, etc."
                                        required={formData.goal_type === 'custom'}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Value *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.target_value}
                                        onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })}
                                        className="w-full input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unit *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.target_date}
                                        onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                                        min={formData.start_date}
                                        className="w-full input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Frequency *
                                </label>
                                <select
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    className="w-full input-field"
                                    required
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full input-field"
                                    rows={3}
                                    placeholder="Add any additional notes about your goal..."
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="reminders_enabled"
                                    checked={formData.reminders_enabled}
                                    onChange={(e) => setFormData({ ...formData, reminders_enabled: e.target.checked })}
                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <label htmlFor="reminders_enabled" className="ml-2 text-sm text-gray-700">
                                    Enable reminders for this goal
                                </label>
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
                                    {isSubmitting ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
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
                        title="Delete Health Goal"
                        message="Are you sure you want to delete this goal? This action cannot be undone."
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
                    ) : goals.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                            <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Goals Set</h3>
                            <p className="text-gray-600 mb-6">
                                Start your health journey by setting your first goal.
                            </p>
                            <button
                                onClick={handleAddClick}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Set Your First Goal
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            {goals.map((goal, index) => {
                                const GoalIcon = getGoalIcon(goal.goal_type);
                                const progress = getProgressPercentage(goal);
                                const isCompleted = goal.status === 'completed';

                                return (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-blue-100 rounded-xl">
                                                    <GoalIcon className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-900 text-lg">
                                                        {getGoalLabel(goal.goal_type, goal.custom_type)}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(goal.status)}`}>
                                                        {goal.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(goal)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(goal.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600">Progress</span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {progress.toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.5 }}
                                                    className={`h-full rounded-full ${
                                                        isCompleted 
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                                    }`}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between mt-2 text-sm">
                                                <span className="text-gray-600">
                                                    {goal.current_value} / {goal.target_value} {goal.unit}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="h-4 w-4" />
                                                <span>Frequency: {goal.frequency}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CalendarDaysIcon className="h-4 w-4" />
                                                <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                                            </div>
                                            {goal.notes && (
                                                <p className="text-xs text-gray-500 mt-2 italic">{goal.notes}</p>
                                            )}
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

export default HealthGoalsPage;

