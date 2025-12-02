import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
    PhoneIcon,
    SparklesIcon,
    ClockIcon,
    MapPinIcon,
    ArrowRightIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentSubscription } from '../api/payments';
import { UserSubscription } from '../types/payments';

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
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [searchQuery, setSearchTerm] = useState('');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [showChatSupport, setShowChatSupport] = useState(false);
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

    useEffect(() => {
        const loadSubscription = async () => {
            if (user) {
                try {
                    const sub = await getCurrentSubscription();
                    setSubscription(sub);
                } catch (err) {
                    console.error('Failed to load subscription:', err);
                }
            }
        };
        loadSubscription();
    }, [user]);

    const subscriptionTier = subscription?.plan?.tier || 'free';
    const has24_7Support = subscriptionTier === 'premium' || subscriptionTier === 'family';

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

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
                            <QuestionMarkCircleIcon className="h-8 w-8 text-white" />
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
                            <ChatBubbleLeftRightIcon className="h-7 w-7 text-white" />
                        </div>
                    </motion.div>

                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
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
                                HELP & SUPPORT
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                                How Can We{' '}
                                <span className="relative inline-block">
                                    Help You?
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
                                Find answers, get support, or reach out to our team
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="relative max-w-2xl mx-auto"
                            >
                                <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 z-10" />
                                <input 
                                    type="text" 
                                    placeholder="Search for help articles (e.g., 'reset password')" 
                                    className="w-full pl-16 pr-6 py-5 rounded-2xl shadow-2xl focus:ring-4 focus:ring-white/30 focus:outline-none text-lg text-gray-900 border-2 border-white/20"
                                    value={searchQuery}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
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

                {/* Categories */}
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
                            className="text-center mb-12"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-4"
                            >
                                BROWSE BY TOPIC
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                Popular{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Help Topics</span>
                            </h2>
                            <p className="text-xl text-gray-600">Quick access to the most common questions</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((cat, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 cursor-pointer group relative overflow-hidden"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                    ></motion.div>

                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg relative z-10"
                                    >
                                        <cat.icon className="h-8 w-8 text-white" />
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 group-hover:text-primary transition-colors">{cat.title}</h3>
                                    <p className="text-gray-600 relative z-10">{cat.desc}</p>

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

                {/* FAQs */}
                <section className="py-24 bg-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                                <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
                                FAQS
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                Frequently Asked{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Questions</span>
                            </h2>
                            <p className="text-xl text-gray-600">Quick answers to common questions</p>
                        </motion.div>

                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                                >
                                    <button 
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
                                    >
                                        <span className="font-bold text-gray-900 text-lg pr-4">{faq.question}</span>
                                        <motion.div
                                            animate={{ rotate: openFaqIndex === idx ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex-shrink-0"
                                        >
                                            <ChevronDownIcon className="h-6 w-6 text-primary" />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {openFaqIndex === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="px-6 pb-6 text-gray-600 text-lg leading-relaxed border-t border-gray-100 pt-4 bg-gradient-to-b from-gray-50/50 to-transparent">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Support */}
                <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"
                    ></motion.div>

                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                                GET IN TOUCH
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                Still Need{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Help?</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                {has24_7Support 
                                    ? 'Our dedicated support team is available 24/7 to assist you with any issues'
                                    : 'Get help from our support team. Upgrade to Premium or Family Plan for 24/7 support.'}
                            </p>
                            {has24_7Support && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 border border-green-200 rounded-full text-green-700 font-semibold mt-4"
                                >
                                    <ClockIcon className="h-5 w-5" />
                                    <span>24/7 Support Active</span>
                                </motion.div>
                            )}
                        </motion.div>
                        
                        {has24_7Support && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mb-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl"
                            >
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                                            <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black mb-2">24/7 Live Chat Support</h3>
                                            <p className="text-white/90">
                                                Get instant help from our support team anytime, day or night. Average response time: 2 minutes.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowChatSupport(true)}
                                        className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all whitespace-nowrap"
                                    >
                                        Start Live Chat
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                            {[
                                {
                                    icon: ChatBubbleLeftRightIcon,
                                    title: 'Live Chat',
                                    subtitle: 'Get instant answers',
                                    detail: 'Average response: 2 minutes',
                                    action: 'Start Chat',
                                    gradient: 'from-blue-500 to-cyan-500',
                                    link: '#'
                                },
                                {
                                    icon: EnvelopeIcon,
                                    title: 'Email Support',
                                    subtitle: 'Response within 24h',
                                    detail: 'support@vitanips.com',
                                    action: 'Send Email',
                                    gradient: 'from-emerald-500 to-teal-500',
                                    link: 'mailto:support@vitanips.com'
                                },
                                {
                                    icon: PhoneIcon,
                                    title: 'Phone Support',
                                    subtitle: 'Mon-Fri, 9am-5pm WAT',
                                    detail: '+234 (0) 123 4567',
                                    action: 'Call Now',
                                    gradient: 'from-purple-500 to-pink-500',
                                    link: 'tel:+2340123456789'
                                }
                            ].map((contact, index) => (
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
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${contact.gradient} flex items-center justify-center mb-6 shadow-lg relative z-10 mx-auto`}
                                    >
                                        <contact.icon className="h-8 w-8 text-white" />
                                    </motion.div>
                                    
                                    <div className="text-center relative z-10">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{contact.title}</h3>
                                        <p className="text-gray-600 mb-1">{contact.subtitle}</p>
                                        <p className="text-sm font-bold text-primary mb-6">{contact.detail}</p>
                                        
                                        <motion.a
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            href={contact.link}
                                            className={`inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r ${contact.gradient} text-white font-bold shadow-lg hover:shadow-xl transition-all`}
                                        >
                                            {contact.action}
                                            <ArrowRightIcon className="h-5 w-5 ml-2" />
                                        </motion.a>
                                    </div>

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

                        {/* Office Location */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-primary/5 to-emerald-500/5 p-8 md:p-12 rounded-3xl border border-primary/10"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center">
                                            <MapPinIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">Visit Our Office</h3>
                                    </div>
                                    <p className="text-gray-600 mb-4 text-lg">
                                        <strong className="text-gray-900">VitaNips Healthcare Inc.</strong><br />
                                        123 Health Street, Victoria Island<br />
                                        Lagos, Nigeria
                                    </p>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <ClockIcon className="h-5 w-5 text-primary" />
                                        <span>Monday - Friday: 9:00 AM - 6:00 PM WAT</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-4">Quick Response Times</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Live Chat</span>
                                            <span className="font-bold text-primary">~2 mins</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Email</span>
                                            <span className="font-bold text-primary">~24 hours</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Phone</span>
                                            <span className="font-bold text-primary">Immediate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
};

export default HelpCenterPage;

