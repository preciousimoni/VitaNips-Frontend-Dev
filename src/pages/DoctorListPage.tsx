import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
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
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Header Section */}
            <div className="bg-white border-b border-gray-200 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-green-50/50 to-transparent pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                            Trusted Healthcare Professionals
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                            Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">Specialist</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
                            Connect with top-rated doctors for in-person or virtual consultations. 
                            Experience healthcare that revolves around you.
                        </p>

                        {/* Floating Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-20 transform translate-y-4"></div>
                            <form onSubmit={handleSearchSubmit} className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex items-center transition-all focus-within:ring-4 focus-within:ring-primary/10">
                                <div className="flex-grow relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 text-base"
                                        placeholder="Search by name, specialty, or condition..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="hidden sm:flex items-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    disabled={isLoading}
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                        
                        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                            <span>Popular:</span>
                            <button onClick={() => setSearchTerm('Cardiologist')} className="hover:text-primary underline">Cardiology</button>
                            <button onClick={() => setSearchTerm('Dermatologist')} className="hover:text-primary underline">Dermatology</button>
                            <button onClick={() => setSearchTerm('Pediatrician')} className="hover:text-primary underline">Pediatrics</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Controls Row */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sticky top-20 z-20 bg-gray-50/95 backdrop-blur-sm py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-bold text-gray-900">Available Doctors</h2>
                        {totalCount > 0 && (
                            <span className="bg-white border border-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                {totalCount} Results
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm whitespace-nowrap">
                            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2 text-gray-500" />
                            All Filters
                        </button>
                        <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm whitespace-nowrap">
                            <MapPinIcon className="h-4 w-4 mr-2 text-gray-500" />
                            Near Me
                        </button>
                        <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm focus:ring-primary focus:border-primary">
                            <option>Sort by: Recommended</option>
                            <option>Highest Rated</option>
                            <option>Most Experienced</option>
                            <option>Price: Low to High</option>
                        </select>
                    </div>
                </div>

                {/* Results Grid */}
                <div>
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-[24rem] flex flex-col">
                                    <Skeleton className="h-48 w-full rounded-xl mb-4" />
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
                        <div className="text-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
                                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Unable to load doctors</h3>
                            <p className="mt-2 text-gray-500 max-w-sm mx-auto">{error}</p>
                            <button 
                                onClick={() => fetchInitialDoctors(searchTerm)}
                                className="mt-6 px-6 py-2 bg-white border border-gray-200 shadow-sm text-sm font-bold rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {doctors.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {doctors.map((doctor) => (
                                        <DoctorCard key={doctor.id} doctor={doctor} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-50 mb-6">
                                        <MagnifyingGlassIcon className="h-10 w-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                                        We couldn't find any doctors matching "{searchTerm}". Try checking your spelling or use broader search terms.
                                    </p>
                                    <button 
                                        onClick={() => { setSearchTerm(''); fetchInitialDoctors(''); }}
                                        className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
                                    >
                                        Clear Search & Show All
                                    </button>
                                </div>
                            )}

                            {nextPageUrl && (
                                <div className="mt-16 text-center">
                                    <button
                                        onClick={loadMoreDoctors}
                                        disabled={isLoadingMore}
                                        className="inline-flex items-center px-8 py-3 border border-transparent text-base font-bold rounded-xl shadow-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all transform hover:-translate-y-0.5"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading more...
                                            </>
                                        ) : 'Load More Doctors'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorListPage;