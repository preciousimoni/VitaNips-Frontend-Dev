// src/router/index.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute } from '../utils/routing';
import MainLayout from '../components/layout/MainLayout';
import SmartDashboardRedirect from '../components/routing/SmartDashboardRedirect';
import ScrollToTop from '../components/routing/ScrollToTop';
import toast from 'react-hot-toast';

// Lazy load all pages for code-splitting
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const PasswordResetConfirmPage = lazy(() => import('../features/auth/pages/PasswordResetConfirmPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const DoctorListPage = lazy(() => import('../pages/DoctorListPage'));
const DoctorDetailPage = lazy(() => import('../pages/DoctorDetailPage'));
const ProfilePage = lazy(() => import('../features/users/pages/ProfilePage'));
const NotificationSettingsPage = lazy(() => import('../pages/NotificationSettingsPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const PharmacyListPage = lazy(() => import('../pages/PharmacyListPage'));
const VaccinationsPage = lazy(() => import('../pages/VaccinationsPage'));
const UserInsurancePage = lazy(() => import('../pages/UserInsurancePage'));
const UserClaimsPage = lazy(() => import('../pages/UserClaimsPage'));
const EmergencyContactsPage = lazy(() => import('../pages/EmergencyContactsPage'));
const AppointmentsPage = lazy(() => import('../pages/AppointmentsPage'));
const AppointmentDetailPage = lazy(() => import('../pages/AppointmentDetailPage'));
const PrescriptionsPage = lazy(() => import('../pages/PrescriptionsPage'));
const UserOrdersPage = lazy(() => import('../pages/UserOrdersPage'));
const UserOrderDetailPage = lazy(() => import('../pages/UserOrderDetailPage'));
const MedicalDocumentsPage = lazy(() => import('../pages/MedicalDocumentsPage'));
const TestRequestsPage = lazy(() => import('../pages/TestRequestsPage'));
const MapLocatorPage = lazy(() => import('../pages/MapLocatorPage'));
const PharmacyDashboardPage = lazy(() => import('../pages/pharmacy/PharmacyDashboardPage'));
const PharmacyOrderListPage = lazy(() => import('../pages/pharmacy/PharmacyOrderListPage'));
const PharmacyOrderDetailPage = lazy(() => import('../pages/pharmacy/PharmacyOrderDetailPage'));
const PharmacyInventoryPage = lazy(() => import('../pages/pharmacy/PharmacyInventoryPage'));
const PharmacyAnalyticsPage = lazy(() => import('../pages/pharmacy/PharmacyAnalyticsPage'));
const MedicationRemindersPage = lazy(() => import('../pages/MedicationRemindersPage'));
const VideoCallPage = lazy(() => import('../pages/VideoCallPage'));
const VitalsLogPage = lazy(() => import('../pages/VitalsLogPage'));
const FoodLogPage = lazy(() => import('../pages/FoodLogPage'));
const ExerciseLogPage = lazy(() => import('../pages/ExerciseLogPage'));
const SleepLogPage = lazy(() => import('../pages/SleepLogPage'));
const HealthLibraryPage = lazy(() => import('../pages/HealthLibraryPage'));
const HealthyEatingTipsPage = lazy(() => import('../pages/articles/HealthyEatingTipsPage'));
const MentalWellnessResourcesPage = lazy(() => import('../pages/MentalWellnessResourcesPage'));
const DoctorDashboardPage = lazy(() => import('../pages/doctor/DoctorDashboardPage'));
const DoctorPrescriptionWorkspacePage = lazy(() => import('../pages/doctor/DoctorPrescriptionWorkspacePage'));
const ManageAvailabilityPage = lazy(() => import('../pages/doctor/ManageAvailabilityPage'));
const DoctorApplicationPage = lazy(() => import('../pages/doctor/DoctorApplicationPage'));
const DoctorBankDetailsPage = lazy(() => import('../pages/doctor/DoctorBankDetailsPage'));
const DoctorTestRequestsPage = lazy(() => import('../pages/doctor/TestRequestsPage'));
const PharmacyBankDetailsPage = lazy(() => import('../pages/pharmacy/PharmacyBankDetailsPage'));
const PharmacySubscriptionPage = lazy(() => import('../pages/pharmacy/PharmacySubscriptionPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminDoctorsPage = lazy(() => import('../pages/admin/AdminDoctorsPage'));
const AdminPharmaciesPage = lazy(() => import('../pages/admin/AdminPharmaciesPage'));
const AdminAnalyticsPage = lazy(() => import('../pages/admin/AdminAnalyticsPage'));
const AdminAppointmentsPage = lazy(() => import('../pages/admin/AdminAppointmentsPage'));
const AdminAppointmentDetailPage = lazy(() => import('../pages/admin/AdminAppointmentDetailPage'));
const EmergencyPage = lazy(() => import('../pages/EmergencyPage'));
const AlertSentPage = lazy(() => import('../pages/AlertSentPage'));
const CreateOrderPage = lazy(() => import('../pages/CreateOrderPage'));
const HealthDashboardPage = lazy(() => import('../pages/HealthDashboardPage'));
const HealthAnalyticsPage = lazy(() => import('../pages/HealthAnalyticsPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const HelpCenterPage = lazy(() => import('../pages/HelpCenterPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const SubscriptionPage = lazy(() => import('../pages/SubscriptionPage'));
const PremiumFeaturesPage = lazy(() => import('../pages/PremiumFeaturesPage'));
const PremiumFeaturesHubPage = lazy(() => import('../pages/PremiumFeaturesHubPage'));
const FamilyDashboardPage = lazy(() => import('../pages/FamilyDashboardPage'));
const SharedRemindersPage = lazy(() => import('../pages/SharedRemindersPage'));
const HealthGoalsPage = lazy(() => import('../pages/HealthGoalsPage'));
const WaterLogPage = lazy(() => import('../pages/WaterLogPage'));
const CareerPage = lazy(() => import('../pages/CareerPage'));
const PaymentCallbackPage = lazy(() => import('../pages/PaymentCallbackPage'));
const PrivacyPolicy = lazy(() => import('../pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/legal/TermsOfService'));
const CookiePolicy = lazy(() => import('../pages/legal/CookiePolicy'));
const HIPAACompliance = lazy(() => import('../pages/legal/HIPAACompliance'));

const LoadingScreen: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-xl text-gray-600">Loading...</p>
    </div>
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Don't redirect pharmacy staff from order detail pages - they should be able to view orders
  // Only redirect if they're trying to access the main dashboard
  if (user?.is_pharmacy_staff && location.pathname === '/dashboard') {
    return <Navigate to="/pharmacy/dashboard" replace />;
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
    return <Navigate to="/login" state={{ from: location }} replace />;
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
    return <Navigate to="/login" state={{ from: location }} replace />;
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
  return <LandingPage />;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
        {/* Landing page with authentication check */}
        <Route path="/" element={<LandingPageRoute />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/careers" element={<CareerPage />} />
        
        {/* Legal Pages */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/hipaa" element={<HIPAACompliance />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/password-reset/confirm" element={<PasswordResetConfirmPage />} />
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />
        </Route>

        <Route element={<PharmacyRoute />}>
          <Route path="/pharmacy/dashboard" element={<PharmacyDashboardPage />} />
          <Route path="/pharmacy/orders" element={<PharmacyOrderListPage />} />
          <Route path="/pharmacy/orders/:orderId" element={<PharmacyOrderDetailPage />} />
          <Route path="/pharmacy/inventory" element={<PharmacyInventoryPage />} />
          <Route path="/pharmacy/bank-details" element={<PharmacyBankDetailsPage />} />
          <Route path="/pharmacy/subscription" element={<PharmacySubscriptionPage />} />
          <Route path="/pharmacy/analytics" element={<PharmacyAnalyticsPage />} />
        </Route>

        <Route element={<DoctorRoute />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
          <Route path="/doctor/prescriptions" element={<DoctorPrescriptionWorkspacePage />} />
          <Route path="/doctor/test-requests" element={<DoctorTestRequestsPage />} />
          <Route path="/doctor/availability" element={<ManageAvailabilityPage />} />
          <Route path="/doctor/application" element={<DoctorApplicationPage />} />
          <Route path="/doctor/bank-details" element={<DoctorBankDetailsPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
          <Route path="/admin/pharmacies" element={<AdminPharmaciesPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
          <Route path="/admin/appointments/:appointmentId" element={<AdminAppointmentDetailPage />} />
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
          <Route path="/test-requests" element={<TestRequestsPage />} />
          
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
      </Suspense>
    </Router>
  );
};

export default AppRouter;
