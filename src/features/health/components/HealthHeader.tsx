import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HealthHeaderProps {
    title: string;
    subtitle: string;
    icon: React.ElementType;
    gradientFrom: string;
    gradientTo: string;
    shadowColor: string;
    actionButton?: React.ReactNode;
}

const HealthHeader: React.FC<HealthHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    gradientFrom,
    gradientTo,
    shadowColor,
    actionButton,
}) => {
    return (
        <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center px-4 py-2 bg-white text-black font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all mb-8 group">
                <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center"
                >
                    <div className={`w-20 h-20 rounded-2xl bg-${gradientFrom.replace('from-', '')} flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mr-6`}>
                        <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-black font-display uppercase tracking-tight">{title}</h1>
                        <p className="text-lg text-gray-700 mt-1 font-bold">{subtitle}</p>
                    </div>
                </motion.div>
                {actionButton && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {actionButton}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HealthHeader;

