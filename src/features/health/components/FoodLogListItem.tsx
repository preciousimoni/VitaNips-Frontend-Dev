import React from 'react';
import { FoodLog } from '../../../types/healthLogs';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FoodLogListItemProps {
    log: FoodLog;
    onEdit: (log: FoodLog) => void;
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

const MealBadge: React.FC<{ type: string }> = ({ type }) => {
    const colors: Record<string, string> = {
        breakfast: 'bg-orange-100 text-orange-800',
        lunch: 'bg-blue-100 text-blue-800',
        dinner: 'bg-indigo-100 text-indigo-800',
        snack: 'bg-purple-100 text-purple-800',
    };
    return (
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
            {type}
        </span>
    );
};

const MacroItem: React.FC<{ label: string; value: string | number | null | undefined; unit: string; color: string }> = ({ label, value, unit, color }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col items-center px-3 border-r border-gray-100 last:border-0">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">{label}</span>
            <span className={`text-sm font-bold text-${color}-600`}>{value}{unit}</span>
        </div>
    );
};

const FoodLogListItem: React.FC<FoodLogListItemProps> = ({ log, onEdit, onDelete }) => {
    return (
        <div className="flex items-start group">
            {/* Date */}
            <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center mr-6 pt-1">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{formatMonth(log.datetime)}</span>
                <span className="text-2xl font-bold text-gray-900">{formatDay(log.datetime)}</span>
                <span className="text-xs text-gray-400 mt-1">{formatTime(log.datetime)}</span>
            </div>

            {/* Content */}
            <div className="flex-grow">
                <div className="flex items-center mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mr-3">{log.food_item}</h3>
                    <MealBadge type={log.meal_type} />
                </div>

                <div className="flex flex-wrap bg-gray-50 rounded-xl p-3 border border-gray-100 w-fit">
                    {log.calories ? <MacroItem label="Calories" value={log.calories} unit="kcal" color="orange" /> : null}
                    <MacroItem label="Protein" value={log.proteins} unit="g" color="blue" />
                    <MacroItem label="Carbs" value={log.carbohydrates} unit="g" color="green" />
                    <MacroItem label="Fat" value={log.fats} unit="g" color="red" />
                </div>

                {log.notes && (
                    <p className="mt-3 text-sm text-gray-500 italic">"{log.notes}"</p>
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

export default FoodLogListItem;
