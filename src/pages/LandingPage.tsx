import React from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowRightIcon,
    PlayCircleIcon,
    ChatBubbleBottomCenterTextIcon,
    BuildingStorefrontIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { SEO } from '../components/common/SEO';

// Local Bespoke Assets (Generated & Moved)
import heroImg from '../assets/images/hero-woman.png';
import doctorImg from '../assets/images/doctor-friendly.png';
import textureImg from '../assets/images/lagos-texture.png';

const LandingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    
    // SEO Structured Data for Landing Page
    const landingPageStructuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: "VitaNips - Nigeria's #1 Healthcare Platform",
            description: "VitaNips (vitanips.com) - Nigeria's leading digital healthcare platform. Book online doctor consultations, order prescriptions, connect with pharmacies, and manage your health records.",
            url: 'https://vitanips.com/',
            mainEntity: {
                '@type': 'MedicalBusiness',
                name: 'VitaNips',
                description: "Nigeria's leading digital healthcare platform providing online doctor consultations, pharmacy services, and comprehensive health management.",
                url: 'https://vitanips.com',
                telephone: '+234-XXX-XXXX',
                address: {
                    '@type': 'PostalAddress',
                    addressCountry: 'NG',
                    addressRegion: 'Lagos',
                },
                areaServed: {
                    '@type': 'Country',
                    name: 'Nigeria',
                },
                medicalSpecialty: [
                    'General Practice',
                    'Telemedicine',
                    'Pharmacy Services',
                    'Emergency Medicine',
                ],
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: 'Telemedicine',
            provider: {
                '@type': 'Organization',
                name: 'VitaNips',
                url: 'https://vitanips.com',
            },
            areaServed: {
                '@type': 'Country',
                name: 'Nigeria',
            },
            description: 'Online doctor consultations via video call. Connect with verified Nigerian doctors instantly.',
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: 'Pharmacy Services',
            provider: {
                '@type': 'Organization',
                name: 'VitaNips',
                url: 'https://vitanips.com',
            },
            areaServed: {
                '@type': 'Country',
                name: 'Nigeria',
            },
            description: 'Prescription delivery service. Order authentic medications from trusted pharmacies.',
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Review',
            itemReviewed: {
                '@type': 'Organization',
                name: 'VitaNips',
            },
            reviewBody: "I used to take a whole day off work just to refill my hypertension meds. VitaNips changed my life.",
            author: {
                '@type': 'Person',
                name: 'Bisi Adebayo',
            },
            reviewRating: {
                '@type': 'Rating',
                ratingValue: '5',
                bestRating: '5',
            },
        },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-900 selection:bg-accent selection:text-black overflow-x-hidden">
            <SEO
                title="VitaNips - Nigeria's #1 Healthcare Platform | Online Doctor Consultations, Pharmacy & Health Management"
                description="VitaNips (vitanips.com) - Nigeria's leading digital healthcare platform. Book online doctor consultations, order prescriptions, connect with pharmacies, manage health records, and access emergency services. Skip the traffic, queues, and stress. Your health, sorted."
                keywords="vitanips, vitanips.com, www.vitanips.com, online doctor consultation Nigeria, telemedicine Nigeria, online pharmacy Nigeria, health management platform, book doctor appointment online, virtual doctor consultation, health records Nigeria, prescription delivery Nigeria, emergency health services, healthcare app Nigeria, digital health Nigeria, medical consultation online"
                url="https://vitanips.com/"
                structuredData={landingPageStructuredData}
            />
            <Header variant="landing" />

            <main>
                {/* HERO SECTION - SPLIT POSTER LAYOUT */}
                <section className="relative pt-20 lg:pt-0 lg:h-screen lg:min-h-[800px] flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full">
                        
                        {/* Left: Typography & Content */}
                        <div className="flex flex-col justify-center px-6 sm:px-12 lg:pl-24 lg:pr-12 pt-12 lg:pt-0 z-10 order-2 lg:order-1">
                            <div className="inline-block mb-6">
                                <span className="text-primary-700 font-bold tracking-widest uppercase text-xs border-b-2 border-accent pb-1">Nigeria's #1 Health Platform</span>
                            </div>
                            
                            <h1 className="text-6xl md:text-7xl xl:text-8xl font-display font-medium leading-[0.9] text-primary-900 mb-8 tracking-tight">
                                Health <br/>
                                <span className="font-sans font-light italic text-5xl md:text-6xl text-gray-400 block my-2">without the</span>
                                <span className="text-accent inline-block relative">
                                    Wahala.
                                </span>
                            </h1>
                            
                            <p className="text-xl text-gray-600 max-w-lg leading-relaxed mb-12">
                                Stop treating your health like a hustle. Skip the traffic, the queues, and the stress. Access verified doctors from your phone, wherever you are.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-5">
                                <Link to={isAuthenticated ? "/dashboard" : "/register"} className="bg-primary hover:bg-primary-800 text-white px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20">
                                    {isAuthenticated ? "Go to Dashboard" : "Start Free"}
                                    <ArrowRightIcon className="w-5 h-5" />
                                </Link>
                                <Link to="/about" className="flex items-center gap-3 px-6 py-4 rounded-full border border-gray-200 hover:border-accent hover:bg-accent/5 transition-all font-bold text-gray-700">
                                    <PlayCircleIcon className="w-6 h-6 text-accent" />
                                    <span>See Stories</span>
                                </Link>
                            </div>

                            {/* Trust Strip */}
                            <div className="mt-16 border-t border-gray-200 pt-8 flex items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                                <span className="font-display font-bold text-xl">Lagos</span>
                                <span className="font-display font-bold text-xl">Abuja</span>
                                <span className="font-display font-bold text-xl">Port Harcourt</span>
                                <span className="font-display font-bold text-xl">Kano</span>
                            </div>
                        </div>

                        {/* Right: Full Bleed Image */}
                        <div className="relative h-[50vh] lg:h-full w-full order-1 lg:order-2 overflow-hidden">
                            <img src={heroImg} alt="Nigerian woman laughing" className="w-full h-full object-cover object-center" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-transparent to-transparent lg:w-32"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent lg:hidden h-32 bottom-0 top-auto"></div>
                        </div>
                    </div>
                </section>

                {/* THE "HUSTLE" SECTION - Textured Background */}
                <section className="relative py-32 bg-primary-900 text-white overflow-hidden">
                    {/* Abstract Texture Background */}
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay">
                        <img src={textureImg} alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            <div className="flex-1">
                                <h2 className="text-4xl md:text-6xl font-display font-medium leading-tight mb-8">
                                    Why do we accept <br/>
                                    <span className="text-accent italic">stress</span> as part of the diagnosis?
                                </h2>
                                <p className="text-xl text-primary-100 leading-relaxed opacity-90">
                                    In Lagos, a 15-minute appointment often costs you 5 hours of your day. The traffic. The waiting room. The "Doctor is not around".
                                </p>
                            </div>
                            <div className="flex-1 border-l-2 border-accent pl-8 md:pl-16">
                                <p className="text-2xl font-display font-medium mb-6">"I used to take a whole day off work just to refill my hypertension meds. VitaNips changed my life."</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-primary-900 font-bold text-xl">B</div>
                                    <div>
                                        <p className="font-bold">Bisi Adebayo</p>
                                        <p className="text-sm text-primary-300">Verified Patient, Ikeja</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES - Large "Magazine" Cards */}
                <section className="py-24 px-4 bg-white" id="features">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Card 1: Doctor */}
                            <Link to="/doctors" className="group relative rounded-[3rem] overflow-hidden aspect-[4/5] md:aspect-[3/4] shadow-2xl cursor-pointer block">
                                <img src={doctorImg} alt="Friendly Doctor" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-8 md:p-12">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
                                        <UserGroupIcon className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-display font-medium text-white mb-4">Talk to a Doctor. Now.</h3>
                                    <p className="text-gray-300 text-lg mb-8 max-w-md">No appointments needed. Connect with verified Nigerian specialists via video in minutes.</p>
                                    <span className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-sm">
                                        Start Consultation <ArrowRightIcon className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>

                            <div className="flex flex-col gap-8">
                                {/* Card 2: Pharmacy */}
                                <Link to="/pharmacies" className="flex-1 bg-primary-50 rounded-[3rem] p-8 md:p-12 flex flex-col justify-center relative overflow-hidden group hover:bg-primary-100 transition-colors block">
                                    <div className="absolute top-0 right-0 -m-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
                                    <BuildingStorefrontIcon className="w-12 h-12 text-primary-800 mb-6" />
                                    <h3 className="text-3xl font-display font-medium text-primary-900 mb-4">Pharmacy Connect.</h3>
                                    <p className="text-primary-800 text-lg mb-6 leading-relaxed">
                                        We partner with trusted names like MedPlus and HealthPlus. authentic drugs, delivered to your doorstep.
                                    </p>
                                    <span className="self-start px-6 py-3 bg-white text-primary-900 rounded-xl font-bold hover:shadow-lg transition-all inline-block">
                                        Find Pharmacy
                                    </span>
                                </Link>

                                {/* Card 3: Chat */}
                                <Link to="/contact" className="flex-1 bg-accent rounded-[3rem] p-8 md:p-12 flex flex-col justify-center relative overflow-hidden group hover:brightness-105 transition-all block">
                                     <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-primary-900 mb-6" />
                                     <h3 className="text-3xl font-display font-medium text-primary-900 mb-4">24/7 Chat Support.</h3>
                                     <p className="text-primary-900/80 text-lg leading-relaxed">
                                        Got a quick question? Our medical team is online round the clock. No question is too small.
                                     </p>
                                </Link>
                            </div>

                        </div>
                    </div>
                </section>

                {/* FINAL CTA - Minimalist */}
                <section className="py-32 bg-[#FDFBF7] text-center border-t border-gray-100">
                    <div className="max-w-3xl mx-auto px-6">
                        <h2 className="text-6xl md:text-8xl font-display font-medium text-primary-900 mb-8 tracking-tighter">
                            Your Health.<br/>
                            <span className="text-accent">Sorted.</span>
                        </h2>
                        <div className="flex justify-center gap-6 mt-12">
                             <Link to="/register" className="bg-primary-900 text-white px-12 py-6 rounded-full text-xl font-bold hover:bg-black transition-colors">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
