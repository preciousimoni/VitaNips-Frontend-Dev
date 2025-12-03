// src/pages/admin/AdminAnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  SparklesIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAdminAnalytics, AdminAnalytics } from '../../api/admin';
import Spinner from '../../components/ui/Spinner';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getAdminAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Prepare chart data
  const userGrowthData = analytics?.user_growth.map(item => ({
    month: item.month,
    users: item.count,
  })) || [];

  const appointmentsData = analytics?.appointments_by_status.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
  })) || [];

  const specialtiesData = analytics?.top_specialties.map(item => ({
    name: item.specialties__name || 'General',
    doctors: item.count,
  })) || [];

  const maxUsers = userGrowthData.length > 0 ? Math.max(...userGrowthData.map(d => d.users)) : 0;
  const totalAppointments = appointmentsData.reduce((sum, item) => sum + item.value, 0);
  const totalSpecialties = specialtiesData.reduce((sum, item) => sum + item.doctors, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl border border-red-100 text-center max-w-md w-full"
        >
          <div className="bg-gradient-to-br from-red-50 to-pink-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ChartBarIcon className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all"
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden"
      >
        {/* Animated Blobs */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
          animate={{ x: [-100, 200], y: [-50, 100], rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
          animate={{ x: [100, -200], y: [50, -100], rotate: [360, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        ></motion.div>

        {/* Floating Icon Cards */}
        <motion.div
          className="absolute top-1/4 left-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <ChartBarIcon className="h-8 w-8 text-white" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
          <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold uppercase tracking-wider mb-6"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            PLATFORM ANALYTICS
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Platform Analytics
              </h1>
              <p className="text-lg text-white/90">View detailed system statistics and trends</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border-2 bg-white/20 backdrop-blur-sm border-white/30 text-white"
            >
              <ChartBarIcon className="h-6 w-6 mr-2" />
              Real-time Data
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg"
              >
                <UserGroupIcon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">User Growth</h2>
                <p className="text-sm text-gray-600">Last 12 months</p>
              </div>
            </div>
            {maxUsers > 0 && (
              <div className="text-right">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Peak</p>
                <p className="text-3xl font-black text-blue-600">{maxUsers}</p>
              </div>
            )}
          </div>

          {userGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar 
                  dataKey="users" 
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                >
                  {userGrowthData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              No user growth data available
            </div>
          )}
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Appointments by Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg"
                >
                  <CalendarIcon className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Appointments</h2>
                  <p className="text-sm text-gray-600">By Status</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-black text-green-600">{totalAppointments}</p>
              </div>
            </div>

            {appointmentsData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={appointmentsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {appointmentsData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2">
                  {appointmentsData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-bold text-gray-900 capitalize">{item.name}</span>
                      </div>
                      <span className="font-black text-gray-900">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                No appointment data available
              </div>
            )}
          </motion.div>

          {/* Top Specialties */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg"
                >
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Top Specialties</h2>
                  <p className="text-sm text-gray-600">Doctor Distribution</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-black text-purple-600">{totalSpecialties}</p>
              </div>
            </div>

            {specialtiesData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={specialtiesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120}
                      stroke="#6b7280"
                      style={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                      cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                    />
                    <Bar 
                      dataKey="doctors" 
                      fill="url(#specialtyGradient)"
                      radius={[0, 8, 8, 0]}
                    >
                      {specialtiesData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="specialtyGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2">
                  {specialtiesData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-bold text-gray-900">{item.name}</span>
                      </div>
                      <span className="font-black text-gray-900">{item.doctors} doctors</span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                No specialty data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg flex-shrink-0"
            >
              <ChartBarIcon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-black text-yellow-900 mb-2">Analytics Notice</h3>
              <p className="text-sm text-yellow-800">
                Advanced analytics with interactive charts, detailed reports, and export capabilities are coming soon. 
                The current view provides real-time insights into platform usage and trends.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
