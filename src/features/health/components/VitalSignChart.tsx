import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { VitalSign } from '../../types/health';

interface VitalSignChartProps {
    data: VitalSign[];
    type: 'blood_pressure' | 'heart_rate' | 'weight';
}

const VitalSignChart: React.FC<VitalSignChartProps> = ({ data, type }) => {
    const chartData = data
        .slice()
        .sort((a, b) => new Date(a.date_recorded).getTime() - new Date(b.date_recorded).getTime())
        .map(vital => ({
            date: format(new Date(vital.date_recorded), 'MMM dd'),
            systolic: vital.systolic_pressure,
            diastolic: vital.diastolic_pressure,
            heart_rate: vital.heart_rate,
            weight: vital.weight,
        }));

    if (type === 'blood_pressure') {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[40, 180]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" stroke="#EF4444" name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#3B82F6" name="Diastolic" />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    const dataKey = type === 'heart_rate' ? 'heart_rate' : 'weight';
    const color = type === 'heart_rate' ? '#EC4899' : '#10B981';
    const label = type === 'heart_rate' ? 'Heart Rate' : 'Weight';

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={dataKey} stroke={color} name={label} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default VitalSignChart;

