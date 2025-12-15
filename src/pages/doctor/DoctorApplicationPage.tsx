import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DocumentTextIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  IdentificationIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { getSpecialties, getMyApplication, submitDoctorApplication, updateDoctorApplication, DoctorApplicationPayload } from '../../api/doctors';
import { Specialty } from '../../types/doctors';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import FormInput from '../../components/forms/FormInput';
import toast from 'react-hot-toast';

const applicationSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  specialty_ids: z.array(z.number()).min(1, 'At least one specialty is required'),
  gender: z.enum(['M', 'F']),
  years_of_experience: z.number().min(0, 'Years of experience must be 0 or more'),
  education: z.string().min(10, 'Education details are required (minimum 10 characters)'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  languages_spoken: z.string().min(1, 'Languages spoken is required'),
  consultation_fee: z.string().optional(),
  is_available_for_virtual: z.boolean().default(true),
  license_number: z.string().min(1, 'License number is required'),
  license_issuing_authority: z.string().min(1, 'License issuing authority is required'),
  license_expiry_date: z.string().optional(),
  hospital_name: z.string().min(1, 'Hospital name is required'),
  hospital_address: z.string().min(1, 'Hospital address is required'),
  hospital_phone: z.string().min(1, 'Hospital phone is required'),
  hospital_email: z.string().email('Invalid email').optional().or(z.literal('')),
  hospital_contact_person: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'bg-cream-100 text-black border-black border-2', icon: <DocumentTextIcon className="h-5 w-5 stroke-[2.5]" /> },
  submitted: { label: 'Submitted for Review', color: 'bg-blue-100 text-blue-900 border-black border-2', icon: <ClockIcon className="h-5 w-5 stroke-[2.5]" /> },
  under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-900 border-black border-2', icon: <ClockIcon className="h-5 w-5 stroke-[2.5]" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-900 border-black border-2', icon: <CheckCircleIcon className="h-5 w-5 stroke-[2.5]" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-900 border-black border-2', icon: <XCircleIcon className="h-5 w-5 stroke-[2.5]" /> },
  needs_revision: { label: 'Needs Revision', color: 'bg-orange-100 text-orange-900 border-black border-2', icon: <ExclamationTriangleIcon className="h-5 w-5 stroke-[2.5]" /> },
};

const DoctorApplicationPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema) as any,
    defaultValues: {
      first_name: '',
      last_name: '',
      specialty_ids: [],
      gender: 'M',
      years_of_experience: 0,
      education: '',
      bio: '',
      languages_spoken: '',
      consultation_fee: '',
      is_available_for_virtual: true,
      license_number: '',
      license_issuing_authority: '',
      license_expiry_date: '',
      hospital_name: '',
      hospital_address: '',
      hospital_phone: '',
      hospital_email: '',
      hospital_contact_person: '',
    },
  });

  // Update form values when user data is available
  useEffect(() => {
    if (user && !application) {
      setValue('first_name', user.first_name || '');
      setValue('last_name', user.last_name || '');
    }
  }, [user, application, setValue]);

  useEffect(() => {
    console.log('DoctorApplicationPage - Auth state:', { authLoading, isAuthenticated, user: user?.email });
    
    // Wait for auth to finish loading before fetching data
    if (!authLoading) {
      if (!isAuthenticated) {
        // If not authenticated, redirect to login
        console.log('Not authenticated, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
      // Only fetch data if authenticated
      console.log('Authenticated, fetching application data');
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching specialties and application data...');
      
      const [specialtiesData, applicationData] = await Promise.all([
        getSpecialties().catch((err) => {
          console.error('Error fetching specialties:', err);
          // Return empty array on error instead of throwing
          return [];
        }),
        getMyApplication().catch((err) => {
          // If 404, no application exists yet - that's fine
          if (err?.response?.status === 404) {
            console.log('No application found (404) - this is expected for new doctors');
            return null;
          }
          // For other errors, log but don't block
          console.warn('Failed to fetch application:', err);
          return null;
        }),
      ]);
      
      // Ensure specialties is always an array
      const specialtiesArray = Array.isArray(specialtiesData) ? specialtiesData : [];
      console.log('Fetched specialties:', specialtiesArray.length);
      setSpecialties(specialtiesArray);
      
      if (applicationData) {
        setApplication(applicationData);
        // Populate form with existing application data
        Object.keys(applicationData).forEach((key) => {
          if (key === 'specialty_ids' && applicationData.specialties && Array.isArray(applicationData.specialties)) {
            const ids = applicationData.specialties.map((s: Specialty) => s.id);
            setSelectedSpecialties(ids);
            setValue('specialty_ids', ids);
          } else if (key !== 'specialties' && key !== 'id' && key !== 'application_status') {
            const value = (applicationData as any)[key];
            if (value !== undefined) {
              setValue(key as keyof ApplicationFormData, value);
            }
          }
        });
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number; data?: any } };
      if (apiError.response?.status !== 404) {
        const errorMessage = apiError.response?.data?.error || 'Failed to load application data';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching application data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setSubmitting(true);
      
      const payload: DoctorApplicationPayload = {
        ...data,
        specialty_ids: selectedSpecialties,
        consultation_fee: data.consultation_fee || undefined,
        license_expiry_date: data.license_expiry_date || undefined,
        hospital_email: data.hospital_email || undefined,
        hospital_contact_person: data.hospital_contact_person || undefined,
      };

      let result;
      if (application) {
        result = await updateDoctorApplication(payload);
      } else {
        result = await submitDoctorApplication(payload);
      }
      
      setApplication(result);
      toast.success(application ? 'Application updated successfully' : 'Application submitted successfully!');
      
      if (!application) {
        // If this was a new submission, navigate to dashboard after a delay
        setTimeout(() => {
          navigate('/doctor/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSpecialty = (specialtyId: number) => {
    const newSelection = selectedSpecialties.includes(specialtyId)
      ? selectedSpecialties.filter(id => id !== specialtyId)
      : [...selectedSpecialties, specialtyId];
    setSelectedSpecialties(newSelection);
    setValue('specialty_ids', newSelection);
  };

  const canEdit = !application || ['draft', 'needs_revision'].includes(application.application_status);

  // Show loading while auth is loading or data is fetching
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-black font-bold">Loading application form...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, this will be handled by useEffect redirect
  if (!isAuthenticated) {
    return null;
  }

  // Show error state if there was a critical error
  if (error && (!Array.isArray(specialties) || specialties.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center max-w-md p-8 bg-white border-4 border-black rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4 stroke-2" />
          <h2 className="text-2xl font-black text-black mb-2 font-display">Error Loading Application</h2>
          <p className="text-black font-medium mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="px-6 py-3 bg-black text-white font-bold rounded-xl border-2 border-transparent hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = application ? STATUS_CONFIG[application.application_status] : null;

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Hero Section */}
      <div className="relative bg-primary-900 border-b-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] rounded-b-[3rem] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/doctor/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-black/20 text-white font-bold rounded-xl border-2 border-transparent hover:border-white/50 transition-all group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform stroke-[3]" />
              Back to Dashboard
            </button>
          </div>
          
          <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-purple-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-black text-xs uppercase tracking-wider mb-6">
            <SparklesIcon className="h-4 w-4 mr-2" />
            DOCTOR APPLICATION
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 font-display tracking-tight leading-tight">
                Doctor <span className="text-yellow-400">Application</span>
              </h1>
              <p className="text-lg md:text-xl text-cream-50/90 font-medium">Submit your credentials to join VitaNips</p>
            </div>

            {statusConfig && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className={`inline-flex items-center px-6 py-3 rounded-xl font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black ${statusConfig.color.replace('border-current', '')}`}
              >
                {statusConfig.icon}
                <span className="ml-2 uppercase tracking-wide">{statusConfig.label}</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Application Status Banner */}
      {application && application.review_notes && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black ${
              application.application_status === 'needs_revision'
                ? 'bg-orange-100'
                : application.application_status === 'rejected'
                ? 'bg-red-100'
                : 'bg-blue-100'
            }`}
          >
            <div className="flex items-start gap-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-black flex-shrink-0 mt-1 stroke-2" />
              <div className="flex-1">
                <h3 className="font-black text-xl mb-2 text-black uppercase tracking-wide">
                  {application.application_status === 'needs_revision' ? 'Revision Required' : 'Admin Review Notes'}
                </h3>
                <p className="text-black font-bold text-lg whitespace-pre-wrap">{application.review_notes}</p>
                {application.rejection_reason && (
                  <div className="mt-4 p-4 bg-white/50 border-2 border-black rounded-xl">
                    <p className="font-black text-black uppercase text-xs tracking-wider mb-1">Rejection Reason:</p>
                    <p className="text-black font-bold">{application.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Form Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden"
        >
          <div className="bg-yellow-400 p-8 border-b-4 border-black">
              <h2 className="text-3xl font-black text-black font-display">Application Form</h2>
              <p className="text-black/80 font-bold text-lg">Please fill out all required fields carefully.</p>
          </div>

          <div className="p-8 md:p-12">
            {!canEdit && (
              <div className="mb-8 p-6 bg-yellow-100 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-black font-bold text-lg">
                  Your application is currently <strong className="uppercase bg-black text-yellow-400 px-2 py-0.5 rounded">{application?.application_status}</strong>. 
                  {application?.application_status === 'needs_revision' && ' Please review the admin notes above and update your application.'}
                </p>
              </div>
            )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <section className="bg-cream-50 p-6 rounded-2xl border-2 border-black">
              <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3 uppercase tracking-wide">
                <div className="p-2 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <UserIcon className="h-6 w-6 text-black stroke-2" />
                </div>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  name="first_name"
                  label="First Name"
                  register={register}
                  errors={errors}
                  disabled={!canEdit}
                />
                <FormInput
                  name="last_name"
                  label="Last Name"
                  register={register}
                  errors={errors}
                  disabled={!canEdit}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">Gender</label>
                  <select
                    {...register('gender')}
                    disabled={!canEdit}
                    className="w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white font-bold text-black disabled:bg-gray-100 appearance-none"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Professional Information */}
            <section className="bg-cream-50 p-6 rounded-2xl border-2 border-black">
              <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3 uppercase tracking-wide">
                <div className="p-2 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <AcademicCapIcon className="h-6 w-6 text-black stroke-2" />
                </div>
                Professional Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                    Specialties <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Array.isArray(specialties) && specialties.length > 0 ? specialties.map((specialty) => (
                      <button
                        key={specialty.id}
                        type="button"
                        onClick={() => canEdit && toggleSpecialty(specialty.id)}
                        disabled={!canEdit}
                        className={`p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                          selectedSpecialties.includes(specialty.id)
                            ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-black border-black hover:bg-gray-100'
                        } ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {specialty.name}
                      </button>
                    )) : (
                      <div className="col-span-full text-center py-8 text-black font-bold border-2 border-dashed border-black rounded-xl bg-white">
                        <p>Loading specialties...</p>
                      </div>
                    )}
                  </div>
                  {errors.specialty_ids && (
                    <p className="mt-2 text-sm text-red-600">{errors.specialty_ids.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('years_of_experience', { valueAsNumber: true })}
                      disabled={!canEdit}
                      className={`w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white font-bold text-black disabled:bg-gray-100 ${
                        errors.years_of_experience ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.years_of_experience && (
                      <p className="mt-2 text-sm font-bold text-red-600">{errors.years_of_experience.message as string}</p>
                    )}
                  </div>
                  <FormInput
                    name="consultation_fee"
                    label="Consultation Fee (optional)"
                    type="number"
                    step="0.01"
                    register={register}
                    errors={errors}
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                    Education <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('education')}
                    disabled={!canEdit}
                    rows={4}
                    placeholder="e.g., MD from Medical University, Residency in..."
                    className={`w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white font-bold text-black placeholder-gray-500 disabled:bg-gray-100 ${
                      errors.education ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.education && (
                    <p className="mt-2 text-sm font-bold text-red-600">{errors.education.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('bio')}
                    disabled={!canEdit}
                    rows={4}
                    placeholder="Tell us about your medical practice and expertise..."
                    className={`w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white font-bold text-black placeholder-gray-500 disabled:bg-gray-100 ${
                      errors.bio ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.bio && (
                    <p className="mt-2 text-sm font-bold text-red-600">{errors.bio.message as string}</p>
                  )}
                </div>

                <FormInput
                  name="languages_spoken"
                  label="Languages Spoken"
                  register={register}
                  errors={errors}
                  disabled={!canEdit}
                  placeholder="e.g., English, Spanish, French"
                />

                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-black">
                  <input
                    type="checkbox"
                    {...register('is_available_for_virtual')}
                    disabled={!canEdit}
                    className="h-6 w-6 text-black focus:ring-black border-2 border-black rounded transition-all"
                  />
                  <label className="text-base font-bold text-black">
                    Available for virtual consultations
                  </label>
                </div>
              </div>
            </section>

            {/* License Information */}
            <section className="bg-cream-50 p-6 rounded-2xl border-2 border-black">
              <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3 uppercase tracking-wide">
                <div className="p-2 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <IdentificationIcon className="h-6 w-6 text-black stroke-2" />
                </div>
                License Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  name="license_number"
                  label="License Number"
                  register={register}
                  errors={errors}
                  disabled={!canEdit}
                />
                <FormInput
                  name="license_issuing_authority"
                  label="Issuing Authority"
                  register={register}
                  errors={errors}
                  disabled={!canEdit}
                  placeholder="e.g., Medical Board of Nigeria"
                />
                <FormInput
                  name="license_expiry_date"
                  label="License Expiry Date (optional)"
                  type="date"
                  register={register}
                  errors={errors}
                  disabled={!canEdit}
                />
              </div>
            </section>

            {/* Hospital Information */}
            <section className="bg-cream-50 p-6 rounded-2xl border-2 border-black">
              <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3 uppercase tracking-wide">
                <div className="p-2 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <BuildingOfficeIcon className="h-6 w-6 text-black stroke-2" />
                </div>
                Hospital/Clinic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  name="hospital_name"
                  label="Hospital/Clinic Name"
                  register={register}
                  errors={errors}
                  disabled={!canEdit}
                />
                <FormInput
                  name="hospital_contact_person"
                  label="Contact Person (optional)"
                  register={register}
                  errors={errors}
                  disabled={!canEdit}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                    Hospital Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('hospital_address')}
                    disabled={!canEdit}
                    rows={2}
                    className={`w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white font-bold text-black placeholder-gray-500 disabled:bg-gray-100 ${
                      errors.hospital_address ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.hospital_address && (
                    <p className="mt-2 text-sm font-bold text-red-600">{errors.hospital_address.message as string}</p>
                  )}
                </div>
                <FormInput
                  name="hospital_phone"
                  label="Hospital Phone"
                  type="tel"
                  register={register}
                  errors={errors}
                  disabled={!canEdit}
                />
                <FormInput
                  name="hospital_email"
                  label="Hospital Email (optional)"
                  type="email"
                  register={register}
                  errors={errors}
                  disabled={!canEdit}
                />
              </div>
            </section>

            {/* Submit Button */}
            {canEdit && (
              <div className="flex justify-end gap-6 pt-8 border-t-4 border-black">
                <button
                  type="button"
                  onClick={() => navigate('/doctor/dashboard')}
                  className="px-8 py-4 rounded-xl font-bold text-black bg-gray-100 hover:bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wide"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-10 py-4 rounded-xl font-black text-white bg-black hover:bg-gray-800 transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 uppercase tracking-wide text-lg"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" />
                      Submitting...
                    </>
                  ) : application ? (
                    'Update Application'
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            )}
          </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorApplicationPage;

