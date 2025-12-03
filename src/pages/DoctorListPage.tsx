import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, MapPinIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { getDoctors } from '../api/doctors';
import { Doctor } from '../types/doctors';
import DoctorCard from '../features/doctors/components/DoctorCard';
import Skeleton from '../components/ui/Skeleton';
// import { useAuth } from '../contexts/AuthContext';

const DoctorListPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
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
            {/* Hero Header Section */}
            <div className="relative bg-primary overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-90" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                            Find Your Perfect Doctor
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-10 font-medium">
                            Connect with top-rated specialists for in-person or virtual consultations
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                                <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white rounded-xl shadow-2xl p-2">
                                    <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 ml-3" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, specialty, or condition..."
                                        className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none text-base md:text-lg bg-transparent"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                    <button type="submit" className="hidden sm:block px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-md">
                                        Search
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Popular Tags */}
                        <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-3 text-sm text-white/80">
                            <span>Popular:</span>
                            {['Cardiologist', 'Dermatologist', 'Pediatrician', 'General'].map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSearchTerm(tag)}
                                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Controls Row */}
            <div className="sticky top-16 md:top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                                    showFilters 
                                    ? 'bg-primary/10 border-primary text-primary' 
                                    : 'border-gray-300 hover:border-primary hover:text-primary text-gray-700'
                                }`}
                            >
                                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                                Filters
                                {(selectedSpecialty || availabilityFilter !== 'all') && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                                        {(selectedSpecialty ? 1 : 0) + (availabilityFilter !== 'all' ? 1 : 0)}
                                    </span>
                                )}
                            </button>
                            
                            <div className="h-8 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                            
                            <div className="flex gap-2">
                                {['all', 'available', 'today'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setAvailabilityFilter(filter as any)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                            availabilityFilter === filter
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {filter === 'all' ? 'All Doctors' : filter === 'available' ? 'Available Now' : 'Today'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <span className="text-sm text-gray-500 font-medium">
                                Showing <span className="text-gray-900 font-bold">{filteredDoctors.length}</span> doctors
                            </span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
                            >
                                <option value="rating">Highest Rated</option>
                                <option value="experience">Most Experienced</option>
                                <option value="fee-low">Lowest Fee</option>
                                <option value="fee-high">Highest Fee</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

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