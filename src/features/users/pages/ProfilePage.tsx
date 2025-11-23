// src/features/users/pages/ProfilePage.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../contexts/AuthContext';
import { profileSchema, ProfileFormData } from '../../../schemas/userSchema';
import FormInput from '../../../components/forms/FormInput';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { UserProfileUpdatePayload } from '../../../types/user';
import Skeleton from '../../../components/ui/Skeleton';

const ProfilePage: React.FC = () => {
  const { user, fetchUserProfile, accessToken, loading: authLoading } = useAuth();
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
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile.');
    }
  };

  if (authLoading && !user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          <Skeleton className="h-8 w-48" />
        </h1>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-20" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="first_name"
            label="First Name"
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />
          <FormInput
            name="last_name"
            label="Last Name"
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="phone_number"
            label="Phone Number"
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />
          <FormInput
            name="date_of_birth"
            label="Date of Birth"
            type="date"
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />
        </div>
        <FormInput
          name="address"
          label="Address"
          register={register}
          errors={errors}
          disabled={isSubmitting}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="blood_group"
            label="Blood Group"
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />
          <FormInput
            name="genotype"
            label="Genotype"
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="weight"
            label="Weight (kg)"
            type="number"
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />
          <FormInput
            name="height"
            label="Height (cm)"
            type="number"
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />
        </div>
        <FormInput
          name="allergies"
          label="Allergies"
          register={register}
          errors={errors}
          disabled={isSubmitting}
        />
        <FormInput
          name="chronic_conditions"
          label="Chronic Conditions"
          register={register}
          errors={errors}
          disabled={isSubmitting}
        />
        <FormInput
          name="medical_history_summary"
          label="Medical History Summary"
          register={register}
          errors={errors}
          disabled={isSubmitting}
        />
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;