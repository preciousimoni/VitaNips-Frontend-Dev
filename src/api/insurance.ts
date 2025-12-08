// src/api/insurance.ts
import axiosInstance from './axiosInstance';
import { UserInsurance, UserInsurancePayload, InsurancePlan } from '../types/insurance';
import { PaginatedResponse } from '../types/common';

type InsuranceListParams = { page?: number; is_primary?: boolean };
type PlanListParams = { page?: number; provider?: number };


export const getUserInsurances = async (
    paramsOrUrl: InsuranceListParams | string | null = null
): Promise<PaginatedResponse<UserInsurance>> => {
    const endpoint = '/insurance/user-insurance/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<UserInsurance>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<UserInsurance>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user insurances:', error);
        throw error;
    }
};

export const getAvailablePlans = async (
    paramsOrUrl: PlanListParams | string | null = null
): Promise<PaginatedResponse<InsurancePlan>> => {
    const endpoint = '/insurance/plans/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
             const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<InsurancePlan>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<InsurancePlan>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch available insurance plans:', error);
        throw error;
    }
};

export const addUserInsurance = async (payload: UserInsurancePayload): Promise<UserInsurance> => {
    try {
        const response = await axiosInstance.post<UserInsurance>('/insurance/user-insurance/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to add user insurance:', error);
        throw error;
    }
};

export const updateUserInsurance = async (id: number, payload: Partial<UserInsurancePayload>): Promise<UserInsurance> => {
    try {
        const response = await axiosInstance.patch<UserInsurance>(`/insurance/user-insurance/${id}/`, payload);
        return response.data;
    } catch (error) {
        console.error(`Failed to update user insurance ${id}:`, error);
        throw error;
    }
};

export const deleteUserInsurance = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/insurance/user-insurance/${id}/`);
    } catch (error) {
        console.error(`Failed to delete user insurance ${id}:`, error);
        throw error;
    }
};

export interface VerifyInsuranceDetailsPayload {
    plan_id: number;
    member_id: string;
    policy_number: string;
}

export interface VerifyInsuranceDetailsResponse {
    valid: boolean;
    message?: string;
    error?: string;
    provider?: string;
    plan?: string;
    note?: string;
}

export const verifyInsuranceDetails = async (payload: VerifyInsuranceDetailsPayload): Promise<VerifyInsuranceDetailsResponse> => {
    try {
        const response = await axiosInstance.post<VerifyInsuranceDetailsResponse>('/insurance/verify/', payload);
        return response.data;
    } catch (error: any) {
        console.error('Failed to verify insurance details:', error);
        // Return error response from API if available
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};
