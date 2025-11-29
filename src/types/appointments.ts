// src/types/appointments.ts
import { UserInsurance } from './insurance';

export interface Appointment {
    id: number;
    user: number;
    doctor: number;
    date: string;
    start_time: string;
    end_time: string;
    appointment_type: 'in_person' | 'virtual';
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    reason: string;
    notes: string | null;
    followup_required: boolean;
    patient_name?: string;
    patient_email?: string;
    doctor_name?: string;
    user_insurance?: UserInsurance | null;
    user_insurance_id?: number | null;
    consultation_fee?: string | null;
    insurance_covered_amount?: string | null;
    patient_copay?: string | null;
    insurance_claim_generated?: boolean;
    created_at: string;
    updated_at: string;
}

export interface AppointmentPayload {
    doctor: number;
    date: string;
    start_time: string;
    end_time: string;
    appointment_type: 'in_person' | 'virtual';
    reason: string;
    notes?: string | null;
    user_insurance_id?: number | null;
    payment_reference?: string;
}

export interface TwilioTokenResponse {
    token: string;
    roomName: string;
    identity: string;
}