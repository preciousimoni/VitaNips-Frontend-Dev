import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import FormInput from '../../../components/forms/FormInput';
import Spinner from '../../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { passwordResetConfirmSchema, PasswordResetConfirmFormData } from '../../../schemas/authSchema';
import { passwordResetConfirm } from '../../../api/auth';

const PasswordResetConfirmPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetConfirmFormData>({
    resolver: zodResolver(passwordResetConfirmSchema),
  });

  useEffect(() => {
    if (!uid || !token) {
      toast.error('Invalid reset link. Please request a new password reset.');
      navigate('/forgot-password');
    }
  }, [uid, token, navigate]);

  const onSubmit = async (values: PasswordResetConfirmFormData) => {
    if (!uid || !token) {
      toast.error('Invalid reset link. Please request a new password reset.');
      return;
    }

    setIsLoading(true);
    try {
      await passwordResetConfirm({
        uid,
        token,
        new_password: values.new_password,
      });
      setIsSuccess(true);
      toast.success('Password reset successful! You can now login with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.token?.[0] ||
                          error?.response?.data?.uid?.[0] ||
                          'Failed to reset password. The link may have expired. Please request a new one.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!uid || !token) {
    return null; // Will redirect in useEffect
  }

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
                    Set New Password.
                </h1>
                <p className="text-xl text-white/80 font-light leading-relaxed max-w-lg mx-auto">
                    Choose a strong password to secure your account.
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
              Reset Password
            </h2>
            <p className="text-gray-500 text-lg">
              Enter your new password below.
            </p>
          </div>
          
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            {isSuccess ? (
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
                <p className="text-xl font-display font-bold mb-2">Password Reset Successful!</p>
                <p className="text-sm font-medium opacity-80 mb-6">Redirecting to login...</p>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                  <label htmlFor="new_password" className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('new_password')}
                      type={showPassword ? 'text' : 'password'}
                      id="new_password"
                      disabled={isLoading}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-gray-900 placeholder:text-gray-400 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.new_password.message}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirm_password')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm_password"
                      disabled={isLoading}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-gray-900 placeholder:text-gray-400 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-4 px-6 rounded-full shadow-lg shadow-primary-900/20 text-lg font-bold text-white bg-primary-900 hover:bg-primary-800 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? <Spinner size="sm" color="text-white" /> : 'Reset Password'}
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

export default PasswordResetConfirmPage;

