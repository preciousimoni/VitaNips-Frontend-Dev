// src/api/payments.ts
import axiosInstance from './axiosInstance';

export interface InitializePaymentRequest {
  amount: number;
  email?: string;
  payment_type: 'appointment' | 'medication_order';
  payment_for_id: number;
  callback_url?: string;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
  amount: string;
  public_key: string;
}

export interface VerifyPaymentRequest {
  reference: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  reference: string;
  amount: number;
  paid_at?: string;
  customer?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  metadata?: {
    user_id?: number;
    payment_type?: string;
    payment_for_id?: number;
  };
  message?: string;
}

/**
 * Initialize a payment transaction
 */
export const initializePayment = async (
  data: InitializePaymentRequest
): Promise<InitializePaymentResponse> => {
  const response = await axiosInstance.post<InitializePaymentResponse>(
    '/payments/initialize/',
    data
  );
  return response.data;
};

/**
 * Verify a payment transaction
 */
export const verifyPayment = async (
  reference: string
): Promise<VerifyPaymentResponse> => {
  const response = await axiosInstance.post<VerifyPaymentResponse>(
    '/payments/verify/',
    { reference }
  );
  return response.data;
};

