// src/features/pharmacy/components/MedicationReminderForm.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import { MedicationReminder, MedicationReminderPayload, ReminderFrequency } from '../../../types/reminders';

import toast from 'react-hot-toast';
import { 
    ClockIcon, 
    EllipsisHorizontalIcon, 
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface MedicationReminderFormProps {
    initialData?: MedicationReminder | null;
    onSubmit: (payload: MedicationReminderPayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const FREQUENCY_OPTIONS: { value: ReminderFrequency; label: string; description: string }[] = [
    { value: 'daily', label: 'Daily', description: 'Every day at the same time' },
    { value: 'weekly', label: 'Weekly', description: 'Same day of the week' },
    { value: 'monthly', label: 'Monthly', description: 'Same date each month' },
    { value: 'custom', label: 'Custom', description: 'Custom interval (e.g., every 3 days)' },
];

const MedicationReminderForm: React.FC<MedicationReminderFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting: propIsSubmitting,
}) => {
    const [formData, setFormData] = useState<MedicationReminderPayload>({
        medication_name_input: '',
        dosage: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        time_of_day: '08:00',
        frequency: 'daily',
        custom_frequency: '',
        notes: '',
        is_active: true,
        prescription_item_id: undefined,
    });
    const [error, setError] = useState<string | null>(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                medication_name_input: initialData.medication_display?.name || '',
                dosage: initialData.dosage || '',
                start_date: initialData.start_date ? initialData.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
                end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
                time_of_day: initialData.time_of_day ? initialData.time_of_day.substring(0, 5) : '08:00',
                frequency: initialData.frequency || 'daily',
                custom_frequency: initialData.custom_frequency || '',
                notes: initialData.notes || '',
                is_active: initialData.is_active === undefined ? true : initialData.is_active,
                prescription_item_id: initialData.prescription_item_id || undefined,
            });
        } else {
            setFormData({
                medication_name_input: '',
                dosage: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                time_of_day: '08:00',
                frequency: 'daily',
                custom_frequency: '',
                notes: '',
                is_active: true,
                prescription_item_id: undefined,
            });
        }
        setError(null);
        setValidationErrors({});
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.medication_name_input.trim()) {
            errors.medication_name_input = 'Medication name is required.';
        } else if (formData.medication_name_input.trim().length < 2) {
            errors.medication_name_input = 'Medication name must be at least 2 characters.';
        }

        if (!formData.dosage.trim()) {
            errors.dosage = 'Dosage is required.';
        }

        if (!formData.start_date) {
            errors.start_date = 'Start date is required.';
        } else {
            const startDate = new Date(formData.start_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (startDate < today) {
                errors.start_date = 'Start date cannot be in the past.';
            }
        }

        if (formData.end_date && formData.start_date) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
            if (endDate <= startDate) {
                errors.end_date = 'End date must be after start date.';
            }
        }

        if (formData.frequency === 'custom' && !formData.custom_frequency?.trim()) {
            errors.custom_frequency = 'Please specify custom frequency details.';
        }

        if (formData.notes && formData.notes.length > 500) {
            errors.notes = 'Notes cannot exceed 500 characters.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationErrors({});
        setIsFormSubmitting(true);

        if (!validateForm()) {
            toast.error('Please fix the errors below.');
            setIsFormSubmitting(false);
            return;
        }

        const payload: MedicationReminderPayload = {
            medication_name_input: formData.medication_name_input.trim(),
            dosage: formData.dosage.trim(),
            start_date: formData.start_date,
            end_date: formData.end_date?.trim() ? formData.end_date : undefined,
            time_of_day: formData.time_of_day,
            frequency: formData.frequency,
            custom_frequency: formData.frequency === 'custom' ? (formData.custom_frequency?.trim() || undefined) : undefined,
            notes: formData.notes?.trim() || undefined,
            prescription_item_id: formData.prescription_item_id ? Number(formData.prescription_item_id) : undefined,
            is_active: formData.is_active,
        };

        try {
            await onSubmit(payload, initialData?.id);
            toast.success(`Reminder ${initialData ? 'updated' : 'added'} successfully!`);
        } catch (err: unknown) {
            console.error("Form submission error from form:", err);
            const anyErr = err as { response?: { data?: unknown }, message?: string };
            const errorData = anyErr.response?.data;
            let errorMessage = `Failed to ${initialData ? 'update' : 'add'} reminder.`;

            if (errorData && typeof errorData === 'object') {
                const messages = Object.entries(errorData)
                    .map(([key, val]) =>
                        `${key === 'detail' ? '' : key + ': '}${Array.isArray(val) ? val.join(', ') : val}`
                    )
                    .join('\n');
                errorMessage = messages || errorMessage;
            } else if (anyErr.message) {
                errorMessage = anyErr.message;
            }

            setError(errorMessage);
            toast.error(errorMessage, { duration: 5000 });
        } finally {
            setIsFormSubmitting(false);
        }
    };

    const getFrequencyDescription = (frequency: ReminderFrequency) => {
        const option = FREQUENCY_OPTIONS.find(opt => opt.value === frequency);
        return option?.description || '';
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="border-b-4 border-black pb-4">
                <h3 className="text-2xl font-black text-black font-display uppercase tracking-tight flex items-center">
                    <EllipsisHorizontalIcon className="h-8 w-8 mr-3 text-black" />
                    {initialData ? 'Edit Reminder' : 'New Reminder'}
                </h3>
                <p className="text-lg text-gray-600 font-bold mt-2">
                    Set up reminders to help you take your medications on time.
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-black mr-2" />
                        <div className="text-sm text-red-900 font-bold">
                            <p className="font-black">Error</p>
                            <p className="mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Medication Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="medication_name_input" className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                        Medication Name *
                    </label>
                    <input 
                        type="text" 
                        name="medication_name_input" 
                        id="medication_name_input" 
                        required 
                        value={formData.medication_name_input} 
                        onChange={handleChange} 
                        className={`w-full p-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all outline-none font-bold text-lg placeholder-gray-400 ${validationErrors.medication_name_input ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="e.g., Lisinopril 10mg" 
                    />
                    {validationErrors.medication_name_input && (
                        <p className="text-red-600 font-bold text-sm mt-1">{validationErrors.medication_name_input}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="dosage" className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                        Dosage *
                    </label>
                    <input 
                        type="text" 
                        name="dosage" 
                        id="dosage" 
                        required 
                        value={formData.dosage} 
                        onChange={handleChange} 
                        className={`w-full p-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all outline-none font-bold text-lg placeholder-gray-400 ${validationErrors.dosage ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="e.g., 1 tablet" 
                    />
                    {validationErrors.dosage && (
                        <p className="text-red-600 font-bold text-sm mt-1">{validationErrors.dosage}</p>
                    )}
                </div>
            </div>

            {/* Schedule Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="start_date" className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                        Start Date *
                    </label>
                    <input 
                        type="date" 
                        name="start_date" 
                        id="start_date" 
                        required 
                        value={formData.start_date} 
                        onChange={handleChange} 
                        className={`w-full p-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all outline-none font-bold text-lg text-gray-700 ${validationErrors.start_date ? 'border-red-500 bg-red-50' : ''}`}
                    />
                    {validationErrors.start_date && (
                        <p className="text-red-600 font-bold text-sm mt-1">{validationErrors.start_date}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="end_date" className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                        End Date (Optional)
                    </label>
                    <input 
                        type="date" 
                        name="end_date" 
                        id="end_date" 
                        value={formData.end_date || ''} 
                        onChange={handleChange} 
                        min={formData.start_date}
                        className={`w-full p-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all outline-none font-bold text-lg text-gray-700 ${validationErrors.end_date ? 'border-red-500 bg-red-50' : ''}`}
                    />
                    {validationErrors.end_date && (
                        <p className="text-red-600 font-bold text-sm mt-1">{validationErrors.end_date}</p>
                    )}
                </div>
            </div>

            {/* Time and Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="time_of_day" className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                        Time of Day *
                    </label>
                    <div className="relative">
                        <input 
                            type="time" 
                            name="time_of_day" 
                            id="time_of_day" 
                            required 
                            value={formData.time_of_day} 
                            onChange={handleChange} 
                            className="w-full p-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all outline-none font-bold text-lg text-gray-700"
                        />
                        <ClockIcon className="h-6 w-6 text-black absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label htmlFor="frequency" className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                        Frequency *
                    </label>
                    <div className="relative">
                        <select 
                            name="frequency" 
                            id="frequency" 
                            required 
                            value={formData.frequency} 
                            onChange={handleChange} 
                            className="w-full p-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all outline-none font-bold text-lg appearance-none text-gray-700"
                        >
                            {FREQUENCY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mt-2 ml-1">
                        {getFrequencyDescription(formData.frequency)}
                    </p>
                </div>
            </div>

            {/* Custom Frequency */}
            {formData.frequency === 'custom' && (
                <div className="bg-blue-50 p-4 rounded-xl border-2 border-black">
                    <label htmlFor="custom_frequency" className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                        Custom Frequency Details *
                    </label>
                    <input 
                        type="text" 
                        name="custom_frequency" 
                        id="custom_frequency" 
                        required={formData.frequency === 'custom'} 
                        value={formData.custom_frequency || ''} 
                        onChange={handleChange} 
                        className={`w-full p-4 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all outline-none font-bold text-lg placeholder-gray-400 ${validationErrors.custom_frequency ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="e.g., Every 3 days" 
                    />
                    {validationErrors.custom_frequency && (
                        <p className="text-red-600 font-bold text-sm mt-1">{validationErrors.custom_frequency}</p>
                    )}
                </div>
            )}

            {/* Prescription Link */}
            <div>
                <label htmlFor="prescription_item_id" className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                    Link to Prescription Item ID (Optional)
                </label>
                <input 
                    type="number" 
                    name="prescription_item_id" 
                    id="prescription_item_id" 
                    value={formData.prescription_item_id || ''} 
                    onChange={handleChange} 
                    className="w-full p-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all outline-none font-bold text-lg placeholder-gray-400"
                    placeholder="Enter ID if known" 
                />
            </div>

            {/* Notes */}
            <div>
                <label htmlFor="notes" className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                    Notes (Optional)
                </label>
                <textarea 
                    name="notes" 
                    id="notes" 
                    rows={3} 
                    value={formData.notes || ''} 
                    onChange={handleChange} 
                    className={`w-full p-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all outline-none font-bold text-lg placeholder-gray-400 ${validationErrors.notes ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="e.g., Take with food..."
                />
                {validationErrors.notes && (
                    <p className="text-red-600 font-bold text-sm mt-1">{validationErrors.notes}</p>
                )}
            </div>

            {/* Active Status */}
            <div className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-black/10">
                <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-6 w-6 text-black border-2 border-black rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="is_active" className="ml-3 block text-base font-bold text-black cursor-pointer select-none">
                    Wait for it... Reminder Active?
                </label>
                <div className="ml-auto">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black ${
                        formData.is_active 
                            ? 'bg-green-400 text-black' 
                            : 'bg-gray-200 text-gray-500'
                    }`}>
                        {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 mt-4 border-t-4 border-black">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    disabled={isFormSubmitting || propIsSubmitting}
                    className="px-6 py-3 border-4 border-black rounded-xl text-black font-black uppercase tracking-wide bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isFormSubmitting || propIsSubmitting}
                    className="px-8 py-3 bg-primary text-white border-4 border-black rounded-xl font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 flex items-center"
                >
                    {isFormSubmitting || propIsSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-4 border-white mr-3"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="h-6 w-6 mr-2" />
                            {initialData ? 'Update' : 'Create'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default MedicationReminderForm;