import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHealthRecommendations, getHealthTrends } from '@api/analytics';
import PageWrapper from '@components/common/PageWrapper';
import RecommendationsList from '@features/analytics/components/RecommendationsList';
import TrendPredictionChart from '@features/analytics/components/TrendPredictionChart';
import Spinner from '@components/ui/Spinner';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const HealthAnalyticsPage = () => {
    const [selectedMetric, setSelectedMetric] = useState('weight');

    const { data: recommendations, isLoading: isLoadingRecs } = useQuery({
        queryKey: ['healthRecommendations'],
        queryFn: getHealthRecommendations
    });

    const { data: trendData, isLoading: isLoadingTrends } = useQuery({
        queryKey: ['healthTrends', selectedMetric],
        queryFn: () => getHealthTrends(selectedMetric)
    });

    const handleExportReport = async () => {
        try {
            // Generate a comprehensive health report
            const reportData = {
                metric: selectedMetric,
                trends: trendData,
                recommendations: recommendations,
                generatedAt: new Date().toISOString(),
            };

            // Create a downloadable JSON/PDF report
            const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `health-report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Health report downloaded successfully!');
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Failed to export report. Please try again.');
        }
    };

    return (
        <PageWrapper title="Advanced Health Analytics">
            <div className="mb-6 flex justify-end">
                <button
                    onClick={handleExportReport}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    Export Report
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Trends & Predictions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Predictive Trends</h2>
                            <select 
                                value={selectedMetric} 
                                onChange={(e) => setSelectedMetric(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            >
                                <option value="weight">Weight</option>
                                <option value="blood_pressure">Blood Pressure (Systolic)</option>
                            </select>
                        </div>

                        {isLoadingTrends ? (
                            <div className="h-64 flex items-center justify-center">
                                <Spinner size="lg" />
                            </div>
                        ) : trendData ? (
                            <TrendPredictionChart data={trendData} metricLabel={selectedMetric === 'weight' ? 'Weight (kg)' : 'Systolic BP (mmHg)'} />
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                Not enough data to generate predictions. <br/>
                                Please log at least 3 entries for this metric.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: AI Recommendations */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow h-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">AI Insights</h2>
                        {isLoadingRecs ? (
                            <Spinner />
                        ) : (
                            <RecommendationsList recommendations={recommendations || []} />
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default HealthAnalyticsPage;

