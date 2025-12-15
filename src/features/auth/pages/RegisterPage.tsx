import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FDFBF7]">
      {/* Left hero panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-primary-900 items-center justify-center order-2">
         {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-primary-900/90" />
        
        {/* Animated shapes */}
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent rounded-full blur-3xl opacity-10"
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 60, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-3xl opacity-10"
        />

        <div className="relative z-10 text-center px-12 max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <img src="/logo.png" alt="VitaNips" className="mx-auto h-24 drop-shadow-lg mb-8" />
                <h1 className="text-6xl font-display font-medium text-white tracking-tight mb-6">
                    Join the Future.
                </h1>
                <p className="text-xl text-white/80 font-light leading-relaxed max-w-lg mx-auto">
                    Create your account today and experience healthcare without the hassle.
                </p>
                
                 <div className="mt-12 flex justify-center space-x-6 items-center bg-white/10 p-4 rounded-full border border-white/10 backdrop-blur-sm">
                    <div className="flex -space-x-4">
                        <img className="inline-block h-10 w-10 rounded-full border-2 border-primary-900" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
                        <img className="inline-block h-10 w-10 rounded-full border-2 border-primary-800" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
                        <img className="inline-block h-10 w-10 rounded-full border-2 border-primary-700" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt=""/>
                    </div>
                    <p className="text-white font-medium text-sm flex items-center">Join 10,000+ others</p>
                 </div>
            </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 relative order-1">
        <Link to="/" className="absolute top-8 left-8 text-gray-600 hover:text-primary-900 flex items-center transition-colors font-medium text-sm gap-2">
            <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 group-hover:border-primary-200 transition-colors">
                <ArrowLeftIcon className="h-4 w-4" />
            </div>
            Back to Home
        </Link>

        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
        >
          <div className="text-center mb-10">
             <Link to="/" className="inline-block lg:hidden mb-6">
                 <img className="h-12 w-auto" src="/logo.png" alt="VitaNips Logo" />
             </Link>
            <h2 className="text-4xl font-display font-medium text-gray-900 mb-3">
              Create an account
            </h2>
            <p className="text-gray-500 text-lg">
              Already have an account? <Link to="/login" className="text-primary-700 font-medium hover:text-primary-900 underline decoration-1 underline-offset-4">Log in</Link>
            </p>
            <div className="mt-6 p-4 bg-primary-50 text-primary-900 rounded-2xl border border-primary-100/50">
              <p className="text-sm font-medium text-left">
                <strong>Are you a doctor?</strong> Register here first, then complete your professional application to join our network.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
             <RegisterForm />
          </div>

          <div className="mt-8 text-center text-xs font-medium text-gray-400 max-w-xs mx-auto">
            By clicking "Register" you agree to our <a href="#" className="text-gray-600 hover:text-primary-900 hover:underline">Terms of Service</a> and <a href="#" className="text-gray-600 hover:text-primary-900 hover:underline">Privacy Policy</a>.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
