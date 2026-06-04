import { useState, useEffect } from 'react';
import {
  Plus, Trash2, X, Search, BookOpen, Edit2, DollarSign, Check, Award,
  Calendar, GraduationCap, CheckCircle, ChevronRight,
} from 'lucide-react';
import { api } from '../../api';

const LEVELS = ["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate'];
const CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD', 'NZD'];
const INTAKES = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];
const PAYMENT_PLANS = ['Annual', 'Semester', 'Monthly'];

const LEVEL_COLORS: Record<string, string> = {
  "Bachelor's": 'bg-blue-100 text-blue-700',
  "Master's": 'bg-purple-100 text-purple-700',
  'PhD': 'bg-red-100 text-red-700',
  'Diploma': 'bg-green-100 text-green-700',
  'Certificate': 'bg-yellow-100 text-yellow-700',
};

function normalId(obj: any) { return (obj?._id || obj?.id)?.toString() ?? ''; }

function Spinner({ white = false }: { white?: boolean }) {
  return <span className={`w-4 h-4 border-2 ${white ? 'border-white/40 border-t-white' : 'border-gray-300 border-t-gray-600'} rounded-full animate-spin inline-block`} />;
}

const DEFAULT_COURSE = {
  name: '', level: '', duration: '', tuitionFee: '', currency: 'USD',
  department: '', description: '', intake: [] as string[], requirements: [] as string[],
  applicationFee: '', registrationFee: '', scholarshipAvailable: false,
  scholarshipAmount: '', paymentPlan: 'Annual',
};

