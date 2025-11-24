import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon, 
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  VideoCameraIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getDoctorEligibleAppointments } from '../../api/doctorPortal';
import { getUserAppointments } from '../../api/appointments';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment } from '../../types/appointments';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatTime } from '../../utils/date';
import { format } from 'date-fns';

interface DashboardStats {
  pendingPrescriptions: number;
  todayAppointments: number;
  upcomingAppointments: number;
  totalPatients: number;
  completedToday: number;
}

// Mock data for the chart - in a real app, this would come from an analytics endpoint
const activityData = [
  { name: 'Mon', patients: 4, prescriptions: 2 },
  { name: 'Tue', patients: 6, prescriptions: 5 },
  { name: 'Wed', patients: 8, prescriptions: 4 },
  { name: 'Thu', patients: 5, prescriptions: 3 },
  { name: 'Fri', patients: 9, prescriptions: 7 },
  { name: 'Sat', patients: 3, prescriptions: 1 },
  { name: 'Sun', patients: 2, prescriptions: 0 },
];

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
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'confirmed':
        return 'bg-primary-light/20 text-primary-dark border-primary-light/30';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentDate = new Date();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Branding Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <h1 className="text-xl font-bold text-gray-900 tracking-tight">
               Doctor<span className="text-primary">Portal</span>
             </h1>
             <span className="text-gray-300">|</span>
             <span className="text-sm text-gray-500 font-medium">
               {format(currentDate, 'EEEE, MMMM do, yyyy')}
             </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-primary transition-colors">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              DR
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Good {currentDate.getHours() < 12 ? 'Morning' : currentDate.getHours() < 18 ? 'Afternoon' : 'Evening'}, 
            <span className="text-primary ml-2">Dr. {user?.last_name || user?.first_name}</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Here's your daily overview. You have <span className="font-semibold text-gray-900">{stats.todayAppointments} appointments</span> today and <span className="font-semibold text-gray-900">{stats.pendingPrescriptions} prescriptions</span> pending review.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-700 shadow-sm">
            <ExclamationCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pending Prescriptions - Action Required */}
          <div 
            onClick={() => navigate('/doctor/prescriptions')}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 z-0 group-hover:bg-amber-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                  <ClipboardDocumentListIcon className="h-6 w-6" />
                </div>
                {stats.pendingPrescriptions > 0 && (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-500">Pending Prescriptions</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingPrescriptions}</h3>
            </div>
          </div>

          {/* Today's Appointments - Primary Stat */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg shadow-primary/30 p-6 text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 text-white/10">
              <CalendarIcon className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-blue-50">Today's Appointments</p>
              <h3 className="text-3xl font-bold mt-1">{stats.todayAppointments}</h3>
              <div className="mt-4 flex items-center text-sm text-blue-50">
                <span className="bg-white/20 px-2 py-1 rounded text-xs mr-2">
                  {stats.completedToday} Completed
                </span>
                <span>{stats.todayAppointments - stats.completedToday} Remaining</span>
              </div>
            </div>
          </div>

          {/* Total Patients */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +12% this month
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Patients</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPatients}</h3>
          </div>

          {/* Upcoming */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                <CalendarIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Next 7 Days</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.upcomingAppointments}</h3>
            <p className="text-xs text-gray-400 mt-2">Upcoming schedules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Chart & Today's Schedule */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Weekly Activity Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Weekly Overview</h3>
                <select className="text-sm border-gray-300 rounded-lg text-gray-500 focus:ring-primary focus:border-primary">
                  <option>This Week</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#32a852" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#32a852" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="patients" 
                      stroke="#32a852" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPatients)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Today's Appointments List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-primary" />
                  Today's Schedule
                </h3>
                <Link 
                  to="/appointments" 
                  className="text-sm font-medium text-primary hover:text-primary-dark hover:underline"
                >
                  View Calendar
                </Link>
              </div>

              {todayAppointments.length === 0 ? (
                 <EmptyState
                  title="No appointments today"
                  description="Enjoy your free time!"
                  icon={CalendarIcon}
                />
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((apt) => (
                    <div 
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all bg-white group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 text-gray-900">
                          <span className="text-xs font-medium uppercase text-gray-500">
                            {formatTime(apt.start_time).split(' ')[1]}
                          </span>
                          <span className="text-lg font-bold">
                            {formatTime(apt.start_time).split(' ')[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-gray-900">{apt.patient_name || 'Patient'}</h4>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <span className="truncate max-w-[200px]">{apt.reason || 'General Consultation'}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                        {apt.status === 'confirmed' && (
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               navigate(`/appointments/${apt.id}/call`);
                             }}
                             className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                             title="Start Video Call"
                           >
                             <VideoCameraIcon className="h-5 w-5" />
                           </button>
                        )}
                        <button 
                          onClick={() => navigate(`/appointments/${apt.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                          <ArrowRightIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions & Pending */}
          <div className="space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/doctor/prescriptions')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group border border-transparent hover:border-blue-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 group-hover:text-blue-700">
                      <ClipboardDocumentListIcon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-blue-700">Write Prescription</span>
                  </div>
                  <PlusIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                </button>

                <button
                  onClick={() => navigate('/appointments')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-primary/5 rounded-xl transition-colors group border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-primary group-hover:text-primary-dark">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-primary-dark">Manage Schedule</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                </button>

                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors group border border-transparent hover:border-purple-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600 group-hover:text-purple-700">
                      <UserGroupIcon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-purple-700">Doctor Profile</span>
                  </div>
                  <EllipsisHorizontalIcon className="h-4 w-4 text-gray-400 group-hover:text-purple-500" />
                </button>
              </div>
            </div>

            {/* Pending Prescriptions List (Mini) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Pending Prescriptions</h3>
                {stats.pendingPrescriptions > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                    {stats.pendingPrescriptions} New
                  </span>
                )}
              </div>
              
              {stats.pendingPrescriptions === 0 ? (
                 <div className="text-center py-8 text-gray-500 text-sm">
                   <CheckCircleIcon className="h-10 w-10 text-green-400 mx-auto mb-2 opacity-50" />
                   <p>All caught up!</p>
                 </div>
              ) : (
                <div className="space-y-3">
                   <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                     <p className="text-sm text-amber-800 font-medium mb-2">
                       You have pending prescriptions to review and sign.
                     </p>
                     <button 
                       onClick={() => navigate('/doctor/prescriptions')}
                       className="w-full py-2 bg-white text-amber-600 text-sm font-bold rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors shadow-sm"
                     >
                       Review Now
                     </button>
                   </div>
                </div>
              )}
            </div>

            {/* System Notifications (Mock) */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 text-white">
               <h3 className="text-lg font-bold mb-4 flex items-center">
                 <ExclamationCircleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                 System Updates
               </h3>
               <div className="space-y-4">
                 <div className="flex items-start space-x-3 text-sm opacity-90 border-b border-gray-700 pb-3">
                   <div className="h-2 w-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                   <p>Platform maintenance scheduled for Sunday, 2:00 AM EST.</p>
                 </div>
                 <div className="flex items-start space-x-3 text-sm opacity-90">
                   <div className="h-2 w-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                   <p>New telehealth features now available. Check your email for details.</p>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
