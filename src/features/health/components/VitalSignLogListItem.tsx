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
            <span className="text-xs uppercase tracking-wider font-extrabold text-gray-500 mb-0.5">{label}</span>
            <span className={`text-lg font-black text-${color}-900`}>
                {value} <span className="text-sm font-bold text-gray-500">{unit}</span>
            </span>
        </div>
    );
};

const VitalSignLogListItem: React.FC<VitalSignLogListItemProps> = ({ log, onEdit, onDelete }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start group gap-6">
            {/* Date Column */}
            <div className="flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-1">
                <div className="bg-black text-white px-3 py-1 rounded-lg font-black text-base uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                    {formatMonth(log.date_recorded)}
                </div>
                <div className="flex items-baseline gap-2 sm:gap-0 sm:flex-col">
                    <span className="text-4xl font-black text-black leading-none">{formatDay(log.date_recorded)}</span>
                    <span className="text-base font-bold text-gray-500">{new Date(log.date_recorded).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow bg-gray-50 rounded-2xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-6 gap-x-4">
                    <MetricItem label="Heart Rate" value={log.heart_rate} unit="bpm" color="rose" />
                    <MetricItem label="Blood Pressure" value={log.systolic_pressure && log.diastolic_pressure ? `${log.systolic_pressure}/${log.diastolic_pressure}` : null} unit="mmHg" color="blue" />
                    <MetricItem label="Weight" value={log.weight} unit="kg" color="indigo" />
                    <MetricItem label="Temp" value={log.temperature} unit="°C" color="orange" />
                    <MetricItem label="SpO2" value={log.oxygen_saturation} unit="%" color="cyan" />
                    <MetricItem label="Glucose" value={log.blood_glucose} unit="mg/dL" color="emerald" />
                    <MetricItem label="Resp Rate" value={log.respiratory_rate} unit="/min" color="purple" />
                </div>
                
                {log.notes && (
                    <div className="mt-5 pt-4 border-t-2 border-gray-200">
                        <p className="text-base text-gray-800 font-bold italic border-l-4 border-yellow-400 pl-3">
                            "{log.notes}"
                        </p>
                    </div>
                )}
                
                {/* Mobile Actions (Visible on bottom) */}
                <div className="flex sm:hidden mt-4 justify-end gap-3 pt-3 border-t-2 border-gray-200 border-dashed">
                     <button
                        onClick={(e) => { e.stopPropagation(); onEdit(log); }}
                        className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs border-2 border-transparent hover:border-black transition-all"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
                        className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-bold text-xs border-2 border-transparent hover:border-black transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pt-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(log); }}
                    className="p-2 rounded-xl text-black bg-blue-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-300 transition-all"
                    title="Edit"
                >
                    <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
                    className="p-2 rounded-xl text-black bg-red-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-300 transition-all"
                    title="Delete"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default VitalSignLogListItem;
