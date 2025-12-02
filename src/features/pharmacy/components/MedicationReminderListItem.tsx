// src/features/pharmacy/components/MedicationReminderListItem.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MedicationReminder } from '../../../types/reminders';
import { 
    PencilSquareIcon, 
    TrashIcon, 
    BellAlertIcon, 
    BellSlashIcon,
    ClockIcon,
    CalendarIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface MedicationReminderListItemProps {
    reminder: MedicationReminder;
    onEdit: (reminder: MedicationReminder) => void;
    onDelete: (id: number) => void;
    onToggleActive: (id: number, isActive: boolean) => void;
}

const formatTimeDisplay = (timeStr: string | null | undefined) => {
    if (!timeStr) return 'N/A';
    try {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        if (isNaN(h) || isNaN(m)) return timeStr;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${m < 10 ? '0' + m : m} ${ampm}`;
    } catch {
        return timeStr;
    }
};

const formatDateDisplay = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch {
        return dateStr;
    }
};

const getFrequencyLabel = (frequency: string, custom?: string | null) => {
    const labels: Record<string, string> = {
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        custom: custom || 'Custom',
    };
    return labels[frequency] || frequency;
};

const MedicationReminderListItem: React.FC<MedicationReminderListItemProps> = ({
    reminder,
    onEdit,
    onDelete,
    onToggleActive
}) => {
    const isActive = reminder.is_active;

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className={`relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                isActive 
                    ? 'border-l-4 border-amber-500' 
                    : 'border-l-4 border-gray-300 opacity-75'
            }`}
        >
            {/* Active Status Indicator */}
            {isActive && (
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-amber-500">
                    <CheckCircleIcon className="absolute -top-8 right-1 h-4 w-4 text-white" />
                </div>
            )}

            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3 rounded-xl flex-shrink-0 ${
                                isActive 
                                    ? 'bg-amber-100' 
                                    : 'bg-gray-100'
                            }`}>
                                {isActive ? (
                                    <BellAlertIcon className={`h-6 w-6 ${isActive ? 'text-amber-600' : 'text-gray-500'}`} />
                                ) : (
                                    <BellSlashIcon className="h-6 w-6 text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className={`text-xl font-black ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {reminder.medication_display?.name || 'Medication N/A'}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                
                                {/* Dosage */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm font-semibold text-gray-700">Dosage:</span>
                                    <span className="text-sm text-gray-900 font-medium bg-amber-50 px-3 py-1 rounded-lg">
                                        {reminder.dosage}
                                    </span>
                                </div>

                                {/* Time and Frequency */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <ClockIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatTimeDisplay(reminder.time_of_day)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CalendarIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                        <span className="text-gray-600">Frequency:</span>
                                        <span className="font-semibold text-gray-900">
                                            {getFrequencyLabel(reminder.frequency, reminder.custom_frequency)}
                                        </span>
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    <span>
                                        From {formatDateDisplay(reminder.start_date)}
                                        {reminder.end_date ? ` to ${formatDateDisplay(reminder.end_date)}` : ' (Ongoing)'}
                                    </span>
                                </div>

                                {/* Notes */}
                                {reminder.notes && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-start gap-2">
                                            <InformationCircleIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700">{reminder.notes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Prescription Link */}
                                {reminder.prescription_item_id && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        Linked to Prescription Item #{reminder.prescription_item_id}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:border-l lg:border-gray-200 lg:pl-6">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onToggleActive(reminder.id, !reminder.is_active)}
                            className={`p-3 rounded-xl transition-all ${
                                isActive 
                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                            title={isActive ? "Deactivate Reminder" : "Activate Reminder"}
                        >
                            {isActive ? (
                                <BellAlertIcon className="h-5 w-5" />
                            ) : (
                                <BellSlashIcon className="h-5 w-5" />
                            )}
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onEdit(reminder)}
                            className="p-3 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                            title="Edit Reminder"
                        >
                            <PencilSquareIcon className="h-5 w-5" />
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDelete(reminder.id)}
                            className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                            title="Delete Reminder"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MedicationReminderListItem;
