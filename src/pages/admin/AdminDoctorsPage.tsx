// src/pages/admin/AdminDoctorsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ArrowLeftIcon,
  FunnelIcon,
  UserCircleIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getAdminDoctors, reviewDoctorApplication, ReviewDoctorPayload, AdminDoctor, verifyDoctor } from '../../api/admin';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import {
  BuildingOfficeIcon,
  PhoneIcon,
  IdentificationIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const AdminDoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctor | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_revision' | 'contact_hospital' | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const filters: Parameters<typeof getAdminDoctors>[0] = {};
      
      if (verifiedFilter !== 'all') filters.verified = verifiedFilter === 'verified';
      if (search) filters.search = search;
      
      const data = await getAdminDoctors(filters);
      setDoctors(data.results);
    } catch (error) {
      toast.error('Failed to load doctors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedFilter]);

  const handleVerification = async (doctor: AdminDoctor, verified: boolean) => {
    try {
      await verifyDoctor(doctor.id, verified);
      toast.success(`Doctor ${verified ? 'verified' : 'unverified'} successfully`);
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to update verification status');
      console.error(error);
    }
  };

  const openReviewModal = (doctor: AdminDoctor) => {
    setSelectedDoctor(doctor);
    setReviewNotes(doctor.review_notes || '');
    setRejectionReason(doctor.rejection_reason || '');
    setReviewAction(null);
    setShowReviewModal(true);
  };

  const handleReview = async () => {
    if (!selectedDoctor || !reviewAction) return;

    try {
      setReviewing(true);
      const payload: ReviewDoctorPayload = {
        action: reviewAction,
        review_notes: reviewNotes,
        ...(reviewAction === 'reject' && { rejection_reason: rejectionReason }),
      };

      await reviewDoctorApplication(selectedDoctor.id, payload);
      toast.success(`Application ${reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'review updated'} successfully`);
      setShowReviewModal(false);
      fetchDoctors();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to review application');
      console.error(error);
    } finally {
      setReviewing(false);
    }
  };

  const handleContactHospital = async () => {
    if (!selectedDoctor) return;

    try {
      setReviewing(true);
      const payload: ReviewDoctorPayload = {
        action: 'contact_hospital',
        contact_hospital: true,
      };

      const result = await reviewDoctorApplication(selectedDoctor.id, payload);
      toast.success('Hospital contact information retrieved');
      if (result.hospital_info) {
        // Show hospital info in a toast or modal
        console.log('Hospital Info:', result.hospital_info);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to contact hospital');
      console.error(error);
    } finally {
      setReviewing(false);
    }
  };

  const pendingCount = doctors.filter(d => !d.is_verified).length;
  const verifiedCount = doctors.filter(d => d.is_verified).length;

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-primary-900 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden border-b-8 border-black"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

        {/* Floating Icon Cards - Hardened */}
        <motion.div
          className="absolute top-1/4 left-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <ShieldCheckIcon className="h-8 w-8 text-white" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
          <CheckCircleIcon className="h-8 w-8 text-white" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-5 py-2 rounded-xl bg-black border-2 border-white/30 text-white text-sm font-black uppercase tracking-wider mb-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            DOCTOR VERIFICATION
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors font-bold"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2 stroke-[3]" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 font-display tracking-tight">
                Doctor Verification
              </h1>
              <p className="text-xl text-white/90 font-bold max-w-2xl mt-4">Review and verify doctor applications</p>
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center px-6 py-3 rounded-2xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black bg-yellow-400 text-black hover:bg-yellow-300 transition-colors cursor-default"
              >
                <ClockIcon className="h-6 w-6 mr-2 stroke-[2.5]" />
                {pendingCount} Pending
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center px-6 py-3 rounded-2xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black bg-emerald-400 text-black hover:bg-emerald-300 transition-colors cursor-default"
              >
                <CheckCircleIcon className="h-6 w-6 mr-2 stroke-[2.5]" />
                {verifiedCount} Verified
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-black rounded-xl text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <FunnelIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-black font-display uppercase tracking-tight">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Search Doctors
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 stroke-[3]" />
                <input
                  type="text"
                  placeholder="Search by name, email, or specialty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchDoctors()}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-black focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold placeholder:font-medium placeholder:text-gray-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchDoctors}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all border-2 border-black"
                >
                  Search
                </motion.button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Verification Status
              </label>
              <div className="relative">
                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value as typeof verifiedFilter)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold appearance-none bg-white"
                >
                  <option value="all">All Doctors</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending Verification</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Doctors List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-4 border-black mb-8"
        >
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block"
              >
                <div className="bg-gray-100 p-6 rounded-full border-4 border-black mb-6 mx-auto w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <UserCircleIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-black text-black mb-2 font-display">No Doctors Found</h3>
                <p className="text-gray-600 font-bold">Try adjusting your search or filters</p>
              </motion.div>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {doctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ backgroundColor: '#fdfbf7' }}
                  className="p-6 transition-all group hover:bg-cream-50"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className={`relative p-3 ${
                        doctor.is_verified
                          ? 'bg-emerald-500'
                          : 'bg-yellow-400'
                      } rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0`}>
                        <UserCircleIcon className="h-8 w-8 text-black" />
                        {doctor.is_verified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-300 rounded-full border-2 border-black" />
                        )}
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-black text-black">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] uppercase tracking-wide ${
                            doctor.is_verified
                              ? 'bg-emerald-100 text-emerald-900 border-black'
                              : 'bg-yellow-100 text-yellow-900 border-black'
                          }`}>
                            {doctor.is_verified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 font-bold mb-3">
                          <div className="flex items-center gap-1.5">
                            <EnvelopeIcon className="h-4 w-4 text-black" />
                            {doctor.user.email}
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded border border-black/10">
                            <BriefcaseIcon className="h-4 w-4 text-black" />
                            {doctor.years_of_experience} {doctor.years_of_experience === 1 ? 'year' : 'years'} experience
                          </div>
                        </div>

                        {/* Specialties */}
                        {doctor.specialties && doctor.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {doctor.specialties.map((spec) => (
                              <span
                                key={spec.id}
                                className="px-3 py-1 text-xs font-black bg-blue-100 text-blue-900 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                              >
                                {spec.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Education */}
                        {doctor.education && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 font-bold">
                            <AcademicCapIcon className="h-4 w-4 text-black flex-shrink-0 mt-0.5" />
                            <p className="line-clamp-2">{doctor.education}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      {!doctor.is_verified ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openReviewModal(doctor)}
                            className="px-6 py-3 bg-blue-400 text-black font-black rounded-xl hover:bg-blue-300 transition-all flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <DocumentTextIcon className="h-5 w-5 stroke-[2.5]" />
                            Review Application
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVerification(doctor, true)}
                            className="px-6 py-3 bg-emerald-400 text-black font-black rounded-xl hover:bg-emerald-300 transition-all flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <CheckCircleIcon className="h-5 w-5 stroke-[2.5]" />
                            Quick Verify
                          </motion.button>
                        </>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleVerification(doctor, false)}
                          className="px-6 py-3 bg-red-400 text-black font-black rounded-xl hover:bg-red-300 transition-all flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <XCircleIcon className="h-5 w-5 stroke-[2.5]" />
                          Unverify
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-emerald-100 border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-emerald-900 uppercase tracking-wider mb-1">Total Doctors</p>
                <p className="text-3xl font-black text-black">{doctors.length}</p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <UserCircleIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-yellow-100 border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-yellow-900 uppercase tracking-wider mb-1">Pending</p>
                <p className="text-3xl font-black text-black">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-blue-100 border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-blue-900 uppercase tracking-wider mb-1">Verified</p>
                <p className="text-3xl font-black text-black">{verifiedCount}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedDoctor && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          title="Review Doctor Application"
          size="xl"
        >
          <div className="space-y-6">
            {/* Application Status */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Application Status</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedDoctor.application_status === 'submitted' || selectedDoctor.application_status === 'under_review'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedDoctor.application_status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : selectedDoctor.application_status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {selectedDoctor.application_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                </span>
              </div>
              {selectedDoctor.submitted_at && (
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(selectedDoctor.submitted_at).toLocaleString()}
                </p>
              )}
            </div>

            {/* License Information */}
            {selectedDoctor.license_number && (
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <IdentificationIcon className="h-6 w-6 text-blue-600" />
                  License Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700">License Number</p>
                    <p className="text-gray-900">{selectedDoctor.license_number}</p>
                  </div>
                  {selectedDoctor.license_issuing_authority && (
                    <div>
                      <p className="font-semibold text-gray-700">Issuing Authority</p>
                      <p className="text-gray-900">{selectedDoctor.license_issuing_authority}</p>
                    </div>
                  )}
                  {selectedDoctor.license_expiry_date && (
                    <div>
                      <p className="font-semibold text-gray-700">Expiry Date</p>
                      <p className="text-gray-900">{new Date(selectedDoctor.license_expiry_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hospital Information */}
            {selectedDoctor.hospital_name && (
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                  Hospital/Clinic Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700">Hospital Name</p>
                    <p className="text-gray-900">{selectedDoctor.hospital_name}</p>
                  </div>
                  {selectedDoctor.hospital_address && (
                    <div>
                      <p className="font-semibold text-gray-700">Address</p>
                      <p className="text-gray-900">{selectedDoctor.hospital_address}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedDoctor.hospital_phone && (
                      <div>
                        <p className="font-semibold text-gray-700 flex items-center gap-1">
                          <PhoneIcon className="h-4 w-4" />
                          Phone
                        </p>
                        <p className="text-gray-900">{selectedDoctor.hospital_phone}</p>
                      </div>
                    )}
                    {selectedDoctor.hospital_email && (
                      <div>
                        <p className="font-semibold text-gray-700 flex items-center gap-1">
                          <EnvelopeIcon className="h-4 w-4" />
                          Email
                        </p>
                        <p className="text-gray-900">{selectedDoctor.hospital_email}</p>
                      </div>
                    )}
                  </div>
                  {selectedDoctor.hospital_contact_person && (
                    <div>
                      <p className="font-semibold text-gray-700">Contact Person</p>
                      <p className="text-gray-900">{selectedDoctor.hospital_contact_person}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleContactHospital}
                  disabled={reviewing}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Contact Hospital for Verification
                </button>
              </div>
            )}

            {/* Review Actions */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Review Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setReviewAction('approve')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    reviewAction === 'approve'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-gray-200 hover:border-green-300'
                  }`}
                >
                  <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-bold text-sm">Approve</p>
                </button>
                <button
                  onClick={() => setReviewAction('reject')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    reviewAction === 'reject'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-white border-gray-200 hover:border-red-300'
                  }`}
                >
                  <XCircleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="font-bold text-sm">Reject</p>
                </button>
                <button
                  onClick={() => setReviewAction('request_revision')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    reviewAction === 'request_revision'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-white border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="font-bold text-sm">Request Revision</p>
                </button>
              </div>
            </div>

            {/* Review Notes */}
            {reviewAction && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Add your review notes and comments..."
                  />
                </div>
                {reviewAction === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Please provide a reason for rejection..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-6 py-2 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              {reviewAction && (
                <button
                  onClick={handleReview}
                  disabled={reviewing || (reviewAction === 'reject' && !rejectionReason)}
                  className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {reviewing ? (
                    <>
                      <Spinner size="sm" />
                      Processing...
                    </>
                  ) : (
                    `Confirm ${reviewAction === 'approve' ? 'Approval' : reviewAction === 'reject' ? 'Rejection' : 'Revision Request'}`
                  )}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDoctorsPage;
