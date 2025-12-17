import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
    EnvelopeIcon, 
    MapPinIcon, 
    PaperAirplaneIcon,
    ChatBubbleBottomCenterTextIcon
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Message sent! We'll reply shortly.");
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
            <Header variant="landing" />
            
            <main className="flex-grow pt-28 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-6xl md:text-8xl font-display text-primary-900 mb-6">
                            Say <span className="text-primary-600 italic">Hello.</span>
                        </h1>
                        <p className="text-xl text-primary-900/60 max-w-xl mx-auto">
                            Got a question about your health, our platform, or just want to chat? We're all ears.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Info Cards Side */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            {/* Card 1: Chat */}
                            <div className="bg-primary-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden group">
                                {/* Removed blur effect */}
                                <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-accent mb-6" />
                                <h3 className="text-3xl font-display mb-2">Live Chat</h3>
                                <p className="text-white/70 mb-8">Available 24/7 for urgent medical queries.</p>
                                <button className="px-6 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors w-full text-left flex justify-between items-center group-hover:pl-8">
                                    Start Chat <span className="text-accent">→</span>
                                </button>
                            </div>

                            {/* Card 2: Email */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                                <EnvelopeIcon className="w-12 h-12 text-primary-900 mb-6" />
                                <h3 className="text-3xl font-display text-primary-900 mb-2">Email Us</h3>
                                <p className="text-gray-500 mb-4">For partnerships & general inquiries.</p>
                                <a href="mailto:info@vitanips.com" className="text-xl font-bold text-primary-600 border-b-2 border-accent hover:text-primary-900">
                                    info@vitanips.com
                                </a>
                            </div>

                             {/* Card 3: Office */}
                             <div className="bg-[#e9f5db] rounded-[2.5rem] p-10">
                                <MapPinIcon className="w-12 h-12 text-primary-900 mb-6" />
                                <h3 className="text-3xl font-display text-primary-900 mb-2">Visit Us</h3>
                                <p className="text-primary-900/70 text-lg leading-relaxed">
                                    123 Health Street,<br/>
                                    Victoria Island, Lagos.<br/>
                                    Nigeria.
                                </p>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl shadow-primary-900/5">
                                <h2 className="text-4xl font-display text-primary-900 mb-8">Send a Message</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-primary-900 uppercase tracking-wider">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-primary-900 outline-none transition-all font-medium text-lg"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-primary-900 uppercase tracking-wider">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-primary-900 outline-none transition-all font-medium text-lg"
                                                placeholder="you@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-primary-900 uppercase tracking-wider">Subject</label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-primary-900 outline-none transition-all font-medium text-lg appearance-none cursor-pointer"
                                        >
                                            <option value="">Select a topic...</option>
                                            <option value="support">Technical Support</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-primary-900 uppercase tracking-wider">Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-primary-900 outline-none transition-all font-medium text-lg resize-none"
                                            placeholder="How can we help?"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-5 bg-primary-900 text-white rounded-2xl font-bold text-xl hover:bg-primary-800 transition-all flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                        {!isSubmitting && <PaperAirplaneIcon className="w-6 h-6" />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactPage;
