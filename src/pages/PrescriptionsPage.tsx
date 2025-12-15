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
        <div className="min-h-screen bg-cream-50 pb-12 font-sans">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-primary-900 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden rounded-b-[3rem] border-b-4 border-l-4 border-r-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mx-4 mt-4 md:mx-6"
            >
                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link 
                            to="/dashboard" 
                            className="inline-flex items-center text-black bg-white px-5 py-2.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold group"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Back to Dashboard
                        </Link>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center px-5 py-2 rounded-full bg-yellow-400 border-2 border-black text-black text-sm font-black uppercase tracking-wider mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        YOUR PRESCRIPTIONS
                    </motion.div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 font-display uppercase tracking-tight drop-shadow-md">
                                Medical
                                <span className="block md:inline md:ml-4 text-emerald-300">Prescriptions</span>
                            </h1>
                            <p className="text-xl text-white/90 max-w-xl font-bold border-l-4 border-yellow-400 pl-4">
                                View, manage, and forward your prescriptions to pharmacies
                            </p>
                            {totalCount > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-3 mt-6 text-sm text-black bg-white px-5 py-2.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-fit font-bold"
                                >
                                    <div className="h-2.5 w-2.5 bg-green-500 rounded-full border border-black animate-pulse"></div>
                                    <span>{totalCount} {totalCount === 1 ? 'Prescription' : 'Prescriptions'} on Record</span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 md:px-12 -mt-16 relative z-10">
                {/* Search Bar */}
                {!isLoading && !error && prescriptions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-10"
                    >
                        <div className="relative">
                            <div className="relative bg-white rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-4 md:p-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 relative">
                                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-black" />
                                        <input
                                            type="text"
                                            placeholder="Search by diagnosis, medication, or notes..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-black rounded-xl focus:outline-none focus:ring-0 focus:bg-white transition-all font-bold placeholder-gray-500 text-black shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                                        />
                                    </div>
                                    {searchQuery && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => setSearchQuery('')}
                                            className="px-6 py-3 bg-red-100 hover:bg-red-200 rounded-xl transition-colors font-black text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        >
                                            Clear
                                        </motion.button>
                                    )}
                                </div>
                                {searchQuery && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-4 px-2"
                                    >
                                        <p className="text-sm font-bold text-black bg-yellow-300 inline-block px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            Found {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'prescription' : 'prescriptions'}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black"
                            >
                                <Skeleton className="h-32 w-full rounded-2xl bg-gray-200" />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black"
                    >
                        <ErrorMessage message={error} onRetry={loadPrescriptions} />
                    </motion.div>
                ) : (
                     <div className="space-y-6">
                        {filteredPrescriptions.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-6"
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
                                className="bg-white rounded-[2.5rem] p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-center"
                            >
                                <EmptyState
                                    icon={DocumentTextIcon}
                                    title={searchQuery ? "No matching prescriptions" : "No prescriptions"}
                                    description={searchQuery ? "Try adjusting your search terms." : "You do not have any prescriptions recorded yet."}
                                />
                            </motion.div>
                        )}
                     </div>
                )}
            </div>
        </div>
    );
};

export default PrescriptionsPage;