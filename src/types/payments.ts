// src/types/payments.ts
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
}

