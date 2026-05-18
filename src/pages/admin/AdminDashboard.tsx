import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users, UserCog, FileText, Activity, Plus, Trash2, X, Shield,
  Eye, EyeOff, Check, UserPlus, Search,
  ToggleLeft, ToggleRight, Info, GraduationCap, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

const SPECIALIZATIONS = [
  'UK Universities', 'Canada Universities', 'Australia Universities',
  'Germany', 'Netherlands', 'Singapore', 'Medical Programs', 'Engineering', 'Business',
];
const COUNTRIES = ['UK', 'Canada', 'Australia', 'Germany', 'Netherlands', 'Singapore', 'USA', 'Ireland', 'New Zealand'];
const COURSES = ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law', 'Arts', 'Data Science', 'Finance', 'Psychology'];
const EDUCATION_LEVELS = ['High School', "Bachelor's", "Master's", 'PhD'];
const ENGLISH_TYPES = ['IELTS', 'TOEFL', 'PTE', 'Duolingo'];

const DEFAULT_COUNSELOR_FORM = { name: '', email: '', password: '', specialization: [] as string[], experience: '' };
const DEFAULT_STUDENT_FORM = {
  name: '', email: '', password: '', phone: '', nationality: '', educationLevel: '',
  gpa: '', englishType: '', englishScore: '', budget: '',
  preferredCountries: [] as string[], interestedCourses: [] as string[], counselorId: '',
};

// ── Button primitives ────────────────────────────────────────────────────────

function BtnPrimary({ children, onClick, disabled, type = 'button', className = '', variant = 'purple' }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  type?: 'button' | 'submit'; className?: string; variant?: 'purple' | 'blue';
}) {
  const colors = variant === 'blue'
    ? 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus-visible:ring-blue-500'
    : 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus-visible:ring-purple-500';
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
        bg-gradient-to-r shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${colors} ${className}`}>
      {children}
    </button>
  );
}

function BtnGhost({ children, onClick, type = 'button', className = '' }: {
  children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; className?: string;
}) {
  return (
    <button type={type} onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
        text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300
        active:scale-[0.98] transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2
        ${className}`}>
      {children}
    </button>
  );
}

function BtnDanger({ children, onClick, disabled, className = '' }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
        text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 hover:text-red-700
        active:scale-[0.97] transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1
        ${className}`}>
      {children}
    </button>
  );
}

function BtnView({ onClick, color = 'purple' }: { onClick: () => void; color?: 'purple' | 'blue' }) {
  const s = color === 'blue'
    ? 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 focus-visible:ring-blue-400'
    : 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300 focus-visible:ring-purple-400';
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border
        active:scale-[0.97] transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${s}`}>
      <Info className="w-3.5 h-3.5" />Details
    </button>
  );
}

