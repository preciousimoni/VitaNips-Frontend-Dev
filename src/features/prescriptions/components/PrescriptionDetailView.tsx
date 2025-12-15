// src/features/prescriptions/components/PrescriptionDetailView.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Prescription, PrescriptionItem } from '../../../types/prescriptions';
import { Link } from 'react-router-dom';
import {
    TagIcon, 
    InformationCircleIcon, 
    ForwardIcon,
    CheckCircleIcon, 
    ExclamationCircleIcon, 
    EyeIcon,
    CalendarDaysIcon,
    UserIcon,
    SparklesIcon,
    BeakerIcon
} from '@heroicons/react/24/outline';
import PharmacySelectionModal from '../../pharmacy/components/PharmacySelectionModal';
import { forwardPrescriptionToPharmacy } from '../../../api/prescriptions';
import axios from 'axios';
import Modal from '../../../components/common/Modal';
import MedicationInfoDisplay from '../../pharmacy/components/MedicationInfoDisplay';


interface PrescriptionDetailViewProps {
    prescription: Prescription;
}

const PrescriptionDetailView: React.FC<PrescriptionDetailViewProps> = ({ prescription }) => {
    const [showPharmacyModal, setShowPharmacyModal] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string } | null>(null);

    const [showMedInfoModal, setShowMedInfoModal] = useState(false);
    const [selectedMedicationIdForInfo, setSelectedMedicationIdForInfo] = useState<number | null>(null);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Invalid Date'; }
    };

    const handleOpenPharmacyModal = () => {
        setOrderStatus(null);
        setShowPharmacyModal(true);
    };

    const handleClosePharmacyModal = () => {
        setShowPharmacyModal(false);
    };

    const handlePharmacySelected = async (pharmacyId: number) => {
        setIsOrdering(true);
        setOrderStatus(null);
        console.log(`Attempting to forward prescription ${prescription.id} to pharmacy ${pharmacyId}`);

        try {
            const response = await forwardPrescriptionToPharmacy(prescription.id, pharmacyId);
            console.log("Prescription forwarding successful:", response);
            setOrderStatus({ 
                success: `${response.message} Order #${response.order.id} (Status: ${response.order.status}). View in 'My Orders'.` 
            });
        } catch (error: unknown) {
            console.error("Prescription forwarding failed:", error);
            let errorMessage = "Failed to forward prescription. Please try again.";
            if (axios.isAxiosError(error) && error.response?.data) {
                const backendError = error.response.data;
                if (backendError.error) {
                    errorMessage = backendError.error;
                } else if (backendError.warning) {
                    errorMessage = backendError.warning;
                } else if (typeof backendError === 'string') {
                    errorMessage = backendError;
                } else {
                    const messages = Object.values(backendError).flat().join(' ');
                    if (messages) errorMessage = messages;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setOrderStatus({ error: errorMessage });
        } finally {
            setIsOrdering(false);
        }
    };

    const handleViewMedicationInfo = (item: PrescriptionItem) => {
        // If your PrescriptionItem directly contains medication_details (full Medication object):
        // setSelectedMedicationForInfo(item.medication_details);
        // If it only contains medication_id:
        if (item.medication_id) {
            setSelectedMedicationIdForInfo(item.medication_id);
            setShowMedInfoModal(true);
        } else {
            // Handle case where there's no structured medication linked,
            // maybe show a message or try a name-based search (more complex)
            alert(`Detailed information is not available for "${item.medication_name}" as it's not linked to a standard medication entry.`);
            console.warn(`No medication_id for prescription item: ${item.medication_name}`);
        }
    };

    const handleCloseMedInfoModal = () => {
        setShowMedInfoModal(false);
        setSelectedMedicationIdForInfo(null);
    };

    return (
        <>
            <PharmacySelectionModal
                isOpen={showPharmacyModal}
                onClose={handleClosePharmacyModal}
                onPharmacySelect={handlePharmacySelected}
                title={`Select Pharmacy for Prescription #${prescription.id}`}
            />

            {/* Medication Info Modal */}
            <Modal
                isOpen={showMedInfoModal}
                onClose={handleCloseMedInfoModal}
                title="Medication Information"
            >
                <MedicationInfoDisplay
                    medicationId={selectedMedicationIdForInfo}
                    onClose={handleCloseMedInfoModal}
                />
            </Modal>

            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-teal-50 border-x-4 border-b-4 border-black rounded-b-[2.5rem] p-8 -mt-4 pt-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mx-4 md:mx-6 mb-8 relative z-0"
            >
                {/* Status Messages */}
                {orderStatus?.success && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-6 bg-green-100 text-green-900 border-4 border-black rounded-2xl flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="p-2 bg-green-500 rounded-xl border-2 border-black flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <CheckCircleIcon className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-base font-bold flex-1">{orderStatus.success}</p>
                    </motion.div>
                )}
                {orderStatus?.error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-6 bg-red-100 text-red-900 border-4 border-black rounded-2xl flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="p-2 bg-red-500 rounded-xl border-2 border-black flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <ExclamationCircleIcon className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-base font-bold flex-1">{orderStatus.error}</p>
                    </motion.div>
                )}

                {/* Diagnosis & Notes Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-400 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <SparklesIcon className="h-5 w-5 text-black" />
                        </div>
                        <h4 className="font-black text-black text-xl font-display uppercase">Diagnosis & Notes</h4>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="mb-6">
                            <p className="text-xs font-black text-black uppercase tracking-widest mb-2 bg-yellow-400 inline-block px-2 py-0.5 rounded border border-black">Diagnosis</p>
                            <p className="text-lg font-bold text-black leading-relaxed">{prescription.diagnosis}</p>
                        </div>
                        {prescription.notes && (
                            <div className="mb-6 pt-6 border-t-4 border-black/10">
                                <p className="text-xs font-black text-black uppercase tracking-widest mb-2 bg-blue-200 inline-block px-2 py-0.5 rounded border border-black">Additional Notes</p>
                                <p className="text-base text-black font-medium leading-relaxed">{prescription.notes}</p>
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-4 pt-6 border-t-4 border-black/10">
                            <div className="flex items-center gap-2 text-sm text-black font-bold">
                                <CalendarDaysIcon className="h-5 w-5" />
                                <span>Prescribed: {formatDate(prescription.date_prescribed)}</span>
                            </div>
                            <Link 
                                to={`/appointments/${prescription.appointment}`} 
                                className="text-sm text-black hover:text-black font-black underline decoration-2 underline-offset-4 flex items-center gap-1 transition-all hover:bg-yellow-300 px-2 rounded"
                            >
                                <UserIcon className="h-4 w-4" />
                                View Associated Appointment
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Medications Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-400 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <BeakerIcon className="h-5 w-5 text-black" />
                        </div>
                        <h4 className="font-black text-black text-xl font-display uppercase">Medications Prescribed</h4>
                        {prescription.items && prescription.items.length > 0 && (
                            <span className="ml-auto text-xs font-black text-black bg-white border-2 border-black px-3 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {prescription.items.length} {prescription.items.length === 1 ? 'Item' : 'Items'}
                            </span>
                        )}
                    </div>
                    {prescription.items && prescription.items.length > 0 ? (
                        <div className="space-y-4">
                            {prescription.items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    <div className="flex justify-between items-start gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-2 h-16 bg-black rounded-full"></div>
                                                <div>
                                                    <h5 className="font-black text-black text-xl mb-2">{item.medication_name}</h5>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-black">
                                                        <span className="flex items-center gap-1 bg-gray-100 border-2 border-black px-3 py-1.5 rounded-lg">
                                                            <TagIcon className="h-4 w-4" />
                                                            {item.dosage}
                                                        </span>
                                                        <span className="flex items-center gap-1 bg-gray-100 border-2 border-black px-3 py-1.5 rounded-lg">
                                                            {item.frequency}
                                                        </span>
                                                        <span className="flex items-center gap-1 bg-gray-100 border-2 border-black px-3 py-1.5 rounded-lg">
                                                            {item.duration}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-6 bg-teal-100 rounded-xl p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <p className="text-xs font-black text-black uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <InformationCircleIcon className="h-3 w-3" />
                                                    Instructions
                                                </p>
                                                <p className="text-sm text-black font-bold">{item.instructions}</p>
                                            </div>
                                        </div>
                                        {item.medication_id && (
                                            <motion.button
                                                onClick={() => handleViewMedicationInfo(item)}
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="p-3 bg-white hover:bg-yellow-300 text-black rounded-xl border-2 border-black transition-all flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                title={`View details for ${item.medication_name}`}
                                            >
                                                <EyeIcon className="h-6 w-6" />
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 border-4 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto border-2 border-black mb-4">
                                <BeakerIcon className="h-8 w-8 text-gray-500" />
                            </div>
                            <p className="text-base text-gray-600 font-bold">No specific medications listed for this prescription.</p>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="mt-8 pt-8 border-t-4 border-black/10">
                    <motion.button
                        onClick={handleOpenPharmacyModal}
                        disabled={isOrdering || !!orderStatus?.success || !prescription.items || prescription.items.length === 0}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-black text-white font-black py-5 px-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 uppercase tracking-wider text-lg border-4 border-white/20"
                    >
                        <ForwardIcon className="h-6 w-6" />
                        {isOrdering ? 'Sending to Pharmacy...' : (orderStatus?.success ? '✓ Sent to Pharmacy' : 'Send to Pharmacy')}
                    </motion.button>
                    {(!prescription.items || prescription.items.length === 0) && (
                        <p className="text-xs text-red-600 mt-4 text-center font-black bg-red-100 border-2 border-black p-2 rounded-lg inline-block w-full">⚠ Cannot send: Prescription has no items.</p>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default PrescriptionDetailView;