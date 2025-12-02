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
import { getUserEmergencyContacts } from '../../../api/emergencyContacts';
import { EmergencyContact } from '../../../types/user';
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
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import { Link } from 'react-router-dom';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const ProfilePage: React.FC = () => {
  const { user, fetchUserProfile, accessToken, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
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
      <div className="h-48 w-full bg-gradient-to-r from-primary-dark to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
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

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 text-indigo-500 mr-2" />
                        Quick Links
                    </h3>
                    <div className="space-y-3">
                        <Link 
                            to="/emergency-contacts"
                            className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors group"
                        >
                            <div className="flex items-center">
                                <LifebuoyIcon className="h-5 w-5 text-orange-600 mr-3" />
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Emergency Contacts</p>
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
                            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors group"
                        >
                            <div className="flex items-center">
                                <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-3" />
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Insurance</p>
                                    <p className="text-xs text-gray-500">Manage coverage</p>
                                </div>
                            </div>
                            <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </Link>
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
                    <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
                        <Tab.List className="flex border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
                            {['Personal Information', 'Medical Details', 'Emergency Contacts', 'Account'].map((category) => (
                                <Tab
                                    key={category}
                                    className={({ selected }) =>
                                        classNames(
                                            'flex-shrink-0 px-4 py-4 text-sm font-medium leading-5 focus:outline-none transition-colors border-b-2 whitespace-nowrap',
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

                                {/* Emergency Contacts Panel */}
                                <Tab.Panel className="space-y-6 focus:outline-none">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Emergency Contacts</h3>
                                            <p className="text-sm text-gray-500 mt-1">Manage your emergency contact information</p>
                                        </div>
                                        <Link 
                                            to="/emergency-contacts"
                                            className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
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
                                                <div 
                                                    key={contact.id} 
                                                    className="p-5 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                                {contact.name?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900">{contact.name || 'Unnamed Contact'}</h4>
                                                                <p className="text-sm text-gray-600 capitalize">{contact.relationship || 'Contact'}</p>
                                                            </div>
                                                        </div>
                                                        {contact.is_primary && (
                                                            <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full font-medium shadow-sm">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2 mt-4">
                                                        {contact.phone_number && (
                                                            <div className="flex items-center text-sm text-gray-700">
                                                                <PhoneIcon className="h-4 w-4 mr-2 text-orange-600 flex-shrink-0" />
                                                                <a href={`tel:${contact.phone_number}`} className="hover:text-orange-600 font-medium truncate">
                                                                    {contact.phone_number}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {contact.alternative_phone && (
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                                <span className="truncate">Alt: {contact.alternative_phone}</span>
                                                            </div>
                                                        )}
                                                        {contact.email && (
                                                            <div className="flex items-center text-sm text-gray-700">
                                                                <EnvelopeIcon className="h-4 w-4 mr-2 text-orange-600 flex-shrink-0" />
                                                                <a href={`mailto:${contact.email}`} className="hover:text-orange-600 truncate">
                                                                    {contact.email}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {contact.address && (
                                                            <div className="flex items-start text-sm text-gray-700">
                                                                <MapPinIcon className="h-4 w-4 mr-2 text-orange-600 mt-0.5 flex-shrink-0" />
                                                                <span className="line-clamp-2">{contact.address}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <LifebuoyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Emergency Contacts Yet</h4>
                                            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                                Add emergency contacts so we can reach them quickly in case of an emergency.
                                            </p>
                                            <Link 
                                                to="/emergency-contacts"
                                                className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                                            >
                                                <PlusIcon className="h-5 w-5 mr-2" />
                                                Add Your First Contact
                                            </Link>
                                        </div>
                                    )}

                                    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <LifebuoyIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-semibold mb-1">Why add emergency contacts?</p>
                                                <p className="text-blue-700">
                                                    In case of a medical emergency, we'll notify your emergency contacts with your location and status. 
                                                    Mark one as "Primary" for priority notifications.
                                                </p>
                                            </div>
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
