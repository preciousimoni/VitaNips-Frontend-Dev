import React from 'react';
import { SleepLog, SleepQuality } from '../../../types/healthLogs';
import { PencilSquareIcon, TrashIcon, MoonIcon, StarIcon } from '@heroicons/react/24/outline';

interface SleepLogListItemProps {
    log: SleepLog;
    onEdit: (log: SleepLog) => void;
    onDelete: (id: number) => void;
}

const formatTime = (isoString: string) => {
    try { return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
};

const formatDay = (isoString: string) => {
    try { return new Date(isoString).toLocaleDateString('en-US', { day: 'numeric' }); } catch { return ''; }
};

const formatMonth = (isoString: string) => {
    try { return new Date(isoString).toLocaleDateString('en-US', { month: 'short' }); } catch { return ''; }
};

const SleepLogListItem: React.FC<SleepLogListItemProps> = ({ log, onEdit, onDelete }) => {
    const calculateDuration = (sleep: string, wake: string): string => {
        try {
            const diff = new Date(wake).getTime() - new Date(sleep).getTime();
            if (isNaN(diff) || diff < 0) return 'N/A';
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        } catch { return "N/A"; }
    };
    const durationDisplay = log.duration ? `${log.duration.toFixed(1)} hrs` : calculateDuration(log.sleep_time, log.wake_time);

    const renderStars = (rating: number) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
            </div>
        );
    };

    return (
        <div className="flex items-start group">
            {/* Date */}
            <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center mr-6 pt-1">
                <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">{formatMonth(log.wake_time)}</span>
                <span className="text-2xl font-bold text-gray-900">{formatDay(log.wake_time)}</span>
                <span className="text-xs text-gray-400 mt-1">{formatTime(log.wake_time)}</span>
            </div>

            {/* Content */}
            <div className="flex-grow">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <div className="mr-3 p-2 rounded-lg bg-violet-50 text-violet-600">
                            <MoonIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{durationDisplay} Sleep</h3>
                            <p className="text-xs text-gray-500">
                                {formatTime(log.sleep_time)} - {formatTime(log.wake_time)}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Quality</span>
                        {renderStars(log.quality)}
                    </div>
                </div>

                {log.interruptions !== undefined && log.interruptions > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium text-gray-900">{log.interruptions}</span> interruptions recorded
                    </p>
                )}

                {log.notes && (
                    <p className="text-sm text-gray-500 italic border-l-2 border-violet-200 pl-3">
                        "{log.notes}"
                    </p>
                )}
            </div>

             {/* Actions */}
             <div className="flex flex-col space-y-2 ml-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button onClick={(e) => { e.stopPropagation(); onEdit(log); }} className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                    <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(log.id); }} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default SleepLogListItem;
