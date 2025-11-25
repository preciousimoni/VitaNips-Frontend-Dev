import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
    HeartIcon, 
    UserGroupIcon, 
    SparklesIcon, 
    GlobeAmericasIcon,
    ClockIcon,
    CheckBadgeIcon,
    ShieldCheckIcon,
    RocketLaunchIcon,
    LightBulbIcon,
    UsersIcon,
    TrophyIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const AboutPage: React.FC = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
                    <motion.div 
                        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '40%']) }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl animate-blob animation-delay-4000"
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
                            <HeartIconSolid className="h-8 w-8 text-white" />
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
                            <UsersIcon className="h-7 w-7 text-white" />
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
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center border border-white/30">
                            <RocketLaunchIcon className="h-6 w-6 text-white" />
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
                                ABOUT VITANIPS
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                                We Are{' '}
                                <span className="relative inline-block">
                                    VitaNips
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
                                className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
                            >
                                Revolutionizing healthcare accessibility with technology that cares. We're on a mission to put your health back in your hands.
                            </motion.p>
                        </motion.div>
                    </div>

                    {/* Bottom Wave */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                            <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="white"/>
                        </svg>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
                    ></motion.div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-4"
                                >
                                    <TrophyIcon className="h-4 w-4 mr-2" />
                                    OUR MISSION
                                </motion.div>
                                <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                    Bridging the Gap in{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Healthcare</span>
                                </h3>
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                    At VitaNips, we believe that quality healthcare should be <span className="font-bold text-primary">accessible, transparent, and personalized</span>. We are building a digital ecosystem that connects patients, doctors, and pharmacies seamlessly, removing the barriers of distance and bureaucracy.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[
                                        {
                                            icon: HeartIcon,
                                            title: 'Patient-Centric',
                                            desc: 'Everything we do starts with the patient\'s well-being.',
                                            color: 'from-red-500 to-pink-500'
                                        },
                                        {
                                            icon: GlobeAmericasIcon,
                                            title: 'Universal Access',
                                            desc: 'Breaking down geographical barriers to care.',
                                            color: 'from-blue-500 to-cyan-500'
                                        }
                                    ].map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 group"
                                        >
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                                <item.icon className="h-6 w-6 text-white" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
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
                                    className="relative transform rotate-3 transition-all duration-500"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
                                    <img 
                                        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                                        alt="Medical Team" 
                                        className="relative rounded-3xl shadow-2xl border-4 border-white"
                                    />
                                </motion.div>

                                {/* Floating Badge */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center">
                                            <UsersIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Serving</p>
                                            <p className="text-lg font-bold text-gray-900">50K+ Users</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-24 bg-white relative overflow-hidden">
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
                    </div>

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
                                <StarIcon className="h-4 w-4 mr-2" />
                                WHY CHOOSE US
                            </motion.div>
                            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                Healthcare That{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Adapts to You</span>
                            </h3>
                            <p className="text-lg text-gray-600">Experience the difference with our patient-first approach</p>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             {[
                                {
                                    icon: ClockIcon,
                                    title: "24/7 Availability",
                                    description: "Access healthcare professionals and manage your needs anytime, anywhere.",
                                    gradient: "from-blue-500 to-cyan-500"
                                },
                                {
                                    icon: CheckBadgeIcon,
                                    title: "Verified Specialists",
                                    description: "Connect with board-certified doctors and licensed pharmacies you can trust.",
                                    gradient: "from-emerald-500 to-teal-500"
                                },
                                {
                                    icon: ShieldCheckIcon,
                                    title: "Secure & Private",
                                    description: "Your health data is encrypted and protected with bank-level security standards.",
                                    gradient: "from-purple-500 to-pink-500"
                                }
                             ].map((item, idx) => (
                                 <motion.div 
                                     key={idx}
                                     initial={{ opacity: 0, y: 30 }}
                                     whileInView={{ opacity: 1, y: 0 }}
                                     viewport={{ once: true }}
                                     transition={{ delay: idx * 0.1 }}
                                     whileHover={{ y: -10, scale: 1.02 }}
                                     className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 group relative overflow-hidden"
                                 >
                                     {/* Gradient Overlay on Hover */}
                                     <motion.div
                                         className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                     ></motion.div>

                                     <motion.div
                                         whileHover={{ rotate: 360, scale: 1.1 }}
                                         transition={{ duration: 0.6 }}
                                         className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg relative z-10`}
                                     >
                                         <item.icon className="h-8 w-8 text-white" />
                                     </motion.div>
                                     <h4 className="text-xl font-bold text-gray-900 mb-3 relative z-10 group-hover:text-primary transition-colors">{item.title}</h4>
                                     <p className="text-gray-600 leading-relaxed relative z-10">{item.description}</p>

                                     {/* Decorative Corner Element */}
                                     <motion.div
                                         initial={{ scale: 0 }}
                                         whileInView={{ scale: 1 }}
                                         viewport={{ once: true }}
                                         transition={{ delay: idx * 0.1 + 0.3 }}
                                         className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl"
                                     ></motion.div>
                                 </motion.div>
                             ))}
                        </div>
                     </div>
                </section>

                {/* Meet the Founder */}
                <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
                    {/* Decorative elements */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
                    ></motion.div>
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
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
                                <UserGroupIcon className="h-4 w-4 mr-2" />
                                LEADERSHIP
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Visionary</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                The driving force behind VitaNips and its mission to transform global healthcare.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative"
                        >
                            {/* Decorative gradient overlay */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>

                            <div className="grid grid-cols-1 lg:grid-cols-12">
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="lg:col-span-5 relative h-96 lg:h-auto group overflow-hidden"
                                >
                                    <motion.img 
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        src="/images/preciousimo.jpeg" 
                                        alt="Precious Imoniakemu" 
                                        className="absolute inset-0 w-full h-full object-cover object-center"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden"></div>
                                    <div className="absolute bottom-0 left-0 p-6 lg:hidden text-white">
                                        <h3 className="text-2xl font-bold">Precious Imoniakemu</h3>
                                        <p className="text-white/90 font-medium">Founder & CEO</p>
                                    </div>
                                </motion.div>
                                <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50/50 relative">
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="hidden lg:block mb-8"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-1 w-12 bg-gradient-to-r from-primary to-emerald-600 rounded-full"></div>
                                            <span className="text-sm font-bold text-primary uppercase tracking-wider">Founder & CEO</span>
                                        </div>
                                        <h3 className="text-4xl md:text-5xl font-black text-gray-900">Precious Imoniakemu</h3>
                                    </motion.div>
                                    
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 }}
                                        className="prose prose-lg text-gray-600 mb-8"
                                    >
                                        <p className="mb-4 leading-relaxed text-lg">
                                            Precious Imoniakemu is a <span className="font-bold text-gray-900">visionary entrepreneur</span> with a deep passion for leveraging technology to solve real-world problems. With a background in healthcare technology and a personal commitment to improving patient outcomes, Precious founded VitaNips to address the fragmentation in the current healthcare system.
                                        </p>
                                        <motion.blockquote 
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.4 }}
                                            className="relative border-l-4 border-primary pl-6 py-4 italic text-gray-700 text-lg my-6 bg-primary/5 rounded-r-xl"
                                        >
                                            <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full"></div>
                                            "We didn't just build an app; we built a <span className="font-bold text-primary">lifeline</span>. VitaNips is the result of seeing too many people struggle to access basic health services. Our goal is to make 'health in your pocket' a reality for everyone, everywhere."
                                        </motion.blockquote>
                                        <p className="text-lg">
                                            Under his leadership, VitaNips has grown from a simple concept into a <span className="font-bold text-gray-900">comprehensive ecosystem</span>, empowering thousands to take control of their health journey with confidence and ease.
                                        </p>
                                    </motion.div>

                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.6 }}
                                        className="flex flex-wrap gap-4 pt-4"
                                    >
                                        <motion.a 
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            href="#" 
                                            className="inline-flex items-center px-6 py-3 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:border-[#0077b5] hover:text-[#0077b5] transition-all"
                                        >
                                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                            Connect on LinkedIn
                                        </motion.a>
                                        <motion.a 
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            href="#" 
                                            className="inline-flex items-center px-6 py-3 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all"
                                        >
                                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                                            Follow on Twitter
                                        </motion.a>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Core Values */}
                <section className="py-24 bg-white relative overflow-hidden">
                    {/* Decorative Elements */}
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
                            className="text-center mb-16"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-4"
                            >
                                <LightBulbIcon className="h-4 w-4 mr-2" />
                                CORE VALUES
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                The Principles That{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Guide Us</span>
                            </h2>
                            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">Every decision we make is rooted in these fundamental beliefs</p>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { 
                                    title: 'Integrity', 
                                    desc: 'We operate with transparency and honesty in all our interactions.', 
                                    icon: ShieldCheckIcon,
                                    gradient: 'from-blue-500 to-indigo-500',
                                    bgColor: 'from-blue-50 to-indigo-50'
                                },
                                { 
                                    title: 'Innovation', 
                                    desc: 'Constantly pushing boundaries to improve healthcare delivery.', 
                                    icon: SparklesIcon,
                                    gradient: 'from-purple-500 to-pink-500',
                                    bgColor: 'from-purple-50 to-pink-50'
                                },
                                { 
                                    title: 'Empathy', 
                                    desc: 'Understanding and addressing the unique needs of every patient.', 
                                    icon: HeartIcon,
                                    gradient: 'from-red-500 to-rose-500',
                                    bgColor: 'from-red-50 to-rose-50'
                                },
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className={`bg-gradient-to-br ${item.bgColor} p-8 rounded-3xl text-center hover:shadow-2xl transition-all border border-gray-100 group relative overflow-hidden`}
                                >
                                    {/* Decorative gradient blob */}
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 180, 360]
                                        }}
                                        transition={{ duration: 10, repeat: Infinity }}
                                        className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-20 rounded-full blur-2xl`}
                                    ></motion.div>

                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                        className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10`}
                                    >
                                        <item.icon className="h-10 w-10 text-white" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-lg relative z-10">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* CTA */}
                <section className="py-24 bg-gradient-to-br from-primary via-emerald-600 to-teal-600 text-white text-center relative overflow-hidden">
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

                    <div className="max-w-4xl mx-auto px-4 relative z-10">
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
                                <RocketLaunchIcon className="h-5 w-5 mr-2" />
                                JOIN OUR MISSION
                            </motion.div>

                            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                                Ready to Experience{' '}
                                <span className="relative inline-block">
                                    Better Healthcare?
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
                                Join Precious and the VitaNips team on our journey to redefine health management.
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
                                    href="/register" 
                                    className="relative inline-flex items-center justify-center bg-white text-primary px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all group overflow-hidden"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gray-100"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '100%' }}
                                        transition={{ duration: 0.5 }}
                                    ></motion.div>
                                    <span className="relative z-10">Get Started Today</span>
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="relative z-10 ml-2"
                                    >
                                        <RocketLaunchIcon className="h-6 w-6" />
                                    </motion.div>
                                </motion.a>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                                className="mt-8 text-white/80 text-sm"
                            >
                                <p>✨ No credit card required • Free forever plan available</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
};

export default AboutPage;
