import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import FormInput from '../../../components/forms/FormInput';
import Spinner from '../../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { passwordReset } from '../../../api/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await passwordReset(values.email);
      setIsSubmitted(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Failed to send reset email:', error);
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.email?.[0] || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FDFBF7]">
      {/* Left hero panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-primary-900 items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2030&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-primary-900/90" />
        
        {/* Animated shapes */}
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-accent rounded-full blur-3xl opacity-10"
        />
        
        <div className="relative z-10 text-center px-12 max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <img src="/logo.png" alt="VitaNips" className="mx-auto h-24 drop-shadow-lg mb-8" />
                <h1 className="text-6xl font-display font-medium text-white tracking-tight mb-6">
                    Recover Access.
                </h1>
                <p className="text-xl text-white/80 font-light leading-relaxed max-w-lg mx-auto">
                    We'll help you get back into your account securely.
                </p>
            </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <Link to="/login" className="absolute top-8 left-8 text-gray-600 hover:text-primary-900 flex items-center transition-colors font-medium text-sm gap-2">
            <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 group-hover:border-primary-200 transition-colors">
                <ArrowLeftIcon className="h-4 w-4" />
            </div>
            Back to Login
        </Link>

        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-display font-medium text-gray-900 mb-3">
              Forgot Password?
            </h2>
            <p className="text-gray-500 text-lg">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>
          
           <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
              {isSubmitted ? (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 text-green-900 p-6 rounded-2xl border border-green-100 text-center"
                  >
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xl font-display font-bold mb-2">Check your email!</p>
                      <p className="text-sm font-medium opacity-80 mb-6">We've sent password reset instructions to your email address.</p>
                      <Link to="/login" className="inline-block w-full py-3 px-4 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-900/20">
                          Back to Login
                      </Link>
                 </motion.div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <FormInput
                    name="email"
                    label="Email address"
                    type="email"
                    register={register}
                    errors={errors}
                    disabled={isLoading}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                  />
    
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                       className="w-full flex justify-center py-4 px-6 rounded-full shadow-lg shadow-primary-900/20 text-lg font-bold text-white bg-primary-900 hover:bg-primary-800 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? <Spinner size="sm" color="text-white" /> : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
