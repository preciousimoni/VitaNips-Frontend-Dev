import React from 'react';
import { Pharmacy } from '@types/pharmacy';
import { MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PharmacyCardProps {
    pharmacy: Pharmacy;
    onSelect: (pharmacy: Pharmacy) => void;
    isSelected?: boolean;
}

const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy, onSelect, isSelected }) => {
    return (
        <div 
            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all border-2 ${
                isSelected ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-transparent hover:border-gray-200'
            }`}
            onClick={() => onSelect(pharmacy)}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pharmacy.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{pharmacy.address}</span>
                    </div>
                </div>
                {pharmacy.offers_delivery && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Delivery
                    </span>
                )}
            </div>

            <div className="mt-3 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {pharmacy.phone_number}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {pharmacy.is_24_hours ? 'Open 24 Hours' : pharmacy.operating_hours}
                </div>
            </div>
        </div>
    );
};

export default PharmacyCard;
