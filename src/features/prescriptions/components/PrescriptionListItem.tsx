// src/features/prescriptions/components/PrescriptionListItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    CalendarDaysIcon, 
    ChevronRightIcon, 
    UserIcon, 
    ClipboardDocumentCheckIcon,
    BeakerIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { Prescription } from '../../../types/prescriptions';
import { formatDate } from '../../../utils/date';

interface PrescriptionListItemProps {
    prescription: Prescription;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

const PrescriptionListItem: React.FC<PrescriptionListItemProps> = ({ prescription, isSelected, onSelect }) => {
    const medicationCount = prescription.items?.length || 0;
    
    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
            className={`relative bg-white rounded-[2rem] overflow-hidden transition-all duration-200 border-4 border-black ${
                isSelected 
                    ? 'ring-4 ring-yellow-400 ring-offset-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' 
                    : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`}
        >
            <button
                onClick={() => onSelect(prescription.id)}
                className="relative w-full text-left p-6 pl-8 block focus:outline-none rounded-[2rem]"
                aria-expanded={isSelected}
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 relative z-10 text-black">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative p-3 bg-yellow-400 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <ClipboardDocumentCheckIcon className="h-7 w-7 text-black block" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-black bg-gray-100 px-4 py-2 rounded-xl font-black border-2 border-black">
                                <CalendarDaysIcon className="h-4 w-4 text-black" />
                                {formatDate(prescription.date_prescribed)}
                            </div>
                            {medicationCount > 0 && (
                                <div className="flex items-center gap-2 text-xs text-black bg-green-400 px-3 py-1.5 rounded-full font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <BeakerIcon className="h-4 w-4" />
                                    {medicationCount} {medicationCount === 1 ? 'Medication' : 'Medications'}
                                </div>
                            )}
                        </div>
                        
                        <Link
                            to={`/doctors/${prescription.doctor}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-lg font-black text-black hover:underline decoration-4 decoration-primary-900 underline-offset-4 transition-all mb-3 inline-flex items-center group font-display uppercase tracking-tight"
                        >
                            <div className="p-2 bg-white rounded-xl mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-primary-50 transition-colors">
                                <UserIcon className="h-5 w-5 text-black"/>
                            </div>
                            Doctor ID: {prescription.doctor}
                        </Link>
                        
                        <div className="bg-blue-50 rounded-2xl p-5 border-4 border-black mt-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-start gap-3 mb-1">
                                <SparklesIcon className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black text-black uppercase tracking-widest mb-1">Diagnosis</p>
                                    <p className="text-base font-bold text-black leading-relaxed">
                                        {prescription.diagnosis || 'Not specified'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <motion.div
                        animate={{ rotate: isSelected ? 90 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 relative z-10"
                    >
                        <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-gray-50">
                            <ChevronRightIcon className="h-6 w-6 text-black" />
                        </div>
                    </motion.div>
                </div>
            </button>
        </motion.div>
    );
};

export default PrescriptionListItem;