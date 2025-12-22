// src/api/testRequests.ts
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
import { MedicalDocument } from './documents';

export interface TestRequest {
    id: number;
    appointment: number;
    appointment_date: string;
    doctor: number | { id: number; full_name: string };
    doctor_name: string;
    patient: number;
    patient_name: string;
    patient_email: string;
    test_name: string;
    test_description?: string;
    instructions?: string;
    status: 'pending' | 'completed' | 'cancelled';
    requested_at: string;
    completed_at?: string;
    notes?: string;
    followup_appointment?: number | null;
    has_test_results: boolean;
    test_results_count: number;
    created_at: string;
    updated_at: string;
}

export interface TestRequestPayload {
    appointment_id: number;
    test_name: string;
    test_description?: string;
    instructions?: string;
    notes?: string;
}

export interface TestRequestUpdatePayload {
    test_name?: string;
    test_description?: string;
    instructions?: string;
    notes?: string;
    status?: 'pending' | 'completed' | 'cancelled';
}

// Get all test requests for the authenticated doctor
export const getDoctorTestRequests = async (): Promise<PaginatedResponse<TestRequest>> => {
    try {
        const response = await axiosInstance.get<PaginatedResponse<TestRequest>>('/doctors/test-requests/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch doctor test requests:', error);
        throw error;
    }
};

// Get all test requests for the authenticated patient
export const getPatientTestRequests = async (): Promise<PaginatedResponse<TestRequest>> => {
    try {
        const response = await axiosInstance.get<PaginatedResponse<TestRequest>>('/doctors/test-requests/my-requests/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch patient test requests:', error);
        throw error;
    }
};

// Get a specific test request by ID
export const getTestRequestById = async (id: number): Promise<TestRequest> => {
    try {
        const response = await axiosInstance.get<TestRequest>(`/doctors/test-requests/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch test request:', error);
        throw error;
    }
};

// Create a new test request (doctor only)
export const createTestRequest = async (payload: TestRequestPayload): Promise<TestRequest> => {
    try {
        const response = await axiosInstance.post<TestRequest>('/doctors/test-requests/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to create test request:', error);
        throw error;
    }
};

// Update a test request
export const updateTestRequest = async (id: number, payload: TestRequestUpdatePayload): Promise<TestRequest> => {
    try {
        const response = await axiosInstance.patch<TestRequest>(`/doctors/test-requests/${id}/`, payload);
        return response.data;
    } catch (error) {
        console.error('Failed to update test request:', error);
        throw error;
    }
};

// Delete a test request
export const deleteTestRequest = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/doctors/test-requests/${id}/`);
    } catch (error) {
        console.error('Failed to delete test request:', error);
        throw error;
    }
};

// Get test results (documents) for a test request (doctor only)
export const getTestRequestResults = async (testRequestId: number): Promise<MedicalDocument[]> => {
    try {
        const response = await axiosInstance.get<{ results: MedicalDocument[] }>(`/doctors/test-requests/${testRequestId}/results/`);
        return response.data.results || [];
    } catch (error) {
        console.error('Failed to fetch test request results:', error);
        throw error;
    }
};

