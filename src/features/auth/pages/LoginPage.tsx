import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import { AuthTokens } from '../../../types/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiErrorToMessage } from '../../../utils/errors';
import { getDashboardRoute } from '../../../utils/routing';
import { loginSchema, LoginFormData } from '../../../schemas/authSchema';
import FormInput from '../../../components/forms/FormInput';
import Spinner from '../../../components/ui/Spinner';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const isDoctorRegistration = searchParams.get('doctor') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axiosInstance.post<AuthTokens>('/token/', values);
      const { access, refresh } = response.data;

      // Login will fetch user profile
      await login(access, refresh);

      // Wait a bit for AuthContext to update user state
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch user profile to determine role (use the one from AuthContext if available, otherwise fetch)
      let user;
      try {
        const userResponse = await axiosInstance.get('/users/profile/', {
          headers: { Authorization: `Bearer ${access}` },
        });
        user = userResponse.data;
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        // If fetch fails, try to get from AuthContext
        // But we'll proceed with redirect anyway
        navigate('/dashboard');
        return;
      }
      
      // If user registered as doctor but doesn't have a doctor profile yet, redirect to application
      if (isDoctorRegistration && !user.is_doctor) {
        navigate('/doctor/application', { replace: true });
        return;
      }

      // Redirect to appropriate dashboard based on user role
      const dashboardRoute = getDashboardRoute(user);
      navigate(dashboardRoute, { replace: true });
    } catch (err: unknown) {
      console.error('Login failed:', err);
      setError(apiErrorToMessage(err, 'Login failed. Please check your connection and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50">
      {/* Left hero panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gray-900 items-center justify-center">
         {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-gray-900/95 to-black/90" />
        
        {/* Animated shapes */}
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -60, 0],
                opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-3xl"
        />

        <div className="relative z-10 text-center px-12 max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <img src="/logo.png" alt="VitaNips" className="mx-auto h-24 drop-shadow-2xl mb-8" />
                <h1 className="text-5xl font-bold text-white tracking-tight mb-6 font-display">
                    Welcome Back
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                    Access your comprehensive health dashboard. Manage appointments, prescriptions, and consultations securely.
                </p>
                
                <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <h3 className="text-2xl font-bold text-primary-400 mb-1">24/7</h3>
                        <p className="text-sm text-gray-400">Access</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <h3 className="text-2xl font-bold text-primary-400 mb-1">100%</h3>
                        <p className="text-sm text-gray-400">Secure</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <h3 className="text-2xl font-bold text-primary-400 mb-1">Fast</h3>
                        <p className="text-sm text-gray-400">Response</p>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <Link to="/" className="absolute top-8 left-8 text-gray-500 hover:text-gray-900 flex items-center transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
        </Link>

        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
        >
          <div className="text-center mb-10">
             <Link to="/" className="inline-block lg:hidden mb-6">
                 <img className="h-12 w-auto" src="/logo.png" alt="VitaNips Logo" />
             </Link>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-display">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">start your health journey today</Link>
            </p>
            {isDoctorRegistration && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <p className="text-sm text-blue-900">
                  <strong>Doctor Registration:</strong> After logging in, you'll be redirected to submit your doctor application.
                </p>
              </motion.div>
            )}
          </div>

          <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

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
                className="rounded-lg"
              />

              <div className="relative">
                <FormInput
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  register={register}
                  errors={errors}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute top-[38px] right-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                      <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01]"
                >
                  {isLoading ? <Spinner size="sm" color="white" /> : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Protected by industry standard encryption</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
