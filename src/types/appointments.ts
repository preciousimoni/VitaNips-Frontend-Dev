// src/types/appointments.ts
import { UserInsurance } from './insurance';

export interface Appointment {
    id: number;
    user: number;
    doctor: number | string;
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
    specialty?: string;
    user_insurance?: UserInsurance | null;
    user_insurance_id?: number | null;
    consultation_fee?: string | null;
    insurance_covered_amount?: string | null;
    patient_copay?: string | null;
    insurance_claim_generated?: boolean;
    is_followup?: boolean;
    original_appointment?: number | null;
    original_appointment_id?: number | null;
    followup_discount_percentage?: string;
    linked_test_request?: {
        id: number;
        test_name: string;
        test_description?: string;
        instructions?: string;
        status: string;
        has_test_results: boolean;
        test_results_count: number;
    } | null;
    test_results?: Array<{
        id: number;
        file_url: string;
        filename: string;
        description?: string;
        document_type?: string;
        uploaded_at: string;
    }> | null;
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
    original_appointment_id?: number | null; // For follow-up appointments
    test_request_id?: number | null; // For linking test request to follow-up appointment
}

export interface TwilioTokenResponse {
    token: string;
    roomName: string;
    identity: string;
}