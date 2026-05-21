import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import { api } from '../api';

export type CallState = 'idle' | 'calling' | 'incoming' | 'active';
export type CallType = 'audio' | 'video';

interface CallContextType {
  callState: CallState;
  callType: CallType;
  remoteName: string;
  muted: boolean;
  cameraOff: boolean;
  timer: string;
  lastMessageTime: number;
  startCall: (targetId: string, targetName: string) => void;
  startVideoCall: (targetId: string, targetName: string) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const ICE_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export function CallProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [callState, setCallState] = useState<CallState>('idle');
  const callStateRef = useRef<CallState>('idle');
  const [callType, setCallType] = useState<CallType>('audio');
  const callTypeRef = useRef<CallType>('audio');

  const setCS = (s: CallState) => { callStateRef.current = s; setCallState(s); };
  const setCT = (t: CallType) => { callTypeRef.current = t; setCallType(t); };

  const [remoteName, setRemoteName] = useState('');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteIdRef = useRef('');
  const isCallerRef = useRef(false);
  const callStartedAtRef = useRef(0);
  const stopRef = useRef<() => void>(() => {});
  const logCallRef = useRef<(status: string, duration: number, remoteId: string) => void>(() => {});

  const logCall = async (status: string, duration: number, remoteId: string) => {
    if (!user?.id || !remoteId) return;
    try {
      await api.chat.logCall([user.id, remoteId], status, duration, user.name || '');
      setLastMessageTime(Date.now());
      socketRef.current?.emit('chat:call-logged', { to: remoteId });
    } catch (e) {
      console.error('[CallContext] logCall failed:', e);
    }
  };
  logCallRef.current = logCall;

  // Attach remote stream to the right output element
  useEffect(() => {
    if (!remoteStream) return;
    if (callType === 'video' && remoteVideoRef.current) {
      (remoteVideoRef.current as any).srcObject = remoteStream;
    } else if (callType === 'audio' && audioRef.current) {
      (audioRef.current as any).srcObject = remoteStream;
    }
  }, [remoteStream, callState, callType]);

