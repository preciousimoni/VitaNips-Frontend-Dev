// src/features/auth/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { registerSchema, RegisterFormData } from '../../../schemas/authSchema';
import FormInput from '../../../components/forms/FormInput';
import Spinner from '../../../components/ui/Spinner';

const RegisterPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await axiosInstance.post('/users/register/', {
        email: data.email,
        username: data.username || data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        password2: data.confirmPassword,
      });

      toast.success('Welcome! Your account was created.');

      setTimeout(() => {
        navigate('/login');
      }, 1200);

    } catch (err: unknown) {
      let errorMessage = 'Registration failed. Please try again.';
      const axiosErr = err as { response?: { data?: unknown } } | undefined;
      const responseData = axiosErr?.response?.data;
      if (typeof responseData === 'object' && responseData !== null) {
        const obj = responseData as Record<string, unknown>;
        if (Array.isArray(obj.email)) errorMessage = `Email: ${(obj.email as unknown[]).join(', ')}`;
        else if (Array.isArray(obj.username)) errorMessage = `Username: ${(obj.username as unknown[]).join(', ')}`;
        else if (Array.isArray(obj.password)) errorMessage = `Password: ${(obj.password as unknown[]).join(', ')}`;
        else {
          const values = Object.values(obj);
          const flat = values
            .map((v) => (Array.isArray(v) ? v.join(' ') : typeof v === 'string' ? v : ''))
            .filter(Boolean)
            .join(' ');
          if (flat) errorMessage = flat;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
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
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Join <span className="whitespace-nowrap">VitaNips</span></h1>
            <p className="mt-3 text-white/90 max-w-md mx-auto text-balance">
              Create your account to manage health records, appointments, and more.
            </p>
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
                Create your <span className="gradient-text">VitaNips</span> account
              </h2>
              <p className="text-sm text-gray-500 mt-1">It only takes a minute.</p>
            </div>

            {error && <div role="alert" aria-live="assertive" className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="First name"
                  name="first_name"
                  register={register}
                  errors={errors}
                  placeholder="Jane"
                  autoComplete="given-name"
                  disabled={isLoading}
                />
                <FormInput
                  label="Last name"
                  name="last_name"
                  register={register}
                  errors={errors}
                  placeholder="Doe"
                  autoComplete="family-name"
                  disabled={isLoading}
                />
              </div>

              <FormInput
                label="Email address"
                name="email"
                type="email"
                register={register}
                errors={errors}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
              />

              <FormInput
                label="Username"
                name="username"
                register={register}
                errors={errors}
                placeholder="yourname"
                autoComplete="username"
                disabled={isLoading}
              />

              <div className="relative">
                <FormInput
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  register={register}
                  errors={errors}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  helpText="Use at least 8 characters."
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

              <div className="relative">
                <FormInput
                  label="Confirm password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  register={register}
                  errors={errors}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute top-[34px] right-2 my-auto h-8 px-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? <Spinner size="sm" /> : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            By creating an account you agree to our <a href="#" className="text-primary">Terms</a> and <a href="#" className="text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;