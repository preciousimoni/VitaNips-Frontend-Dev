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
            className={`relative bg-white rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4 border-black transition-all duration-300 overflow-visible mt-2 ${
                isActive 
                    ? '' 
                    : 'opacity-90'
            }`}
        >
            {/* Active Status Indicator */}
            {isActive ? (
                <div className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10">
                    <CheckCircleIcon className="h-6 w-6" />
                </div>
            ) : (
                <div className="absolute -top-4 -right-4 bg-gray-400 text-white p-2 rounded-full border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10">
                    <BellSlashIcon className="h-6 w-6" />
                </div>
            )}

            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex items-start gap-5 mb-4">
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                                isActive 
                                    ? 'bg-yellow-400' 
                                    : 'bg-gray-200'
                            }`}>
                                <BellAlertIcon className={`h-8 w-8 text-black`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-black text-black font-display uppercase">
                                        {reminder.medication_display?.name || 'Medication N/A'}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black ${
                                        isActive
                                            ? 'bg-green-400 text-black'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                
                                {/* Dosage with Sticker Look */}
                                <div className="inline-block bg-blue-100 px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                                    <span className="text-sm font-black text-black">
                                        Dosage: {reminder.dosage}
                                    </span>
                                </div>

                                {/* Time and Frequency Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 bg-gray-50 p-4 rounded-xl border-2 border-black/10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white rounded-lg border-2 border-black">
                                            <ClockIcon className="h-5 w-5 text-black" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase block">Time</span>
                                            <span className="font-black text-black text-lg leading-none">
                                                {formatTimeDisplay(reminder.time_of_day)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white rounded-lg border-2 border-black">
                                            <CalendarIcon className="h-5 w-5 text-black" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase block">Frequency</span>
                                            <span className="font-black text-black text-lg leading-none">
                                                {getFrequencyLabel(reminder.frequency, reminder.custom_frequency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-black"></span>
                                    <span>
                                        From {formatDateDisplay(reminder.start_date)}
                                        {reminder.end_date ? ` to ${formatDateDisplay(reminder.end_date)}` : ' (Ongoing)'}
                                    </span>
                                </div>

                                {/* Notes */}
                                {reminder.notes && (
                                    <div className="mt-4 p-4 bg-yellow-50 rounded-xl border-l-4 border-black">
                                        <div className="flex items-start gap-3">
                                            <InformationCircleIcon className="h-6 w-6 text-black flex-shrink-0 mt-0.5" />
                                            <p className="text-sm font-bold text-gray-800 italic">"{reminder.notes}"</p>
                                        </div>
                                    </div>
                                )}

                                {/* Prescription Link */}
                                {reminder.prescription_item_id && (
                                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-lg">
                                        <span>Linked to Prescription Item #{reminder.prescription_item_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex lg:flex-col items-center lg:items-start justify-end gap-3 lg:border-l-4 lg:border-gray-100 lg:pl-6 pt-4 lg:pt-0 border-t-2 lg:border-t-0 border-gray-100">
                        <motion.button
                            whileHover={{ scale: 1.05, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onToggleActive(reminder.id, !reminder.is_active)}
                            className={`w-full lg:w-auto p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 font-bold ${
                                isActive 
                                    ? 'bg-amber-100 text-black hover:bg-amber-200' 
                                    : 'bg-green-100 text-black hover:bg-green-200'
                            }`}
                            title={isActive ? "Deactivate" : "Activate"}
                        >
                            {isActive ? (
                                <>
                                    <BellSlashIcon className="h-5 w-5" />
                                    <span className="lg:hidden">Deactivate</span>
                                </>
                            ) : (
                                <>
                                    <BellAlertIcon className="h-5 w-5" />
                                    <span className="lg:hidden">Activate</span>
                                </>
                            )}
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.05, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onEdit(reminder)}
                            className="w-full lg:w-auto p-3 rounded-xl bg-blue-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-200 transition-all flex items-center justify-center gap-2 font-bold"
                            title="Edit"
                        >
                            <PencilSquareIcon className="h-5 w-5" />
                            <span className="lg:hidden">Edit</span>
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.05, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(reminder.id)}
                            className="w-full lg:w-auto p-3 rounded-xl bg-red-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-200 transition-all flex items-center justify-center gap-2 font-bold"
                            title="Delete"
                        >
                            <TrashIcon className="h-5 w-5" />
                            <span className="lg:hidden">Delete</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MedicationReminderListItem;
