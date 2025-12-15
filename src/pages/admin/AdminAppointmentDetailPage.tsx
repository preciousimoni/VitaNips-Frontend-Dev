// src/pages/admin/AdminAppointmentDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon, CalendarDaysIcon, ClockIcon, UserIcon,
  VideoCameraIcon, BuildingOfficeIcon, CheckCircleIcon,
  XCircleIcon, ExclamationCircleIcon,
  PhoneIcon, EnvelopeIcon, MapPinIcon, BanknotesIcon,
  ShieldCheckIcon, ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { getAdminAppointmentDetails } from '../../api/admin';
import { Appointment } from '../../types/appointments';
import Spinner from '../../components/ui/Spinner';
import { format, parseISO, isValid } from 'date-fns';
import toast from 'react-hot-toast';

const AdminAppointmentDetailPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!appointmentId) return;
      try {
        setLoading(true);
        const data = await getAdminAppointmentDetails(parseInt(appointmentId));
        setAppointment(data);
      } catch (error) {
        console.error('Failed to load appointment details:', error);
        toast.error('Failed to load appointment details');
        navigate('/admin/appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [appointmentId, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 font-bold text-gray-500 animate-pulse">Loading details...</p>
      </div>
    );
  }

  if (!appointment) return null;

  const statusInfo = getStatusInfo(appointment.status);
  const StatusIcon = statusInfo.icon;
  const appointmentDate = parseISO(appointment.date);
  const appointmentTime = parseISO(appointment.start_time);
  
  // Safe date/time formatting
  const formattedDate = isValid(appointmentDate) ? format(appointmentDate, 'EEEE, MMMM do, yyyy') : appointment.date;
  const formattedTime = isValid(appointmentTime) ? format(appointmentTime, 'h:mm a') : appointment.start_time;

  return (
    <div className="min-h-screen bg-cream-50 pb-20">
      {/* Hero Header */}
      <div className="bg-primary-900 pt-20 pb-24 border-b-8 border-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/admin/appointments" 
            className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors font-bold tracking-wide"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            BACK TO APPOINTMENTS
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`px-4 py-2 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 font-black uppercase tracking-wider text-sm ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <StatusIcon className="h-5 w-5" />
                  {statusInfo.label}
                </div>
                <div className="px-4 py-2 bg-black/30 rounded-xl border-2 border-white/20 text-white font-mono text-sm">
                  ID: #{appointment.id}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                Appointment Details
              </h1>
              <div className="flex items-center gap-2 text-white/90 font-medium text-lg">
                <CalendarDaysIcon className="h-6 w-6" />
                <span>{formattedDate}</span>
                <span className="mx-2">•</span>
                <ClockIcon className="h-6 w-6" />
                <span>{formattedTime}</span>
              </div>
            </div>
            
            {/* Quick Status Action (Optional) */}
            {/* <div className="flex gap-3">
              <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold transition-all">
                Cancel
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Reason Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Consultation Details</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-2">Primary Reason</h3>
                  <p className="text-xl font-medium text-gray-900 leading-relaxed">
                    {appointment.reason || "No reason provided."}
                  </p>
                </div>
                
                {appointment.notes && (
                   <div className="bg-gray-50 p-6 rounded-2xl border-2 border-black/10">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-2">Additional Notes</h3>
                    <p className="text-gray-700">{appointment.notes}</p>
                   </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-100">
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">Type</h3>
                     <div className="flex items-center gap-2 font-bold text-lg capitalize">
                        {appointment.appointment_type === 'virtual' ? (
                          <VideoCameraIcon className="h-5 w-5 text-blue-600" />
                        ) : (
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                        )}
                        {appointment.appointment_type.replace('_', ' ')}
                     </div>
                  </div>
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">Duration</h3>
                     <div className="flex items-center gap-2 font-bold text-lg">
                        <ClockIcon className="h-5 w-5 text-gray-600" />
                        <span>30 Minutes</span> {/* Approx duration if not in API */}
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Insurance & Payment */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <BanknotesIcon className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Payment & Insurance</h2>
              </div>

              <div className="space-y-6">
                 {appointment.user_insurance ? (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                       <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                             <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                             <div>
                                <p className="font-black text-blue-900 uppercase tracking-wide">Insurance Applied</p>
                                <p className="font-bold text-blue-700">{appointment.user_insurance.insurance_provider_name}</p>
                                <p className="text-sm text-blue-600">Policy: {appointment.user_insurance.policy_number}</p>
                             </div>
                          </div>
                          <span className="px-3 py-1 bg-white text-blue-800 text-xs font-bold uppercase rounded-lg border border-blue-200">
                             Verified
                          </span>
                       </div>
                    </div>
                 ) : (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center text-gray-500 font-medium">
                       No insurance applied to this appointment.
                    </div>
                 )}

                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border-2 border-gray-100">
                       <p className="text-xs font-bold text-gray-400 uppercase">Consultation Fee</p>
                       <p className="text-xl font-black text-gray-900">{appointment.consultation_fee || '—'}</p>
                    </div>
                    <div className="p-4 rounded-xl border-2 border-gray-100">
                       <p className="text-xs font-bold text-gray-400 uppercase">Insurance Coverage</p>
                       <p className="text-xl font-black text-green-600">{appointment.insurance_covered_amount || '—'}</p>
                    </div>
                    <div className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50">
                       <p className="text-xs font-bold text-gray-400 uppercase">Patient Copay</p>
                       <p className="text-xl font-black text-gray-900">{appointment.patient_copay || '—'}</p>
                    </div>
                 </div>
              </div>
            </motion.div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Patient Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 overflow-hidden relative"
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-bl-full -mr-4 -mt-4 z-0"></div>
               <div className="relative z-10">
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-4">Patient</h3>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-16 h-16 rounded-full border-4 border-black bg-purple-200 flex items-center justify-center text-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {appointment.patient_name ? appointment.patient_name.charAt(0) : 'P'}
                     </div>
                     <div>
                        <p className="text-xl font-black leading-tight">{appointment.patient_name || 'Unknown Patient'}</p>
                        <p className="text-sm text-gray-500 font-medium">ID: #{appointment.user}</p>
                     </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t-2 border-gray-100">
                     {appointment.patient_email && (
                        <div className="flex items-center gap-3 text-sm font-medium">
                           <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                           <span className="truncate">{appointment.patient_email}</span>
                        </div>
                     )}
                     {/* Phone would go here if available in type */}
                  </div>
               </div>
            </motion.div>

            {/* Doctor Card */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 }}
               className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 overflow-hidden relative"
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-4 -mt-4 z-0"></div>
               <div className="relative z-10">
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-4">Doctor</h3>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-16 h-16 rounded-full border-4 border-black bg-blue-200 flex items-center justify-center text-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {appointment.doctor_name ? appointment.doctor_name.charAt(0) : 'D'}
                     </div>
                     <div>
                        <p className="text-xl font-black leading-tight">Dr. {appointment.doctor_name || 'Unknown'}</p>
                        <p className="text-sm text-blue-600 font-bold uppercase tracking-wide">{appointment.specialty || 'General'}</p>
                     </div>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-100">
                     <Link to={`/admin/doctors?search=${appointment.doctor_name}`} className="block w-full py-3 bg-black text-white text-center font-bold rounded-xl hover:bg-gray-800 transition-all">
                        View Profile
                     </Link>
                  </div>
               </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointmentDetailPage;
