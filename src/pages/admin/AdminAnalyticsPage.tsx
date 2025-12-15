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

// Afro-modern palette inspired colors
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
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-center max-w-md w-full"
        >
          <div className="bg-red-100 w-24 h-24 rounded-full border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ChartBarIcon className="h-10 w-10 text-black" />
          </div>
          <h2 className="text-2xl font-black text-black mb-3 text-transform uppercase">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-8 font-medium">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all border-2 border-transparent"
          >
            RETRY
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-primary-900 pt-20 pb-32 overflow-hidden border-b-8 border-black"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>

        {/* Floating Icons */}
        <motion.div
            className="absolute top-1/4 left-10 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hidden lg:block"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
            <ChartBarIcon className="h-12 w-12 text-white/90" />
        </motion.div>
        
        <motion.div
            className="absolute bottom-1/3 right-10 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hidden lg:block"
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
            <ArrowTrendingUpIcon className="h-12 w-12 text-white/90" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link 
                to="/admin/dashboard" 
                className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors font-bold tracking-wide"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                BACK TO DASHBOARD
              </Link>
            </motion.div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black border-2 border-white/30 text-white text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] mb-4">
                        <SparklesIcon className="h-4 w-4" />
                        PLATFORM ANALYTICS
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        PLATFORM <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300">INSIGHTS</span>
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl font-medium leading-relaxed">
                        View detailed system statistics, user growth trends, and appointment metrics.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                >
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                        <ChartBarIcon className="h-8 w-8 text-orange-200" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-orange-200 uppercase tracking-wider">Real-time Data</p>
                        <p className="text-2xl font-black text-white">Live Updates</p>
                    </div>
                </motion.div>
            </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
        
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8 mb-12"
        >
          <div className="flex items-center justify-between mb-8 pb-6 border-b-4 border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <UserGroupIcon className="h-6 w-6 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-black uppercase tracking-tight">User Growth</h2>
                <p className="text-gray-600 font-medium">Platform growth over the last 12 months</p>
              </div>
            </div>
            {maxUsers > 0 && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-black/60 uppercase tracking-widest mb-1">Peak Users</p>
                <div className="inline-block px-4 py-2 bg-blue-100 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-2xl font-black text-black">{maxUsers}</p>
                </div>
              </div>
            )}
          </div>

          {userGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#000"
                  style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  tickLine={false}
                  axisLine={{ strokeWidth: 2 }}
                />
                <YAxis 
                  stroke="#000"
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={{ strokeWidth: 2 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #000',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar 
                  dataKey="users" 
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  stroke="#000"
                  strokeWidth={2}
                >
                  {userGrowthData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mb-2" />
                <p className="font-bold">No user growth data available</p>
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
            className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8"
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b-4 border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CalendarIcon className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black uppercase tracking-tight">Appointments</h2>
                  <p className="text-sm text-gray-600 font-medium">Status Distribution</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-black/60 uppercase tracking-widest mb-1">Total</p>
                <div className="inline-block px-3 py-1 bg-green-100 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-xl font-black text-black">{totalAppointments}</p>
                </div>
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
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#000"
                      strokeWidth={2}
                    >
                      {appointmentsData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #000',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-8 space-y-3">
                  {appointmentsData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-black transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-black"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-bold text-black capitalize">{item.name}</span>
                      </div>
                      <span className="font-black text-black bg-white px-3 py-1 rounded-lg border-2 border-black/10">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
                <div className="h-80 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <CalendarIcon className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="font-bold">No appointment data available</p>
                </div>
            )}
          </motion.div>

          {/* Top Specialties */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8"
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b-4 border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <AcademicCapIcon className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black uppercase tracking-tight">Top Specialties</h2>
                  <p className="text-sm text-gray-600 font-medium">Doctor Distribution</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-black/60 uppercase tracking-widest mb-1">Total</p>
                <div className="inline-block px-3 py-1 bg-purple-100 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-xl font-black text-black">{totalSpecialties}</p>
                </div>
              </div>
            </div>

            {specialtiesData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={specialtiesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" stroke="#000" style={{ fontSize: '12px', fontWeight: 'bold' }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120}
                      stroke="#000"
                      style={{ fontSize: '12px', fontWeight: 'bold' }}
                      tickLine={false} axisLine={{ strokeWidth: 2 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #000',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)',
                      }}
                      cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                    />
                    <Bar 
                      dataKey="doctors" 
                      fill="#8b5cf6"
                      radius={[0, 8, 8, 0]}
                      stroke="#000"
                      strokeWidth={2}
                    >
                      {specialtiesData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-8 space-y-3">
                  {specialtiesData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-black transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-black"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-bold text-black">{item.name}</span>
                      </div>
                      <span className="font-black text-black bg-white px-3 py-1 rounded-lg border-2 border-black/10">{item.doctors} docs</span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
                <div className="h-80 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <AcademicCapIcon className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="font-bold">No specialty data available</p>
                </div>
            )}
          </motion.div>
        </div>

        {/* Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-yellow-100 border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="p-4 bg-yellow-400 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
            >
              <ChartBarIcon className="h-8 w-8 text-black" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-wide">Analytics Notice</h3>
              <p className="text-black/80 font-medium text-lg leading-relaxed">
                Advanced analytics with interactive charts, detailed reports, and PDF export capabilities are currently under development. 
                The current view provides real-time insights into platform usage, growth trends, and appointment statistics.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
