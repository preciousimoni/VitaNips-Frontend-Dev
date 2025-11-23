import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LightBulbIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface Recommendation {
    category: string;
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    action: string;
    action_url: string;
}

interface Props {
    recommendations: Recommendation[];
}

const RecommendationsList: React.FC<Props> = ({ recommendations }) => {
    const navigate = useNavigate();

    if (recommendations.length === 0) {
        return (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No recommendations at this time. Keep logging your health data!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {recommendations.map((rec, index) => (
                <div 
                    key={index} 
                    className={`p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow ${
                        rec.priority === 'high' ? 'border-l-4 border-l-red-500' : 
                        rec.priority === 'medium' ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-blue-500'
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <div className="mt-1">
                                <LightBulbIcon className={`h-6 w-6 ${
                                    rec.priority === 'high' ? 'text-red-500' : 
                                    rec.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                                }`} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">{rec.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => navigate(rec.action_url)}
                            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
                        >
                            {rec.action} <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecommendationsList;

