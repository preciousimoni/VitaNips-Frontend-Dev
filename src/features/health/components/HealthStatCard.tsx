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
            className="bg-white rounded-2xl p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-xl bg-${color}-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                    <Icon className="h-6 w-6" />
                </div>
                {trend && trendValue && (
                    <span className={`text-sm font-black px-2 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        trend === 'up' ? 'bg-green-400 text-black' : 
                        trend === 'down' ? 'bg-red-400 text-black' : 'bg-gray-200 text-black'
                    }`}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'} {trendValue}
                    </span>
                )}
            </div>
            <h4 className="text-base font-bold text-gray-600 mb-1 uppercase tracking-wide">{label}</h4>
            <div className="flex items-baseline">
                <span className="text-4xl font-black text-black">{value}</span>
                {unit && <span className="text-base text-gray-600 ml-1 font-bold">{unit}</span>}
            </div>
        </motion.div>
    );
};

export default HealthStatCard;

