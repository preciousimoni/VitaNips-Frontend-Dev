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
            whileHover={{ y: -4, scale: 1.01 }}
            className={`relative bg-white rounded-3xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl ${
                isSelected 
                    ? 'ring-4 ring-primary ring-offset-2 border-2 border-primary' 
                    : 'border-2 border-gray-200 hover:border-primary/50'
            }`}
        >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${
                isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            }`}></div>
            
            {/* Status accent line */}
            <motion.div 
                className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary via-emerald-500 to-teal-500"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3 }}
            ></motion.div>

            {/* Rotating gradient blob */}
            <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-full blur-3xl"
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            ></motion.div>

            <button
                onClick={() => onSelect(prescription.id)}
                className="relative w-full text-left p-6 pl-10 block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-3xl"
                aria-expanded={isSelected}
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <motion.div 
                                className="relative p-3 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-2xl border border-primary/20"
                                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
                                <ClipboardDocumentCheckIcon className="h-7 w-7 text-primary relative z-10" />
                            </motion.div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-xl font-bold border border-gray-200">
                                <CalendarDaysIcon className="h-4 w-4 text-primary" />
                                {formatDate(prescription.date_prescribed)}
                            </div>
                            {medicationCount > 0 && (
                                <div className="flex items-center gap-2 text-xs text-white bg-gradient-to-r from-primary to-emerald-500 px-3 py-1.5 rounded-full font-bold shadow-lg">
                                    <BeakerIcon className="h-4 w-4" />
                                    {medicationCount} {medicationCount === 1 ? 'Medication' : 'Medications'}
                                </div>
                            )}
                        </div>
                        
                        <Link
                            to={`/doctors/${prescription.doctor}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-lg font-black text-gray-900 hover:text-primary transition-colors mb-3 inline-flex items-center group"
                        >
                            <motion.div 
                                className="p-2 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl mr-3 group-hover:from-primary/10 group-hover:to-emerald-500/10 transition-all border border-gray-200 group-hover:border-primary/30"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <UserIcon className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors"/>
                            </motion.div>
                            Doctor ID: {prescription.doctor}
                        </Link>
                        
                        <div className="bg-gradient-to-r from-primary/5 via-emerald-50/50 to-teal-50/50 rounded-2xl p-4 border-2 border-primary/10 mt-3 shadow-sm">
                            <div className="flex items-start gap-2 mb-2">
                                <SparklesIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Diagnosis</p>
                                    <p className="text-sm font-semibold text-gray-900 leading-relaxed">
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
                        <motion.div 
                            className="p-3 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl hover:from-primary/10 hover:to-emerald-500/10 transition-all border border-gray-200 hover:border-primary/30"
                            whileHover={{ scale: 1.1 }}
                        >
                            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                        </motion.div>
                    </motion.div>
                </div>
            </button>
        </motion.div>
    );
};

export default PrescriptionListItem;