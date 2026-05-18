import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Phone, PhoneMissed, PhoneOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCallContext } from '../../context/CallContext';
import { api } from '../../api';

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
};

function CallMessage({ msg, isMe }: { msg: any; isMe: boolean }) {
  const { callStatus, callDuration, senderName, timestamp } = msg;
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let icon = <Phone className="w-3.5 h-3.5" />;
  let label = '';
  let colorClass = '';

  if (callStatus === 'answered') {
    icon = <Phone className="w-3.5 h-3.5" />;
    label = `Voice call · ${formatDuration(callDuration)}`;
    colorClass = 'text-green-700 bg-green-50 border-green-200';
  } else if (callStatus === 'no_answer') {
    icon = <PhoneMissed className="w-3.5 h-3.5" />;
    label = isMe ? 'No answer' : 'Missed call';
    colorClass = isMe ? 'text-gray-500 bg-gray-50 border-gray-200' : 'text-red-600 bg-red-50 border-red-200';
  } else if (callStatus === 'declined') {
    icon = <PhoneOff className="w-3.5 h-3.5" />;
    label = isMe ? 'Call declined' : 'You declined';
    colorClass = 'text-gray-500 bg-gray-50 border-gray-200';
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-0.5">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium ${colorClass}`}>
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-[10px] text-gray-400">
          {isMe ? 'You' : senderName} · {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}

export default function StudentChat() {
  const { user } = useAuth();
  const { callState, startCall, lastMessageTime } = useCallContext();
  const [room, setRoom] = useState<any>(null);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchRoom = (rooms: any[]) => {
    if (rooms.length > 0) setRoom(rooms[0]);
  };

  useEffect(() => {
    if (!user) return;
    api.chat.rooms().then(fetchRoom).catch(() => {});
  }, [user]);

  // Re-fetch when any message arrives (call log or text from other user)
  useEffect(() => {
    if (!lastMessageTime || !room) return;
    api.chat.room(room.id).then(setRoom).catch(() => {});
  }, [lastMessageTime]);

  // Polling fallback — keeps messages (including call logs) up to date
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      api.chat.rooms().then(rooms => {
        if (rooms.length > 0) setRoom(rooms[0]);
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages]);

  const send = async () => {
    if (!input.trim() || !user || !room) return;
    const content = input.trim();
    setInput('');
    try {
      const msg = await api.chat.send(room.id, content, user.name);
      setRoom((prev: any) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
    } catch {}
  };

  const counselorName = room?.participantNames?.find((n: string) => n !== user?.name) || 'Counselor';
  const remoteId = room?.participants?.find((id: string) => id !== user?.id) ?? '';
  const messages = room?.messages || [];
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chat with Counselor</h1>
        <p className="text-gray-500 mt-1">Direct communication with your assigned counselor</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col chat-window">
        <div className="p-4 border-b border-gray-100 bg-blue-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {counselorName.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{counselorName}</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>
          {room && (
            <button type="button" title="Voice call" aria-label="Voice call"
              onClick={() => startCall(remoteId, counselorName)}
              disabled={callState !== 'idle' || !remoteId}
              className="w-9 h-9 bg-blue-100 hover:bg-blue-200 disabled:opacity-40 text-blue-700 rounded-full flex items-center justify-center transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No messages yet. Say hello to your counselor!</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              if (msg.type === 'call') {
                return (
                  <CallMessage
                    key={msg._id || msg.id}
                    msg={msg}
                    isMe={msg.senderId === user?.id}
                  />
                );
              }
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg._id || msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{msg.senderName.charAt(0)}</div>
                        <span className="text-xs text-gray-500">{msg.senderName}</span>
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : ''}`}>{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message…"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" aria-label="Send message" onClick={send} disabled={!input.trim()}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
