import axiosInstance from './axiosInstance';

interface CreateOrderPayload {
    pharmacy_id: number;
    user_insurance_id?: number | null;
}

export const createOrderFromPrescription = async (
    prescriptionId: number,
    pharmacyId: number,
    userInsuranceId?: number | null
): Promise<any> => {
    try {
        const payload: CreateOrderPayload = { pharmacy_id: pharmacyId };
        if (userInsuranceId) {
            payload.user_insurance_id = userInsuranceId;
        }
        const response = await axiosInstance.post(
            `/pharmacy/prescriptions/${prescriptionId}/create_order/`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('Failed to create order:', error);
        throw error;
    }
};

import { PaginatedResponse } from './../types/common';
import { MedicationOrder } from './../types/pharmacy';

export const getUserOrders = async (params?: { ordering?: string }): Promise<PaginatedResponse<MedicationOrder> | MedicationOrder[]> => {
    try {
        const response = await axiosInstance.get('/pharmacy/orders/', { params });
        // Handle both paginated and non-paginated responses
        if (response.data.results) {
            return response.data; // Paginated response
        }
        // If it's an array, wrap it in paginated format
        if (Array.isArray(response.data)) {
            return {
                count: response.data.length,
                next: null,
                previous: null,
                results: response.data
            };
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        throw error;
    }
};

export const getUserOrderDetail = async (id: number): Promise<any> => {
    try {
        const response = await axiosInstance.get(`/pharmacy/orders/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch order detail:', error);
        throw error;
    }
};

export const confirmPickup = async (orderId: number): Promise<any> => {
    try {
        const response = await axiosInstance.post(`/pharmacy/orders/${orderId}/confirm_pickup/`);
        return response.data;
    } catch (error) {
        console.error('Failed to confirm pickup:', error);
        throw error;
    }
};

