// src/api/video.ts
import axiosInstance from './axiosInstance';

export interface VideoTokenResponse {
    token: string;
    room_name: string;
    identity: string;
    session_status: string;
    appointment: {
        id: number;
        doctor_name: string;
        patient_name: string;
        date: string;
        time: string;
    };
}

export interface EndSessionResponse {
    message: string;
    session: {
        id: number;
        status: string;
        duration_minutes: number | null;
    };
}

export interface VirtualSession {
  id: number;
  appointment_id: number;
  room_name: string;
  room_sid: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  started_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  recording_url?: string;
  notes?: string;
  patient_name: string;
  doctor_name: string;
  appointment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface StartSessionResponse {
  session: VirtualSession;
  token: string;
  room_name: string;
  room_sid: string;
  participant_role: 'doctor' | 'patient';
}

export interface Recording {
  sid: string;
  status: string;
  duration: number;
  date_created: string;
  media_url: string;
  size: number;
}

export const generateVideoToken = async (appointmentId: number): Promise<VideoTokenResponse> => {
    try {
        const response = await axiosInstance.post<VideoTokenResponse>(
            `/doctors/appointments/${appointmentId}/video/token/`
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to generate video token for appointment ${appointmentId}:`, error);
        throw error;
    }
};

export const endVideoSession = async (appointmentId: number): Promise<EndSessionResponse> => {
    try {
        const response = await axiosInstance.post<EndSessionResponse>(
            `/doctors/appointments/${appointmentId}/video/end/`
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to end video session for appointment ${appointmentId}:`, error);
        throw error;
    }
};

// Enhanced API functions
export const startVirtualSession = async (appointmentId: number): Promise<StartSessionResponse> => {
    try {
        const response = await axiosInstance.post<StartSessionResponse>(
            `/doctors/appointments/${appointmentId}/start_virtual/`
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to start virtual session for appointment ${appointmentId}:`, error);
        throw error;
    }
};

export const getSessionRecordings = async (appointmentId: number): Promise<Recording[]> => {
    try {
        const response = await axiosInstance.get<{ recordings: Recording[] }>(
            `/doctors/appointments/${appointmentId}/recordings/`
        );
        return response.data.recordings;
    } catch (error) {
        console.error(`Failed to get recordings for appointment ${appointmentId}:`, error);
        throw error;
    }
};
