import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50">
      {/* Left hero panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gray-900 items-center justify-center order-2">
         {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-bl from-teal-900/90 via-gray-900/95 to-black/90" />
        
        {/* Animated shapes */}
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -90, 0],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 60, 0],
                opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-primary-500/10 rounded-full blur-3xl"
        />

        <div className="relative z-10 text-center px-12 max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <img src="/logo.png" alt="VitaNips" className="mx-auto h-24 drop-shadow-2xl mb-8" />
                <h1 className="text-5xl font-bold text-white tracking-tight mb-6 font-display">
                    Start Your Journey
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                    Join thousands of users taking control of their health. Create your secure account today and experience the future of healthcare management.
                </p>
                
                 <div className="mt-10 flex justify-center space-x-4">
                    <div className="flex -space-x-2 overflow-hidden">
                        <img className="inline-block h-10 w-10 rounded-full ring-2 ring-gray-900" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
                        <img className="inline-block h-10 w-10 rounded-full ring-2 ring-gray-900" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
                        <img className="inline-block h-10 w-10 rounded-full ring-2 ring-gray-900" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt=""/>
                        <img className="inline-block h-10 w-10 rounded-full ring-2 ring-gray-900" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
                    </div>
                    <p className="text-gray-400 text-sm flex items-center">Join 10,000+ others</p>
                 </div>
            </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 relative order-1">
        <Link to="/" className="absolute top-8 left-8 text-gray-500 hover:text-gray-900 flex items-center transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
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
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-display">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">Log in</Link>
            </p>
          </div>

          <RegisterForm />

          <div className="mt-8 text-center text-xs text-gray-500 max-w-xs mx-auto">
            By clicking "Register" you agree to our <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
