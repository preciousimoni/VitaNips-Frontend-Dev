import React from 'react';
import { SymptomLog, SymptomSeverity } from '../../../types/healthLogs';
import { PencilSquareIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

interface SymptomLogListItemProps {
    log: SymptomLog;
    onEdit: (log: SymptomLog) => void;
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

const severityConfig: Record<SymptomSeverity, { label: string; color: string; bg: string }> = {
    1: { label: 'Mild', color: 'text-green-700', bg: 'bg-green-50' },
    2: { label: 'Moderate', color: 'text-yellow-700', bg: 'bg-yellow-50' },
    3: { label: 'Severe', color: 'text-orange-700', bg: 'bg-orange-50' },
    4: { label: 'Very Severe', color: 'text-red-700', bg: 'bg-red-50' },
};

const SymptomLogListItem: React.FC<SymptomLogListItemProps> = ({ log, onEdit, onDelete }) => {
    const severity = severityConfig[log.severity] || severityConfig[1];

    return (
        <div className="flex items-start group">
            {/* Date Column */}
            <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center mr-6 pt-1">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{formatMonth(log.date_experienced)}</span>
                <span className="text-2xl font-bold text-gray-900">{formatDay(log.date_experienced)}</span>
                <span className="text-xs text-gray-400 mt-1">{formatTime(log.date_experienced)}</span>
            </div>

            {/* Content */}
            <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{log.symptom}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${severity.bg} ${severity.color}`}>
                        {severity.label}
                    </span>
                </div>
                
                <div className="space-y-1">
                    {log.duration && (
                        <p className="text-sm text-gray-600 flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                            Duration: {log.duration}
                        </p>
                    )}
                    
                    {log.notes && (
                        <div className="mt-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl italic border border-gray-100">
                            "{log.notes}"
                        </div>
                    )}
                </div>
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

export default SymptomLogListItem;
