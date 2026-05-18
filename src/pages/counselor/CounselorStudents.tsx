import { useState, useEffect } from 'react';
import { Link, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, FileText, MessageSquare, CheckCircle, Upload, Phone, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Counselor } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const DOC_TYPES = ['Passport', 'Transcript', 'Diploma/Degree Certificate', 'English Test Certificate', 'SOP', 'LOR', 'CV/Resume', 'Bank Statement', 'Other'];

function RequestDocumentModal({ studentId, onClose, onRequested }: { studentId: string; onClose: () => void; onRequested: () => void }) {
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
      await api.students.requestDocument(studentId, { name: name.trim(), type });
      onRequested();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to request document.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Request Document</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. IELTS Score Card"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
            <select aria-label="Document type" value={type} onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60">
              {saving ? 'Requesting…' : 'Request Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CounselorStudents() {
  return (
    <Routes>
      <Route index element={<StudentsList />} />
      <Route path=":studentId" element={<StudentDetail />} />
    </Routes>
  );
}

function StudentsList() {
  const { user } = useAuth();
  const counselor = user as Counselor;
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tab, setTab] = useState<'mine' | 'all'>('mine');

  useEffect(() => {
    api.students.list().then(setAllStudents).catch(() => {});
  }, []);

  const myStudents = allStudents.filter((s: any) => counselor.assignedStudents?.includes(s._id || s.id));
  const source = tab === 'mine' ? myStudents : allStudents;

  const filtered = source.filter((s: any) => {
    const matchQuery = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.email.toLowerCase().includes(query.toLowerCase()) || s.nationality?.toLowerCase().includes(query.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-500 mt-1">Manage students and their application journey</p>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button type="button" onClick={() => setTab('mine')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'mine' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>My Students ({myStudents.length})</button>
        <button type="button" onClick={() => setTab('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>All Students ({allStudents.length})</button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email, nationality..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="enrolled">Enrolled</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-3">{filtered.length} students found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((student: any) => {
          const sid = student._id || student.id;
          const apps = student.applications || [];
          const docs = student.documents || [];
          return (
            <Link key={sid} to={`/counselor/students/${sid}`} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center font-bold text-green-700 text-lg flex-shrink-0">{student.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{student.name}</h3>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={student.status} />
                      {student.phone && (
                        <a
                          href={`tel:${student.phone.replace(/\s/g, '')}`}
                          onClick={e => e.stopPropagation()}
                          title={`Call ${student.phone}`}
                          className="w-8 h-8 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-sm transition-all flex-shrink-0"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{student.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{student.nationality} • {student.educationLevel}</p>
                  {student.phone && <p className="text-xs text-green-600 font-medium mt-0.5">{student.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-center">
                <div><p className="text-lg font-bold text-gray-900">{apps.length}</p><p className="text-xs text-gray-500">Applications</p></div>
                <div><p className="text-lg font-bold text-gray-900">{docs.filter((d: any) => d.status === 'verified').length}/{docs.length}</p><p className="text-xs text-gray-500">Docs Ready</p></div>
                <div><p className="text-lg font-bold text-gray-900">{student.englishScore?.score ?? '—'}</p><p className="text-xs text-gray-500">{student.englishScore?.type ?? 'Score'}</p></div>
              </div>
              {apps.some((a: any) => a.status === 'offer_received') && (
                <div className="mt-3 bg-green-50 text-green-700 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Offer received — action needed
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'documents'>('overview');
  const [updating, setUpdating] = useState(false);
  const [showRequestDoc, setShowRequestDoc] = useState(false);

  useEffect(() => {
    if (studentId) {
      api.students.get(studentId).then(setStudent).catch(() => {});
    }
  }, [studentId]);

  const verifyDoc = async (docId: string, status: 'verified' | 'rejected') => {
    if (!student || !studentId) return;
    setUpdating(true);
    try {
      const updated = await api.students.updateDocument(studentId, docId, status);
      setStudent(updated);
    } catch {}
    setUpdating(false);
  };

  const updateAppStatus = async (appId: string, status: string) => {
    if (!studentId) return;
    setUpdating(true);
    try {
      await api.applications.update(appId, { status });
      const updated = await api.students.get(studentId);
      setStudent(updated);
    } catch {}
    setUpdating(false);
  };

  if (!student) return (
    <div className="text-center py-12">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    </div>
  );

  const apps = student.applications || [];
  const docs = student.documents || [];

  return (
    <div className="space-y-5">
      {showRequestDoc && studentId && (
        <RequestDocumentModal
          studentId={studentId}
          onClose={() => setShowRequestDoc(false)}
          onRequested={async () => {
            if (studentId) {
              const updated = await api.students.get(studentId).catch(() => null);
              if (updated) setStudent(updated);
            }
          }}
        />
      )}
      <button type="button" onClick={() => navigate('/counselor/students')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center font-bold text-green-700 text-2xl flex-shrink-0">{student.name.charAt(0)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
              <StatusBadge status={student.status} size="md" />
            </div>
            <p className="text-gray-600">{student.email} • {student.phone}</p>
            <p className="text-sm text-gray-500 mt-1">{student.nationality} • {student.educationLevel} • GPA: {student.gpa}/10</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {student.englishScore && <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">{student.englishScore.type}: {student.englishScore.score}</span>}
              <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full">Budget: ${(student.budget || 0).toLocaleString()}/yr</span>
              {(student.preferredCountries || []).map((c: string) => <span key={c} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{c}</span>)}
            </div>
          </div>
          <Link to="/counselor/chat" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            <MessageSquare className="w-4 h-4" /> Chat
          </Link>
        </div>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {(['overview', 'applications', 'documents'] as const).map(tab => (
          <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Application Summary</h3>
            {apps.length === 0 ? <p className="text-gray-400 text-sm">No applications yet</p> : (
              <div className="space-y-3">
                {apps.map((a: any) => (
                  <div key={a._id || a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div><p className="font-medium text-sm text-gray-900">{a.universityName}</p><p className="text-xs text-gray-500">{a.courseName}</p></div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Document Status</h3>
            <div className="space-y-3">
              {docs.map((doc: any) => (
                <div key={doc._id || doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="font-medium text-sm text-gray-900">{doc.name}</p><p className="text-xs text-gray-500">{doc.type}</p></div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4">
          {apps.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No applications submitted yet</p>
            </div>
          ) : apps.map((app: any) => {
            const appId = app._id || app.id;
            return (
              <div key={appId} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900">{app.universityName}</h3>
                      <StatusBadge status={app.status} size="md" />
                    </div>
                    <p className="text-gray-600 text-sm">{app.courseName}</p>
                    <p className="text-xs text-gray-400 mt-1">Intake: {app.intake}{app.submittedDate && ` • Submitted: ${app.submittedDate}`}</p>
                  </div>
                  <select aria-label="Update application status" defaultValue={app.status} disabled={updating}
                    onChange={e => updateAppStatus(appId, e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60">
                    {['draft', 'submitted', 'under_review', 'offer_received', 'accepted', 'rejected', 'enrolled'].map(s => (
                      <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Documents</h3>
            <button type="button" onClick={() => setShowRequestDoc(true)} className="flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700">
              <Upload className="w-4 h-4" /> Request Document
            </button>
          </div>
          <div className="space-y-3">
            {docs.map((doc: any) => {
              const docId = doc._id || doc.id;
              return (
                <div key={docId} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.type} • Uploaded {doc.uploadedDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.status} size="md" />
                    {doc.status === 'pending' && (
                      <div className="flex gap-1">
                        <button type="button" disabled={updating} onClick={() => verifyDoc(docId, 'verified')}
                          className="text-xs bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-200 font-medium disabled:opacity-60">Verify</button>
                        <button type="button" disabled={updating} onClick={() => verifyDoc(docId, 'rejected')}
                          className="text-xs bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-200 font-medium disabled:opacity-60">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
