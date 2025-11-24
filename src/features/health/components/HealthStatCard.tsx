import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
    label: string;
    value: string | number;
    unit?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color: string;
    delay?: number;
}

const HealthStatCard: React.FC<StatCardProps> = ({
    label,
    value,
    unit,
    icon: Icon,
    trend,
    trendValue,
    color,
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600`}>
                    <Icon className="h-5 w-5" />
                </div>
                {trend && trendValue && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        trend === 'up' ? 'bg-green-50 text-green-600' : 
                        trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
                    }`}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'} {trendValue}
                    </span>
                )}
            </div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">{label}</h4>
            <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {unit && <span className="text-sm text-gray-500 ml-1 font-medium">{unit}</span>}
            </div>
        </motion.div>
    );
};

export default HealthStatCard;

