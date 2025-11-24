import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
    HeartIcon, 
    UserGroupIcon, 
    SparklesIcon, 
    GlobeAmericasIcon,
    ClockIcon,
    CheckBadgeIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
            
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 overflow-hidden bg-gray-900">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-gray-900/95"></div>
                    
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                                We Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">VitaNips</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Revolutionizing healthcare accessibility with technology that cares. We're on a mission to put your health back in your hands.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-primary font-bold uppercase tracking-wider mb-2">Our Mission</h2>
                                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Bridging the Gap in Healthcare</h3>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    At VitaNips, we believe that quality healthcare should be accessible, transparent, and personalized. We are building a digital ecosystem that connects patients, doctors, and pharmacies seamlessly, removing the barriers of distance and bureaucracy.
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-start">
                                        <HeartIcon className="h-6 w-6 text-primary mt-1 mr-3" />
                                        <div>
                                            <h4 className="font-bold text-gray-900">Patient-Centric</h4>
                                            <p className="text-sm text-gray-500">Everything we do starts with the patient's well-being.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <GlobeAmericasIcon className="h-6 w-6 text-primary mt-1 mr-3" />
                                        <div>
                                            <h4 className="font-bold text-gray-900">Universal Access</h4>
                                            <p className="text-sm text-gray-500">Breaking down geographical barriers to care.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-primary/10 rounded-3xl transform rotate-3"></div>
                                <img 
                                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                                    alt="Medical Team" 
                                    className="relative rounded-3xl shadow-xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us - NEW SECTION */}
                <section className="py-20 bg-gray-50">
                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-primary font-bold uppercase tracking-wider mb-2">Why Choose Us</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Healthcare That Adapts to You</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             {[
                                {
                                    icon: ClockIcon,
                                    title: "24/7 Availability",
                                    description: "Access healthcare professionals and manage your needs anytime, anywhere."
                                },
                                {
                                    icon: CheckBadgeIcon,
                                    title: "Verified Specialists",
                                    description: "Connect with board-certified doctors and licensed pharmacies you can trust."
                                },
                                {
                                    icon: ShieldCheckIcon,
                                    title: "Secure & Private",
                                    description: "Your health data is encrypted and protected with bank-level security standards."
                                }
                             ].map((item, idx) => (
                                 <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                     <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                                         <item.icon className="h-6 w-6" />
                                     </div>
                                     <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                                     <p className="text-gray-600">{item.description}</p>
                                 </div>
                             ))}
                        </div>
                     </div>
                </section>

                {/* Meet the Founder */}
                <section className="py-24 bg-white relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet the Visionary</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                The driving force behind VitaNips and its mission to transform global healthcare.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="grid grid-cols-1 lg:grid-cols-12">
                                <div className="lg:col-span-5 relative h-96 lg:h-auto group overflow-hidden">
                                    <img 
                                        src="/images/preciousimo.jpeg" 
                                        alt="Precious Imoniakemu" 
                                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Fallback
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden"></div>
                                    <div className="absolute bottom-0 left-0 p-6 lg:hidden text-white">
                                        <h3 className="text-2xl font-bold">Precious Imoniakemu</h3>
                                        <p className="text-white/90 font-medium">Founder & CEO</p>
                                    </div>
                                </div>
                                <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50">
                                    <div className="hidden lg:block mb-8 border-l-4 border-primary pl-6">
                                        <h3 className="text-4xl font-bold text-gray-900">Precious Imoniakemu</h3>
                                        <p className="text-xl text-primary font-medium mt-1">Founder & CEO</p>
                                    </div>
                                    
                                    <div className="prose prose-lg text-gray-600 mb-8">
                                        <p className="mb-4 leading-relaxed">
                                            Precious Imoniakemu is a visionary entrepreneur with a deep passion for leveraging technology to solve real-world problems. With a background in healthcare technology and a personal commitment to improving patient outcomes, Precious founded VitaNips to address the fragmentation in the current healthcare system.
                                        </p>
                                        <blockquote className="border-l-4 border-primary/30 pl-4 italic text-gray-700 text-lg my-6">
                                            "We didn't just build an app; we built a lifeline. VitaNips is the result of seeing too many people struggle to access basic health services. Our goal is to make 'health in your pocket' a reality for everyone, everywhere."
                                        </blockquote>
                                        <p>
                                            Under his leadership, VitaNips has grown from a simple concept into a comprehensive ecosystem, empowering thousands to take control of their health journey with confidence and ease.
                                        </p>
                                    </div>

                                    <div className="flex space-x-4 pt-4">
                                        <a href="#" className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                            <span className="sr-only">LinkedIn</span>
                                            <svg className="h-5 w-5 text-[#0077b5] mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                            Connect on LinkedIn
                                        </a>
                                        <a href="#" className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                            <span className="sr-only">Twitter</span>
                                            <svg className="h-5 w-5 text-[#1DA1F2] mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                                            Follow
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Values */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
                            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">The principles that guide every decision we make.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: 'Integrity', desc: 'We operate with transparency and honesty in all our interactions.', icon: ShieldCheckIcon },
                                { title: 'Innovation', desc: 'Constantly pushing boundaries to improve healthcare delivery.', icon: SparklesIcon },
                                { title: 'Empathy', desc: 'Understanding and addressing the unique needs of every patient.', icon: HeartIcon },
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    whileHover={{ y: -5 }}
                                    className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all border border-gray-100"
                                >
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-gray-100">
                                        <item.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* CTA */}
                <section className="py-20 bg-primary text-white text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                    <div className="max-w-4xl mx-auto px-4 relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Better Healthcare?</h2>
                        <p className="text-xl text-primary-100 mb-10">Join Precious and the VitaNips team on our journey to redefine health management.</p>
                        <a href="/register" className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 shadow-xl transition-transform transform hover:-translate-y-1 inline-block">
                            Get Started Today
                        </a>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
};

export default AboutPage;
