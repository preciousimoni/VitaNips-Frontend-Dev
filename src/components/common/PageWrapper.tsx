// src/components/common/PageWrapper.tsx
import React from 'react';
import Spinner from '../ui/Spinner';
import ErrorMessage from '../ui/ErrorMessage';
import EmptyState from './EmptyState';

interface PageWrapperProps {
    isLoading?: boolean;
    error?: string | null;
    isEmpty?: boolean;
    emptyStateProps?: {
        icon?: React.ComponentType<{ className?: string }>;
        title: string;
        description?: string;
        actionLabel?: string;
        onAction?: () => void;
    };
    onRetry?: () => void;
    loadingText?: string;
    children: React.ReactNode;
    className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
    isLoading,
    error,
    isEmpty,
    emptyStateProps,
    onRetry,
    loadingText,
    children,
    className = '',
}) => {
    if (isLoading) {
        return (
            <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
                <div className="text-center">
                    <Spinner size="lg" />
                    {loadingText && <p className="mt-2 text-gray-600">{loadingText}</p>}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`max-w-2xl mx-auto ${className}`}>
                <ErrorMessage message={error} onRetry={onRetry} />
            </div>
        );
    }

    if (isEmpty && emptyStateProps) {
        return (
            <div className={className}>
                <EmptyState {...emptyStateProps} />
            </div>
        );
    }

    return <div className={className}>{children}</div>;
};

export default PageWrapper;
