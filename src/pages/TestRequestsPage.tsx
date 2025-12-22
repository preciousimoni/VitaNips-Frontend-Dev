// src/pages/TestRequestsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BeakerIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowRightIcon,
    InformationCircleIcon,
    DocumentArrowUpIcon,
    ArrowLeftIcon,
    SparklesIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getPatientTestRequests, getTestRequestById, TestRequest } from '../api/testRequests';
import { formatDate } from '../utils/date';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import { uploadMedicalDocument } from '../api/documents';
import Modal from '../components/common/Modal';
import DocumentUploadForm from '../features/health/components/DocumentUploadForm';

const TestRequestsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedTestRequest, setSelectedTestRequest] = useState<TestRequest | null>(null);

    const fetchTestRequests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getPatientTestRequests();
            const requests = response.results || [];
            console.log('Fetched test requests:', requests.map(tr => ({
                id: tr.id,
                test_name: tr.test_name,
                followup_appointment: tr.followup_appointment,
                status: tr.status
            })));
            setTestRequests(requests);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load test requests';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTestRequests();
    }, [fetchTestRequests]);

    // Refresh test requests when navigating to this page (e.g., after scheduling follow-up)
    useEffect(() => {
        // Check if we're coming from a booking (location state might indicate this)
        const state = location.state as { refresh?: boolean; testRequestId?: number } | null;
        if (state?.refresh) {
            // Longer delay to ensure backend has processed the linking
            const refreshTimeout = setTimeout(() => {
                console.log('Auto-refreshing test requests after follow-up booking...');
                fetchTestRequests();
            }, 2000); // Increased to 2 seconds to ensure backend processing
            // Clear the state to prevent infinite refreshes
            navigate(location.pathname, { replace: true, state: {} });
            return () => clearTimeout(refreshTimeout);
        }
    }, [location.state, location.pathname, fetchTestRequests, navigate]);

    const handleScheduleFollowUp = (testRequest: TestRequest) => {
        const doctorId = typeof testRequest.doctor === 'object' ? testRequest.doctor.id : testRequest.doctor;
        const followUpReason = `Follow-up appointment to review ${testRequest.test_name} results`;

        navigate(`/doctors/${doctorId}`, {
            state: {
                isFollowUp: true,
                originalAppointmentId: testRequest.appointment,
                prefillReason: followUpReason,
                openBookingModalDirectly: true,
                testRequestId: testRequest.id
            }
        });
    };

    const handleUploadResult = (testRequest: TestRequest) => {
        // Allow upload to proceed - backend will check and auto-link follow-up if it exists
        // If no follow-up exists, backend will return a clear error message
        setSelectedTestRequest(testRequest);
        setShowUploadModal(true);
    };

    const handleUploadSuccess = () => {
        // DocumentUploadForm already handles the upload, we just need to refresh and close
        toast.success('Test results uploaded successfully! Doctor will be notified.');
        setShowUploadModal(false);
        setSelectedTestRequest(null);
        fetchTestRequests();
    };

    const getStatusInfo = (status: TestRequest['status']) => {
        switch (status) {
            case 'pending':
                return { text: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-50', icon: ClockIcon };
            case 'completed':
                return { text: 'Completed', color: 'text-green-700', bgColor: 'bg-green-50', icon: CheckCircleIcon };
            case 'cancelled':
                return { text: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-50', icon: XCircleIcon };
            default:
                return { text: status, color: 'text-gray-700', bgColor: 'bg-gray-50', icon: InformationCircleIcon };
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 pb-24">
            {/* Hero Header */}
            <div className="relative bg-primary-900 border-b-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] rounded-b-[3rem] overflow-hidden mb-12">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:20px_20px]"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <button
                            onClick={() => navigate('/dashboard')}
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
                                    <BeakerIcon className="h-4 w-4 inline mr-2" />
                                    Test Requests
                                </span>
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white font-display tracking-tight leading-tight">
                                My Test Requests
                            </h1>
                            <p className="text-lg md:text-xl text-cream-50/90 max-w-2xl font-medium leading-relaxed">
                                View test requests from your doctors and upload results after scheduling follow-up appointments.
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={fetchTestRequests}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-black rounded-xl border-2 border-white/50 hover:border-white transition-all flex items-center gap-2"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                            Refresh
                        </motion.button>
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

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <Spinner size="lg" />
                    </div>
                ) : testRequests.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {testRequests.map((testRequest, index) => {
                            const { text: statusText, color, bgColor, icon: StatusIcon } = getStatusInfo(testRequest.status);
                            const canUpload = testRequest.status === 'pending' && testRequest.followup_appointment;
                            const needsFollowUp = testRequest.status === 'pending' && !testRequest.followup_appointment;
                            const isPending = testRequest.status === 'pending';

                            return (
                                <motion.div
                                    key={testRequest.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 group relative overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-3 bg-orange-200 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                        <BeakerIcon className="h-6 w-6 text-black" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-black group-hover:underline decoration-4 decoration-yellow-400 underline-offset-4">
                                                            {testRequest.test_name}
                                                        </h3>
                                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-black mt-1 ${bgColor} ${color} border-2 border-black`}>
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {statusText}
                                                        </div>
                                                    </div>
                                                </div>

                                                {testRequest.test_description && (
                                                    <p className="text-sm font-bold text-gray-700 mb-3 leading-relaxed">
                                                        {testRequest.test_description}
                                                    </p>
                                                )}

                                                {testRequest.instructions && (
                                                    <div className="bg-blue-50 p-3 rounded-xl border-2 border-black mb-3">
                                                        <p className="text-xs font-black text-blue-900 uppercase tracking-wider mb-1">Instructions</p>
                                                        <p className="text-sm font-bold text-blue-800">{testRequest.instructions}</p>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                                    <CalendarIcon className="h-3.5 w-3.5 text-black" />
                                                    <span>Requested: {formatDate(testRequest.appointment_date)}</span>
                                                </div>

                                                {needsFollowUp && (
                                                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-4">
                                                        <div className="flex items-start gap-2">
                                                            <InformationCircleIcon className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                                                            <p className="text-sm font-bold text-yellow-900">
                                                                Schedule a follow-up appointment to upload your test results.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {canUpload && (
                                                    <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 mb-4">
                                                        <div className="flex items-start gap-2">
                                                            <CheckCircleIcon className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
                                                            <p className="text-sm font-bold text-green-900">
                                                                Follow-up scheduled! You can now upload your test results.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 mt-4">
                                            {needsFollowUp && (
                                                <motion.button
                                                    whileHover={{ scale: 1.02, x: 2 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleScheduleFollowUp(testRequest)}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-900 text-white font-black text-sm uppercase tracking-wide border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                                                >
                                                    <CalendarIcon className="h-4 w-4" />
                                                    Schedule Follow-up
                                                    <ArrowRightIcon className="h-4 w-4" />
                                                </motion.button>
                                            )}

                                            {/* Always show upload button for pending requests */}
                                            {isPending && (
                                                <motion.button
                                                    whileHover={{ scale: 1.02, x: 2 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={async () => {
                                                        // Always try to upload - backend will auto-link if follow-up exists
                                                        // First refresh to get latest data
                                                        try {
                                                            const updatedRequest = await getTestRequestById(testRequest.id);
                                                            setTestRequests(prev => 
                                                                prev.map(tr => 
                                                                    tr.id === testRequest.id ? updatedRequest : tr
                                                                )
                                                            );
                                                            // Proceed with upload - backend will handle finding the follow-up if needed
                                                            handleUploadResult(updatedRequest);
                                                        } catch (err) {
                                                            console.error('Failed to refresh test request:', err);
                                                            // Try upload anyway - backend might find the follow-up automatically
                                                            handleUploadResult(testRequest);
                                                        }
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-black text-sm uppercase tracking-wide border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                                                >
                                                    <DocumentArrowUpIcon className="h-4 w-4" />
                                                    Upload Results
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <BeakerIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                        <p className="text-black font-black text-2xl mb-2">No test requests yet</p>
                        <p className="text-lg font-bold text-gray-500">Your doctors will request tests here when needed.</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {selectedTestRequest && (
                <Modal
                    isOpen={showUploadModal}
                    onClose={() => {
                        setShowUploadModal(false);
                        setSelectedTestRequest(null);
                    }}
                    title={`Upload Test Results: ${selectedTestRequest.test_name}`}
                >
                    <DocumentUploadForm
                        appointmentId={selectedTestRequest.followup_appointment || undefined}
                        testRequestId={selectedTestRequest.id}
                        onUploadSuccess={handleUploadSuccess}
                        onCancel={() => {
                            setShowUploadModal(false);
                            setSelectedTestRequest(null);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};

export default TestRequestsPage;

