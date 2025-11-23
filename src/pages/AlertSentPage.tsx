import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import PageWrapper from '../components/common/PageWrapper';

const AlertSentPage = () => {
    return (
        <PageWrapper title="Emergency Alert Sent">
            <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                <CheckCircleIcon className="h-24 w-24 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900">Alert Sent Successfully</h2>
                <p className="text-gray-600 max-w-md">
                    Your emergency contacts have been notified with your current location. 
                    Help is on the way.
                </p>
                <div className="space-y-4">
                    <Link 
                        to="/emergency" 
                        className="block px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                    >
                        Return to Emergency Center
                    </Link>
                    <Link 
                        to="/dashboard" 
                        className="block text-primary hover:underline"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </PageWrapper>
    );
};

export default AlertSentPage;

