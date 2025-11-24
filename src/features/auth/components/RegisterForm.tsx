import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extendedRegisterSchema, ExtendedRegisterFormData } from '../../../schemas/authSchema';
import FormInput from '../../../components/forms/FormInput';
import FormSelect from '../../../components/common/FormSelect';
import Spinner from '../../../components/ui/Spinner';
import { register as apiRegister } from '../../../api/auth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

const steps = [
  { id: 1, title: 'Account' },
  { id: 2, title: 'Personal' },
  { id: 3, title: 'Health' },
];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
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
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setDirection(-1);
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
      
      // Remove fields not present in backend model or serializer
      delete payload.gender;
      delete payload.confirmPassword;

      // Clean up optional empty strings
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      await apiRegister(payload);
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error: any) {
      console.error("Registration Error:", error);
      if (error.response && error.response.data) {
          const data = error.response.data;
          if (typeof data === 'object') {
              // Iterate over field errors
              Object.keys(data).forEach(field => {
                  const messages = data[field];
                  if (Array.isArray(messages)) {
                      messages.forEach(msg => toast.error(`${field}: ${msg}`));
                  } else {
                      toast.error(`${field}: ${messages}`);
                  }
              });
          } else {
              toast.error("Registration failed. Please check your input.");
          }
      } else {
          toast.error("Registration failed. Network or server error.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
      {/* Progress Bar */}
      <div className="mb-10 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 rounded-full -z-10 transform -translate-y-1/2" />
        <div 
            className="absolute top-1/2 left-0 h-1 bg-primary-500 rounded-full -z-10 transform -translate-y-1/2 transition-all duration-500 ease-in-out" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} 
        />
        
        <div className="flex justify-between w-full">
            {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                    <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                            step.id < currentStep 
                                ? 'bg-primary-500 border-primary-500 text-white' 
                                : step.id === currentStep 
                                    ? 'bg-white border-primary-500 text-primary-500 scale-110 shadow-md shadow-primary-100' 
                                    : 'bg-white border-gray-200 text-gray-400'
                        }`}
                    >
                        {step.id < currentStep ? <CheckIcon className="w-5 h-5" /> : step.id}
                    </div>
                    <span className={`text-xs mt-2 font-medium transition-colors ${step.id <= currentStep ? 'text-primary-700' : 'text-gray-400'}`}>
                        {step.title}
                    </span>
                </div>
            ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="relative overflow-hidden min-h-[380px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                }}
                className="space-y-5"
            >
                {currentStep === 1 && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="First Name"
                        name="first_name"
                        register={register}
                        errors={errors}
                        placeholder="Jane"
                        className="rounded-lg"
                    />
                    <FormInput
                        label="Last Name"
                        name="last_name"
                        register={register}
                        errors={errors}
                        placeholder="Doe"
                         className="rounded-lg"
                    />
                    </div>
                    <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    register={register}
                    errors={errors}
                    placeholder="jane@example.com"
                     className="rounded-lg"
                    />
                    <FormInput
                    label="Username"
                    name="username"
                    register={register}
                    errors={errors}
                    placeholder="janedoe"
                     className="rounded-lg"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                        label="Password"
                        name="password"
                        type="password"
                        register={register}
                        errors={errors}
                        placeholder="••••••••"
                         className="rounded-lg"
                        />
                        <FormInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        register={register}
                        errors={errors}
                        placeholder="••••••••"
                         className="rounded-lg"
                        />
                    </div>
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
                     className="rounded-lg"
                    />
                    <FormInput
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    register={register}
                    errors={errors}
                     className="rounded-lg"
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
                     className="rounded-lg"
                    />
                </>
                )}

                {currentStep === 3 && (
                <>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4">
                        <p className="text-sm text-blue-800">
                            Helping us with your medical profile allows VitaNips to provide better recommendations. This is optional.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                        label="Blood Group"
                        name="blood_group"
                        register={register}
                        errors={errors}
                        placeholder="e.g. O+"
                         className="rounded-lg"
                        />
                        <FormInput
                        label="Genotype"
                        name="genotype"
                        register={register}
                        errors={errors}
                        placeholder="e.g. AA"
                         className="rounded-lg"
                        />
                    </div>
                    <FormInput
                    label="Known Allergies"
                    name="allergies"
                    register={register}
                    errors={errors}
                    placeholder="e.g. Peanuts, Penicillin"
                     className="rounded-lg"
                    />
                </>
                )}
            </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>
          ) : (
              <div></div> // Spacer
          )}

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Next Step
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-8 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform hover:scale-[1.02]"
            >
              {isLoading ? <Spinner size="sm" color="white" /> : 'Create Account'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
