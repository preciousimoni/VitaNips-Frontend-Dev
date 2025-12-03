import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
    HeartIcon, 
    BellAlertIcon, 
    CalendarDaysIcon, 
    UserGroupIcon, 
    ShieldCheckIcon, 
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    PlayIcon,
    XMarkIcon,
    SparklesIcon,
    ChartBarIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/layout/Footer';

import Header from '../components/layout/Header';

const LandingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    // const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const { scrollYProgress } = useScroll();
    // const heroInView = useInView(heroRef, { once: false });
    // const featuresInView = useInView(featuresRef, { once: false });
    
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    // const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const features = [
        {
            icon: CalendarDaysIcon,
            title: 'Smart Appointments',
            description: 'Book appointments with your preferred doctors in seconds. Get instant confirmations and automated reminders.',
            color: 'bg-blue-50 text-blue-600',
            delay: 0.1
        },
        {
            icon: BellAlertIcon,
            title: 'Medication Manager',
            description: 'Never miss a dose with intelligent medication reminders and automatic refill notifications sent to your phone.',
            color: 'bg-green-50 text-green-600',
            delay: 0.2
        },
        {
            icon: HeartIcon,
            title: 'Vital Tracking',
            description: 'Monitor your vitals and health metrics in one comprehensive dashboard with trend analysis.',
            color: 'bg-red-50 text-red-600',
            delay: 0.3
        },
        {
            icon: UserGroupIcon,
            title: 'Expert Network',
            description: 'Connect with qualified healthcare professionals across various specialties for in-person or virtual visits.',
            color: 'bg-purple-50 text-purple-600',
            delay: 0.4
        },
        {
            icon: ShieldCheckIcon,
            title: 'Bank-Grade Security',
            description: 'Your health data is protected with enterprise-grade security, end-to-end encryption, and HIPAA compliance.',
            color: 'bg-indigo-50 text-indigo-600',
            delay: 0.5
        },
        {
            icon: DevicePhoneMobileIcon,
            title: 'Mobile First',
            description: 'Access your complete health history, prescriptions, and appointments anywhere with our responsive platform.',
            color: 'bg-orange-50 text-orange-600',
            delay: 0.6
        }
    ];

    const stats = [
        { number: '50K+', label: 'Active Users', delay: 0.1 },
        { number: '500+', label: 'Top Specialists', delay: 0.2 },
        { number: '1M+', label: 'Appointments', delay: 0.3 },
        { number: '4.9/5', label: 'User Rating', delay: 0.4 }
    ];

    const steps = [
        { number: '01', title: 'Create Account', description: 'Sign up in less than 2 minutes.', icon: UserGroupIcon },
        { number: '02', title: 'Complete Profile', description: 'Add your medical history securely.', icon: ShieldCheckIcon },
        { number: '03', title: 'Connect & Care', description: 'Book doctors and track health.', icon: HeartIcon }
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Patient',
            image: 'https://i.pravatar.cc/100?img=1',
            rating: 5,
            text: 'VitaNips has completely transformed how I manage my health. The reminders are a lifesaver!'
        },
        {
            name: 'Michael Chen',
            role: 'Chronic Care Patient',
            image: 'https://i.pravatar.cc/100?img=3',
            rating: 5,
            text: 'Being able to track all my vitals and medications in one place gives me peace of mind.'
        },
        {
            name: 'Dr. Emily Rodriguez',
            role: 'Healthcare Provider',
            image: 'https://i.pravatar.cc/100?img=5',
            rating: 5,
            text: 'As a doctor, I recommend VitaNips to all my patients. It improves compliance significantly.'
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-primary selection:text-white flex flex-col">
            
            {/* Unified Header with Landing Page Variant */}
            <Header variant="landing" />

            <main className="flex-grow">
                {/* Hero Section */}
                <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-blue-50/30">
                    {/* Animated Background Blobs */}
                    <motion.div 
                        style={{ y }}
                        className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-emerald-400/20 rounded-full blur-3xl animate-blob"
                    ></motion.div>
                    <motion.div 
                        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '30%']) }}
                        className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"
                    ></motion.div>
                    <motion.div 
                        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '40%']) }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-blob animation-delay-4000"
                    ></motion.div>
                    
                    {/* Floating Icons */}
                    <motion.div
                        animate={{ 
                            y: [0, -20, 0],
                            rotate: [0, 5, 0]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-32 left-10 hidden lg:block"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-primary/10">
                            <HeartIconSolid className="h-8 w-8 text-red-500" />
                        </div>
                    </motion.div>
                    <motion.div
                        animate={{ 
                            y: [0, 20, 0],
                            rotate: [0, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-48 right-20 hidden lg:block"
                    >
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-blue-100">
                            <CalendarDaysIcon className="h-7 w-7 text-blue-500" />
                        </div>
                    </motion.div>
                    <motion.div
                        animate={{ 
                            y: [0, -15, 0],
                            rotate: [0, 10, 0]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute bottom-32 right-32 hidden lg:block"
                    >
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-green-100">
                            <BellAlertIcon className="h-6 w-6 text-green-500" />
                        </div>
                    </motion.div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div 
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 text-primary font-bold text-sm mb-6 shadow-lg shadow-primary/5"
                                >
                                    <SparklesIcon className="h-5 w-5 mr-2 animate-pulse" />
                                    #1 Healthcare Platform 2024
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="ml-2 w-2 h-2 bg-primary rounded-full"
                                    ></motion.div>
                                </motion.div>
                                <motion.h1 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight mb-6"
                                >
                                    Your Health, <br />
                                    <span className="relative inline-block">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-600 to-teal-600 animate-gradient">
                                            Reimagined.
                                        </span>
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: 0.8, duration: 0.8 }}
                                            className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400/30 -z-10"
                                        ></motion.div>
                                    </span>
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg"
                                >
                                    Experience the <span className="font-bold text-primary">future of healthcare</span> management. Connect with top doctors, track your vitals, and manage prescriptions—all in one beautiful, secure app.
                                </motion.p>
                                
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-col sm:flex-row gap-4"
                                >
                                    {isAuthenticated ? (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Link 
                                                to="/dashboard" 
                                                className="relative bg-gradient-to-r from-primary to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl transition-all inline-flex items-center justify-center group overflow-hidden"
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-white/20"
                                                    initial={{ x: '-100%' }}
                                                    whileHover={{ x: '100%' }}
                                                    transition={{ duration: 0.5 }}
                                                ></motion.div>
                                                <span className="relative z-10">Go to Dashboard</span>
                                                <ArrowRightIcon className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Link 
                                                    to="/register" 
                                                    className="relative bg-gradient-to-r from-primary to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl transition-all inline-flex items-center justify-center group overflow-hidden"
                                                >
                                                    <motion.div
                                                        className="absolute inset-0 bg-white/20"
                                                        initial={{ x: '-100%' }}
                                                        whileHover={{ x: '100%' }}
                                                        transition={{ duration: 0.5 }}
                                                    ></motion.div>
                                                    <span className="relative z-10">Start Free Trial</span>
                                                    <ArrowRightIcon className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </motion.div>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <button 
                                                    onClick={() => setIsVideoModalOpen(true)}
                                                    className="bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-full font-bold text-lg hover:border-primary hover:text-primary hover:shadow-lg transition-all inline-flex items-center justify-center group"
                                                >
                                                    <motion.div 
                                                        whileHover={{ rotate: 360 }}
                                                        transition={{ duration: 0.5 }}
                                                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary transition-colors"
                                                    >
                                                        <PlayIcon className="h-4 w-4 ml-0.5 group-hover:text-white transition-colors" />
                                                    </motion.div>
                                                    Watch Demo
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </motion.div>
                                
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-10 flex flex-wrap items-center gap-6 text-sm font-medium text-gray-600"
                                >
                                    {[
                                        { icon: LockClosedIcon, text: 'HIPAA Compliant' },
                                        { icon: ShieldCheckIcon, text: '24/7 Support' },
                                        { icon: CheckCircleIcon, text: 'Cancel Anytime' }
                                    ].map((item, index) => (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.9 + index * 0.1 }}
                                            className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
                                        >
                                            <item.icon className="h-5 w-5 text-green-500 mr-2" />
                                            {item.text}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative"
                            >
                                {/* Decorative Gradient Orbs */}
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 90, 0]
                                    }}
                                    transition={{ duration: 8, repeat: Infinity }}
                                    className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full blur-2xl"
                                ></motion.div>
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.3, 1],
                                        rotate: [0, -90, 0]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity }}
                                    className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 rounded-full blur-2xl"
                                ></motion.div>
                                
                                <motion.div 
                                    whileHover={{ rotate: 0, scale: 1.02 }}
                                    className="relative z-10 bg-white rounded-3xl shadow-2xl shadow-primary/20 border border-gray-100 overflow-hidden transform rotate-2 transition-all duration-500"
                                >
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                        <div className="flex space-x-2">
                                            <motion.div 
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="w-3 h-3 rounded-full bg-red-400 shadow-sm"
                                            ></motion.div>
                                            <motion.div 
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                                                className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"
                                            ></motion.div>
                                            <motion.div 
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                                                className="w-3 h-3 rounded-full bg-green-400 shadow-sm"
                                            ></motion.div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="w-2 h-2 bg-green-500 rounded-full"
                                            ></motion.div>
                                            <div className="text-xs font-bold text-gray-500 uppercase">Live Dashboard</div>
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-6 bg-gradient-to-br from-white to-gray-50/50">
                                        {/* Mock Dashboard Content */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200 relative overflow-hidden group"
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                                animate={{ x: ['-100%', '200%'] }}
                                                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                            ></motion.div>
                                            <div className="flex items-center relative z-10">
                                                <motion.div 
                                                    whileHover={{ scale: 1.1, rotate: 360 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg"
                                                >
                                                    <CalendarDaysIcon className="h-6 w-6" />
                                                </motion.div>
                                                <div className="ml-4">
                                                    <h4 className="font-bold text-gray-900">Dr. Sarah Wilson</h4>
                                                    <p className="text-sm text-blue-600 font-medium">Cardiology Checkup • Tomorrow, 10 AM</p>
                                                </div>
                                            </div>
                                            <motion.span 
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-md relative z-10"
                                            >
                                                Confirmed
                                            </motion.span>
                                        </motion.div>

                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="flex space-x-4"
                                        >
                                            <motion.div 
                                                whileHover={{ scale: 1.05, y: -5 }}
                                                className="flex-1 bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <motion.div
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        <HeartIconSolid className="h-6 w-6 text-red-500" />
                                                    </motion.div>
                                                    <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Heart Rate</span>
                                                </div>
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 1 }}
                                                    className="text-2xl font-bold text-gray-900"
                                                >
                                                    72 <span className="text-sm font-normal text-gray-500">bpm</span>
                                                </motion.div>
                                            </motion.div>
                                            <motion.div 
                                                whileHover={{ scale: 1.05, y: -5 }}
                                                className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <BellAlertIcon className="h-6 w-6 text-green-500" />
                                                    <span className="text-xs font-bold text-green-500 uppercase tracking-wide">Meds</span>
                                                </div>
                                                <div className="text-sm font-bold text-gray-900 mb-2">All Taken</div>
                                                <div className="w-full bg-green-200 h-1.5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '100%' }}
                                                        transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                                                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full"
                                                    ></motion.div>
                                                </div>
                                            </motion.div>
                                        </motion.div>

                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.9 }}
                                            className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-between hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center">
                                                <motion.img 
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    src="https://i.pravatar.cc/100?img=5" 
                                                    alt="Doc" 
                                                    className="w-10 h-10 rounded-full border-2 border-white shadow-md" 
                                                />
                                                <div className="ml-3">
                                                    <p className="text-sm font-bold text-gray-900">New Message</p>
                                                    <p className="text-xs text-gray-600">Dr. Chen sent you a prescription update.</p>
                                                </div>
                                            </div>
                                            <motion.div 
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"
                                            ></motion.div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                                
                                {/* Additional Floating Badge */}
                                <motion.div 
                                    animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                    className="absolute -bottom-6 -left-6 bg-white p-3 rounded-2xl shadow-2xl border border-gray-100 hidden lg:block"
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="flex">
                                            {[1,2,3,4,5].map(i => (
                                                <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">4.9/5 Rating</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                    </div>
                </div>
            </section>

                {/* Stats Section */}
                <section className="py-16 bg-gradient-to-r from-primary via-emerald-600 to-teal-600 relative overflow-hidden">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 left-0 w-full h-full"
                            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}
                        ></motion.div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: stat.delay, duration: 0.5 }}
                                    whileHover={{ scale: 1.1, y: -5 }}
                                    className="text-center px-4 relative group"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-white/5 rounded-2xl blur-xl"
                                        whileHover={{ scale: 1.2 }}
                                    ></motion.div>
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: stat.delay + 0.2, type: "spring" }}
                                        className="text-4xl md:text-6xl font-black text-white mb-2 relative"
                                    >
                                        {stat.number}
                                    </motion.div>
                                    <div className="text-white/90 text-sm md:text-base font-bold uppercase tracking-wider">{stat.label}</div>
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-full"
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: stat.delay + 0.4 }}
                                    ></motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section ref={featuresRef} id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
                    {/* Decorative Elements */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
                    ></motion.div>
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"
                    ></motion.div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center max-w-3xl mx-auto mb-16"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-4"
                            >
                                <SparklesIcon className="h-4 w-4 mr-2" />
                                POWERFUL FEATURES
                            </motion.div>
                            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                Everything you need for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">complete health management</span>
                            </h3>
                            <p className="text-lg text-gray-600">Powerful tools designed to simplify your healthcare journey, available right at your fingertips.</p>
                        </motion.div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: feature.delay, duration: 0.5 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group relative overflow-hidden"
                                >
                                    {/* Gradient Overlay on Hover */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                    ></motion.div>
                                    
                                    <motion.div 
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg relative z-10`}
                                    >
                                        <feature.icon className="h-8 w-8" />
                                    </motion.div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-3 relative z-10 group-hover:text-primary transition-colors">{feature.title}</h4>
                                    <p className="text-gray-600 leading-relaxed relative z-10">{feature.description}</p>
                                    
                                    {/* Decorative Corner Element */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: feature.delay + 0.3 }}
                                        className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl"
                                    ></motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6"
                                >
                                    HOW IT WORKS
                                </motion.div>
                                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-12">
                                    Get started in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">3 simple steps</span>
                                </h2>
                                <div className="space-y-8">
                                    {steps.map((step, index) => (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, x: -30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.2 }}
                                            whileHover={{ x: 10 }}
                                            className="flex gap-6 group"
                                        >
                                            <motion.div 
                                                whileHover={{ scale: 1.1, rotate: 360 }}
                                                transition={{ duration: 0.6 }}
                                                className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-primary/20"
                                            >
                                                {step.number}
                                            </motion.div>
                                            <div className="flex-1 pt-2">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">{step.title}</h4>
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        whileInView={{ scale: 1 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: index * 0.2 + 0.3 }}
                                                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
                                                    >
                                                        <step.icon className="h-5 w-5 text-primary" />
                                                    </motion.div>
                                                </div>
                                                <p className="text-gray-600 text-lg">{step.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-12"
                                >
                                    <Link to="/register" className="inline-flex items-center text-primary font-bold text-lg hover:gap-4 gap-2 transition-all group">
                                        Start your journey now 
                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <ArrowRightIcon className="h-6 w-6" />
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 180, 360]
                                    }}
                                    transition={{ duration: 20, repeat: Infinity }}
                                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl"
                                ></motion.div>
                                <motion.img 
                                    whileHover={{ rotate: 0, scale: 1.05 }}
                                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                                    alt="App usage" 
                                    className="relative rounded-3xl shadow-2xl border-8 border-white transform -rotate-3 transition-all duration-500"
                                />
                                
                                {/* Floating Stats */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Success Rate</p>
                                            <p className="text-lg font-bold text-gray-900">99.9%</p>
                                        </div>
                                    </div>
                                </motion.div>
                                
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <ChartBarIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Active Users</p>
                                            <p className="text-lg font-bold text-gray-900">50K+</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section id="testimonials" className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-4"
                            >
                                <StarIconSolid className="h-4 w-4 mr-2 text-yellow-500" />
                                TESTIMONIALS
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">thousands</span>
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                See what our users have to say about their experience with VitaNips
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 relative overflow-hidden group"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                    ></motion.div>
                                    
                                    <div className="flex items-center gap-1 mb-4 relative z-10">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0, rotate: -180 }}
                                                whileInView={{ scale: 1, rotate: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.1 + i * 0.05 }}
                                            >
                                                <StarIconSolid className="h-5 w-5 text-yellow-400" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    
                                    <p className="text-gray-700 leading-relaxed mb-6 relative z-10 italic">
                                        "{testimonial.text}"
                                    </p>
                                    
                                    <div className="flex items-center gap-4 relative z-10">
                                        <motion.img
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-12 h-12 rounded-full border-2 border-primary/20 shadow-md"
                                        />
                                        <div>
                                            <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Quote Mark */}
                                    <div className="absolute top-6 right-6 text-primary/10 text-6xl font-serif">"</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Final */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-600"></div>
                    
                    {/* Animated Background Elements */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
                    ></motion.div>
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"
                    ></motion.div>
                    
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", duration: 0.8 }}
                                className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-sm mb-6"
                            >
                                <SparklesIcon className="h-5 w-5 mr-2" />
                                START YOUR HEALTH JOURNEY TODAY
                            </motion.div>
                            
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                                Ready to take control of <br />
                                <span className="relative inline-block">
                                    your health?
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400/30"
                                    ></motion.div>
                                </span>
                            </h2>
                            
                            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
                                Join <span className="font-bold">thousands of users</span> who trust VitaNips for their healthcare needs. Safe, secure, and simple.
                            </p>
                            
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link 
                                        to="/register" 
                                        className="relative bg-white text-primary px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all inline-flex items-center justify-center group overflow-hidden"
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-gray-100"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.5 }}
                                        ></motion.div>
                                        <span className="relative z-10">Get Started for Free</span>
                                        <ArrowRightIcon className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link 
                                        to="/login" 
                                        className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition-all inline-flex items-center justify-center"
                                    >
                                        Sign In
                                    </Link>
                                </motion.div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                                className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/80 text-sm"
                            >
                                {[
                                    { icon: CheckCircleIcon, text: 'No credit card required' },
                                    { icon: ShieldCheckIcon, text: 'HIPAA compliant' },
                                    { icon: UserGroupIcon, text: 'Join 50K+ users' }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                        className="flex items-center gap-2"
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-medium">{item.text}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />

            {/* Video Modal */}
            <AnimatePresence>
            {isVideoModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm"
                    >
                    <div className="flex min-h-full items-center justify-center p-4">
                            <div className="fixed inset-0" onClick={() => setIsVideoModalOpen(false)}></div>
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative bg-black rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-gray-800"
                            >
                                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                                    <h3 className="text-lg font-semibold text-white">VitaNips Platform Demo</h3>
                                <button 
                                    onClick={() => setIsVideoModalOpen(false)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                >
                                        <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                                <div className="aspect-video bg-gray-900 flex items-center justify-center relative group cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 opacity-50"></div>
                                    <div className="text-center z-10">
                                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                            <PlayIcon className="h-10 w-10 text-white ml-1" />
                                        </div>
                                        <p className="text-gray-400 font-medium">Full Demo Coming Soon</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage; 


