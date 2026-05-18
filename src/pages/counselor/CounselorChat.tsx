import { useState, useRef, useEffect } from 'react';
import { Send, Search, MessageSquare, Phone, PhoneMissed, PhoneOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCallContext } from '../../context/CallContext';
import { api } from '../../api';
import { Counselor } from '../../types';

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

export default function CounselorChat() {
  const { user } = useAuth();
  const counselor = user as Counselor;
  const { callState, startCall, lastMessageTime } = useCallContext();
  const [rooms, setRooms] = useState<any[]>([]);
  const [myStudents, setMyStudents] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.chat.rooms(), api.students.list()])
      .then(([roomList, studentList]) => {
        setRooms(roomList);
        const mine = studentList.filter((s: any) => counselor.assignedStudents?.includes(s._id || s.id));
        setMyStudents(mine);
        if (roomList.length > 0) setSelectedRoom(roomList[0]);
      }).catch(() => {});
  }, []);

  // Re-fetch when any message arrives (call log or text from other user)
  useEffect(() => {
    if (!lastMessageTime || !selectedRoom) return;
    api.chat.room(selectedRoom.id).then(updated => {
      setSelectedRoom(updated);
      setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
    }).catch(() => {});
  }, [lastMessageTime]);

  // Polling fallback — keeps messages (including call logs) up to date
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      Promise.all([api.chat.rooms(), api.students.list()])
        .then(([roomList, studentList]) => {
          setRooms(roomList);
          const mine = studentList.filter((s: any) => counselor.assignedStudents?.includes(s._id || s.id));
          setMyStudents(mine);
          if (selectedRoom) {
            const updated = roomList.find((r: any) => r.id === selectedRoom.id);
            if (updated) setSelectedRoom(updated);
          }
        }).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [user, selectedRoom?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedRoom?.messages]);

  const send = async () => {
    if (!input.trim() || !user || !selectedRoom) return;
    const content = input.trim();
    setInput('');
    try {
      const msg = await api.chat.send(selectedRoom.id, content, user.name);
      const updated = { ...selectedRoom, messages: [...selectedRoom.messages, msg] };
      setSelectedRoom(updated);
      setRooms(prev => prev.map(r => r.id === selectedRoom.id ? updated : r));
    } catch {}
  };

  const getStudentName = (room: any) => room.participantNames?.find((n: string) => n !== user?.name) || 'Student';
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const studentsWithNoChat = myStudents.filter((s: any) => {
    const sid = s._id || s.id;
    return !rooms.some((r: any) => r.participants?.includes(sid));
  });
  const remoteId = selectedRoom?.participants?.find((id: string) => id !== user?.id) ?? '';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
        <p className="text-gray-500 mt-1">Communicate with students</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex chat-window-wide">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search conversations…"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 && studentsWithNoChat.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No conversations</p>
              </div>
            ) : (
              <>
                {rooms.map((room: any) => {
                  const studentName = getStudentName(room);
                  const unread = room.messages?.filter((m: any) => !m.read && m.senderId !== user?.id).length || 0;
                  const lastMsg = room.messages?.[room.messages.length - 1];
                  const lastMsgPreview = lastMsg?.type === 'call'
                    ? `📞 ${lastMsg.callStatus === 'answered' ? 'Voice call' : lastMsg.callStatus === 'no_answer' ? 'Missed call' : 'Call declined'}`
                    : lastMsg?.content;
                  return (
                    <button type="button" key={room.id} onClick={() => setSelectedRoom(room)}
                      className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${selectedRoom?.id === room.id ? 'bg-green-50' : ''}`}>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 flex-shrink-0">{studentName.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-semibold ${selectedRoom?.id === room.id ? 'text-green-700' : 'text-gray-900'}`}>{studentName}</span>
                          {unread > 0 && <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unread}</span>}
                        </div>
                        {lastMsgPreview && <p className="text-xs text-gray-400 truncate mt-0.5">{lastMsgPreview}</p>}
                      </div>
                    </button>
                  );
                })}
                {studentsWithNoChat.map((s: any) => (
                  <div key={s._id || s.id} className="flex items-start gap-3 p-4 border-b border-gray-50 opacity-60">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 flex-shrink-0">{s.name.charAt(0)}</div>
                    <div><p className="text-sm font-medium text-gray-700">{s.name}</p><p className="text-xs text-gray-400">No messages yet</p></div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Chat area */}
        {selectedRoom ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-4 border-b border-gray-100 bg-green-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {getStudentName(selectedRoom).charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{getStudentName(selectedRoom)}</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-gray-500">Student</span>
                </div>
              </div>
              <button type="button" title="Voice call" aria-label="Voice call"
                onClick={() => startCall(remoteId, getStudentName(selectedRoom))}
                disabled={callState !== 'idle' || !remoteId}
                className="w-9 h-9 bg-green-100 hover:bg-green-200 disabled:opacity-40 text-green-700 rounded-full flex items-center justify-center transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {(selectedRoom.messages || []).map((msg: any) => {
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
                    <div className="max-w-[70%]">
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{msg.senderName.charAt(0)}</div>
                          <span className="text-xs text-gray-500">{msg.senderName}</span>
                        </div>
                      )}
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        {msg.content}
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : ''}`}>{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-3">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message…"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="button" aria-label="Send message" onClick={send} disabled={!input.trim()}
                  className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Select a conversation</p>
              <p className="text-gray-400 text-sm">Choose a student from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
