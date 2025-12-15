import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, FunnelIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon, MapIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { getPharmacies } from '../api/pharmacy';
import { Pharmacy } from '../types/pharmacy';
import PharmacyCard from '../features/pharmacy/components/PharmacyCard';
import PharmacyLocator from '../features/pharmacy/components/PharmacyLocator';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/common/EmptyState';
import LocationPermissionModal from '../components/common/LocationPermissionModal';
import { motion, AnimatePresence } from 'framer-motion';

// Popular Nigerian city coordinates for quick selection
const POPULAR_CITIES = [
    { name: 'Lagos', lat: 6.5244, lon: 3.3792, country: '🇳🇬' },
    { name: 'Abuja', lat: 9.0765, lon: 7.3986, country: '🇳🇬' },
    { name: 'Port Harcourt', lat: 4.8156, lon: 7.0498, country: '🇳🇬' },
    { name: 'Kano', lat: 12.0022, lon: 8.5920, country: '🇳🇬' },
    { name: 'Ibadan', lat: 7.3775, lon: 3.9470, country: '🇳🇬' },
    { name: 'Benin City', lat: 6.3350, lon: 5.6037, country: '🇳🇬' },
    { name: 'Kaduna', lat: 10.5105, lon: 7.4165, country: '🇳🇬' },
    { name: 'Enugu', lat: 6.5244, lon: 7.5105, country: '🇳🇬' },
];

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
    const [showLocationHelp, setShowLocationHelp] = useState<boolean>(false);
    const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
    const [showManualLocation, setShowManualLocation] = useState<boolean>(false);
    const [manualLat, setManualLat] = useState<string>('');
    const [manualLon, setManualLon] = useState<string>('');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

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
                let errorMessage = 'Unable to access your location.';
                if (geoError.code === geoError.PERMISSION_DENIED) {
                    errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
                    setShowLocationHelp(true);
                } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
                    errorMessage = 'Location information is unavailable. Please try again.';
                } else if (geoError.code === geoError.TIMEOUT) {
                    errorMessage = 'Location request timed out. Please try again.';
                }
                setLocationError(errorMessage);
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
            if (!userLocation && !initialLocationAttempted.current) {
                // Show modal on first attempt
                setShowLocationModal(true);
            } else if (!userLocation) {
                // Subsequent attempts, just try to get location
                getUserLocation();
            } else {
                 fetchInitialPharmacies(searchTerm, true, userLocation, searchRadiusKm);
            }
        } else {
            fetchInitialPharmacies(searchTerm, false, null, searchRadiusKm);
        }
    };

    const handleAllowLocation = () => {
        setShowLocationModal(false);
        getUserLocation();
    };

    const handleManualLocationSubmit = () => {
        const lat = parseFloat(manualLat);
        const lon = parseFloat(manualLon);
        
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            setLocationError('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
            return;
        }
        
        setUserLocation({ lat, lon });
        setLocationError(null);
        setShowManualLocation(false);
        setIsNearMeSearch(true);
        fetchInitialPharmacies(searchTerm, true, { lat, lon }, searchRadiusKm);
    };

    const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRadius = Math.max(1, parseInt(event.target.value) || 1);
        setSearchRadiusKm(newRadius);
        if (isNearMeSearch && userLocation) {
            fetchInitialPharmacies(searchTerm, true, userLocation, newRadius);
        }
    }

  return (
    <>
        <LocationPermissionModal
            isOpen={showLocationModal}
            onClose={() => {
                setShowLocationModal(false);
                setIsNearMeSearch(false);
            }}
            onAllow={handleAllowLocation}
        />
        
        <div className="min-h-screen bg-cream-50 pb-12 font-sans">
            {/* Hero Header Section */}
            <div className="relative bg-primary-900 rounded-b-[3rem] overflow-hidden mb-12 shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mx-4 mt-4 md:mx-6">
                <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="relative">
                            <div className="bg-accent rounded-[2rem] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-3 hover:rotate-6 transition-transform">
                                <ShoppingBagIcon className="h-16 w-16 text-black" />
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-black text-amber-400 mb-4 font-display uppercase tracking-tight">Find Pharmacies</h1>
                            <p className="text-white text-lg md:text-xl font-bold max-w-2xl opacity-90">
                                Locate trusted pharmacies nearby or search by name.
                            </p>
                            {totalCount > 0 && (
                                <div className="inline-flex items-center gap-2 mt-6 bg-white/10 px-4 py-2 rounded-xl border-2 border-white/20">
                                    <div className="h-3 w-3 bg-accent rounded-full animate-pulse"></div>
                                    <span className="text-white font-bold">{totalCount} {totalCount === 1 ? 'Pharmacy' : 'Pharmacies'} Available</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 relative">

            <form onSubmit={handleSearchSubmit} className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-6 w-6 text-primary-900" />
                        </div>
                        <input
                            type="text"
                            id="search"
                            placeholder="Search pharmacy name or address..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="block w-full pl-14 pr-4 py-4 bg-cream-50 border-2 border-black focus:border-black focus:ring-0 rounded-2xl text-primary-900 placeholder-gray-500 font-bold text-lg transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || isGettingLocation}
                        className="btn bg-primary-900 text-white hover:bg-primary-800 px-8 py-4 rounded-2xl font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-70 disabled:scale-100 w-full md:w-auto"
                    >
                        {isLoading && !isLoadingMore ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                <span className="hidden md:inline">Searching...</span>
                                <span className="md:hidden">Search</span>
                            </span>
                        ) : 'Search'}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleNearMeToggle}
                            disabled={isGettingLocation}
                            className={`flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                                isNearMeSearch 
                                    ? 'bg-accent text-primary-900 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' 
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-black hover:bg-gray-50'
                            }`}
                        >
                            <MapPinIcon className={`h-5 w-5 mr-2 ${isGettingLocation ? 'animate-pulse' : ''}`} />
                            {isGettingLocation ? 'Locating...' : 'Near Me'}
                        </button>
                        {!isNearMeSearch && (
                            <div className="relative group">
                                <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-10">
                                    <p className="font-semibold mb-1">Find pharmacies near you</p>
                                    <p className="text-gray-300">Click "Near Me" to find pharmacies within your specified radius. We'll need your location permission to show the closest options.</p>
                                    <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isNearMeSearch && !userLocation && (
                        <button
                            type="button"
                            onClick={() => setShowManualLocation(true)}
                            className="flex items-center px-3 py-2 rounded-xl text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                        >
                            <MapPinIcon className="h-4 w-4 mr-1.5" />
                            Set Location Manually
                        </button>
                    )}

                    {isNearMeSearch && (
                        <>
                            <div className="flex items-center bg-cream-50 px-4 py-2 rounded-xl border-2 border-primary-900/10">
                                <label htmlFor="radius" className="text-sm font-bold text-gray-600 mr-3 uppercase tracking-wide">Within</label>
                                <input
                                    type="number"
                                    id="radius"
                                    min="1"
                                    max="50"
                                    value={searchRadiusKm}
                                    onChange={handleRadiusChange}
                                    className="w-20 bg-white border-2 border-gray-300 rounded-lg px-2 py-1 text-center text-sm font-black text-primary-900 focus:ring-0 focus:border-black"
                                />
                                <span className="text-sm font-bold text-gray-600 ml-2">km</span>
                            </div>
                            {userLocation && (
                                <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-xl text-xs font-bold border-2 border-green-200">
                                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                                    LOCATION DETECTED
                                </div>
                            )}
                        </>
                    )}
                    
                    {totalCount > 0 && (
                        <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                            {totalCount} Pharmacies Found
                        </span>
                    )}

                    {/* View Mode Toggle */}
                    <div className="ml-auto relative flex items-center bg-white border-2 border-black rounded-xl overflow-hidden p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`relative flex items-center px-4 py-2 text-sm font-bold transition-all rounded-lg ${
                                viewMode === 'list'
                                    ? 'bg-primary-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <ListBulletIcon className="h-5 w-5 mr-2 relative z-10" />
                            <span className="relative z-10">List</span>
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`relative flex items-center px-4 py-2 text-sm font-bold transition-all rounded-lg ${
                                viewMode === 'map'
                                    ? 'bg-primary-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <MapIcon className="h-5 w-5 mr-2 relative z-10" />
                            <span className="relative z-10">Map</span>
                        </button>
                    </div>
                </div>
                
                {showManualLocation && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 border border-blue-200 rounded-2xl p-4"
                    >
                        <div className="flex items-start">
                            <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900 mb-3">Enter Your Location Manually</p>
                                <div className="bg-white/50 rounded-lg p-3 border border-blue-100 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="e.g., 40.7128"
                                                value={manualLat}
                                                onChange={(e) => setManualLat(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="e.g., -74.0060"
                                                value={manualLon}
                                                onChange={(e) => setManualLon(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <p className="text-xs font-medium text-gray-700 mb-2">Or select a city:</p>
                                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                            {POPULAR_CITIES.map((city) => (
                                                <button
                                                    key={city.name}
                                                    onClick={() => {
                                                        setManualLat(city.lat.toString());
                                                        setManualLon(city.lon.toString());
                                                    }}
                                                    className="text-xs bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300 px-2 py-1.5 rounded-lg transition-colors text-left flex items-center"
                                                >
                                                    <span className="mr-1">{city.country}</span>
                                                    <span className="truncate">{city.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                        💡 Tip: You can find your exact coordinates by searching "my coordinates" on Google or using Google Maps.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleManualLocationSubmit}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Search with These Coordinates
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowManualLocation(false);
                                                setManualLat('');
                                                setManualLon('');
                                            }}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowManualLocation(false);
                                    setManualLat('');
                                    setManualLon('');
                                }}
                                className="text-blue-400 hover:text-blue-600 transition-colors ml-2"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {locationError && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
                    >
                        <div className="flex items-start">
                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-amber-900 mb-2">{locationError}</p>
                                {!showLocationHelp && (
                                    <button
                                        onClick={() => {
                                            setLocationError(null);
                                            setShowManualLocation(true);
                                        }}
                                        className="text-xs text-amber-700 hover:text-amber-900 underline font-medium"
                                    >
                                        Enter location manually instead
                                    </button>
                                )}
                                {showLocationHelp && (
                                    <div className="text-xs text-amber-700 space-y-2 mt-3 bg-white/50 rounded-lg p-3 border border-amber-100">
                                        <p className="font-semibold flex items-center">
                                            <InformationCircleIcon className="h-4 w-4 mr-1" />
                                            How to enable location access:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 ml-1">
                                            <li><strong>Chrome/Edge:</strong> Click the lock icon in the address bar → Site settings → Location → Allow</li>
                                            <li><strong>Firefox:</strong> Click the shield/lock icon → Permissions → Location → Allow</li>
                                            <li><strong>Safari:</strong> Safari menu → Settings → Websites → Location → Allow for this site</li>
                                        </ul>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => {
                                                    setLocationError(null);
                                                    setShowLocationHelp(false);
                                                    getUserLocation();
                                                }}
                                                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                            >
                                                Try Again
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setLocationError(null);
                                                    setShowLocationHelp(false);
                                                    setShowManualLocation(true);
                                                }}
                                                className="flex-1 bg-white hover:bg-gray-50 text-amber-600 border border-amber-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                            >
                                                Enter Manually
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setLocationError(null);
                                    setShowLocationHelp(false);
                                }}
                                className="text-amber-400 hover:text-amber-600 transition-colors ml-2"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </form>
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="min-h-[300px]"
        >
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-64 rounded-3xl" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="bg-red-50 text-red-600 px-8 py-6 rounded-3xl inline-block font-bold shadow-lg border-2 border-red-200">
                        <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2 text-red-500" />
                        {error}
                    </div>
                </div>
            ) : pharmacies.length > 0 ? (
                <>
                    {viewMode === 'list' ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {pharmacies.map((pharmacy, index) => (
                                    <motion.div
                                        key={pharmacy.id}
                                        layout
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -8 }}
                                    >
                                        <PharmacyCard 
                                            pharmacy={pharmacy}
                                            isSelected={selectedPharmacy?.id === pharmacy.id}
                                            onSelect={() => setSelectedPharmacy(pharmacy)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center"
                            >
                                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                                <p className="text-sm text-blue-900">
                                    <strong>Tip:</strong> Click on any pharmacy marker to view details and select it. Zoom and pan to explore the area.
                                </p>
                            </motion.div>
                            <div
                                className="h-[600px] rounded-[2.5rem] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black relative"
                            >
                                <PharmacyLocator 
                                    pharmacies={pharmacies}
                                    userLocation={userLocation}
                                    onSelectPharmacy={(pharmacy) => {
                                        setSelectedPharmacy(pharmacy);
                                        setViewMode('list');
                                        // Scroll to top to see the selected pharmacy
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                                {/* Pharmacy count badge on map */}
                                <div className="absolute top-4 left-4 z-[1000] bg-white px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                                    <p className="text-sm font-bold text-gray-900">
                                        {pharmacies.length} {pharmacies.length === 1 ? 'Pharmacy' : 'Pharmacies'} on map
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
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
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 text-center"
                >
                    <motion.button
                        onClick={loadMorePharmacies}
                        disabled={isLoadingMore}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn bg-white border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-lg hover:shadow-xl px-10 py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
                    >
                        {isLoadingMore ? (
                            <span className="flex items-center gap-2">
                                <Spinner size="sm" className="mr-2" /> Loading More...
                            </span>
                        ) : 'Load More Pharmacies'}
                    </motion.button>
                </motion.div>
            )}
        </motion.div>
        </div>
        </div>
    </>
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
