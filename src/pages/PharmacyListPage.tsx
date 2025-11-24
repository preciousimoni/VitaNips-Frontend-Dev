import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, FunnelIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon, MapIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { getPharmacies } from '../api/pharmacy';
import { Pharmacy } from '../types/pharmacy';
import PharmacyCard from '../features/pharmacy/components/PharmacyCard';
import PharmacyLocator from '../features/pharmacy/components/PharmacyLocator';
import Skeleton from '../components/ui/Skeleton';
import HealthHeader from '../features/health/components/HealthHeader';
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

                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="flex items-center gap-2">
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
                            {userLocation && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-200"
                                >
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                                    Location detected
                                </motion.div>
                            )}
                        </>
                    )}
                    
                    {totalCount > 0 && (
                        <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                            {totalCount} Pharmacies Found
                        </span>
                    )}

                    {/* View Mode Toggle */}
                    <div className="ml-auto flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <ListBulletIcon className="h-4 w-4 mr-1.5" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                                viewMode === 'map'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <MapIcon className="h-4 w-4 mr-1.5" />
                            Map
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
                <>
                    {viewMode === 'list' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {pharmacies.map((pharmacy, index) => (
                                    <motion.div
                                        key={pharmacy.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <PharmacyCard 
                                            pharmacy={pharmacy}
                                            isSelected={selectedPharmacy?.id === pharmacy.id}
                                            onSelect={() => setSelectedPharmacy(pharmacy)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
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
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-[600px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 relative"
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
                                <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200">
                                    <p className="text-sm font-bold text-gray-900">
                                        {pharmacies.length} {pharmacies.length === 1 ? 'Pharmacy' : 'Pharmacies'} on map
                                    </p>
                                </div>
                            </motion.div>
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
