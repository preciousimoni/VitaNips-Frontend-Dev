import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  BellAlertIcon
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
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
      {/* Hero Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 overflow-hidden mb-8"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div 
            style={{ y }}
            className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"
          ></motion.div>
          <motion.div 
            style={{ y: y2 }}
            className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"
          ></motion.div>
          <motion.div 
            style={{ y: y3 }}
            className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"
          ></motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold uppercase tracking-wider text-white">
                  <SparklesIcon className="h-4 w-4 inline mr-2" />
                  Doctor Portal
                </span>
                <span className="text-sm text-white/80 font-medium">{format(currentDate, 'EEEE, MMMM do, yyyy')}</span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-white tracking-tight">
                Good {currentDate.getHours() < 12 ? 'Morning' : currentDate.getHours() < 18 ? 'Afternoon' : 'Evening'},{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">Dr. {user?.last_name || user?.first_name}</span>
                  <motion.span 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute bottom-2 left-0 right-0 h-3 bg-yellow-400/30 -z-0"
                  ></motion.span>
                </span>
              </h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed"
              >
                Here's your daily overview. You have{' '}
                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{stats.todayAppointments} appointments</span>{' '}
                today and{' '}
                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{stats.pendingPrescriptions} prescriptions</span>{' '}
                pending review.
              </motion.p>
            </motion.div>
            
            {/* Notification Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button className="relative group">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all shadow-lg"
                >
                  <BellAlertIcon className="h-8 w-8 text-white" />
                  {stats.pendingPrescriptions > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold ring-4 ring-primary animate-pulse"
                    >
                      {stats.pendingPrescriptions > 9 ? '9+' : stats.pendingPrescriptions}
                    </motion.span>
                  )}
                </motion.div>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
          </svg>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center text-red-700 shadow-lg"
          >
            <ExclamationCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Pending Prescriptions - Action Required */}
          <motion.div 
            onClick={() => navigate('/doctor/prescriptions')}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"
            ></motion.div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg"
                >
                  <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                </motion.div>
                {stats.pendingPrescriptions > 0 && (
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex h-3 w-3"
                  >
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </motion.span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Prescriptions</p>
              <h3 className="text-4xl font-black text-gray-900 mt-2">{stats.pendingPrescriptions}</h3>
            </div>
          </motion.div>

          {/* Today's Appointments - Primary Stat */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-primary via-emerald-600 to-teal-600 rounded-3xl shadow-2xl shadow-primary/30 p-6 text-white relative overflow-hidden"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0]
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -right-6 -bottom-6 text-white/10"
            >
              <CalendarIcon className="h-32 w-32" />
            </motion.div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30"
                >
                  <ClockIcon className="h-6 w-6 text-white" />
                </motion.div>
              </div>
              <p className="text-sm font-bold text-white/90 uppercase tracking-wider">Today's Appointments</p>
              <h3 className="text-4xl font-black mt-2">{stats.todayAppointments}</h3>
              <div className="mt-4 flex items-center gap-2 text-sm text-white/90">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold">
                  {stats.completedToday} Completed
                </span>
                <span className="font-medium">{stats.todayAppointments - stats.completedToday} Remaining</span>
              </div>
            </div>
          </motion.div>

          {/* Total Patients */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"
            ></motion.div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg"
                >
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </motion.div>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-4xl font-black text-gray-900 mt-2">{stats.totalPatients}</h3>
            </div>
          </motion.div>

          {/* Upcoming */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => navigate('/appointments')}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -90, 0]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"
            ></motion.div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg"
                >
                  <CalendarIcon className="h-6 w-6 text-white" />
                </motion.div>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Next 7 Days</p>
              <h3 className="text-4xl font-black text-gray-900 mt-2">{stats.upcomingAppointments}</h3>
              <p className="text-xs text-gray-500 mt-2 font-medium">Upcoming schedules</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Chart & Today's Schedule */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Weekly Activity Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 relative overflow-hidden"
            >
              {/* Decorative gradient blob */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-full blur-3xl"
              ></motion.div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-primary to-emerald-600 rounded-xl">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Weekly Overview</h3>
                  </div>
                  <p className="text-sm text-gray-500">Patient activity and prescriptions</p>
                </div>
                <select className="text-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-gray-700 font-medium focus:ring-2 focus:ring-primary focus:border-primary bg-white shadow-sm">
                  <option>This Week</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateActivityData(allAppointments)}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#32a852" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#32a852" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 600}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 600}} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'white',
                        padding: '12px'
                      }}
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
            </motion.div>

            {/* Today's Appointments List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 relative overflow-hidden"
            >
              {/* Decorative gradient blob */}
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, -180, 0]
                }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
              ></motion.div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary to-emerald-600 rounded-xl">
                    <ClockIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Today's Schedule</h3>
                    <p className="text-sm text-gray-500">{todayAppointments.length} appointments</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/appointments')}
                  className="text-sm font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-1"
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
                <div className="space-y-4 relative z-10">
                  {todayAppointments.map((apt, index) => (
                    <motion.div 
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50/50 group"
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-xl border-2 border-primary/20 text-gray-900"
                        >
                          <span className="text-xs font-bold uppercase text-gray-500">
                            {formatTime(apt.start_time).split(' ')[1]}
                          </span>
                          <span className="text-xl font-black text-primary">
                            {formatTime(apt.start_time).split(' ')[0]}
                          </span>
                        </motion.div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{apt.patient_name || 'Patient'}</h4>
                          <p className="text-sm text-gray-600 flex items-center mt-1 font-medium">
                            <span className="truncate max-w-[200px]">{apt.reason || 'General Consultation'}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                        {apt.status === 'confirmed' && (
                           <motion.button 
                             whileHover={{ scale: 1.1 }}
                             whileTap={{ scale: 0.9 }}
                             onClick={(e) => {
                               e.stopPropagation();
                               navigate(`/appointments/${apt.id}/call`);
                             }}
                             className="p-3 bg-gradient-to-br from-primary to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all shadow-md"
                             title="Start Video Call"
                           >
                             <VideoCameraIcon className="h-5 w-5" />
                           </motion.button>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.1, x: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/appointments/${apt.id}`)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        >
                          <ArrowRightIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Quick Actions & Pending */}
          <div className="space-y-8">
            
            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 relative overflow-hidden"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"
              ></motion.div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-gradient-to-br from-primary to-emerald-600 rounded-xl">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3 relative z-10">
                {/* Application Status Banner */}
                {(!applicationStatus || applicationStatus === 'draft' || applicationStatus === 'needs_revision' || applicationStatus === 'rejected') && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border-2 mb-4 ${
                      !applicationStatus || applicationStatus === 'draft'
                        ? 'bg-yellow-50 border-yellow-300'
                        : applicationStatus === 'needs_revision'
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <ExclamationCircleIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        !applicationStatus || applicationStatus === 'draft'
                          ? 'text-yellow-600'
                          : applicationStatus === 'needs_revision'
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 mb-1">
                          {!applicationStatus || applicationStatus === 'draft'
                            ? 'Complete Your Doctor Application'
                            : applicationStatus === 'needs_revision'
                            ? 'Application Needs Revision'
                            : 'Application Rejected'}
                        </p>
                        <p className="text-xs text-gray-700 mb-2">
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
                          className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                            !applicationStatus || applicationStatus === 'draft'
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : applicationStatus === 'needs_revision'
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {!applicationStatus || applicationStatus === 'draft' ? 'Submit Application' : 'Update Application'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Application Status - Pending/Under Review */}
                {(applicationStatus === 'submitted' || applicationStatus === 'under_review') && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-50 border-2 border-blue-300 rounded-2xl mb-4"
                  >
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 mb-1">Application Under Review</p>
                        <p className="text-xs text-gray-700">Your application is being reviewed by our admin team. You'll be notified once a decision is made.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/doctor/prescriptions')}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-2xl transition-all group border-2 border-transparent hover:border-blue-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg"
                    >
                      <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                    </motion.div>
                    <span className="font-bold text-gray-900 group-hover:text-blue-700 text-lg">Prescriptions</span>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                </motion.button>

                <motion.button
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/doctor/availability')}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl transition-all group border-2 border-transparent hover:border-purple-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg"
                    >
                      <ClockIcon className="h-6 w-6 text-white" />
                    </motion.div>
                    <span className="font-bold text-gray-900 group-hover:text-purple-700 text-lg">Availability</span>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
                </motion.button>
              </div>
            </motion.div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
