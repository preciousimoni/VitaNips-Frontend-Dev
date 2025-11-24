import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    StarIcon,
    XMarkIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
            description: 'Monitor your vitals, symptoms, and health metrics in one comprehensive dashboard with trend analysis.',
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
        { number: '01', title: 'Create Account', description: 'Sign up in less than 2 minutes.' },
        { number: '02', title: 'Complete Profile', description: 'Add your medical history securely.' },
        { number: '03', title: 'Connect & Care', description: 'Book doctors and track health.' }
    ];

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-primary selection:text-white">
            
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <img src="/logo.png" alt="VitaNips" className="h-10 w-auto" />
                            <span className={`ml-2 text-2xl font-extrabold tracking-tight ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>Vita<span className="text-primary">Nips</span></span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            {['Features', 'How it Works', 'Testimonials'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors relative group">
                                    {item}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                                </a>
                            ))}
                            {isAuthenticated ? (
                                <div className="flex items-center space-x-4">
                                    <Link to="/dashboard" className="text-gray-600 hover:text-primary font-medium transition-colors">Dashboard</Link>
                                    <Link to="/profile" className="bg-primary text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:bg-primary-dark transition-all transform hover:-translate-y-0.5">
                                        {user?.first_name || 'My Account'}
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link to="/login" className="text-gray-600 hover:text-primary font-bold transition-colors">Login</Link>
                                    <Link to="/register" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:bg-primary-dark transition-all transform hover:-translate-y-0.5">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-b from-green-50 to-transparent opacity-70 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -z-10 w-1/2 h-full bg-gradient-to-t from-blue-50 to-transparent opacity-70 blur-3xl"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-primary font-bold text-sm mb-6">
                                <SparklesIcon className="h-4 w-4 mr-2" />
                                #1 Healthcare Platform 2024
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
                                Your Health, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">Reimagined.</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Experience the future of healthcare management. Connect with top doctors, track your vitals, and manage prescriptions—all in one beautiful, secure app.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                {isAuthenticated ? (
                                    <Link 
                                        to="/dashboard" 
                                        className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:bg-primary-dark transition-all transform hover:-translate-y-1 inline-flex items-center justify-center"
                                    >
                                        Go to Dashboard
                                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link 
                                            to="/register" 
                                            className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:bg-primary-dark transition-all transform hover:-translate-y-1 inline-flex items-center justify-center"
                                        >
                                            Start Free Trial
                                            <ArrowRightIcon className="ml-2 h-5 w-5" />
                                        </Link>
                                        <button 
                                            onClick={() => setIsVideoModalOpen(true)}
                                            className="bg-white text-gray-700 border-2 border-gray-100 px-8 py-4 rounded-full font-bold text-lg hover:border-primary hover:text-primary transition-all inline-flex items-center justify-center group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <PlayIcon className="h-4 w-4 ml-0.5" />
                                            </div>
                                            Watch Demo
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            <div className="mt-10 flex items-center space-x-8 text-sm font-medium text-gray-500">
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                    HIPAA Compliant
                                </div>
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                    24/7 Support
                                </div>
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                    Cancel Anytime
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative z-10 bg-white rounded-3xl shadow-2xl shadow-primary/20 border border-gray-100 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 uppercase">Live Dashboard</div>
                                </div>
                                <div className="p-8 space-y-6">
                                    {/* Mock Dashboard Content */}
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md">
                                                <CalendarDaysIcon className="h-6 w-6" />
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="font-bold text-gray-900">Dr. Sarah Wilson</h4>
                                                <p className="text-sm text-blue-600">Cardiology Checkup • Tomorrow, 10 AM</p>
                                            </div>
                                        </div>
                                        <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">Confirmed</span>
                                    </div>

                                    <div className="flex space-x-4">
                                        <div className="flex-1 bg-red-50 p-4 rounded-2xl border border-red-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <HeartIcon className="h-6 w-6 text-red-500" />
                                                <span className="text-xs font-bold text-red-400">Heart Rate</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">72 <span className="text-sm font-normal text-gray-500">bpm</span></div>
                                        </div>
                                        <div className="flex-1 bg-green-50 p-4 rounded-2xl border border-green-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <BellAlertIcon className="h-6 w-6 text-green-500" />
                                                <span className="text-xs font-bold text-green-400">Meds</span>
                                            </div>
                                            <div className="text-sm font-bold text-gray-900">All Taken</div>
                                            <div className="w-full bg-green-200 h-1.5 rounded-full mt-2">
                                                <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <img src="https://i.pravatar.cc/100?img=5" alt="Doc" className="w-10 h-10 rounded-full border-2 border-white" />
                                            <div className="ml-3">
                                                <p className="text-sm font-bold text-gray-900">New Message</p>
                                                <p className="text-xs text-gray-500">Dr. Chen sent you a prescription update.</p>
                                            </div>
                                        </div>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating Elements */}
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="absolute -top-8 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 hidden md:block"
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => <img key={i} src={`https://i.pravatar.cc/100?img=${10+i}`} className="w-8 h-8 rounded-full border-2 border-white" alt="User" />)}
                                    </div>
                                    <div className="text-xs font-bold text-gray-600">500+ Doctors</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-10 bg-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
                        {stats.map((stat, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: stat.delay }}
                                className="text-center px-4"
                            >
                                <div className="text-3xl md:text-5xl font-extrabold text-white mb-1">{stat.number}</div>
                                <div className="text-primary-light text-sm md:text-base font-medium uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-primary font-bold uppercase tracking-wider mb-3">Features</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Everything you need for complete health management</h3>
                        <p className="text-lg text-gray-600">Powerful tools designed to simplify your healthcare journey, available right at your fingertips.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: feature.delay }}
                                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">Get started in 3 simple steps</h2>
                            <div className="space-y-10">
                                {steps.map((step, index) => (
                                    <div key={index} className="flex gap-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                            {step.number}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                                            <p className="text-gray-600">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10">
                                <Link to="/register" className="text-primary font-bold text-lg hover:underline flex items-center">
                                    Start your journey now <ArrowRightIcon className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl transform rotate-12"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                                alt="App usage" 
                                className="relative rounded-3xl shadow-2xl border-4 border-white transform -rotate-3 hover:rotate-0 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary"></div>
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to take control?</h2>
                    <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">Join thousands of users who trust VitaNips for their healthcare needs. Safe, secure, and simple.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/register" 
                            className="bg-white text-primary px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all transform hover:-translate-y-1"
                        >
                            Get Started for Free
                        </Link>
                        <Link 
                            to="/login" 
                            className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center mb-6">
                                <img src="/logo.png" alt="VitaNips" className="h-8 w-auto grayscale brightness-200" />
                                <span className="ml-2 text-2xl font-bold">VitaNips</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                Making healthcare accessible, manageable, and human-centric for everyone, everywhere.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-gray-200">Platform</h4>
                            <ul className="space-y-4 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">For Patients</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">For Doctors</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pharmacy Portal</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-6 text-gray-200">Company</h4>
                            <ul className="space-y-4 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-6 text-gray-200">Legal</h4>
                            <ul className="space-y-4 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm">© 2024 VitaNips Healthcare Inc. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            {/* Social Icons placeholders */}
                            <a href="#" className="text-gray-500 hover:text-white"><span className="sr-only">Twitter</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
                            <a href="#" className="text-gray-500 hover:text-white"><span className="sr-only">GitHub</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg></a>
                        </div>
                    </div>
                </div>
            </footer>

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
