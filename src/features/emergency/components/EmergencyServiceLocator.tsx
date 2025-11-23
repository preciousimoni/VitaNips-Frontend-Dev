import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getEmergencyServices, EmergencyService } from '../../../api/emergency';
import { MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';
import Spinner from '../../../components/ui/Spinner';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
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
            const params: any = { lat, lon, radius: 20 };
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
    }, [selectedType]);

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'hospital', label: '🏥 Hospitals' },
        { id: 'ambulance', label: '🚑 Ambulance' },
        { id: 'police', label: '🚔 Police' },
    ];

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Nearby Emergency Services</h2>
                <button 
                    onClick={handleUpdateLocation}
                    className="flex items-center text-sm text-primary hover:text-primary-dark"
                >
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    Update Location
                </button>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => setSelectedType(filter.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                            selectedType === filter.id 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <div className="flex justify-end space-x-2 mb-2">
                <button 
                    onClick={() => setViewMode('map')}
                    className={`text-xs px-2 py-1 rounded ${viewMode === 'map' ? 'bg-gray-200 font-bold' : 'text-gray-500'}`}
                >
                    Map
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`text-xs px-2 py-1 rounded ${viewMode === 'list' ? 'bg-gray-200 font-bold' : 'text-gray-500'}`}
                >
                    List
                </button>
            </div>

            {loading && <div className="py-8 text-center"><Spinner /></div>}

            {!loading && viewMode === 'map' && (
                <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200">
                    {location ? (
                        <MapContainer center={location} zoom={12} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={location}>
                                <Popup>Your Location</Popup>
                            </Marker>
                            {services.map(service => (
                                <Marker 
                                    key={service.id} 
                                    position={[service.latitude, service.longitude]}
                                >
                                    <Popup>
                                        <div className="p-1">
                                            <h3 className="font-bold text-sm">{service.name}</h3>
                                            <p className="text-xs text-gray-500">{service.service_type}</p>
                                            <a href={`tel:${service.phone_number}`} className="block mt-2 text-xs bg-green-500 text-white text-center py-1 rounded">Call</a>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
                            Location not available
                        </div>
                    )}
                </div>
            )}

            {!loading && viewMode === 'list' && (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {services.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-4">No services found nearby.</p>
                    ) : (
                        services.map(service => (
                            <div key={service.id} className="border rounded p-3 hover:shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                                        <p className="text-xs text-gray-500">{service.address}</p>
                                    </div>
                                    <a 
                                        href={`tel:${service.phone_number}`}
                                        className="p-2 text-green-600 bg-green-50 rounded-full hover:bg-green-100"
                                    >
                                        <PhoneIcon className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default EmergencyServiceLocator;

