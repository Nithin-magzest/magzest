import { useState, useRef, useEffect } from 'react';
import {
  Send, Search, MessageSquare, Phone, PhoneMissed, PhoneOff,
  Paperclip, Camera, CalendarDays, X, FileText, Download,
  Calendar, Clock, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCallContext } from '../../context/CallContext';
import { api } from '../../api';
import { Counselor } from '../../types';

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
};
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function CallMessage({ msg, isMe }: { msg: any; isMe: boolean }) {
  const { callStatus, callDuration, senderName, timestamp } = msg;
  let icon = <Phone className="w-3.5 h-3.5" />;
  let label = '';
  let colorClass = '';
  if (callStatus === 'answered') {
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
          {icon}<span>{label}</span>
        </div>
        <span className="text-[10px] text-gray-400">{isMe ? 'You' : senderName} · {formatTime(timestamp)}</span>
      </div>
    </div>
  );
}

function FileMessage({ msg, isMe }: { msg: any; isMe: boolean }) {
  const isOffer = msg.isOfferLetter;
  const sizeKb = msg.fileSize ? (msg.fileSize / 1024).toFixed(0) : null;
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[75%]">
        {!isMe && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{msg.senderName.charAt(0)}</div>
            <span className="text-xs text-gray-500">{msg.senderName}</span>
          </div>
        )}
        <div className={`rounded-2xl overflow-hidden border shadow-sm ${isMe ? 'border-green-400' : isOffer ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-gray-200'}`}>
          {isOffer && isMe && (
            <div className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Offer Letter — Saved to student's Applications
            </div>
          )}
          <div className={`px-4 py-3 ${isMe ? 'bg-green-600' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-green-500' : isOffer ? 'bg-emerald-100' : 'bg-sky-50'}`}>
                <FileText className={`w-5 h-5 ${isMe ? 'text-white' : isOffer ? 'text-emerald-600' : 'text-blue-500'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold truncate ${isMe ? 'text-white' : 'text-gray-800'}`}>{msg.fileName || 'Document'}</p>
                {sizeKb && <p className={`text-xs mt-0.5 ${isMe ? 'text-green-200' : 'text-gray-400'}`}>{sizeKb} KB</p>}
              </div>
            </div>
            {msg.fileUrl && (
              <div className="mt-2.5">
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isMe ? 'bg-green-500 hover:bg-green-400 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            )}
          </div>
        </div>
        <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : ''}`}>{formatTime(msg.timestamp)}</p>
      </div>
    </div>
  );
}

function MeetingMessage({ msg, isMe }: { msg: any; isMe: boolean }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[75%]">
        {!isMe && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{msg.senderName.charAt(0)}</div>
            <span className="text-xs text-gray-500">{msg.senderName}</span>
          </div>
        )}
        <div className={`rounded-2xl overflow-hidden border shadow-sm ${isMe ? 'bg-green-600 border-green-400' : 'bg-white border-blue-200'}`}>
          <div className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold ${isMe ? 'bg-green-700 text-green-100' : 'bg-sky-50 text-blue-700'}`}>
            <Calendar className="w-3.5 h-3.5" /> Meeting Scheduled
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className={`flex items-center gap-2 text-sm font-semibold ${isMe ? 'text-white' : 'text-gray-800'}`}>
              <Calendar className="w-4 h-4 flex-shrink-0 opacity-60" /> {msg.meetingDate}
            </div>
            <div className={`flex items-center gap-2 text-sm ${isMe ? 'text-green-100' : 'text-gray-600'}`}>
              <Clock className="w-4 h-4 flex-shrink-0 opacity-60" /> {msg.meetingTime}
            </div>
            {msg.meetingNotes && (
              <p className={`text-xs pt-2 border-t ${isMe ? 'border-green-500 text-green-200' : 'border-gray-100 text-gray-500'}`}>
                {msg.meetingNotes}
              </p>
            )}
          </div>
        </div>
        <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : ''}`}>{formatTime(msg.timestamp)}</p>
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
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isOfferLetter, setIsOfferLetter] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ date: '', time: '', notes: '' });
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!lastMessageTime || !selectedRoom) return;
    api.chat.room(selectedRoom.id).then(updated => {
      setSelectedRoom(updated);
      setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
    }).catch(() => {});
  }, [lastMessageTime]);

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

  const clearFileInputs = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

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

  const sendFile = async () => {
    if (!pendingFile || !user || !selectedRoom) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('file', pendingFile);
      formData.append('senderName', user.name);
      formData.append('isOfferLetter', String(isOfferLetter));
      const msg = await api.chat.sendFile(selectedRoom.id, formData);
      const updated = { ...selectedRoom, messages: [...selectedRoom.messages, msg] };
      setSelectedRoom(updated);
      setRooms(prev => prev.map(r => r.id === selectedRoom.id ? updated : r));
      setPendingFile(null);
      setIsOfferLetter(false);
      setInput('');
      clearFileInputs();
    } catch {} finally {
      setSending(false);
    }
  };

  const scheduleMeeting = async () => {
    if (!user || !selectedRoom || !meetingForm.date || !meetingForm.time) return;
    const dateStr = new Date(meetingForm.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const timeStr = new Date(`2000-01-01T${meetingForm.time}`).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
    setSending(true);
    try {
      const msg = await api.chat.scheduleMeeting(selectedRoom.id, {
        senderName: user.name, meetingDate: dateStr, meetingTime: timeStr, meetingNotes: meetingForm.notes,
      });
      const updated = { ...selectedRoom, messages: [...selectedRoom.messages, msg] };
      setSelectedRoom(updated);
      setRooms(prev => prev.map(r => r.id === selectedRoom.id ? updated : r));
      setShowMeetingModal(false);
      setMeetingForm({ date: '', time: '', notes: '' });
    } catch {} finally {
      setSending(false);
    }
  };

  const getStudentName = (room: any) => room.participantNames?.find((n: string) => n !== user?.name) || 'Student';
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
              <input type="text" placeholder="Search conversations…" aria-label="Search conversations"
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
                    : lastMsg?.type === 'file' ? `📎 ${lastMsg.fileName || 'Document'}`
                    : lastMsg?.type === 'meeting' ? `📅 Meeting: ${lastMsg.meetingDate}`
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
                const key = msg._id || msg.id;
                if (msg.type === 'call') return <CallMessage key={key} msg={msg} isMe={msg.senderId === user?.id} />;
                if (msg.type === 'file') return <FileMessage key={key} msg={msg} isMe={msg.senderId === user?.id} />;
                if (msg.type === 'meeting') return <MeetingMessage key={key} msg={msg} isMe={msg.senderId === user?.id} />;
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={key} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
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

            {/* Input area */}
            <div className="p-4 border-t border-gray-100">
              {pendingFile && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{pendingFile.name}</p>
                      <p className="text-xs text-gray-500">{(pendingFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button" aria-label="Remove attachment" onClick={() => { setPendingFile(null); setIsOfferLetter(false); clearFileInputs(); }}
                      className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Offer letter toggle — counselor only */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={isOfferLetter} onChange={e => setIsOfferLetter(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">📋 This is an Offer Letter</span>
                    <span className="text-xs text-gray-400">(saves to student's Applications)</span>
                  </label>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" aria-label="Attach document" className="hidden"
                onChange={e => { if (e.target.files?.[0]) setPendingFile(e.target.files[0]); }} />
              <input ref={cameraInputRef} type="file" accept="image/*" aria-label="Capture photo" className="hidden"
                onChange={e => { if (e.target.files?.[0]) setPendingFile(e.target.files[0]); }} />

              <div className="flex items-center gap-1.5">
                <button type="button" aria-label="Attach document" onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors flex-shrink-0">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" aria-label="Camera / Photo" onClick={() => cameraInputRef.current?.click()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors flex-shrink-0">
                  <Camera className="w-4 h-4" />
                </button>
                <button type="button" aria-label="Schedule meeting" onClick={() => setShowMeetingModal(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors flex-shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-0.5 flex-shrink-0" />
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { pendingFile ? sendFile() : send(); } }}
                  placeholder={pendingFile ? 'Add a caption (optional)…' : 'Type a message…'}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="button" aria-label="Send message" onClick={() => pendingFile ? sendFile() : send()}
                  disabled={(!input.trim() && !pendingFile) || sending}
                  className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors flex-shrink-0">
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

      {/* Meeting modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Schedule Meeting</h3>
              </div>
              <button type="button" aria-label="Close" onClick={() => setShowMeetingModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label htmlFor="c-meeting-date" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                <input id="c-meeting-date" type="date" value={meetingForm.date} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setMeetingForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label htmlFor="c-meeting-time" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Time</label>
                <input id="c-meeting-time" type="time" value={meetingForm.time}
                  onChange={e => setMeetingForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label htmlFor="c-meeting-notes" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Agenda / Notes (optional)</label>
                <textarea id="c-meeting-notes" value={meetingForm.notes} onChange={e => setMeetingForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="What will you discuss?" rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <button type="button" onClick={scheduleMeeting} disabled={!meetingForm.date || !meetingForm.time || sending}
                className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                <CalendarDays className="w-4 h-4" /> Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
