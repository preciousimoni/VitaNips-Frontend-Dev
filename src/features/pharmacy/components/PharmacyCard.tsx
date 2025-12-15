import React from 'react';
import { motion } from 'framer-motion';
import { Pharmacy } from '../../../types/pharmacy';
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
            whileHover={{ y: -8 }}
            className={`group relative bg-white rounded-[2.5rem] p-6 transition-all duration-300 cursor-pointer overflow-hidden border-2 ${
                isSelected 
                    ? 'shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-primary-900 ring-4 ring-accent ring-offset-4' 
                    : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-black'
            }`}
            onClick={() => onSelect && onSelect(pharmacy)}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-4">
                        <h3 className="text-2xl font-black text-primary-900 leading-none font-display mb-3">
                            {pharmacy.name}
                        </h3>
                        <div className="flex items-start text-sm text-gray-600 bg-cream-50 rounded-xl p-3 border-2 border-primary-900/5">
                            <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-accent" />
                            <span className="line-clamp-2 font-bold">{pharmacy.address}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        {pharmacy.offers_delivery && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide bg-primary-900 text-white border-2 border-black -rotate-2 group-hover:rotate-0 transition-transform">
                                🚚 Delivery
                            </span>
                        )}
                        {isSelected && (
                            <CheckBadgeIcon className="h-8 w-8 text-accent drop-shadow-md" />
                        )}
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center text-sm font-bold text-gray-700">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mr-3 border-2 border-green-200 text-green-700">
                            <PhoneIcon className="h-5 w-5" />
                        </div>
                        <a href={`tel:${pharmacy.phone_number}`} className="hover:text-primary-900 transition-colors">
                            {pharmacy.phone_number}
                        </a>
                    </div>
                    <div className="flex items-center text-sm font-bold text-gray-700">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mr-3 border-2 border-blue-200 text-blue-700">
                            <ClockIcon className="h-5 w-5" />
                        </div>
                        {pharmacy.is_24_hours ? (
                            <span className="text-blue-700 font-black flex items-center uppercase tracking-wide">
                                <SparklesIcon className="h-4 w-4 mr-1.5" /> 24 Hours
                            </span>
                        ) : (
                            <span>{pharmacy.operating_hours}</span>
                        )}
                    </div>
                </div>

                {onSelect && (
                    <div className="mt-6 pt-2">
                        <button className="w-full py-4 rounded-xl bg-accent text-primary-900 font-black text-lg border-2 border-black hover:bg-black hover:text-white transition-all flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none">
                            Visit Store
                            <ArrowRightIcon className="h-5 w-5 ml-2 font-bold" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PharmacyCard;
