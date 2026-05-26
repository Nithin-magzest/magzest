import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, X, Search, GraduationCap, Edit2, ChevronDown, ChevronUp,
  Globe, MapPin, BookOpen, DollarSign, Check, AlertTriangle, RefreshCw, CheckCircle, Sparkles,
} from 'lucide-react';
import { api } from '../../api';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'Netherlands', 'Singapore', 'New Zealand', 'Ireland', 'France',
  'Sweden', 'Switzerland', 'Japan', 'South Korea', 'India',
];
const UNI_TYPES = ['Public', 'Private', 'Research', 'Liberal Arts', 'Technical'];
const LEVELS = ["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate'];
const INTAKES = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];
const CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD', 'NZD'];

function normalId(obj: any) { return (obj?._id || obj?.id)?.toString() ?? ''; }

function Spinner({ white = false }: { white?: boolean }) {
  return <span className={`w-4 h-4 border-2 ${white ? 'border-white/40 border-t-white' : 'border-gray-300 border-t-gray-600'} rounded-full animate-spin inline-block`} />;
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-sky-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-100">
      {label}
      <button type="button" onClick={onRemove} className="text-blue-400 hover:text-blue-700 ml-0.5"><X className="w-3 h-3" /></button>
    </span>
  );
}

// ── Course Modal ──────────────────────────────────────────────────────────────

const PAYMENT_PLANS = ['Annual', 'Semester', 'Monthly'];

const DEFAULT_COURSE = {
  name: '', level: '', duration: '', tuitionFee: '', currency: 'USD',
  department: '', description: '', intake: [] as string[], requirements: [] as string[],
  applicationFee: '', registrationFee: '', scholarshipAvailable: false,
  scholarshipAmount: '', paymentPlan: 'Annual',
};

