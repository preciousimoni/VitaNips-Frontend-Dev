import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extendedRegisterSchema, ExtendedRegisterFormData } from '../../../schemas/authSchema';
import FormInput from '../../../components/forms/FormInput';
import FormSelect from '../../../components/common/FormSelect';
import { Button } from '../../../components/common';
import Spinner from '../../../components/ui/Spinner';
import { register as apiRegister } from '../../../api/auth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Personal Details' },
  { id: 3, title: 'Medical Profile' },
];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ExtendedRegisterFormData>({
    resolver: zodResolver(extendedRegisterSchema),
    mode: 'onChange',
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof ExtendedRegisterFormData)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['first_name', 'last_name', 'email', 'username', 'password', 'confirmPassword'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['phone_number', 'date_of_birth', 'gender'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit: SubmitHandler<ExtendedRegisterFormData> = async (data) => {
    setIsLoading(true);
    try {
      // Map form data to API payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        ...data,
        password2: data.confirmPassword,
      };
      // Clean up optional empty strings
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      await apiRegister(payload);
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`text-xs font-semibold ${
                step.id <= currentStep ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep) / (steps.length)) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {currentStep === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                name="first_name"
                register={register}
                errors={errors}
                placeholder="First Name"
              />
              <FormInput
                label="Last Name"
                name="last_name"
                register={register}
                errors={errors}
                placeholder="Last Name"
              />
            </div>
            <FormInput
              label="Email"
              name="email"
              type="email"
              register={register}
              errors={errors}
              placeholder="email@example.com"
            />
            <FormInput
              label="Username"
              name="username"
              register={register}
              errors={errors}
              placeholder="username"
            />
            <FormInput
              label="Password"
              name="password"
              type="password"
              register={register}
              errors={errors}
              placeholder="********"
            />
            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              register={register}
              errors={errors}
              placeholder="********"
            />
          </>
        )}

        {currentStep === 2 && (
          <>
            <FormInput
              label="Phone Number"
              name="phone_number"
              register={register}
              errors={errors}
              placeholder="+1234567890"
            />
            <FormInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              register={register}
              errors={errors}
            />
            <FormSelect
              label="Gender"
              name="gender"
              register={register}
              errors={errors}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </>
        )}

        {currentStep === 3 && (
          <>
            <FormInput
              label="Blood Group"
              name="blood_group"
              register={register}
              errors={errors}
              placeholder="e.g., O+"
            />
            <FormInput
              label="Genotype"
              name="genotype"
              register={register}
              errors={errors}
              placeholder="e.g., AA"
            />
            <FormInput
              label="Allergies"
              name="allergies"
              register={register}
              errors={errors}
              placeholder="List any allergies"
            />
          </>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handlePrev}>
              Back
            </Button>
          )}
          {currentStep < steps.length ? (
            <Button type="button" onClick={handleNext} className="ml-auto">
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading} className="ml-auto">
              {isLoading ? <Spinner size="sm" /> : 'Register'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;

