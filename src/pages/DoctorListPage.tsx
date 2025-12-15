import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { getDoctors } from '../api/doctors';
import { Doctor } from '../types/doctors';
import DoctorCard from '../features/doctors/components/DoctorCard';
import Skeleton from '../components/ui/Skeleton';
// import { useAuth } from '../contexts/AuthContext';

const DoctorListPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    // const { user } = useAuth(); // Unused for now

    // UI State for filters
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSpecialty] = useState<string | null>(null); // setSelectedSpecialty unused
    const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'today'>('all');
    const [sortBy, setSortBy] = useState('rating');

    // Derived state for UI (mocking client-side filtering for now as API handles search)
    const filteredDoctors = doctors.filter(() => {
        // if (availabilityFilter === 'available' && !doc.is_available) return false;
        // Add more client-side filters if needed
        return true;
    });

    const fetchInitialDoctors = useCallback(async (currentSearchTerm: string) => {
        setIsLoading(true);
        setError(null);
        setDoctors([]);
        setNextPageUrl(null);

        try {
            const params: { search?: string } = {};
            if (currentSearchTerm) {
                params.search = currentSearchTerm;
            }
            const response = await getDoctors(params);

            if (response && Array.isArray(response.results)) {
                setDoctors(response.results);
                setNextPageUrl(response.next);
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
        <div className="min-h-screen bg-cream-50 pb-12 font-sans">
            {/* Hero Header Section */}
            <div className="relative bg-primary-900 mx-4 mt-4 rounded-[3rem] overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight font-display leading-[1.1]">
                            Find Your Perfect <span className="text-accent underline decoration-4 underline-offset-8">Doctor</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-10 font-bold max-w-2xl mx-auto leading-relaxed">
                            Connect with top-rated specialists for in-person or virtual consultations.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-3xl mx-auto">
                            <div className="relative flex items-center bg-white rounded-[2rem] p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border-4 border-white">
                                <MagnifyingGlassIcon className="h-8 w-8 text-primary-900 ml-4 font-bold" strokeWidth={2.5} />
                                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Search by name, specialty, or condition..."
                                        className="w-full px-4 py-3 text-primary-900 placeholder-gray-400 focus:outline-none text-xl font-bold bg-transparent"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                    <button 
                                        type="submit" 
                                        className="hidden sm:block px-8 py-3 bg-primary-900 text-white font-black text-lg rounded-[1.5rem] hover:bg-accent hover:scale-105 transition-all duration-200 uppercase tracking-wider"
                                    >
                                        Search
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Popular Tags */}
                        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-bold">
                            <span className="text-white/60 uppercase tracking-widest py-2">Popular:</span>
                            {['Cardiologist', 'Dermatologist', 'Pediatrician', 'General'].map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSearchTerm(tag)}
                                    className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-accent hover:text-white transition-all border-2 border-transparent hover:border-white/20"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
                
                {/* Decorative Geometric Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-none opacity-20 -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-tr-[4rem] opacity-10 pointer-events-none"></div>
            </div>

            {/* Controls Row */}
            <div className="sticky top-0 z-30 bg-cream-50/95 border-b-2 border-primary-900/5 py-4 backdrop-blur-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center px-5 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap font-bold text-sm ${
                                    showFilters 
                                    ? 'bg-primary-900 border-primary-900 text-white shadow-lg transform scale-105' 
                                    : 'bg-white border-primary-900/10 hover:border-primary-900 text-primary-900'
                                }`}
                            >
                                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                                Filters
                                {(selectedSpecialty || availabilityFilter !== 'all') && (
                                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-lg ${showFilters ? 'bg-white text-primary-900' : 'bg-primary-900 text-white'}`}>
                                        {(selectedSpecialty ? 1 : 0) + (availabilityFilter !== 'all' ? 1 : 0)}
                                    </span>
                                )}
                            </button>
                            
                            <div className="h-8 w-0.5 bg-gray-200 mx-1 hidden sm:block"></div>
                            
                            <div className="flex gap-2">
                                {['all', 'available', 'today'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setAvailabilityFilter(filter as any)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border-2 ${
                                            availabilityFilter === filter
                                            ? 'bg-accent border-accent text-white shadow-md'
                                            : 'bg-white border-transparent text-gray-500 hover:border-gray-200'
                                        }`}
                                    >
                                        {filter === 'all' ? 'All Doctors' : filter === 'available' ? 'Available Now' : 'Today'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                                Showing <span className="text-primary-900 text-lg">{filteredDoctors.length}</span> doctors
                            </span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="appearance-none px-5 py-2.5 pr-10 rounded-xl border-2 border-primary-900/10 bg-white text-sm font-bold text-primary-900 focus:outline-none focus:border-primary-900 cursor-pointer hover:border-primary-900/30 transition-all"
                                >
                                    <option value="rating">Highest Rated</option>
                                    <option value="experience">Most Experienced</option>
                                    <option value="fee-low">Lowest Fee</option>
                                    <option value="fee-high">Highest Fee</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Secondary Controls Row - Removed as it was redundant */}

                {/* Results Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-[2rem] p-4 border-2 border-gray-100 flex flex-col h-[26rem]">
                                    <Skeleton className="h-48 w-full rounded-[1.5rem] mb-4" />
                                    <Skeleton className="h-8 w-3/4 mb-2 rounded-lg" />
                                    <Skeleton className="h-4 w-1/2 mb-4 rounded-lg" />
                                    <div className="mt-auto space-y-3">
                                        <Skeleton className="h-5 w-full rounded-lg" />
                                        <Skeleton className="h-12 w-full rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 bg-white rounded-[3rem] border-2 border-red-100 shadow-sm overflow-hidden"
                        >
                            <div className="relative z-10 max-w-lg mx-auto">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                    className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-50 text-red-500 mb-6 border-4 border-white shadow-lg"
                                >
                                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </motion.div>
                                <h3 className="text-3xl font-black text-primary-900 mb-3 font-display">Something went wrong</h3>
                                <p className="mt-2 text-xl text-gray-500 mb-8 font-medium">{error}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fetchInitialDoctors(searchTerm)}
                                    className="px-10 py-4 bg-primary-900 text-white text-lg font-bold rounded-2xl hover:bg-primary-800 transition-all shadow-lg"
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
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
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
                                    className="text-center py-24 bg-white rounded-[3rem] border-2 border-primary-900/5 shadow-sm overflow-hidden"
                                >
                                    <div className="relative z-10 max-w-lg mx-auto">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                            className="mx-auto flex items-center justify-center h-28 w-28 rounded-full bg-primary-50 text-primary-900 mb-6 border-4 border-white shadow-lg"
                                        >
                                            <MagnifyingGlassIcon className="h-14 w-14" />
                                        </motion.div>
                                        <h3 className="text-3xl font-black text-primary-900 mb-4 font-display">No matches found</h3>
                                        <p className="text-xl text-gray-500 font-medium max-w-md mx-auto mb-8">
                                            We couldn't find any doctors matching "{searchTerm}". Try checking your spelling or use broader search terms.
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setSearchTerm(''); fetchInitialDoctors(''); }}
                                            className="px-10 py-4 bg-primary-900 text-white font-bold rounded-2xl hover:bg-primary-800 transition-all shadow-xl text-lg"
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
                                        className="inline-flex items-center px-12 py-5 border-4 border-white text-xl font-black rounded-3xl shadow-xl text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-accent disabled:opacity-70 transition-all uppercase tracking-wider"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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