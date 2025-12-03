import React from 'react';
import { VitalSignLog } from '../../../types/healthLogs';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface VitalSignLogListItemProps {
    log: VitalSignLog;
    onEdit: (log: VitalSignLog) => void;
    onDelete: (id: number) => void;
}

// const _formatDateTimeDisplay = (isoString: string | null | undefined) => {
//     if (!isoString) return 'N/A';
//     try {
//         return new Date(isoString).toLocaleString('en-US', {
//             month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
//         });
//     } catch {
//         return isoString;
//     }
// };

const formatDay = (isoString: string) => {
    try {
        return new Date(isoString).toLocaleDateString('en-US', { day: 'numeric' });
    } catch { return ''; }
};

const formatMonth = (isoString: string) => {
    try {
        return new Date(isoString).toLocaleDateString('en-US', { month: 'short' });
    } catch { return ''; }
};

const MetricItem: React.FC<{ label: string; value: string | number | null | undefined; unit: string; color?: string }> = ({ label, value, unit, color = "gray" }) => {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    return (
        <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">{label}</span>
            <span className={`text-sm font-bold text-${color}-900`}>
                {value} <span className="text-xs font-normal text-gray-500">{unit}</span>
            </span>
        </div>
    );
};

const VitalSignLogListItem: React.FC<VitalSignLogListItemProps> = ({ log, onEdit, onDelete }) => {
    return (
        <div className="flex items-start group">
            {/* Date Column */}
            <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center mr-6 pt-1">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">{formatMonth(log.date_recorded)}</span>
                <span className="text-2xl font-bold text-gray-900">{formatDay(log.date_recorded)}</span>
                <span className="text-xs text-gray-400 mt-1">{new Date(log.date_recorded).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>

            {/* Content */}
            <div className="flex-grow">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-8">
                    <MetricItem label="Heart Rate" value={log.heart_rate} unit="bpm" color="rose" />
                    <MetricItem label="Blood Pressure" value={log.systolic_pressure && log.diastolic_pressure ? `${log.systolic_pressure}/${log.diastolic_pressure}` : null} unit="mmHg" />
                    <MetricItem label="Weight" value={log.weight} unit="kg" />
                    <MetricItem label="Temp" value={log.temperature} unit="°C" />
                    <MetricItem label="SpO2" value={log.oxygen_saturation} unit="%" />
                    <MetricItem label="Glucose" value={log.blood_glucose} unit="mg/dL" />
                    <MetricItem label="Resp Rate" value={log.respiratory_rate} unit="/min" />
                </div>
                
                {log.notes && (
                    <div className="mt-4 flex items-start">
                        <div className="w-0.5 h-full bg-gray-200 mr-3 self-stretch"></div>
                        <p className="text-sm text-gray-500 italic">
                            "{log.notes}"
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2 ml-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(log); }}
                    className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit"
                >
                    <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default VitalSignLogListItem;
