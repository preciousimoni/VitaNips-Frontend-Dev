import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
    EnvelopeIcon, 
    PhoneIcon, 
    MapPinIcon, 
    PaperAirplaneIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
            
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 bg-gradient-to-br from-primary via-emerald-600 to-teal-600 overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white"
                    >
                        <h1 className="text-4xl md:text-6xl font-black mb-6">Get in Touch</h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            Have questions or feedback? We'd love to hear from you. Our team is here to help.
                        </p>
                    </motion.div>
                    
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </section>

                <section className="py-16 lg:py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                            {/* Contact Info */}
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6">
                                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                                    CONTACT US
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                    Let's Start a Conversation
                                </h2>
                                <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                                    Whether you're curious about features, a free trial, or even press—we're ready to answer any and all questions.
                                </p>

                                <div className="space-y-8">
                                    {[
                                        {
                                            icon: EnvelopeIcon,
                                            title: "Email Us",
                                            content: "support@vitanips.com",
                                            sub: "We'll respond within 24 hours",
                                            color: "bg-blue-100 text-blue-600"
                                        },
                                        {
                                            icon: PhoneIcon,
                                            title: "Call Us",
                                            content: "+234 (0) 123 4567",
                                            sub: "Mon-Fri from 9am to 6pm WAT",
                                            color: "bg-green-100 text-green-600"
                                        },
                                        {
                                            icon: MapPinIcon,
                                            title: "Visit Us",
                                            content: "123 Health Street, Victoria Island",
                                            sub: "Lagos, Nigeria",
                                            color: "bg-purple-100 text-purple-600"
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-6 group">
                                            <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                                                <item.icon className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                                                <p className="text-lg font-medium text-gray-900">{item.content}</p>
                                                <p className="text-sm text-gray-500">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Contact Form */}
                            <motion.div 
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-8">Send us a message</h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-white"
                                        >
                                            <option value="">Select a topic</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="support">Technical Support</option>
                                            <option value="billing">Billing & Subscription</option>
                                            <option value="partnership">Partnership Opportunities</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                                            placeholder="How can we help you?"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                                    >
                                        {isSubmitting ? (
                                            'Sending...'
                                        ) : (
                                            <>
                                                Send Message
                                                <PaperAirplaneIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
};

export default ContactPage;
