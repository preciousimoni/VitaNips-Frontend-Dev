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
    QuestionMarkCircleIcon,
    ChevronDownIcon,
    ChatBubbleLeftRightIcon,
    EnvelopeIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';

const faqs = [
    {
        question: "How do I book an appointment?",
        answer: "You can book an appointment by navigating to the 'Appointments' section in your dashboard. Click on 'New Appointment', select your preferred doctor or specialty, choose a time slot, and confirm your booking."
    },
    {
        question: "Is my medical data secure?",
        answer: "Yes, absolutely. VitaNips uses bank-grade encryption and is fully HIPAA compliant. Your medical records are stored securely and are only accessible to you and the healthcare providers you explicitly authorize."
    },
    {
        question: "Can I cancel or reschedule an appointment?",
        answer: "Yes, you can cancel or reschedule appointments up to 24 hours before the scheduled time without any penalty. Go to 'My Appointments', select the appointment, and choose 'Cancel' or 'Reschedule'."
    },
    {
        question: "How do I get my prescription refills?",
        answer: "If you have an active prescription, you can request a refill directly from the 'Prescriptions' tab. Your doctor will review the request and send it to your selected pharmacy."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit/debit cards, HSA/FSA cards, and various insurance plans. You can manage your payment methods in the 'Settings' section."
    }
];

const categories = [
    { icon: UserCircleIcon, title: 'Account & Profile', desc: 'Manage your personal info and settings.' },
    { icon: CalendarDaysIcon, title: 'Appointments', desc: 'Booking, rescheduling, and history.' },
    { icon: ShieldCheckIcon, title: 'Privacy & Security', desc: 'Password, 2FA, and data privacy.' },
    { icon: CreditCardIcon, title: 'Billing & Insurance', desc: 'Payments, invoices, and coverage.' },
];

const HelpCenterPage: React.FC = () => {
    const [searchQuery, setSearchTerm] = useState('');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            
            <main className="flex-grow">
                {/* Search Hero */}
                <section className="bg-primary relative overflow-hidden py-20 lg:py-28">
                    <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">How can we help you today?</h1>
                            <div className="relative max-w-2xl mx-auto">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search for help articles (e.g., 'reset password')" 
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-lg focus:ring-4 focus:ring-primary-light/30 focus:outline-none text-lg text-gray-900"
                                    value={searchQuery}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer group"
                            >
                                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <cat.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{cat.title}</h3>
                                <p className="text-sm text-gray-500">{cat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* FAQs */}
                <section className="py-16 bg-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            <p className="text-gray-500 mt-2">Quick answers to common questions.</p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <button 
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-medium text-gray-900">{faq.question}</span>
                                        <ChevronDownIcon 
                                            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180' : ''}`} 
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {openFaqIndex === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="p-5 pt-0 text-gray-600 border-t border-gray-100 bg-gray-50/50">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Support */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-block p-3 bg-blue-50 rounded-full text-blue-600 mb-6">
                            <QuestionMarkCircleIcon className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Still need help?</h2>
                        <p className="text-gray-600 mb-10">Our dedicated support team is available 24/7 to assist you with any issues.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary mb-4" />
                                <h3 className="font-bold text-gray-900">Live Chat</h3>
                                <p className="text-sm text-gray-500 mb-4">Get instant answers.</p>
                                <button className="text-primary font-medium hover:underline">Start Chat</button>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                <EnvelopeIcon className="h-8 w-8 text-primary mb-4" />
                                <h3 className="font-bold text-gray-900">Email Support</h3>
                                <p className="text-sm text-gray-500 mb-4">Response within 24h.</p>
                                <a href="mailto:support@vitanips.com" className="text-primary font-medium hover:underline">support@vitanips.com</a>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                <PhoneIcon className="h-8 w-8 text-primary mb-4" />
                                <h3 className="font-bold text-gray-900">Phone Support</h3>
                                <p className="text-sm text-gray-500 mb-4">Mon-Fri, 9am-5pm.</p>
                                <a href="tel:+1-555-0123" className="text-primary font-medium hover:underline">+1 (555) 0123</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
};

export default HelpCenterPage;

