// src/types/appointments.ts
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
}

export interface TwilioTokenResponse {
    token: string;
    roomName: string;
    identity: string;
}