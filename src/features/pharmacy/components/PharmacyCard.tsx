import React from 'react';
import { Pharmacy } from '@types/pharmacy';
import { MapPinIcon, PhoneIcon, ClockIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface PharmacyCardProps {
    pharmacy: Pharmacy;
    onSelect?: (pharmacy: Pharmacy) => void;
    isSelected?: boolean;
}

const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy, onSelect, isSelected }) => {
    return (
        <div 
            className={`group relative bg-white rounded-3xl p-6 transition-all duration-300 ${
                isSelected 
                    ? 'shadow-xl ring-2 ring-emerald-500 ring-offset-2 scale-[1.02]' 
                    : 'shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-100'
            }`}
            onClick={() => onSelect && onSelect(pharmacy)}
        >
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-6 -mt-6 opacity-60 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-4">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                            {pharmacy.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-start">
                            <MapPinIcon className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                            <span className="line-clamp-2">{pharmacy.address}</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        {pharmacy.offers_delivery && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                                Delivery
                            </span>
                        )}
                        {isSelected && (
                            <CheckBadgeIcon className="h-6 w-6 text-emerald-500" />
                        )}
                    </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-gray-50">
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <PhoneIcon className="h-4 w-4" />
                        </div>
                        {pharmacy.phone_number}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <ClockIcon className="h-4 w-4" />
                        </div>
                        {pharmacy.is_24_hours ? (
                            <span className="text-emerald-600 font-medium flex items-center">
                                <SparklesIcon className="h-3 w-3 mr-1" /> Open 24 Hours
                            </span>
                        ) : (
                            pharmacy.operating_hours
                        )}
                    </div>
                </div>

                {onSelect && (
                    <div className="mt-5 pt-2">
                        <button className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-200">
                            Select Pharmacy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyCard;
