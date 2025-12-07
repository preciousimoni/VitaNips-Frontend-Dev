import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../contexts/AuthContext';
import { profileSchema, ProfileFormData } from '../../../schemas/userSchema';
import FormInput from '../../../components/forms/FormInput';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { UserProfileUpdatePayload } from '../../../types/user';
import Skeleton from '../../../components/ui/Skeleton';
import { getUserEmergencyContacts } from '../../../api/emergencyContacts';
import { EmergencyContact } from '../../../types/user';
import { uploadProfilePicture } from '../../../api/user';
import { updateDoctorApplication } from '../../../api/doctors';
import { 
    UserCircleIcon, 
    HeartIcon, 
    ShieldCheckIcon, 
    CameraIcon,
    PencilSquareIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    LifebuoyIcon,
    PlusIcon,
    ArrowRightIcon,
    SparklesIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const ProfilePage: React.FC = () => {
  const { user, fetchUserProfile, accessToken, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    // @ts-expect-error - Type compatibility issue between zodResolver and react-hook-form types
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      date_of_birth: '',
      address: '',
      blood_group: '',
      genotype: '',
      allergies: '',
      chronic_conditions: '',
      weight: undefined,
      height: undefined,
      medical_history_summary: '',
    },
  });

  // Refresh user profile when component mounts to ensure latest data including emergency contacts
  useEffect(() => {
    if (accessToken) {
      fetchUserProfile(accessToken, true); // Skip auth reset to prevent redirect
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]); // Only depend on accessToken to avoid infinite loops

  useEffect(() => {
    if (user) {
      const formData: ProfileFormData = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
        address: user.address || '',
        blood_group: user.blood_group || '',
        genotype: user.genotype || '',
        allergies: user.allergies || '',
        chronic_conditions: user.chronic_conditions || '',
        weight: user.weight || undefined,
        height: user.height || undefined,
        medical_history_summary: user.medical_history_summary || '',
      };
      reset(formData);
    }
  }, [user, reset]);

  // Fetch emergency contacts if not in user object
  useEffect(() => {
    const fetchContacts = async () => {
      // If user has emergency_contacts in the user object, use those
      if (user?.emergency_contacts && Array.isArray(user.emergency_contacts) && user.emergency_contacts.length > 0) {
        setEmergencyContacts(user.emergency_contacts);
        return;
      }
      
      // Otherwise, fetch them directly (always fetch to ensure we have the latest data)
      if (accessToken) {
        setLoadingContacts(true);
        try {
          const response = await getUserEmergencyContacts();
          if (response && Array.isArray(response.results)) {
            setEmergencyContacts(response.results);
          } else {
            setEmergencyContacts([]);
          }
        } catch (error) {
          console.error('Failed to fetch emergency contacts:', error);
          setEmergencyContacts([]);
        } finally {
          setLoadingContacts(false);
        }
      }
    };

    fetchContacts();
  }, [user, accessToken]);

  // Refresh profile when emergency contacts tab is selected
  const handleTabChange = async (index: number) => {
    setSelectedTab(index);
    // If emergency contacts tab (index 2) is selected, refresh user profile and fetch contacts
    if (index === 2 && accessToken) {
      fetchUserProfile(accessToken, true); // Skip auth reset to prevent redirect
      // Also fetch contacts directly to ensure we have the latest data
      setLoadingContacts(true);
      try {
        const response = await getUserEmergencyContacts();
        if (response && Array.isArray(response.results)) {
          setEmergencyContacts(response.results);
        }
      } catch (error) {
        console.error('Failed to fetch emergency contacts:', error);
      } finally {
        setLoadingContacts(false);
      }
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB. Please compress or resize your image.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Warn for large files (over 2MB) but allow upload
    if (file.size > 2 * 1024 * 1024) {
      toast.loading('Uploading large image, please wait...', { duration: 2000 });
    }

    setIsUploadingPicture(true);
    try {
      // Upload to user profile
      await uploadProfilePicture(file);
      
      // If user is a doctor, also update the doctor profile picture
      if (user?.is_doctor && user?.doctor_id) {
        try {
          await updateDoctorApplication({ profile_picture: file });
        } catch (doctorError) {
          // Log but don't fail the entire operation if doctor update fails
          console.warn('Failed to update doctor profile picture:', doctorError);
        }
      }
      
      if (accessToken) {
        await fetchUserProfile(accessToken, true);
      }
      toast.success('Profile picture updated successfully!');
    } catch (error: unknown) {
      console.error('Failed to upload profile picture:', error);
      let errorMessage = 'Failed to upload profile picture';
      
      // Handle timeout errors
      if ((error as { code?: string; message?: string })?.code === 'ECONNABORTED' || 
          (error as { message?: string })?.message?.includes('timeout')) {
        errorMessage = 'Upload timed out. The file may be too large or your connection is slow. Please try again with a smaller image.';
      } else {
        // Handle other API errors
        const apiError = error as { response?: { data?: { detail?: string; profile_picture?: string[] } } };
        errorMessage = apiError?.response?.data?.detail 
          || apiError?.response?.data?.profile_picture?.[0] 
          || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload: UserProfileUpdatePayload = {
        ...data,
        weight: data.weight ? Number(data.weight) : null,
        height: data.height ? Number(data.height) : null,
      };
      await axiosInstance.patch('/users/profile/', payload);
      if (accessToken) {
        await fetchUserProfile(accessToken, true); // Skip auth reset to prevent redirect
      }
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile.');
    }
  };

  if (authLoading && !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-48 w-full rounded-3xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
            <div className="md:col-span-2">
                <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 pt-20 pb-20 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50" />
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"
            />
            <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"
            />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center md:items-end gap-6"
            >
                {/* Avatar */}
                <div className="relative group">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center relative z-10"
                    >
                        {user?.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <UserCircleIcon className="h-24 w-24 text-gray-400" />
                            </div>
                        )}
                        {isUploadingPicture && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                            </div>
                        )}
                    </motion.div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                    />
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleProfilePictureClick}
                        disabled={isUploadingPicture}
                        className="absolute bottom-2 right-2 z-20 p-2.5 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Change profile picture"
                        aria-label="Change profile picture"
                    >
                        <CameraIcon className="h-5 w-5" />
                    </motion.button>
                </div>

                {/* Info */}
                <div className="flex-1 pb-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h1 className="text-3xl md:text-4xl font-black text-white">{user?.first_name} {user?.last_name}</h1>
                        <CheckBadgeIcon className="h-6 w-6 text-blue-400" title="Verified User" />
                    </div>
                    <p className="text-gray-300 font-medium text-lg mb-4">@{user?.username}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                        <span className="flex items-center px-3 py-1 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/10">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-300" /> {user?.email}
                        </span>
                        {user?.phone_number && (
                            <span className="flex items-center px-3 py-1 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/10">
                                <PhoneIcon className="h-4 w-4 mr-2 text-gray-300" /> {user.phone_number}
                            </span>
                        )}
                        {user?.address && (
                            <span className="flex items-center px-3 py-1 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/10">
                                <MapPinIcon className="h-4 w-4 mr-2 text-gray-300" /> {user.address}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="pb-4 w-full md:w-auto">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditing(!isEditing)}
                        className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                            isEditing 
                            ? 'bg-white text-gray-900 hover:bg-gray-50' 
                            : 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:shadow-primary/30'
                        }`}
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                        {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                    </motion.button>
                </div>
            </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Quick Stats */}
            <div className="lg:col-span-1 space-y-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50" />
                    <h3 className="font-black text-gray-900 mb-6 flex items-center relative z-10">
                        <div className="p-2 bg-red-100 rounded-lg mr-3">
                            <HeartIcon className="h-5 w-5 text-red-600" />
                        </div>
                        Health Summary
                    </h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm font-medium text-gray-500">Blood Group</span>
                            <span className="font-bold text-gray-900">{user?.blood_group || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm font-medium text-gray-500">Genotype</span>
                            <span className="font-bold text-gray-900">{user?.genotype || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm font-medium text-gray-500">Weight</span>
                            <span className="font-bold text-gray-900">{user?.weight ? `${user.weight} kg` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm font-medium text-gray-500">Height</span>
                            <span className="font-bold text-gray-900">{user?.height ? `${user.height} cm` : 'N/A'}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6"
                >
                    <h3 className="font-black text-gray-900 mb-6 flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                            <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        Quick Links
                    </h3>
                    <div className="space-y-3">
                        <Link 
                            to="/emergency-contacts"
                            className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-2xl hover:bg-orange-100 transition-all group"
                        >
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm mr-3">
                                    <LifebuoyIcon className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Emergency Contacts</p>
                                    <p className="text-xs text-gray-500">
                                        {emergencyContacts.length > 0 
                                            ? `${emergencyContacts.length} contact${emergencyContacts.length !== 1 ? 's' : ''}`
                                            : 'Add contacts'
                                        }
                                    </p>
                                </div>
                            </div>
                            <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                        </Link>
                        <Link 
                            to="/insurance"
                            className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all group"
                        >
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm mr-3">
                                    <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Insurance</p>
                                    <p className="text-xs text-gray-500">Manage coverage</p>
                                </div>
                            </div>
                            <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </Link>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                    <h3 className="font-bold text-lg mb-2 flex items-center relative z-10">
                        <SparklesIcon className="h-5 w-5 mr-2 text-yellow-300" />
                        Account Status
                    </h3>
                    <p className="text-indigo-100 text-sm mb-6 relative z-10">Your account is fully verified and active. You have full access to all standard features.</p>
                    <div className="flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur-sm p-3 rounded-xl inline-flex relative z-10">
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                        Active Member
                    </div>
                </motion.div>
            </div>

            {/* Main Content - Tabs */}
            <div className="lg:col-span-2">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                >
                    <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
                        <Tab.List className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto p-2 gap-2">
                            {['Personal Information', 'Medical Details', 'Emergency Contacts', 'Account'].map((category) => (
                                <Tab
                                    key={category}
                                    className={({ selected }) =>
                                        classNames(
                                            'flex-shrink-0 px-4 py-3 text-sm font-bold rounded-xl focus:outline-none transition-all',
                                            selected
                                                ? 'bg-white text-primary shadow-md'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                                        )
                                    }
                                >
                                    {category}
                                </Tab>
                            ))}
                        </Tab.List>
                        <Tab.Panels className="p-6 md:p-8">
                            <form onSubmit={
                              // @ts-expect-error - Type compatibility issue between handleSubmit and form data types
                              handleSubmit(onSubmit)
                            }>
                                <AnimatePresence mode="wait">
                                    {/* Personal Info Panel */}
                                    <Tab.Panel key="Personal Information" as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 focus:outline-none">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormInput
                                                name="first_name"
                                                label="First Name"
                                                register={register}
                                                errors={errors}
                                                disabled={!isEditing || isSubmitting}
                                            />
                                            <FormInput
                                                name="last_name"
                                                label="Last Name"
                                                register={register}
                                                errors={errors}
                                                disabled={!isEditing || isSubmitting}
                                            />
                                            <FormInput
                                                name="phone_number"
                                                label="Phone Number"
                                                register={register}
                                                errors={errors}
                                                disabled={!isEditing || isSubmitting}
                                            />
                                            <FormInput
                                                name="date_of_birth"
                                                label="Date of Birth"
                                                type="date"
                                                register={register}
                                                errors={errors}
                                                disabled={!isEditing || isSubmitting}
                                            />
                                            <div className="md:col-span-2">
                                                <FormInput
                                                name="address"
                                                label="Address"
                                                register={register}
                                                errors={errors}
                                                disabled={!isEditing || isSubmitting}
                                                />
                                            </div>
                                        </div>
                                    </Tab.Panel>

                                    {/* Medical Details Panel */}
                                    <Tab.Panel key="Medical Details" as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 focus:outline-none">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormInput
                                                name="blood_group"
                                                label="Blood Group"
                                                register={register}
                                                errors={errors}
                                                disabled={!isEditing || isSubmitting}
                                                placeholder="e.g. O+"
                                            />
                                            <FormInput
                                                name="genotype"
                                                label="Genotype"
                                                register={register}
                                                errors={errors}
                                                disabled={!isEditing || isSubmitting}
                                                placeholder="e.g. AA"
                                            />
                                            <FormInput
                                                name="weight"
                                                label="Weight (kg)"
                                                type="number"
                                                register={register}
                                                errors={errors}
                                                disabled={!isEditing || isSubmitting}
                                            />
                                            <FormInput
                                                name="height"
                                                label="Height (cm)"
                                                type="number"
                                                register={register}
                                                errors={errors}
                                                disabled={!isEditing || isSubmitting}
                                            />
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Allergies</label>
                                                <textarea 
                                                    {...register('allergies')}
                                                    disabled={!isEditing || isSubmitting}
                                                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                                    rows={3}
                                                    placeholder="List any known allergies..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Chronic Conditions</label>
                                                <textarea 
                                                    {...register('chronic_conditions')}
                                                    disabled={!isEditing || isSubmitting}
                                                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                                    rows={3}
                                                    placeholder="List any chronic conditions..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Medical History Summary</label>
                                                <textarea 
                                                    {...register('medical_history_summary')}
                                                    disabled={!isEditing || isSubmitting}
                                                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                                    rows={4}
                                                    placeholder="Brief summary of medical history..."
                                                />
                                            </div>
                                        </div>
                                    </Tab.Panel>

                                    {/* Emergency Contacts Panel */}
                                    <Tab.Panel key="Emergency Contacts" as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 focus:outline-none">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900">Emergency Contacts</h3>
                                                <p className="text-sm text-gray-500 mt-1">Manage your emergency contact information</p>
                                            </div>
                                            <Link 
                                                to="/emergency-contacts"
                                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-orange-500/30"
                                            >
                                                <PlusIcon className="h-4 w-4 mr-2" />
                                                Add New Contact
                                            </Link>
                                        </div>

                                        {loadingContacts ? (
                                            <div className="text-center py-12">
                                                <p className="text-gray-500">Loading emergency contacts...</p>
                                            </div>
                                        ) : emergencyContacts.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {emergencyContacts.map((contact) => (
                                                    <motion.div 
                                                        whileHover={{ y: -2 }}
                                                        key={contact.id} 
                                                        className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 group"
                                                    >
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/30">
                                                                    {contact.name?.charAt(0).toUpperCase() || '?'}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900">{contact.name || 'Unnamed Contact'}</h4>
                                                                    <p className="text-sm text-gray-500 capitalize font-medium">{contact.relationship || 'Contact'}</p>
                                                                </div>
                                                            </div>
                                                            {contact.is_primary && (
                                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-bold uppercase tracking-wide">
                                                                    Primary
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3 pt-2 border-t border-gray-50">
                                                            {contact.phone_number && (
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <div className="p-1.5 bg-gray-50 rounded-lg mr-2 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                                                        <PhoneIcon className="h-4 w-4" />
                                                                    </div>
                                                                    <a href={`tel:${contact.phone_number}`} className="hover:text-orange-600 font-medium truncate transition-colors">
                                                                        {contact.phone_number}
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {contact.email && (
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <div className="p-1.5 bg-gray-50 rounded-lg mr-2 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                                                        <EnvelopeIcon className="h-4 w-4" />
                                                                    </div>
                                                                    <a href={`mailto:${contact.email}`} className="hover:text-orange-600 font-medium truncate transition-colors">
                                                                        {contact.email}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <LifebuoyIcon className="h-8 w-8 text-gray-300" />
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900 mb-2">No Emergency Contacts Yet</h4>
                                                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                                    Add emergency contacts so we can reach them quickly in case of an emergency.
                                                </p>
                                                <Link 
                                                    to="/emergency-contacts"
                                                    className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 hover:border-orange-500 hover:text-orange-600 text-gray-700 font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                                                >
                                                    <PlusIcon className="h-5 w-5 mr-2" />
                                                    Add Your First Contact
                                                </Link>
                                            </div>
                                        )}

                                        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                            <div className="flex items-start gap-3">
                                                <LifebuoyIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm text-blue-800">
                                                    <p className="font-bold mb-1">Why add emergency contacts?</p>
                                                    <p className="text-blue-700/80 leading-relaxed">
                                                        In case of a medical emergency, we'll notify your emergency contacts with your location and status. 
                                                        Mark one as "Primary" for priority notifications.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Tab.Panel>

                                    {/* Account Panel */}
                                    <Tab.Panel key="Account" as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 focus:outline-none">
                                        <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-2xl text-yellow-800">
                                            <strong className="block mb-2 text-lg font-bold flex items-center gap-2">
                                                <ShieldCheckIcon className="h-5 w-5" />
                                                Account Security
                                            </strong>
                                            <p className="text-yellow-700/80">Change password and security settings functionality coming soon.</p>
                                        </div>
                                        {/* Add notification toggles here later */}
                                    </Tab.Panel>
                                </AnimatePresence>

                                {isEditing && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-100"
                                    >
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                reset();
                                                setIsEditing(false);
                                            }}
                                            className="px-6 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary to-emerald-600 rounded-xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 flex items-center gap-2 transition-all"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </form>
                        </Tab.Panels>
                    </Tab.Group>
                </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
