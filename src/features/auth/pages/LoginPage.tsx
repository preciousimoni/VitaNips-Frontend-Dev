import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { login, user } = useAuth();
  const [searchParams] = useSearchParams();
  const isDoctorRegistration = searchParams.get('doctor') === 'true';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Handle Remember Me on mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setValue('email', savedEmail);
      // document.getElementById('remember-me')?.setAttribute('checked', 'true'); // optional UI sync
    }
  }, [setValue]);

  const onSubmit = async (values: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    
    // Handle Remember Me
    const rememberMeCheckbox = document.getElementById('remember-me') as HTMLInputElement;
    if (rememberMeCheckbox?.checked) {
        localStorage.setItem('remembered_email', values.email);
    } else {
        localStorage.removeItem('remembered_email');
    }

    try {
      const response = await axiosInstance.post<AuthTokens>('/token/', values);
      const { access, refresh } = response.data;

      // Save tokens first
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Fetch user profile directly (before calling login to avoid race conditions)
      let userProfile;
      try {
        const userResponse = await axiosInstance.get('/users/profile/', {
          headers: { Authorization: `Bearer ${access}` },
        });
        userProfile = userResponse.data;
      } catch (profileError) {
        console.error('Failed to fetch user profile:', profileError);
        // Still proceed with login, AuthContext will retry
        userProfile = null;
      }

      // Now call login (which will also fetch profile, but we already have it)
      await login(access, refresh);

      // Use the profile we fetched for routing decisions
      if (userProfile) {
        // Check if user registered as doctor but hasn't submitted application yet
        if (!userProfile.is_doctor && (userProfile.registered_as_doctor || isDoctorRegistration)) {
          navigate('/doctor/application', { replace: true });
          return;
        }

        // Redirect to appropriate dashboard based on user role
        const from = location.state?.from?.pathname || getDashboardRoute(userProfile);
        navigate(from, { replace: true });
      } else {
        // Fallback: redirect to dashboard if profile fetch failed
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      console.error('Login failed:', err);
      setError(apiErrorToMessage(err, 'Login failed. Please check your connection and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FDFBF7]">
      {/* Left hero panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-primary-900 items-center justify-center">
         {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
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
        <motion.div 
            animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -60, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-3xl opacity-10"
        />

        <div className="relative z-10 text-center px-12 max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <img src="/logo.png" alt="VitaNips" className="mx-auto h-24 drop-shadow-lg mb-8" />
                <h1 className="text-6xl font-display font-medium text-white tracking-tight mb-6">
                    Welcome Back.
                </h1>
                <p className="text-xl text-white/80 font-light leading-relaxed max-w-lg mx-auto">
                    Your health, simplified. Access your dashboard to manage appointments and consultations.
                </p>
                
                <div className="mt-12 flex justify-center gap-4">
                     <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-white text-sm font-medium">System Online</span>
                     </div>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <Link to="/" className="absolute top-8 left-8 text-gray-600 hover:text-primary-900 flex items-center transition-colors font-medium text-sm gap-2">
            <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 group-hover:border-primary-200 transition-colors">
                <ArrowLeftIcon className="h-4 w-4" />
            </div>
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
            <h2 className="text-4xl font-display font-medium text-gray-900 mb-3">
              Sign in
            </h2>
            <p className="text-gray-500 text-lg">
              New here? <Link to="/register" className="text-primary-700 font-medium hover:text-primary-900 underline decoration-1 underline-offset-4">Create an account</Link>
            </p>
            {isDoctorRegistration && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-2xl text-sm font-medium border border-blue-100"
              >
                <strong>Doctor Registration:</strong> Please login to continue your application.
              </motion.div>
            )}
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3"
              >
                 <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                 {error}
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
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-gray-900 placeholder:text-gray-400"
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
                   className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute top-[46px] right-5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                      <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    defaultChecked={!!localStorage.getItem('remembered_email')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 font-medium">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="text-gray-500 hover:text-primary-700 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-6 rounded-full shadow-lg shadow-primary-900/20 text-lg font-bold text-white bg-primary-900 hover:bg-primary-800 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? <Spinner size="sm" color="text-white" /> : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
               <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Secure Health Portal</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
