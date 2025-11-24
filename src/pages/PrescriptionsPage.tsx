// src/pages/PrescriptionsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserPrescriptions } from '../api/prescriptions';
import { Prescription } from '../types/prescriptions';
import PrescriptionListItem from '../features/prescriptions/components/PrescriptionListItem';
import PrescriptionDetailView from '../features/prescriptions/components/PrescriptionDetailView';
import Skeleton from '../components/ui/Skeleton';
import { EmptyState } from '../components/common';
import ErrorMessage from '../components/ui/ErrorMessage';
import { DocumentTextIcon, SparklesIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const PrescriptionsPage: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

    const loadPrescriptions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setPrescriptions([]);
        setTotalCount(0);
        setSelectedPrescriptionId(null);
        try {
            const response = await getUserPrescriptions();
            if (response && Array.isArray(response.results)) {
                 setPrescriptions(response.results.sort((a, b) =>
                     new Date(b.date_prescribed).getTime() - new Date(a.date_prescribed).getTime()
                 ));
                 setTotalCount(response.count);
            } else {
                console.warn("Received unexpected prescription response:", response);
                 setError("Failed to process prescription data.");
                 setPrescriptions([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load your prescriptions.";
            setError(errorMessage);
            console.error(err);
            setPrescriptions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPrescriptions();
    }, [loadPrescriptions]);

    const handleSelectPrescription = (id: number) => {
        setSelectedPrescriptionId(prevId => (prevId === id ? null : id));
    };

    const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 overflow-hidden mb-8"
            >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-5"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                            <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                <ClipboardDocumentListIcon className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <div className="text-white">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider mb-3 border border-white/30"
                            >
                                <SparklesIcon className="h-4 w-4 mr-2" />
                                Your Medical Records
                            </motion.div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Your Prescriptions</h1>
                            <p className="text-white/90 text-base md:text-lg">
                                View and manage all your medication prescriptions in one place
                            </p>
                            {totalCount > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-2 mt-3 text-sm text-white/80"
                                >
                                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                                    {totalCount} {totalCount === 1 ? 'Prescription' : 'Prescriptions'} on Record
                                </motion.div>
                            )}
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

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100">
                                <Skeleton className="h-24 w-full rounded-2xl" />
                            </div>
                        ))}
                    </motion.div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <ErrorMessage message={error} onRetry={loadPrescriptions} />
                    </motion.div>
                ) : (
                     <>
                        {prescriptions.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {prescriptions.map((presc, index) => (
                                        <motion.div
                                            key={presc.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <PrescriptionListItem
                                                prescription={presc}
                                                isSelected={selectedPrescriptionId === presc.id}
                                                onSelect={handleSelectPrescription}
                                            />
                                            <AnimatePresence>
                                                {selectedPrescriptionId === presc.id && selectedPrescription && (
                                                    <motion.div
                                                        key={`detail-${selectedPrescription.id}`}
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <PrescriptionDetailView prescription={selectedPrescription} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <EmptyState
                                    icon={DocumentTextIcon}
                                    title="No prescriptions"
                                    description="You do not have any prescriptions recorded yet."
                                />
                            </motion.div>
                        )}
                     </>
                )}
            </div>
        </div>
    );
};

export default PrescriptionsPage;