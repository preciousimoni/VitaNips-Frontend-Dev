// src/pages/doctor/TestRequestsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BeakerIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    DocumentArrowDownIcon,
    ArrowLeftIcon,
    UserIcon,
    EyeIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { getDoctorTestRequests, getTestRequestResults, TestRequest } from '../../api/testRequests';
import { formatDate } from '../../utils/date';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { MedicalDocument } from '../../api/documents';

const TestRequestsPage: React.FC = () => {
    const navigate = useNavigate();
    const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTestRequest, setSelectedTestRequest] = useState<TestRequest | null>(null);
    const [testResults, setTestResults] = useState<MedicalDocument[]>([]);
    const [loadingResults, setLoadingResults] = useState(false);

    const fetchTestRequests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getDoctorTestRequests();
            setTestRequests(response.results || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load test requests';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTestResults = useCallback(async (testRequestId: number) => {
        setLoadingResults(true);
        try {
            const results = await getTestRequestResults(testRequestId);
            setTestResults(results);
        } catch (err) {
            console.error('Failed to fetch test results:', err);
            toast.error('Failed to load test results');
        } finally {
            setLoadingResults(false);
        }
    }, []);

    useEffect(() => {
        fetchTestRequests();
    }, [fetchTestRequests]);

    const handleViewResults = (testRequest: TestRequest) => {
        setSelectedTestRequest(testRequest);
        fetchTestResults(testRequest.id);
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
                                    <BeakerIcon className="h-4 w-4 inline mr-2" />
                                    Test Requests
                                </span>
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white font-display tracking-tight leading-tight">
                                Patient Test Requests
                            </h1>
                            <p className="text-lg md:text-xl text-cream-50/90 max-w-2xl font-medium leading-relaxed">
                                View test requests you've made and see results uploaded by patients.
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

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <Spinner size="lg" />
                    </div>
                ) : testRequests.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {testRequests.map((testRequest, index) => {
                            const { text: statusText, color, bgColor, icon: StatusIcon } = getStatusInfo(testRequest.status);
                            const hasResults = testRequest.has_test_results || testRequest.test_results_count > 0;

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

                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                                    <UserIcon className="h-3.5 w-3.5 text-black" />
                                                    <span>{testRequest.patient_name || 'Patient'}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                                    <CalendarIcon className="h-3.5 w-3.5 text-black" />
                                                    <span>Requested: {formatDate(testRequest.appointment_date)}</span>
                                                </div>

                                                {testRequest.test_description && (
                                                    <p className="text-sm font-bold text-gray-700 mb-3 leading-relaxed">
                                                        {testRequest.test_description}
                                                    </p>
                                                )}

                                                {hasResults && (
                                                    <div className="bg-green-50 border-2 border-green-400 rounded-xl p-3 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircleIcon className="h-5 w-5 text-green-700" />
                                                            <p className="text-sm font-bold text-green-900">
                                                                {testRequest.test_results_count || 1} result(s) uploaded
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {!hasResults && testRequest.status === 'pending' && (
                                                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <ClockIcon className="h-5 w-5 text-yellow-700" />
                                                            <p className="text-sm font-bold text-yellow-900">
                                                                Waiting for patient to upload results
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 mt-4">
                                            {hasResults && (
                                                <motion.button
                                                    whileHover={{ scale: 1.02, x: 2 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleViewResults(testRequest)}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-black text-sm uppercase tracking-wide border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    View Results
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
                        <p className="text-lg font-bold text-gray-500">Test requests you create will appear here.</p>
                    </div>
                )}
            </div>

            {/* Results Modal */}
            {selectedTestRequest && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b-4 border-black">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-black">
                                    Test Results: {selectedTestRequest.test_name}
                                </h2>
                                <button
                                    onClick={() => {
                                        setSelectedTestRequest(null);
                                        setTestResults([]);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircleIcon className="h-6 w-6 text-black" />
                                </button>
                            </div>
                            <p className="text-sm font-bold text-gray-600 mt-2">
                                Patient: {selectedTestRequest.patient_name}
                            </p>
                        </div>
                        <div className="p-6">
                            {loadingResults ? (
                                <div className="flex justify-center py-10">
                                    <Spinner size="lg" />
                                </div>
                            ) : testResults.length > 0 ? (
                                <div className="space-y-4">
                                    {testResults.map((result) => (
                                        <div
                                            key={result.id}
                                            className="bg-gray-50 rounded-xl border-2 border-black p-4"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-black text-lg text-black">
                                                    {result.description || result.filename || 'Test Result'}
                                                </h3>
                                                <a
                                                    href={result.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-primary-900 text-white font-black rounded-lg border-2 border-black hover:bg-primary-800 transition-colors flex items-center gap-2"
                                                >
                                                    <DocumentArrowDownIcon className="h-4 w-4" />
                                                    Download
                                                </a>
                                            </div>
                                            {result.document_type && (
                                                <p className="text-sm font-bold text-gray-600">
                                                    Type: {result.document_type}
                                                </p>
                                            )}
                                            <p className="text-xs font-bold text-gray-500 mt-2">
                                                Uploaded: {new Date(result.uploaded_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-lg font-bold text-gray-500">
                                        No results uploaded yet
                                    </p>
                                </div>
                            )}
                            
                            {/* Write Prescription Button - Only show if results exist and follow-up appointment exists */}
                            {testResults.length > 0 && selectedTestRequest?.followup_appointment && (
                                <div className="mt-6 pt-6 border-t-4 border-black">
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            // Navigate to prescription workspace with the follow-up appointment
                                            navigate(`/doctor/prescriptions?appointment=${selectedTestRequest.followup_appointment}`);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-900 text-white font-black text-lg uppercase tracking-wide border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                        Write Prescription Based on Results
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TestRequestsPage;

