import React from 'react';
import PageWrapper from '../components/common/PageWrapper';
import SOSButton from '../features/emergency/components/SOSButton';
import EmergencyServiceLocator from '../features/emergency/components/EmergencyServiceLocator';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const EmergencyPage = () => {
    return (
        <PageWrapper title="Emergency Center">
            <div className="max-w-3xl mx-auto space-y-8">
                
                {/* SOS Section */}
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <SOSButton />
                    <p className="text-gray-500 text-sm text-center max-w-xs">
                        Press and hold for 3 seconds to send an emergency alert with your location to all your contacts.
                    </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                If you are in immediate life-threatening danger, please call your local emergency services directly (e.g., 911) first.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Services Locator */}
                <EmergencyServiceLocator />

            </div>
        </PageWrapper>
    );
};

export default EmergencyPage;

