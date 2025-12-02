import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HeartIcon, 
    MoonIcon, 
    FireIcon, 
    ArrowPathIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

const QuickHealthLogger = () => {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Log Vitals',
            icon: <HeartIcon className="h-6 w-6" />,
            color: 'text-red-600 bg-red-100',
            path: '/health/vitals'
        },
        {
            label: 'Log Sleep',
            icon: <MoonIcon className="h-6 w-6" />,
            color: 'text-indigo-600 bg-indigo-100',
            path: '/health/sleep'
        },
        {
            label: 'Log Exercise',
            icon: <FireIcon className="h-6 w-6" />,
            color: 'text-orange-600 bg-orange-100',
            path: '/health/exercise'
        },
        {
            label: 'Log Water',
            icon: <ArrowPathIcon className="h-6 w-6" />,
            color: 'text-cyan-600 bg-cyan-100',
            path: '/health/water'
        },
        {
            label: 'Set Exercise Goal',
            icon: <TrophyIcon className="h-6 w-6" />,
            color: 'text-blue-600 bg-blue-100',
            path: '/health/goals'
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-transparent hover:bg-gray-50 hover:border-gray-200 hover:shadow-md transition-all"
                    >
                        <div className={`p-3 rounded-full mb-2 ${action.color}`}>
                            {action.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-700 text-center leading-tight">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickHealthLogger;

