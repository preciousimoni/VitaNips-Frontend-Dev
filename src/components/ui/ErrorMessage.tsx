// src/components/ui/ErrorMessage.tsx
import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, className = '' }) => {
  return (
    <div
      className={`bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-r-lg ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="py-1">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
        </div>
        <div>
          <p className="font-bold">Error</p>
          <p className="text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-600"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
