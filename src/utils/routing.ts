// src/utils/routing.ts
import { User } from '../types/user';

/**
 * Determines the appropriate dashboard route based on user role
 * Priority: Admin > Doctor > Pharmacy > Patient
 * 
 * Note: This function should be called after checking for doctor applications,
 * as users who registered as doctors but haven't submitted applications
 * should be redirected to /doctor/application instead.
 */
export const getDashboardRoute = (user: User | null): string => {
  if (!user) {
    return '/dashboard';
  }

  // Admin users get admin dashboard
  if (user.is_staff || user.is_superuser) {
    return '/admin/dashboard';
  }

  // Doctors get doctor dashboard
  // Check for is_doctor flag or doctor profile existence
  if (user.is_doctor || user.doctor_id) {
    return '/doctor/dashboard';
  }

  // Pharmacy staff get pharmacy dashboard
  if (user.is_pharmacy_staff && user.works_at_pharmacy) {
    return '/pharmacy/dashboard';
  }

  // Default to patient dashboard
  return '/dashboard';
};