function ApplyModal({ course, students, onClose }: {
  course: { name: string; _uniId: string; _uniName: string; intake?: string[]; tuitionFee?: number; currency?: string; level?: string };
  students: any[];
  onClose: () => void;
}) {
  const [studentId, setStudentId] = useState('');
  const [intake, setIntake] = useState(course.intake?.[0] || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleApply = async () => {
    if (!studentId) { setError('Please select a student.'); return; }
    setSaving(true); setError('');
    try {
      await api.admin.createApplication({
        studentId,
        universityId: course._uniId,
        universityName: course._uniName,
        courseName: course.name,
        intake,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create application.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-base font-bold text-gray-900">Apply for Course</h2>
            <p className="text-sm font-semibold text-blue-700 mt-0.5 truncate">{course.name}</p>
            <p className="text-xs text-gray-500 truncate">{course._uniName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4 flex flex-wrap gap-2">
          {course.level && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLORS[course.level] || 'bg-gray-100 text-gray-700'}`}>
              {course.level}
            </span>
          )}
          {course.tuitionFee && course.tuitionFee > 0 && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {course.currency || 'USD'} {Number(course.tuitionFee).toLocaleString()}/yr
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Student <span className="text-red-500">*</span></label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} aria-label="Select student"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
              <option value="">— Choose a student —</option>
              {students.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>

          {course.intake && course.intake.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Intake</label>
              <select value={intake} onChange={e => setIntake(e.target.value)} aria-label="Select intake"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                {course.intake.map((i: string) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">{error}</p>}

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2.5 rounded-xl">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />Application created successfully!
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleApply} disabled={saving || success}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-sm disabled:opacity-60 transition-all flex items-center justify-center gap-2">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Applying…</>
                : <><Plus className="w-4 h-4" />Apply</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseModal({ universities, uniId: initialUniId, course, onClose, onSaved }: {
  universities: any[]; uniId?: string; course?: any; onClose: () => void; onSaved: () => void;
}) {
  const editing = !!course;
  const [uniId, setUniId] = useState(initialUniId || '');
  const [form, setForm] = useState(editing ? {
    name: course.name || '', level: course.level || '', duration: course.duration || '',
    tuitionFee: String(course.tuitionFee || ''), currency: course.currency || 'USD',
    department: course.department || '', description: course.description || '',
    intake: course.intake || [], requirements: course.requirements || [],
    applicationFee: String(course.applicationFee || ''), registrationFee: String(course.registrationFee || ''),
    scholarshipAvailable: course.scholarshipAvailable || false,
    scholarshipAmount: course.scholarshipAmount || '', paymentPlan: course.paymentPlan || 'Annual',
  } : { ...DEFAULT_COURSE });
  const [reqInput, setReqInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleIntake = (m: string) => set('intake', form.intake.includes(m) ? form.intake.filter((x: string) => x !== m) : [...form.intake, m]);
  const addReq = () => { if (reqInput.trim()) { set('requirements', [...form.requirements, reqInput.trim()]); setReqInput(''); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniId) { setError('Please select a university.'); return; }
    if (!form.name.trim()) { setError('Course name is required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        tuitionFee: parseFloat(form.tuitionFee) || 0,
        applicationFee: parseFloat(form.applicationFee) || 0,
        registrationFee: parseFloat(form.registrationFee) || 0,
      };
      if (editing) {
        await api.admin.updateCourse(uniId, normalId(course), payload);
      } else {
        await api.admin.addCourse(uniId, payload);
      }
      onSaved();
    } catch (err: any) { setError(err.message || 'Failed to save course.'); }
    setSaving(false);
  };

  const inp = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Course' : 'Add Course'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">University <span className="text-red-500">*</span></label>
              <select value={uniId} onChange={e => setUniId(e.target.value)} className={`${inp} bg-white`}>
                <option value="">Select university…</option>
                {universities.map(u => <option key={normalId(u)} value={normalId(u)}>{u.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. MSc Computer Science" className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
              <select value={form.level} onChange={e => set('level', e.target.value)} className={`${inp} bg-white`}>
                <option value="">Select…</option>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
              <input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 2 years" className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tuition Fee / year</label>
              <input type="number" min="0" value={form.tuitionFee} onChange={e => set('tuitionFee', e.target.value)} placeholder="e.g. 25000" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)} className={`${inp} bg-white`}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Application Fee</label>
              <input type="number" min="0" value={form.applicationFee} onChange={e => set('applicationFee', e.target.value)} placeholder="e.g. 75" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Registration Fee</label>
              <input type="number" min="0" value={form.registrationFee} onChange={e => set('registrationFee', e.target.value)} placeholder="e.g. 200" className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Plan</label>
            <div className="flex gap-2">
              {PAYMENT_PLANS.map(p => (
                <button key={p} type="button" onClick={() => set('paymentPlan', p)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${form.paymentPlan === p ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
            <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. School of Engineering" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              placeholder="Brief course description…"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Intake Months</label>
            <div className="flex flex-wrap gap-1.5">
              {INTAKES.map(m => (
                <button key={m} type="button" onClick={() => toggleIntake(m)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${form.intake.includes(m) ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'}`}>
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Entry Requirements</label>
            <div className="flex gap-2 mb-2">
              <input value={reqInput} onChange={e => setReqInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addReq(); } }}
                placeholder="e.g. IELTS 6.5+" className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <button type="button" onClick={addReq} className="px-3 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-100">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.requirements.map((r: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full border border-purple-100">
                  {r}
                  <button type="button" onClick={() => set('requirements', form.requirements.filter((_: string, j: number) => j !== i))} aria-label={`Remove ${r}`} className="text-purple-400 hover:text-purple-700 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.scholarshipAvailable} onChange={e => set('scholarshipAvailable', e.target.checked)} className="w-4 h-4 accent-purple-600 rounded" />
              <span className="text-sm font-medium text-gray-700">Scholarship Available</span>
            </label>
            {form.scholarshipAvailable && (
              <input value={form.scholarshipAmount} onChange={e => set('scholarshipAmount', e.target.value)} placeholder="e.g. Up to USD 5,000/year"
                className="mt-2 w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            )}
          </div>

          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Spinner white />{editing ? 'Saving…' : 'Adding…'}</> : <><Check className="w-4 h-4" />{editing ? 'Update Course' : 'Add Course'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UniLogoImg({ name, website }: { name: string; website?: string }) {
  const [err, setErr] = useState(false);
  if (!website || err) {
    return (
      <span className="w-full h-full bg-[#0d1b4b] flex items-center justify-center text-white font-bold text-base rounded-lg leading-none">
        {name?.charAt(0) || '?'}
      </span>
    );
  }
  return (
    <img
      src={`/api/favicon/${website.replace(/^https?:\/\/(?:www\.)?/, '').split('/')[0]}`}
      alt={name}
      className="w-full h-full object-contain"
      onError={() => setErr(true)}
    />
  );
}

function CourseDetailModal({ course, onClose, onEdit, onDelete, onApply }: {
  course: any; onClose: () => void;
  onEdit: () => void; onDelete: () => void; onApply: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-start gap-4 p-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0 bg-white">
            <UniLogoImg name={course._uniName} website={course.website} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {course.level && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[course.level] || 'bg-gray-100 text-gray-700'}`}>{course.level}</span>
              )}
              {course.scholarshipAvailable && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"><Award className="w-3 h-3" />Scholarship</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{course.name}</h2>
            <p className="text-sm text-purple-600 mt-0.5 font-medium flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />{course._uniName}
            </p>
            {course.department && <p className="text-xs text-gray-400 mt-0.5">{course.department}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {course.tuitionFee > 0 && (
              <div className="bg-emerald-50 rounded-xl p-3.5">
                <p className="text-xs text-gray-500 mb-0.5">Tuition Fee</p>
                <p className="font-bold text-emerald-700 text-base flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />{course.currency} {Number(course.tuitionFee).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">per year · {course.paymentPlan || 'Annual'}</p>
              </div>
            )}
            {course.duration && (
              <div className="bg-sky-50 rounded-xl p-3.5">
                <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                <p className="font-bold text-sky-700 text-base flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{course.duration}</p>
              </div>
            )}
          </div>

          {course.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">About This Course</p>
              <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
            </div>
          )}

          {course.intake?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Intake Months</p>
              <div className="flex flex-wrap gap-1.5">
                {course.intake.map((m: string) => (
                  <span key={m} className="text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100 font-medium">{m}</span>
                ))}
              </div>
            </div>
          )}

          {course.requirements?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Entry Requirements</p>
              <div className="flex flex-wrap gap-1.5">
                {course.requirements.map((req: string) => (
                  <span key={req} className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-100">
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />{req}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(course.applicationFee > 0 || course.registrationFee > 0) && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 grid grid-cols-2 gap-3">
              {course.applicationFee > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Application Fee</p>
                  <p className="text-sm font-semibold text-gray-800">{course.currency} {Number(course.applicationFee).toLocaleString()}</p>
                </div>
              )}
              {course.registrationFee > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Registration Fee</p>
                  <p className="text-sm font-semibold text-gray-800">{course.currency} {Number(course.registrationFee).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {course.scholarshipAvailable && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Scholarship Available</p>
                {course.scholarshipAmount && <p className="text-sm text-amber-700 mt-0.5">{course.scholarshipAmount}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button type="button" onClick={() => { onApply(); onClose(); }}
            className="flex-1 py-2.5 bg-[#0d1b4b] hover:bg-[#152258] text-white rounded-xl text-sm font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-colors">
            <Plus className="w-4 h-4" />Apply
          </button>
          <button type="button" onClick={() => { onEdit(); onClose(); }}
            className="flex-1 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors">
            <Edit2 className="w-4 h-4" />Edit
          </button>
          <button type="button" onClick={() => { onDelete(); onClose(); }}
            className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors">
            <Trash2 className="w-4 h-4" />Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, onClick }: { course: any; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="text-left w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-purple-200 transition-all group cursor-pointer flex flex-col min-h-[160px]">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
          <UniLogoImg name={course._uniName} website={course.website} />
        </div>
        {course.level && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${LEVEL_COLORS[course.level] || 'bg-gray-100 text-gray-700'}`}>
            {course.level}
          </span>
        )}
      </div>
      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-purple-700 transition-colors">{course.name}</h3>
      <p className="text-xs text-purple-600 truncate mb-0.5 font-medium flex items-center gap-1">
        <GraduationCap className="w-3 h-3 flex-shrink-0" />{course._uniName}
      </p>
      {course.department && <p className="text-xs text-gray-400 truncate">{course.department}</p>}
      <div className="mt-auto pt-3 flex items-center justify-between">
        {course.tuitionFee > 0 ? (
          <p className="text-xs font-bold text-emerald-600">{course.currency} {Number(course.tuitionFee).toLocaleString()}<span className="font-normal text-gray-400">/yr</span></p>
        ) : (
          course.scholarshipAvailable ? (
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-1"><Award className="w-3 h-3" />Scholarship</span>
          ) : <span />
        )}
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}

export default function AdminCourses() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [uniFilter, setUniFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<{ course: any; uniId: string } | null>(null);
  const [applyModal, setApplyModal] = useState<any | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const fetchUniversities = () => {
    setLoading(true);
    api.universities.list()
      .then(setUniversities)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUniversities();
    api.admin.students().then(setStudents).catch(() => {});
  }, []);

  const allCourses = universities.flatMap(uni =>
    (uni.courses || []).map((c: any) => ({
      ...c,
      _uniId: normalId(uni),
      _uniName: uni.name,
      website: uni.website,
    }))
  );

  const filtered = allCourses.filter(c => {
    const q = query.toLowerCase();
    const matchQ = !query || c.name?.toLowerCase().includes(q) || c._uniName?.toLowerCase().includes(q) || c.department?.toLowerCase().includes(q);
    const matchLevel = !levelFilter || c.level === levelFilter;
    const matchUni = !uniFilter || c._uniId === uniFilter;
    return matchQ && matchLevel && matchUni;
  });

  const handleDelete = async (uniId: string, courseId: string) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await api.admin.deleteCourse(uniId, courseId);
      fetchUniversities();
    } catch { alert('Failed to delete course.'); }
  };

  const totalCourses = allCourses.length;
  const withScholarship = allCourses.filter(c => c.scholarshipAvailable).length;
  const uniNames = universities.map(u => ({ id: normalId(u), name: u.name }));

  return (
    <>
      {showAdd && (
        <CourseModal
          universities={universities}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchUniversities(); }}
        />
      )}
      {editing && (
        <CourseModal
          universities={universities}
          uniId={editing.uniId}
          course={editing.course}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); fetchUniversities(); }}
        />
      )}
      {applyModal && (
        <ApplyModal
          course={applyModal}
          students={students}
          onClose={() => setApplyModal(null)}
        />
      )}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEdit={() => setEditing({ course: selectedCourse, uniId: selectedCourse._uniId })}
          onDelete={() => handleDelete(selectedCourse._uniId, normalId(selectedCourse))}
          onApply={() => setApplyModal(selectedCourse)}
        />
      )}

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">Admin Portal</p>
                <h1 className="text-2xl font-bold leading-tight">Courses Management</h1>
              </div>
            </div>
            <button type="button" onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Add Course
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Courses', value: totalCourses },
              { label: 'Universities', value: universities.length },
              { label: 'With Scholarship', value: withScholarship },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search courses, universities, departments…"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm" />
          </div>
          <select aria-label="Filter by level" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm text-gray-700">
            <option value="">All Levels</option>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select aria-label="Filter by university" value={uniFilter} onChange={e => setUniFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm text-gray-700 max-w-[220px]">
            <option value="">All Universities</option>
            {uniNames.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center text-gray-400 shadow-sm">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">
              {query || levelFilter || uniFilter ? 'No courses match your filters.' : 'No courses yet. Add courses via universities or use the button above.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(c => (
              <CourseCard
                key={`${c._uniId}-${normalId(c)}`}
                course={c}
                onClick={() => setSelectedCourse(c)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
