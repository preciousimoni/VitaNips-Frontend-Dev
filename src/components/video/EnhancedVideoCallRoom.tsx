import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Video, {
  Room,
  LocalParticipant,
  RemoteParticipant,
  LocalVideoTrack,
  LocalAudioTrack,
  RemoteVideoTrack,
  RemoteAudioTrack,
} from 'twilio-video';
import {
  MicrophoneIcon,
  VideoCameraIcon,
  PhoneXMarkIcon,
  ComputerDesktopIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid';
import {
  MicrophoneIcon as MicOffIcon,
  VideoCameraIcon as VideoOffIcon,
} from '@heroicons/react/24/outline';
import { startVirtualSession, endVideoSession } from '@api/video';

interface EnhancedVideoCallRoomProps {
  appointmentId: number;
  onCallEnd?: () => void;
}

const EnhancedVideoCallRoom: React.FC<EnhancedVideoCallRoomProps> = ({
  appointmentId,
  onCallEnd,
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Media states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  // Participants
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<Map<string, RemoteParticipant>>(
    new Map()
  );

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<Date>(new Date());

  const navigate = useNavigate();

  // Initialize video session
  useEffect(() => {
    initializeSession();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [appointmentId]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start virtual session and get token
      const response = await startVirtualSession(appointmentId);
      setSessionData(response);

      // Connect to Twilio Room
      const connectedRoom = await Video.connect(response.token, {
        name: response.room_name,
        audio: true,
        video: { width: 640, height: 480 },
        networkQuality: { local: 1, remote: 1 },
      });

      setRoom(connectedRoom);
      setLocalParticipant(connectedRoom.localParticipant);

      // Attach local participant tracks
      connectedRoom.localParticipant.tracks.forEach((publication) => {
        if (publication.track && localVideoRef.current) {
          const track = publication.track as LocalVideoTrack | LocalAudioTrack;
          if (track.kind === 'video') {
            localVideoRef.current.appendChild(track.attach());
          }
        }
      });

      // Handle remote participants
      connectedRoom.participants.forEach(addParticipant);
      connectedRoom.on('participantConnected', addParticipant);
      connectedRoom.on('participantDisconnected', removeParticipant);
      connectedRoom.on('disconnected', handleDisconnect);

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to initialize session:', err);
      setError(err.message || 'Failed to start video call');
      setLoading(false);
    }
  };

  const addParticipant = useCallback((participant: RemoteParticipant) => {
    setRemoteParticipants((prev) => new Map(prev).set(participant.sid, participant));

    participant.tracks.forEach((publication) => {
      if (publication.isSubscribed && publication.track) {
        const track = publication.track;
        if (track.kind === 'video' || track.kind === 'audio') {
          attachTrack(track as RemoteVideoTrack | RemoteAudioTrack);
        }
      }
    });

    participant.on('trackSubscribed', (track: RemoteVideoTrack | RemoteAudioTrack) => {
      attachTrack(track);
    });
    participant.on('trackUnsubscribed', detachTrack);
  }, []);

  const removeParticipant = useCallback((participant: RemoteParticipant) => {
    setRemoteParticipants((prev) => {
      const newMap = new Map(prev);
      newMap.delete(participant.sid);
      return newMap;
    });
  }, []);

  const attachTrack = (track: RemoteVideoTrack | RemoteAudioTrack) => {
    if (track.kind === 'video' && remoteVideoRef.current) {
      const videoElement = track.attach();
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      remoteVideoRef.current.appendChild(videoElement);
    } else if (track.kind === 'audio') {
      track.attach();
    }
  };

  const detachTrack = (track: RemoteVideoTrack | RemoteAudioTrack) => {
    track.detach().forEach((element) => element.remove());
  };

  const handleDisconnect = () => {
    setRoom(null);
    setLocalParticipant(null);
    setRemoteParticipants(new Map());
  };

  // Media controls
  const toggleMute = () => {
    if (!localParticipant) return;

    localParticipant.audioTracks.forEach((publication) => {
      if (publication.track) {
        if (isMuted) {
          publication.track.enable();
        } else {
          publication.track.disable();
        }
      }
    });

    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (!localParticipant) return;

    localParticipant.videoTracks.forEach((publication) => {
      if (publication.track) {
        if (isVideoOff) {
          publication.track.enable();
        } else {
          publication.track.disable();
        }
      }
    });

    setIsVideoOff(!isVideoOff);
  };

  const toggleScreenShare = async () => {
    if (!room) return;

    if (isSharingScreen && screenShareRef.current) {
      // Stop screen sharing
      screenShareRef.current.getTracks().forEach((track) => track.stop());
      screenShareRef.current = null;
      setIsSharingScreen(false);
    } else {
      try {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        screenShareRef.current = stream;

        const screenTrack = new Video.LocalVideoTrack(stream.getVideoTracks()[0]);
        await room.localParticipant.publishTrack(screenTrack);

        setIsSharingScreen(true);

        // Auto-stop when user stops sharing
        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      } catch (err) {
        console.error('Failed to share screen:', err);
      }
    }
  };

  const handleEndCall = async () => {
    try {
      if (room) {
        room.disconnect();
      }

      // Calculate duration
      // const duration = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 60000);

      await endVideoSession(appointmentId);

      if (onCallEnd) {
        onCallEnd();
      } else {
        navigate('/appointments');
      }
    } catch (err) {
      console.error('Failed to end call:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/appointments')}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <h2 className="text-white font-semibold">
              {sessionData?.participant_role === 'doctor' ? 'Patient Consultation' : 'Doctor Consultation'}
            </h2>
            <p className="text-gray-400 text-sm">Appointment #{appointmentId}</p>
          </div>
        </div>
        <div className="text-gray-400 text-sm">
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex items-center justify-center p-4 space-x-4">
        {/* Remote Video (Main) */}
        <div className="relative flex-1 h-full max-w-4xl bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-full h-full object-cover"
          />
          {remoteParticipants.size === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">👤</div>
                <p>Waiting for other participant...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="relative w-64 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs">
            You {sessionData?.participant_role && `(${sessionData.participant_role})`}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-6 flex items-center justify-center space-x-4">
        {/* Mute Toggle */}
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <MicOffIcon className="h-6 w-6 text-white" />
          ) : (
            <MicrophoneIcon className="h-6 w-6 text-white" />
          )}
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isVideoOff ? 'Turn on video' : 'Turn off video'}
        >
          {isVideoOff ? (
            <VideoOffIcon className="h-6 w-6 text-white" />
          ) : (
            <VideoCameraIcon className="h-6 w-6 text-white" />
          )}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-full transition-colors ${
            isSharingScreen ? 'bg-primary hover:bg-primary-dark' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isSharingScreen ? 'Stop sharing' : 'Share screen'}
        >
          <ComputerDesktopIcon className="h-6 w-6 text-white" />
        </button>

        {/* End Call */}
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          title="End call"
        >
          <PhoneXMarkIcon className="h-6 w-6 text-white" />
        </button>

        {/* Settings */}
        <button
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Settings"
        >
          <Cog6ToothIcon className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default EnhancedVideoCallRoom;
