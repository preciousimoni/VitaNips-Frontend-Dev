// src/pages/admin/AdminAppointmentsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  ArrowLeftIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { getAdminAppointments } from '../../api/admin';
import { Appointment } from '../../types/appointments';
import Spinner from '../../components/ui/Spinner';
import { format, parseISO, isToday, isPast, isFuture } from 'date-fns';

const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'>('all');
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAppointments = async (page: number = 1) => {
    try {
      setLoading(true);
      const filters: Parameters<typeof getAdminAppointments>[0] = {
        page,
        page_size: 20,
      };
      
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (search) filters.search = search;
      
      const data = await getAdminAppointments(filters);
      setAppointments(data.results);
      setCount(data.count);
      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearch = () => {
    fetchAppointments(1);
    setCurrentPage(1);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { icon: ClockIcon, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', label: 'Scheduled' };
      case 'confirmed':
        return { icon: CheckCircleIcon, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', label: 'Confirmed' };
      case 'completed':
        return { icon: CheckCircleIcon, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', label: 'Completed' };
      case 'cancelled':
        return { icon: XCircleIcon, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', label: 'Cancelled' };
      case 'no_show':
        return { icon: ExclamationCircleIcon, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', label: 'No Show' };
      default:
        return { icon: ClockIcon, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', label: status };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden"
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
          <CalendarDaysIcon className="h-8 w-8 text-white" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
          <ClockIcon className="h-8 w-8 text-white" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold uppercase tracking-wider mb-6"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            PLATFORM APPOINTMENTS
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
                All Appointments
              </h1>
              <p className="text-lg text-white/90">View and manage all appointments on the platform</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border-2 bg-white/20 backdrop-blur-sm border-white/30 text-white"
            >
              <CalendarDaysIcon className="h-6 w-6 mr-2" />
              {count} Total
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
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, doctor name, or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-32 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  Search
                </motion.button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm font-medium"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 mb-8"
        >
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block"
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarDaysIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">No Appointments Found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </motion.div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((appointment, index) => {
                const statusInfo = getStatusInfo(appointment.status);
                const StatusIcon = statusInfo.icon;
                const appointmentDate = parseISO(appointment.date);
                const appointmentTime = parseISO(appointment.start_time);
                const isUpcoming = isFuture(appointmentDate) || (isToday(appointmentDate) && isFuture(appointmentTime));

                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          <div className={`p-3 rounded-xl ${statusInfo.bgColor} border-2 ${statusInfo.borderColor}`}>
                            <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-black text-gray-900">
                                {appointment.patient_name || 'Patient'}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
                                {statusInfo.label}
                              </span>
                              {isUpcoming && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                  Upcoming
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                <span className="font-semibold">Dr. {appointment.doctor_name || 'Doctor'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarDaysIcon className="h-4 w-4" />
                                <span>{format(appointmentDate, 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4" />
                                <span>{format(appointmentTime, 'h:mm a')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {appointment.appointment_type === 'virtual' ? (
                                  <VideoCameraIcon className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <BuildingOfficeIcon className="h-4 w-4 text-gray-600" />
                                )}
                                <span className="capitalize">{appointment.appointment_type.replace('_', ' ')}</span>
                              </div>
                            </div>
                            {appointment.reason && (
                              <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                                <span className="font-semibold">Reason:</span> {appointment.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/appointments/${appointment.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {(nextPage || previousPage) && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const prevPage = currentPage - 1;
                  fetchAppointments(prevPage);
                  setCurrentPage(prevPage);
                }}
                disabled={!previousPage || loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm font-semibold text-gray-600">
                Page {currentPage} of {Math.ceil(count / 20)}
              </span>
              <button
                onClick={() => {
                  const nextPageNum = currentPage + 1;
                  fetchAppointments(nextPageNum);
                  setCurrentPage(nextPageNum);
                }}
                disabled={!nextPage || loading}
                className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAppointmentsPage;

