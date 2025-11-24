import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getEmergencyServices, EmergencyService } from '@api/emergency';
import { MapPinIcon, PhoneIcon, MapIcon, ListBulletIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';
import Spinner from '@components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const EmergencyServiceLocator = () => {
    const [services, setServices] = useState<EmergencyService[]>([]);
    const [location, setLocation] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [selectedType, setSelectedType] = useState('all');

    const fetchServices = async (lat: number, lon: number) => {
        setLoading(true);
        try {
            const params: { lat: number; lon: number; radius: number; service_type?: string } = { lat, lon, radius: 20 };
            if (selectedType !== 'all') params.service_type = selectedType;
            
            const response = await getEmergencyServices(params);
            setServices(response.results);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setLocation([latitude, longitude]);
                    fetchServices(latitude, longitude);
                },
                (err) => {
                    console.error(err);
                    setLoading(false);
                }
            );
        }
    };

    useEffect(() => {
        handleUpdateLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedType]);

    const filters = [
        { id: 'all', label: 'All Services', icon: '🏥' },
        { id: 'hospital', label: 'Hospitals', icon: '🏥' },
        { id: 'ambulance', label: 'Ambulance', icon: '🚑' },
        { id: 'police', label: 'Police', icon: '🚔' },
    ];

    const getServiceTypeColor = (type: string) => {
        switch (type) {
            case 'hospital': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ambulance': return 'bg-red-100 text-red-700 border-red-200';
            case 'police': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <MapPinIcon className="h-7 w-7 mr-3 text-red-600" />
                            Nearby Emergency Services
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Find hospitals, ambulances, and police stations near you</p>
                    </div>
                    <button 
                        onClick={handleUpdateLocation}
                        disabled={loading}
                        className="flex items-center justify-center px-4 py-2 bg-white hover:bg-gray-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Update Location
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex flex-wrap gap-2">
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setSelectedType(filter.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                                selectedType === filter.id 
                                    ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/30 scale-105' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        >
                            <span className="mr-2">{filter.icon}</span>
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* View Toggle */}
            <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    {services.length > 0 ? (
                        <><strong>{services.length}</strong> services found within 20km</>
                    ) : (
                        'Searching for services...'
                    )}
                </p>
                <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                            viewMode === 'map'
                                ? 'bg-white text-red-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <MapIcon className="h-4 w-4 mr-1.5" />
                        Map
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                            viewMode === 'list'
                                ? 'bg-white text-red-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <ListBulletIcon className="h-4 w-4 mr-1.5" />
                        List
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {loading && (
                    <div className="py-16 text-center">
                        <Spinner size="lg" />
                        <p className="text-gray-500 mt-4">Locating emergency services...</p>
                    </div>
                )}

                {!loading && viewMode === 'map' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-[500px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative"
                    >
                        {location ? (
                            <>
                                <MapContainer center={location} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={location}>
                                        <Popup>
                                            <div className="text-center py-1">
                                                <p className="font-bold text-blue-600">📍 You are here</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                    {services.map(service => (
                                        <Marker 
                                            key={service.id} 
                                            position={[service.latitude, service.longitude]}
                                        >
                                            <Popup maxWidth={280}>
                                                <div className="p-2">
                                                    <div className={`inline-block px-2 py-1 rounded-lg text-xs font-bold mb-2 border ${getServiceTypeColor(service.service_type)}`}>
                                                        {service.service_type === 'hospital' && '🏥'}
                                                        {service.service_type === 'ambulance' && '🚑'}
                                                        {service.service_type === 'police' && '🚔'}
                                                        {' '}{service.service_type.toUpperCase()}
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 text-base mb-2">{service.name}</h3>
                                                    <p className="text-sm text-gray-600 mb-1">📍 {service.address}</p>
                                                    {service.phone_number && (
                                                        <p className="text-sm text-gray-600 mb-3">📞 {service.phone_number}</p>
                                                    )}
                                                    <a 
                                                        href={`tel:${service.phone_number}`}
                                                        className="block w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm text-center"
                                                    >
                                                        📞 Call Now
                                                    </a>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                                {/* Service count badge */}
                                <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200">
                                    <p className="text-sm font-bold text-gray-900">
                                        {services.length} {services.length === 1 ? 'Service' : 'Services'} nearby
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                                <MapPinIcon className="h-16 w-16 text-gray-300 mb-4" />
                                <p className="text-sm font-medium">Location not available</p>
                                <button 
                                    onClick={handleUpdateLocation}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                    Enable Location
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {!loading && viewMode === 'list' && (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {services.length === 0 ? (
                            <div className="text-center py-16">
                                <MapPinIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium mb-2">No services found nearby</p>
                                <p className="text-sm text-gray-400">Try updating your location or changing filters</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {services.map((service, index) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-red-200 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-3 border ${getServiceTypeColor(service.service_type)}`}>
                                                    {service.service_type === 'hospital' && '🏥'}
                                                    {service.service_type === 'ambulance' && '🚑'}
                                                    {service.service_type === 'police' && '🚔'}
                                                    {' '}{service.service_type.toUpperCase()}
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                                    {service.name}
                                                </h3>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <p className="flex items-start">
                                                        <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-gray-400" />
                                                        {service.address}
                                                    </p>
                                                    {service.phone_number && (
                                                        <p className="flex items-center">
                                                            <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                                                            {service.phone_number}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <a 
                                                href={`tel:${service.phone_number}`}
                                                className="flex-shrink-0 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-red-600/30 hover:scale-110 active:scale-95"
                                            >
                                                <PhoneIcon className="h-6 w-6" />
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyServiceLocator;

