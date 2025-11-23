import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Pharmacy } from '@types/pharmacy';
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
}

const PharmacyLocator: React.FC<PharmacyLocatorProps> = ({ pharmacies, onSelectPharmacy }) => {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    const defaultCenter: [number, number] = [51.505, -0.09]; // Default fallback

    return (
        <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
            <MapContainer 
                center={userLocation || defaultCenter} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {userLocation && (
                    <Marker position={userLocation}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}

                {pharmacies.map(pharmacy => (
                    pharmacy.latitude && pharmacy.longitude && (
                        <Marker 
                            key={pharmacy.id} 
                            position={[pharmacy.latitude, pharmacy.longitude]}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold text-gray-900">{pharmacy.name}</h3>
                                    <p className="text-sm text-gray-600">{pharmacy.address}</p>
                                    <div className="mt-2">
                                        <button 
                                            onClick={() => onSelectPharmacy(pharmacy)}
                                            className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primary-dark"
                                        >
                                            Select Pharmacy
                                        </button>
                                    </div>
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

