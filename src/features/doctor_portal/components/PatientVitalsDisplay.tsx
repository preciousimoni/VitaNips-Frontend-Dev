// src/features/doctor_portal/components/PatientVitalsDisplay.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HeartIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { PatientVitalsSummary } from '../../../api/doctorPortal';
import VitalsAlertBadge from '../../health/components/VitalsAlertBadge';
import { formatDate } from '../../../utils/date';

interface PatientVitalsDisplayProps {
    vitalsSummary: PatientVitalsSummary | null | undefined;
    onViewFullHistory?: () => void;
}

const PatientVitalsDisplay: React.FC<PatientVitalsDisplayProps> = ({
    vitalsSummary,
    onViewFullHistory
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!vitalsSummary) {
        return (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-200 rounded-xl">
                        <HeartIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700">Patient Vitals</h3>
                </div>
                <p className="text-sm text-gray-500">Loading vitals data...</p>
            </div>
        );
    }

    const { latest_vitals, has_recent_vitals, alerts, average_values, vitals_count } = vitalsSummary;

    if (!has_recent_vitals) {
        return (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-200 rounded-xl">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-700" />
                    </div>
                    <h3 className="text-lg font-bold text-yellow-800">No Recent Vitals</h3>
                </div>
                <p className="text-sm text-yellow-700">
                    This patient has not logged any vitals in the last 7 days.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-emerald-50 cursor-pointer hover:from-primary/10 hover:to-emerald-100 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <HeartIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Patient Vitals</h3>
                        <p className="text-xs text-gray-600">
                            {vitals_count} {vitals_count === 1 ? 'reading' : 'readings'} in last 7 days
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {alerts.length > 0 && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                            {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="p-6 space-y-6">
                            {/* Alerts Section */}
                            {alerts.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
                                        <ExclamationTriangleIcon className="h-4 w-4" />
                                        Abnormal Readings Detected
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {alerts.map((alert, index) => (
                                            <VitalsAlertBadge key={index} alert={alert} size="sm" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Latest Reading */}
                            {latest_vitals && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            Latest Reading
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(latest_vitals.date_recorded)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {latest_vitals.systolic_pressure && latest_vitals.diastolic_pressure && (
                                            <VitalCard
                                                label="Blood Pressure"
                                                value={`${latest_vitals.systolic_pressure}/${latest_vitals.diastolic_pressure}`}
                                                unit="mmHg"
                                                hasAlert={alerts.some(a => a.field === 'blood_pressure')}
                                            />
                                        )}
                                        {latest_vitals.heart_rate && (
                                            <VitalCard
                                                label="Heart Rate"
                                                value={latest_vitals.heart_rate}
                                                unit="BPM"
                                                hasAlert={alerts.some(a => a.field === 'heart_rate')}
                                            />
                                        )}
                                        {latest_vitals.temperature && (
                                            <VitalCard
                                                label="Temperature"
                                                value={latest_vitals.temperature}
                                                unit="°C"
                                                hasAlert={alerts.some(a => a.field === 'temperature')}
                                            />
                                        )}
                                        {latest_vitals.oxygen_saturation && (
                                            <VitalCard
                                                label="O₂ Saturation"
                                                value={latest_vitals.oxygen_saturation}
                                                unit="%"
                                                hasAlert={alerts.some(a => a.field === 'oxygen_saturation')}
                                            />
                                        )}
                                        {latest_vitals.blood_glucose && (
                                            <VitalCard
                                                label="Blood Glucose"
                                                value={latest_vitals.blood_glucose}
                                                unit="mg/dL"
                                                hasAlert={alerts.some(a => a.field === 'blood_glucose')}
                                            />
                                        )}
                                        {latest_vitals.respiratory_rate && (
                                            <VitalCard
                                                label="Respiratory Rate"
                                                value={latest_vitals.respiratory_rate}
                                                unit="/min"
                                                hasAlert={alerts.some(a => a.field === 'respiratory_rate')}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Average Values */}
                            {Object.keys(average_values).length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <ArrowTrendingUpIcon className="h-4 w-4" />
                                        7-Day Averages
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {average_values.systolic_pressure && average_values.diastolic_pressure && (
                                            <VitalCard
                                                label="Avg BP"
                                                value={`${average_values.systolic_pressure}/${average_values.diastolic_pressure}`}
                                                unit="mmHg"
                                                isAverage
                                            />
                                        )}
                                        {average_values.heart_rate && (
                                            <VitalCard
                                                label="Avg HR"
                                                value={average_values.heart_rate}
                                                unit="BPM"
                                                isAverage
                                            />
                                        )}
                                        {average_values.temperature && (
                                            <VitalCard
                                                label="Avg Temp"
                                                value={average_values.temperature}
                                                unit="°C"
                                                isAverage
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* View Full History Button */}
                            {onViewFullHistory && (
                                <button
                                    onClick={onViewFullHistory}
                                    className="w-full py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors text-sm"
                                >
                                    View Full Vitals History
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper component for individual vital cards
const VitalCard: React.FC<{
    label: string;
    value: number | string;
    unit: string;
    hasAlert?: boolean;
    isAverage?: boolean;
}> = ({ label, value, unit, hasAlert, isAverage }) => (
    <div
        className={`p-3 rounded-xl border-2 ${
            hasAlert
                ? 'bg-red-50 border-red-300'
                : isAverage
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
        }`}
    >
        <p className={`text-xs font-medium ${hasAlert ? 'text-red-600' : 'text-gray-600'} mb-1`}>
            {label}
        </p>
        <p className={`text-lg font-black ${hasAlert ? 'text-red-900' : 'text-gray-900'}`}>
            {value} <span className="text-sm font-normal text-gray-600">{unit}</span>
        </p>
    </div>
);

export default PatientVitalsDisplay;
