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
    SparklesIcon,
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 overflow-hidden mb-8"
            >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-5"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                            <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                <ShieldExclamationIcon className="h-12 w-12 text-white animate-pulse" />
                            </div>
                        </div>
                        <div className="text-white">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider mb-3 border border-white/30"
                            >
                                <BellAlertIcon className="h-4 w-4 mr-2 animate-pulse" />
                                Emergency Response Center
                            </motion.div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Emergency Center</h1>
                            <p className="text-white/90 text-base md:text-lg">
                                Quick access to emergency services and SOS alerts
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
                    </svg>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                {/* Emergency Contacts Banner */}
                <motion.div variants={itemVariants}>
                    <Link 
                        to="/emergency-contacts"
                        className="block bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 hover:border-purple-300 rounded-3xl p-8 transition-all hover:shadow-2xl shadow-lg group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg"
                                >
                                    <UserGroupIcon className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <h3 className="text-2xl font-bold text-purple-900 mb-2 group-hover:text-purple-700 transition-colors">
                                        Manage Your Emergency Contacts
                                    </h3>
                                    <p className="text-sm text-purple-700 font-medium">
                                        Add, edit, or remove trusted contacts who will receive your SOS alerts
                                    </p>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ x: 5 }}
                                className="flex-shrink-0"
                            >
                                <div className="p-3 bg-purple-200 rounded-xl group-hover:bg-purple-300 transition-colors">
                                    <ArrowRightIcon className="h-6 w-6 text-purple-700" />
                                </div>
                            </motion.div>
                        </div>
                    </Link>
                </motion.div>

                {/* Critical Warning Banner */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-3xl p-8 shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full blur-3xl opacity-40"></div>
                    <div className="relative flex items-start">
                        <div className="flex-shrink-0">
                            <div className="p-3 bg-amber-100 rounded-2xl">
                                <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
                            </div>
                        </div>
                        <div className="ml-5">
                            <h3 className="text-xl font-bold text-amber-900 mb-3">Life-Threatening Emergency?</h3>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                If you are in immediate danger, <strong className="font-bold">call emergency services directly</strong> using the numbers below. 
                                The SOS button will alert your emergency contacts but is not a substitute for professional emergency response.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* SOS Section - Hero */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-gradient-to-br from-red-600 via-red-700 to-orange-700 rounded-3xl shadow-2xl shadow-red-600/40 p-10 md:p-16 relative overflow-hidden border-2 border-red-400/20"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-300/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-white/30 rounded-3xl blur-2xl"></div>
                            <div className="relative w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/30">
                                <ShieldExclamationIcon className="h-12 w-12 text-white animate-pulse" />
                            </div>
                        </motion.div>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Emergency SOS</h2>
                            <p className="text-red-50 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
                                Press and hold the button below for <span className="font-bold text-white">3 seconds</span> to send an emergency alert with your location to all your emergency contacts
                            </p>
                        </div>
                        
                        <div className="py-8">
                            <SOSButton />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 text-red-50">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                                <MapPinIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Location shared automatically</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                                <BellAlertIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">All contacts notified</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Dial Emergency Numbers */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl">
                            <PhoneIcon className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Quick Dial Emergency Numbers</h2>
                            <p className="text-gray-600 text-sm">Tap any card to call immediately</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {emergencyContacts.map((contact, index) => (
                            <motion.a
                                key={index}
                                href={`tel:${contact.number}`}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -8 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-red-300 group cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                <div className="relative text-center">
                                    <motion.div 
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        className="text-6xl mb-4"
                                    >
                                        {contact.icon}
                                    </motion.div>
                                    <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-red-600 transition-colors">
                                        {contact.name}
                                    </h3>
                                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl py-3 px-4 mb-3">
                                        <p className="text-4xl font-black text-red-600">{contact.number}</p>
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium">{contact.description}</p>
                                </div>
                                <div className="mt-5 flex items-center justify-center text-sm text-white font-bold bg-gradient-to-r from-red-600 to-orange-600 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
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
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 border-2 border-blue-200 shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-40"></div>
                    <div className="relative">
                        <div className="flex items-start mb-8">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg"
                            >
                                <HeartIcon className="h-8 w-8 text-white" />
                            </motion.div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Emergency Preparedness Tips</h3>
                                <p className="text-gray-600 font-medium">Stay safe with these essential guidelines</p>
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
                                    className="flex items-start space-x-4 bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all border border-blue-100"
                                >
                                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md">
                                        {index + 1}
                                    </span>
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium pt-1">{tip}</p>
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

