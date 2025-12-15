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
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { getAdminAppointments } from '../../api/admin';
import { Appointment } from '../../types/appointments';
import Spinner from '../../components/ui/Spinner';
import { format, parseISO, isToday, isFuture, isValid, parse } from 'date-fns';

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
        return { icon: ClockIcon, color: 'text-blue-900', bgColor: 'bg-blue-300', borderColor: 'border-black', label: 'Scheduled' };
      case 'confirmed':
        return { icon: CheckCircleIcon, color: 'text-emerald-900', bgColor: 'bg-emerald-400', borderColor: 'border-black', label: 'Confirmed' };
      case 'completed':
        return { icon: CheckCircleIcon, color: 'text-green-900', bgColor: 'bg-green-300', borderColor: 'border-black', label: 'Completed' };
      case 'cancelled':
        return { icon: XCircleIcon, color: 'text-red-900', bgColor: 'bg-red-400', borderColor: 'border-black', label: 'Cancelled' };
      case 'no_show':
        return { icon: ExclamationCircleIcon, color: 'text-orange-900', bgColor: 'bg-orange-300', borderColor: 'border-black', label: 'No Show' };
      default:
        return { icon: ClockIcon, color: 'text-gray-900', bgColor: 'bg-gray-200', borderColor: 'border-black', label: status };
    }
  };

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
          <CalendarDaysIcon className="h-12 w-12 text-white/90" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-1/3 right-10 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hidden lg:block"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
          <ClockIcon className="h-12 w-12 text-white/90" />
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
                PLATFORM APPOINTMENTS
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                ALL <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">APPOINTMENTS</span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl font-medium leading-relaxed">
                View and manage all appointments across the VitaNips platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
            >
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CalendarDaysIcon className="h-8 w-8 text-green-200" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-200 uppercase tracking-wider">Total Appointments</p>
                <p className="text-2xl font-black text-white">{count}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
        
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8 mb-12"
        >
          <div className="flex items-center gap-4 mb-8 pb-6 border-b-4 border-gray-100">
            <div className="p-3 bg-purple-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <FunnelIcon className="h-6 w-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight">Search & Filter</h2>
              <p className="text-gray-600 font-medium">Find specific appointments or filter by status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase tracking-wide ml-1">Search</label>
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                <input
                  type="text"
                  placeholder="Patient, doctor, or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-32 py-4 bg-gray-50 rounded-xl border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium placeholder:text-gray-400"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all border-2 border-transparent"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase tracking-wide ml-1">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="w-full px-4 py-4 bg-gray-50 rounded-xl border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden mb-12"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="lg" />
              <p className="mt-4 font-bold text-gray-500 animate-pulse">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-24 px-6">
              <div className="inline-block p-6 rounded-full bg-gray-100 border-4 border-gray-200 mb-6">
                <CalendarDaysIcon className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No Appointments Found</h3>
              <p className="text-gray-600 font-medium max-w-md mx-auto">
                We couldn't find any appointments matching your search. Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {appointments.map((appointment) => {
                const statusInfo = getStatusInfo(appointment.status);
                const StatusIcon = statusInfo.icon;
                const appointmentDate = parseISO(appointment.date);
                
                let appointmentTime = parseISO(appointment.start_time);
                if (!isValid(appointmentTime)) {
                  // Try to parse 'HH:mm:ss' format
                  const today = new Date();
                  appointmentTime = parse(appointment.start_time, 'HH:mm:ss', today);
                  // Fallback if still invalid
                  if (!isValid(appointmentTime)) {
                     appointmentTime = new Date(); // Or handle error appropriately
                  }
                }

                const isUpcoming = isValid(appointmentDate) && (isFuture(appointmentDate) || (isToday(appointmentDate) && isFuture(appointmentTime)));

                return (
                  <motion.div
                    key={appointment.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgb(255, 252, 240)' }}
                    className="p-6 sm:p-8 transition-colors group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-6">
                          {/* Status Icon Box */}
                          <div className={`
                            flex-shrink-0 w-16 h-16 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center
                            ${statusInfo.bgColor}
                          `}>
                            <StatusIcon className="h-8 w-8 text-black" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-xl font-black text-black">
                                {appointment.patient_name || 'Patient'}
                              </h3>
                              <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${statusInfo.bgColor} ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                              {isUpcoming && (
                                <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide bg-blue-100 text-blue-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                                  Upcoming
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm font-medium text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-black" />
                                <span className="text-black/80 font-bold">Dr. {appointment.doctor_name || 'Doctor'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarDaysIcon className="h-4 w-4 text-black" />
                                <span>{isValid(appointmentDate) ? format(appointmentDate, 'MMM dd, yyyy') : appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-black" />
                                <span>{isValid(appointmentTime) ? format(appointmentTime, 'h:mm a') : appointment.start_time}</span>
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
                              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm">
                                <span className="font-bold text-black uppercase text-xs tracking-wider block mb-1">Reason</span>
                                <p className="text-gray-700 line-clamp-1">{appointment.reason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center lg:self-center pl-[5.5rem] lg:pl-0">
                        <Link
                          to={`/admin/appointments/${appointment.id}`}
                          className="px-6 py-3 bg-white text-black font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm uppercase tracking-wide flex items-center gap-2"
                        >
                          <span>View Details</span>
                          <ArrowLeftIcon className="h-4 w-4 rotate-180" />
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
            <div className="p-6 bg-gray-50 border-t-4 border-black flex items-center justify-between">
              <button
                onClick={() => {
                  const prevPage = currentPage - 1;
                  fetchAppointments(prevPage);
                  setCurrentPage(prevPage);
                }}
                disabled={!previousPage || loading}
                className="px-6 py-3 bg-white text-black font-black uppercase tracking-wide rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
              >
                Previous
              </button>
              <span className="text-sm font-black uppercase tracking-widest text-black/60 bg-white px-4 py-2 rounded-lg border-2 border-black/10">
                Page {currentPage} of {Math.ceil(count / 20)}
              </span>
              <button
                onClick={() => {
                  const nextPageNum = currentPage + 1;
                  fetchAppointments(nextPageNum);
                  setCurrentPage(nextPageNum);
                }}
                disabled={!nextPage || loading}
                className="px-6 py-3 bg-black text-white font-black uppercase tracking-wide rounded-xl border-2 border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

