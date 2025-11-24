import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, MapPinIcon, ClockIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface LocationPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAllow: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ isOpen, onClose, onAllow }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                    >
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                                    <MapPinIcon className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Find Pharmacies Near You</h2>
                                <p className="text-emerald-50 text-sm">
                                    Enable location access to discover the closest pharmacies in your area and get faster service
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Benefits */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPinIcon className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Accurate Distance</h3>
                                    <p className="text-sm text-gray-600">
                                        See exact distances and find pharmacies within your preferred radius
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <ClockIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Save Time</h3>
                                    <p className="text-sm text-gray-600">
                                        Quickly locate the nearest pharmacy and get your medications faster
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <TruckIcon className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Delivery Options</h3>
                                    <p className="text-sm text-gray-600">
                                        Check which nearby pharmacies offer delivery to your location
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <ShieldCheckIcon className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Privacy Protected</h3>
                                    <p className="text-sm text-gray-600">
                                        Your location is only used for this search and is never stored
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
                            <button
                                onClick={onAllow}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Enable Location Access
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 px-6 rounded-xl transition-colors border border-gray-200"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LocationPermissionModal;

