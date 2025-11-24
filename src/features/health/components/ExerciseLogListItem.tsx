import React from 'react';
import { ExerciseLog } from '../../../types/healthLogs';
import { PencilSquareIcon, TrashIcon, ClockIcon, FireIcon, MapIcon, BoltIcon } from '@heroicons/react/24/outline';

interface ExerciseLogListItemProps {
    log: ExerciseLog;
    onEdit: (log: ExerciseLog) => void;
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

const ExerciseLogListItem: React.FC<ExerciseLogListItemProps> = ({ log, onEdit, onDelete }) => {
    return (
        <div className="flex items-start group">
            {/* Date */}
            <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center mr-6 pt-1">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">{formatMonth(log.datetime)}</span>
                <span className="text-2xl font-bold text-gray-900">{formatDay(log.datetime)}</span>
                <span className="text-xs text-gray-400 mt-1">{formatTime(log.datetime)}</span>
            </div>

            {/* Content */}
            <div className="flex-grow">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{log.activity_type}</h3>
                    {log.intensity && (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            log.intensity === 'high' ? 'bg-red-100 text-red-800' :
                            log.intensity === 'medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                            {log.intensity} Intensity
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center text-sm text-gray-700">
                        <ClockIcon className="h-5 w-5 mr-2 text-blue-400" />
                        <span className="font-bold">{log.duration}</span> <span className="text-gray-500 ml-1">min</span>
                    </div>
                    {log.calories_burned && (
                        <div className="flex items-center text-sm text-gray-700">
                            <FireIcon className="h-5 w-5 mr-2 text-orange-400" />
                            <span className="font-bold">{log.calories_burned}</span> <span className="text-gray-500 ml-1">kcal</span>
                        </div>
                    )}
                    {log.distance && (
                        <div className="flex items-center text-sm text-gray-700">
                            <MapIcon className="h-5 w-5 mr-2 text-green-400" />
                            <span className="font-bold">{log.distance}</span> <span className="text-gray-500 ml-1">km</span>
                        </div>
                    )}
                    {log.heart_rate_avg && (
                        <div className="flex items-center text-sm text-gray-700">
                            <BoltIcon className="h-5 w-5 mr-2 text-rose-400" />
                            <span className="font-bold">{log.heart_rate_avg}</span> <span className="text-gray-500 ml-1">bpm</span>
                        </div>
                    )}
                </div>

                {log.notes && (
                    <p className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
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

export default ExerciseLogListItem;