  // Attach local video stream once the video overlay is mounted
  useEffect(() => {
    if (localStream && callType === 'video' && callState === 'active' && localVideoRef.current) {
      (localVideoRef.current as any).srcObject = localStream;
    }
  }, [localStream, callState, callType]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const stop = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    setRemoteStream(null);
    setLocalStream(null);
    setMuted(false);
    setCameraOff(false);
    callStateRef.current = 'idle';
    setCallState('idle');
    callTypeRef.current = 'audio';
    setCallType('audio');
    setRemoteName('');
    setElapsed(0);
    remoteIdRef.current = '';
    isCallerRef.current = false;
    callStartedAtRef.current = 0;
  }, []);

  stopRef.current = stop;

  useEffect(() => {
    if (callState !== 'active') { setElapsed(0); return; }
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [callState]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = io('http://localhost:5000');
    socketRef.current = socket;
    socket.emit('register', user.id);

    const buildPC = (targetId: string) => {
      const pc = new RTCPeerConnection(ICE_CONFIG);
      pcRef.current = pc;
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit('call:ice', { to: targetId, candidate });
      };
      pc.ontrack = e => setRemoteStream(e.streams[0]);
      return pc;
    };

    socket.on('call:incoming', ({ from, fromName, callType: ct }: { from: string; fromName: string; callType?: string }) => {
      remoteIdRef.current = from;
      setRemoteName(fromName);
      const t: CallType = ct === 'video' ? 'video' : 'audio';
      callTypeRef.current = t;
      setCallType(t);
      setCS('incoming');
    });

    socket.on('call:accepted', async ({ from }: { from: string }) => {
      try {
        const isVideo = callTypeRef.current === 'video';
        const stream = await navigator.mediaDevices.getUserMedia(
          isVideo ? { audio: true, video: true } : { audio: true }
        );
        localStreamRef.current = stream;
        if (isVideo) setLocalStream(stream);
        const pc = buildPC(from);
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('call:offer', { to: from, offer });
        callStartedAtRef.current = Date.now();
        setCS('active');
      } catch { stopRef.current(); }
    });

    socket.on('call:rejected', () => {
      const remoteId = remoteIdRef.current;
      if (isCallerRef.current) logCallRef.current('declined', 0, remoteId);
      showToast('Call declined');
      stopRef.current();
    });

    socket.on('call:ended', () => {
      const state = callStateRef.current;
      const remoteId = remoteIdRef.current;
      if (isCallerRef.current && state === 'active') {
        const duration = Math.floor((Date.now() - callStartedAtRef.current) / 1000);
        logCallRef.current('answered', duration, remoteId);
      }
      showToast(state === 'incoming' ? 'Missed call' : 'Call ended');
      stopRef.current();
    });

    socket.on('call:offer', async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      try {
        const isVideo = callTypeRef.current === 'video';
        const stream = await navigator.mediaDevices.getUserMedia(
          isVideo ? { audio: true, video: true } : { audio: true }
        );
        localStreamRef.current = stream;
        if (isVideo) setLocalStream(stream);
        const pc = buildPC(from);
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('call:answer', { to: from, answer });
        callStartedAtRef.current = Date.now();
      } catch { stopRef.current(); }
    });

    socket.on('call:answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      try { await pcRef.current?.setRemoteDescription(answer); } catch {}
    });

    socket.on('call:ice', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      try { await pcRef.current?.addIceCandidate(candidate); } catch {}
    });

    socket.on('chat:call-logged', () => { setLastMessageTime(Date.now()); });
    socket.on('chat:new-message', () => { setLastMessageTime(Date.now()); });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user?.id]);

  const startCall = useCallback((targetId: string, targetName: string) => {
    setCT('audio');
    isCallerRef.current = true;
    remoteIdRef.current = targetId;
    setRemoteName(targetName);
    setCS('calling');
    socketRef.current?.emit('call:invite', { to: targetId, from: user?.id, fromName: user?.name, callType: 'audio' });
  }, [user?.id, user?.name]);

  const startVideoCall = useCallback((targetId: string, targetName: string) => {
    setCT('video');
    isCallerRef.current = true;
    remoteIdRef.current = targetId;
    setRemoteName(targetName);
    setCS('calling');
    socketRef.current?.emit('call:invite', { to: targetId, from: user?.id, fromName: user?.name, callType: 'video' });
  }, [user?.id, user?.name]);

  const acceptCall = useCallback(() => {
    setCS('active');
    callStartedAtRef.current = Date.now();
    socketRef.current?.emit('call:accept', { to: remoteIdRef.current, from: user?.id });
  }, [user?.id]);

  const rejectCall = useCallback(() => {
    socketRef.current?.emit('call:reject', { to: remoteIdRef.current });
    stopRef.current();
  }, []);

  const endCall = useCallback(() => {
    const state = callStateRef.current;
    const remoteId = remoteIdRef.current;
    const duration = state === 'active' ? Math.floor((Date.now() - callStartedAtRef.current) / 1000) : 0;
    socketRef.current?.emit('call:end', { to: remoteId });
    if (isCallerRef.current) {
      if (state === 'calling') logCallRef.current('no_answer', 0, remoteId);
      else if (state === 'active') logCallRef.current('answered', duration, remoteId);
    }
    stopRef.current();
  }, []);

  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMuted(m => !m);
  }, []);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCameraOff(c => !c);
  }, []);

  const timer = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  return (
    <CallContext.Provider value={{
      callState, callType, remoteName, muted, cameraOff, timer, lastMessageTime,
      startCall, startVideoCall, acceptCall, rejectCall, endCall, toggleMute, toggleCamera,
    }}>
      {children}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl z-[60]">
          {toast}
        </div>
      )}

      {/* Incoming call */}
      {callState === 'incoming' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl w-72">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold animate-pulse ${
              callType === 'video' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {callType === 'video' ? <Video className="w-9 h-9" /> : remoteName.charAt(0)}
            </div>
            <p className="text-gray-400 text-sm mb-1">Incoming {callType === 'video' ? 'video call' : 'call'}</p>
            <h3 className="text-xl font-bold text-gray-900 mb-6">{remoteName}</h3>
            <div className="flex gap-6 justify-center">
              <button type="button" aria-label="Decline call" onClick={rejectCall}
                className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors">
                <PhoneOff className="w-6 h-6" />
              </button>
              <button type="button" aria-label="Accept call" onClick={acceptCall}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
                  callType === 'video' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-500 hover:bg-green-600'
                }`}>
                {callType === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calling */}
      {callState === 'calling' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl w-72">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold ${
              callType === 'video' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {remoteName.charAt(0)}
            </div>
            <p className="text-gray-400 text-sm mb-1">{callType === 'video' ? 'Starting video call…' : 'Calling…'}</p>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{remoteName}</h3>
            <div className="flex gap-1.5 justify-center mb-6">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <button type="button" aria-label="Cancel call" onClick={endCall}
              className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors mx-auto">
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Active AUDIO call */}
      {callState === 'active' && callType === 'audio' && (
        <div className="fixed inset-0 bg-gray-900/95 z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl w-72">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-blue-700">
              {remoteName.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{remoteName}</h3>
            <p className="text-green-600 text-sm font-mono mt-1 mb-6">{timer}</p>
            <div className="flex gap-6 justify-center">
              <button type="button" aria-label={muted ? 'Unmute' : 'Mute'} onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  muted ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button type="button" aria-label="End call" onClick={endCall}
                className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors">
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active VIDEO call — full-screen meeting room */}
      {callState === 'active' && callType === 'video' && (
        <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
          {/* Remote video area */}
          <div className="relative flex-1 bg-gray-900 overflow-hidden">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {/* Fallback avatar shown behind video */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-28 h-28 bg-gray-700/60 rounded-full flex items-center justify-center text-white text-5xl font-bold select-none">
                {remoteName.charAt(0)}
              </div>
            </div>
            {/* Name + timer badge */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 backdrop-blur-sm px-5 py-2.5 rounded-full">
              <span className="text-white font-semibold text-sm">{remoteName}</span>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-green-400 font-mono text-sm">{timer}</span>
            </div>
            {/* Local video PIP */}
            <div className="absolute bottom-5 right-5 w-36 h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-800">
              {cameraOff ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <VideoOff className="w-7 h-7 text-gray-400" />
                </div>
              ) : (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}
              <div className="absolute bottom-1.5 left-0 right-0 text-center pointer-events-none">
                <span className="text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded-full">You</span>
              </div>
            </div>
          </div>

          {/* Controls bar */}
          <div className="flex items-center justify-center gap-6 py-6 bg-gray-950">
            <div className="flex flex-col items-center gap-1.5">
              <button type="button" aria-label={muted ? 'Unmute' : 'Mute'} onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  muted ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}>
                {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <span className="text-gray-400 text-[11px]">{muted ? 'Unmute' : 'Mute'}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button type="button" aria-label={cameraOff ? 'Turn camera on' : 'Turn camera off'} onClick={toggleCamera}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  cameraOff ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}>
                {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <span className="text-gray-400 text-[11px]">{cameraOff ? 'Start Video' : 'Stop Video'}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button type="button" aria-label="End call" onClick={endCall}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg">
                <PhoneOff className="w-6 h-6" />
              </button>
              <span className="text-gray-400 text-[11px]">End</span>
            </div>
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
}

export function useCallContext() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCallContext must be used within CallProvider');
  return ctx;
}
