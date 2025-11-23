import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, MoonIcon, FireIcon } from '@heroicons/react/24/outline';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

const QuickHealthLogger = () => {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Log Vitals',
            icon: <HeartIcon className="h-6 w-6" />,
            color: 'text-red-600 bg-red-100',
            path: '/health/vitals/add'
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
    ];

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-4">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border border-transparent hover:bg-gray-50 hover:border-gray-200 transition-all"
                    >
                        <div className={`p-3 rounded-full mb-2 ${action.color}`}>
                            {action.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickHealthLogger;

