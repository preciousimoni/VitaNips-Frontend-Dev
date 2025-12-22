import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon, 
  UserGroupIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  VideoCameraIcon,
  SparklesIcon,
  ChartBarIcon,
  BellAlertIcon,
  BanknotesIcon,
  BeakerIcon
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
import { getMyApplication } from '../../api/doctors';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment } from '../../types/appointments';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatTime } from '../../utils/date';
import { format } from 'date-fns';
// import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
  pendingPrescriptions: number;
  todayAppointments: number;
  upcomingAppointments: number;
  totalPatients: number;
  completedToday: number;
}

// Generate weekly activity data from appointments
const generateActivityData = (appointments: Appointment[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  
  const data = days.map((day, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayAppointments = appointments.filter(apt => apt.date === dateStr);
    const patients = new Set(dayAppointments.map(apt => 
      typeof apt.user === 'object' && apt.user !== null ? (apt.user as any).id : apt.user
    )).size;
    
    return {
      name: day,
      patients,
      prescriptions: 0 // Would need prescription data to calculate this
    };
  });
  
  return data;
};

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
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    checkApplicationStatus();
  }, []);

  const checkApplicationStatus = async () => {
    try {
      const application = await getMyApplication();
      setApplicationStatus(application.application_status || null);
    } catch (error) {
      // If 404, no application exists yet
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 404) {
          setApplicationStatus(null);
        }
      }
    }
  };

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

      const appointments = appointmentsResponse.results || [];
      
      // Filter eligible appointments to only count those WITHOUT existing prescriptions
      const eligibleAppointments = prescriptionsResponse.results || [];
      const pendingPrescriptionsCount = eligibleAppointments.filter(
        (apt: any) => !apt.has_existing_prescription
      ).length;
      
      // Filter today's appointments
      const todayApts = appointments.filter(apt => 
        apt.date === today
      );
      
      // Filter upcoming appointments (next 7 days)
      const upcomingApts = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const todayDate = new Date(today);
        const diffTime = aptDate.getTime() - todayDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays > 0 && diffDays <= 7 && 
               (apt.status === 'scheduled' || apt.status === 'confirmed');
      });
      
      // Count completed today
      const completedToday = todayApts.filter(apt => apt.status === 'completed').length;
      
      // Count unique patients (handle both user ID and user object)
      const uniquePatients = new Set(
        appointments.map(apt => {
          if (typeof apt.user === 'object' && apt.user !== null) {
            return (apt.user as any).id || apt.user;
          }
          return apt.user;
        })
      ).size;

      setStats({
        pendingPrescriptions: pendingPrescriptionsCount,
        todayAppointments: todayApts.length,
        upcomingAppointments: upcomingApts.length,
        totalPatients: uniquePatients,
        completedToday
      });
      
      setTodayAppointments(todayApts.slice(0, 5));
      setAllAppointments(appointments);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Hero Header Section */}
      <div className="relative bg-primary-900 border-b-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] rounded-b-[3rem] overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 mb-4"
              >
                <span className="px-4 py-1.5 rounded-xl bg-yellow-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-wider text-black">
                  <SparklesIcon className="h-4 w-4 inline mr-2" />
                  Doctor Portal
                </span>
                <span className="text-sm text-cream-50/80 font-bold tracking-widest uppercase">{format(currentDate, 'EEEE, MMMM do, yyyy')}</span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white font-display tracking-tight leading-tight">
                Good {currentDate.getHours() < 12 ? 'Morning' : currentDate.getHours() < 18 ? 'Afternoon' : 'Evening'},{' '}
                <span className="text-yellow-400">Dr. {user?.last_name || user?.first_name}</span>
              </h1>
              <p className="text-lg md:text-xl text-cream-50/90 max-w-2xl font-medium leading-relaxed">
                Here's your daily overview. You have{' '}
                <span className="inline-block px-2 py-0.5 bg-white text-black font-black border-2 border-black rounded-lg transform -rotate-2 mx-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{stats.todayAppointments} appointments</span>{' '}
                today and{' '}
                <span className="inline-block px-2 py-0.5 bg-white text-black font-black border-2 border-black rounded-lg transform rotate-2 mx-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{stats.pendingPrescriptions} prescriptions</span>{' '}
                pending review.
              </p>
            </motion.div>
            
            {/* Notification Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button className="relative group">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <BellAlertIcon className="h-8 w-8 text-black" />
                  {stats.pendingPrescriptions > 0 && (
                    <span className="absolute -top-2 -right-2 flex items-center justify-center h-8 w-8 rounded-full bg-red-500 border-2 border-black text-white text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {stats.pendingPrescriptions > 9 ? '9+' : stats.pendingPrescriptions}
                    </span>
                  )}
                </motion.div>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-red-100 border-4 border-black rounded-[2rem] p-6 flex items-center text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <ExclamationCircleIcon className="h-8 w-8 mr-4 flex-shrink-0 text-red-600" />
            <p className="font-bold text-lg">{error}</p>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Pending Prescriptions - Action Required */}
          <motion.div 
            onClick={() => navigate('/doctor/prescriptions')}
            whileHover={{ y: -5 }}
            className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 cursor-pointer group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-400 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-black" />
                </div>
                {stats.pendingPrescriptions > 0 && (
                  <span className="flex h-4 w-4 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-black"></span>
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Pending Rx</p>
              <h3 className="text-4xl font-black text-black mt-1 font-display">{stats.pendingPrescriptions}</h3>
            </div>
          </motion.div>

          {/* Today's Appointments - Primary Stat */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-primary-900 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 text-white relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <CalendarIcon className="h-32 w-32 text-white transform group-hover:rotate-12 transition-transform duration-500" />
             </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <ClockIcon className="h-6 w-6 text-black" />
                </div>
              </div>
              <p className="text-sm font-bold text-cream-50/80 uppercase tracking-wider">Today's Appts</p>
              <h3 className="text-4xl font-black mt-1 font-display">{stats.todayAppointments}</h3>
              <div className="mt-4 inline-flex items-center gap-2 bg-black/20 rounded-lg px-3 py-1 border border-white/20">
                <span className="text-xs font-bold text-yellow-400">
                  {stats.completedToday} Done
                </span>
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span className="text-xs font-medium text-white">{stats.todayAppointments - stats.completedToday} Left</span>
              </div>
            </div>
          </motion.div>

          {/* Total Patients */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-blue-100 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-rotate-12 transition-transform">
                  <UserGroupIcon className="h-6 w-6 text-black" />
                </div>
              </div>
              <p className="text-sm font-bold text-blue-900/70 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-4xl font-black text-blue-900 mt-1 font-display">{stats.totalPatients}</h3>
            </div>
          </motion.div>

          {/* Upcoming */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => navigate('/appointments')}
            className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 cursor-pointer group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-300 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                  <CalendarIcon className="h-6 w-6 text-black" />
                </div>
              </div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Next 7 Days</p>
              <h3 className="text-4xl font-black text-black mt-1 font-display">{stats.upcomingAppointments}</h3>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Chart & Today's Schedule */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Weekly Activity Chart */}
            <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <ChartBarIcon className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-black font-display">Weekly Overview</h3>
                    <p className="text-sm font-bold text-gray-500">Patient activity and prescriptions</p>
                  </div>
                </div>
                <select className="text-sm font-bold border-2 border-black rounded-xl px-4 py-2 bg-cream-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-0 focus:border-black cursor-pointer hover:bg-yellow-100 transition-colors">
                  <option>This Week</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateActivityData(allAppointments)}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1b4332" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1b4332" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#000', fontSize: 12, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#000', fontSize: 12, fontWeight: 700}} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '2px solid black', 
                        boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                        backgroundColor: '#fff',
                        padding: '12px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="patients" 
                      stroke="#1b4332" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorPatients)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Today's Appointments List */}
            <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <ClockIcon className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-black font-display">Today's Schedule</h3>
                    <p className="text-sm font-bold text-gray-500">{todayAppointments.length} appointments scheduled</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/appointments')}
                  className="px-4 py-2 bg-cream-50 border-2 border-black rounded-xl font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                >
                  View All
                  <ArrowRightIcon className="h-4 w-4" />
                </motion.button>
              </div>

              {todayAppointments.length === 0 ? (
                 <EmptyState
                  title="No appointments today"
                  description="Enjoy your free time!"
                  icon={CalendarIcon}
                />
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((apt, index) => (
                    <motion.div 
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 border-black bg-cream-50 hover:bg-yellow-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                          <span className="text-[10px] font-black uppercase text-gray-500">
                            {formatTime(apt.start_time).split(' ')[1]}
                          </span>
                          <span className="text-lg font-black text-primary-900">
                            {formatTime(apt.start_time).split(' ')[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-black group-hover:text-primary-900 transition-colors">{apt.patient_name || 'Patient'}</h4>
                          <p className="text-sm text-gray-600 font-bold flex items-center mt-1">
                            <span className="truncate max-w-[200px]">{apt.reason || 'General Consultation'}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3 pt-2 sm:pt-0 border-t-2 sm:border-t-0 border-black/10">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white capitalize`}>
                          {apt.status}
                        </span>
                        <div className="flex items-center space-x-2">
                          {apt.status === 'confirmed' && (
                             <motion.button 
                               whileHover={{ scale: 1.1, rotate: -5 }}
                               whileTap={{ scale: 0.9 }}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 navigate(`/appointments/${apt.id}/call`);
                               }}
                               className="p-2 bg-green-500 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                               title="Start Video Call"
                             >
                               <VideoCameraIcon className="h-5 w-5" />
                             </motion.button>
                          )}
                          <motion.button 
                            whileHover={{ scale: 1.1, x: 3 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/appointments/${apt.id}`)}
                            className="p-2 bg-white text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 transition-all"
                          >
                            <ArrowRightIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions & Pending */}
          <div className="space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2 bg-purple-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <SparklesIcon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-2xl font-black text-black font-display">Quick Actions</h3>
              </div>
              <div className="space-y-4">
                {/* Application Status Banner */}
                {(!applicationStatus || applicationStatus === 'draft' || applicationStatus === 'needs_revision' || applicationStatus === 'rejected') && (
                  <div className={`p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 ${
                    !applicationStatus || applicationStatus === 'draft'
                      ? 'bg-yellow-100'
                      : applicationStatus === 'needs_revision'
                      ? 'bg-orange-100'
                      : 'bg-red-100'
                  }`}>
                    <div className="flex items-start gap-4">
                      <ExclamationCircleIcon className="h-6 w-6 flex-shrink-0 mt-1 text-black" />
                      <div className="flex-1">
                        <p className="text-base font-black text-black mb-1">
                          {!applicationStatus || applicationStatus === 'draft'
                            ? 'Complete Your Doctor Application'
                            : applicationStatus === 'needs_revision'
                            ? 'Application Needs Revision'
                            : 'Application Rejected'}
                        </p>
                        <p className="text-sm text-black/80 font-bold mb-3 leading-tight">
                          {!applicationStatus || applicationStatus === 'draft'
                            ? 'Submit your credentials to start accepting appointments'
                            : applicationStatus === 'needs_revision'
                            ? 'Please review admin feedback and update your application'
                            : 'Your application was rejected. Please review and resubmit'}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/doctor/application')}
                          className={`text-xs font-black px-4 py-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                            !applicationStatus || applicationStatus === 'draft'
                              ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                              : applicationStatus === 'needs_revision'
                              ? 'bg-orange-400 text-black hover:bg-orange-500'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {!applicationStatus || applicationStatus === 'draft' ? 'Submit Application' : 'Update Application'}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Status - Pending/Under Review */}
                {(applicationStatus === 'submitted' || applicationStatus === 'under_review') && (
                  <div className="p-5 bg-blue-100 border-4 border-black rounded-2xl mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-6 w-6 text-black flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-base font-black text-black mb-1">Application Under Review</p>
                        <p className="text-sm font-bold text-black/80">Your application is being reviewed by our admin team. You'll be notified once a decision is made.</p>
                      </div>
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/doctor/prescriptions')}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-blue-50 rounded-2xl transition-all group border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-200 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-black" />
                    </div>
                    <span className="font-black text-black group-hover:text-blue-900 text-lg">Prescriptions</span>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-black" />
                </motion.button>

                <motion.button
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/doctor/availability')}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-purple-50 rounded-2xl transition-all group border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-200 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <ClockIcon className="h-6 w-6 text-black" />
                    </div>
                    <span className="font-black text-black group-hover:text-purple-900 text-lg">Availability</span>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-black" />
                </motion.button>

                <motion.button
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/doctor/test-requests')}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-orange-50 rounded-2xl transition-all group border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-200 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <BeakerIcon className="h-6 w-6 text-black" />
                    </div>
                    <span className="font-black text-black group-hover:text-orange-900 text-lg">Test Requests</span>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-black" />
                </motion.button>

                <motion.button
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/doctor/bank-details')}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-emerald-50 rounded-2xl transition-all group border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-emerald-200 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <BanknotesIcon className="h-6 w-6 text-black" />
                    </div>
                    <span className="font-black text-black group-hover:text-emerald-900 text-lg">Bank Details</span>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-black" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
