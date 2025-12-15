import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
    HeartIcon, 
    GlobeAmericasIcon,
    TrophyIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

// Import local assets
import heroWomanImg from '../assets/images/hero-woman.png';
import lagosTexture from '../assets/images/lagos-texture.png';

const AboutPage: React.FC = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans selection:bg-accent selection:text-primary-900">
            <Header variant="landing" />
            
            <main className="flex-grow">
                {/* HERO SECTION - Poster Style */}
                <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                    <div className="max-w-[90rem] mx-auto">
                        <div className="bg-primary-900 rounded-[3rem] p-8 md:p-20 relative overflow-hidden text-white min-h-[85vh] flex flex-col justify-center">
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
                                 style={{ backgroundImage: `url(${lagosTexture})`, backgroundSize: 'cover' }}></div>
                            
                            {/* Content */}
                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                    >
                                        <span className="inline-block px-4 py-2 rounded-full border border-accent/30 text-accent font-bold text-sm tracking-widest uppercase mb-6">
                                            Our Story
                                        </span>
                                        <h1 className="text-6xl md:text-8xl font-display font-medium leading-[0.9] mb-8">
                                            We Are <br />
                                            <span className="text-accent italic">VitaNips.</span>
                                        </h1>
                                        <p className="text-xl md:text-2xl text-white/80 max-w-xl leading-relaxed font-light">
                                            Revolutionizing healthcare accessibility with technology that cares. We're on a mission to put your health back in your hands, <span className="text-white font-medium border-b border-accent">without the wahala.</span>
                                        </p>
                                    </motion.div>
                                    
                                    {/* Stats Poster */}
                                    <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-12">
                                        <div>
                                            <p className="text-4xl md:text-5xl font-display text-white mb-2">50k+</p>
                                            <p className="text-white/60 text-sm uppercase tracking-wider">Patients Served</p>
                                        </div>
                                        <div>
                                            <p className="text-4xl md:text-5xl font-display text-white mb-2">200+</p>
                                            <p className="text-white/60 text-sm uppercase tracking-wider">Verified Doctors</p>
                                        </div>
                                        <div>
                                            <p className="text-4xl md:text-5xl font-display text-white mb-2">24/7</p>
                                            <p className="text-white/60 text-sm uppercase tracking-wider">Support Active</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hero Image Composition */}
                                <div className="relative h-full min-h-[500px] hidden lg:block">
                                   {/* Removed blur effect */ }
                                   <motion.div 
                                      style={{ y }}
                                      className="relative z-10"
                                   >
                                       <img 
                                           src={heroWomanImg} 
                                           alt="Confident African Woman" 
                                           className="w-full h-auto object-cover rounded-[3rem] grayscale hover:grayscale-0 transition-all duration-700"
                                       />
                                       
                                       {/* Floating Badge */}
                                       <div className="absolute -bottom-10 -left-10 bg-[#FDFBF7] p-8 rounded-[2rem] shadow-xl max-w-xs transform -rotate-3">
                                            <p className="font-display text-2xl text-primary-900 leading-tight">
                                                Based in Lagos, building for <span className="text-primary-600">Africa.</span>
                                            </p>
                                       </div>
                                   </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* MISSION STATEMENT - Bold Typography */}
                <section className="py-24 px-4 bg-[#FDFBF7]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                             <div className="lg:col-span-4">
                                <span className="block w-16 h-1 bg-primary-900 mb-6"></span>
                                <h2 className="text-sm font-bold tracking-widest uppercase text-primary-900/60">Our Mission</h2>
                             </div>
                             <div className="lg:col-span-8">
                                <h3 className="text-4xl md:text-6xl font-display text-primary-900 leading-[1.1] mb-12">
                                    To bridge the gap in healthcare by creating a digital ecosystem that is <span className="text-primary-600">accessible, transparent,</span> and deeply personal.
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 group">
                                        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-900 transition-colors">
                                            <HeartIcon className="w-8 h-8 text-primary-900 group-hover:text-accent" />
                                        </div>
                                        <h4 className="text-2xl font-display text-primary-900 mb-3">Patient-Centric</h4>
                                        <p className="text-primary-900/70 text-lg">Everything we do starts with the patient's well-being. We treat you like family, not just a number.</p>
                                    </div>
                                    <div className="bg-primary-900 p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 group text-white">
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                                            <GlobeAmericasIcon className="w-8 h-8 text-white group-hover:text-primary-900" />
                                        </div>
                                        <h4 className="text-2xl font-display mb-3">Universal Access</h4>
                                        <p className="text-white/70 text-lg">Breaking down geographical barriers. High-quality care shouldn't depend on your postcode.</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </section>

                {/* FOUNDER SECTION - Magazine Layout */}
                <section className="py-24 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-[#F0FDF4] rounded-[3rem] p-8 md:p-0 overflow-hidden relative">
                            <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
                                {/* Image Side */}
                                <div className="relative min-h-[400px] lg:min-h-full order-2 lg:order-1">
                                    <img 
                                        src="/images/preciousimo.jpeg" 
                                        alt="Precious Imoniakemu" 
                                        className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-primary-900/20 mix-blend-multiply"></div>
                                </div>

                                {/* Text Side */}
                                <div className="p-8 md:p-20 flex flex-col justify-center order-1 lg:order-2">
                                    <h2 className="text-sm font-bold tracking-widest uppercase text-primary-600 mb-4">Leadership</h2>
                                    <h3 className="text-5xl md:text-7xl font-display text-primary-900 mb-8 leading-none">
                                        Meet the <span className="italic text-primary-600">Visionary.</span>
                                    </h3>
                                    <div className="prose prose-lg text-primary-900/80 mb-12">
                                        <p className="mb-6">
                                            Precious Imoniakemu is a visionary entrepreneur with a deep passion for leveraging technology to solve real-world problems.
                                        </p>
                                        <blockquote className="text-2xl font-display text-primary-900 border-l-4 border-accent pl-6 italic leading-relaxed">
                                            "We didn't just build an app; we built a lifeline. VitaNips is the result of seeing too many people struggle to access basic health services."
                                        </blockquote>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="px-8 py-4 bg-primary-900 text-white rounded-xl font-bold hover:bg-primary-800 transition-colors">
                                            Connect on LinkedIn
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* VALUES - Sticker Grid */}
                <section className="py-24 px-4 bg-[#FDFBF7]">
                     <div className="max-w-[90rem] mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-5xl md:text-7xl font-display text-primary-900 mb-6">Core Values</h2>
                            <p className="text-xl text-primary-900/60 font-medium">The principles that guide every decision we make.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            {[
                                { title: 'Integrity', desc: 'Transparency in all we do.', icon: TrophyIcon, color: 'bg-accent' },
                                { title: 'Innovation', desc: 'Pushing boundaries daily.', icon: SparklesIcon, color: 'bg-[#ff9f1c]' }, // Orange
                                { title: 'Empathy', desc: 'Understanding your needs.', icon: HeartIcon, color: 'bg-[#2ec4b6]' }, // Teal
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-12 rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col items-center">
                                    <div className={`w-24 h-24 ${item.color} rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-12 h-12 text-primary-900" />
                                    </div>
                                    <h3 className="text-3xl font-display text-primary-900 mb-4">{item.title}</h3>
                                    <p className="text-lg text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                     </div>
                </section>

                {/* CTA */}
                <section className="py-24 px-4 bg-primary-900 text-white overflow-hidden relative">
                     {/* Abstract Shapes */}
                     {/* Abstract Shapes - Removed blur */ }

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                         <h2 className="text-5xl md:text-8xl font-display mb-8">
                            Join the <span className="text-accent">Mission.</span>
                         </h2>
                         <p className="text-2xl text-white/80 mb-12 max-w-2xl mx-auto font-light">
                             Ready to experience better healthcare? Join Precious and the VitaNips team on our journey.
                         </p>
                         <a href="/register" className="inline-block px-12 py-5 bg-accent text-primary-900 rounded-full text-xl font-bold hover:bg-white transition-colors">
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
