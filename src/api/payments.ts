// src/api/payments.ts
import axiosInstance from './axiosInstance';

export interface InitializePaymentRequest {
  amount: number;
  email?: string;
  payment_type: 'appointment' | 'medication_order' | 'virtual_session';
  payment_for_id: number;
  callback_url?: string;
}

export interface CommissionBreakdown {
  gross_amount: string;
  commission_rate: string;
  platform_commission: string;
  provider_net_amount: string;
  commission_percentage: number;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
  tx_ref?: string;
  amount: string;
  public_key: string;
  commission_breakdown?: CommissionBreakdown;
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

// ============ SUBSCRIPTION APIs ============

export interface SubscriptionPlan {
  id: number;
  name: string;
  tier: 'free' | 'premium' | 'family';
  description: string;
  monthly_price: string;
  annual_price: string | null;
  features: Record<string, any>;
  max_appointments_per_month: number | null;
  max_family_members: number;
  is_active: boolean;
}

export interface UserSubscription {
  id: number;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  billing_cycle: 'monthly' | 'annual';
  started_at: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  auto_renew: boolean;
  is_active: boolean;
  price: string;
}

export interface SubscriptionStatus {
  has_premium: boolean;
  plan: 'free' | 'premium' | 'family';
  plan_name?: string;
  expires_at?: string;
  remaining_free_appointments?: number;
  total_appointments?: number;
  free_limit?: number;
}

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await axiosInstance.get<SubscriptionPlan[] | { results: SubscriptionPlan[] }>(
    '/payments/subscriptions/plans/'
  );
  // Handle both array response and paginated response
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // If paginated response (has 'results' field)
  if (response.data && typeof response.data === 'object' && 'results' in response.data) {
    return (response.data as { results: SubscriptionPlan[] }).results;
  }
  // Fallback: return empty array
  console.warn('Unexpected subscription plans response format:', response.data);
  return [];
};

/**
 * Get current user's subscription
 */
export const getCurrentSubscription = async (): Promise<UserSubscription | null> => {
  try {
    const response = await axiosInstance.get<UserSubscription>(
      '/payments/subscriptions/current/'
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Subscribe to a plan
 */
export const subscribeToPlan = async (
  planId: number,
  billingCycle: 'monthly' | 'annual' = 'monthly'
): Promise<{
  subscription_id: number;
  plan: string;
  billing_cycle: string;
  amount: string;
  payment_url: string;
  reference: string;
}> => {
  const response = await axiosInstance.post(
    '/payments/subscriptions/subscribe/',
    {
      plan_id: planId,
      billing_cycle: billingCycle
    }
  );
  return response.data;
};

/**
 * Cancel current subscription
 */
export const cancelSubscription = async (): Promise<{
  message: string;
  subscription_end_date: string;
}> => {
  const response = await axiosInstance.post(
    '/payments/subscriptions/cancel/'
  );
  return response.data;
};

/**
 * Check subscription status
 */
export const checkSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  const response = await axiosInstance.get<SubscriptionStatus>(
    '/payments/subscriptions/status/'
  );
  return response.data;
};

// ============ PREMIUM FEATURES APIs ============

export interface PremiumFeature {
  name: string;
  description: string;
  price: string;
  type: 'one_time' | 'recurring';
  is_free: boolean;
}

export interface PremiumFeaturesList {
  features: Record<string, PremiumFeature>;
  user_subscription_tier: string;
  has_premium: boolean;
}

/**
 * Get all premium features
 */
export const getPremiumFeatures = async (): Promise<PremiumFeaturesList> => {
  const response = await axiosInstance.get<PremiumFeaturesList>(
    '/payments/premium-features/'
  );
  return response.data;
};

/**
 * Purchase a premium feature
 */
export const purchasePremiumFeature = async (
  featureKey: string,
  relatedObjectId?: number
): Promise<{
  feature: string;
  amount: string;
  payment_url: string;
  reference: string;
}> => {
  const response = await axiosInstance.post(
    '/payments/premium-features/purchase/',
    {
      feature_key: featureKey,
      related_object_id: relatedObjectId
    }
  );
  return response.data;
};

/**
 * Subscribe to Premium SOS
 */
export const subscribePremiumSOS = async (): Promise<{
  message: string;
  amount: string;
  payment_url: string;
  reference: string;
}> => {
  const response = await axiosInstance.post(
    '/payments/premium-features/sos/',
    { action: 'subscribe' }
  );
  return response.data;
};

/**
 * Cancel Premium SOS subscription
 */
export const cancelPremiumSOS = async (): Promise<{
  message: string;
}> => {
  const response = await axiosInstance.post(
    '/payments/premium-features/sos/',
    { action: 'cancel' }
  );
  return response.data;
};


// ============ PHARMACY SUBSCRIPTION APIs ============

export interface PharmacySubscriptionRecord {
  id: number;
  plan: {
    id: number;
    name: string;
    tier: string;
    description: string;
    annual_price: string;
  };
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
  is_active: boolean;
}

/**
 * Get pharmacy subscription
 */
export const getPharmacySubscription = async (): Promise<PharmacySubscriptionRecord | null> => {
  try {
    const response = await axiosInstance.get<PharmacySubscriptionRecord>(
      '/payments/subscriptions/pharmacy/'
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404 || (error.response?.data?.status === 'inactive')) {
      return null;
    }
    throw error;
  }
};

/**
 * Renew pharmacy subscription
 */
export interface RenewPharmacySubscriptionResponse {
  subscription_id: number;
  plan: string;
  amount: string;
  payment_url: string;
  reference: string;
}

/**
 * Renew pharmacy subscription
 */
export const renewPharmacySubscription = async (planId: number): Promise<RenewPharmacySubscriptionResponse> => {
  const response = await axiosInstance.post<RenewPharmacySubscriptionResponse>(
    '/payments/subscriptions/pharmacy/',
    { plan_id: planId }
  );
  return response.data;
};
