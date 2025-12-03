import axiosInstance from './axiosInstance';
import { AuthTokens } from '../types/auth';
import { User } from '../types/user';

// Define types for Login and Register payloads locally if not shared
export interface LoginCredentials {
    email: string; // Using email as per User model
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    password2: string; 
}

export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
    try {
        const response = await axiosInstance.post<AuthTokens>('/auth/login/', credentials);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const register = async (userData: RegisterData): Promise<User> => {
    try {
        const response = await axiosInstance.post<User>('/auth/register/', userData);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await axiosInstance.post('/auth/logout/');
    } catch (error) {
        console.error('Logout failed:', error);
    }
};

export const refreshToken = async (refresh: string): Promise<AuthTokens> => {
    try {
        const response = await axiosInstance.post<AuthTokens>('/auth/token/refresh/', { refresh });
        return response.data;
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
    }
};

export const passwordReset = async (email: string): Promise<void> => {
    try {
        await axiosInstance.post('/auth/password/reset/', { email });
    } catch (error) {
        console.error('Password reset request failed:', error);
        throw error;
    }
};

// Re-export user profile functions for convenience or if AuthContext needs them directly
export { getUserProfile, updateUserProfile, uploadProfilePicture } from './user';

