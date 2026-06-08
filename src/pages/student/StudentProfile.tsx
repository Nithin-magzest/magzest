import { useEffect, useRef, useState } from 'react';
import { User, GraduationCap, BookOpen, Upload, Edit3, Save, X, FileText, Trash2, ExternalLink, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Student } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const EDUCATION_LEVELS = ['10th Grade', '12th Grade / Intermediate', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'];
type AcademicEntry = { id: string; level: string; customLevel: string; institution: string; board: string; year: string; percentage: string; city: string; comment: string; status: string; yearOfStudying: string; yearOfPassing: string; backlogs: string; attempts: string; };
function newAcademicEntry(): AcademicEntry { return { id: crypto.randomUUID(), level: '10th Grade', customLevel: '', institution: '', board: '', year: '', percentage: '', city: '', comment: '', status: '', yearOfStudying: '', yearOfPassing: '', backlogs: '', attempts: '' }; }
const BACHELOR_LEVELS = ["Bachelor's Degree", "Master's Degree"];

const EXP_TYPES = ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Volunteer'];
type ExperienceEntry = { id: string; company: string; role: string; employmentType: string; from: string; to: string; current: boolean; noticePeriod: string; description: string; };
function newExperienceEntry(): ExperienceEntry { return { id: crypto.randomUUID(), company: '', role: '', employmentType: 'Full-time', from: '', to: '', current: false, noticePeriod: '', description: '' }; }

const DOC_TYPES = ['Passport', 'Transcript', 'Diploma/Degree Certificate', 'English Test Certificate', 'SOP', 'LOR', 'CV/Resume', 'Bank Statement', 'Other'];
const ALL_COUNTRIES = ['Australia', 'Canada', 'France', 'Germany', 'Ireland', 'Netherlands', 'New Zealand', 'Singapore', 'United Kingdom', 'United States', 'Other'];
const ALL_COURSES = ['Arts & Humanities', 'Business', 'Computer Science', 'Data Science', 'Engineering', 'Finance', 'Law', 'Medicine', 'MBA', 'Pharmacy', 'Psychology', 'Other'];

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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Upload Document</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* File drop zone */}
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
                <p className="text-sm text-gray-500">Click to choose a file from your folder</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, Word, JPG, PNG — max 10 MB</p>
              </>
            )}
          </div>

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
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-[#0d1b4b] text-white rounded-xl text-sm font-medium hover:bg-[#152258] transition-colors disabled:opacity-60">
              {saving ? 'Uploading…' : 'Upload'}
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
  const [academicEntries, setAcademicEntries] = useState<AcademicEntry[]>(
    (student?.academicDetails || []).map((e: any) => ({ status: '', yearOfStudying: '', yearOfPassing: '', backlogs: '', attempts: '', ...e, id: e.id || crypto.randomUUID() }))
  );
  const addAcademicEntry = () => setAcademicEntries(prev => [...prev, newAcademicEntry()]);
  const updateAcademicEntry = (id: string, field: keyof Omit<AcademicEntry, 'id'>, value: string) =>
    setAcademicEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  const removeAcademicEntry = (id: string) => setAcademicEntries(prev => prev.filter(e => e.id !== id));

  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>(
    (student?.experienceDetails || []).map((e: any) => ({ employmentType: 'Full-time', noticePeriod: '', ...e, id: e.id || crypto.randomUUID(), current: !!e.current }))
  );
  const addExperienceEntry = () => setExperienceEntries(prev => [...prev, newExperienceEntry()]);
  const updateExperienceEntry = (id: string, field: keyof Omit<ExperienceEntry, 'id'>, value: string | boolean) =>
    setExperienceEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  const removeExperienceEntry = (id: string) => setExperienceEntries(prev => prev.filter(e => e.id !== id));

  const [resumeUploading, setResumeUploading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const uploadResume = async (file: File) => {
    setResumeUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', file.name.replace(/\.[^.]+$/, ''));
      fd.append('type', 'CV/Resume');
      await api.students.uploadDocument(fd);
      await refreshUser();
    } catch {}
    setResumeUploading(false);
  };

  const buildForm = (s: Student | null) => {
    const np = (s?.name || '').split(' ');
    return {
      firstName: s?.firstName || np[0] || '',
      lastName: s?.lastName || np.slice(1).join(' ') || '',
      phone: s?.phone || '',
      nationality: s?.nationality || '',
      dateOfBirth: s?.dateOfBirth || '',
      gender: s?.gender || '',
      maritalStatus: s?.maritalStatus || '',
      placeOfBirth: s?.placeOfBirth || '',
      passport: {
        number: s?.passport?.number || '',
        issueDate: s?.passport?.issueDate || '',
        expiryDate: s?.passport?.expiryDate || '',
        issuingCountry: s?.passport?.issuingCountry || '',
      },
      address: {
        street: s?.address?.street || '',
        city: s?.address?.city || '',
        state: s?.address?.state || '',
        country: s?.address?.country || '',
        postalCode: s?.address?.postalCode || '',
      },
      educationLevel: s?.educationLevel || '',
      gpa: s?.gpa ?? '',
      englishTestType: s?.englishScore?.type || '',
      englishTestScore: s?.englishScore?.score ?? '',
      budget: s?.budget ?? '',
      preferredCountries: (s?.preferredCountries || []) as string[],
      interestedCourses: (s?.interestedCourses || []) as string[],
    };
  };

  const [form, setForm] = useState(() => buildForm(student));

  // Re-initialize form and lists from server data after save + refreshUser
  useEffect(() => {
    if (!editing) {
      const s = user as Student;
      setForm(buildForm(s));
      setAcademicEntries(
        (s?.academicDetails || []).map((e: any) => ({ status: '', yearOfStudying: '', yearOfPassing: '', backlogs: '', attempts: '', ...e, id: e.id || crypto.randomUUID() }))
      );
      setExperienceEntries(
        (s?.experienceDetails || []).map((e: any) => ({ employmentType: 'Full-time', noticePeriod: '', ...e, id: e.id || crypto.randomUUID(), current: !!e.current }))
      );
    }
  }, [user, editing]);

  if (!student) return null;

  const docs = student.documents || [];
  const apps = student.applications || [];

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
  const scoreColor = completion === 100 ? 'text-green-500' : completion >= 67 ? 'text-blue-400' : completion >= 34 ? 'text-amber-300' : 'text-red-300';
  const barColor = completion === 100 ? 'bg-green-400' : completion >= 67 ? 'bg-blue-300' : completion >= 34 ? 'bg-amber-300' : 'bg-red-300';
  const progressFillClass = `progress-fill-${filledCount}`;

  const save = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await api.students.updateMe({
        name: [form.firstName, form.lastName].filter(Boolean).join(' '),
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        nationality: form.nationality,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        maritalStatus: form.maritalStatus || undefined,
        placeOfBirth: form.placeOfBirth || undefined,
        passport: form.passport.number ? form.passport : undefined,
        address: form.address.city ? form.address : undefined,
        educationLevel: form.educationLevel || undefined,
        gpa: form.gpa !== '' ? Number(form.gpa) : undefined,
        englishScore: form.englishTestType ? { type: form.englishTestType, score: Number(form.englishTestScore) } : undefined,
        budget: form.budget !== '' ? Number(form.budget) : undefined,
        preferredCountries: form.preferredCountries,
        interestedCourses: form.interestedCourses,
        academicDetails: academicEntries.map(({ id, ...rest }) => rest),
        experienceDetails: experienceEntries.map(({ id, ...rest }) => rest),
      });
      await refreshUser();
      setEditing(false);
    } catch (e: any) {
      setSaveError(e.message || 'Failed to save. Please try again.');
    }
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
        <div className="flex flex-col items-end gap-1">
          <button type="button" onClick={editing ? save : () => { setEditing(true); setSaveError(''); }} disabled={saving}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${editing ? 'bg-green-600 text-white' : 'bg-[#0d1b4b] text-white'}`}>
            {editing ? <><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
          </button>
          {saveError && <p className="text-xs text-red-600 font-medium">{saveError}</p>}
        </div>
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
          <div className="text-center">
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
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                {editing ? (
                  <input aria-label="First Name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <p className="text-gray-900 font-medium">{student.firstName || student.name.split(' ')[0] || '—'}</p>
                )}
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                {editing ? (
                  <input aria-label="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <p className="text-gray-900 font-medium">{student.lastName || student.name.split(' ').slice(1).join(' ') || '—'}</p>
                )}
              </div>
              {([
                { label: 'Phone', key: 'phone' },
                { label: 'Nationality', key: 'nationality' },
              ] as { label: string; key: 'phone' | 'nationality' }[]).map(field => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{field.label}</label>
                  {editing ? (
                    <input aria-label={field.label} value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-900 font-medium">{student[field.key] || '—'}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                <p className="text-gray-900 font-medium">{student.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Date of Birth</label>
                {editing ? (
                  <input type="date" aria-label="Date of Birth" value={form.dateOfBirth}
                    onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Gender</label>
                {editing ? (
                  <select aria-label="Gender" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                ) : <p className="text-gray-900 font-medium">{student.gender || '—'}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Marital Status</label>
                {editing ? (
                  <select aria-label="Marital Status" value={form.maritalStatus} onChange={e => setForm(f => ({ ...f, maritalStatus: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                ) : <p className="text-gray-900 font-medium">{student.maritalStatus || '—'}</p>}
              </div>
            </div>
          </div>

          {/* Passport Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Passport Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Place of Birth */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Place of Birth</label>
                {editing ? (
                  <input
                    aria-label="Place of Birth"
                    value={form.placeOfBirth}
                    onChange={e => setForm(f => ({ ...f, placeOfBirth: e.target.value }))}
                    placeholder="City, Country"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{student.placeOfBirth || '—'}</p>
                )}
              </div>
              {([
                { label: 'Passport Number', key: 'number', type: 'text' },
                { label: 'Issuing Country', key: 'issuingCountry', type: 'text' },
                { label: 'Issue Date', key: 'issueDate', type: 'date' },
                { label: 'Expiry Date', key: 'expiryDate', type: 'date' },
              ] as { label: string; key: keyof typeof form.passport; type: string }[]).map(field => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{field.label}</label>
                  {editing ? (
                    <input type={field.type} aria-label={field.label} value={form.passport[field.key]}
                      onChange={e => setForm(f => ({ ...f, passport: { ...f.passport, [field.key]: e.target.value } }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-900 font-medium">{student.passport?.[field.key] || '—'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Street Address</label>
                {editing ? (
                  <input aria-label="Street Address" value={form.address.street}
                    onChange={e => setForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : <p className="text-gray-900 font-medium">{student.address?.street || '—'}</p>}
              </div>
              {([
                { label: 'City', key: 'city' },
                { label: 'State / Province', key: 'state' },
                { label: 'Country', key: 'country' },
                { label: 'Postal Code', key: 'postalCode' },
              ] as { label: string; key: keyof typeof form.address }[]).map(field => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{field.label}</label>
                  {editing ? (
                    <input aria-label={field.label} value={form.address[field.key]}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, [field.key]: e.target.value } }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : <p className="text-gray-900 font-medium">{student.address?.[field.key] || '—'}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-600" /> Academic Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Highest Education Level</label>
                {editing ? (
                  <select aria-label="Education level" value={form.educationLevel} onChange={e => setForm(f => ({ ...f, educationLevel: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select education level</option>
                    <option>10th Grade (Completed)</option>
                    <option>12th Grade (Completed)</option>
                    <option>Diploma (Completed)</option>
                    <option>Bachelor's (In Progress)</option>
                    <option>Bachelor's (Completed)</option>
                    <option>Master's (In Progress)</option>
                    <option>Master's (Completed)</option>
                    <option>PhD (In Progress)</option>
                    <option>PhD (Completed)</option>
                    <option>Other</option>
                  </select>
                ) : <p className="text-gray-900 font-medium">{student.educationLevel || '—'}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Overall GPA / Percentage</label>
                {editing ? (
                  <input type="number" aria-label="GPA" value={form.gpa} step={0.1} max={10}
                    onChange={e => setForm(f => ({ ...f, gpa: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : <p className="text-gray-900 font-medium">{student.gpa ? `${student.gpa}/10` : '—'}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">English Test</label>
                {editing ? (
                  <div className="flex gap-2">
                    <select aria-label="English test type" value={form.englishTestType} onChange={e => setForm(f => ({ ...f, englishTestType: e.target.value as 'IELTS' | 'TOEFL' | 'PTE' }))}
                      className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">Select test</option>
                      <option>IELTS</option>
                      <option>TOEFL</option>
                      <option>PTE</option>
                      <option>Duolingo</option>
                      <option>Other</option>
                    </select>
                    <input type="number" aria-label="English test score" value={form.englishTestScore} step={0.5}
                      onChange={e => setForm(f => ({ ...f, englishTestScore: e.target.value }))}
                      placeholder="Score" className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ) : <p className="text-gray-900 font-medium">{student.englishScore ? `${student.englishScore.type}: ${student.englishScore.score}` : '—'}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Annual Budget (USD)</label>
                {editing ? (
                  <input type="number" aria-label="Annual budget" value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    placeholder="e.g. 30000" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : <p className="text-gray-900 font-medium">${(student.budget || 0).toLocaleString()}</p>}
              </div>
            </div>

            {/* Academic History */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" /> Academic History
                </h4>
                {editing && (
                  <button type="button" onClick={addAcademicEntry}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Academic Entry
                  </button>
                )}
              </div>

              {academicEntries.length === 0 ? (
                <div className="text-center py-6">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                  {editing
                    ? <p className="text-sm text-gray-400">Click "Add Academic Entry" to add your 10th, 12th, Degree details one by one</p>
                    : <p className="text-sm text-gray-400">No academic history added yet</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  {editing ? (
                    academicEntries.map((entry, idx) => (
                      <div key={entry.id} className="border border-blue-100 bg-blue-50/40 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">Education {idx + 1}</span>
                          <button type="button" aria-label="Remove entry" onClick={() => removeAcademicEntry(entry.id)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Education Level</label>
                            <select aria-label="Education Level" value={entry.level} onChange={e => updateAcademicEntry(entry.id, 'level', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                              {EDUCATION_LEVELS.map(l => <option key={l}>{l}</option>)}
                            </select>
                          </div>
                          {entry.level === 'Other' && (
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-gray-500 mb-1">Specify Class / Level Name</label>
                              <input aria-label="Custom Level Name" value={entry.customLevel}
                                placeholder="e.g. ITI, Certificate Course, Vocational Training…"
                                onChange={e => updateAcademicEntry(entry.id, 'customLevel', e.target.value)}
                                className="w-full px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                          )}
                          {BACHELOR_LEVELS.includes(entry.level) && (
                            <>
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Current Status</label>
                                <div className="flex gap-3">
                                  {['Pursuing', 'Passed Out'].map(opt => (
                                    <button key={opt} type="button"
                                      onClick={() => updateAcademicEntry(entry.id, 'status', opt)}
                                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${entry.status === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {entry.status === 'Pursuing' && (
                                <>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Year of Studying</label>
                                    <select aria-label="Year of Studying" value={entry.yearOfStudying}
                                      onChange={e => updateAcademicEntry(entry.id, 'yearOfStudying', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                      <option value="">Select year</option>
                                      <option>1st Year</option>
                                      <option>2nd Year</option>
                                      <option>3rd Year</option>
                                      <option>4th Year</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Expected Year of Passing</label>
                                    <input aria-label="Expected Year of Passing" value={entry.yearOfPassing}
                                      placeholder="e.g. 2026"
                                      onChange={e => updateAcademicEntry(entry.id, 'yearOfPassing', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Number of Backlogs</label>
                                    <input type="number" min={0} aria-label="Number of Backlogs" value={entry.backlogs}
                                      placeholder="e.g. 0"
                                      onChange={e => updateAcademicEntry(entry.id, 'backlogs', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Number of Attempts</label>
                                    <input type="number" min={1} aria-label="Number of Attempts" value={entry.attempts}
                                      placeholder="e.g. 1"
                                      onChange={e => updateAcademicEntry(entry.id, 'attempts', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Institution Name</label>
                            <input aria-label="Institution Name" value={entry.institution} placeholder="e.g. St. Joseph's High School"
                              onChange={e => updateAcademicEntry(entry.id, 'institution', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Board / University</label>
                            <input aria-label="Board or University" value={entry.board} placeholder="e.g. CBSE, Anna University"
                              onChange={e => updateAcademicEntry(entry.id, 'board', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Year of Passing</label>
                            <input aria-label="Year of Passing" value={entry.year} placeholder="e.g. 2022"
                              onChange={e => updateAcademicEntry(entry.id, 'year', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Percentage / GPA</label>
                            <input aria-label="Percentage or GPA" value={entry.percentage} placeholder="e.g. 85% or 8.5 CGPA"
                              onChange={e => updateAcademicEntry(entry.id, 'percentage', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                            <input aria-label="City" value={entry.city} placeholder="e.g. Chennai"
                              onChange={e => updateAcademicEntry(entry.id, 'city', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Additional Comments</label>
                            <textarea aria-label="Additional Comments" value={entry.comment} rows={2}
                              placeholder="e.g. Science stream with Computer Science, Distinction in Mathematics…"
                              onChange={e => updateAcademicEntry(entry.id, 'comment', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    academicEntries.map(entry => (
                      <div key={entry.id} className="border border-gray-100 bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5">
                            {entry.level === 'Other' && entry.customLevel ? entry.customLevel : entry.level}
                          </span>
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                            {entry.institution && <div><p className="text-xs text-gray-400">Institution</p><p className="font-medium text-gray-800">{entry.institution}</p></div>}
                            {entry.board && <div><p className="text-xs text-gray-400">{entry.level === "Bachelor's Degree" || entry.level === "Master's Degree" || entry.level === 'PhD' || entry.level === 'Diploma' ? 'University' : 'Board'}</p><p className="font-medium text-gray-800">{entry.board}</p></div>}
                            {entry.year && <div><p className="text-xs text-gray-400">Year</p><p className="font-medium text-gray-800">{entry.year}</p></div>}
                            {entry.percentage && <div><p className="text-xs text-gray-400">Score</p><p className="font-medium text-gray-800">{entry.percentage}</p></div>}
                            {entry.city && <div><p className="text-xs text-gray-400">City</p><p className="font-medium text-gray-800">{entry.city}</p></div>}
                            {BACHELOR_LEVELS.includes(entry.level) && entry.status && <div><p className="text-xs text-gray-400">Status</p><p className="font-medium text-gray-800">{entry.status}</p></div>}
                            {entry.status === 'Pursuing' && entry.yearOfStudying && <div><p className="text-xs text-gray-400">Year of Studying</p><p className="font-medium text-gray-800">{entry.yearOfStudying}</p></div>}
                            {entry.status === 'Pursuing' && entry.yearOfPassing && <div><p className="text-xs text-gray-400">Expected Passing</p><p className="font-medium text-gray-800">{entry.yearOfPassing}</p></div>}
                            {entry.status === 'Pursuing' && entry.backlogs !== '' && entry.backlogs !== undefined && <div><p className="text-xs text-gray-400">Backlogs</p><p className="font-medium text-gray-800">{entry.backlogs}</p></div>}
                            {entry.status === 'Pursuing' && entry.attempts !== '' && entry.attempts !== undefined && <div><p className="text-xs text-gray-400">Attempts</p><p className="font-medium text-gray-800">{entry.attempts}</p></div>}
                            {entry.comment && <div className="col-span-2 sm:col-span-3"><p className="text-xs text-gray-400">Comments</p><p className="font-medium text-gray-700 italic">{entry.comment}</p></div>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {editing && academicEntries.length > 0 && (
                <button type="button" onClick={addAcademicEntry}
                  className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 text-blue-500 hover:border-blue-400 hover:text-blue-700 py-3 rounded-xl transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4" /> Add Another Academic Entry
                </button>
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" /> Work Experience
              </h3>
              {editing && (
                <button type="button" onClick={addExperienceEntry}
                  className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              )}
            </div>
            {experienceEntries.length === 0 && !editing && (
              <p className="text-sm text-gray-400 text-center py-4">No work experience added yet.</p>
            )}
            {experienceEntries.length === 0 && editing && (
              <button type="button" onClick={addExperienceEntry}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-purple-200 text-purple-500 hover:border-purple-400 hover:text-purple-700 py-4 rounded-xl transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" /> Add Work Experience
              </button>
            )}
            <div className="space-y-4">
              {editing ? (
                experienceEntries.map((entry, idx) => (
                  <div key={entry.id} className="border border-purple-100 bg-purple-50/40 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">Experience {idx + 1}</span>
                      <button type="button" aria-label="Remove experience" onClick={() => removeExperienceEntry(entry.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Company / Organization</label>
                        <input aria-label="Company" value={entry.company} placeholder="e.g. TCS, Infosys"
                          onChange={e => updateExperienceEntry(entry.id, 'company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Job Title / Role</label>
                        <input aria-label="Role" value={entry.role} placeholder="e.g. Software Engineer"
                          onChange={e => updateExperienceEntry(entry.id, 'role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Employment Type</label>
                        <select aria-label="Employment Type" value={entry.employmentType}
                          onChange={e => updateExperienceEntry(entry.id, 'employmentType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                          {EXP_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">From (Month / Year)</label>
                        <input aria-label="From date" value={entry.from} placeholder="e.g. Jan 2022"
                          onChange={e => updateExperienceEntry(entry.id, 'from', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      {!entry.current && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">To (Month / Year)</label>
                          <input aria-label="To date" value={entry.to} placeholder="e.g. Dec 2023"
                            onChange={e => updateExperienceEntry(entry.id, 'to', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <input type="checkbox" id={`current-${entry.id}`} checked={entry.current}
                          onChange={e => { updateExperienceEntry(entry.id, 'current', e.target.checked); if (e.target.checked) updateExperienceEntry(entry.id, 'to', ''); }}
                          className="w-4 h-4 text-purple-600 rounded" />
                        <label htmlFor={`current-${entry.id}`} className="text-sm text-gray-600 cursor-pointer">Currently working here</label>
                      </div>
                      {entry.current && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Notice Period</label>
                          <select aria-label="Notice Period" value={entry.noticePeriod}
                            onChange={e => updateExperienceEntry(entry.id, 'noticePeriod', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                            <option value="">Select notice period</option>
                            <option>Immediate</option>
                            <option>15 Days</option>
                            <option>1 Month</option>
                            <option>2 Months</option>
                            <option>3 Months</option>
                            <option>More than 3 Months</option>
                          </select>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
                        <textarea aria-label="Description" value={entry.description} rows={2}
                          placeholder="Brief description of your role and responsibilities…"
                          onChange={e => updateExperienceEntry(entry.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                experienceEntries.map(entry => (
                  <div key={entry.id} className="border border-gray-100 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">{entry.employmentType}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{entry.role}</p>
                        <p className="text-sm text-gray-600">{entry.company}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{entry.from}{entry.to || entry.current ? ` — ${entry.current ? 'Present' : entry.to}` : ''}</p>
                        {entry.current && entry.noticePeriod && <p className="text-xs text-purple-600 font-medium mt-0.5">Notice Period: {entry.noticePeriod}</p>}
                        {entry.description && <p className="text-xs text-gray-500 mt-1.5 italic">{entry.description}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {editing && experienceEntries.length > 0 && (
                <button type="button" onClick={addExperienceEntry}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-purple-200 text-purple-500 hover:border-purple-400 hover:text-purple-700 py-3 rounded-xl transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4" /> Add Another Experience
                </button>
              )}
            </div>
          </div>

          {/* Resume & Documents Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" /> Resume &amp; Documents
            </h3>

            {/* Resume subsection */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resume / CV</p>
            <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
              aria-label="Upload Resume or CV"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadResume(f); e.target.value = ''; }} />
            {(() => {
              const resumeDoc = docs.find((d: any) => d.type === 'CV/Resume') as any;
              if (resumeDoc) {
                const docId = resumeDoc._id || resumeDoc.id;
                return (
                  <div className="flex items-center justify-between gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{resumeDoc.name}</p>
                        <p className="text-xs text-green-600 font-medium">CV / Resume</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {resumeDoc.url && (
                        <a href={resumeDoc.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                          <ExternalLink className="w-3 h-3" /> Open
                        </a>
                      )}
                      <StatusBadge status={resumeDoc.status} />
                      <button type="button" aria-label="Delete resume"
                        onClick={async () => { await api.students.deleteDocument(docId); refreshUser(); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <button type="button" disabled={resumeUploading}
                  onClick={() => resumeInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-green-50 border-2 border-dashed border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400 py-4 rounded-xl transition-colors text-sm font-semibold disabled:opacity-60 mb-5">
                  <Upload className="w-4 h-4" />
                  {resumeUploading ? 'Uploading…' : 'Upload Resume / CV'}
                </button>
              );
            })()}

            {/* Other documents */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Other Documents</p>
            {docs.filter((d: any) => d.type !== 'CV/Resume').length === 0 && (
              <p className="text-sm text-gray-400 text-center py-2 mb-2">No other documents uploaded yet.</p>
            )}
            <div className="space-y-3">
              {docs.filter((d: any) => d.type !== 'CV/Resume').map((doc: any) => {
                const docId = doc._id || doc.id;
                return (
                  <div key={docId} className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-sky-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                          <ExternalLink className="w-3 h-3" /> Open
                        </a>
                      )}
                      <StatusBadge status={doc.status} />
                      <button type="button" aria-label="Delete document"
                        onClick={async () => { await api.students.deleteDocument(docId); refreshUser(); }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={() => setShowUpload(true)} className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 py-3 rounded-xl transition-colors text-sm font-medium">
              <Upload className="w-4 h-4" /> Upload Other Document
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600" /> Study Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Preferred Countries</label>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {ALL_COUNTRIES.map(c => {
                      const selected = form.preferredCountries.includes(c);
                      return (
                        <button key={c} type="button"
                          onClick={() => setForm(f => ({
                            ...f,
                            preferredCountries: selected ? f.preferredCountries.filter(x => x !== c) : [...f.preferredCountries, c]
                          }))}
                          className={`text-sm px-3 py-1 rounded-full font-medium border transition-colors ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(student.preferredCountries || []).length > 0
                      ? (student.preferredCountries || []).map((c: string) => (
                          <span key={c} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">{c}</span>
                        ))
                      : <span className="text-gray-400 text-sm">No countries selected</span>}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Interested Courses</label>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {ALL_COURSES.map(c => {
                      const selected = form.interestedCourses.includes(c);
                      return (
                        <button key={c} type="button"
                          onClick={() => setForm(f => ({
                            ...f,
                            interestedCourses: selected ? f.interestedCourses.filter(x => x !== c) : [...f.interestedCourses, c]
                          }))}
                          className={`text-sm px-3 py-1 rounded-full font-medium border transition-colors ${selected ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'}`}>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(student.interestedCourses || []).length > 0
                      ? (student.interestedCourses || []).map((c: string) => (
                          <span key={c} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">{c}</span>
                        ))
                      : <span className="text-gray-400 text-sm">No courses selected</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">

          {/* Profile Completion breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Profile Score</h3>
              <span className={`text-2xl font-bold ${completion === 100 ? 'text-green-600' : completion >= 67 ? 'text-blue-600' : completion >= 34 ? 'text-amber-600' : 'text-red-500'}`}>
                {completion}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className={`h-full rounded-full transition-all duration-500 ${progressFillClass} ${barColor}`} />
            </div>
            <div className="space-y-1.5">
              {profileFields.map(field => (
                <div key={field.label} className="flex items-center gap-2.5 text-sm">
                  {field.filled
                    ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                  <span className={field.filled ? 'text-gray-600' : 'text-orange-600 font-medium'}>{field.label}</span>
                  {!field.filled && (
                    <span className="ml-auto text-xs text-orange-400 font-medium">Missing</span>
                  )}
                </div>
              ))}
            </div>
            {completion < 100 && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                {profileFields.filter(f => !f.filled).length} field{profileFields.filter(f => !f.filled).length !== 1 ? 's' : ''} remaining — click Edit Profile to complete
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Documents</h3>
            <div className="space-y-3">
              {docs.map((doc: any) => {
                const docId = doc._id || doc.id;
                return (
                  <div key={docId} className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-sky-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                          <ExternalLink className="w-3 h-3" /> Open
                        </a>
                      )}
                      <StatusBadge status={doc.status} />
                      <button type="button" aria-label="Delete document"
                        onClick={async () => { await api.students.deleteDocument(docId); refreshUser(); }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
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