function BtnClose({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" aria-label="Close" onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400
        hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
      <X className="w-4 h-4" />
    </button>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Spinner({ size = 4, white = false }: { size?: number; white?: boolean }) {
  return <span className={`w-${size} h-${size} border-2 ${white ? 'border-white/40 border-t-white' : 'border-gray-300 border-t-gray-600'} rounded-full animate-spin inline-block`} />;
}

function DetailRow({ label, value }: { label: string; value?: any }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-36 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-800 font-medium flex-1">{String(value)}</span>
    </div>
  );
}

function normalId(obj: any) { return (obj?._id || obj?.id)?.toString() ?? ''; }

// ── Student detail modal ─────────────────────────────────────────────────────

function StudentDetailModal({ student, onClose }: { student: any; onClose: () => void }) {
  const initials = student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{student.name}</h2>
              <p className="text-sm text-gray-500">{student.email}</p>
            </div>
          </div>
          <BtnClose onClick={onClose} />
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Personal Info</p>
            <div className="bg-gray-50 rounded-xl p-3">
              <DetailRow label="Phone" value={student.phone} />
              <DetailRow label="Nationality" value={student.nationality} />
              <DetailRow label="Status" value={student.status} />
              <DetailRow label="Joined" value={student.joinedDate} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Academic Profile</p>
            <div className="bg-gray-50 rounded-xl p-3">
              <DetailRow label="Education Level" value={student.educationLevel} />
              <DetailRow label="GPA" value={student.gpa} />
              {student.englishScore?.score && (
                <DetailRow label="English Score" value={`${student.englishScore.type} — ${student.englishScore.score}`} />
              )}
              <DetailRow label="Budget" value={student.budget ? `$${Number(student.budget).toLocaleString()}` : undefined} />
            </div>
          </div>
          {student.preferredCountries?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Preferred Countries</p>
              <div className="flex flex-wrap gap-2">
                {student.preferredCountries.map((c: string) => (
                  <span key={c} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-100">{c}</span>
                ))}
              </div>
            </div>
          )}
          {student.interestedCourses?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Interested Courses</p>
              <div className="flex flex-wrap gap-2">
                {student.interestedCourses.map((c: string) => (
                  <span key={c} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium border border-indigo-100">{c}</span>
                ))}
              </div>
            </div>
          )}
          {student.applications?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Applications ({student.applications.length})
              </p>
              <div className="space-y-2">
                {student.applications.map((app: any, i: number) => (
                  <div key={app._id || i} className="bg-gray-50 rounded-xl p-3 flex items-start gap-3 border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{app.universityName}</p>
                      <p className="text-xs text-gray-500">{app.courseName}</p>
                      {app.intake && <p className="text-xs text-gray-400">{app.intake}</p>}
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {student.documents?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Documents ({student.documents.length})
              </p>
              <div className="space-y-1.5">
                {student.documents.map((doc: any, i: number) => (
                  <div key={doc._id || i} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between border border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.type}</p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <BtnGhost onClick={onClose} className="w-full">Close</BtnGhost>
        </div>
      </div>
    </div>
  );
}

// ── Counselor detail modal ───────────────────────────────────────────────────

function CounselorDetailModal({ counselor, students, onClose }: { counselor: any; students: any[]; onClose: () => void }) {
  const initials = counselor.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const assignedIds: string[] = (counselor.assignedStudents ?? []).map((id: any) => id.toString());
  const assignedStudentDetails = students.filter(s => assignedIds.includes(normalId(s)));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{counselor.name}</h2>
              <p className="text-sm text-gray-500">{counselor.email}</p>
            </div>
          </div>
          <BtnClose onClick={onClose} />
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Profile</p>
            <div className="bg-gray-50 rounded-xl p-3">
              <DetailRow label="Experience" value={counselor.experience !== undefined ? `${counselor.experience} years` : undefined} />
              <DetailRow label="Assigned Students" value={assignedIds.length} />
            </div>
          </div>
          {counselor.specialization?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Specializations</p>
              <div className="flex flex-wrap gap-2">
                {counselor.specialization.map((s: string) => (
                  <span key={s} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium border border-purple-100">{s}</span>
                ))}
              </div>
            </div>
          )}
          {assignedStudentDetails.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Assigned Students ({assignedStudentDetails.length})
              </p>
              <div className="space-y-2">
                {assignedStudentDetails.map(s => (
                  <div key={normalId(s)} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {s.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                      {s.nationality && <p className="text-xs text-gray-400">{s.nationality}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={s.status} />
                      {s.gpa && <p className="text-xs text-blue-600 font-semibold mt-1">GPA {s.gpa}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {assignedIds.length > 0 && assignedStudentDetails.length === 0 && (
            <p className="text-sm text-gray-400 italic">Student data not loaded yet.</p>
          )}
        </div>
        <div className="px-6 pb-6">
          <BtnGhost onClick={onClose} className="w-full">Close</BtnGhost>
        </div>
      </div>
    </div>
  );
}

// ── New counselor modal ──────────────────────────────────────────────────────

function NewCounselorModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: any) => void }) {
  const [form, setForm] = useState(DEFAULT_COUNSELOR_FORM);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof DEFAULT_COUNSELOR_FORM, value: any) => setForm(f => ({ ...f, [key]: value }));
  const toggleSpec = (s: string) =>
    set('specialization', form.specialization.includes(s)
      ? form.specialization.filter(x => x !== s)
      : [...form.specialization, s]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Name, email and password are required.'); return;
    }
    setSaving(true); setError('');
    try {
      const counselor = await api.admin.createCounselor({
        name: form.name.trim(), email: form.email.trim(), password: form.password,
        specialization: form.specialization, experience: parseInt(form.experience) || 0,
      });
      onCreated(counselor);
    } catch (err: any) { setError(err.message || 'Failed to create counselor.'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Create New Counselor</h2>
          </div>
          <BtnClose onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dr. Anita Sharma"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="counselor@eduabroad.com"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Set a strong password"
                className="w-full px-3.5 py-2.5 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400" />
              <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
            <input type="number" min="0" value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="e.g. 5"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map(s => {
                const sel = form.specialization.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleSpec(s)}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150 active:scale-95
                      ${sel ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600'}`}>
                    {sel && <Check className="w-3 h-3" />}{s}
                  </button>
                );
              })}
            </div>
          </div>
          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}
          <div className="flex gap-3 pt-2">
            <BtnGhost onClick={onClose} className="flex-1">Cancel</BtnGhost>
            <BtnPrimary type="submit" disabled={saving} className="flex-1">
              {saving ? <><Spinner size={4} white />Creating…</> : <><UserPlus className="w-4 h-4" />Create Counselor</>}
            </BtnPrimary>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── New student modal ────────────────────────────────────────────────────────

function NewStudentModal({ onClose, onCreated, counselors }: { onClose: () => void; onCreated: (s: any) => void; counselors: any[] }) {
  const [form, setForm] = useState(DEFAULT_STUDENT_FORM);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof DEFAULT_STUDENT_FORM, value: any) => setForm(f => ({ ...f, [key]: value }));
  const toggleArr = (key: 'preferredCountries' | 'interestedCourses', val: string) =>
    set(key, form[key].includes(val) ? form[key].filter((x: string) => x !== val) : [...form[key], val]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Name, email and password are required.'); return;
    }
    setSaving(true); setError('');
    try {
      const student = await api.admin.createStudent({
        name: form.name.trim(), email: form.email.trim(), password: form.password,
        phone: form.phone.trim() || undefined, nationality: form.nationality.trim() || undefined,
        educationLevel: form.educationLevel || undefined,
        gpa: form.gpa ? parseFloat(form.gpa) : undefined,
        englishScore: (form.englishType && form.englishScore) ? { type: form.englishType, score: parseFloat(form.englishScore) } : undefined,
        budget: form.budget ? parseInt(form.budget) : undefined,
        preferredCountries: form.preferredCountries, interestedCourses: form.interestedCourses,
        counselorId: form.counselorId || undefined,
      });
      onCreated(student);
    } catch (err: any) { setError(err.message || 'Failed to create student.'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Add New Student</h2>
          </div>
          <BtnClose onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account Details</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Aryan Sharma"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@example.com"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Set a password"
                className="w-full px-3.5 py-2.5 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400" />
              <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Personal Info</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9999999999"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nationality</label>
              <input value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="e.g. Indian"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400" />
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Academic Profile</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Education Level</label>
            <select value={form.educationLevel} onChange={e => set('educationLevel', e.target.value)} title="Education Level"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700">
              <option value="">Select level…</option>
              {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">GPA</label>
              <input type="number" step="0.01" min="0" max="10" value={form.gpa} onChange={e => set('gpa', e.target.value)} placeholder="e.g. 3.8"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget (USD)</label>
              <input type="number" min="0" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 50000"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">English Test</label>
              <select value={form.englishType} onChange={e => set('englishType', e.target.value)} title="English Test Type"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700">
                <option value="">Select…</option>
                {ENGLISH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Score</label>
              <input type="number" step="0.5" value={form.englishScore} onChange={e => set('englishScore', e.target.value)} placeholder="e.g. 7.5"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Countries</label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map(c => {
                const sel = form.preferredCountries.includes(c);
                return (
                  <button key={c} type="button" onClick={() => toggleArr('preferredCountries', c)}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150 active:scale-95
                      ${sel ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'}`}>
                    {sel && <Check className="w-3 h-3" />}{c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interested Courses</label>
            <div className="flex flex-wrap gap-2">
              {COURSES.map(c => {
                const sel = form.interestedCourses.includes(c);
                return (
                  <button key={c} type="button" onClick={() => toggleArr('interestedCourses', c)}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150 active:scale-95
                      ${sel ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'}`}>
                    {sel && <Check className="w-3 h-3" />}{c}
                  </button>
                );
              })}
            </div>
          </div>

          {counselors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign to Counselor</label>
              <select value={form.counselorId} onChange={e => set('counselorId', e.target.value)} title="Assign to Counselor"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700">
                <option value="">Unassigned</option>
                {counselors.map(c => <option key={normalId(c)} value={normalId(c)}>{c.name}</option>)}
              </select>
            </div>
          )}

          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}

          <div className="flex gap-3 pt-2">
            <BtnGhost onClick={onClose} className="flex-1">Cancel</BtnGhost>
            <BtnPrimary type="submit" disabled={saving} className="flex-1" variant="blue">
              {saving ? <><Spinner size={4} white />Adding…</> : <><GraduationCap className="w-4 h-4" />Add Student</>}
            </BtnPrimary>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const location = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [counselors, setCounselors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showNewCounselor, setShowNewCounselor] = useState(false);
  const [showNewStudent, setShowNewStudent] = useState(false);
  const [activeTab, setActiveTab] = useState<'counselors' | 'students'>(
    location.pathname.includes('/students') ? 'students' : 'counselors'
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [counselorSearch, setCounselorSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [statsData, counselorData, studentData] = await Promise.all([
        api.admin.stats(),
        api.admin.counselors(),
        api.admin.students(),
      ]);
      setStats(statsData);
      setCounselors(counselorData);
      setStudents(studentData);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load data. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    setActiveTab(location.pathname.includes('/students') ? 'students' : 'counselors');
  }, [location.pathname]);

  const handleDeleteCounselor = async (id: string) => {
    if (!window.confirm('Delete this counselor? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.admin.deleteCounselor(id);
      setCounselors(prev => prev.filter(c => normalId(c) !== id));
      setStats((s: any) => s ? { ...s, totalCounselors: s.totalCounselors - 1 } : s);
    } catch { alert('Failed to delete counselor. Please try again.'); }
    setDeletingId(null);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    const student = students.find(s => normalId(s) === id);
    setDeletingId(id);
    try {
      await api.admin.deleteStudent(id);
      setStudents(prev => prev.filter(s => normalId(s) !== id));
      setStats((st: any) => {
        if (!st) return st;
        return {
          ...st,
          totalStudents: st.totalStudents - 1,
          activeStudents: student?.status === 'active' ? st.activeStudents - 1 : st.activeStudents,
        };
      });
    } catch { alert('Failed to delete student. Please try again.'); }
    setDeletingId(null);
  };

  const handleToggleStudentStatus = async (student: any) => {
    const id = normalId(student);
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    setTogglingId(id);
    try {
      const updated = await api.admin.updateStudentStatus(id, newStatus);
      setStudents(prev => prev.map(s => normalId(s) === id ? updated : s));
      setStats((st: any) => {
        if (!st) return st;
        return { ...st, activeStudents: st.activeStudents + (newStatus === 'active' ? 1 : -1) };
      });
    } catch { alert('Failed to update student status. Please try again.'); }
    setTogglingId(null);
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.nationality?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredCounselors = counselors.filter(c =>
    c.name?.toLowerCase().includes(counselorSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(counselorSearch.toLowerCase())
  );

  return (
    <>
      {showNewCounselor && (
        <NewCounselorModal
          onClose={() => setShowNewCounselor(false)}
          onCreated={c => {
            setCounselors(prev => [...prev, c]);
            setStats((s: any) => s ? { ...s, totalCounselors: s.totalCounselors + 1 } : s);
            setShowNewCounselor(false);
          }}
        />
      )}
      {showNewStudent && (
        <NewStudentModal
          counselors={counselors}
          onClose={() => setShowNewStudent(false)}
          onCreated={s => {
            setStudents(prev => [...prev, s]);
            setStats((st: any) => st ? { ...st, totalStudents: st.totalStudents + 1, activeStudents: st.activeStudents + 1 } : st);
            setShowNewStudent(false);
          }}
        />
      )}
      {selectedStudent && <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      {selectedCounselor && <CounselorDetailModal counselor={selectedCounselor} students={students} onClose={() => setSelectedCounselor(null)} />}

      <div className="space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">Admin Portal</p>
                <h1 className="text-2xl font-bold leading-tight">Dashboard</h1>
              </div>
            </div>
            <button type="button" onClick={loadData} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Students', value: stats?.totalStudents ?? '—', icon: Users, color: 'from-blue-400/30 to-blue-600/30' },
              { label: 'Counselors', value: stats?.totalCounselors ?? '—', icon: UserCog, color: 'from-green-400/30 to-green-600/30' },
              { label: 'Applications', value: stats?.totalApplications ?? '—', icon: FileText, color: 'from-orange-400/30 to-orange-600/30' },
              { label: 'Active Students', value: stats?.activeStudents ?? '—', icon: Activity, color: 'from-pink-400/30 to-pink-600/30' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} border border-white/20 rounded-xl p-4 backdrop-blur-sm`}>
                <s.icon className="w-4 h-4 text-white/70 mb-2" />
                <div className="text-3xl font-bold tracking-tight">{loading ? '…' : s.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Error state */}
        {loadError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Failed to load data</p>
              <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
            </div>
            <button type="button" onClick={loadData}
              className="text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !loadError && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center justify-center gap-3 text-gray-400">
            <Spinner size={5} />
            <span className="text-sm">Loading data…</span>
          </div>
        )}

        {/* Tab bar */}
        {!loading && (
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
            {([
              { key: 'counselors', label: 'Counselors', count: counselors.length, icon: UserCog },
              { key: 'students', label: 'Students', count: students.length, icon: Users },
            ] as const).map(tab => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                  ${activeTab === tab.key ? 'bg-white text-purple-700 shadow-sm ring-1 ring-gray-200/80' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                  ${activeTab === tab.key ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Counselors tab */}
        {!loading && activeTab === 'counselors' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap bg-gray-50/60">
              <div className="relative flex-1 min-w-0 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input value={counselorSearch} onChange={e => setCounselorSearch(e.target.value)}
                  placeholder="Search counselors…"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <BtnPrimary onClick={() => setShowNewCounselor(true)}>
                <Plus className="w-4 h-4" />New Counselor
              </BtnPrimary>
            </div>

            <div className="divide-y divide-gray-50">
              {filteredCounselors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                  <UserCog className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">{counselorSearch ? 'No counselors match your search.' : 'No counselors yet. Create one above.'}</p>
                </div>
              ) : filteredCounselors.map(c => {
                const id = normalId(c);
                return (
                  <div key={id} className="flex items-center gap-4 px-5 py-4 hover:bg-purple-50/40 transition-colors">
                    <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm text-lg">
                      {c.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                      {c.specialization?.length > 0 && (
                        <p className="text-xs text-purple-600 mt-0.5 truncate">{c.specialization.join(' · ')}</p>
                      )}
                    </div>
                    <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900">{c.assignedStudents?.length ?? 0}</p>
                        <p className="text-xs text-gray-400">students</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900">{c.experience ?? 0}y</p>
                        <p className="text-xs text-gray-400">exp</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <BtnView onClick={() => setSelectedCounselor(c)} color="purple" />
                      <BtnDanger onClick={() => handleDeleteCounselor(id)} disabled={deletingId === id}>
                        {deletingId === id ? <><Spinner size={3} />Deleting…</> : <><Trash2 className="w-3.5 h-3.5" />Delete</>}
                      </BtnDanger>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Students tab */}
        {!loading && activeTab === 'students' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap bg-gray-50/60">
              <div className="relative flex-1 min-w-0 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                  placeholder="Search by name, email or nationality…"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <BtnPrimary onClick={() => setShowNewStudent(true)} variant="blue">
                <Plus className="w-4 h-4" />New Student
              </BtnPrimary>
            </div>

            <div className="divide-y divide-gray-50">
              {filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                  <Users className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">{studentSearch ? 'No students match your search.' : 'No students yet.'}</p>
                </div>
              ) : filteredStudents.map(s => {
                const id = normalId(s);
                const isActive = s.status === 'active';
                const isToggling = togglingId === id;
                return (
                  <div key={id} className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50/30 transition-colors">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm text-lg">
                      {s.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {s.nationality && <span className="text-xs text-gray-400">{s.nationality}</span>}
                        {s.educationLevel && <span className="text-xs text-gray-400">{s.educationLevel}</span>}
                        {s.gpa && <span className="text-xs text-blue-600 font-semibold">GPA {s.gpa}</span>}
                        {s.englishScore?.score && (
                          <span className="text-xs text-indigo-600 font-semibold">{s.englishScore.type} {s.englishScore.score}</span>
                        )}
                      </div>
                    </div>
                    <div className="hidden sm:block text-center flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{s.applications?.length ?? 0}</p>
                      <p className="text-xs text-gray-400">apps</p>
                    </div>
                    <StatusBadge status={s.status} />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button type="button" onClick={() => handleToggleStudentStatus(s)} disabled={isToggling}
                        aria-label={isActive ? 'Deactivate student' : 'Activate student'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border
                          active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
                          ${isActive
                            ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300 focus-visible:ring-amber-400'
                            : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 focus-visible:ring-green-400'}`}>
                        {isToggling
                          ? <Spinner size={3} />
                          : isActive ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                        {isToggling ? '…' : isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <BtnView onClick={() => setSelectedStudent(s)} color="blue" />
                      <BtnDanger onClick={() => handleDeleteStudent(id)} disabled={deletingId === id}>
                        {deletingId === id ? <><Spinner size={3} />Deleting…</> : <><Trash2 className="w-3.5 h-3.5" />Delete</>}
                      </BtnDanger>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
