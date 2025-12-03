import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Pharmacy } from '../../../types/pharmacy';
import L from 'leaflet';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PharmacyLocatorProps {
    pharmacies: Pharmacy[];
    onSelectPharmacy: (pharmacy: Pharmacy) => void;
    userLocation?: { lat: number; lon: number } | null;
}

const PharmacyLocator: React.FC<PharmacyLocatorProps> = ({ pharmacies, onSelectPharmacy, userLocation: propUserLocation }) => {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        // Use prop location if available
        if (propUserLocation) {
            setUserLocation([propUserLocation.lat, propUserLocation.lon]);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, [propUserLocation]);

    // Default to Lagos, Nigeria if no location available
    const defaultCenter: [number, number] = [6.5244, 3.3792];

    // Determine map center: user location, first pharmacy, or default
    const mapCenter = userLocation || 
                      (pharmacies.length > 0 && pharmacies[0].latitude && pharmacies[0].longitude 
                          ? [pharmacies[0].latitude, pharmacies[0].longitude] as [number, number]
                          : defaultCenter);

    return (
        <div className="h-full w-full">
            <MapContainer 
                center={mapCenter} 
                zoom={userLocation ? 13 : 11} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {userLocation && (
                    <Marker position={userLocation}>
                        <Popup>
                            <div className="text-center py-1">
                                <p className="font-bold text-blue-600">📍 You are here</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {pharmacies.map(pharmacy => (
                    pharmacy.latitude && pharmacy.longitude && (
                        <Marker 
                            key={pharmacy.id} 
                            position={[pharmacy.latitude, pharmacy.longitude]}
                        >
                            <Popup maxWidth={280}>
                                <div className="p-2">
                                    <h3 className="font-bold text-gray-900 text-base mb-2">{pharmacy.name}</h3>
                                    <p className="text-sm text-gray-600 mb-1">📍 {pharmacy.address}</p>
                                    {pharmacy.phone_number && (
                                        <p className="text-sm text-gray-600 mb-2">📞 {pharmacy.phone_number}</p>
                                    )}
                                    <div className="flex gap-2 mb-2">
                                        {pharmacy.offers_delivery && (
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                                🚚 Delivery
                                            </span>
                                        )}
                                        {pharmacy.is_24_hours && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                🕐 24/7
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => onSelectPharmacy(pharmacy)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default PharmacyLocator;

