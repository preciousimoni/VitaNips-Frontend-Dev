// src/api/doctors.ts
import axiosInstance from './axiosInstance';
import { Doctor, DoctorReview, DoctorAvailability, Specialty } from '../types/doctors';
import { PaginatedResponse } from '../types/common';

// Get all specialties
export const getSpecialties = async (): Promise<Specialty[]> => {
  try {
    const response = await axiosInstance.get<Specialty[] | PaginatedResponse<Specialty>>('/doctors/specialties/');
    // Handle both array and paginated responses
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      return (response.data as PaginatedResponse<Specialty>).results;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch specialties:', error);
    throw error;
  }
};

interface GetDoctorsParams {
    search?: string;
    specialty?: number;
    page?: number;
}

export const getDoctors = async (
    paramsOrUrl: GetDoctorsParams | string | null = null
): Promise<PaginatedResponse<Doctor>> => {
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Doctor>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Doctor>>('/doctors/', { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch doctors:', error);
        throw error;
    }
};

export const getDoctorById = async (doctorId: number): Promise<Doctor> => {
    try {
        const response = await axiosInstance.get<Doctor>(`/doctors/${doctorId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch doctor ${doctorId}:`, error);
        throw error;
    }
};

export const getDoctorReviews = async (
    doctorId: number,
    paramsOrUrl: { page?: number } | string | null = null
): Promise<PaginatedResponse<DoctorReview>> => {
    try {
        const basePath = `/doctors/${doctorId}/reviews/`;
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<DoctorReview>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<DoctorReview>>(basePath, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch reviews for doctor ${doctorId}:`, error);
        throw error;
    }
};

export const getDoctorAvailability = async (
    doctorId: number,
    params: { page?: number } | null = null
): Promise<PaginatedResponse<DoctorAvailability>> => {
    try {
        const response = await axiosInstance.get<PaginatedResponse<DoctorAvailability>>(
            `/doctors/${doctorId}/availability/`,
            { params }
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch availability for doctor ${doctorId}:`, error);
        throw error;
    }
};

export interface PostReviewPayload {
    rating: number;
    comment?: string;
  }
  export const postDoctorReview = async (doctorId: number, payload: PostReviewPayload): Promise<DoctorReview> => {
      try {
          const response = await axiosInstance.post<DoctorReview>(`/doctors/${doctorId}/reviews/`, payload);
          return response.data;
      } catch (error) {
          console.error(`Failed to post review for doctor ${doctorId}:`, error);
          throw error;
      }
  };

// Doctor Portal - Manage own availability
export const getMyAvailability = async (): Promise<DoctorAvailability[]> => {
  const response = await axiosInstance.get<PaginatedResponse<DoctorAvailability> | DoctorAvailability[]>('/doctors/portal/availability/');
  // Handle both paginated and non-paginated responses
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
    return (response.data as PaginatedResponse<DoctorAvailability>).results;
  }
  return [];
};

export const createAvailabilitySlot = async (data: {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}): Promise<DoctorAvailability> => {
  const response = await axiosInstance.post<DoctorAvailability>('/doctors/portal/availability/', data);
  return response.data;
};

export const updateAvailabilitySlot = async (
  id: number,
  data: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }
): Promise<DoctorAvailability> => {
  const response = await axiosInstance.put<DoctorAvailability>(`/doctors/portal/availability/${id}/`, data);
  return response.data;
};

export const deleteAvailabilitySlot = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/doctors/portal/availability/${id}/`);
};

// Doctor Application
export interface DoctorApplicationPayload {
  first_name: string;
  last_name: string;
  specialty_ids: number[];
  gender: 'M' | 'F';
  years_of_experience: number;
  education: string;
  bio: string;
  languages_spoken: string;
  consultation_fee?: string;
  is_available_for_virtual: boolean;
  license_number: string;
  license_issuing_authority: string;
  license_expiry_date?: string;
  hospital_name: string;
  hospital_address: string;
  hospital_phone: string;
  hospital_email?: string;
  hospital_contact_person?: string;
  profile_picture?: File | string;
}

export interface DoctorApplication extends Doctor {
  application_status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
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
}

export const getMyApplication = async (): Promise<DoctorApplication> => {
  const response = await axiosInstance.get<DoctorApplication>('/doctors/portal/application/');
  return response.data;
};

export const submitDoctorApplication = async (payload: DoctorApplicationPayload): Promise<DoctorApplication> => {
  const formData = new FormData();
  
  // Add all fields to FormData
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'specialty_ids' && Array.isArray(value)) {
        value.forEach((id) => {
          formData.append(`specialty_ids`, id.toString());
        });
      } else if (key === 'profile_picture' && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  const response = await axiosInstance.post<DoctorApplication>('/doctors/portal/application/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateDoctorApplication = async (payload: Partial<DoctorApplicationPayload>): Promise<DoctorApplication> => {
  const formData = new FormData();
  
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'specialty_ids' && Array.isArray(value)) {
        value.forEach((id) => {
          formData.append(`specialty_ids`, id.toString());
        });
      } else if (key === 'profile_picture' && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  const response = await axiosInstance.patch<DoctorApplication>('/doctors/portal/application/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
