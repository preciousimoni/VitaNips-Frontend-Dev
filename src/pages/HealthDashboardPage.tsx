import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVitalSigns, getHealthInsights } from '@api/healthMetrics';
import PageWrapper from '@components/common/PageWrapper';
import VitalSignChart from '@features/health/components/VitalSignChart';
import QuickHealthLogger from '@features/health/components/QuickHealthLogger';
import { InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const HealthDashboardPage = () => {
    const { data: vitalsResponse, isLoading: isLoadingVitals } = useQuery({
        queryKey: ['vitalSigns'],
        queryFn: () => getVitalSigns({ limit: 30 }) // Last 30 records
    });

    const { data: insightsResponse, isLoading: isLoadingInsights } = useQuery({
        queryKey: ['healthInsights'],
        queryFn: () => getHealthInsights()
    });

    const vitals = vitalsResponse?.results || [];
    const insights = insightsResponse?.results || [];

    return (
        <PageWrapper title="Health Dashboard" isLoading={isLoadingVitals && isLoadingInsights}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Content - Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Blood Pressure Trends</h3>
                        <VitalSignChart data={vitals} type="blood_pressure" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Heart Rate</h3>
                            <VitalSignChart data={vitals} type="heart_rate" />
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Weight</h3>
                            <VitalSignChart data={vitals} type="weight" />
                        </div>
                    </div>
                </div>

                {/* Sidebar - Quick Actions & Insights */}
                <div className="space-y-6">
                    <QuickHealthLogger />

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Health Insights</h3>
                        <div className="space-y-4">
                            {insights.length === 0 ? (
                                <p className="text-gray-500 text-sm">No new insights available.</p>
                            ) : (
                                insights.map(insight => (
                                    <div 
                                        key={insight.id} 
                                        className={`p-4 rounded-lg border-l-4 ${
                                            insight.priority === 'high' ? 'bg-red-50 border-red-500' : 
                                            insight.insight_type === 'achievement' ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-3">
                                                {insight.priority === 'high' ? (
                                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                                ) : (
                                                    <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900">{insight.title}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default HealthDashboardPage;

