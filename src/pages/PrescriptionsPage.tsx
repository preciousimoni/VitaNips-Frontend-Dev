// src/pages/PrescriptionsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScroll, useTransform } from 'framer-motion';
import { getUserPrescriptions } from '../api/prescriptions';
import { Prescription } from '../types/prescriptions';
import PrescriptionListItem from '../features/prescriptions/components/PrescriptionListItem';
import PrescriptionDetailView from '../features/prescriptions/components/PrescriptionDetailView';
import Skeleton from '../components/ui/Skeleton';
import { EmptyState } from '../components/common';
import ErrorMessage from '../components/ui/ErrorMessage';
import { 
    DocumentTextIcon, 
    SparklesIcon, 
    ClipboardDocumentListIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const PrescriptionsPage: React.FC = () => {
    // All hooks must be called before any conditional returns
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

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

    // Filter prescriptions based on search query
    const filteredPrescriptions = prescriptions.filter(prescription => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            prescription.diagnosis?.toLowerCase().includes(query) ||
            prescription.notes?.toLowerCase().includes(query) ||
            prescription.items?.some(item => 
                item.medication_name?.toLowerCase().includes(query)
            )
        );
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-r from-primary via-emerald-600 to-teal-600 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden"
            >
                {/* Animated Blobs */}
                <motion.div
                    style={{ y }}
                    className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                ></motion.div>
                <motion.div
                    style={{ y: y2 }}
                    className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                ></motion.div>
                <motion.div
                    style={{ y: y3 }}
                    className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                ></motion.div>

                {/* Floating Icon Cards - Hidden on Mobile */}
                <motion.div
                    className="hidden md:block absolute top-1/4 left-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                    <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div
                    className="hidden md:block absolute bottom-1/4 right-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
                    animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                >
                    <DocumentTextIcon className="h-8 w-8 text-white" />
                </motion.div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-4 md:mb-6"
                    >
                        <Link 
                            to="/dashboard" 
                            className="inline-flex items-center text-white/90 hover:text-white font-bold transition-colors group text-sm md:text-base"
                        >
                            <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs md:text-sm font-bold uppercase tracking-wider mb-4 md:mb-6"
                    >
                        <SparklesIcon className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        YOUR PRESCRIPTIONS
                    </motion.div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
                                Medical Prescriptions
                            </h1>
                            <p className="text-base md:text-lg text-white/90 max-w-xl">
                                View, manage, and forward your prescriptions to pharmacies
                            </p>
                            {totalCount > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-2 mt-4 text-xs md:text-sm text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 w-fit"
                                >
                                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="font-bold">{totalCount}</span> {totalCount === 1 ? 'Prescription' : 'Prescriptions'} on Record
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
                    </svg>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                {/* Search Bar */}
                {!isLoading && !error && prescriptions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
                            <div className="relative bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by diagnosis, medication, or notes..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        />
                                    </div>
                                    {searchQuery && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => setSearchQuery('')}
                                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium text-gray-700"
                                        >
                                            Clear
                                        </motion.button>
                                    )}
                                </div>
                                {searchQuery && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-3 text-sm text-gray-600"
                                    >
                                        Found {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'prescription' : 'prescriptions'}
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100"
                            >
                                <Skeleton className="h-32 w-full rounded-2xl" />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 shadow-xl border-2 border-red-100"
                    >
                        <ErrorMessage message={error} onRetry={loadPrescriptions} />
                    </motion.div>
                ) : (
                     <>
                        {filteredPrescriptions.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredPrescriptions.map((presc, index) => (
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
                                className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100"
                            >
                                <EmptyState
                                    icon={DocumentTextIcon}
                                    title={searchQuery ? "No matching prescriptions" : "No prescriptions"}
                                    description={searchQuery ? "Try adjusting your search terms." : "You do not have any prescriptions recorded yet."}
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