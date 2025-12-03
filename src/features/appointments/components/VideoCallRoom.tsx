// src/features/appointments/components/VideoCallRoom.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect, Room, LocalVideoTrack, LocalAudioTrack, RemoteParticipant, RemoteTrack, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';
import {
    VideoCameraIcon,
    VideoCameraSlashIcon,
    MicrophoneIcon,
    PhoneXMarkIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { generateVideoToken, endVideoSession } from '../../../api/video';
import { formatDuration } from '../../../utils/formatting';
import { useAuth } from '../../../contexts/AuthContext';

interface VideoCallRoomProps {
    appointmentId: number;
    onCallEnd: () => void;
}

const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ appointmentId, onCallEnd }) => {
    const { user } = useAuth();
    const [room, setRoom] = useState<Room | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [participantCount, setParticipantCount] = useState(0);
    const [callDuration, setCallDuration] = useState(0);
    const [remoteParticipants, setRemoteParticipants] = useState<Map<string, { participant: RemoteParticipant; hasVideo: boolean; name: string }>>(new Map());
    
    const localVideoRef = useRef<HTMLDivElement>(null);
    const remoteVideoRef = useRef<HTMLDivElement>(null);
    const roomRef = useRef<Room | null>(null);
    const callStartTimeRef = useRef<number>(Date.now());

    // Get user initials for avatar
    const getUserInitials = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        if (user?.first_name) {
            return user.first_name[0].toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };

    // Update call duration every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Parse participant identity to get name
    const getParticipantName = (identity: string): string => {
        // Identity might be in format "user_id" or "first_name last_name" or email
        // Try to extract name from identity string
        if (identity.includes('@')) {
            // Email format - extract name part
            return identity.split('@')[0];
        }
        // Try to parse as name
        const parts = identity.split(' ');
        if (parts.length >= 2) {
            return `${parts[0]} ${parts[1]}`;
        }
        return identity;
    };

    // Get participant initials
    const getParticipantInitials = (name: string): string => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        if (parts.length === 1 && parts[0].length > 0) {
            return parts[0][0].toUpperCase();
        }
        return 'U';
    };

    // Handle remote participant
    const handleParticipant = useCallback((participant: RemoteParticipant) => {
        console.log(`Participant "${participant.identity}" connected`);
        const participantName = getParticipantName(participant.identity);
        
        // Check if participant has video track
        const hasVideoTrack = Array.from(participant.videoTracks.values()).some(
            pub => pub.isSubscribed && pub.track && (pub.track as RemoteVideoTrack).isEnabled
        );
        
        // Add participant to state
        setRemoteParticipants(prev => {
            const newMap = new Map(prev);
            newMap.set(participant.sid, {
                participant,
                hasVideo: hasVideoTrack,
                name: participantName
            });
            return newMap;
        });
        
        // Only attach tracks that are already subscribed and enabled
        participant.tracks.forEach(publication => {
            if (publication.isSubscribed && publication.track) {
                const track = publication.track;
                if (track.kind === 'video') {
                    const videoTrack = track as RemoteVideoTrack;
                    if (videoTrack.isEnabled) {
                        console.log(`Attaching already subscribed ${track.kind} track from ${participant.identity}`);
                        attachTrack(track);
                    } else {
                        console.log(`Video track from ${participant.identity} is disabled`);
                        setRemoteParticipants(prev => {
                            const newMap = new Map(prev);
                            const existing = newMap.get(participant.sid);
                            if (existing) {
                                newMap.set(participant.sid, { ...existing, hasVideo: false });
                            }
                            return newMap;
                        });
                    }
                } else {
                    attachTrack(track);
                }
            } else {
                console.log(`Track from ${participant.identity} not yet subscribed, waiting for subscription...`);
            }
        });

        // Listen for track subscriptions
        participant.on('trackSubscribed', track => {
            console.log(`Subscribed to ${track.kind} track from ${participant.identity}`);
            if (track.kind === 'video') {
                const videoTrack = track as RemoteVideoTrack;
                if (videoTrack.isEnabled) {
                    attachTrack(track);
                    setRemoteParticipants(prev => {
                        const newMap = new Map(prev);
                        const existing = newMap.get(participant.sid);
                        if (existing) {
                            newMap.set(participant.sid, { ...existing, hasVideo: true });
                        }
                        return newMap;
                    });
                }
            } else {
                attachTrack(track);
            }
        });

        participant.on('trackUnsubscribed', track => {
            console.log(`Unsubscribed from ${track.kind} track from ${participant.identity}`);
            if (track.kind === 'video') {
                detachTrack(track);
                setRemoteParticipants(prev => {
                    const newMap = new Map(prev);
                    const existing = newMap.get(participant.sid);
                    if (existing) {
                        newMap.set(participant.sid, { ...existing, hasVideo: false });
                    }
                    return newMap;
                });
            } else {
                detachTrack(track);
            }
        });

        // Listen for track enabled/disabled events
        participant.on('trackEnabled', publication => {
            console.log(`Track enabled: ${publication.kind} from ${participant.identity}`);
            if (publication.kind === 'video' && publication.track) {
                attachTrack(publication.track);
                setRemoteParticipants(prev => {
                    const newMap = new Map(prev);
                    const existing = newMap.get(participant.sid);
                    if (existing) {
                        newMap.set(participant.sid, { ...existing, hasVideo: true });
                    }
                    return newMap;
                });
            }
        });

        participant.on('trackDisabled', publication => {
            console.log(`Track disabled: ${publication.kind} from ${participant.identity}`);
            if (publication.kind === 'video' && publication.track) {
                detachTrack(publication.track);
                setRemoteParticipants(prev => {
                    const newMap = new Map(prev);
                    const existing = newMap.get(participant.sid);
                    if (existing) {
                        newMap.set(participant.sid, { ...existing, hasVideo: false });
                    }
                    return newMap;
                });
            }
        });
    }, []);

    const attachTrack = (track: RemoteTrack) => {
        if (track.kind === 'video' && remoteVideoRef.current) {
            // Find which participant this track belongs to
            let participantSid: string | null = null;
            if (room) {
                room.participants.forEach(participant => {
                    participant.videoTracks.forEach(publication => {
                        if (publication.track === track) {
                            participantSid = participant.sid;
                        }
                    });
                });
            }
            
            // Remove any existing video elements
            const existingElements = remoteVideoRef.current.querySelectorAll('video');
            existingElements.forEach(el => {
                try {
                    const videoTrack = (el as any).srcObject?.getTracks?.()?.[0];
                    if (videoTrack) {
                        videoTrack.stop();
                    }
                } catch (e) {
                    console.warn('Error stopping existing track:', e);
                }
                try {
                    if (remoteVideoRef.current && el.parentNode === remoteVideoRef.current) {
                        remoteVideoRef.current.removeChild(el);
                    }
                } catch (e) {
                    // Element already removed
                }
            });
            
            try {
                const element = (track as RemoteVideoTrack).attach();
                element.className = 'w-full h-full object-cover rounded-lg';
                element.setAttribute('playsinline', 'true');
                element.setAttribute('autoplay', 'true');
                remoteVideoRef.current.appendChild(element);
                console.log('Remote video track attached successfully');
                
                // Update participant state to indicate video is now available
                if (participantSid) {
                    setRemoteParticipants(prev => {
                        const newMap = new Map(prev);
                        const existing = newMap.get(participantSid!);
                        if (existing) {
                            newMap.set(participantSid!, { ...existing, hasVideo: true });
                        }
                        return newMap;
                    });
                }
            } catch (error) {
                console.error('Error attaching remote video track:', error);
            }
        } else if (track.kind === 'audio') {
            try {
                const audioElement = (track as RemoteAudioTrack).attach();
                if (audioElement instanceof HTMLAudioElement) {
                    audioElement.setAttribute('autoplay', 'true');
                    audioElement.setAttribute('playsinline', 'true');
                    document.body.appendChild(audioElement);
                    console.log('Remote audio track attached successfully');
                }
            } catch (error) {
                console.error('Error attaching remote audio track:', error);
            }
        }
    };

    const detachTrack = (track: RemoteTrack) => {
        // Find which participant this track belongs to
        let participantSid: string | null = null;
        if (room) {
            room.participants.forEach(participant => {
                if (track.kind === 'video') {
                    participant.videoTracks.forEach(publication => {
                        if (publication.track === track) {
                            participantSid = participant.sid;
                        }
                    });
                } else {
                    participant.audioTracks.forEach(publication => {
                        if (publication.track === track) {
                            participantSid = participant.sid;
                        }
                    });
                }
            });
        }
        
        const elements = (track as RemoteVideoTrack | RemoteAudioTrack).detach();
        elements.forEach((element: HTMLElement) => {
            try {
                if (element.parentNode) {
                    element.remove();
                }
            } catch (e) {
                // Element already removed
            }
        });
        
        // Update participant state if video track was detached
        if (track.kind === 'video' && participantSid) {
            setRemoteParticipants(prev => {
                const newMap = new Map(prev);
                const existing = newMap.get(participantSid!);
                if (existing) {
                    newMap.set(participantSid!, { ...existing, hasVideo: false });
                }
                return newMap;
            });
        }
    };

    // Initialize video call
    useEffect(() => {
        let mounted = true;

        const initializeCall = async () => {
            try {
                setIsConnecting(true);
                setError(null);

                // Get video token from backend
                const tokenData = await generateVideoToken(appointmentId);
                console.log('Token received:', { room: tokenData.room_name, identity: tokenData.identity });

                if (!mounted) return;

                // Request camera and microphone permissions
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                // Connect to Twilio Video Room
                const connectedRoom = await connect(tokenData.token, {
                    name: tokenData.room_name,
                    audio: true,
                    video: { width: 640, height: 480 }
                });

                if (!mounted) {
                    connectedRoom.disconnect();
                    return;
                }

                console.log(`Successfully connected to room: ${connectedRoom.name}`);
                setRoom(connectedRoom);
                roomRef.current = connectedRoom;
                callStartTimeRef.current = Date.now();

                // Function to attach local video tracks
                const attachLocalVideo = () => {
                    const videoContainer = localVideoRef.current;
                    if (!videoContainer) {
                        console.warn('localVideoRef.current is null, skipping local video attachment');
                        return;
                    }
                    
                    // Safely clear any existing elements
                    try {
                        while (videoContainer.firstChild) {
                            const child: ChildNode | null = videoContainer.firstChild;
                            if (child && child.parentNode === videoContainer) {
                                videoContainer.removeChild(child);
                            } else {
                                break; // Child already removed, exit loop
                            }
                        }
                    } catch (error) {
                        console.warn('Error clearing local video container:', error);
                        // Try alternative method
                        videoContainer.innerHTML = '';
                    }
                    
                    const videoTracks = Array.from(connectedRoom.localParticipant.videoTracks.values());
                    console.log(`Found ${videoTracks.length} local video track(s)`);
                    
                    videoTracks.forEach(publication => {
                        if (publication.track && localVideoRef.current) {
                            try {
                                const track = publication.track as LocalVideoTrack;
                                console.log('Attaching local video track:', track.name, track.isEnabled);
                                const element = track.attach();
                                element.className = 'w-full h-full object-cover rounded-lg mirror';
                                element.setAttribute('playsinline', 'true');
                                element.setAttribute('autoplay', 'true');
                                element.setAttribute('muted', 'true'); // Mute local video to prevent feedback
                                
                                // Double-check ref is still valid before appending
                                if (localVideoRef.current) {
                                    localVideoRef.current.appendChild(element);
                                    console.log('Local video track attached successfully');
                                } else {
                                    console.warn('localVideoRef became null during attachment, detaching track');
                                    track.detach();
                                }
                            } catch (error) {
                                console.error('Error attaching local video track:', error);
                            }
                        } else {
                            console.warn('Local video publication has no track or ref is null');
                        }
                    });
                    
                    if (videoTracks.length === 0) {
                        console.warn('No local video tracks found');
                    }
                };

                // Attach local video immediately
                attachLocalVideo();

                // Also listen for when local tracks are published (in case they're not ready yet)
                connectedRoom.localParticipant.on('trackPublished', publication => {
                    console.log('Local track published:', publication.trackName, publication.kind);
                    if (publication.kind === 'video' && publication.track) {
                        attachLocalVideo();
                    }
                });

                // Handle existing participants
                connectedRoom.participants.forEach(handleParticipant);
                setParticipantCount(connectedRoom.participants.size);

                // Listen for new participants
                connectedRoom.on('participantConnected', participant => {
                    console.log(`Participant connected: ${participant.identity}`);
                    handleParticipant(participant);
                    setParticipantCount(connectedRoom.participants.size);
                    toast.success(`${participant.identity} joined the call`);
                });

                connectedRoom.on('participantDisconnected', participant => {
                    console.log(`Participant disconnected: ${participant.identity}`);
                    // Clean up all tracks from disconnected participant
                    participant.tracks.forEach(publication => {
                        if (publication.track) {
                            detachTrack(publication.track);
                        }
                    });
                    // Remove participant from state
                    setRemoteParticipants(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(participant.sid);
                        return newMap;
                    });
                    // Clear remote video if no participants remain
                    if (connectedRoom.participants.size === 0 && remoteVideoRef.current) {
                        while (remoteVideoRef.current.firstChild) {
                            remoteVideoRef.current.removeChild(remoteVideoRef.current.firstChild);
                        }
                    }
                    setParticipantCount(connectedRoom.participants.size);
                    toast(`${participant.identity} left the call`, { icon: '👋' });
                });

                setIsConnecting(false);

            } catch (err) {
                console.error('Error initializing video call:', err);
                if (mounted) {
                    const message = err instanceof Error ? err.message : 'Failed to start video call';
                    setError(message);
                    setIsConnecting(false);
                    toast.error(message);
                }
            }
        };

        initializeCall();

        return () => {
            mounted = false;
            // Get room reference before disconnecting
            const currentRoom = roomRef.current;
            if (currentRoom) {
                // Detach all video tracks first
                try {
                    currentRoom.localParticipant.videoTracks.forEach((publication: any) => {
                        if (publication.track) {
                            try {
                                publication.track.detach();
                            } catch (e) {
                                console.warn('Error detaching track during cleanup:', e);
                            }
                        }
                    });
                } catch (e) {
                    console.warn('Error detaching tracks during cleanup:', e);
                }
                // Disconnect room
                currentRoom.disconnect();
                roomRef.current = null;
            }
            // Clean up local video safely
            const videoContainer = localVideoRef.current;
            if (videoContainer) {
                try {
                    // Clear container using innerHTML (safer than removeChild)
                    videoContainer.innerHTML = '';
                } catch (error) {
                    console.warn('Error cleaning up local video:', error);
                }
            }
        };
    }, [appointmentId, handleParticipant]);

    // Re-attach local video when room changes or video is toggled
    useEffect(() => {
        if (!room) return;

        // Use requestAnimationFrame to ensure this runs after React's DOM updates
        const frameId = requestAnimationFrame(() => {
            const videoContainer = localVideoRef.current;
            if (!videoContainer) return;

            if (isVideoEnabled) {
                // Check if video element already exists and is attached
                const existingVideos = videoContainer.querySelectorAll('video');
                let hasActiveVideo = false;
                
                existingVideos.forEach(video => {
                    const track = (video as any).srcObject?.getTracks?.()?.[0];
                    if (track && track.readyState === 'live') {
                        hasActiveVideo = true;
                    }
                });

                if (hasActiveVideo) {
                    // Video already attached and active
                    return;
                }

                // Clear any dead video elements first (safely)
                existingVideos.forEach(video => {
                    try {
                        const track = (video as any).srcObject?.getTracks?.()?.[0];
                        if (!track || track.readyState !== 'live') {
                            if (video.parentNode === videoContainer) {
                                videoContainer.removeChild(video);
                            }
                        }
                    } catch (e) {
                        // Ignore errors
                    }
                });

                // Attach video tracks
                const videoTracks = Array.from(room.localParticipant.videoTracks.values());
                videoTracks.forEach(publication => {
                    if (publication.track && localVideoRef.current) {
                        try {
                            const track = publication.track as LocalVideoTrack;
                            if (track.isEnabled) {
                                const element = track.attach();
                                element.className = 'w-full h-full object-cover rounded-lg mirror';
                                element.setAttribute('playsinline', 'true');
                                element.setAttribute('autoplay', 'true');
                                element.setAttribute('muted', 'true');
                                
                                if (localVideoRef.current) {
                                    localVideoRef.current.appendChild(element);
                                }
                            }
                        } catch (error) {
                            console.error('Error re-attaching local video track:', error);
                        }
                    }
                });
            } else {
                // Video disabled - detach tracks
                // First, find and remove video elements from the container
                const videoElements = Array.from(videoContainer.querySelectorAll('video'));
                videoElements.forEach(videoElement => {
                    try {
                        // Check if element is still in the container before removing
                        if (videoElement.parentNode === videoContainer) {
                            videoContainer.removeChild(videoElement);
                        }
                    } catch (e) {
                        // Element already removed, ignore
                    }
                });

                // Then detach the tracks (this is safe even if elements are already removed)
                const videoTracks = Array.from(room.localParticipant.videoTracks.values());
                videoTracks.forEach(publication => {
                    if (publication.track) {
                        try {
                            const track = publication.track as LocalVideoTrack;
                            // Detach the track (this handles cleanup of attached elements)
                            track.detach();
                        } catch (error) {
                            console.warn('Error detaching local video track:', error);
                        }
                    }
                });
            }
        });

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [room, isVideoEnabled]);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (room) {
            const videoTracks = Array.from(room.localParticipant.videoTracks.values());
            console.log(`Toggling video: ${videoTracks.length} track(s), currently ${isVideoEnabled ? 'enabled' : 'disabled'}`);
            videoTracks.forEach(publication => {
                if (publication.track) {
                    const track = publication.track as LocalVideoTrack;
                    if (isVideoEnabled) {
                        track.disable();
                        console.log('Local video disabled');
                    } else {
                        track.enable();
                        console.log('Local video enabled');
                    }
                }
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    }, [room, isVideoEnabled]);

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (room) {
            room.localParticipant.audioTracks.forEach(publication => {
                const track = publication.track as LocalAudioTrack;
                if (isAudioEnabled) {
                    track.disable();
                } else {
                    track.enable();
                }
            });
            setIsAudioEnabled(!isAudioEnabled);
        }
    }, [room, isAudioEnabled]);

    // Toggle speaker (mute remote audio)
    const toggleSpeaker = useCallback(() => {
        if (room) {
            room.participants.forEach(participant => {
                participant.audioTracks.forEach(publication => {
                    if (publication.track) {
                        const audioElement = publication.track.attach();
                        if (audioElement instanceof HTMLMediaElement) {
                            audioElement.muted = !isSpeakerEnabled;
                        }
                    }
                });
            });
            setIsSpeakerEnabled(!isSpeakerEnabled);
        }
    }, [room, isSpeakerEnabled]);

    // End call
    const handleEndCall = useCallback(async () => {
        try {
            if (room) {
                room.disconnect();
                setRoom(null);
            }
            
            // Notify backend
            await endVideoSession(appointmentId);
            toast.success('Call ended successfully');
            onCallEnd();
        } catch (err) {
            console.error('Error ending call:', err);
            toast.error('Failed to end call properly');
            onCallEnd();
        }
    }, [room, appointmentId, onCallEnd]);

    if (isConnecting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                <p className="text-lg">Connecting to video call...</p>
                <p className="text-sm text-gray-400 mt-2">Please allow camera and microphone access</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md">
                    <h2 className="text-xl font-bold mb-2">Connection Error</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={onCallEnd}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Exit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Video Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {/* Remote Video (Larger) */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                    <div ref={remoteVideoRef} className="w-full h-full">
                        {participantCount === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                <div className="text-center">
                                    <VideoCameraSlashIcon className="h-16 w-16 mx-auto mb-2 text-gray-600" />
                                    <p className="text-lg">Waiting for other participant...</p>
                                </div>
                            </div>
                        ) : (() => {
                            // Check if any remote participant has video enabled
                            const participantsArray = Array.from(remoteParticipants.values());
                            const hasAnyVideo = participantsArray.some(p => p.hasVideo);
                            const remoteVideoElement = remoteVideoRef.current?.querySelector('video');
                            
                            // Show "Camera Off" if no video is available or video element doesn't exist
                            if (participantsArray.length > 0 && (!hasAnyVideo || !remoteVideoElement)) {
                                const firstParticipant = participantsArray[0];
                                if (firstParticipant) {
                                    const participantName = firstParticipant.name;
                                    const initials = getParticipantInitials(participantName);
                                    return (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 z-10">
                                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center border-4 border-gray-600 mb-4 shadow-lg">
                                                <span className="text-4xl font-bold text-white">{initials}</span>
                                            </div>
                                            <div className="text-center">
                                                <VideoCameraSlashIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-300 text-sm font-medium">Camera Off</p>
                                                <p className="text-gray-400 text-xs mt-1">{participantName}</p>
                                            </div>
                                        </div>
                                    );
                                }
                            }
                            return null;
                        })()}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
                    </div>
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-mono">
                        {formatDuration(callDuration)}
                    </div>
                </div>

                {/* Local Video (Picture-in-Picture) */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden lg:row-span-1">
                    <div ref={localVideoRef} className="w-full h-full">
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                {user?.profile_picture ? (
                                    <div className="relative">
                                        <img 
                                            src={user.profile_picture} 
                                            alt="Profile" 
                                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-600 opacity-50"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <VideoCameraSlashIcon className="h-12 w-12 text-gray-400" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center border-4 border-gray-600 mb-4">
                                        <span className="text-4xl font-bold text-white">{getUserInitials()}</span>
                                    </div>
                                )}
                                <div className="mt-4 text-center">
                                    <VideoCameraSlashIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-300 text-sm font-medium">Camera Off</p>
                                    {user?.first_name && (
                                        <p className="text-gray-400 text-xs mt-1">{user.first_name} {user.last_name || ''}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        You
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 border-t border-gray-700 p-6">
                <div className="flex justify-center items-center space-x-4">
                    {/* Toggle Video */}
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-colors ${
                            isVideoEnabled
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {isVideoEnabled ? (
                            <VideoCameraIcon className="h-6 w-6" />
                        ) : (
                            <VideoCameraSlashIcon className="h-6 w-6" />
                        )}
                    </button>

                    {/* Toggle Audio */}
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-full transition-colors ${
                            isAudioEnabled
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    >
                        <MicrophoneIcon className="h-6 w-6" />
                    </button>

                    {/* Toggle Speaker */}
                    <button
                        onClick={toggleSpeaker}
                        className={`p-4 rounded-full transition-colors ${
                            isSpeakerEnabled
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                        title={isSpeakerEnabled ? 'Mute speaker' : 'Unmute speaker'}
                    >
                        {isSpeakerEnabled ? (
                            <SpeakerWaveIcon className="h-6 w-6" />
                        ) : (
                            <SpeakerXMarkIcon className="h-6 w-6" />
                        )}
                    </button>

                    {/* End Call */}
                    <button
                        onClick={handleEndCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                        title="End call"
                    >
                        <PhoneXMarkIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Add CSS for mirror effect */}
            <style>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
};

export default VideoCallRoom;
