import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, AdjustmentsHorizontalIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getDoctors } from '../api/doctors';
import { Doctor } from '../types/doctors';
import DoctorCard from '../features/doctors/components/DoctorCard';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';

const DoctorListPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const { user } = useAuth();

    const fetchInitialDoctors = useCallback(async (currentSearchTerm: string) => {
        setIsLoading(true);
        setError(null);
        setDoctors([]);
        setNextPageUrl(null);
        setTotalCount(0);

        try {
            const params: { search?: string } = {};
            if (currentSearchTerm) {
                params.search = currentSearchTerm;
            }
            const response = await getDoctors(params);

            if (response && Array.isArray(response.results)) {
                setDoctors(response.results);
                setNextPageUrl(response.next);
                setTotalCount(response.count);
            } else {
                console.warn("Received unexpected response structure:", response);
                setError("Received invalid data from server.");
                setDoctors([]);
            }
        } catch (err) {
            console.error("Error fetching doctors:", err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load doctors. Please try again later.';
            setError(errorMessage);
            setDoctors([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMoreDoctors = async () => {
        if (!nextPageUrl || isLoadingMore) return;

        setIsLoadingMore(true);
        setError(null);

        try {
            const response = await getDoctors(nextPageUrl);

            if (response && Array.isArray(response.results)) {
                setDoctors(prevDoctors => [...prevDoctors, ...response.results]);
                setNextPageUrl(response.next);
            } else {
                 console.warn("Received unexpected response structure on load more:", response);
                 setError("Received invalid data while loading more.");
                 setNextPageUrl(null);
            }
        } catch (err) {
            console.error("Error loading more doctors:", err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load more doctors.';
            setError(errorMessage);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchInitialDoctors(searchTerm);
    }, [fetchInitialDoctors, searchTerm]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        fetchInitialDoctors(searchTerm);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-blue-600 via-primary to-teal-600 overflow-hidden"
            >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider mb-6 border border-white/30"
                        >
                            <SparklesIcon className="h-4 w-4 mr-2" />
                            Trusted Healthcare Professionals
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight"
                        >
                            Find Your Perfect{' '}
                            <span className="relative inline-block">
                                <span className="relative z-10">Specialist</span>
                                <motion.span 
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="absolute bottom-2 left-0 right-0 h-3 bg-yellow-400/30 -z-0"
                                ></motion.span>
                            </span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed"
                        >
                            Connect with top-rated doctors for in-person or virtual consultations. 
                            Experience healthcare that revolves around you.
                        </motion.p>

                        {/* Floating Search Bar */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="relative max-w-2xl mx-auto"
                        >
                            <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full opacity-40 transform translate-y-4"></div>
                            <form onSubmit={handleSearchSubmit} className="relative bg-white rounded-2xl shadow-2xl border-2 border-white/50 p-2 flex items-center transition-all focus-within:ring-4 focus-within:ring-white/30 focus-within:scale-[1.02]">
                                <div className="flex-grow relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-14 pr-4 py-4 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 text-lg font-medium"
                                        placeholder="Search by name, specialty, or condition..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                                <motion.button 
                                    type="submit" 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="hidden sm:flex items-center px-8 py-4 bg-gradient-to-r from-primary to-teal-600 text-white font-bold rounded-xl hover:from-primary-dark hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Searching...
                                        </span>
                                    ) : 'Search'}
                                </motion.button>
                            </form>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-white/80"
                        >
                            <span className="font-medium">Popular:</span>
                            {['Cardiologist', 'Dermatologist', 'Pediatrician'].map((specialty, index) => (
                                <motion.button
                                    key={specialty}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSearchTerm(specialty)}
                                    className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl font-medium border border-white/30 transition-all"
                                >
                                    {specialty.replace('ist', 'y')}
                                </motion.button>
                            ))}
                        </motion.div>
                        
                        {totalCount > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-6 flex items-center justify-center gap-2 text-white/90"
                            >
                                <UserGroupIcon className="h-5 w-5" />
                                <span className="font-bold">{totalCount}</span>
                                <span>Doctors Available</span>
                            </motion.div>
                        )}
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Controls Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sticky top-20 z-20 bg-white/80 backdrop-blur-md py-4 px-6 -mx-4 sm:mx-0 rounded-2xl shadow-lg border border-gray-200"
                >
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-bold text-gray-900">Available Doctors</h2>
                        {totalCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-gradient-to-r from-primary to-teal-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md"
                            >
                                {totalCount} Results
                            </motion.span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-primary transition-all shadow-md whitespace-nowrap"
                        >
                            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-500" />
                            All Filters
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-primary transition-all shadow-md whitespace-nowrap"
                        >
                            <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Near Me
                        </motion.button>
                        <select className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-primary transition-all shadow-md focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer">
                            <option>Sort by: Recommended</option>
                            <option>Highest Rated</option>
                            <option>Most Experienced</option>
                            <option>Price: Low to High</option>
                        </select>
                    </div>
                </motion.div>

                {/* Results Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-3xl p-4 shadow-lg border-2 border-gray-100 h-[24rem] flex flex-col">
                                    <Skeleton className="h-48 w-full rounded-2xl mb-4" />
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2 mb-4" />
                                    <div className="mt-auto space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 bg-white rounded-3xl border-2 border-red-200 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 opacity-50"></div>
                            <div className="relative z-10">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                    className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-red-100 to-pink-100 mb-6 border-4 border-white shadow-lg"
                                >
                                    <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </motion.div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to load doctors</h3>
                                <p className="mt-2 text-gray-600 max-w-sm mx-auto mb-6">{error}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fetchInitialDoctors(searchTerm)}
                                    className="px-8 py-3 bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg text-sm font-bold rounded-xl hover:shadow-xl transition-all"
                                >
                                    Try Again
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {doctors.length > 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                >
                                    <AnimatePresence mode="popLayout">
                                        {doctors.map((doctor, index) => (
                                            <motion.div
                                                key={doctor.id}
                                                layout
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ y: -8 }}
                                            >
                                                <DoctorCard doctor={doctor} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-24 bg-white rounded-3xl border-2 border-gray-200 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 opacity-50"></div>
                                    <div className="relative z-10">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                            className="mx-auto flex items-center justify-center h-28 w-28 rounded-full bg-gradient-to-br from-gray-100 to-blue-100 mb-6 border-4 border-white shadow-lg"
                                        >
                                            <MagnifyingGlassIcon className="h-14 w-14 text-gray-400" />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No matches found</h3>
                                        <p className="text-gray-600 max-w-md mx-auto mb-8 text-base">
                                            We couldn't find any doctors matching "{searchTerm}". Try checking your spelling or use broader search terms.
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setSearchTerm(''); fetchInitialDoctors(''); }}
                                            className="px-10 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all shadow-xl"
                                        >
                                            Clear Search & Show All
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {nextPageUrl && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-16 text-center"
                                >
                                    <motion.button
                                        onClick={loadMoreDoctors}
                                        disabled={isLoadingMore}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="inline-flex items-center px-10 py-4 border-2 border-primary text-base font-bold rounded-2xl shadow-lg text-white bg-gradient-to-r from-primary to-teal-600 hover:from-primary-dark hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading More...
                                            </>
                                        ) : 'Load More Doctors'}
                                    </motion.button>
                                </motion.div>
                            )}
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default DoctorListPage;