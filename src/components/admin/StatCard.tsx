// src/components/admin/StatCard.tsx
import React from 'react';

interface StatDetail {
    label: string;
    value: number | string;
}

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    details: StatDetail[];
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, details }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
            <div className="mr-4">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <div className="mt-2 space-y-1">
                    {details.map((detail, index) => (
                        <div key={index} className="flex justify-between text-sm text-gray-600">
                            <span>{detail.label}:</span>
                            <span className="font-semibold">{detail.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
