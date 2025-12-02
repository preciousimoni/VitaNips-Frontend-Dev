// src/router/index.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute } from '../utils/routing';
import MainLayout from '../components/layout/MainLayout';
import SmartDashboardRedirect from '../components/routing/SmartDashboardRedirect';
import ScrollToTop from '../components/routing/ScrollToTop';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import DoctorListPage from '../pages/DoctorListPage';
import DoctorDetailPage from '../pages/DoctorDetailPage';
import ProfilePage from '../features/users/pages/ProfilePage';
import NotificationSettingsPage from '../pages/NotificationSettingsPage';
import NotificationsPage from '../pages/NotificationsPage';
import PharmacyListPage from '../pages/PharmacyListPage';
import VaccinationsPage from '../pages/VaccinationsPage';
import UserInsurancePage from '../pages/UserInsurancePage';
import UserClaimsPage from '../pages/UserClaimsPage';
import EmergencyContactsPage from '../pages/EmergencyContactsPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import AppointmentDetailPage from '../pages/AppointmentDetailPage';
import PrescriptionsPage from '../pages/PrescriptionsPage';
import UserOrdersPage from '../pages/UserOrdersPage';
import UserOrderDetailPage from '../pages/UserOrderDetailPage';
import MedicalDocumentsPage from '../pages/MedicalDocumentsPage';
import MapLocatorPage from '../pages/MapLocatorPage';
import PharmacyDashboardPage from '../pages/pharmacy/PharmacyDashboardPage';
import PharmacyOrderListPage from '../pages/pharmacy/PharmacyOrderListPage';
import PharmacyOrderDetailPage from '../pages/pharmacy/PharmacyOrderDetailPage';
import PharmacyInventoryPage from '../pages/pharmacy/PharmacyInventoryPage';
import MedicationRemindersPage from '../pages/MedicationRemindersPage';
import VideoCallPage from '../pages/VideoCallPage';
import VitalsLogPage from '../pages/VitalsLogPage';
import FoodLogPage from '../pages/FoodLogPage';
import ExerciseLogPage from '../pages/ExerciseLogPage';
import SleepLogPage from '../pages/SleepLogPage';
import HealthLibraryPage from '../pages/HealthLibraryPage';
import HealthyEatingTipsPage from '../pages/articles/HealthyEatingTipsPage';
// import UnderstandingDiabetesPage from '../pages/articles/UnderstandingDiabetesPage';
import MentalWellnessResourcesPage from '../pages/MentalWellnessResourcesPage';
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardPage';
import DoctorPrescriptionWorkspacePage from '../pages/doctor/DoctorPrescriptionWorkspacePage';
import ManageAvailabilityPage from '../pages/doctor/ManageAvailabilityPage';
import DoctorApplicationPage from '../pages/doctor/DoctorApplicationPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminDoctorsPage from '../pages/admin/AdminDoctorsPage';
import AdminPharmaciesPage from '../pages/admin/AdminPharmaciesPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';
import AdminAppointmentsPage from '../pages/admin/AdminAppointmentsPage';
import EmergencyPage from '../pages/EmergencyPage';
import AlertSentPage from '../pages/AlertSentPage';
import CreateOrderPage from '../pages/CreateOrderPage';
import HealthDashboardPage from '../pages/HealthDashboardPage';
import HealthAnalyticsPage from '../pages/HealthAnalyticsPage';
import AboutPage from '../pages/AboutPage';
import HelpCenterPage from '../pages/HelpCenterPage';
import SubscriptionPage from '../pages/SubscriptionPage';
import PremiumFeaturesPage from '../pages/PremiumFeaturesPage';
import PremiumFeaturesHubPage from '../pages/PremiumFeaturesHubPage';
import FamilyDashboardPage from '../pages/FamilyDashboardPage';
import SharedRemindersPage from '../pages/SharedRemindersPage';
import HealthGoalsPage from '../pages/HealthGoalsPage';
import WaterLogPage from '../pages/WaterLogPage';
import CareerPage from '../pages/CareerPage';
import PaymentCallbackPage from '../pages/PaymentCallbackPage';
import toast from 'react-hot-toast';

const LoadingScreen: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <p className="text-xl text-gray-600">Loading...</p>
  </div>
);

const PublicRoute: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  // If authenticated user tries to access login/register, redirect to their appropriate dashboard
  if (isAuthenticated) {
    const dashboardRoute = getDashboardRoute(user);
    return <Navigate to={dashboardRoute} replace />;
  }
  
  return <Outlet />;
};

const ProtectedRoute: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Don't redirect pharmacy staff from order detail pages - they should be able to view orders
  // Only redirect if they're trying to access the main dashboard
  if (user?.is_pharmacy_staff && location.pathname === '/dashboard') {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

const PharmacyRoute: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log("PharmacyRoute Check:", { isAuthenticated, loading, isStaff: user?.is_pharmacy_staff, user });

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!user?.is_pharmacy_staff) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

