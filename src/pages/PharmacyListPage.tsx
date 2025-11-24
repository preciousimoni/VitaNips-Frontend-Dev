import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { getPharmacies } from '../api/pharmacy';
import { Pharmacy } from '../types/pharmacy';
import PharmacyCard from '../features/pharmacy/components/PharmacyCard';
import Skeleton from '../components/ui/Skeleton';
import HealthHeader from '../features/health/components/HealthHeader';
import EmptyState from '../components/common/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const PharmacyListPage: React.FC = () => {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [searchRadiusKm, setSearchRadiusKm] = useState<number>(5);
    const [isNearMeSearch, setIsNearMeSearch] = useState<boolean>(false);
    const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const initialLocationAttempted = useRef(false);

    const fetchInitialPharmacies = useCallback(async (
        currentSearchTerm: string,
        nearMe: boolean,
        location: { lat: number; lon: number } | null,
        radius: number
    ) => {
        setIsLoading(true);
        setError(null);
        setPharmacies([]);
        setNextPageUrl(null);
        setTotalCount(0);

        const params: { search?: string; lat?: number; lon?: number; radius?: number } = {};
        if (currentSearchTerm) {
            params.search = currentSearchTerm;
        }
        if (nearMe && location) {
            params.lat = location.lat;
            params.lon = location.lon;
            params.radius = radius;
        }

        try {
            const response = await getPharmacies(params);
            if (response && Array.isArray(response.results)) {
                 setPharmacies(response.results);
                 setNextPageUrl(response.next);
                 setTotalCount(response.count);
            } else {
                 setPharmacies([]);
            }
        } catch (err) {
            setError('Failed to load pharmacies. Please try again later.');
            setPharmacies([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported.");
            setIsNearMeSearch(false);
            return;
        }
        setIsGettingLocation(true);
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setIsGettingLocation(false);
                initialLocationAttempted.current = true;
                if(isNearMeSearch) {
                    fetchInitialPharmacies(searchTerm, true, { lat: position.coords.latitude, lon: position.coords.longitude }, searchRadiusKm);
                }
            },
            (geoError) => {
                setLocationError(`Location access denied. Showing results for default/search.`);
                setUserLocation(null);
                setIsNearMeSearch(false);
                setIsGettingLocation(false);
                initialLocationAttempted.current = true;
                fetchInitialPharmacies(searchTerm, false, null, searchRadiusKm);
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
    }, [isNearMeSearch, searchTerm, searchRadiusKm, fetchInitialPharmacies]);

    const loadMorePharmacies = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const response = await getPharmacies(nextPageUrl);
            if (response && Array.isArray(response.results)) {
                  setPharmacies(prev => [...prev, ...response.results]);
                  setNextPageUrl(response.next);
            }
        } catch (err) {
            // Silent fail on load more or show toast
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchInitialPharmacies(searchTerm, false, null, searchRadiusKm);
        initialLocationAttempted.current = false;
    }, []);

     const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
         setSearchTerm(event.target.value);
     };

     const handleSearchSubmit = (event: React.FormEvent) => {
         event.preventDefault();
         if (isNearMeSearch && !userLocation && !isGettingLocation && !locationError) {
             getUserLocation();
         } else {
             fetchInitialPharmacies(searchTerm, isNearMeSearch, userLocation, searchRadiusKm);
         }
     };

     const handleNearMeToggle = () => {
        const newStatus = !isNearMeSearch;
        setIsNearMeSearch(newStatus);
        setLocationError(null);

        if (newStatus) {
            if (!userLocation) {
                getUserLocation();
            } else {
                 fetchInitialPharmacies(searchTerm, true, userLocation, searchRadiusKm);
            }
        } else {
            fetchInitialPharmacies(searchTerm, false, null, searchRadiusKm);
        }
    };

    const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRadius = Math.max(1, parseInt(event.target.value) || 1);
        setSearchRadiusKm(newRadius);
        if (isNearMeSearch && userLocation) {
            fetchInitialPharmacies(searchTerm, true, userLocation, newRadius);
        }
    }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <HealthHeader
            title="Find Pharmacies"
            subtitle="Locate trusted pharmacies nearby or search by name."
            icon={ShoppingBagIcon}
            gradientFrom="from-emerald-500"
            gradientTo="to-teal-600"
            shadowColor="shadow-emerald-500/30"
        />

        <div className="mb-10 bg-white rounded-3xl shadow-xl shadow-emerald-100/50 p-6 border border-emerald-50 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

            <form onSubmit={handleSearchSubmit} className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            id="search"
                            placeholder="Search pharmacy name or address..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl transition-all text-gray-900 placeholder-gray-400 font-medium"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || isGettingLocation}
                        className="btn bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                    >
                        {isLoading && !isLoadingMore ? 'Searching...' : 'Search'}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                    <button
                        type="button"
                        onClick={handleNearMeToggle}
                        disabled={isGettingLocation}
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            isNearMeSearch 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-2 ring-emerald-500/20' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <MapPinIcon className={`h-5 w-5 mr-2 ${isGettingLocation ? 'animate-pulse' : ''}`} />
                        {isGettingLocation ? 'Locating...' : 'Near Me'}
                    </button>

                    {isNearMeSearch && (
                        <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                            <label htmlFor="radius" className="text-sm font-medium text-gray-500 mr-3">Within</label>
                            <input
                                type="number"
                                id="radius"
                                min="1"
                                max="50"
                                value={searchRadiusKm}
                                onChange={handleRadiusChange}
                                className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-1 text-center text-sm font-bold text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            <span className="text-sm font-medium text-gray-500 ml-2">km</span>
                        </div>
                    )}
                    
                    {totalCount > 0 && (
                        <span className="ml-auto text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                            {totalCount} Pharmacies Found
                        </span>
                    )}
                </div>
                
                {locationError && (
                    <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl inline-block">
                        {locationError}
                    </p>
                )}
            </form>
        </div>

        <div className="min-h-[300px]">
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-3xl" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl inline-block font-medium">
                        {error}
                    </div>
                </div>
            ) : pharmacies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {pharmacies.map((pharmacy, index) => (
                            <motion.div
                                key={pharmacy.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <PharmacyCard pharmacy={pharmacy} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <EmptyState 
                    icon={FunnelIcon}
                    title="No pharmacies found"
                    description="Try adjusting your search terms or increasing the search radius."
                    actionLabel="Clear Filters"
                    onAction={() => {
                        setSearchTerm('');
                        setIsNearMeSearch(false);
                        fetchInitialPharmacies('', false, null, 5);
                    }}
                />
            )}

            {nextPageUrl && (
                <div className="mt-12 text-center">
                    <button
                        onClick={loadMorePharmacies}
                        disabled={isLoadingMore}
                        className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-200 hover:text-emerald-600 shadow-sm px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {isLoadingMore ? (
                            <span className="flex items-center">
                                <Spinner size="sm" className="mr-2" /> Loading...
                            </span>
                        ) : 'Load More Pharmacies'}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

// Helper spinner component if not available in global scope yet
const Spinner = ({ size = 'md', className = '' }: { size?: 'sm'|'md'|'lg', className?: string }) => {
    const sizeClasses = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
    return (
        <svg className={`animate-spin ${sizeClasses[size]} ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );
};

export default PharmacyListPage;
