import { useState } from 'react';
import { User, GraduationCap, BookOpen, Upload, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Student } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const DOC_TYPES = ['Passport', 'Transcript', 'Diploma/Degree Certificate', 'English Test Certificate', 'SOP', 'LOR', 'CV/Resume', 'Bank Statement', 'Other'];

function UploadDocumentModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(DOC_TYPES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Document name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.students.addDocument({ name: name.trim(), type });
      onUploaded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add document.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Upload Document</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. IELTS Score Card"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
            <select aria-label="Document type" value={type} onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
              {saving ? 'Adding…' : 'Add Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { user, refreshUser } = useAuth();
  const student = user as Student;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({
    name: student?.name || '',
    phone: student?.phone || '',
    nationality: student?.nationality || '',
    educationLevel: student?.educationLevel || '',
    gpa: student?.gpa || 0,
  });

  if (!student) return null;

  const docs = student.documents || [];
  const apps = student.applications || [];

  const completion = (() => {
    const fields = [student.phone, student.nationality, student.educationLevel, student.gpa,
      student.englishScore, (student.preferredCountries?.length || 0) > 0, (student.interestedCourses?.length || 0) > 0];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })();

  const save = async () => {
    setSaving(true);
    try {
      await api.students.updateMe(form);
      await refreshUser();
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {showUpload && (
        <UploadDocumentModal
          onClose={() => setShowUpload(false)}
          onUploaded={refreshUser}
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal and academic information</p>
        </div>
        <button type="button" onClick={editing ? save : () => setEditing(true)} disabled={saving}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${editing ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
          {editing ? <><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
            {student.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{student.name}</h2>
            <p className="text-blue-200">{student.email}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-blue-200">
              <span>{student.nationality}</span>
              <span>•</span>
              <span>Joined {student.joinedDate}</span>
            </div>
          </div>
          <div className="hidden md:block text-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white" strokeWidth="3" strokeDasharray={`${completion}, 100`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{completion}%</span>
              </div>
            </div>
            <p className="text-xs text-blue-200 mt-1">Profile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', key: 'name' as const },
                { label: 'Phone', key: 'phone' as const },
                { label: 'Nationality', key: 'nationality' as const },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{field.label}</label>
                  {editing ? (
                    <input aria-label={field.label} value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-900 font-medium">{student[field.key] as string}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                <p className="text-gray-900 font-medium">{student.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-600" /> Academic Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Education Level</label>
                {editing ? (
                  <select aria-label="Education level" value={form.educationLevel} onChange={e => setForm(f => ({ ...f, educationLevel: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>12th Grade (Completed)</option>
                    <option>Bachelor's (Completed)</option>
                    <option>Master's (Completed)</option>
                  </select>
                ) : <p className="text-gray-900 font-medium">{student.educationLevel}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">GPA / Percentage</label>
                {editing ? (
                  <input type="number" aria-label="GPA" value={form.gpa} step={0.1} max={10}
                    onChange={e => setForm(f => ({ ...f, gpa: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : <p className="text-gray-900 font-medium">{student.gpa}/10</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">English Test</label>
                <p className="text-gray-900 font-medium">{student.englishScore ? `${student.englishScore.type}: ${student.englishScore.score}` : '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Annual Budget</label>
                <p className="text-gray-900 font-medium">${(student.budget || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600" /> Study Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Preferred Countries</label>
                <div className="flex flex-wrap gap-2">
                  {(student.preferredCountries || []).map((c: string) => (
                    <span key={c} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Interested Courses</label>
                <div className="flex flex-wrap gap-2">
                  {(student.interestedCourses || []).map((c: string) => (
                    <span key={c} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Documents</h3>
            <div className="space-y-3">
              {docs.map((doc: any) => (
                <div key={doc._id || doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.type}</p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setShowUpload(true)} className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 py-3 rounded-xl transition-colors text-sm font-medium">
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Profile Status</span>
                <StatusBadge status={student.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Applications</span>
                <span className="font-semibold">{apps.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Documents</span>
                <span className="font-semibold">{docs.filter((d: any) => d.status === 'verified').length}/{docs.length} verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
