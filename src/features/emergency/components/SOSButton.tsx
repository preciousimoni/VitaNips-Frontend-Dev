import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { triggerSOS } from '../../api/emergency';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const SOSButton = () => {
    const [isPressed, setIsPressed] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [showConfirm, setShowConfirm] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const pressTimer = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();

    const handlePressStart = () => {
        setIsPressed(true);
        setCountdown(3);

        pressTimer.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(pressTimer.current!);
                    handleSOSTrigger();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handlePressEnd = () => {
        if (pressTimer.current) {
            clearInterval(pressTimer.current);
        }
        setIsPressed(false);
        setCountdown(3);
    };

    const handleSOSTrigger = async () => {
        setIsPressed(false);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000
                });
            });

            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
            setShowConfirm(true);
        } catch (error) {
            toast.error('Unable to get location. Ensure location services are enabled.');
        }
    };

    const confirmSOS = async () => {
        if (!location) return;
        try {
            await triggerSOS({
                latitude: location.latitude,
                longitude: location.longitude
            });
            toast.success('Emergency alert sent!');
            setShowConfirm(false);
            navigate('/emergency/alert-sent');
        } catch (error) {
            toast.error('Failed to send alert. Call emergency services immediately.');
        }
    };

    return (
        <>
            <button
                className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl transition-transform active:scale-95 select-none ${
                    isPressed 
                        ? 'bg-red-700 border-red-300 scale-95' 
                        : 'bg-gradient-to-br from-red-500 to-red-700 border-white'
                }`}
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
            >
                {isPressed ? (
                    <div className="animate-pulse text-white text-center">
                        <span className="block text-5xl font-bold mb-2">{countdown}</span>
                        <span className="text-sm font-medium">Release to cancel</span>
                    </div>
                ) : (
                    <div className="text-white text-center">
                        <ExclamationTriangleIcon className="h-16 w-16 mx-auto mb-2" />
                        <span className="block text-xl font-bold tracking-wider">HOLD FOR SOS</span>
                    </div>
                )}
            </button>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmSOS}
                title="Send Emergency Alert?"
                message="This will send your location to all your emergency contacts immediately."
                confirmText="SEND ALERT"
                cancelText="Cancel"
                isDangerous={true}
            />
        </>
    );
};

export default SOSButton;
