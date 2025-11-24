import React from 'react';
import { motion } from 'framer-motion';
import { Pharmacy } from '@types/pharmacy';
import { MapPinIcon, PhoneIcon, ClockIcon, CheckBadgeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface PharmacyCardProps {
    pharmacy: Pharmacy;
    onSelect?: (pharmacy: Pharmacy) => void;
    isSelected?: boolean;
}

const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy, onSelect, isSelected }) => {
    return (
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`group relative bg-white rounded-3xl p-6 transition-all duration-300 cursor-pointer overflow-hidden ${
                isSelected 
                    ? 'shadow-2xl ring-2 ring-emerald-500 ring-offset-2' 
                    : 'shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-emerald-200'
            }`}
            onClick={() => onSelect && onSelect(pharmacy)}
        >
            {/* Decorative gradient blobs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl -mr-8 -mt-8 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-emerald-100 rounded-full blur-2xl -ml-6 -mb-6 opacity-30 group-hover:opacity-60 transition-opacity"></div>
            
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-4">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors mb-2">
                            {pharmacy.name}
                        </h3>
                        <div className="flex items-start text-sm text-gray-600 bg-gray-50 group-hover:bg-emerald-50 rounded-lg p-2 transition-colors">
                            <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-emerald-500" />
                            <span className="line-clamp-2">{pharmacy.address}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        {pharmacy.offers_delivery && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                            >
                                🚚 Delivery
                            </motion.span>
                        )}
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                            >
                                <CheckBadgeIcon className="h-7 w-7 text-emerald-500" />
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center text-sm text-gray-700 font-medium">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mr-3 group-hover:from-emerald-50 group-hover:to-teal-50 group-hover:text-emerald-600 transition-all shadow-sm">
                            <PhoneIcon className="h-5 w-5" />
                        </div>
                        <a href={`tel:${pharmacy.phone_number}`} className="hover:text-emerald-600 transition-colors">
                            {pharmacy.phone_number}
                        </a>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 font-medium">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mr-3 group-hover:from-emerald-50 group-hover:to-teal-50 group-hover:text-emerald-600 transition-all shadow-sm">
                            <ClockIcon className="h-5 w-5" />
                        </div>
                        {pharmacy.is_24_hours ? (
                            <span className="text-emerald-600 font-bold flex items-center">
                                <SparklesIcon className="h-4 w-4 mr-1.5 animate-pulse" /> Open 24 Hours
                            </span>
                        ) : (
                            <span>{pharmacy.operating_hours}</span>
                        )}
                    </div>
                </div>

                {onSelect && (
                    <motion.div 
                        className="mt-5 pt-2"
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                    >
                        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center shadow-lg hover:shadow-xl group/btn">
                            Select Pharmacy
                            <ArrowRightIcon className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default PharmacyCard;
