import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, Bell, ArrowRight, Star, MapPin, Upload, X, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Student } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const DOC_TYPES = ['Passport', 'Transcript', 'Diploma/Degree Certificate', 'English Test Certificate', 'SOP', 'LOR', 'CV/Resume', 'Bank Statement', 'Other'];

function UploadDocumentModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(DOC_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !name) setName(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !name.trim()) { setError('Select a file or enter a document name.'); return; }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      if (file) fd.append('file', file);
      fd.append('name', name.trim() || (file?.name ?? 'Document'));
      fd.append('type', type);
      await api.students.uploadDocument(fd);
      onUploaded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Upload Document</h2>
          <button type="button" aria-label="Close" onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-5 text-center cursor-pointer transition-colors group">
            <input ref={fileRef} type="file" className="hidden" aria-label="Choose document file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFile} />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
              </div>
            ) : (
              <>
                <Upload className="w-7 h-7 text-gray-300 group-hover:text-blue-500 mx-auto mb-1.5 transition-colors" />
                <p className="text-sm text-gray-500">Click to choose a file from your device</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, Word, JPG, PNG — max 10 MB</p>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. IELTS Score Card"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
            <select aria-label="Document type" value={type} onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-60">
              {saving ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const student = user as Student;
  const [showUpload, setShowUpload] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    api.universities.list().then(unis => {
      const recs = unis.filter(u =>
        u.courses.some((c: any) => student.interestedCourses?.some((ic: string) => c.name.toLowerCase().includes(ic.toLowerCase())))
      ).slice(0, 3);
      setRecommendations(recs);
    }).catch(() => {});
  }, []);

  if (!student) return null;

  const apps = student.applications || [];
  const docs = student.documents || [];

  const appStats = {
    total: apps.length,
    underReview: apps.filter((a: any) => a.status === 'under_review').length,
    offers: apps.filter((a: any) => ['offer_received', 'accepted'].includes(a.status)).length,
  };
  const docStats = {
    total: docs.length,
    verified: docs.filter((d: any) => d.status === 'verified').length,
  };

  const profileFields = [
    { label: 'Phone Number', filled: !!student.phone },
    { label: 'Nationality', filled: !!student.nationality },
    { label: 'Education Level', filled: !!student.educationLevel },
    { label: 'GPA / Percentage', filled: !!student.gpa },
    { label: 'English Test Score', filled: !!(student.englishScore?.score) },
    { label: 'Preferred Countries', filled: (student.preferredCountries?.length || 0) > 0 },
    { label: 'Interested Courses', filled: (student.interestedCourses?.length || 0) > 0 },
    { label: 'Annual Budget', filled: !!student.budget },
  ];
  const completion = Math.round((profileFields.filter(f => f.filled).length / profileFields.length) * 100);
  const filledCount = profileFields.filter(f => f.filled).length;
  const scoreColor = completion === 100 ? 'text-green-600' : completion >= 67 ? 'text-blue-600' : completion >= 34 ? 'text-amber-600' : 'text-red-500';
  const barColor = completion === 100 ? 'bg-green-500' : completion >= 67 ? 'bg-sky-500' : completion >= 34 ? 'bg-amber-500' : 'bg-red-500';
  const progressFillClass = `progress-fill-${filledCount}`;

  return (
    <div className="space-y-6">
      {showUpload && (
        <UploadDocumentModal
          onClose={() => setShowUpload(false)}
          onUploaded={refreshUser}
        />
      )}

      {/* Welcome header */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-900 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-blue-200 mt-2 text-sm">Track your applications and explore universities</p>
          </div>
          <div className="hidden md:block bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold">{appStats.offers}</div>
            <div className="text-xs text-blue-200">Offer(s) Received</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Applications', value: appStats.total, icon: FileText },
            { label: 'Under Review', value: appStats.underReview, icon: Clock },
            { label: 'Docs Verified', value: `${docStats.verified}/${docStats.total}`, icon: CheckCircle },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <s.icon className="w-5 h-5 mx-auto mb-1 text-blue-200" />
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-blue-200">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Offer alert */}
      {appStats.offers > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-800">You have {appStats.offers} offer(s)!</p>
            <p className="text-green-600 text-sm">Check your applications and respond to offers.</p>
          </div>
          <Link to="/student/applications" className="text-green-700 font-medium text-sm hover:underline whitespace-nowrap">View offers</Link>
        </div>
      )}

      {/* Profile Completion + Upload Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Profile Completion card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Profile Completion</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in all details to get the best university matches</p>
            </div>
            <span className={`text-3xl font-bold ${scoreColor}`}>{completion}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-5">
            <div className={`h-full rounded-full transition-all duration-500 ${progressFillClass} ${barColor}`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {profileFields.map(field => (
              <div key={field.label} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${field.filled ? 'bg-green-50' : 'bg-orange-50'}`}>
                {field.filled
                  ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                <span className={field.filled ? 'text-green-800 font-medium' : 'text-orange-700'}>{field.label}</span>
              </div>
            ))}
          </div>
          {completion < 100 && (
            <Link to="/student/profile"
              className="mt-4 w-full flex items-center justify-center gap-2 bg-sky-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-sky-600 transition-colors">
              Complete Your Profile <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Upload Documents card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-1">My Documents</h2>
          <p className="text-xs text-gray-400 mb-4">Visible to your counselor and admin</p>
          <div className="flex-1 space-y-2 mb-4">
            {docs.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No documents uploaded yet</p>
              </div>
            ) : docs.slice(0, 4).map((doc: any) => (
              <div key={doc._id || doc.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${doc.status === 'verified' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                  <span className="text-sm font-medium text-gray-700 truncate">{doc.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Open document">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <StatusBadge status={doc.status} />
                </div>
              </div>
            ))}
            {docs.length > 4 && (
              <p className="text-xs text-center text-gray-400">+{docs.length - 4} more document{docs.length - 4 > 1 ? 's' : ''}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-sky-600 active:scale-[0.98] transition-all shadow-sm">
            <Upload className="w-4 h-4" /> Upload Document
          </button>
          {docs.length > 0 && (
            <Link to="/student/profile" className="mt-2 text-center text-xs text-blue-600 hover:text-blue-700 font-medium">
              Manage all documents →
            </Link>
          )}
        </div>
      </div>

      {/* Applications + Profile Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">My Applications</h2>
            <Link to="/student/applications" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {apps.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No applications yet</p>
              <Link to="/student/universities" className="text-blue-600 text-sm hover:underline mt-1 inline-block">Browse universities</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app: any) => (
                <div key={app._id || app.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {app.universityName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{app.universityName}</p>
                    <p className="text-gray-500 text-xs truncate">{app.courseName}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Profile Snapshot</h2>
            <Link to="/student/profile" className="text-blue-600 text-sm font-medium hover:text-blue-700">Edit Profile</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Nationality', value: student.nationality || '—' },
              { label: 'GPA', value: student.gpa ? `${student.gpa}/10` : '—' },
              { label: 'English', value: student.englishScore ? `${student.englishScore.type} ${student.englishScore.score}` : '—' },
              { label: 'Budget', value: student.budget ? `$${student.budget.toLocaleString()}/yr` : '—' },
            ].map(item => (
              <div key={item.label} className="bg-sky-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-500 mb-1">{item.label}</p>
                <p className="font-bold text-blue-800 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Recommended For You</h2>
            <Link to="/student/universities" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
              Explore all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map(uni => (
              <Link key={uni.id} to={`/university/${uni.id}`}
                className="flex gap-3 p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700 flex-shrink-0">
                  {uni.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 truncate">{uni.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5"><MapPin className="w-3 h-3" /> {uni.city}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-600">#{uni.ranking} World</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
