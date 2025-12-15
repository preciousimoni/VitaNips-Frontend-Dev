import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
    BriefcaseIcon,
    MapPinIcon,
    ClockIcon,
    SparklesIcon,
    RocketLaunchIcon,
    HeartIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const CareerPage: React.FC = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

    const departments = [
        { id: 'all', name: 'All Roles' },
        { id: 'engineering', name: 'Engineering' },
        { id: 'product', name: 'Product' },
        { id: 'medical', name: 'Medical' },
    ];

    const openPositions = [
        {
            id: 1,
            title: 'Senior Full-Stack Engineer',
            department: 'engineering',
            location: 'Lagos (Hybrid)',
            type: 'Full-time',
            salary: '₦8M - ₦15M',
            description: 'Build scalable healthcare solutions that impact thousands of lives.',
        },
        {
            id: 2,
            title: 'Product Designer (UI/UX)',
            department: 'product',
            location: 'Remote',
            type: 'Full-time',
            salary: '₦6M - ₦10M',
            description: 'Design beautiful, intuitive experiences for patients and healthcare providers.',
        },
        {
            id: 3,
            title: 'Medical Content Specialist',
            department: 'medical',
            location: 'Lagos',
            type: 'Contract',
            salary: '₦300k/month',
            description: 'Create accurate, accessible medical content for our platform.',
        }
    ];

    const filteredPositions = selectedDepartment === 'all' 
        ? openPositions 
        : openPositions.filter(pos => pos.department === selectedDepartment);

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
            <Header variant="landing" />
            
            <main className="flex-grow">
                {/* HERO */}
                <section className="relative pt-32 pb-20 px-4">
                    <div className="max-w-[85rem] mx-auto text-center">
                        <span className="inline-block px-6 py-2 rounded-full bg-accent/20 text-primary-900 border border-accent/40 font-bold text-sm tracking-widest uppercase mb-8">
                            We're Hiring
                        </span>
                        <h1 className="text-6xl md:text-9xl font-display font-medium text-primary-900 mb-8 leading-[0.9]">
                            Build the <br/>
                            <span className="text-primary-600 italic">Future of Health.</span>
                        </h1>
                        <p className="text-xl text-primary-900/60 max-w-2xl mx-auto font-medium">
                            Join a team of passionate innovators working to make quality healthcare accessible to everyone, everywhere.
                        </p>
                    </div>
                </section>

                {/* IMAGES GRID - "Team Vibe" */}
                <section className="py-12 overflow-hidden">
                    <div className="flex gap-6 justify-center max-w-[120rem] mx-auto px-4">
                         {/* Placeholder colored blocks representing team photos */}
                         <div className="w-[300px] h-[400px] bg-primary-900 rounded-[2rem] -rotate-3 mt-12 overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center text-white/20 font-display text-4xl">Team</div>
                         </div>
                         <div className="w-[300px] h-[400px] bg-[#2ec4b6] rounded-[2rem] rotate-2 overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center text-white/20 font-display text-4xl">Culture</div>
                         </div>
                         <div className="w-[300px] h-[400px] bg-accent rounded-[2rem] -rotate-1 mt-8 overflow-hidden relative">
                             <div className="absolute inset-0 flex items-center justify-center text-primary-900/20 font-display text-4xl">Impact</div>
                         </div>
                         <div className="w-[300px] h-[400px] bg-primary-100 rounded-[2rem] rotate-3 overflow-hidden relative">
                             <div className="absolute inset-0 flex items-center justify-center text-primary-900/20 font-display text-4xl">Growth</div>
                         </div>
                    </div>
                </section>

                {/* JOB LISTINGS */}
                <section className="py-24 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-wrap justify-center gap-4 mb-16">
                            {departments.map((dept) => (
                                <button
                                    key={dept.id}
                                    onClick={() => setSelectedDepartment(dept.id)}
                                    className={`px-8 py-3 rounded-xl font-bold transition-all ${
                                        selectedDepartment === dept.id
                                            ? 'bg-primary-900 text-white scale-105'
                                            : 'bg-white text-primary-900 border border-gray-200 hover:border-primary-900'
                                    }`}
                                >
                                    {dept.name}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {filteredPositions.map((pos) => (
                                <div key={pos.id} className="group relative bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 hover:border-primary-900 transition-all duration-300 hover:shadow-xl cursor-pointer">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 text-sm font-bold text-primary-600 mb-2 uppercase tracking-wide">
                                                <span>{pos.department}</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                                                <span>{pos.type}</span>
                                            </div>
                                            <h3 className="text-3xl font-display text-primary-900 mb-2">{pos.title}</h3>
                                            <div className="flex items-center gap-4 text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPinIcon className="w-4 h-4" /> {pos.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <BriefcaseIcon className="w-4 h-4" /> {pos.salary}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto mt-4 md:mt-0">
                                             <span className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center group-hover:bg-primary-900 group-hover:text-white transition-colors">
                                                 <ArrowRightIcon className="w-5 h-5" />
                                             </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredPositions.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-300">
                                    <h3 className="text-2xl font-display text-primary-900 mb-2">No open roles here.</h3>
                                    <p className="text-gray-500">Check back later or check other departments!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* VALUES SECTION - "Why Us" */}
                <section className="py-24 px-4 bg-primary-900 text-white rounded-t-[3rem] mt-12">
                     <div className="max-w-7xl mx-auto">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div>
                                <h2 className="text-5xl font-display mb-8">More Than a Job.</h2>
                                <p className="text-xl text-white/70 leading-relaxed mb-8">
                                    We believe that work should be meaningful. When you join VitaNips, you're not just writing code or designing screens — you're literally saving lives by making healthcare accessible.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'Competitive Local Salary & Equity',
                                        'Remote-First Culture',
                                        'Comprehensive HMO (Gold Tier)',
                                        'MacBook Pro for all Engineers'
                                    ].map((perk, idx) => (
                                        <li key={idx} className="flex items-center gap-4 text-lg font-medium">
                                            <CheckCircleIcon className="w-6 h-6 text-accent" />
                                            {perk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/10">
                                <h3 className="text-3xl font-display text-accent mb-6">Our Culture</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-primary-800 p-6 rounded-2xl">
                                        <SparklesIcon className="w-8 h-8 text-white mb-4" />
                                        <h4 className="font-bold text-lg mb-2">Impact First</h4>
                                        <p className="text-sm text-white/60">We focus on outcomes, not hours.</p>
                                    </div>
                                    <div className="bg-primary-800 p-6 rounded-2xl">
                                        <HeartIcon className="w-8 h-8 text-white mb-4" />
                                        <h4 className="font-bold text-lg mb-2">Health First</h4>
                                        <p className="text-sm text-white/60">We practice what we preach.</p>
                                    </div>
                                </div>
                            </div>
                         </div>
                     </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default CareerPage;
