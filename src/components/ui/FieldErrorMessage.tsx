import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface FieldErrorMessageProps {
    message: string | null | undefined;
    className?: string;
}

const FieldErrorMessage: React.FC<FieldErrorMessageProps> = ({ message, className = '' }) => {
    if (!message) return null;

    return (
        <div className={`flex items-center text-red-600 text-sm mt-1 ${className}`}>
            <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
};

export default FieldErrorMessage;

