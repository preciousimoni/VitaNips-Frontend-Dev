// src/features/prescriptions/components/PrescriptionListItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, ChevronRightIcon, UserIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { Prescription } from '../../../types/prescriptions';
import { formatDate } from '../../../utils/date';

interface PrescriptionListItemProps {
    prescription: Prescription;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

const PrescriptionListItem: React.FC<PrescriptionListItemProps> = ({ prescription, isSelected, onSelect }) => {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`relative bg-white rounded-3xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl ${
                isSelected 
                    ? 'ring-2 ring-purple-500 ring-offset-2 border-2 border-purple-200' 
                    : 'border-2 border-gray-200 hover:border-purple-300'
            }`}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            {/* Status accent line */}
            <motion.div 
                className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 to-indigo-600"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3 }}
            ></motion.div>

            <button
                onClick={() => onSelect(prescription.id)}
                className="relative w-full text-left p-6 pl-8 block focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-3xl"
                aria-expanded={isSelected}
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                                <ClipboardDocumentCheckIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl font-medium">
                                <CalendarDaysIcon className="h-4 w-4 mr-2 text-purple-600" />
                                {formatDate(prescription.date_prescribed)}
                            </div>
                        </div>
                        
                        <Link
                            to={`/doctors/${prescription.doctor}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors mb-2 inline-flex items-center group"
                        >
                            <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg mr-2 group-hover:from-purple-100 group-hover:to-indigo-100 transition-all">
                                <UserIcon className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors"/>
                            </div>
                            Prescribing Doctor ID: {prescription.doctor}
                        </Link>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-100 mt-2">
                            <p className="text-sm text-gray-700">
                                <span className="font-bold text-purple-700">Diagnosis:</span>{' '}
                                <span className="text-gray-900">{prescription.diagnosis || 'Not specified'}</span>
                            </p>
                        </div>
                    </div>
                    
                    <motion.div
                        animate={{ rotate: isSelected ? 90 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                    >
                        <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl hover:from-purple-100 hover:to-indigo-100 transition-all">
                            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                        </div>
                    </motion.div>
                </div>
            </button>
        </motion.div>
    );
};

export default PrescriptionListItem;