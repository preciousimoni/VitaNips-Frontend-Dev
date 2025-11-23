// src/features/auth/pages/RegisterPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const RegisterPage: React.FC = () => {
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
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <img className="mx-auto h-14 lg:hidden" src="/logo.png" alt="VitaNips Logo" />
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold">
              Create your <span className="gradient-text">VitaNips</span> account
            </h2>
            <p className="text-sm text-gray-500 mt-1">It only takes a minute.</p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
              Sign in
            </Link>
          </p>
          <p className="mt-6 text-center text-xs text-gray-500">
            By creating an account you agree to our <a href="#" className="text-primary">Terms</a> and <a href="#" className="text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;