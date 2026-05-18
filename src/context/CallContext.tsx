import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Phone, PhoneOff, PhoneMissed, Mic, MicOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import { api } from '../api';

export type CallState = 'idle' | 'calling' | 'incoming' | 'active';

interface CallContextType {
  callState: CallState;
  remoteName: string;
  muted: boolean;
  timer: string;
  lastMessageTime: number;
  startCall: (targetId: string, targetName: string) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const ICE_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export function CallProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [callState, setCallState] = useState<CallState>('idle');
  const callStateRef = useRef<CallState>('idle');

  const setCS = (s: CallState) => {
    callStateRef.current = s;
    setCallState(s);
  };

  const [remoteName, setRemoteName] = useState('');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteIdRef = useRef('');
  const isCallerRef = useRef(false);
  const callStartedAtRef = useRef(0);
  const stopRef = useRef<() => void>(() => {});

  // Kept as a ref so socket handlers always call the latest version (captures current user)
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

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      (audioRef.current as any).srcObject = remoteStream;
    }
  }, [remoteStream]);

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
    setMuted(false);
    callStateRef.current = 'idle';
    setCallState('idle');
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

    socket.on('call:incoming', ({ from, fromName }: { from: string; fromName: string }) => {
      remoteIdRef.current = from;
      setRemoteName(fromName);
      setCS('incoming');
    });

    socket.on('call:accepted', async ({ from }: { from: string }) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
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

    socket.on('chat:call-logged', () => {
      setLastMessageTime(Date.now());
    });

    socket.on('chat:new-message', () => {
      setLastMessageTime(Date.now());
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user?.id]);

  const startCall = useCallback((targetId: string, targetName: string) => {
    isCallerRef.current = true;
    remoteIdRef.current = targetId;
    setRemoteName(targetName);
    setCS('calling');
    socketRef.current?.emit('call:invite', { to: targetId, from: user?.id, fromName: user?.name });
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

    // Caller always logs; callee logging 'answered' case is handled on caller side via call:ended
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

  const timer = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  return (
    <CallContext.Provider value={{ callState, remoteName, muted, timer, lastMessageTime, startCall, acceptCall, rejectCall, endCall, toggleMute }}>
      {children}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl z-[60]">
          {toast}
        </div>
      )}

      {/* Incoming call */}
      {callState === 'incoming' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl w-72">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-blue-700 animate-pulse">
              {remoteName.charAt(0)}
            </div>
            <p className="text-gray-400 text-sm mb-1">Incoming call</p>
            <h3 className="text-xl font-bold text-gray-900 mb-6">{remoteName}</h3>
            <div className="flex gap-6 justify-center">
              <button type="button" aria-label="Decline call" onClick={rejectCall}
                className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors">
                <PhoneOff className="w-6 h-6" />
              </button>
              <button type="button" aria-label="Accept call" onClick={acceptCall}
                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors">
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calling */}
      {callState === 'calling' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl w-72">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-blue-700">
              {remoteName.charAt(0)}
            </div>
            <p className="text-gray-400 text-sm mb-1">Calling…</p>
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

      {/* Active call */}
      {callState === 'active' && (
        <div className="fixed inset-0 bg-gray-900/95 z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl w-72">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-blue-700">
              {remoteName.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{remoteName}</h3>
            <p className="text-green-600 text-sm font-mono mt-1 mb-6">{timer}</p>
            <div className="flex gap-6 justify-center">
              <button type="button" aria-label={muted ? 'Unmute' : 'Mute'} onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${muted ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
    </CallContext.Provider>
  );
}

export function useCallContext() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCallContext must be used within CallProvider');
  return ctx;
}
