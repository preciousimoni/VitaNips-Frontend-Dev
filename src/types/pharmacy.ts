// src/types/pharmacy.ts
export interface Pharmacy {
    id: number;
    name: string;
    address: string;
    phone_number: string;
    email: string | null;
    latitude: number | null;
    longitude: number | null;
    operating_hours: string;
    is_24_hours: boolean;
    offers_delivery: boolean;
    created_at: string;
    updated_at: string;
}

export interface Medication {
    id: number;
    name: string;
    generic_name: string | null;
    description: string;
    dosage_form: string;
    strength: string;
    manufacturer: string | null;
    requires_prescription: boolean;
    side_effects: string | null;
    contraindications: string | null;
    storage_instructions: string | null;
    created_at: string;
    updated_at: string;
}

export interface MedicationOrderItem {
    id: number;
    order: number;
    prescription_item: number | null;
    medication?: Medication | null;
    medication_name: string;
    dosage: string;
    quantity: number;
    price_per_unit: string | null;
    total_price: string | null;
}

import { UserInsurance } from './insurance';

export interface MedicationOrder {
    id: number;
    user: number;
    pharmacy: number;
    prescription: number | null;
    status: 'pending' | 'processing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
    is_delivery: boolean;
    delivery_address: string | null;
    total_amount: string | null;
    order_date: string;
    pickup_or_delivery_date: string | null;
    notes: string | null;
    items: MedicationOrderItem[];
    user_insurance?: UserInsurance | null;
    user_insurance_id?: number | null;
    insurance_covered_amount?: string | null;
    patient_copay?: string | null;
    insurance_claim_generated?: boolean;
}

export interface MedicationOrderUpdatePayload {
  status?: 'pending' | 'processing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  notes?: string | null;
  pickup_or_delivery_date?: string | null;
  total_amount?: string | null;
}

export interface PharmacyInventory {
  id: number;
  pharmacy: number;
  medication: Medication;
  in_stock: boolean;
  quantity: number;
  price: string;
  last_updated: string;
}

export interface PharmacyInventoryCreatePayload {
  medication_id: number;
  in_stock: boolean;
  quantity: number;
  price: string;
}

export interface PharmacyInventoryUpdatePayload {
  in_stock?: boolean;
  quantity?: number;
  price?: string;
}