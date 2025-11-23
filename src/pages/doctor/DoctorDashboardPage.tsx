// src/pages/doctor/DoctorDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon, 
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { getDoctorEligibleAppointments } from '../../api/doctorPortal';
import { getUserAppointments } from '../../api/appointments';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment } from '../../types/appointments';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatTime } from '../../utils/date';

interface DashboardStats {
  pendingPrescriptions: number;
  todayAppointments: number;
  upcomingAppointments: number;
  totalPatients: number;
  completedToday: number;
}

const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    pendingPrescriptions: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    totalPatients: 0,
    completedToday: 0
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch all data in parallel
      const [prescriptionsResponse, appointmentsResponse] = await Promise.all([
        getDoctorEligibleAppointments(),
        getUserAppointments({ ordering: '-date,-start_time' })
      ]);

      const allAppointments = appointmentsResponse.results || [];
      
      // Filter today's appointments
      const todayApts = allAppointments.filter(apt => 
        apt.date === today
      );
      
      // Filter upcoming appointments (next 7 days)
      const upcomingApts = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const todayDate = new Date(today);
        const diffTime = aptDate.getTime() - todayDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays > 0 && diffDays <= 7 && 
               (apt.status === 'scheduled' || apt.status === 'confirmed');
      });
      
      // Count completed today
      const completedToday = todayApts.filter(apt => apt.status === 'completed').length;
      
      // Count unique patients
      const uniquePatients = new Set(allAppointments.map(apt => apt.user)).size;

      setStats({
        pendingPrescriptions: prescriptionsResponse.results?.length || 0,
        todayAppointments: todayApts.length,
        upcomingAppointments: upcomingApts.length,
        totalPatients: uniquePatients,
        completedToday
      });
      
      setTodayAppointments(todayApts.slice(0, 5));
      setUpcomingAppointments(upcomingApts.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, Dr. {user?.last_name || user?.first_name || user?.username}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{stats.todayAppointments}</div>
                <div className="text-sm text-blue-100">Appointments Today</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/doctor/prescriptions"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-blue-500 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              </div>
              {stats.pendingPrescriptions > 0 && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {stats.pendingPrescriptions}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.pendingPrescriptions}
            </h3>
            <p className="text-gray-600 text-sm font-medium">Pending Prescriptions</p>
          </Link>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.todayAppointments}
            </h3>
            <p className="text-gray-600 text-sm font-medium">Today's Appointments</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalPatients}
            </h3>
            <p className="text-gray-600 text-sm font-medium">Total Patients</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.completedToday}
            </h3>
            <p className="text-gray-600 text-sm font-medium">Completed Today</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/doctor/prescriptions')}
              className="flex items-center space-x-4 p-5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 border border-blue-200 group"
            >
              <div className="bg-blue-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                <ClipboardDocumentListIcon className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-lg">Write Prescription</p>
                <p className="text-sm text-gray-600">Manage patient prescriptions</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/appointments')}
              className="flex items-center space-x-4 p-5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 border border-green-200 group"
            >
              <div className="bg-green-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                <CalendarIcon className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-lg">View Schedule</p>
                <p className="text-sm text-gray-600">Check all appointments</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-4 p-5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 border border-purple-200 group"
            >
              <div className="bg-purple-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                <UserGroupIcon className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-lg">My Profile</p>
                <p className="text-sm text-gray-600">Update information</p>
              </div>
            </button>
          </div>
        </div>

        {/* Today's Schedule & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <ClockIcon className="h-6 w-6 mr-2 text-green-600" />
                Today's Schedule
              </h2>
              <Link 
                to="/appointments" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                View All
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {todayAppointments.length === 0 ? (
              <EmptyState
                title="No appointments scheduled for today"
                icon={CalendarIcon}
              />
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => navigate(`/appointments/${apt.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-gray-50 hover:bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <ClockIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                          </p>
                          <p className="text-sm text-gray-600">{apt.patient_name || 'Patient'}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    {apt.reason && (
                      <p className="text-sm text-gray-600 ml-11">
                        {apt.reason.substring(0, 60)}{apt.reason.length > 60 ? '...' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <CalendarIcon className="h-6 w-6 mr-2 text-purple-600" />
                Upcoming (Next 7 Days)
              </h2>
              <Link 
                to="/appointments" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                View All
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {upcomingAppointments.length === 0 ? (
              <EmptyState
                title="No upcoming appointments"
                icon={CalendarIcon}
              />
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => navigate(`/appointments/${apt.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-gray-50 hover:bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <CalendarIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(apt.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })} at {formatTime(apt.start_time)}
                          </p>
                          <p className="text-sm text-gray-600">{apt.patient_name || 'Patient'}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    {apt.reason && (
                      <p className="text-sm text-gray-600 ml-11">
                        {apt.reason.substring(0, 60)}{apt.reason.length > 60 ? '...' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
