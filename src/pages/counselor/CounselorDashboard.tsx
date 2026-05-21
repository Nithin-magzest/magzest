import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, MessageSquare, TrendingUp, AlertCircle, ArrowRight, Star, Plus, X, Award, Edit3, CheckCircle2, Target, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Counselor } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const EDUCATION_LEVELS = [
  '10th Grade (Completed)',
  '12th Grade (Completed)',
  "Bachelor's (In Progress)",
  "Bachelor's (Completed)",
  "Master's (In Progress)",
  "Master's (Completed)",
];

const COUNTRIES = ['Australia', 'Canada', 'Germany', 'Netherlands', 'Singapore', 'United Kingdom', 'United States'];

const DEFAULT_FORM = {
  name: '', email: '', phone: '', nationality: '',
  educationLevel: EDUCATION_LEVELS[1], gpa: '',
  englishType: 'IELTS' as 'IELTS' | 'TOEFL' | 'PTE', englishScore: '',
  preferredCountries: [] as string[], budget: '', interestedCourses: '',
};

function NewStudentModal({ onClose, onCreated }: { onClose: () => void; onCreated: (s: any) => void }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof DEFAULT_FORM, value: any) => setForm(f => ({ ...f, [key]: value }));

  const toggleCountry = (country: string) =>
    set('preferredCountries', form.preferredCountries.includes(country)
      ? form.preferredCountries.filter(c => c !== country)
      : [...form.preferredCountries, country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    setSaving(true); setError('');
    try {
      const newStudent = await (api.students as any).create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        nationality: form.nationality.trim(),
        educationLevel: form.educationLevel,
        gpa: parseFloat(form.gpa) || 0,
        englishScore: { type: form.englishType, score: parseFloat(form.englishScore) || 0 },
        preferredCountries: form.preferredCountries,
        budget: parseInt(form.budget) || 0,
        interestedCourses: form.interestedCourses.split(',').map(s => s.trim()).filter(Boolean),
        applications: [], documents: [],
        role: 'student' as const,
        joinedDate: new Date().toISOString().slice(0, 10),
        status: 'active' as const,
      });
      onCreated(newStudent);
    } catch (err: any) {
      setError(err.message || 'Failed to create student.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New Student</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rahul Singh"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@example.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 99999 00000"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <input value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="e.g. Indian"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
              <select aria-label="Education Level" value={form.educationLevel} onChange={e => set('educationLevel', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                {EDUCATION_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GPA (out of 10)</label>
              <input type="number" min="0" max="10" step="0.1" value={form.gpa} onChange={e => set('gpa', e.target.value)} placeholder="8.5"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD/yr)</label>
              <input type="number" min="0" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="30000"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">English Test</label>
              <select aria-label="English Test Type" value={form.englishType} onChange={e => set('englishType', e.target.value as any)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                <option>IELTS</option><option>TOEFL</option><option>PTE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              <input type="number" min="0" step="0.5" value={form.englishScore} onChange={e => set('englishScore', e.target.value)} placeholder="7.0"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Countries</label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map(c => (
                <button key={c} type="button" onClick={() => toggleCountry(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${form.preferredCountries.includes(c) ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-900'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interested Courses <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input value={form.interestedCourses} onChange={e => set('interestedCourses', e.target.value)} placeholder="Computer Science, Data Science"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-60">
              {saving ? 'Adding…' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CounselorDashboard() {
  const { user } = useAuth();
  const counselor = user as Counselor;
  const [students, setStudents] = useState<any[]>([]);
  const [showNewStudent, setShowNewStudent] = useState(false);
  const [workNote, setWorkNote] = useState((user as any)?.bio || '');
  const [editingNote, setEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState((user as any)?.bio || '');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    api.students.list().then(all => {
      const mine = all.filter((s: any) => counselor.assignedStudents?.includes(s._id || s.id));
      setStudents(mine);
    }).catch(() => {});
  }, []);

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await api.students.updateMe({ bio: noteInput });
      setWorkNote(noteInput);
      setEditingNote(false);
    } catch { /* ignore */ }
    setSavingNote(false);
  };

  const myStudents = students;
  const allApplications = myStudents.flatMap((s: any) => s.applications || []);

  const stats = {
    totalStudents: myStudents.length,
    activeApplications: allApplications.filter((a: any) => ['submitted', 'under_review'].includes(a.status)).length,
    pendingDocs: myStudents.flatMap((s: any) => s.documents || []).filter((d: any) => d.status === 'pending').length,
    offers: allApplications.filter((a: any) => a.status === 'offer_received').length,
  };

  const recentActivity = [...allApplications.map((a: any) => ({
    type: 'application',
    title: `${myStudents.find((s: any) => s.applications?.some((ap: any) => (ap._id || ap.id) === (a._id || a.id)))?.name} — ${a.universityName}`,
    sub: a.courseName, status: a.status, date: a.updatedDate,
  }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  const appBreakdown = [
    { label: 'Draft', count: allApplications.filter((a: any) => a.status === 'draft').length, color: 'bg-gray-400' },
    { label: 'Submitted', count: allApplications.filter((a: any) => a.status === 'submitted').length, color: 'bg-sky-500' },
    { label: 'Under Review', count: allApplications.filter((a: any) => a.status === 'under_review').length, color: 'bg-yellow-500' },
    { label: 'Offer Received', count: allApplications.filter((a: any) => a.status === 'offer_received').length, color: 'bg-green-500' },
    { label: 'Accepted', count: allApplications.filter((a: any) => a.status === 'accepted').length, color: 'bg-emerald-600' },
    { label: 'Rejected', count: allApplications.filter((a: any) => a.status === 'rejected').length, color: 'bg-red-500' },
  ];

  // Performance score calculation
  const allDocs = myStudents.flatMap((s: any) => s.documents || []);
  const verifiedDocs = allDocs.filter((d: any) => d.status === 'verified').length;
  const acceptedApps = allApplications.filter((a: any) => ['accepted', 'enrolled'].includes(a.status)).length;
  const submittedApps = allApplications.filter((a: any) => a.status !== 'draft').length;

  const offerRate = submittedApps > 0 ? (stats.offers + acceptedApps) / submittedApps : 0;
  const docRate = allDocs.length > 0 ? verifiedDocs / allDocs.length : 0;
  const portfolioRate = Math.min(myStudents.length / 8, 1);

  const performanceScore = Math.min(100, Math.round(offerRate * 45 + docRate * 30 + portfolioRate * 25));

  const perfTier = performanceScore >= 80
    ? { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50 border-green-200', bar: 'bg-green-500', ring: 'text-green-600' }
    : performanceScore >= 60
    ? { label: 'Good', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', bar: 'bg-sky-500', ring: 'text-sky-600' }
    : performanceScore >= 40
    ? { label: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', bar: 'bg-yellow-500', ring: 'text-yellow-600' }
    : { label: 'Getting Started', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', bar: 'bg-gray-400', ring: 'text-gray-500' };

  const perfMetrics = [
    { label: 'Offer & Acceptance Rate', value: Math.round(offerRate * 100), bar: 'bg-green-500' },
    { label: 'Document Review Rate', value: Math.round(docRate * 100), bar: 'bg-sky-500' },
    { label: 'Student Portfolio', value: Math.round(portfolioRate * 100), bar: 'bg-purple-500' },
  ];

  const contributions = [
    { label: 'Students Managed', value: myStudents.length, icon: Users, color: 'bg-sky-50 text-sky-700' },
    { label: 'Applications Processed', value: submittedApps, icon: ClipboardList, color: 'bg-purple-50 text-purple-700' },
    { label: 'Documents Verified', value: verifiedDocs, icon: CheckCircle2, color: 'bg-green-50 text-green-700' },
    { label: 'Offers Secured', value: stats.offers, icon: Target, color: 'bg-amber-50 text-amber-700' },
    { label: 'Accepted Students', value: acceptedApps, icon: Award, color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <>
    {showNewStudent && (
      <NewStudentModal
        onClose={() => setShowNewStudent(false)}
        onCreated={newStudent => {
          setStudents(prev => [...prev, newStudent]);
          setShowNewStudent(false);
        }}
      />
    )}
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-900 rounded-2xl p-6 text-white">
        <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
        <h1 className="text-2xl font-bold">{counselor?.name || 'Counselor'}</h1>
        <p className="text-blue-200 mt-1 text-sm capitalize">{counselor?.specialization?.join(' • ')}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'My Students', value: stats.totalStudents, icon: Users },
            { label: 'Active Apps', value: stats.activeApplications, icon: FileText },
            { label: 'Pending Docs', value: stats.pendingDocs, icon: AlertCircle },
            { label: 'Offers Out', value: stats.offers, icon: Star },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
              <s.icon className="w-4 h-4 text-blue-200 mb-1" />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-blue-200">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Application Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {appBreakdown.map(b => (
            <div key={b.label} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 mb-1">{b.count}</div>
              <div className={`inline-block w-2 h-2 rounded-full ${b.color} mr-1.5`}></div>
              <span className="text-xs text-gray-500">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Score + Contributions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Award className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-bold text-gray-900">My Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score */}
          <div className={`rounded-xl border p-5 flex flex-col items-center justify-center text-center ${perfTier.bg}`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Performance Score</p>
            <div className={`text-6xl font-extrabold ${perfTier.color}`}>{performanceScore}</div>
            <div className={`text-sm font-semibold mt-1 ${perfTier.color}`}>{perfTier.label}</div>
            <p className="text-xs text-gray-400 mt-2">Based on offer rate, doc reviews & student load</p>
          </div>
          {/* Metric bars */}
          <div className="space-y-4">
            {perfMetrics.map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{m.label}</span>
                  <span className="font-semibold">{m.value}%</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-sm ${i < Math.round(m.value / 10) ? m.bar : 'bg-gray-100'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contributions */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">My Contributions</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {contributions.map(c => (
              <div key={c.label} className={`rounded-xl p-3 flex flex-col items-center text-center gap-1 ${c.color}`}>
                <c.icon className="w-5 h-5" />
                <div className="text-xl font-bold">{c.value}</div>
                <div className="text-xs font-medium leading-tight">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Work Status Note */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-sky-600" />
            <h2 className="text-base font-bold text-gray-900">My Work Update</h2>
          </div>
          {!editingNote ? (
            <button
              type="button"
              onClick={() => { setNoteInput(workNote); setEditingNote(true); }}
              className="text-xs text-sky-600 font-medium hover:text-sky-700 border border-sky-200 px-3 py-1 rounded-lg hover:bg-sky-50 transition-colors"
            >
              {workNote ? 'Edit' : 'Add Update'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingNote(false)}
                className="text-xs text-gray-500 font-medium border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingNote}
                onClick={handleSaveNote}
                className="text-xs text-white font-medium bg-sky-500 px-3 py-1 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-60"
              >
                {savingNote ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>
        {editingNote ? (
          <textarea
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            rows={3}
            placeholder="Describe what you're currently working on, recent achievements, or notes for your team…"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        ) : (
          <p className={`text-sm ${workNote ? 'text-gray-700' : 'text-gray-400 italic'}`}>
            {workNote || 'No work update yet. Click "Add Update" to describe what you\'re working on.'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">My Students</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowNewStudent(true)}
                className="flex items-center gap-1.5 bg-sky-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-sky-600 transition-colors">
                <Plus className="w-4 h-4" /> New Student
              </button>
              <Link to="/counselor/students" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">Manage <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          </div>
          <div className="space-y-3">
            {myStudents.map((s: any) => (
              <Link key={s._id || s.id} to={`/counselor/students/${s._id || s.id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold flex-shrink-0">{s.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.nationality} • {(s.applications || []).length} application(s)</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={s.status} />
                  {(s.documents || []).some((d: any) => d.status === 'pending') && <span className="text-xs text-yellow-600">Docs pending</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${a.status === 'offer_received' ? 'bg-green-500' : a.status === 'accepted' ? 'bg-emerald-600' : a.status === 'rejected' ? 'bg-red-500' : 'bg-sky-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                  <p className="text-xs text-gray-500 truncate">{a.sub}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'View All Students', icon: Users, to: '/counselor/students', color: 'bg-sky-50 text-blue-700 border-blue-200' },
            { label: 'Open Chat', icon: MessageSquare, to: '/counselor/chat', color: 'bg-sky-50 text-blue-700 border-blue-200' },
            { label: 'Browse Universities', icon: TrendingUp, to: '/counselor/universities', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            { label: 'Search Engine', icon: FileText, to: '/search', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          ].map(action => (
            <Link key={action.label} to={action.to} className={`flex flex-col items-center p-5 rounded-xl border-2 hover:shadow-md transition-all gap-2 ${action.color}`}>
              <action.icon className="w-6 h-6" />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
