import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, MessageSquare, Phone, PhoneMissed, PhoneOff,
  Paperclip, Camera, CalendarDays, X, FileText, Download,
  Calendar, Clock, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCallContext } from '../../context/CallContext';
import { api } from '../../api';

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

function FileMessage({ msg, isMe, onAction }: { msg: any; isMe: boolean; onAction?: () => void }) {
  const isOffer = msg.isOfferLetter;
  const sizeKb = msg.fileSize ? (msg.fileSize / 1024).toFixed(0) : null;
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[75%]">
        {!isMe && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{msg.senderName.charAt(0)}</div>
            <span className="text-xs text-gray-500">{msg.senderName}</span>
          </div>
        )}
        <div className={`rounded-2xl overflow-hidden border shadow-sm ${isMe ? 'border-blue-400' : isOffer ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-gray-200'}`}>
          {isOffer && !isMe && (
            <div className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Offer Letter — Saved to your Applications!
            </div>
          )}
          <div className={`px-4 py-3 ${isMe ? 'bg-blue-600' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-sky-500' : isOffer ? 'bg-emerald-100' : 'bg-sky-50'}`}>
                <FileText className={`w-5 h-5 ${isMe ? 'text-white' : isOffer ? 'text-emerald-600' : 'text-blue-500'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold truncate ${isMe ? 'text-white' : 'text-gray-800'}`}>{msg.fileName || 'Document'}</p>
                {sizeKb && <p className={`text-xs mt-0.5 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>{sizeKb} KB</p>}
              </div>
            </div>
            {msg.fileUrl && (
              <div className="mt-2.5 flex gap-2">
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isMe ? 'bg-sky-500 hover:bg-blue-400 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                {!isMe && onAction && (
                  <button type="button" onClick={onAction}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isOffer ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-sky-500 hover:bg-blue-600 text-white'}`}>
                    {isOffer ? '📋 View Applications' : '💾 Save to Docs'}
                  </button>
                )}
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
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{msg.senderName.charAt(0)}</div>
            <span className="text-xs text-gray-500">{msg.senderName}</span>
          </div>
        )}
        <div className={`rounded-2xl overflow-hidden border shadow-sm ${isMe ? 'bg-blue-600 border-blue-400' : 'bg-white border-blue-200'}`}>
          <div className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold ${isMe ? 'bg-blue-700 text-sky-100' : 'bg-sky-50 text-blue-700'}`}>
            <Calendar className="w-3.5 h-3.5" /> Meeting Scheduled
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className={`flex items-center gap-2 text-sm font-semibold ${isMe ? 'text-white' : 'text-gray-800'}`}>
              <Calendar className="w-4 h-4 flex-shrink-0 opacity-60" /> {msg.meetingDate}
            </div>
            <div className={`flex items-center gap-2 text-sm ${isMe ? 'text-sky-100' : 'text-gray-600'}`}>
              <Clock className="w-4 h-4 flex-shrink-0 opacity-60" /> {msg.meetingTime}
            </div>
            {msg.meetingNotes && (
              <p className={`text-xs pt-2 border-t ${isMe ? 'border-blue-500 text-blue-200' : 'border-gray-100 text-gray-500'}`}>
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

export default function StudentChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { callState, startCall, lastMessageTime } = useCallContext();
  const [room, setRoom] = useState<any>(null);
  const [input, setInput] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ date: '', time: '', notes: '' });
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    api.chat.rooms().then(r => { if (r.length > 0) setRoom(r[0]); }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!lastMessageTime || !room) return;
    api.chat.room(room.id).then(setRoom).catch(() => {});
  }, [lastMessageTime]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      api.chat.rooms().then(r => { if (r.length > 0) setRoom(r[0]); }).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages]);

  const clearFileInputs = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const send = async () => {
    if (!input.trim() || !user || !room) return;
    const content = input.trim();
    setInput('');
    try {
      const msg = await api.chat.send(room.id, content, user.name);
      setRoom((prev: any) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
    } catch {}
  };

  const sendFile = async () => {
    if (!pendingFile || !user || !room) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('file', pendingFile);
      formData.append('senderName', user.name);
      const msg = await api.chat.sendFile(room.id, formData);
      setRoom((prev: any) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
      setPendingFile(null);
      setInput('');
      clearFileInputs();
    } catch {} finally {
      setSending(false);
    }
  };

  const scheduleMeeting = async () => {
    if (!user || !room || !meetingForm.date || !meetingForm.time) return;
    const dateStr = new Date(meetingForm.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const timeStr = new Date(`2000-01-01T${meetingForm.time}`).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
    setSending(true);
    try {
      const msg = await api.chat.scheduleMeeting(room.id, {
        senderName: user.name, meetingDate: dateStr, meetingTime: timeStr, meetingNotes: meetingForm.notes,
      });
      setRoom((prev: any) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
      setShowMeetingModal(false);
      setMeetingForm({ date: '', time: '', notes: '' });
    } catch {} finally {
      setSending(false);
    }
  };

  const handleDocAction = async (msg: any) => {
    if (msg.isOfferLetter) {
      navigate('/student/applications');
      return;
    }
    // Save received document to student's own docs
    try {
      const formData = new FormData();
      formData.append('name', msg.fileName || 'Document');
      formData.append('type', 'Other');
      if (msg.fileUrl) formData.append('url', msg.fileUrl);
      await api.students.uploadDocument(formData);
    } catch {}
  };

  const counselorName = room?.participantNames?.find((n: string) => n !== user?.name) || 'Counselor';
  const remoteId = room?.participants?.find((id: string) => id !== user?.id) ?? '';
  const messages = room?.messages || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chat with Counselor</h1>
        <p className="text-gray-500 mt-1">Direct communication with your assigned counselor</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col chat-window">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-sky-50 flex items-center gap-3">
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No messages yet. Say hello to your counselor!</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const key = msg._id || msg.id;
              if (msg.type === 'call') return <CallMessage key={key} msg={msg} isMe={msg.senderId === user?.id} />;
              if (msg.type === 'file') return <FileMessage key={key} msg={msg} isMe={msg.senderId === user?.id} onAction={() => handleDocAction(msg)} />;
              if (msg.type === 'meeting') return <MeetingMessage key={key} msg={msg} isMe={msg.senderId === user?.id} />;
              const isMe = msg.senderId === user?.id;
              return (
                <div key={key} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
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

        {/* Input area */}
        <div className="p-4 border-t border-gray-100">
          {pendingFile && (
            <div className="mb-3 flex items-center gap-3 p-3 bg-sky-50 border border-blue-200 rounded-xl">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{pendingFile.name}</p>
                <p className="text-xs text-gray-500">{(pendingFile.size / 1024).toFixed(0)} KB</p>
              </div>
              <button type="button" aria-label="Remove attachment" onClick={() => { setPendingFile(null); clearFileInputs(); }} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" aria-label="Attach document" className="hidden"
            onChange={e => { if (e.target.files?.[0]) setPendingFile(e.target.files[0]); }} />
          <input ref={cameraInputRef} type="file" accept="image/*" aria-label="Capture photo" className="hidden"
            onChange={e => { if (e.target.files?.[0]) setPendingFile(e.target.files[0]); }} />

          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach document"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-sky-50 hover:text-blue-600 transition-colors flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => cameraInputRef.current?.click()} title="Camera / Photo"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-sky-50 hover:text-blue-600 transition-colors flex-shrink-0">
              <Camera className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setShowMeetingModal(true)} title="Schedule meeting"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-sky-50 hover:text-blue-600 transition-colors flex-shrink-0">
              <CalendarDays className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-0.5 flex-shrink-0" />
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { pendingFile ? sendFile() : send(); } }}
              placeholder={pendingFile ? 'Add a caption (optional)…' : 'Type a message…'}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" aria-label="Send" onClick={() => pendingFile ? sendFile() : send()}
              disabled={(!input.trim() && !pendingFile) || sending}
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-sky-600 disabled:opacity-50 transition-colors flex-shrink-0">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Meeting modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Schedule Meeting</h3>
              </div>
              <button type="button" aria-label="Close" onClick={() => setShowMeetingModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label htmlFor="meeting-date" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                <input id="meeting-date" type="date" value={meetingForm.date} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setMeetingForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="meeting-time" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Time</label>
                <input id="meeting-time" type="time" value={meetingForm.time}
                  onChange={e => setMeetingForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Agenda / Notes (optional)</label>
                <textarea value={meetingForm.notes} onChange={e => setMeetingForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="What will you discuss?" rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <button type="button" onClick={scheduleMeeting} disabled={!meetingForm.date || !meetingForm.time || sending}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-sky-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                <CalendarDays className="w-4 h-4" /> Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
