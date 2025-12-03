import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
    PlusIcon, 
    DocumentTextIcon, 
    ClipboardDocumentListIcon, 
    MagnifyingGlassIcon, 
    FunnelIcon,
    ArrowRightIcon,
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
import EmptyState from '../../components/common/EmptyState';
import { format } from 'date-fns';

// Enhanced appointment card component
const EligibleAppointmentCard: React.FC<{
    appt: EligibleAppointmentForPrescription;
    onWritePrescription: (appt: EligibleAppointmentForPrescription) => void;
}> = ({ appt, onWritePrescription }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01 }}
        className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all group relative overflow-hidden"
    >
        {/* Decorative gradient blob */}
        <motion.div
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"
        ></motion.div>

        <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="p-3 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl shadow-lg"
                        >
                            <UserIcon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">{appt.patient_name}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{appt.patient_email}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            <span className="font-medium">{formatDate(appt.date)}</span>
                            <span className="text-gray-300">•</span>
                            <ClockIcon className="h-4 w-4 text-primary" />
                            <span className="font-medium">{formatTime(appt.start_time)}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Reason:</span>
                            <p className="text-sm text-gray-700 flex-1">{appt.reason || 'General Consultation'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onWritePrescription(appt)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all shadow-md"
            >
                <PlusIcon className="h-5 w-5" />
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
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all group relative overflow-hidden"
        >
            {/* Decorative gradient blob */}
            <motion.div
                animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -90, 0]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"
            ></motion.div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg"
                            >
                                <DocumentTextIcon className="h-5 w-5 text-white" />
                            </motion.div>
                            <div>
                                <h4 className="text-lg font-black text-gray-900">{patientName}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{patientEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>Prescribed on {new Date(pres.date_prescribed + "T00:00:00Z").toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</span>
                        </div>
                    </div>
                    <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-xs font-black rounded-full border border-blue-200 shadow-sm"
                    >
                        {pres.items.length} {pres.items.length === 1 ? 'Item' : 'Items'}
                    </motion.span>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200">
                    <p className="text-sm text-gray-700">
                        <span className="font-black text-gray-900">Diagnosis:</span>{' '}
                        <span className="font-medium">{pres.diagnosis}</span>
                    </p>
                    {pres.notes && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{pres.notes}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const DoctorPrescriptionWorkspacePage: React.FC = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    
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
        const patientEmail = typeof pres.user === 'object' && pres.user !== null && 'email' in pres.user 
            ? (pres.user as { email?: string }).email 
            : String(pres.user);
        const patientName = typeof pres.user === 'object' && pres.user !== null 
            ? `${(pres.user as any).first_name || ''} ${(pres.user as any).last_name || ''}`.trim() || (pres.user as any).username
            : 'Patient';
        return patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (patientEmail && patientEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
               pres.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const currentDate = new Date();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 overflow-hidden mb-8"
            >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <motion.div 
                        style={{ y }}
                        className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"
                    ></motion.div>
                    <motion.div 
                        style={{ y: y2 }}
                        className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"
                    ></motion.div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6"
                    >
                        <motion.button
                            whileHover={{ x: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/doctor/dashboard')}
                            className="inline-flex items-center text-white/90 hover:text-white font-bold transition-colors group"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </motion.button>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold uppercase tracking-wider text-white">
                                    <SparklesIcon className="h-4 w-4 inline mr-2" />
                                    Prescription Workspace
                                </span>
                                <span className="text-sm text-white/80 font-medium">{format(currentDate, 'EEEE, MMMM do, yyyy')}</span>
                            </motion.div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-white tracking-tight">
                                Manage Prescriptions
                            </h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed"
                            >
                                Write prescriptions for completed appointments and review your prescription history.
                            </motion.p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
                    </svg>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center text-red-700 shadow-lg"
                    >
                        <span className="font-bold mr-3">Error:</span> {error}
                    </motion.div>
                )}

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-4 mb-8"
                >
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-lg border border-gray-200 w-full sm:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('new')}
                            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'new' 
                                    ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-md' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Pending Patients
                            {eligibleAppointments.length > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    activeTab === 'new' 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-primary/10 text-primary'
                                }`}>
                                    {eligibleAppointments.length}
                                </span>
                            )}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'history' 
                                    ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-md' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            History
                            {writtenPrescriptions.length > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    activeTab === 'history' 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-primary/10 text-primary'
                                }`}>
                                    {writtenPrescriptions.length}
                                </span>
                            )}
                        </motion.button>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="flex-1 flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-gray-200 shadow-lg hover:border-primary/30 transition-all focus-within:border-primary">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Search by patient name, email, or reason..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-none text-sm focus:ring-0 p-0 placeholder-gray-400 bg-transparent"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="h-4 w-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Content Area */}
                {activeTab === 'new' ? (
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-primary to-emerald-600 rounded-xl">
                                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Patients Awaiting Prescriptions</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">
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
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-gray-200 shadow-lg">
                                <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-bold text-lg mb-2">No results found</p>
                                <p className="text-sm text-gray-400">Try adjusting your search query</p>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-gray-200 shadow-lg">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                                </motion.div>
                                <p className="text-gray-600 font-black text-xl mb-2">All caught up!</p>
                                <p className="text-sm text-gray-400">No pending prescriptions at this time.</p>
                            </div>
                        )}
                    </motion.section>
                ) : (
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                                    <DocumentTextIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Prescription History</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">
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
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-gray-200 shadow-lg">
                                <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-bold text-lg mb-2">No results found</p>
                                <p className="text-sm text-gray-400">Try adjusting your search query</p>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-gray-200 shadow-lg">
                                <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-black text-xl mb-2">No prescription history yet</p>
                                <p className="text-sm text-gray-400">Prescriptions you write will appear here</p>
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
