import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../contexts/AuthContext';
import { profileSchema, ProfileFormData } from '../../../schemas/userSchema';
import FormInput from '../../../components/forms/FormInput';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { UserProfileUpdatePayload } from '../../../types/user';
import Skeleton from '../../../components/ui/Skeleton';
import { 
    UserCircleIcon, 
    HeartIcon, 
    ShieldCheckIcon, 
    CameraIcon,
    PencilSquareIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const ProfilePage: React.FC = () => {
  const { user, fetchUserProfile, accessToken, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
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
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload: UserProfileUpdatePayload = {
        ...data,
        weight: data.weight ? Number(data.weight) : null,
        height: data.height ? Number(data.height) : null,
      };
      await axiosInstance.patch('/users/profile/', payload);
      if (accessToken) {
        await fetchUserProfile(accessToken);
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
        <Skeleton className="h-48 w-full rounded-xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="md:col-span-2">
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Cover Image & Header */}
      <div className="h-48 w-full bg-gradient-to-r from-primary-dark to-primary relative">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-end md:items-end gap-6 mb-8">
            {/* Avatar */}
            <div className="relative group">
                <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                    {user?.profile_picture ? (
                        <img src={user.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <UserCircleIcon className="h-24 w-24 text-gray-300" />
                    )}
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-colors">
                    <CameraIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Info */}
            <div className="flex-1 pb-2 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{user?.first_name} {user?.last_name}</h1>
                <p className="text-gray-500 font-medium">@{user?.username}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center"><EnvelopeIcon className="h-4 w-4 mr-1.5 text-gray-400" /> {user?.email}</span>
                    {user?.phone_number && <span className="flex items-center"><PhoneIcon className="h-4 w-4 mr-1.5 text-gray-400" /> {user.phone_number}</span>}
                    {user?.address && <span className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" /> {user.address}</span>}
                </div>
            </div>

            {/* Actions */}
            <div className="pb-4">
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 ${
                        isEditing 
                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' 
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                >
                    <PencilSquareIcon className="h-4 w-4" />
                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Quick Stats */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
                        Health Summary
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Blood Group</span>
                            <span className="font-semibold text-gray-900">{user?.blood_group || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Genotype</span>
                            <span className="font-semibold text-gray-900">{user?.genotype || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Weight</span>
                            <span className="font-semibold text-gray-900">{user?.weight ? `${user.weight} kg` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">Height</span>
                            <span className="font-semibold text-gray-900">{user?.height ? `${user.height} cm` : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="font-bold text-lg mb-2 flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 mr-2" />
                        Account Status
                    </h3>
                    <p className="text-indigo-100 text-sm mb-4">Your account is verified and active.</p>
                    <div className="flex items-center gap-2 text-xs font-medium bg-white/10 p-2 rounded-lg">
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                        Active Member
                    </div>
                </div>
            </div>

            {/* Main Content - Tabs */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Tab.Group>
                        <Tab.List className="flex border-b border-gray-200 bg-gray-50/50">
                            {['Personal Information', 'Medical Details', 'Account'].map((category) => (
                                <Tab
                                    key={category}
                                    className={({ selected }) =>
                                        classNames(
                                            'w-full py-4 text-sm font-medium leading-5 focus:outline-none transition-colors border-b-2',
                                            selected
                                                ? 'text-primary border-primary bg-white'
                                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
                                        )
                                    }
                                >
                                    {category}
                                </Tab>
                            ))}
                        </Tab.List>
                        <Tab.Panels className="p-6">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Personal Info Panel */}
                                <Tab.Panel className="space-y-6 focus:outline-none">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput
                                            name="first_name"
                                            label="First Name"
                                            register={register}
                                            errors={errors}
                                            disabled={!isEditing || isSubmitting}
                                            icon={<UserCircleIcon className="h-5 w-5 text-gray-400" />}
                                        />
                                        <FormInput
                                            name="last_name"
                                            label="Last Name"
                                            register={register}
                                            errors={errors}
                                            disabled={!isEditing || isSubmitting}
                                            icon={<UserCircleIcon className="h-5 w-5 text-gray-400" />}
                                        />
                                        <FormInput
                                            name="phone_number"
                                            label="Phone Number"
                                            register={register}
                                            errors={errors}
                                            disabled={!isEditing || isSubmitting}
                                            icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
                                        />
                                        <FormInput
                                            name="date_of_birth"
                                            label="Date of Birth"
                                            type="date"
                                            register={register}
                                            errors={errors}
                                            disabled={!isEditing || isSubmitting}
                                            icon={<CalendarIcon className="h-5 w-5 text-gray-400" />}
                                        />
                                        <div className="md:col-span-2">
                                            <FormInput
                                                name="address"
                                                label="Address"
                                                register={register}
                                                errors={errors}
                                                disabled={!isEditing || isSubmitting}
                                                icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
                                            />
                                        </div>
                                    </div>
                                </Tab.Panel>

                                {/* Medical Details Panel */}
                                <Tab.Panel className="space-y-6 focus:outline-none">
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
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                                            <textarea 
                                                {...register('allergies')}
                                                disabled={!isEditing || isSubmitting}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500"
                                                rows={3}
                                                placeholder="List any known allergies..."
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
                                            <textarea 
                                                {...register('chronic_conditions')}
                                                disabled={!isEditing || isSubmitting}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500"
                                                rows={3}
                                                placeholder="List any chronic conditions..."
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical History Summary</label>
                                            <textarea 
                                                {...register('medical_history_summary')}
                                                disabled={!isEditing || isSubmitting}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500"
                                                rows={4}
                                                placeholder="Brief summary of medical history..."
                                            />
                                        </div>
                                    </div>
                                </Tab.Panel>

                                {/* Account Panel */}
                                <Tab.Panel className="space-y-6 focus:outline-none">
                                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 text-sm">
                                        <strong className="block mb-1">Account Security</strong>
                                        Change password and security settings functionality coming soon.
                                    </div>
                                    {/* Add notification toggles here later */}
                                </Tab.Panel>

                                {isEditing && (
                                    <div className="mt-8 flex justify-end gap-4 pt-4 border-t border-gray-100">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                reset();
                                                setIsEditing(false);
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark shadow-sm disabled:opacity-50 flex items-center gap-2"
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
                                    </div>
                                )}
                            </form>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
