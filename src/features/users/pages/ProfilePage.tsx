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
    <div className="min-h-screen bg-cream-50 pb-12">
      {/* Hero Section */}
      <div className="bg-primary-900 pt-20 pb-24 md:pb-32 rounded-b-[3rem] border-b-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center md:items-end gap-8"
            >
                {/* Avatar */}
                <div className="relative group">
                    <motion.div 
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center relative z-10"
                    >
                        {user?.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-cream-50 flex items-center justify-center">
                                <UserCircleIcon className="h-24 w-24 text-gray-400" />
                            </div>
                        )}
                        {isUploadingPicture && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
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
                        className="absolute bottom-0 right-0 z-20 p-3 bg-yellow-400 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black text-black hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Change profile picture"
                        aria-label="Change profile picture"
                    >
                        <CameraIcon className="h-5 w-5" />
                    </motion.button>
                </div>

                {/* Info */}
                <div className="flex-1 pb-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h1 className="text-4xl md:text-5xl font-black text-white font-display tracking-tight">{user?.first_name} {user?.last_name}</h1>
                        <div className="bg-blue-400 p-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <CheckBadgeIcon className="h-5 w-5 text-white" title="Verified User" />
                        </div>
                    </div>
                    <p className="text-yellow-400 font-bold text-xl mb-6 font-display">@{user?.username}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                        <span className="flex items-center px-4 py-2 rounded-xl bg-white text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                            <EnvelopeIcon className="h-4 w-4 mr-2" /> {user?.email}
                        </span>
                        {user?.phone_number && (
                            <span className="flex items-center px-4 py-2 rounded-xl bg-white text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                                <PhoneIcon className="h-4 w-4 mr-2" /> {user.phone_number}
                            </span>
                        )}
                        {user?.address && (
                            <span className="flex items-center px-4 py-2 rounded-xl bg-white text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                                <MapPinIcon className="h-4 w-4 mr-2" /> {user.address}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="pb-4 w-full md:w-auto">
                    <motion.button 
                        whileHover={{ scale: 1.02, rotate: 1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditing(!isEditing)}
                        className={`w-full md:w-auto px-8 py-4 rounded-xl font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 ${
                            isEditing 
                            ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1' 
                            : 'bg-yellow-400 text-black hover:bg-yellow-500 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
                        }`}
                    >
                        <PencilSquareIcon className="h-6 w-6" />
                        {isEditing ? 'CANCEL EDITING' : 'EDIT PROFILE'}
                    </motion.button>
                </div>
            </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Quick Stats */}
            <div className="lg:col-span-1 space-y-8">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8 relative overflow-hidden"
                >
                    <h3 className="text-2xl font-black text-black font-display uppercase tracking-tight mb-8 flex items-center relative z-10">
                        <div className="p-3 bg-red-100 rounded-xl border-2 border-black mr-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <HeartIcon className="h-6 w-6 text-red-600" />
                        </div>
                        Health Summary
                    </h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                            <span className="text-sm font-black text-gray-500 uppercase tracking-wide">Blood Group</span>
                            <span className="text-xl font-black text-black">{user?.blood_group || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                            <span className="text-sm font-black text-gray-500 uppercase tracking-wide">Genotype</span>
                            <span className="text-xl font-black text-black">{user?.genotype || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                            <span className="text-sm font-black text-gray-500 uppercase tracking-wide">Weight</span>
                            <span className="text-xl font-black text-black">{user?.weight ? `${user.weight} kg` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                            <span className="text-sm font-black text-gray-500 uppercase tracking-wide">Height</span>
                            <span className="text-xl font-black text-black">{user?.height ? `${user.height} cm` : 'N/A'}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8"
                >
                    <h3 className="text-2xl font-black text-black font-display uppercase tracking-tight mb-8 flex items-center">
                        <div className="p-3 bg-indigo-100 rounded-xl border-2 border-black mr-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <ShieldCheckIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        Quick Links
                    </h3>
                    <div className="space-y-4">
                        <Link 
                            to="/emergency-contacts"
                            className="flex items-center justify-between p-5 bg-orange-50 border-2 border-black rounded-2xl hover:bg-orange-100 transition-all group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                        >
                            <div className="flex items-center">
                                <div className="h-12 w-12 bg-white rounded-xl border-2 border-black flex items-center justify-center mr-4">
                                    <LifebuoyIcon className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-black text-black uppercase tracking-wide text-sm">Emergency Contacts</p>
                                    <p className="text-xs font-bold text-gray-600 mt-1">
                                        {emergencyContacts.length > 0 
                                            ? `${emergencyContacts.length} contact${emergencyContacts.length !== 1 ? 's' : ''}`
                                            : 'Add contacts'
                                        }
                                    </p>
                                </div>
                            </div>
                            <ArrowRightIcon className="h-5 w-5 text-black transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            to="/insurance"
                            className="flex items-center justify-between p-5 bg-blue-50 border-2 border-black rounded-2xl hover:bg-blue-100 transition-all group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                        >
                            <div className="flex items-center">
                                <div className="h-12 w-12 bg-white rounded-xl border-2 border-black flex items-center justify-center mr-4">
                                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-black text-black uppercase tracking-wide text-sm">Insurance</p>
                                    <p className="text-xs font-bold text-gray-600 mt-1">Manage coverage</p>
                                </div>
                            </div>
                            <ArrowRightIcon className="h-5 w-5 text-black transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-primary-900 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8 relative overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFF_2px,transparent_2px)] [background-size:24px_24px]"></div>
                    <h3 className="text-xl font-black text-white font-display uppercase tracking-tight mb-4 flex items-center relative z-10">
                        <SparklesIcon className="h-6 w-6 mr-3 text-yellow-400" />
                        Account Status
                    </h3>
                    <p className="text-white/90 text-sm font-bold mb-6 relative z-10 leading-relaxed border-l-4 border-yellow-400 pl-4">
                        Your account is fully verified and active. You have full access to all standard features.
                    </p>
                    <div className="flex items-center gap-3 text-sm font-black text-black bg-yellow-400 px-4 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-flex relative z-10">
                        <div className="h-3 w-3 bg-green-500 rounded-full border border-black animate-pulse"></div>
                        ACTIVE MEMBER
                    </div>
                </motion.div>
            </div>

            {/* Main Content - Tabs */}
            <div className="lg:col-span-2">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden"
                >
                    <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
                        <Tab.List className="flex border-b-4 border-black bg-gray-50 overflow-x-auto p-4 gap-4">
                            {['Personal Information', 'Medical Details', 'Emergency Contacts', 'Account'].map((category) => (
                                <Tab
                                    key={category}
                                    className={({ selected }) =>
                                        classNames(
                                            'flex-shrink-0 px-6 py-3 text-sm font-black uppercase tracking-wide rounded-xl border-2 border-black transition-all outline-none',
                                            selected
                                                ? 'bg-primary-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                                                : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
                                        )
                                    }
                                >
                                    {category}
                                </Tab>
                            ))}
                        </Tab.List>
                        <Tab.Panels className="p-8 md:p-10">
                            <form onSubmit={
                              // @ts-expect-error - Type compatibility issue between handleSubmit and form data types
                              handleSubmit(onSubmit)
                            }>
                                <AnimatePresence mode="wait">
                                    {/* Personal Info Panel */}
                                    <Tab.Panel key="Personal Information" as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 focus:outline-none">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                    <Tab.Panel key="Medical Details" as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 focus:outline-none">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                                <label className="block text-sm font-black text-black uppercase tracking-wide mb-3">Allergies</label>
                                                <textarea 
                                                    {...register('allergies')}
                                                    disabled={!isEditing || isSubmitting}
                                                    className="w-full rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-0 focus:border-black focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all p-4 disabled:bg-gray-100 disabled:text-gray-500 font-bold"
                                                    rows={3}
                                                    placeholder="List any known allergies..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-black text-black uppercase tracking-wide mb-3">Chronic Conditions</label>
                                                <textarea 
                                                    {...register('chronic_conditions')}
                                                    disabled={!isEditing || isSubmitting}
                                                    className="w-full rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-0 focus:border-black focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all p-4 disabled:bg-gray-100 disabled:text-gray-500 font-bold"
                                                    rows={3}
                                                    placeholder="List any chronic conditions..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-black text-black uppercase tracking-wide mb-3">Medical History Summary</label>
                                                <textarea 
                                                    {...register('medical_history_summary')}
                                                    disabled={!isEditing || isSubmitting}
                                                    className="w-full rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-0 focus:border-black focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all p-4 disabled:bg-gray-100 disabled:text-gray-500 font-bold"
                                                    rows={4}
                                                    placeholder="Brief summary of medical history..."
                                                />
                                            </div>
                                        </div>
                                    </Tab.Panel>

                                    {/* Emergency Contacts Panel */}
                                    <Tab.Panel key="Emergency Contacts" as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 focus:outline-none">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-2xl font-black text-black font-display uppercase tracking-tight">Emergency Contacts</h3>
                                                <p className="text-base font-bold text-gray-600 mt-2">Manage your emergency contact information</p>
                                            </div>
                                            <Link 
                                                to="/emergency-contacts"
                                                className="inline-flex items-center px-6 py-3 bg-red-500 text-white text-sm font-black uppercase tracking-wide rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
                                            >
                                                <PlusIcon className="h-5 w-5 mr-2" />
                                                Add New Contact
                                            </Link>
                                        </div>

                                        {loadingContacts ? (
                                            <div className="text-center py-12">
                                                <p className="font-bold text-gray-500">Loading emergency contacts...</p>
                                            </div>
                                        ) : emergencyContacts.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {emergencyContacts.map((contact) => (
                                                    <motion.div 
                                                        whileHover={{ scale: 1.02, rotate: 1 }}
                                                        key={contact.id} 
                                                        className="p-6 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group"
                                                    >
                                                        <div className="flex items-start justify-between mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-14 w-14 rounded-xl border-2 border-black bg-orange-100 flex items-center justify-center text-orange-900 font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                                    {contact.name?.charAt(0).toUpperCase() || '?'}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-black text-black uppercase">{contact.name || 'Unnamed Contact'}</h4>
                                                                    <p className="text-sm text-gray-600 font-bold uppercase tracking-wide">{contact.relationship || 'Contact'}</p>
                                                                </div>
                                                            </div>
                                                            {contact.is_primary && (
                                                                <span className="px-3 py-1 bg-yellow-400 text-black border-2 border-black text-xs rounded-lg font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                                    Primary
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3 pt-4 border-t-2 border-black border-dashed">
                                                            {contact.phone_number && (
                                                                <div className="flex items-center text-sm font-bold text-gray-700">
                                                                    <div className="p-2 bg-gray-100 rounded-lg border-2 border-black mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                                        <PhoneIcon className="h-4 w-4" />
                                                                    </div>
                                                                    <a href={`tel:${contact.phone_number}`} className="hover:text-primary transition-colors">
                                                                        {contact.phone_number}
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {contact.email && (
                                                                <div className="flex items-center text-sm font-bold text-gray-700">
                                                                    <div className="p-2 bg-gray-100 rounded-lg border-2 border-black mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                                        <EnvelopeIcon className="h-4 w-4" />
                                                                    </div>
                                                                    <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">
                                                                        {contact.email}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-16 bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                                <div className="h-20 w-20 bg-gray-100 rounded-2xl border-2 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                    <LifebuoyIcon className="h-10 w-10 text-gray-400" />
                                                </div>
                                                <h4 className="text-2xl font-black text-black mb-3 font-display uppercase">No Emergency Contacts Yet</h4>
                                                <p className="text-gray-600 font-bold mb-8 max-w-md mx-auto">
                                                    Add emergency contacts so we can reach them quickly in case of an emergency.
                                                </p>
                                                <Link 
                                                    to="/emergency-contacts"
                                                    className="inline-flex items-center px-8 py-4 bg-white border-2 border-black text-black font-black uppercase tracking-wide rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                                                >
                                                    <PlusIcon className="h-6 w-6 mr-2" />
                                                    Add Your First Contact
                                                </Link>
                                            </div>
                                        )}

                                        <div className="mt-8 p-6 bg-blue-100 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <div className="flex items-start gap-4">
                                                <LifebuoyIcon className="h-8 w-8 text-blue-900 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm text-blue-900">
                                                    <p className="font-black uppercase tracking-wide mb-2 text-lg">Why add emergency contacts?</p>
                                                    <p className="font-bold leading-relaxed opacity-90">
                                                        In case of a medical emergency, we'll notify your emergency contacts with your location and status. 
                                                        Mark one as "Primary" for priority notifications.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Tab.Panel>

                                    {/* Account Panel */}
                                    <Tab.Panel key="Account" as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 focus:outline-none">
                                        <div className="p-8 bg-yellow-100 border-2 border-black rounded-2xl text-yellow-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <strong className="block mb-4 text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                                <ShieldCheckIcon className="h-8 w-8" />
                                                Account Security
                                            </strong>
                                            <p className="font-bold opacity-90 text-lg">Change password and security settings functionality coming soon.</p>
                                        </div>
                                    </Tab.Panel>
                                </AnimatePresence>

                                {isEditing && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-10 flex justify-end gap-6 pt-8 border-t-4 border-black border-dashed"
                                    >
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                reset();
                                                setIsEditing(false);
                                            }}
                                            className="px-8 py-4 text-base font-black uppercase tracking-wide text-black bg-white border-2 border-black rounded-xl hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-10 py-4 text-base font-black uppercase tracking-wide text-white bg-primary-900 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></span>
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
