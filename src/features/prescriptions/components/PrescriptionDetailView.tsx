// src/features/prescriptions/components/PrescriptionDetailView.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Prescription, PrescriptionItem } from '../../../types/prescriptions';
import { Link } from 'react-router-dom';
import {
    ClipboardDocumentListIcon, 
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
                className="bg-gradient-to-br from-primary/5 via-emerald-50/30 to-teal-50/30 p-6 border-2 border-primary/20 rounded-b-3xl -mt-3 pt-8 shadow-xl"
            >
                {/* Status Messages */}
                {orderStatus?.success && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-2 border-green-300 rounded-2xl flex items-start gap-3 shadow-lg"
                    >
                        <div className="p-2 bg-green-100 rounded-xl">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-sm font-semibold flex-1">{orderStatus.success}</p>
                    </motion.div>
                )}
                {orderStatus?.error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-2 border-red-300 rounded-2xl flex items-start gap-3 shadow-lg"
                    >
                        <div className="p-2 bg-red-100 rounded-xl">
                            <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-sm font-semibold flex-1">{orderStatus.error}</p>
                    </motion.div>
                )}

                {/* Diagnosis & Notes Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-xl">
                            <SparklesIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h4 className="font-black text-gray-900 text-lg">Diagnosis & Notes</h4>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                        <div className="mb-4">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Diagnosis</p>
                            <p className="text-base font-semibold text-gray-900 leading-relaxed">{prescription.diagnosis}</p>
                        </div>
                        {prescription.notes && (
                            <div className="mb-4 pt-4 border-t border-gray-200">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Additional Notes</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{prescription.notes}</p>
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <CalendarDaysIcon className="h-4 w-4 text-primary" />
                                <span className="font-semibold">Prescribed:</span> {formatDate(prescription.date_prescribed)}
                            </div>
                            <Link 
                                to={`/appointments/${prescription.appointment}`} 
                                className="text-xs text-primary hover:text-emerald-600 font-bold underline flex items-center gap-1 transition-colors"
                            >
                                <UserIcon className="h-4 w-4" />
                                View Associated Appointment
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Medications Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-xl">
                            <BeakerIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h4 className="font-black text-gray-900 text-lg">Medications Prescribed</h4>
                        {prescription.items && prescription.items.length > 0 && (
                            <span className="ml-auto text-xs font-bold text-white bg-gradient-to-r from-primary to-emerald-500 px-3 py-1 rounded-full">
                                {prescription.items.length} {prescription.items.length === 1 ? 'Item' : 'Items'}
                            </span>
                        )}
                    </div>
                    {prescription.items && prescription.items.length > 0 ? (
                        <div className="space-y-3">
                            {prescription.items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:border-primary/30"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-1 h-12 bg-gradient-to-b from-primary to-emerald-500 rounded-full"></div>
                                                <div>
                                                    <h5 className="font-black text-gray-900 text-lg mb-1">{item.medication_name}</h5>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg font-semibold">
                                                            <TagIcon className="h-4 w-4 text-primary" />
                                                            {item.dosage}
                                                        </span>
                                                        <span className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg font-semibold">
                                                            {item.frequency}
                                                        </span>
                                                        <span className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg font-semibold">
                                                            {item.duration}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 bg-gradient-to-r from-primary/5 to-emerald-50/50 rounded-xl p-3 border border-primary/10">
                                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <InformationCircleIcon className="h-3 w-3" />
                                                    Instructions
                                                </p>
                                                <p className="text-sm text-gray-700 font-medium">{item.instructions}</p>
                                            </div>
                                        </div>
                                        {item.medication_id && (
                                            <motion.button
                                                onClick={() => handleViewMedicationInfo(item)}
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="p-3 bg-gradient-to-br from-primary/10 to-emerald-500/10 hover:from-primary/20 hover:to-emerald-500/20 text-primary rounded-xl border border-primary/20 transition-all flex-shrink-0"
                                                title={`View details for ${item.medication_name}`}
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 text-center">
                            <BeakerIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 font-semibold">No specific medications listed for this prescription.</p>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <motion.button
                        onClick={handleOpenPharmacyModal}
                        disabled={isOrdering || !!orderStatus?.success || !prescription.items || prescription.items.length === 0}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 text-white font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                    >
                        <ForwardIcon className="h-5 w-5" />
                        {isOrdering ? 'Sending to Pharmacy...' : (orderStatus?.success ? '✓ Sent to Pharmacy' : 'Send to Pharmacy')}
                    </motion.button>
                    {(!prescription.items || prescription.items.length === 0) && (
                        <p className="text-xs text-red-500 mt-3 text-center font-semibold">⚠ Cannot send: Prescription has no items.</p>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default PrescriptionDetailView;