import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface TrendData {
    trend: 'increasing' | 'decreasing' | 'stable';
    slope: number;
    predictions: number[];
    confidence: number;
}

interface Props {
    data: TrendData;
    metricLabel: string;
}

const TrendPredictionChart: React.FC<Props> = ({ data, metricLabel }) => {
    // Generate chart data points for the predictions (next 7 days)
    const chartData = data.predictions.map((val, idx) => ({
        day: `Day +${idx + 1}`,
        predicted: val
    }));

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">7-Day Forecast: {metricLabel}</h4>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    data.trend === 'increasing' ? 'bg-red-100 text-red-800' : 
                    data.trend === 'decreasing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    Trend: {data.trend.toUpperCase()}
                </span>
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#8884d8" 
                        strokeDasharray="5 5" 
                        name="Predicted Value"
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2 text-right">Confidence Score: {(data.confidence * 100).toFixed(1)}%</p>
        </div>
    );
};

export default TrendPredictionChart;