function CourseModal({ uniId, course, onClose, onSaved }: {
  uniId: string; course?: any; onClose: () => void; onSaved: (uni: any) => void;
}) {
  const editing = !!course;
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
    if (!form.name.trim()) { setError('Course name is required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        tuitionFee: parseFloat(form.tuitionFee) || 0,
        applicationFee: parseFloat(form.applicationFee) || 0,
        registrationFee: parseFloat(form.registrationFee) || 0,
      };
      let updated: any;
      if (editing) {
        updated = await api.admin.updateCourse(uniId, normalId(course), payload);
      } else {
        updated = await api.admin.addCourse(uniId, payload);
      }
      onSaved(updated);
    } catch (err: any) { setError(err.message || 'Failed to save course.'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Course' : 'Add Course'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. MSc Computer Science"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
              <select value={form.level} onChange={e => set('level', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">Select…</option>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
              <input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 2 years"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tuition Fee / year</label>
              <input type="number" min="0" value={form.tuitionFee} onChange={e => set('tuitionFee', e.target.value)} placeholder="e.g. 25000"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {/* Additional fees */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Fee Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Application Fee ({form.currency})</label>
                <input type="number" min="0" value={form.applicationFee} onChange={e => set('applicationFee', e.target.value)} placeholder="e.g. 75"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Registration Fee ({form.currency})</label>
                <input type="number" min="0" value={form.registrationFee} onChange={e => set('registrationFee', e.target.value)} placeholder="e.g. 200"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Plan</label>
              <div className="flex gap-2">
                {PAYMENT_PLANS.map(p => (
                  <button key={p} type="button" onClick={() => set('paymentPlan', p)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${form.paymentPlan === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.scholarshipAvailable} onChange={e => set('scholarshipAvailable', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Scholarship Available</span>
              </label>
              {form.scholarshipAvailable && (
                <input value={form.scholarshipAmount} onChange={e => set('scholarshipAmount', e.target.value)} placeholder="e.g. Up to USD 5,000/year"
                  className="mt-2 w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
            <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. School of Engineering"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Short course description…"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intake Months</label>
            <div className="flex flex-wrap gap-2">
              {INTAKES.map(m => {
                const sel = form.intake.includes(m);
                return (
                  <button key={m} type="button" onClick={() => toggleIntake(m)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${sel ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'}`}>
                    {sel && <Check className="w-3 h-3 inline mr-1" />}{m}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Entry Requirements</label>
            <div className="flex gap-2 mb-2">
              <input value={reqInput} onChange={e => setReqInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addReq(); } }}
                placeholder="e.g. Bachelor's degree with 3.0 GPA"
                className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="button" onClick={addReq} className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-200">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.requirements.map((r: string, i: number) => (
                <Tag key={i} label={r} onRemove={() => set('requirements', form.requirements.filter((_: string, j: number) => j !== i))} />
              ))}
            </div>
          </div>
          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Spinner white />Saving…</> : <><Check className="w-4 h-4" />{editing ? 'Update Course' : 'Add Course'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── University Modal ──────────────────────────────────────────────────────────

const DEFAULT_UNI = {
  name: '', country: '', city: '', ranking: '', type: '', founded: '',
  website: '', logo: '', coverImage: '', description: '', acceptanceRate: '', totalStudents: '',
  internationalStudents: '', rating: '',
  avgUndergrad: '', avgPostgrad: '', avgCurrency: 'USD',
  tags: [] as string[], facilities: [] as string[],
};

function UniversityModal({ uni, onClose, onSaved }: {
  uni?: any; onClose: () => void; onSaved: (u: any) => void;
}) {
  const editing = !!uni;
  const [form, setForm] = useState(editing ? {
    name: uni.name || '', country: uni.country || '', city: uni.city || '',
    ranking: String(uni.ranking || ''), type: uni.type || '', founded: String(uni.founded || ''),
    website: uni.website || '', logo: uni.logo || '', coverImage: uni.coverImage || '', description: uni.description || '',
    acceptanceRate: String(uni.acceptanceRate || ''), totalStudents: String(uni.totalStudents || ''),
    internationalStudents: String(uni.internationalStudents || ''), rating: String(uni.rating || ''),
    avgUndergrad: String(uni.averageFees?.undergraduate || ''),
    avgPostgrad: String(uni.averageFees?.postgraduate || ''),
    avgCurrency: uni.averageFees?.currency || 'USD',
    tags: uni.tags || [], facilities: uni.facilities || [],
  } : { ...DEFAULT_UNI });
  const [tagInput, setTagInput] = useState('');
  const [facInput, setFacInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [autofillMsg, setAutofillMsg] = useState('');
  const [error, setError] = useState('');

  const handleAutofill = async () => {
    if (!form.name.trim()) { setError('Enter a university name first.'); return; }
    setAutofilling(true); setAutofillMsg(''); setError('');
    try {
      const data = await api.universities.autofill(form.name.trim());
      setForm(f => ({
        ...f,
        country: data.country || f.country,
        city: data.city || f.city,
        type: data.type || f.type,
        founded: data.founded || f.founded,
        website: data.website || f.website,
        logo: data.logo || data.logoFallback || f.logo,
        coverImage: data.coverImage || f.coverImage,
        description: data.description || f.description,
        avgCurrency: data.avgCurrency || f.avgCurrency,
      }));
      const filled = [data.country, data.city, data.type, data.founded, data.coverImage, data.logo || data.logoFallback].filter(Boolean).length;
      setAutofillMsg(filled >= 3 ? 'Details filled! Review and complete remaining fields.' : 'Partial info found — fill remaining fields manually.');
    } catch {
      setError('Could not fetch details. Please fill in manually.');
    }
    setAutofilling(false);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const addTag = () => { if (tagInput.trim()) { set('tags', [...form.tags, tagInput.trim()]); setTagInput(''); } };
  const addFac = () => { if (facInput.trim()) { set('facilities', [...form.facilities, facInput.trim()]); setFacInput(''); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.country) { setError('Name and country are required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        name: form.name.trim(), country: form.country, city: form.city.trim(),
        ranking: parseInt(form.ranking) || undefined, type: form.type, founded: parseInt(form.founded) || undefined,
        website: form.website.trim(), logo: form.logo.trim(), coverImage: form.coverImage.trim(),
        description: form.description.trim(),
        acceptanceRate: parseFloat(form.acceptanceRate) || undefined,
        totalStudents: parseInt(form.totalStudents) || undefined,
        internationalStudents: parseInt(form.internationalStudents) || undefined,
        rating: parseFloat(form.rating) || undefined,
        averageFees: { undergraduate: parseFloat(form.avgUndergrad) || 0, postgraduate: parseFloat(form.avgPostgrad) || 0, currency: form.avgCurrency },
        tags: form.tags, facilities: form.facilities,
      };
      const saved = editing
        ? await api.admin.updateUniversity(normalId(uni), payload)
        : await api.admin.createUniversity(payload);
      onSaved(saved);
    } catch (err: any) { setError(err.message || 'Failed to save university.'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit University' : 'Add University'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic info */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Basic Information</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">University Name <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. University of Oxford"
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={handleAutofill} disabled={autofilling}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap">
                    {autofilling ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Fetching…</> : <><Sparkles className="w-3.5 h-3.5" />Auto-fill</>}
                  </button>
                </div>
                {autofillMsg && <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1"><Check className="w-3 h-3" />{autofillMsg}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country <span className="text-red-500">*</span></label>
                  <select value={form.country} onChange={e => set('country', e.target.value)} title="Country"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select country…</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Toronto"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">World Ranking</label>
                  <input type="number" min="1" value={form.ranking} onChange={e => set('ranking', e.target.value)} placeholder="e.g. 25"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)} title="University type"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select…</option>
                    {UNI_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Founded</label>
                  <input type="number" min="1000" max="2025" value={form.founded} onChange={e => set('founded', e.target.value)} placeholder="e.g. 1827"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://www.university.edu"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Logo & Cover Image — auto-filled or manually entered */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
                  <input value={form.logo} onChange={e => set('logo', e.target.value)} placeholder="Auto-filled by Auto-fill"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image URL</label>
                  <input value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="Auto-filled by Auto-fill"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Live preview of logo + cover image */}
              {(form.logo || form.coverImage || form.website) && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <div className="relative h-32 bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
                    {form.coverImage && (
                      <img src={form.coverImage} alt="cover" className="w-full h-full object-cover opacity-80"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {(form.logo || form.website) && (
                      <div className="absolute top-3 left-3 w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center p-1.5 overflow-hidden">
                        <UniLogoImg name={form.name} logo={form.logo} website={form.website} />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 text-white text-sm font-semibold drop-shadow">{form.name || 'University Name'}</div>
                  </div>
                  <p className="text-xs text-gray-400 text-center py-1.5 bg-gray-50">Preview of university card header</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Brief university description…"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Statistics</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Acceptance Rate (%)', key: 'acceptanceRate', placeholder: 'e.g. 45' },
                { label: 'Rating (out of 5)', key: 'rating', placeholder: 'e.g. 4.5' },
                { label: 'Total Students', key: 'totalStudents', placeholder: 'e.g. 50000' },
                { label: 'International Students', key: 'internationalStudents', placeholder: 'e.g. 15000' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input type="number" step="any" value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Fees */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Average Fees per Year</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Undergraduate</label>
                <input type="number" min="0" value={form.avgUndergrad} onChange={e => set('avgUndergrad', e.target.value)} placeholder="e.g. 20000"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Postgraduate</label>
                <input type="number" min="0" value={form.avgPostgrad} onChange={e => set('avgPostgrad', e.target.value)} placeholder="e.g. 25000"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                <select value={form.avgCurrency} onChange={e => set('avgCurrency', e.target.value)} title="Currency"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tags</p>
            <div className="flex gap-2 mb-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="e.g. Scholarship Available"
                className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-sky-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((t: string, i: number) => (
                <Tag key={i} label={t} onRemove={() => set('tags', form.tags.filter((_: string, j: number) => j !== i))} />
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Facilities</p>
            <div className="flex gap-2 mb-2">
              <input value={facInput} onChange={e => setFacInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFac(); } }}
                placeholder="e.g. Library, Sports Complex"
                className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={addFac} className="px-3 py-2 bg-sky-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.facilities.map((f: string, i: number) => (
                <Tag key={i} label={f} onRemove={() => set('facilities', form.facilities.filter((_: string, j: number) => j !== i))} />
              ))}
            </div>
          </div>

          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-[#0d1b4b] text-white rounded-xl text-sm font-semibold hover:bg-[#152258] disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Spinner white />Saving…</> : <><Check className="w-4 h-4" />{editing ? 'Update University' : 'Add University'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── University Row (expandable) ───────────────────────────────────────────────

function UniLogoImg({ name, logo, website }: { name: string; logo?: string; website?: string }) {
  const initial = logo ? 'logo' : website ? 'favicon' : 'letter';
  const [stage, setStage] = useState<'logo' | 'favicon' | 'letter'>(initial as any);

  if (stage === 'letter') {
    return (
      <span className="w-full h-full bg-[#0d1b4b] flex items-center justify-center text-white font-bold text-xl rounded-lg leading-none">
        {name?.charAt(0) || '?'}
      </span>
    );
  }

  const src = stage === 'logo'
    ? logo!
    : `https://www.google.com/s2/favicons?domain=${website}&sz=256`;

  return (
    <img
      src={src}
      alt={name}
      className="w-full h-full object-contain"
      onError={() => {
        if (stage === 'logo' && website) setStage('favicon');
        else setStage('letter');
      }}
    />
  );
}

function UniversityRow({ uni, onEdit, onDelete, onUniUpdated, onApply }: {
  uni: any; onEdit: (u: any) => void; onDelete: (id: string) => void; onUniUpdated: (u: any) => void;
  onApply: (course: any, universityName: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const mongoId = normalId(uni);

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Delete this course?')) return;
    setDeletingCourseId(courseId);
    try {
      const updated = await api.admin.deleteCourse(mongoId, courseId);
      onUniUpdated(updated);
    } catch { alert('Failed to delete course.'); }
    setDeletingCourseId(null);
  };

  return (
    <>
      {(addingCourse || editingCourse) && (
        <CourseModal
          uniId={mongoId}
          course={editingCourse}
          onClose={() => { setAddingCourse(false); setEditingCourse(null); }}
          onSaved={updated => { onUniUpdated(updated); setAddingCourse(false); setEditingCourse(null); }}
        />
      )}
      <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* University header row */}
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0">
            <UniLogoImg name={uni.name} logo={uni.logo} website={uni.website} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">{uni.name}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Globe className="w-3 h-3" />{uni.country}</span>
              {uni.city && <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{uni.city}</span>}
              {uni.ranking && <span className="text-xs font-semibold text-blue-600">#{uni.ranking} World</span>}
              {uni.type && <span className="text-xs text-gray-400">{uni.type}</span>}
            </div>
            <div className="flex flex-wrap gap-x-3 mt-1">
              {uni.averageFees?.postgraduate > 0 && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />{uni.averageFees.currency} {Number(uni.averageFees.postgraduate).toLocaleString()}/yr PG
                </span>
              )}
              <span className="text-xs text-indigo-600 flex items-center gap-1"><BookOpen className="w-3 h-3" />{uni.courses?.length || 0} courses</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={() => onEdit(uni)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-sky-50 border border-blue-200 hover:bg-blue-100 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />Edit
            </button>
            <button type="button" onClick={() => onDelete(mongoId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />Delete
            </button>
            <button type="button" onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Courses
            </button>
          </div>
        </div>

        {/* Courses panel */}
        {expanded && (
          <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Courses ({uni.courses?.length || 0})</p>
              <button type="button" onClick={() => setAddingCourse(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors">
                <Plus className="w-3.5 h-3.5" />Add Course
              </button>
            </div>
            {(!uni.courses || uni.courses.length === 0) ? (
              <div className="text-center py-6 text-gray-400">
                <BookOpen className="w-6 h-6 mx-auto mb-1 opacity-40" />
                <p className="text-xs">No courses yet. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {uni.courses.map((c: any) => {
                  const cId = normalId(c);
                  return (
                    <div key={cId} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          {c.level && <span className="text-xs text-gray-500">{c.level}</span>}
                          {c.duration && <span className="text-xs text-gray-500">{c.duration}</span>}
                          {c.department && <span className="text-xs text-gray-400">{c.department}</span>}
                        </div>
                        {/* Fee details row */}
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                          {c.tuitionFee > 0 && (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                              <DollarSign className="w-3 h-3" />Tuition: {c.currency || 'USD'} {Number(c.tuitionFee).toLocaleString()}/yr
                            </span>
                          )}
                          {c.applicationFee > 0 && (
                            <span className="text-xs text-gray-500">App Fee: {c.currency || 'USD'} {Number(c.applicationFee).toLocaleString()}</span>
                          )}
                          {c.registrationFee > 0 && (
                            <span className="text-xs text-gray-500">Reg Fee: {c.currency || 'USD'} {Number(c.registrationFee).toLocaleString()}</span>
                          )}
                          {c.paymentPlan && <span className="text-xs text-indigo-600">{c.paymentPlan} billing</span>}
                          {c.scholarshipAvailable && (
                            <span className="text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded-full">
                              {c.scholarshipAmount ? `Scholarship: ${c.scholarshipAmount}` : 'Scholarship Available'}
                            </span>
                          )}
                        </div>
                        {c.intake?.length > 0 && (
                          <p className="text-xs text-indigo-600 mt-0.5">Intake: {c.intake.join(', ')}</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button type="button" onClick={() => onApply(c, uni.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors">
                          <Plus className="w-3 h-3" />Apply
                        </button>
                        <button type="button" onClick={() => setEditingCourse(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                          <Edit2 className="w-3 h-3" />Edit
                        </button>
                        <button type="button" onClick={() => handleDeleteCourse(cId)} disabled={deletingCourseId === cId}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                          {deletingCourseId === cId ? <Spinner /> : <Trash2 className="w-3 h-3" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ── Apply Modal ───────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  "Bachelor's": 'bg-blue-100 text-blue-700',
  "Master's": 'bg-purple-100 text-purple-700',
  'PhD': 'bg-red-100 text-red-700',
  'Diploma': 'bg-green-100 text-green-700',
  'Certificate': 'bg-yellow-100 text-yellow-700',
};

function ApplyModal({ course, universityName, students, onClose, onApplied }: {
  course: any; universityName: string;
  students: any[]; onClose: () => void; onApplied: () => void;
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
        universityName,
        courseName: course.name,
        intake,
        courseId: (course._id || course.id || '').toString(),
      });
      setSuccess(true);
      setTimeout(() => { onApplied(); onClose(); }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create application.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-base font-bold text-gray-900">Apply for Course</h2>
            <p className="text-sm font-semibold text-blue-700 mt-0.5 truncate">{course.name}</p>
            <p className="text-xs text-gray-500 truncate">{universityName}</p>
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
          {course.tuitionFee > 0 && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {course.currency || 'USD'} {Number(course.tuitionFee).toLocaleString()}/yr
            </span>
          )}
          {course.duration && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{course.duration}</span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Student <span className="text-red-500">*</span></label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)}
              aria-label="Select student"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">— Choose a student —</option>
              {students.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>

          {course.intake?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Intake</label>
              <select value={intake} onChange={e => setIntake(e.target.value)}
                aria-label="Select intake"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
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
              className="flex-1 py-2.5 bg-[#0d1b4b] hover:bg-[#152258] text-white rounded-xl text-sm font-semibold shadow-sm disabled:opacity-60 transition-all flex items-center justify-center gap-2">
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminUniversities() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingUni, setEditingUni] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [applyTarget, setApplyTarget] = useState<{ course: any; universityName: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setLoadError('');
    try { setUniversities(await api.admin.universities()); }
    catch (err: any) { setLoadError(err.message || 'Failed to load universities.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.admin.students().then(setStudents).catch(() => {}); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this university and all its courses? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.admin.deleteUniversity(id);
      setUniversities(prev => prev.filter(u => normalId(u) !== id));
    } catch { alert('Failed to delete university.'); }
    setDeletingId(null);
  };

  const handleSaved = (saved: any) => {
    setUniversities(prev => {
      const idx = prev.findIndex(u => normalId(u) === normalId(saved));
      return idx >= 0 ? prev.map((u, i) => i === idx ? saved : u) : [...prev, saved];
    });
    setShowAdd(false);
    setEditingUni(null);
  };

  const countries = [...new Set(universities.map(u => u.country).filter(Boolean))].sort();
  const filtered = universities.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.name?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q) || u.country?.toLowerCase().includes(q);
    const matchC = !countryFilter || u.country === countryFilter;
    return matchQ && matchC;
  });

  return (
    <>
      {(showAdd || editingUni) && (
        <UniversityModal uni={editingUni} onClose={() => { setShowAdd(false); setEditingUni(null); }} onSaved={handleSaved} />
      )}
      {applyTarget && (
        <ApplyModal
          course={applyTarget.course}
          universityName={applyTarget.universityName}
          students={students}
          onClose={() => setApplyTarget(null)}
          onApplied={() => setApplyTarget(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Admin Portal</p>
                <h1 className="text-2xl font-bold leading-tight">Universities</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={load} disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
              </button>
              <button type="button" onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-sky-50 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />Add University
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Universities', value: universities.length },
              { label: 'Total Courses', value: universities.reduce((s, u) => s + (u.courses?.length || 0), 0) },
              { label: 'Countries', value: countries.length },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{loading ? '…' : s.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {loadError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Failed to load universities</p>
              <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
            </div>
            <button type="button" onClick={load} className="text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg">Retry</button>
          </div>
        )}

        {/* Search + filter */}
        {!loading && (
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search universities…"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
            </div>
            <select aria-label="Filter by country" value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-w-[160px]">
              <option value="">All Countries</option>
              {countries.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}

        {loading && !loadError && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 flex items-center justify-center gap-3 text-gray-400 shadow-sm">
            <Spinner />Loading universities…
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center text-gray-400 shadow-sm">
                <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{search || countryFilter ? 'No universities match your filters.' : 'No universities yet. Add one above.'}</p>
              </div>
            ) : filtered.map(uni => (
              <UniversityRow
                key={normalId(uni)}
                uni={uni}
                onEdit={u => setEditingUni(u)}
                onDelete={handleDelete}
                onUniUpdated={handleSaved}
                onApply={(course, universityName) => setApplyTarget({ course, universityName })}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
