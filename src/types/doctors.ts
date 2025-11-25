// src/types/doctors.ts
export interface Specialty {
    id: number;
    name: string;
    description: string | null;
}

export interface Doctor {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    specialties: Specialty[];
    profile_picture: string | null;
    gender: 'M' | 'F';
    years_of_experience: number;
    education: string;
    bio: string;
    languages_spoken: string;
    consultation_fee: string | null;
    is_available_for_virtual: boolean;
    is_verified: boolean;
    average_rating: number;
    application_status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
    license_number?: string;
    license_issuing_authority?: string;
    license_expiry_date?: string;
    hospital_name?: string;
    hospital_address?: string;
    hospital_phone?: string;
    hospital_email?: string;
    hospital_contact_person?: string;
    submitted_at?: string;
    reviewed_at?: string;
    reviewed_by?: number;
    reviewed_by_name?: string;
    review_notes?: string;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface DoctorReview {
    id: number;
    doctor: number;
    user: number;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at: string;
}

export interface DoctorAvailability {
    id: number;
    doctor: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
}

export interface DoctorListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Doctor[];
}