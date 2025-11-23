import { axiosInstance } from './axiosInstance';

interface CreateOrderPayload {
    pharmacy_id: number;
}

export const createOrderFromPrescription = async (
    prescriptionId: number,
    pharmacyId: number
): Promise<any> => {
    try {
        const response = await axiosInstance.post(
            `/pharmacy/prescriptions/${prescriptionId}/create_order/`,
            { pharmacy_id: pharmacyId }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to create order:', error);
        throw error;
    }
};

export const getUserOrders = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('/pharmacy/orders/');
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

