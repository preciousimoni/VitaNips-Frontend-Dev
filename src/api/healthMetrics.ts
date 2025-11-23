import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
import { VitalSign, SleepLog, ExerciseLog, HealthGoal, HealthInsight } from '../types/health';

export interface CreateVitalSignPayload {
    heart_rate?: number;
    systolic_pressure?: number;
    diastolic_pressure?: number;
    respiratory_rate?: number;
    temperature?: number;
    oxygen_saturation?: number;
    blood_glucose?: number;
    weight?: number;
    notes?: string;
    date_recorded: string;
    source?: string;
}

export const getVitalSigns = async (params?: any): Promise<PaginatedResponse<VitalSign>> => {
    const response = await axiosInstance.get('/health/vital-signs/', { params });
    return response.data;
};

export const createVitalSign = async (payload: CreateVitalSignPayload): Promise<VitalSign> => {
    const response = await axiosInstance.post('/health/vital-signs/', payload);
    return response.data;
};

export const getLatestVitalSign = async (): Promise<VitalSign> => {
    const response = await axiosInstance.get('/health/vital-signs/latest/');
    return response.data;
};

// Sleep
export const getSleepLogs = async (params?: any): Promise<PaginatedResponse<SleepLog>> => {
    const response = await axiosInstance.get('/health/sleep-logs/', { params });
    return response.data;
};

export const createSleepLog = async (payload: any): Promise<SleepLog> => {
    const response = await axiosInstance.post('/health/sleep-logs/', payload);
    return response.data;
};

// Exercise
export const getExerciseLogs = async (params?: any): Promise<PaginatedResponse<ExerciseLog>> => {
    const response = await axiosInstance.get('/health/exercise-logs/', { params });
    return response.data;
};

export const createExerciseLog = async (payload: any): Promise<ExerciseLog> => {
    const response = await axiosInstance.post('/health/exercise-logs/', payload);
    return response.data;
};

// Water
export const getWaterLogs = async (params?: any): Promise<PaginatedResponse<any>> => {
    const response = await axiosInstance.get('/health/water-logs/', { params });
    return response.data;
};

export const createWaterLog = async (payload: any): Promise<any> => {
    const response = await axiosInstance.post('/health/water-logs/', payload);
    return response.data;
};

export const getTodayWaterLog = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('/health/water/today/');
        return response.data;
    } catch (error) {
        return null; // Handle 404 gracefully
    }
};

// Goals
export const getHealthGoals = async (params?: any): Promise<PaginatedResponse<HealthGoal>> => {
    const response = await axiosInstance.get('/health/health-goals/', { params });
    return response.data;
};

// Insights
export const getHealthInsights = async (): Promise<PaginatedResponse<HealthInsight>> => {
    const response = await axiosInstance.get('/health/insights/');
    return response.data;
};

export const getWeeklySummary = async (): Promise<any> => {
    const response = await axiosInstance.get('/health/summary/weekly/');
    return response.data;
};

