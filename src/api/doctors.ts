// src/api/doctors.ts
import axiosInstance from './axiosInstance';
import { Doctor, DoctorReview, DoctorAvailability } from '../types/doctors';
import { PaginatedResponse } from '../types/common';

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
