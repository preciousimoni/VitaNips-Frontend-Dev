import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { triggerSOS } from '@api/emergency';
import ConfirmationModal from '@components/common/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';

const SOSButton = () => {
    const [isPressed, setIsPressed] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showLocationError, setShowLocationError] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string>('');
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
        
        // Try to get location
        if (navigator.geolocation) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false,
                        timeout: 8000,
                        maximumAge: 60000
                    });
                });

                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setShowConfirm(true);
            } catch (error: any) {
                // Location failed - show error modal with option to proceed without location
                let errorMsg = 'Unable to get your location.';
                if (error.code === 1) {
                    errorMsg = 'Location access denied. Enable location permissions in your browser settings.';
                } else if (error.code === 2) {
                    errorMsg = 'Location information is unavailable. Check your device settings.';
                } else if (error.code === 3) {
                    errorMsg = 'Location request timed out. Your connection may be slow.';
                }
                setLocationError(errorMsg);
                setShowLocationError(true);
            }
        } else {
            setLocationError('Geolocation is not supported by your browser.');
            setShowLocationError(true);
        }
    };

    const handleSendWithoutLocation = async () => {
        setShowLocationError(false);
        try {
            // Send SOS with default/null location
            await triggerSOS({
                latitude: 0,
                longitude: 0
            });
            toast.success('Emergency alert sent! (Location unavailable)', { duration: 5000 });
            navigate('/emergency/alert-sent');
        } catch (error) {
            toast.error('Failed to send alert. Call emergency services immediately.');
        }
    };

    const handleRetryLocation = () => {
        setShowLocationError(false);
        handleSOSTrigger();
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

            {/* Location Error Modal */}
            <AnimatePresence>
                {showLocationError && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLocationError(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                                        <MapPinIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Location Unavailable</h2>
                                    <p className="text-amber-50 text-sm">{locationError}</p>
                                </div>
                                <button
                                    onClick={() => setShowLocationError(false)}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                                    <p className="text-sm text-amber-900 leading-relaxed">
                                        <strong>What happens next?</strong><br />
                                        You can still send an SOS alert to your emergency contacts, but your location won't be included. 
                                        We recommend calling emergency services directly if you need immediate help.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleSendWithoutLocation}
                                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-600/30"
                                    >
                                        Send Alert Without Location
                                    </button>
                                    <button
                                        onClick={handleRetryLocation}
                                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors border border-gray-200"
                                    >
                                        Try Getting Location Again
                                    </button>
                                    <button
                                        onClick={() => setShowLocationError(false)}
                                        className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SOSButton;