const DoctorRoute: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading Doctor Portal...</p></div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Allow access to application page even without doctor profile
  const isApplicationPage = location.pathname === '/doctor/application';
  
  if (!user?.is_doctor && !isApplicationPage) {
      toast.error("Access Denied: Doctor credentials required.", { duration: 4000 });
      return <Navigate to="/" replace />;
  }
  return (
      <MainLayout> {/* Using MainLayout for now, can be changed */}
         <Outlet />
      </MainLayout>
   );
};

const AdminRoute: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading Admin Panel...</p></div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  if (!user?.is_staff && !user?.is_superuser) {
      toast.error("Access Denied: Admin credentials required.", { duration: 4000 });
      return <Navigate to="/" replace />;
  }
  return (
      <MainLayout>
         <Outlet />
      </MainLayout>
   );
};

const LandingPageRoute: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  // If authenticated, redirect to the appropriate dashboard
  if (isAuthenticated) {
    const dashboardRoute = getDashboardRoute(user);
    return <Navigate to={dashboardRoute} replace />;
  }

  // Otherwise show the landing page
  return <LandingPage />;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Landing page with authentication check */}
        <Route path="/" element={<LandingPageRoute />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/contact" element={<Navigate to="/help" replace />} />
        <Route path="/careers" element={<CareerPage />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />
        </Route>

        <Route element={<PharmacyRoute />}>
          <Route path="/portal/dashboard" element={<PharmacyDashboardPage />} />
          <Route path="/portal/orders" element={<PharmacyOrderListPage />} />
          <Route path="/portal/orders/:orderId" element={<PharmacyOrderDetailPage />} />
          <Route path="/portal/inventory" element={<PharmacyInventoryPage />} />
        </Route>

        <Route element={<DoctorRoute />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
          <Route path="/doctor/prescriptions" element={<DoctorPrescriptionWorkspacePage />} />
          <Route path="/doctor/availability" element={<ManageAvailabilityPage />} />
          <Route path="/doctor/application" element={<DoctorApplicationPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
          <Route path="/admin/pharmacies" element={<AdminPharmaciesPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={
            <SmartDashboardRedirect>
              <DashboardPage />
            </SmartDashboardRedirect>
          } />
          <Route path="/doctors" element={<DoctorListPage />} />
          <Route path="/doctors/:doctorId" element={<DoctorDetailPage />} />
          <Route path="/pharmacies" element={<PharmacyListPage />} />
          <Route path="/vaccinations" element={<VaccinationsPage />} />
          <Route path="/insurance" element={<UserInsurancePage />} />
          <Route path="/insurance/claims" element={<UserClaimsPage />} />
          <Route path="/emergency-contacts" element={<EmergencyContactsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/appointments/:appointmentId" element={<AppointmentDetailPage />} />
          <Route path="/appointments/:appointmentId/call" element={<VideoCallPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
          <Route path="/medical-documents" element={<MedicalDocumentsPage />} />
          
          {/* Subscriptions & Premium Features */}
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/premium-features" element={<PremiumFeaturesPage />} />
          <Route path="/premium-hub" element={<PremiumFeaturesHubPage />} />
          <Route path="/family/dashboard" element={<FamilyDashboardPage />} />
          <Route path="/family/reminders" element={<SharedRemindersPage />} />
          
          {/* Emergency */}
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/emergency/alert-sent" element={<AlertSentPage />} />

          {/* Pharmacy & Orders */}
          <Route path="/orders" element={<UserOrdersPage />} />
          <Route path="/orders/:orderId" element={<UserOrderDetailPage />} />
          <Route path="/prescriptions/:id/order" element={<CreateOrderPage />} />

          {/* Health & Analytics */}
          <Route path="/health/dashboard" element={<HealthDashboardPage />} />
          <Route path="/health/analytics" element={<HealthAnalyticsPage />} />
          <Route path="/health/goals" element={<HealthGoalsPage />} />
          <Route path="/health/water" element={<WaterLogPage />} />
          
          <Route path="/health/vitals" element={<VitalsLogPage />} />
          <Route path="/health/food" element={<FoodLogPage />} />
          <Route path="/health/exercise" element={<ExerciseLogPage />} />
          <Route path="/health/sleep" element={<SleepLogPage />} />
          <Route path="/medication-reminders" element={<MedicationRemindersPage />} />
          <Route path="/map-locator" element={<MapLocatorPage />} />
          <Route path="/health-library" element={<HealthLibraryPage />} />
          <Route path="/health-library/healthy-eating" element={<HealthyEatingTipsPage />} />
          {/* <Route path="/health-library/understanding-diabetes" element={<UnderstandingDiabetesPage />} /> */}
          <Route path="/mental-wellness" element={<MentalWellnessResourcesPage />} />
        </Route>

      </Routes>
    </Router>
  );
};

export default AppRouter;
