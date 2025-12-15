import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    PlusIcon, 
    DocumentTextIcon, 
    ClipboardDocumentListIcon, 
    MagnifyingGlassIcon, 
    ArrowLeftIcon,
    CheckCircleIcon,
    ClockIcon,
    UserIcon,
    SparklesIcon,
    CalendarIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
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
import { formatDate, formatTime } from '../../utils/date';
import Spinner from '../../components/ui/Spinner';
// import EmptyState from '../../components/common/EmptyState';
import { format } from 'date-fns';

// Enhanced appointment card component
const EligibleAppointmentCard: React.FC<{
    appt: EligibleAppointmentForPrescription;
    onWritePrescription: (appt: EligibleAppointmentForPrescription) => void;
}> = ({ appt, onWritePrescription }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 group relative overflow-hidden"
    >
        <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-green-200 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <UserIcon className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-black group-hover:underline decoration-4 decoration-yellow-400 underline-offset-4">{appt.patient_name}</h3>
                            <p className="text-sm font-bold text-gray-500 mt-0.5">{appt.patient_email}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-black bg-cream-50 p-2 rounded-lg border-2 border-black/10">
                            <CalendarIcon className="h-4 w-4 text-black" />
                            <span>{formatDate(appt.date)}</span>
                            <span className="text-black">•</span>
                            <ClockIcon className="h-4 w-4 text-black" />
                            <span>{formatTime(appt.start_time)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-black text-black uppercase tracking-wider bg-yellow-100 self-start px-2 py-0.5 rounded border border-black">Reason</span>
                            <p className="text-sm font-bold text-gray-700 leading-snug">{appt.reason || 'General Consultation'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <motion.button
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onWritePrescription(appt)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary-900 text-white font-black text-lg uppercase tracking-wide border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
                <PlusIcon className="h-5 w-5 stroke-[3]" />
                Write Prescription
            </motion.button>
        </div>
    </motion.div>
);

// Enhanced prescription history card
const PrescriptionHistoryCard: React.FC<{ pres: UserPrescription }> = ({ pres }) => {
    const patientEmail = typeof pres.user === 'object' && pres.user !== null && 'email' in pres.user 
        ? (pres.user as { email?: string }).email 
        : String(pres.user);
    
    const patientName = typeof pres.user === 'object' && pres.user !== null 
        ? `${(pres.user as any).first_name || ''} ${(pres.user as any).last_name || ''}`.trim() || (pres.user as any).username
        : 'Patient';
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 group relative overflow-hidden"
        >
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-blue-200 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <DocumentTextIcon className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-black">{patientName}</h4>
                                <p className="text-xs font-bold text-gray-500 mt-0.5">{patientEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200 w-fit">
                            <CalendarIcon className="h-3.5 w-3.5 text-black" />
                            <span>Prescribed on {new Date(pres.date_prescribed + "T00:00:00Z").toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</span>
                        </div>
                    </div>
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-900 text-xs font-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {pres.items.length} {pres.items.length === 1 ? 'Item' : 'Items'}
                    </span>
                </div>
                
                <div className="p-4 bg-cream-50 rounded-xl border-2 border-black shadow-inner">
                    <p className="text-sm text-black">
                        <span className="font-black uppercase text-xs tracking-wider bg-yellow-200 px-1 rounded mr-2 border border-black">Diagnosis</span>
                        <span className="font-bold">{pres.diagnosis}</span>
                    </p>
                    {pres.notes && (
                        <p className="text-xs font-medium text-gray-600 mt-2 line-clamp-2 italic border-l-2 border-gray-300 pl-2">"{pres.notes}"</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const DoctorPrescriptionWorkspacePage: React.FC = () => {
    const navigate = useNavigate();
    
    const [eligibleAppointments, setEligibleAppointments] = useState<EligibleAppointmentForPrescription[]>([]);
    const [writtenPrescriptions, setWrittenPrescriptions] = useState<UserPrescription[]>([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
    const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState<EligibleAppointmentForPrescription | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

    const fetchEligibleAppointments = useCallback(async () => {
        setIsLoadingAppointments(true);
        setError(null);
        try {
            const response = await getDoctorEligibleAppointments();
            setEligibleAppointments(response.results.filter(appt => !appt.has_existing_prescription)); 
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load eligible appointments.";
            setError(errorMessage);
        } finally {
            setIsLoadingAppointments(false);
        }
    }, []);

    const fetchWrittenPrescriptions = useCallback(async () => {
        setIsLoadingPrescriptions(true);
        setError(null);
        try {
            const response = await getDoctorPrescriptions();
            setWrittenPrescriptions(response.results);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load written prescriptions.";
            setError(errorMessage);
        } finally {
            setIsLoadingPrescriptions(false);
        }
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

    // Filter appointments and prescriptions based on search
    const filteredAppointments = eligibleAppointments.filter(appt =>
        appt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.patient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.reason?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPrescriptions = writtenPrescriptions.filter(pres => {
        const patientEmail: string | undefined = typeof pres.user === 'object' && pres.user !== null && 'email' in pres.user 
            ? (pres.user as { email?: string }).email 
            : typeof pres.user === 'object' ? undefined : String(pres.user);
        const patientName = typeof pres.user === 'object' && pres.user !== null 
            ? `${(pres.user as any).first_name || ''} ${(pres.user as any).last_name || ''}`.trim() || (pres.user as any).username
            : 'Patient';
        return patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (patientEmail ? patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
               pres.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const currentDate = new Date();

    return (
        <div className="min-h-screen bg-cream-50 pb-24">
            {/* Hero Header Section */}
            <div className="relative bg-primary-900 border-b-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] rounded-b-[3rem] overflow-hidden mb-12">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:20px_20px]"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <button
                            onClick={() => navigate('/doctor/dashboard')}
                            className="inline-flex items-center px-4 py-2 bg-black/20 text-white font-bold rounded-xl border-2 border-transparent hover:border-white/50 transition-all group"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </button>
                    </motion.div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <span className="px-4 py-1.5 rounded-xl bg-purple-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-wider text-black">
                                    <SparklesIcon className="h-4 w-4 inline mr-2" />
                                    Prescription Workspace
                                </span>
                                <span className="text-sm text-cream-50/80 font-bold tracking-widest uppercase">{format(currentDate, 'EEEE, MMMM do, yyyy')}</span>
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white font-display tracking-tight leading-tight">
                                Manage Prescriptions
                            </h1>
                            <p className="text-lg md:text-xl text-cream-50/90 max-w-2xl font-medium leading-relaxed">
                                Write prescriptions for completed appointments and review your prescription history.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-red-100 border-4 border-black rounded-[2rem] p-6 flex items-center text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <span className="font-black mr-3 text-lg">Error:</span> <span className="font-bold">{error}</span>
                    </motion.div>
                )}

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-4 mb-12"
                >
                    <div className="flex bg-white p-2 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wide transition-all border-2 ${
                                activeTab === 'new' 
                                    ? 'bg-primary-900 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                                    : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100'
                            }`}
                        >
                            Pending Patients
                            {eligibleAppointments.length > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-lg text-xs border border-current ${
                                    activeTab === 'new' 
                                        ? 'bg-white text-primary-900 border-transparent' 
                                        : 'bg-black text-white'
                                }`}>
                                    {eligibleAppointments.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wide transition-all border-2 ${
                                activeTab === 'history' 
                                    ? 'bg-primary-900 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                                    : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100'
                            }`}
                        >
                            History
                            {writtenPrescriptions.length > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-lg text-xs border border-current ${
                                    activeTab === 'history' 
                                        ? 'bg-white text-primary-900 border-transparent' 
                                        : 'bg-black text-white'
                                }`}>
                                    {writtenPrescriptions.length}
                                </span>
                            )}
                        </button>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="flex-1 flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus-within:ring-4 focus-within:ring-yellow-400/50 transition-all">
                        <MagnifyingGlassIcon className="h-6 w-6 text-black flex-shrink-0 stroke-[3]" />
                        <input 
                            type="text" 
                            placeholder="Search by patient name, email, or reason..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-none text-base font-bold focus:ring-0 p-0 placeholder-gray-400 bg-transparent text-black"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors border-2 border-transparent hover:border-black"
                            >
                                <XMarkIcon className="h-5 w-5 text-black stroke-[3]" />
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Content Area */}
                {activeTab === 'new' ? (
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-400 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <ClipboardDocumentListIcon className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-black font-display">Pending Patients</h2>
                                    <p className="text-base font-bold text-gray-600 mt-0.5">
                                        {filteredAppointments.length} {filteredAppointments.length === 1 ? 'patient' : 'patients'} waiting
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {isLoadingAppointments ? (
                            <div className="py-20 flex justify-center">
                                <Spinner size="lg" />
                            </div>
                        ) : filteredAppointments.length > 0 ? (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {filteredAppointments.map((appt, index) => (
                                    <motion.div
                                        key={appt.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <EligibleAppointmentCard 
                                            appt={appt} 
                                            onWritePrescription={handleOpenPrescriptionModal} 
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : searchQuery ? (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-black font-black text-2xl mb-2">No results found</p>
                                <p className="text-lg font-bold text-gray-500">Try adjusting your search query</p>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
                                </motion.div>
                                <p className="text-black font-black text-2xl mb-2">All caught up!</p>
                                <p className="text-lg font-bold text-gray-500">No pending prescriptions at this time.</p>
                            </div>
                        )}
                    </motion.section>
                ) : (
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-300 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <DocumentTextIcon className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-black font-display">Prescription History</h2>
                                    <p className="text-base font-bold text-gray-600 mt-0.5">
                                        {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'prescription' : 'prescriptions'} total
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isLoadingPrescriptions ? (
                            <div className="py-20 flex justify-center">
                                <Spinner size="lg" />
                            </div>
                        ) : filteredPrescriptions.length > 0 ? (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {filteredPrescriptions.map((pres, index) => (
                                    <motion.div
                                        key={pres.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <PrescriptionHistoryCard pres={pres} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : searchQuery ? (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-black font-black text-2xl mb-2">No results found</p>
                                <p className="text-lg font-bold text-gray-500">Try adjusting your search query</p>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <DocumentTextIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                                <p className="text-black font-black text-2xl mb-2">No prescription history yet</p>
                                <p className="text-lg font-bold text-gray-500">Prescriptions you write will appear here</p>
                            </div>
                        )}
                    </motion.section>
                )}

                {/* Prescription Modal */}
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
                            patientVitalsSummary={selectedAppointmentForPrescription.patient_vitals_summary}
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
