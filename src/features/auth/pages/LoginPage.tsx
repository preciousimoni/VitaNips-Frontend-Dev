// src/features/auth/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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

      // Fetch user profile to determine role
      const userResponse = await axiosInstance.get('/users/profile/', {
        headers: { Authorization: `Bearer ${access}` },
      });

      // Redirect to appropriate dashboard based on user role
      const dashboardRoute = getDashboardRoute(userResponse.data);
      navigate(dashboardRoute);
    } catch (err: unknown) {
      console.error('Login failed:', err);
      setError(apiErrorToMessage(err, 'Login failed. Please check your connection and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left hero panel */}
      <div className="hidden lg:flex items-center justify-center p-12">
        <div className="hero-gradient w-full h-[80vh] rounded-3xl relative overflow-hidden flex items-center justify-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]">
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative z-10 text-center text-white px-10">
            <img src="/logo.png" alt="VitaNips" className="mx-auto h-20 drop-shadow-md" />
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight">
              Welcome to <span className="whitespace-nowrap">VitaNips</span>
            </h1>
            <p className="mt-3 text-white/90 max-w-md mx-auto text-balance">
              Your personal health hub — appointments, medications, documents, and telehealth in one secure place.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-white/80">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Secure</span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Fast</span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Reliable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-surface">
        <div className="w-full max-w-md">
          <div className="card p-8 sm:p-10">
            <div className="text-center">
              <img className="mx-auto h-14" src="/logo.png" alt="VitaNips Logo" />
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold">
                Sign in to <span className="gradient-text">VitaNips</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">Welcome back! Please enter your details.</p>
            </div>

            {error && (
              <div role="alert" aria-live="assertive" className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
              <FormInput
                name="email"
                label="Email address"
                type="email"
                register={register}
                errors={errors}
                disabled={isLoading}
                placeholder="you@example.com"
                autoComplete="email"
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute top-[34px] right-2 my-auto h-8 px-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary rounded"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-primary hover:text-primary-dark font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? <Spinner size="sm" /> : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
                Register here
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in you agree to our <a href="#" className="text-primary">Terms</a> and <a href="#" className="text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;