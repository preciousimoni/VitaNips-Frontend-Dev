import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
    MagnifyingGlassIcon, 
    UserCircleIcon, 
    CreditCardIcon, 
    CalendarDaysIcon, 
    ShieldCheckIcon, 
    ChevronDownIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const faqs = [
    {
        question: "How do I book an appointment?",
        answer: "Go to your dashboard, click 'New Appointment', select a doctor, and pick a time. It's that simple."
    },
    {
        question: "Is my medical data secure?",
        answer: "Yes. Bank-grade 256-bit encryption. We are fully HIPAA compliant."
    },
    {
        question: "Can I cancel an appointment?",
        answer: "Yes, up to 24 hours before the time without penalty."
    },
    {
        question: "How do prescriptions work?",
        answer: "Your doctor sends the script digitally. You choose a pharmacy, and we deliver it."
    }
];

const categories = [
    { icon: UserCircleIcon, title: 'My Account', desc: 'Profile & Settings' },
    { icon: CalendarDaysIcon, title: 'Appointments', desc: 'Booking & History' },
    { icon: ShieldCheckIcon, title: 'Security', desc: 'Privacy & Data' },
    { icon: CreditCardIcon, title: 'Billing', desc: 'Payments & Plans' },
];

const HelpCenterPage: React.FC = () => {
    const [searchQuery, setSearchTerm] = useState('');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
            <Header variant="landing" />
            
            <main className="flex-grow pt-32 pb-20 px-4">
                {/* HERO SEARCH */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h1 className="text-5xl md:text-7xl font-display text-primary-900 mb-6">
                        How can we <span className="text-primary-600 italic">help?</span>
                    </h1>
                    
                    <div className="relative max-w-2xl mx-auto">
                        <input 
                            type="text" 
                            placeholder="Search (e.g. 'Reset Password')" 
                            className="w-full pl-8 pr-16 py-6 rounded-[2rem] shadow-xl shadow-primary-900/5 focus:shadow-2xl focus:outline-none text-xl text-primary-900 border-2 border-transparent focus:border-primary-900 transition-all placeholder:text-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary-900 rounded-full flex items-center justify-center">
                            <MagnifyingGlassIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* CATEGORIES GRID */}
                <div className="max-w-6xl mx-auto mb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group text-center hover:-translate-y-1">
                                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent transition-colors">
                                    <cat.icon className="h-8 w-8 text-primary-900" />
                                </div>
                                <h3 className="text-xl font-bold text-primary-900 mb-1">{cat.title}</h3>
                                <p className="text-gray-500 text-sm">{cat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQS & CONTACT */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                    {/* FAQ List */}
                    <div className="lg:col-span-7">
                        <h2 className="text-4xl font-display text-primary-900 mb-8">Common Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-md transition-shadow">
                                    <button 
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <span className="font-bold text-primary-900 text-lg">{faq.question}</span>
                                        <ChevronDownIcon className={`h-6 w-6 text-primary-900 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openFaqIndex === idx && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 text-gray-600 text-lg leading-relaxed">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Support Card */}
                    <div className="lg:col-span-5">
                         <div className="bg-primary-900 rounded-[3rem] p-10 text-white relative overflow-hidden sticky top-32">
                             {/* Removed blur effect */}
                             
                             <ChatBubbleLeftRightIcon className="w-12 h-12 text-accent mb-6" />
                             <h3 className="text-3xl font-display mb-4">Still stuck?</h3>
                             <p className="text-white/70 mb-8 text-lg">
                                 Our support team is just a click away. We usually reply in under 5 minutes.
                             </p>
                             <a href="/contact" className="block w-full py-4 bg-white text-primary-900 font-bold text-center rounded-xl hover:bg-accent transition-colors">
                                 Contact Support
                             </a>
                         </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HelpCenterPage;
