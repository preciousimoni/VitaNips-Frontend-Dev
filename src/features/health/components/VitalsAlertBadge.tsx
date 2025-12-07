// src/features/health/components/VitalsAlertBadge.tsx
import React from 'react';
import { ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { VitalsAlert } from '../../../api/doctorPortal';

interface VitalsAlertBadgeProps {
    alert: VitalsAlert;
    size?: 'sm' | 'md' | 'lg';
}

const VitalsAlertBadge: React.FC<VitalsAlertBadgeProps> = ({ alert, size = 'md' }) => {
    const isCritical = alert.severity === 'critical';
    
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };
    
    const iconSizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    };
    
    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizeClasses[size]} ${
                isCritical
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
            }`}
            title={alert.message}
        >
            {isCritical ? (
                <ExclamationCircleIcon className={iconSizeClasses[size]} />
            ) : (
                <ExclamationTriangleIcon className={iconSizeClasses[size]} />
            )}
            <span className="capitalize">{alert.type.replace(/_/g, ' ')}</span>
        </div>
    );
};

export default VitalsAlertBadge;
