import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
    BriefcaseIcon,
    MapPinIcon,
    ClockIcon,
    CurrencyDollarIcon,
    SparklesIcon,
    RocketLaunchIcon,
    HeartIcon,
    UsersIcon,
    AcademicCapIcon,
    TrophyIcon,
    LightBulbIcon,
    GlobeAltIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const CareerPage: React.FC = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

    const departments = [
        { id: 'all', name: 'All Positions', icon: BriefcaseIcon },
        { id: 'engineering', name: 'Engineering', icon: RocketLaunchIcon },
        { id: 'product', name: 'Product', icon: LightBulbIcon },
        { id: 'design', name: 'Design', icon: SparklesIcon },
        { id: 'medical', name: 'Medical', icon: HeartIcon },
        { id: 'business', name: 'Business', icon: TrophyIcon }
    ];

    const openPositions = [
        {
            id: 1,
            title: 'Senior Full-Stack Engineer',
            department: 'engineering',
            location: 'Remote / Lagos, Nigeria',
            type: 'Full-time',
            salary: '₦8M - ₦15M',
            description: 'Build scalable healthcare solutions that impact thousands of lives.',
            requirements: ['5+ years experience', 'React & Node.js', 'Healthcare experience preferred']
        },
        {
            id: 2,
            title: 'Product Designer (UI/UX)',
            department: 'design',
            location: 'Remote / Lagos, Nigeria',
            type: 'Full-time',
            salary: '₦6M - ₦10M',
            description: 'Design beautiful, intuitive experiences for patients and healthcare providers.',
            requirements: ['3+ years experience', 'Figma expertise', 'Healthcare design experience']
        },
        {
            id: 3,
            title: 'Medical Content Specialist',
            department: 'medical',
            location: 'Lagos, Nigeria',
            type: 'Full-time',
            salary: '₦5M - ₦8M',
            description: 'Create accurate, accessible medical content for our platform.',
            requirements: ['Medical degree required', 'Strong writing skills', 'Digital health interest']
        },
        {
            id: 4,
            title: 'Product Manager',
            department: 'product',
            location: 'Remote / Lagos, Nigeria',
            type: 'Full-time',
            salary: '₦7M - ₦12M',
            description: 'Drive product strategy and execution for our telehealth platform.',
            requirements: ['4+ years PM experience', 'Healthcare background', 'Data-driven mindset']
        },
        {
            id: 5,
            title: 'Business Development Manager',
            department: 'business',
            location: 'Lagos, Nigeria',
            type: 'Full-time',
            salary: '₦6M - ₦10M',
            description: 'Expand partnerships with hospitals, clinics, and pharmacies.',
            requirements: ['3+ years BD experience', 'Healthcare network', 'Strong negotiation skills']
        },
        {
            id: 6,
            title: 'DevOps Engineer',
            department: 'engineering',
            location: 'Remote',
            type: 'Full-time',
            salary: '₦7M - ₦12M',
            description: 'Build and maintain our cloud infrastructure for reliability and scale.',
            requirements: ['4+ years DevOps', 'AWS/GCP experience', 'Security-first mindset']
        }
    ];

    const benefits = [
        {
            icon: CurrencyDollarIcon,
            title: 'Competitive Salary',
            description: 'Industry-leading compensation packages with equity options',
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            icon: HeartIcon,
            title: 'Health Coverage',
            description: 'Comprehensive health insurance for you and your family',
            gradient: 'from-red-500 to-pink-500'
        },
        {
            icon: GlobeAltIcon,
            title: 'Remote Flexibility',
            description: 'Work from anywhere with flexible hours and unlimited PTO',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            icon: AcademicCapIcon,
            title: 'Learning Budget',
            description: 'Annual budget for courses, conferences, and professional development',
            gradient: 'from-purple-500 to-indigo-500'
        },
        {
            icon: UsersIcon,
            title: 'Team Events',
            description: 'Regular team offsites, social events, and wellness activities',
            gradient: 'from-orange-500 to-amber-500'
        },
        {
            icon: RocketLaunchIcon,
            title: 'Career Growth',
            description: 'Clear career paths with mentorship and leadership opportunities',
            gradient: 'from-teal-500 to-cyan-500'
        }
    ];

    const values = [
        {
            title: 'Impact First',
            description: 'Every line of code, every design decision, every strategy - it all serves our mission to improve healthcare access.',
            icon: TrophyIcon
        },
        {
            title: 'Collaborative Spirit',
            description: 'We believe the best solutions come from diverse perspectives working together toward a common goal.',
            icon: UsersIcon
        },
        {
            title: 'Continuous Learning',
            description: 'Healthcare and technology evolve rapidly. We invest in our team\'s growth and encourage curiosity.',
            icon: AcademicCapIcon
        },
        {
            title: 'Work-Life Harmony',
            description: 'We build sustainable products with sustainable practices. Your well-being matters as much as our mission.',
            icon: HeartIconSolid
        }
    ];

    const filteredPositions = selectedDepartment === 'all' 
        ? openPositions 
        : openPositions.filter(pos => pos.department === selectedDepartment);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
            
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-primary via-emerald-600 to-teal-600">
                    {/* Animated Background Elements */}
                    <motion.div 
                        style={{ y }}
                        className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-blob"
                    ></motion.div>
                    <motion.div 
                        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '30%']) }}
                        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"
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
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center border border-white/30">
                            <BriefcaseIcon className="h-8 w-8 text-white" />
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
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center border border-white/30">
                            <RocketLaunchIcon className="h-7 w-7 text-white" />
                        </div>
                    </motion.div>
                    
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-sm mb-6"
                            >
                                <SparklesIcon className="h-5 w-5 mr-2" />
                                JOIN OUR MISSION
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                                Build the Future of{' '}
                                <span className="relative inline-block">
                                    Healthcare
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.8, duration: 0.8 }}
                                        className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400/30"
                                    ></motion.div>
                                </span>
                            </h1>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8"
                            >
                                Join a team of passionate innovators working to make quality healthcare accessible to everyone, everywhere.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="flex flex-wrap items-center justify-center gap-8 text-white/90"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-6 w-6" />
                                    <span className="font-medium">Remote-First</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-6 w-6" />
                                    <span className="font-medium">Equity Options</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-6 w-6" />
                                    <span className="font-medium">Impact-Driven</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Bottom Wave */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                            <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="white"/>
                        </svg>
                    </div>
                </section>

                {/* Why Join Us */}
                <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
                    ></motion.div>

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
                                <HeartIcon className="h-4 w-4 mr-2" />
                                WHY VITANIPS
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                More Than Just a{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Job</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                We're building something meaningful, and we want you to be part of it
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 group"
                                >
                                    <div className="flex items-start gap-6">
                                        <motion.div
                                            whileHover={{ rotate: 360, scale: 1.1 }}
                                            transition={{ duration: 0.6 }}
                                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0"
                                        >
                                            <value.icon className="h-7 w-7 text-white" />
                                        </motion.div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                                                {value.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed text-lg">
                                                {value.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-24 bg-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
                    </div>

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
                                PERKS & BENEFITS
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                We Take Care of{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Our Team</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Competitive benefits designed to help you thrive professionally and personally
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 group relative overflow-hidden"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                    ></motion.div>

                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 shadow-lg relative z-10`}
                                    >
                                        <benefit.icon className="h-8 w-8 text-white" />
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10 group-hover:text-primary transition-colors">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed relative z-10">
                                        {benefit.description}
                                    </p>

                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.3 }}
                                        className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl"
                                    ></motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Open Positions */}
                <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
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
                            className="text-center mb-12"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-4"
                            >
                                <BriefcaseIcon className="h-4 w-4 mr-2" />
                                OPEN POSITIONS
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                Find Your{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Perfect Role</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                                We're hiring talented individuals across multiple departments
                            </p>
                        </motion.div>

                        {/* Department Filter */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-wrap justify-center gap-3 mb-12"
                        >
                            {departments.map((dept, index) => (
                                <motion.button
                                    key={dept.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedDepartment(dept.id)}
                                    className={`inline-flex items-center px-6 py-3 rounded-full font-bold text-sm transition-all ${
                                        selectedDepartment === dept.id
                                            ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/30'
                                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    <dept.icon className="h-5 w-5 mr-2" />
                                    {dept.name}
                                </motion.button>
                            ))}
                        </motion.div>

                        {/* Job Listings */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredPositions.map((position, index) => (
                                <motion.div
                                    key={position.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -5, scale: 1.01 }}
                                    className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 group relative overflow-hidden"
                                >
                                    {/* Gradient accent */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-600"></div>
                                    
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                                {position.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed mb-4">
                                                {position.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mb-6">
                                        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                                            <MapPinIcon className="h-4 w-4 mr-1.5" />
                                            {position.location}
                                        </div>
                                        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-100">
                                            <ClockIcon className="h-4 w-4 mr-1.5" />
                                            {position.type}
                                        </div>
                                        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                                            <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                                            {position.salary}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">Key Requirements:</h4>
                                        <ul className="space-y-2">
                                            {position.requirements.map((req, idx) => (
                                                <li key={idx} className="flex items-start text-sm text-gray-600">
                                                    <CheckCircleIcon className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                                                    {req}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gradient-to-r from-primary to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl transition-all inline-flex items-center justify-center group"
                                    >
                                        Apply Now
                                        <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>

                        {filteredPositions.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16"
                            >
                                <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-600">No positions available in this department at the moment.</p>
                                <p className="text-gray-500 mt-2">Check back soon or explore other departments!</p>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 bg-gradient-to-br from-primary via-emerald-600 to-teal-600 text-white text-center relative overflow-hidden">
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

                    <div className="max-w-4xl mx-auto px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                                Don't See Your{' '}
                                <span className="relative inline-block">
                                    Dream Role?
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400/30"
                                    ></motion.div>
                                </span>
                            </h2>
                            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
                                We're always looking for exceptional talent. Send us your resume and let's talk!
                            </p>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.a 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href="mailto:careers@vitanips.com" 
                                    className="relative inline-flex items-center justify-center bg-white text-primary px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all group overflow-hidden"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gray-100"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '100%' }}
                                        transition={{ duration: 0.5 }}
                                    ></motion.div>
                                    <span className="relative z-10">Get in Touch</span>
                                    <ArrowRightIcon className="h-6 w-6 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </motion.a>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                                className="mt-8 text-white/80 text-sm"
                            >
                                <p>📧 careers@vitanips.com • We typically respond within 48 hours</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
};

export default CareerPage;

