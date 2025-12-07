// src/api/doctorPortal.ts
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
import { Prescription as UserPrescription } from '../types/prescriptions'; // User-facing Prescription type
import { VitalSignLog } from '../types/healthLogs';

// Vitals alert types
export interface VitalsAlert {
    type: 'high_bp' | 'low_bp' | 'high_hr' | 'low_hr' | 'fever' | 'hypothermia' | 'low_o2' | 'high_glucose' | 'low_glucose' | 'high_rr' | 'low_rr';
    severity: 'warning' | 'critical';
    message: string;
    value: number | string;
    field: string;
}

export interface PatientVitalsSummary {
    latest_vitals: VitalSignLog | null;
    has_recent_vitals: boolean;
    alerts: VitalsAlert[];
    average_values: {
        heart_rate?: number;
        systolic_pressure?: number;
        diastolic_pressure?: number;
        temperature?: number;
        oxygen_saturation?: number;
        blood_glucose?: number;
    };
    vitals_count: number;
    days_range: number;
}

// Type for appointments listed for doctors to write prescriptions
export interface EligibleAppointmentForPrescription {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    reason: string;
    status: string; // Should be 'completed'
    user: number; // patient ID
    patient_email: string;
    patient_name: string;
    has_existing_prescription: boolean;
    patient_vitals_summary?: PatientVitalsSummary;
}

export interface DoctorPrescriptionItemPayload {
    medication_name_input: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export interface DoctorPrescriptionPayload {
    appointment_id: number;
    diagnosis: string;
    notes?: string | null;
    items: DoctorPrescriptionItemPayload[];
}

// Using UserPrescription type for now for what doctor receives back, can be refined
export const getDoctorEligibleAppointments = async (
    paramsOrUrl: { page?: number } | string | null = null
): Promise<PaginatedResponse<EligibleAppointmentForPrescription>> => {
    const endpoint = '/doctors/portal/eligible-appointments-for-prescription/';
    let response;
    if (typeof paramsOrUrl === 'string') {
        const url = new URL(paramsOrUrl);
        const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
        response = await axiosInstance.get<PaginatedResponse<EligibleAppointmentForPrescription>>(pathWithQuery);
    } else {
        response = await axiosInstance.get<PaginatedResponse<EligibleAppointmentForPrescription>>(endpoint, { params: paramsOrUrl });
    }
    return response.data;
};

export const createDoctorPrescription = async (payload: DoctorPrescriptionPayload): Promise<UserPrescription> => {
    try {
        const response = await axiosInstance.post<UserPrescription>('/doctors/portal/prescriptions/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to create prescription by doctor:', error);
        throw error;
    }
};

export const getDoctorPrescriptions = async (
    paramsOrUrl: { page?: number } | string | null = null
): Promise<PaginatedResponse<UserPrescription>> => { // Assuming UserPrescription structure is suitable
    const endpoint = '/doctors/portal/prescriptions/';
    let response;
    if (typeof paramsOrUrl === 'string') {
        const url = new URL(paramsOrUrl);
        const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
        response = await axiosInstance.get<PaginatedResponse<UserPrescription>>(pathWithQuery);
    } else {
        response = await axiosInstance.get<PaginatedResponse<UserPrescription>>(endpoint, { params: paramsOrUrl });
    }
    return response.data;
};

// Get patient vitals for doctors
export const getPatientVitals = async (
    userId: number,
    days: number = 30
): Promise<PaginatedResponse<VitalSignLog & { alerts?: VitalsAlert[] }>> => {
    const response = await axiosInstance.get<PaginatedResponse<VitalSignLog & { alerts?: VitalsAlert[] }>>(
        `/health/patients/${userId}/vital-signs/`,
        { params: { days } }
    );
    return response.data;
};

// Add getDoctorPrescriptionDetail, update, delete later if needed for full management