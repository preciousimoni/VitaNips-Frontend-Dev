import { Link } from 'react-router-dom';
import SOSButton from '../features/emergency/components/SOSButton';
import EmergencyServiceLocator from '../features/emergency/components/EmergencyServiceLocator';
import { 
    ShieldExclamationIcon, 
    PhoneIcon, 
    MapPinIcon,
    HeartIcon,
    ExclamationTriangleIcon,
    UserGroupIcon,
    ArrowRightIcon,
    BellAlertIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const EmergencyPage = () => {
    const emergencyContacts = [
        { name: 'Emergency Services', number: '112', icon: '🚨', description: 'Police, Fire, Ambulance' },
        { name: 'Ambulance', number: '199', icon: '🚑', description: 'Medical Emergency' },
        { name: 'Police', number: '191', icon: '🚔', description: 'Security Emergency' },
        { name: 'Fire Service', number: '192', icon: '🚒', description: 'Fire Emergency' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 font-sans pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-red-600 rounded-b-[3rem] overflow-hidden mb-12 shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mx-4 mt-4 md:mx-6 border-b-4 border-l-4 border-r-4 border-black"
            >
                <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row items-start md:items-center gap-6"
                    >
                        <div className="relative">
                            <div className="relative p-4 bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-3deg]">
                                <ShieldExclamationIcon className="h-12 w-12 text-red-600" />
                            </div>
                        </div>
                        <div className="text-white">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center px-4 py-2 rounded-xl bg-black text-white text-xs font-black uppercase tracking-widest mb-3 border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                            >
                                <BellAlertIcon className="h-4 w-4 mr-2 animate-pulse" />
                                Emergency Response Center
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 font-display uppercase tracking-tight text-white drop-shadow-md">
                                Emergency Center
                            </h1>
                            <p className="text-white font-bold text-lg md:text-xl opacity-90 max-w-xl">
                                Quick access to emergency services and SOS alerts.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-10"
                >
                {/* Emergency Contacts Banner */}
                <motion.div variants={itemVariants}>
                    <Link 
                        to="/emergency-contacts"
                        className="block bg-white border-4 border-black rounded-[2.5rem] p-8 transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group relative overflow-hidden"
                    >
                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <UserGroupIcon className="h-10 w-10 text-purple-900" />
                                </motion.div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black text-primary-900 mb-2 font-display uppercase tracking-tight group-hover:text-purple-700 transition-colors">
                                        Manage Your Emergency Contacts
                                    </h3>
                                    <p className="text-base text-gray-700 font-bold max-w-xl">
                                        Add, edit, or remove trusted contacts who will receive your SOS alerts.
                                    </p>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ x: 5 }}
                                className="flex-shrink-0"
                            >
                                <div className="p-4 bg-primary-900 rounded-xl border-2 border-black group-hover:bg-purple-600 transition-colors">
                                    <ArrowRightIcon className="h-6 w-6 text-white" />
                                </div>
                            </motion.div>
                        </div>
                    </Link>
                </motion.div>

                {/* Critical Warning Banner */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-amber-100 border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
                >
                    <div className="relative flex flex-col sm:flex-row items-start gap-5">
                        <div className="flex-shrink-0">
                            <div className="p-3 bg-amber-400 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <ExclamationTriangleIcon className="h-8 w-8 text-black" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-black mb-2 uppercase tracking-tight">Life-Threatening Emergency?</h3>
                            <p className="text-base text-black font-bold leading-relaxed">
                                If you are in immediate danger, <strong className="font-black text-red-600 underline decoration-2 underline-offset-2">call emergency services directly</strong> using the numbers below. 
                                The SOS button will alert your emergency contacts but is not a substitute for professional emergency response.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* SOS Section - Hero */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-red-600 rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 relative overflow-hidden border-4 border-black"
                >
                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                            className="relative"
                        >
                            <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-3">
                                <ShieldExclamationIcon className="h-12 w-12 text-red-600 animate-pulse" />
                            </div>
                        </motion.div>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 font-display uppercase tracking-tight drop-shadow-md">Emergency SOS</h2>
                            <p className="text-white text-lg md:text-xl max-w-2xl leading-relaxed font-bold">
                                Press and hold the button below for <span className="font-black text-amber-300 bg-black/20 px-2 rounded-lg">3 seconds</span> to send an emergency alert with your location to all your emergency contacts.
                            </p>
                        </div>
                        
                        <div className="py-6">
                            <SOSButton />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 text-white font-bold">
                            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl border-2 border-black/30">
                                <MapPinIcon className="h-5 w-5" />
                                <span className="text-sm">Location shared automatically</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl border-2 border-black/30">
                                <BellAlertIcon className="h-5 w-5" />
                                <span className="text-sm">All contacts notified</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Dial Emergency Numbers */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-red-100 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <PhoneIcon className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-primary-900 font-display uppercase tracking-tight">Quick Dial Numbers</h2>
                            <p className="text-gray-600 font-bold">Tap any card to call immediately</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {emergencyContacts.map((contact, index) => (
                            <motion.a
                                key={index}
                                href={`tel:${contact.number}`}
                                variants={itemVariants}
                                whileHover={{ y: -6, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black cursor-pointer group relative overflow-hidden"
                            >
                                <div className="relative text-center">
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="text-6xl mb-4 transform transition-transform"
                                    >
                                        {contact.icon}
                                    </motion.div>
                                    <h3 className="font-black text-primary-900 mb-2 text-xl font-display uppercase tracking-tight">
                                        {contact.name}
                                    </h3>
                                    <div className="bg-red-50 rounded-xl py-3 px-4 mb-3 border-2 border-red-100 group-hover:bg-red-100 group-hover:border-red-200 transition-colors">
                                        <p className="text-3xl font-black text-red-600">{contact.number}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 font-black uppercase tracking-wider">{contact.description}</p>
                                </div>
                                <div className="mt-5 flex items-center justify-center text-sm text-white font-bold bg-red-600 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <PhoneIcon className="h-4 w-4 mr-2" />
                                    Tap to call
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </motion.div>

                {/* Emergency Services Locator */}
                <motion.div variants={itemVariants}>
                    <EmergencyServiceLocator />
                </motion.div>

                {/* Safety Tips */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-blue-50 rounded-[2.5rem] p-8 md:p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
                >
                    <div className="relative">
                        <div className="flex flex-col md:flex-row items-start mb-8 gap-5">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                            >
                                <HeartIcon className="h-8 w-8 text-white" />
                            </motion.div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-primary-900 mb-2 font-display uppercase tracking-tight">Emergency Preparedness Tips</h3>
                                <p className="text-gray-700 font-bold text-lg">Stay safe with these essential guidelines</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-5">
                            {[
                                'Keep emergency contacts updated in your profile',
                                'Share your location when using the SOS feature',
                                'Know the nearest hospital or emergency center',
                                'Keep a first aid kit accessible at home',
                                'Save important medical information in the app',
                                'Stay calm and provide clear information to responders'
                            ].map((tip, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    whileHover={{ x: 5 }}
                                    className="flex items-start space-x-4 bg-white rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                                >
                                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                                        {index + 1}
                                    </span>
                                    <p className="text-sm text-gray-800 leading-relaxed font-bold pt-1">{tip}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
            </div>
        </div>
    );
};

export default EmergencyPage;

