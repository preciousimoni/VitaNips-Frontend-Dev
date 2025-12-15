// src/api/admin.ts
import axiosInstance from './axiosInstance';

export interface AdminStats {
  users: {
    total: number;
    active: number;
    new_this_month: number;
    inactive: number;
  };
  doctors: {
    total: number;
    verified: number;
    pending_verification: number;
  };
  pharmacies: {
    total: number;
    active: number;
    inactive: number;
  };
  appointments: {
    total: number;
    this_month: number;
    today: number;
  };
  orders: {
    total: number;
    pending: number;
  };
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_pharmacy_staff: boolean;
  is_doctor: boolean;
  doctor_id: number | null;
  created_at: string;
}

export interface AdminDoctor {
  id: number;
  user: {
    id: number;
    email: string;
    username: string;
  };
  first_name: string;
  last_name: string;
  gender: string;
  years_of_experience: number;
  is_verified: boolean;
  education: string;
  bio: string;
  consultation_fee: string;
  specialties: Array<{ id: number; name: string }>;
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
}

export interface AdminPharmacy {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  operating_hours: string;
  is_24_hours: boolean;
  offers_delivery: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AdminAnalytics {
  user_growth: Array<{ month: string; count: number }>;
  appointments_by_status: Array<{ status: string; count: number }>;
  top_specialties: Array<{ specialties__name: string; count: number }>;
}

// Get admin dashboard stats
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await axiosInstance.get('/admin/stats/');
  return response.data;
};

// Get all users with filters
export const getAdminUsers = async (filters?: {
  role?: 'admin' | 'doctor' | 'pharmacy' | 'patient';
  is_active?: boolean;
  search?: string;
}): Promise<{ count: number; results: AdminUser[] }> => {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
  if (filters?.search) params.append('search', filters.search);
  
  const response = await axiosInstance.get(`/admin/users/?${params.toString()}`);
  return response.data;
};

// Get specific user
export const getAdminUser = async (userId: number): Promise<AdminUser> => {
  const response = await axiosInstance.get(`/admin/users/${userId}/`);
  return response.data;
};

// Update user (activate/deactivate, change roles)
export const updateAdminUser = async (
  userId: number,
  data: {
    is_active?: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
    is_pharmacy_staff?: boolean;
  }
): Promise<AdminUser> => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/`, data);
  return response.data;
};

// Get all doctors with filters
export const getAdminDoctors = async (filters?: {
  verified?: boolean;
  search?: string;
}): Promise<{ count: number; results: AdminDoctor[] }> => {
  const params = new URLSearchParams();
  if (filters?.verified !== undefined) params.append('verified', filters.verified.toString());
  if (filters?.search) params.append('search', filters.search);
  
  const response = await axiosInstance.get(`/admin/doctors/?${params.toString()}`);
  return response.data;
};

// Review doctor application (new comprehensive workflow)
export interface ReviewDoctorPayload {
  action: 'approve' | 'reject' | 'request_revision' | 'start_review' | 'contact_hospital';
  review_notes?: string;
  rejection_reason?: string;
  contact_hospital?: boolean;
}

export const reviewDoctorApplication = async (
  doctorId: number,
  payload: ReviewDoctorPayload
): Promise<{ message: string; doctor: AdminDoctor; hospital_info?: any }> => {
  const response = await axiosInstance.patch(`/admin/doctors/${doctorId}/verify/`, payload);
  return response.data;
};

// Legacy verify function (for backward compatibility)
export const verifyDoctor = async (
  doctorId: number,
  isVerified: boolean
): Promise<{ message: string; doctor: AdminDoctor }> => {
  return reviewDoctorApplication(doctorId, {
    action: isVerified ? 'approve' : 'reject',
    rejection_reason: isVerified ? undefined : 'Application rejected',
  });
};

// Get all pharmacies with filters
export const getAdminPharmacies = async (filters?: {
  is_active?: boolean;
  search?: string;
}): Promise<{ count: number; results: AdminPharmacy[] }> => {
  const params = new URLSearchParams();
  if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
  if (filters?.search) params.append('search', filters.search);
  
  const response = await axiosInstance.get(`/admin/pharmacies/?${params.toString()}`);
  return response.data;
};



// Create new pharmacy
export const createAdminPharmacy = async (data: Partial<AdminPharmacy>): Promise<AdminPharmacy> => {
  const response = await axiosInstance.post('/admin/pharmacies/create/', data);
  return response.data;
};

// Create new user
export const createAdminUser = async (data: any): Promise<AdminUser> => {
  const response = await axiosInstance.post('/admin/users/create/', data);
  return response.data;
};

// Update pharmacy status
export const updateAdminPharmacy = async (
  pharmacyId: number,
  data: { is_active?: boolean }
): Promise<AdminPharmacy> => {
  const response = await axiosInstance.patch(`/admin/pharmacies/${pharmacyId}/`, data);
  return response.data;
};

// Get analytics data
export const getAdminAnalytics = async (): Promise<AdminAnalytics> => {
  const response = await axiosInstance.get('/admin/analytics/');
  return response.data;
};

// Get all appointments (admin only)
export const getAdminAppointments = async (filters?: {
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}): Promise<{ count: number; next: string | null; previous: string | null; results: any[] }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.page_size) params.append('page_size', filters.page_size.toString());
  
  const response = await axiosInstance.get(`/admin/appointments/?${params.toString()}`);
  return response.data;
};

// Get specific appointment details (admin only)
export const getAdminAppointmentDetails = async (id: number): Promise<any> => {
  const response = await axiosInstance.get(`/admin/appointments/${id}/`);
  return response.data;
};

// Get recent admin activities
export interface AdminActivity {
  id: string;
  type: string;
  action: string;
  description: string;
  target_name: string;
  actor_name: string;
  timestamp: string;
  icon: string;
  color: string;
}

export const getAdminRecentActivity = async (): Promise<{ activities: AdminActivity[] }> => {
  const response = await axiosInstance.get('/admin/activity/');
  return response.data;
};
