import { useState } from 'react';
import {
  Plus, Trash2, X, Search, Edit2, ChevronDown, ChevronUp,
  Check, DollarSign, Clock, FileCheck2, CreditCard, RefreshCw,
} from 'lucide-react';

/* ── Local persistence ─────────────────────────────────────────────────────── */

const LS_KEY = 'mgz_admin_countries_v1';

function lsLoad(): any[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [...SEED];
  } catch { return [...SEED]; }
}

function lsSave(list: any[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

/* ── Seed data ─────────────────────────────────────────────────────────────── */

const SEED: any[] = [
  {
    id: 'us', name: 'United States', flag: '🇺🇸', code: 'US',
    capital: 'Washington D.C.', region: 'North America', currency: 'USD', language: 'English',
    visa: {
      type: 'F-1 Student Visa', processingTime: '3–8 weeks', cost: 'USD 160',
      validity: 'Duration of course + 60 days',
      documents: ['DS-160 Form', 'SEVIS I-20 Form', 'Bank statements (3 months)', 'Academic transcripts', 'TOEFL/IELTS scores', 'Passport (6 months validity)', 'Visa photos'],
      notes: 'OPT (Optional Practical Training) work authorization available for 12–36 months post-graduation. CPT allowed during studies.',
    },
    passport: { minValidity: '6 months beyond intended stay', notes: 'Indian passport holders must obtain F-1 visa before travel. No visa-on-arrival.' },
    costs: { monthlyLivingMin: 800, monthlyLivingMax: 2500, currency: 'USD', applicationFee: 'USD 50–100 per university', tuitionRange: 'USD 15,000–60,000 / year' },
    popular: ['Computer Science', 'MBA', 'Engineering', 'Data Science', 'Medicine'],
  },
  {
    id: 'uk', name: 'United Kingdom', flag: '🇬🇧', code: 'GB',
    capital: 'London', region: 'Europe', currency: 'GBP', language: 'English',
    visa: {
      type: 'Student Visa (formerly Tier 4)', processingTime: '3 weeks', cost: 'GBP 363',
      validity: 'Duration of course + 4 months',
      documents: ['CAS (Confirmation of Acceptance for Studies)', 'Bank statements (28 days)', 'Academic transcripts', 'IELTS scores (6.0+)', 'TB test results (Indian nationals)', 'Passport', 'Visa photos'],
      notes: 'Graduate Route visa allows 2 years post-study work (3 for PhD). IHS payment of GBP 776/year is mandatory.',
    },
    passport: { minValidity: '6 months from travel date', notes: 'TB test mandatory for Indian nationals. IHS (Immigration Health Surcharge) must be paid upfront.' },
    costs: { monthlyLivingMin: 900, monthlyLivingMax: 2000, currency: 'GBP', applicationFee: 'GBP 20–100 (via UCAS)', tuitionRange: 'GBP 10,000–38,000 / year' },
    popular: ['Business & MBA', 'Law', 'Engineering', 'Computer Science', 'Medicine'],
  },
  {
    id: 'ca', name: 'Canada', flag: '🇨🇦', code: 'CA',
    capital: 'Ottawa', region: 'North America', currency: 'CAD', language: 'English / French',
    visa: {
      type: 'Study Permit', processingTime: '4–12 weeks', cost: 'CAD 150',
      validity: 'Duration of program + 90 days',
      documents: ['Acceptance letter from DLI', 'Proof of funds (CAD 10,000+)', 'Passport', 'Statement of purpose', 'Biometrics enrollment', 'IELTS/TOEFL scores'],
      notes: 'PGWP (Post-Graduate Work Permit) up to 3 years available. Express Entry immigration pathway after graduation.',
    },
    passport: { minValidity: 'Valid for entire stay', notes: 'Biometrics enrollment required at a VAC. Medical exam may be required based on country of residence.' },
    costs: { monthlyLivingMin: 700, monthlyLivingMax: 2000, currency: 'CAD', applicationFee: 'CAD 50–200 per university', tuitionRange: 'CAD 15,000–40,000 / year' },
    popular: ['Computer Science', 'Engineering', 'Business', 'Data Science', 'Nursing'],
  },
  {
    id: 'au', name: 'Australia', flag: '🇦🇺', code: 'AU',
    capital: 'Canberra', region: 'Oceania', currency: 'AUD', language: 'English',
    visa: {
      type: 'Student Visa (Subclass 500)', processingTime: '1–4 months', cost: 'AUD 650',
      validity: 'Duration of course + 1 month',
      documents: ['CoE (Confirmation of Enrolment)', 'OSHC (health cover)', 'Proof of funds', 'IELTS 6.0+ scores', 'GTE statement', 'Passport', 'Police clearance'],
      notes: 'Temporary Graduate visa (subclass 485) available post-graduation. Can work 48 hours per fortnight during studies.',
    },
    passport: { minValidity: '6 months beyond intended stay', notes: 'Health exam may be required. Overseas Student Health Cover (OSHC) is mandatory for duration of stay.' },
    costs: { monthlyLivingMin: 1000, monthlyLivingMax: 2500, currency: 'AUD', applicationFee: 'AUD 0–100 per university', tuitionRange: 'AUD 20,000–45,000 / year' },
    popular: ['Engineering', 'Business', 'Medicine', 'IT', 'Hospitality'],
  },
  {
    id: 'de', name: 'Germany', flag: '🇩🇪', code: 'DE',
    capital: 'Berlin', region: 'Europe', currency: 'EUR', language: 'German / English',
    visa: {
      type: 'National Visa (D) – Student', processingTime: '6–12 weeks', cost: 'EUR 75',
      validity: 'Up to 90 days (converted to residence permit on arrival)',
      documents: ['University admission letter', 'Blocked account (EUR 11,208/year)', 'Academic transcripts', 'German/English proficiency', 'Health insurance', 'Passport', 'Motivationsschreiben (SOP)'],
      notes: 'Most public universities charge NO tuition (only semester fees ~EUR 150–350). 18-month job-seeker visa available after graduation.',
    },
    passport: { minValidity: '3 months beyond stay', notes: 'Blocked account (Sperrkonto) is mandatory. Apply at German embassy/consulate in India.' },
    costs: { monthlyLivingMin: 700, monthlyLivingMax: 1200, currency: 'EUR', applicationFee: 'EUR 0–75 per university', tuitionRange: 'EUR 0 (public) – 20,000 (private) / year' },
    popular: ['Engineering', 'Computer Science', 'Automotive', 'Physics', 'MBA'],
  },
  {
    id: 'sg', name: 'Singapore', flag: '🇸🇬', code: 'SG',
    capital: 'Singapore', region: 'Southeast Asia', currency: 'SGD', language: 'English',
    visa: {
      type: "Student's Pass (STP)", processingTime: '4–8 weeks', cost: 'SGD 30 (IPA) + SGD 60 (card)',
      validity: 'Duration of course',
      documents: ['IPA (In-Principle Approval) letter', 'SOLAR online registration', 'Passport', 'Academic transcripts', 'Medical examination', 'Passport photos'],
      notes: 'Administered through ICA SOLAR system. Government scholarships (MOE Tuition Grant) available for eligible students.',
    },
    passport: { minValidity: '6 months from date of STP application', notes: 'Medical examination required. Must register with ICA within 30 days of arrival.' },
    costs: { monthlyLivingMin: 1200, monthlyLivingMax: 3000, currency: 'SGD', applicationFee: 'SGD 0–100 per university', tuitionRange: 'SGD 17,000–45,000 / year' },
    popular: ['Business', 'Finance', 'Engineering', 'Computing', 'Science'],
  },
  {
    id: 'nl', name: 'Netherlands', flag: '🇳🇱', code: 'NL',
    capital: 'Amsterdam', region: 'Europe', currency: 'EUR', language: 'Dutch / English',
    visa: {
      type: 'MVV + Residence Permit (for non-EU)', processingTime: '2–4 weeks (MVV)', cost: 'EUR 207',
      validity: 'Duration of study',
      documents: ['Admission letter', 'Proof of funds (EUR 863/month)', 'Health insurance', 'Passport', 'Apostilled documents', 'Notarized diploma'],
      notes: 'Orientation Year (Zoekjaar) permit — 1 year after graduation to find work. Many programs fully in English.',
    },
    passport: { minValidity: '6 months beyond duration of stay', notes: 'University often arranges MVV application on behalf of student.' },
    costs: { monthlyLivingMin: 900, monthlyLivingMax: 1500, currency: 'EUR', applicationFee: 'EUR 0–75 per university', tuitionRange: 'EUR 8,000–20,000 / year' },
    popular: ['Engineering', 'Business', 'Design', 'Agriculture', 'Psychology'],
  },
  {
    id: 'nz', name: 'New Zealand', flag: '🇳🇿', code: 'NZ',
    capital: 'Wellington', region: 'Oceania', currency: 'NZD', language: 'English',
    visa: {
      type: 'Student Visa', processingTime: '1–3 months', cost: 'NZD 375',
      validity: 'Duration of course',
      documents: ['Offer of place from NZ institution', 'Proof of funds (NZD 15,000/year)', 'Return ticket', 'Health certificate', 'IELTS 5.5+ scores', 'Passport'],
      notes: 'Post-study work visa available for 1–3 years. Can work 20 hours/week during studies. Police clearance from India required.',
    },
    passport: { minValidity: '3 months beyond intended stay', notes: 'Medical and chest X-ray required if staying 12+ months.' },
    costs: { monthlyLivingMin: 900, monthlyLivingMax: 2000, currency: 'NZD', applicationFee: 'NZD 0–100 per university', tuitionRange: 'NZD 22,000–35,000 / year' },
    popular: ['Agriculture', 'Engineering', 'Business', 'IT', 'Healthcare'],
  },
];

/* ── Shared UI primitives ──────────────────────────────────────────────────── */

function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-sky-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-100">
      {label}
      <button type="button" onClick={onRemove} className="text-blue-400 hover:text-blue-700 ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function Spinner({ white = false }: { white?: boolean }) {
  return (
    <span className={`w-4 h-4 border-2 ${white ? 'border-white/40 border-t-white' : 'border-gray-300 border-t-gray-600'} rounded-full animate-spin inline-block`} />
  );
}

/* ── Form constants ────────────────────────────────────────────────────────── */

const REGIONS = ['North America', 'Europe', 'Asia', 'Southeast Asia', 'Oceania', 'Middle East', 'Africa', 'South America'];
const CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD', 'NZD', 'JPY', 'CHF', 'DKK', 'SEK', 'INR'];

const DEFAULT_FORM = {
  name: '', flag: '', code: '', capital: '', region: '', currency: 'USD', language: '',
  visaType: '', processingTime: '', visaCost: '', visaValidity: '',
  visaDocs: [] as string[], visaNotes: '',
  passportMinValidity: '', passportNotes: '',
  monthlyLivingMin: '', monthlyLivingMax: '', livingCurrency: 'USD',
  applicationFee: '', tuitionRange: '',
  popular: [] as string[],
};

function toForm(c: any) {
  return {
    name: c.name || '', flag: c.flag || '', code: c.code || '',
    capital: c.capital || '', region: c.region || '', currency: c.currency || 'USD', language: c.language || '',
    visaType: c.visa?.type || '', processingTime: c.visa?.processingTime || '',
    visaCost: c.visa?.cost || '', visaValidity: c.visa?.validity || '',
    visaDocs: Array.isArray(c.visa?.documents) ? [...c.visa.documents] : [],
    visaNotes: c.visa?.notes || '',
    passportMinValidity: c.passport?.minValidity || '', passportNotes: c.passport?.notes || '',
    monthlyLivingMin: String(c.costs?.monthlyLivingMin || ''),
    monthlyLivingMax: String(c.costs?.monthlyLivingMax || ''),
    livingCurrency: c.costs?.currency || 'USD',
    applicationFee: c.costs?.applicationFee || '', tuitionRange: c.costs?.tuitionRange || '',
    popular: Array.isArray(c.popular) ? [...c.popular] : [],
  };
}

/* ── Country modal ─────────────────────────────────────────────────────────── */

function CountryModal({ country, onClose, onSaved }: {
  country?: any; onClose: () => void; onSaved: (c: any) => void;
}) {
  const editing = !!country;
  const [form, setForm] = useState(editing ? toForm(country) : { ...DEFAULT_FORM });
  const [docInput, setDocInput] = useState('');
  const [popularInput, setPopularInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const addDoc = () => {
    if (docInput.trim()) { set('visaDocs', [...form.visaDocs, docInput.trim()]); setDocInput(''); }
  };
  const addPop = () => {
    if (popularInput.trim()) { set('popular', [...form.popular, popularInput.trim()]); setPopularInput(''); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Country name is required.'); return; }
    setSaving(true);
    const data = {
      ...(editing ? { id: country.id || country._id } : { id: uid() }),
      name: form.name.trim(), flag: form.flag.trim() || '🌍',
      code: form.code.toUpperCase().trim().slice(0, 3),
      capital: form.capital.trim(), region: form.region,
      currency: form.currency, language: form.language.trim(),
      visa: {
        type: form.visaType.trim(), processingTime: form.processingTime.trim(),
        cost: form.visaCost.trim(), validity: form.visaValidity.trim(),
        documents: form.visaDocs, notes: form.visaNotes.trim(),
      },
      passport: { minValidity: form.passportMinValidity.trim(), notes: form.passportNotes.trim() },
      costs: {
        monthlyLivingMin: parseInt(form.monthlyLivingMin) || 0,
        monthlyLivingMax: parseInt(form.monthlyLivingMax) || 0,
        currency: form.livingCurrency,
        applicationFee: form.applicationFee.trim(),
        tuitionRange: form.tuitionRange.trim(),
      },
      popular: form.popular,
    };
    onSaved(data);
    setSaving(false);
  };

  const inp = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400';
  const sel = `${inp} bg-white text-gray-700`;
  const SL = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 pb-1">{children}</p>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-lg leading-none">🌍</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Country' : 'Add Country'}</h2>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">

          {/* ── Basic Info ── */}
          <SL>Basic Information</SL>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Flag Emoji</label>
              <input value={form.flag} onChange={e => set('flag', e.target.value)} placeholder="🇮🇳" className={inp} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. United Kingdom" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Code</label>
              <input value={form.code} onChange={e => set('code', e.target.value)} placeholder="GB" maxLength={3} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Capital City</label>
              <input value={form.capital} onChange={e => set('capital', e.target.value)} placeholder="e.g. London" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
              <select value={form.region} onChange={e => set('region', e.target.value)} className={sel}>
                <option value="">Select…</option>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)} className={sel}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Language(s)</label>
              <input value={form.language} onChange={e => set('language', e.target.value)} placeholder="e.g. English / French" className={inp} />
            </div>
          </div>

          {/* ── Student Visa ── */}
          <SL>Student Visa Details</SL>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Visa Type / Name</label>
              <input value={form.visaType} onChange={e => set('visaType', e.target.value)} placeholder="e.g. F-1 Student Visa" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Processing Time</label>
              <input value={form.processingTime} onChange={e => set('processingTime', e.target.value)} placeholder="e.g. 3–8 weeks" className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Application Cost</label>
              <input value={form.visaCost} onChange={e => set('visaCost', e.target.value)} placeholder="e.g. USD 160" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Visa Validity</label>
              <input value={form.visaValidity} onChange={e => set('visaValidity', e.target.value)} placeholder="e.g. Duration of course + 60 days" className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Required Documents</label>
            <div className="flex gap-2 mb-2">
              <input value={docInput} onChange={e => setDocInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDoc(); } }}
                placeholder="e.g. Bank statements (3 months)"
                className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={addDoc}
                className="px-3 py-2 bg-sky-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.visaDocs.map((d: string, i: number) => (
                <TagChip key={i} label={d} onRemove={() => set('visaDocs', form.visaDocs.filter((_: string, j: number) => j !== i))} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Visa Notes & Special Rules</label>
            <textarea value={form.visaNotes} onChange={e => set('visaNotes', e.target.value)} rows={2}
              placeholder="e.g. OPT work authorization available for 12–36 months post-graduation…"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-400" />
          </div>

          {/* ── Passport ── */}
          <SL>Passport Requirements</SL>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Passport Validity Required</label>
            <input value={form.passportMinValidity} onChange={e => set('passportMinValidity', e.target.value)}
              placeholder="e.g. 6 months beyond intended stay" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Passport Notes & Special Requirements</label>
            <textarea value={form.passportNotes} onChange={e => set('passportNotes', e.target.value)} rows={2}
              placeholder="e.g. TB test required for Indian nationals. IHS payment required…"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-400" />
          </div>

          {/* ── Costs & Fees ── */}
          <SL>Costs & Fees</SL>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Living Min</label>
              <input type="number" min="0" value={form.monthlyLivingMin} onChange={e => set('monthlyLivingMin', e.target.value)} placeholder="e.g. 800" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Living Max</label>
              <input type="number" min="0" value={form.monthlyLivingMax} onChange={e => set('monthlyLivingMax', e.target.value)} placeholder="e.g. 2500" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select value={form.livingCurrency} onChange={e => set('livingCurrency', e.target.value)} className={sel}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">University Application Fee</label>
              <input value={form.applicationFee} onChange={e => set('applicationFee', e.target.value)} placeholder="e.g. USD 50–100 per university" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tuition Range</label>
              <input value={form.tuitionRange} onChange={e => set('tuitionRange', e.target.value)} placeholder="e.g. USD 15,000–60,000 / year" className={inp} />
            </div>
          </div>

          {/* ── Popular Programs ── */}
          <SL>Popular Programs</SL>
          <div>
            <div className="flex gap-2 mb-2">
              <input value={popularInput} onChange={e => setPopularInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPop(); } }}
                placeholder="e.g. Computer Science"
                className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={addPop}
                className="px-3 py-2 bg-sky-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.popular.map((p: string, i: number) => (
                <TagChip key={i} label={p} onRemove={() => set('popular', form.popular.filter((_: string, j: number) => j !== i))} />
              ))}
            </div>
          </div>

          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
              {saving ? <><Spinner white />Saving…</> : <><Check className="w-4 h-4" />{editing ? 'Update Country' : 'Add Country'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Expandable country row ────────────────────────────────────────────────── */

function CountryRow({ country, onEdit, onDelete }: {
  country: any; onEdit: (c: any) => void; onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = (country.id || country._id)?.toString() ?? '';

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="text-4xl flex-shrink-0 select-none">{country.flag || '🌍'}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{country.name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            {country.capital && <span className="text-xs text-gray-500">🏛 {country.capital}</span>}
            {country.region && <span className="text-xs text-gray-500">📍 {country.region}</span>}
            {country.currency && <span className="text-xs text-gray-400">{country.currency}</span>}
            {country.language && <span className="text-xs text-gray-400">{country.language}</span>}
          </div>
          <div className="flex flex-wrap gap-x-4 mt-1">
            {country.visa?.type && (
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <FileCheck2 className="w-3 h-3" /> {country.visa.type}
              </span>
            )}
            {country.visa?.processingTime && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {country.visa.processingTime}
              </span>
            )}
            {country.costs?.tuitionRange && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> {country.costs.tuitionRange}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button type="button" onClick={() => onEdit(country)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-sky-50 border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button type="button" onClick={() => onDelete(id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 active:scale-95 transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <button type="button" onClick={() => setExpanded(v => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 active:scale-95 transition-all">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Visa column */}
          <div>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" /> Student Visa
            </p>
            <div className="space-y-1.5 text-xs">
              {country.visa?.type && <p><span className="text-gray-400">Type:</span> <span className="font-semibold text-gray-800">{country.visa.type}</span></p>}
              {country.visa?.processingTime && <p><span className="text-gray-400">Processing:</span> <span className="font-medium text-gray-700">{country.visa.processingTime}</span></p>}
              {country.visa?.cost && <p><span className="text-gray-400">Cost:</span> <span className="font-medium text-gray-700">{country.visa.cost}</span></p>}
              {country.visa?.validity && <p><span className="text-gray-400">Validity:</span> <span className="font-medium text-gray-700">{country.visa.validity}</span></p>}
              {country.visa?.documents?.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-400 font-medium mb-1">Required Documents:</p>
                  <ul className="space-y-1">
                    {country.visa.documents.map((d: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {country.visa?.notes && (
                <p className="mt-2 text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-2 leading-relaxed">
                  {country.visa.notes}
                </p>
              )}
            </div>
          </div>

          {/* Passport column */}
          <div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Passport Requirements
            </p>
            <div className="space-y-1.5 text-xs">
              {country.passport?.minValidity && (
                <p>
                  <span className="text-gray-400">Min Validity:</span>{' '}
                  <span className="font-semibold text-gray-800">{country.passport.minValidity}</span>
                </p>
              )}
              {country.passport?.notes && (
                <p className="mt-2 text-purple-800 bg-purple-50 border border-purple-100 rounded-lg px-2.5 py-2 leading-relaxed">
                  {country.passport.notes}
                </p>
              )}
            </div>
            {country.popular?.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Popular Programs</p>
                <div className="flex flex-wrap gap-1.5">
                  {country.popular.map((p: string, i: number) => (
                    <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-medium">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Costs column */}
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Costs & Fees
            </p>
            <div className="space-y-1.5 text-xs">
              {(country.costs?.monthlyLivingMin || country.costs?.monthlyLivingMax) && (
                <p>
                  <span className="text-gray-400">Monthly Living:</span>{' '}
                  <span className="font-semibold text-gray-800">
                    {country.costs.currency} {Number(country.costs.monthlyLivingMin).toLocaleString()}–{Number(country.costs.monthlyLivingMax).toLocaleString()} / month
                  </span>
                </p>
              )}
              {country.costs?.applicationFee && (
                <p>
                  <span className="text-gray-400">Application Fee:</span>{' '}
                  <span className="font-medium text-gray-700">{country.costs.applicationFee}</span>
                </p>
              )}
              {country.costs?.tuitionRange && (
                <p>
                  <span className="text-gray-400">Tuition Range:</span>{' '}
                  <span className="font-semibold text-emerald-700">{country.costs.tuitionRange}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────────── */

export default function AdminCountries() {
  const [countries, setCountries] = useState<any[]>(() => lsLoad());
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any>(null);

  const handleSaved = (saved: any) => {
    const id = (saved.id || saved._id)?.toString();
    setCountries(prev => {
      const idx = prev.findIndex(c => (c.id || c._id)?.toString() === id);
      const next = idx >= 0 ? prev.map((c, i) => i === idx ? saved : c) : [...prev, saved];
      lsSave(next);
      return next;
    });
    setShowAdd(false);
    setEditingCountry(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this country? This cannot be undone.')) return;
    setCountries(prev => {
      const next = prev.filter(c => (c.id || c._id)?.toString() !== id);
      lsSave(next);
      return next;
    });
  };

  const handleRefresh = () => {
    setCountries(lsLoad());
  };

  const regions = [...new Set(countries.map(c => c.region).filter(Boolean))].sort();

  const filtered = countries.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name?.toLowerCase().includes(q) || c.capital?.toLowerCase().includes(q) || c.region?.toLowerCase().includes(q);
    const matchR = !regionFilter || c.region === regionFilter;
    return matchQ && matchR;
  });

  const withVisaCount = countries.filter(c => c.visa?.type).length;
  const regionCount = new Set(countries.map(c => c.region).filter(Boolean)).size;

  return (
    <>
      {(showAdd || editingCountry) && (
        <CountryModal
          country={editingCountry}
          onClose={() => { setShowAdd(false); setEditingCountry(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl leading-none">🌍</span>
              </div>
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Admin Portal</p>
                <h1 className="text-2xl font-bold leading-tight">Countries, Visa &amp; Passport</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
                title="Refresh country list">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button type="button" onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-sky-50 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Add Country
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Countries', value: countries.length },
              { label: 'With Visa Info', value: withVisaCount },
              { label: 'Regions Covered', value: regionCount },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search countries, capitals or regions…"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
          <select aria-label="Filter by region" value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-w-[160px] text-gray-700">
            <option value="">All Regions</option>
            {regions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Country list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center text-gray-400 shadow-sm">
            <span className="text-5xl block text-center mb-2 opacity-40">🌍</span>
            <p className="text-sm font-medium">{search || regionFilter ? 'No countries match your filters.' : 'No countries yet. Add one above.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <CountryRow
                key={(c.id || c._id)?.toString()}
                country={c}
                onEdit={c => setEditingCountry(c)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
