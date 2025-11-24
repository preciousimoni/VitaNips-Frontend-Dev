import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, DocumentTextIcon, ClipboardDocumentListIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import {
    getDoctorEligibleAppointments,
    createDoctorPrescription,
    getDoctorPrescriptions,
    EligibleAppointmentForPrescription,
    DoctorPrescriptionPayload,
} from '../../api/doctorPortal';
import { Prescription as UserPrescription } from '../../types/prescriptions';
import Modal from '../../components/common/Modal';
import DoctorPrescriptionForm from '../../features/doctor_portal/components/DoctorPrescriptionForm';
import { formatDate } from '../../utils/date';
import Spinner from '../../components/ui/Spinner';

// Simple list item for eligible appointments
const EligibleAppointmentItem: React.FC<{
    appt: EligibleAppointmentForPrescription;
    onWritePrescription: (appt: EligibleAppointmentForPrescription) => void;
}> = ({ appt, onWritePrescription }) => (
    <div className="group bg-white border border-gray-100 p-4 rounded-xl hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <h3 className="font-bold text-gray-900">{appt.patient_name}</h3>
                <span className="text-sm text-gray-500">({appt.patient_email})</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-2">
                    <span className="font-medium">Date:</span> {formatDate(appt.date)} 
                    <span className="text-gray-300">|</span>
                    <span className="font-medium">Reason:</span> {appt.reason}
                </p>
            </div>
        </div>
        <button 
            onClick={() => onWritePrescription(appt)} 
            className="w-full sm:w-auto px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2"
        >
            <PlusIcon className="h-4 w-4" />
            Write Prescription
        </button>
    </div>
);

// Simple list item for doctor's written prescriptions
const DoctorPrescriptionItem: React.FC<{ pres: UserPrescription }> = ({ pres }) => {
    const patientEmail = typeof pres.user === 'object' && pres.user !== null && 'email' in pres.user 
        ? (pres.user as { email?: string }).email 
        : String(pres.user);
    
    return (
        <div className="bg-white border border-gray-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-gray-900">Patient: {patientEmail}</h4>
                    <p className="text-xs text-gray-500 mt-1">Prescribed on {new Date(pres.date_prescribed + "T00:00:00Z").toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                    {pres.items.length} Items
                </span>
            </div>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Diagnosis:</span> {pres.diagnosis}
                </p>
            </div>
        </div>
    );
};


const DoctorPrescriptionWorkspacePage: React.FC = () => {
    const [eligibleAppointments, setEligibleAppointments] = useState<EligibleAppointmentForPrescription[]>([]);
    const [writtenPrescriptions, setWrittenPrescriptions] = useState<UserPrescription[]>([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
    const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState<EligibleAppointmentForPrescription | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

    const fetchEligibleAppointments = useCallback(async () => {
        setIsLoadingAppointments(true); setError(null);
        try {
            const response = await getDoctorEligibleAppointments();
            setEligibleAppointments(response.results.filter(appt => !appt.has_existing_prescription)); 
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load eligible appointments.";
            setError(errorMessage);
        }
        finally { setIsLoadingAppointments(false); }
    }, []);

    const fetchWrittenPrescriptions = useCallback(async () => {
        setIsLoadingPrescriptions(true); setError(null);
        try {
            const response = await getDoctorPrescriptions();
            setWrittenPrescriptions(response.results);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load written prescriptions.";
            setError(errorMessage);
        }
        finally { setIsLoadingPrescriptions(false); }
    }, []);

    useEffect(() => {
        fetchEligibleAppointments();
        fetchWrittenPrescriptions();
    }, [fetchEligibleAppointments, fetchWrittenPrescriptions]);

    const handleOpenPrescriptionModal = (appt: EligibleAppointmentForPrescription) => {
        setSelectedAppointmentForPrescription(appt);
        setShowPrescriptionModal(true);
    };

    const handleClosePrescriptionModal = () => {
        setSelectedAppointmentForPrescription(null);
        setShowPrescriptionModal(false);
    };

    const handlePrescriptionSubmit = async (payload: DoctorPrescriptionPayload) => {
        setIsSubmittingForm(true);
        try {
            await createDoctorPrescription(payload);
            handleClosePrescriptionModal();
            // Refresh both lists
            await fetchEligibleAppointments();
            await fetchWrittenPrescriptions();
            setActiveTab('history'); // Switch to history tab to show the new prescription
        } finally {
            setIsSubmittingForm(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                     <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ClipboardDocumentListIcon className="h-6 w-6 text-primary"/>
                        </div>
                        Prescription Workspace
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'new' 
                                    ? 'bg-primary text-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Pending Patients
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'history' 
                                    ? 'bg-primary text-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            History
                        </button>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search patients..." 
                            className="flex-1 border-none text-sm focus:ring-0 p-0 placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3">
                        {activeTab === 'new' ? (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <PlusIcon className="h-5 w-5 text-primary"/> 
                                        Patients Awaiting Prescriptions
                                    </h2>
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                                        {eligibleAppointments.length} Pending
                                    </span>
                                </div>
                                
                                {isLoadingAppointments ? (
                                    <div className="py-12 flex justify-center">
                                        <Spinner size="lg" />
                                    </div>
                                ) : eligibleAppointments.length > 0 ? (
                                    <div className="grid gap-4">
                                        {eligibleAppointments.map(appt => (
                                            <EligibleAppointmentItem key={appt.id} appt={appt} onWritePrescription={handleOpenPrescriptionModal} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
                                        <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No pending prescriptions found.</p>
                                        <p className="text-sm text-gray-400 mt-1">Good job! You're all caught up.</p>
                                    </div>
                                )}
                            </section>
                        ) : (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <DocumentTextIcon className="h-5 w-5 text-blue-600"/> 
                                        Prescription History
                                    </h2>
                                    <button className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-700">
                                        <FunnelIcon className="h-4 w-4" /> Filter
                                    </button>
                                </div>

                                {isLoadingPrescriptions ? (
                                    <div className="py-12 flex justify-center">
                                        <Spinner size="lg" />
                                    </div>
                                ) : writtenPrescriptions.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {writtenPrescriptions.map(pres => (
                                            <DoctorPrescriptionItem key={pres.id} pres={pres} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
                                        <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No prescription history yet.</p>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </div>

                {selectedAppointmentForPrescription && (
                    <Modal
                        isOpen={showPrescriptionModal}
                        onClose={handleClosePrescriptionModal}
                        title={`New Prescription for ${selectedAppointmentForPrescription.patient_name}`}
                    >
                        <DoctorPrescriptionForm
                            appointmentId={selectedAppointmentForPrescription.id}
                            patientName={selectedAppointmentForPrescription.patient_name}
                            appointmentDate={selectedAppointmentForPrescription.date}
                            onSubmit={handlePrescriptionSubmit}
                            onCancel={handleClosePrescriptionModal}
                            isSubmitting={isSubmittingForm}
                        />
                    </Modal>
                )}
            </div>
        </div>
    );
};
export default DoctorPrescriptionWorkspacePage;