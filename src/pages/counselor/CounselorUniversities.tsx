import { useState, useEffect } from 'react';
import { Search, MapPin, Star, BookOpen, ChevronDown, ChevronUp, DollarSign, Calendar, CheckCircle, ExternalLink, Users, Award, X, Plus } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

const LEVEL_COLORS: Record<string, string> = {
  "Bachelor's": 'bg-blue-100 text-blue-700',
  "Master's": 'bg-purple-100 text-purple-700',
  'PhD': 'bg-red-100 text-red-700',
  'Diploma': 'bg-green-100 text-green-700',
  'Certificate': 'bg-yellow-100 text-yellow-700',
};

// ── Apply Modal ───────────────────────────────────────────────────────────────

function ApplyModal({ course, universityName, universityId, students, onClose, onApplied }: {
  course: any; universityName: string; universityId: string;
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
        universityId,
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
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

        {/* Course info chips */}
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

        {/* Form */}
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

// ── Course Row ────────────────────────────────────────────────────────────────

function CourseRow({ course, universityName, universityId, onApply }: {
  course: any; universityName: string; universityId: string; onApply: (course: any, universityName: string, universityId: string) => void;
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level] || 'bg-gray-100 text-gray-700'}`}>
              {course.level}
            </span>
            {course.department && <span className="text-xs text-gray-400 truncate">{course.department}</span>}
          </div>
          <p className="font-bold text-gray-900 text-sm">{course.name}</p>
        </div>
        <div className="flex items-start gap-2 flex-shrink-0">
          {course.tuitionFee > 0 && (
            <div className="text-right">
              <p className="font-bold text-green-700 text-sm">{course.currency || 'USD'} {Number(course.tuitionFee).toLocaleString()}</p>
              <p className="text-xs text-gray-400">per year</p>
            </div>
          )}
          <button type="button" onClick={() => onApply(course, universityName, universityId)}
            className="flex items-center gap-1 bg-[#0d1b4b] hover:bg-[#152258] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" />Apply
          </button>
        </div>
      </div>

      {course.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{course.description}</p>}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
        {course.duration && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{course.duration}</span>}
        {course.intake?.length > 0 && <span className="text-indigo-600">Intake: {course.intake.join(', ')}</span>}
        {course.paymentPlan && <span className="text-purple-600">{course.paymentPlan} billing</span>}
      </div>

      {(course.applicationFee > 0 || course.registrationFee > 0 || course.scholarshipAvailable) && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {course.applicationFee > 0 && (
            <span className="text-xs text-gray-600">App fee: <span className="font-semibold text-gray-800">{course.currency || 'USD'} {Number(course.applicationFee).toLocaleString()}</span></span>
          )}
          {course.registrationFee > 0 && (
            <span className="text-xs text-gray-600">Reg fee: <span className="font-semibold text-gray-800">{course.currency || 'USD'} {Number(course.registrationFee).toLocaleString()}</span></span>
          )}
          {course.scholarshipAvailable && (
            <span className="text-xs font-semibold text-yellow-700 flex items-center gap-1">
              <Award className="w-3 h-3" />
              {course.scholarshipAmount || 'Scholarship available'}
            </span>
          )}
        </div>
      )}

      {course.requirements?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {course.requirements.map((req: string) => (
            <span key={req} className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
              <CheckCircle className="w-3 h-3 text-green-500" />{req}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── University Card ───────────────────────────────────────────────────────────

function UniLogoImg({ name, website }: { name: string; website?: string }) {
  const [err, setErr] = useState(false);
  if (!website || err) {
    return (
      <span className="w-full h-full bg-[#0d1b4b] flex items-center justify-center text-white font-bold text-xl rounded-lg leading-none">
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

function UniversityCard({ uni, onApply }: {
  uni: any; onApply: (course: any, universityName: string, universityId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<'courses' | 'details'>('courses');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-5">
        <div className="w-14 h-14 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0">
          <UniLogoImg name={uni.name} website={uni.website} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 leading-tight">{uni.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap font-semibold">#{uni.ranking}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
            <MapPin className="w-3 h-3" /> {uni.city}, {uni.country}
            {uni.type && <span className="text-gray-400 ml-1">• {uni.type}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-600">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{uni.rating}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-600">
              <BookOpen className="w-3 h-3" />{uni.courses?.length || 0} courses
            </span>
            {uni.acceptanceRate && (
              <span className="text-xs text-gray-600">{uni.acceptanceRate}% acceptance</span>
            )}
            {uni.averageFees?.postgraduate > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <DollarSign className="w-3 h-3" />
                {uni.averageFees.currency} {Number(uni.averageFees.postgraduate).toLocaleString()}/yr PG
              </span>
            )}
          </div>
        </div>
      </div>

      {uni.tags?.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1">
          {uni.tags.slice(0, 4).map((t: string) => (
            <span key={t} className="text-xs bg-sky-50 text-blue-700 px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pb-4 flex gap-2">
        <button type="button" onClick={() => { setExpanded(!expanded); if (!expanded) setTab('courses'); }}
          className="flex-1 flex items-center justify-center gap-2 bg-[#0d1b4b] text-white py-2 rounded-xl text-sm font-semibold hover:bg-[#152258] transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Collapse' : 'View Courses & Info'}
        </button>
        {uni.website && (
          <a href={uni.website} target="_blank" rel="noopener noreferrer"
            title="Visit university website"
            className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          <div className="flex border-b border-gray-100 bg-gray-50">
            <button type="button" onClick={() => setTab('courses')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === 'courses' ? 'text-blue-700 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
              Courses ({uni.courses?.length || 0})
            </button>
            <button type="button" onClick={() => setTab('details')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === 'details' ? 'text-blue-700 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
              University Details
            </button>
          </div>

          {tab === 'courses' && (
            <div className="bg-gray-50/50 px-5 py-4">
              {(!uni.courses || uni.courses.length === 0) ? (
                <div className="text-center py-6 text-gray-400">
                  <BookOpen className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  <p className="text-xs">No courses listed yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uni.courses.map((course: any) => (
                    <CourseRow
                      key={course.id || course._id}
                      course={course}
                      universityName={uni.name}
                      universityId={(uni._id || uni.id || '').toString()}
                      onApply={onApply}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'details' && (
            <div className="bg-gray-50/50 px-5 py-4 space-y-4">
              {uni.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{uni.description}</p>
                </div>
              )}
              {(uni.averageFees?.undergraduate > 0 || uni.averageFees?.postgraduate > 0) && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Average Tuition Fees / Year</p>
                  <div className="grid grid-cols-2 gap-2">
                    {uni.averageFees?.undergraduate > 0 && (
                      <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
                        <p className="text-xs text-gray-400">Undergraduate</p>
                        <p className="font-bold text-gray-900 text-sm">{uni.averageFees.currency} {Number(uni.averageFees.undergraduate).toLocaleString()}</p>
                      </div>
                    )}
                    {uni.averageFees?.postgraduate > 0 && (
                      <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
                        <p className="text-xs text-gray-400">Postgraduate</p>
                        <p className="font-bold text-gray-900 text-sm">{uni.averageFees.currency} {Number(uni.averageFees.postgraduate).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Statistics</p>
                <div className="grid grid-cols-2 gap-2">
                  {uni.acceptanceRate && <div className="flex justify-between bg-white rounded-lg border border-gray-100 px-3 py-2"><span className="text-xs text-gray-500">Acceptance Rate</span><span className="font-semibold text-xs text-gray-900">{uni.acceptanceRate}%</span></div>}
                  {uni.founded && <div className="flex justify-between bg-white rounded-lg border border-gray-100 px-3 py-2"><span className="text-xs text-gray-500">Founded</span><span className="font-semibold text-xs text-gray-900">{uni.founded}</span></div>}
                  {uni.totalStudents && <div className="flex justify-between bg-white rounded-lg border border-gray-100 px-3 py-2"><span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" />Total Students</span><span className="font-semibold text-xs text-gray-900">{Number(uni.totalStudents).toLocaleString()}</span></div>}
                  {uni.internationalStudents && <div className="flex justify-between bg-white rounded-lg border border-gray-100 px-3 py-2"><span className="text-xs text-gray-500">Intl. Students</span><span className="font-semibold text-xs text-gray-900">{Number(uni.internationalStudents).toLocaleString()}</span></div>}
                </div>
              </div>
              {uni.facilities?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Campus Facilities</p>
                  <div className="grid grid-cols-2 gap-1">
                    {uni.facilities.map((f: string) => (
                      <span key={f} className="flex items-center gap-1 text-xs text-gray-700"><CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CounselorUniversities() {
  const { user } = useAuth();
  const [universities, setUniversities] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [level, setLevel] = useState('');
  const [applyTarget, setApplyTarget] = useState<{ course: any; universityName: string; universityId: string } | null>(null);

  useEffect(() => {
    api.universities.list().then(setUniversities).catch(() => {});
    api.students.list().then(setStudents).catch(() => {});
  }, []);

  const myStudents = user?.role === 'counselor'
    ? students.filter((s: any) => (user as any).assignedStudents?.includes(s._id || s.id))
    : students;

  const countries = [...new Set(universities.map((u: any) => u.country))].sort();

  const filtered = universities.filter((u: any) => {
    const q = query.toLowerCase();
    const matchQuery = !query || u.name?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q) || u.country?.toLowerCase().includes(q);
    const matchCountry = !country || u.country === country;
    const matchLevel = !level || u.courses?.some((c: any) => c.level === level);
    return matchQuery && matchCountry && matchLevel;
  });

  const hasFilters = query || country || level;

  const handleApply = (course: any, universityName: string, universityId: string) => {
    setApplyTarget({ course, universityName, universityId });
  };

  return (
    <div className="space-y-6">
      {applyTarget && (
        <ApplyModal
          course={applyTarget.course}
          universityName={applyTarget.universityName}
          universityId={applyTarget.universityId}
          students={myStudents.length > 0 ? myStudents : students}
          onClose={() => setApplyTarget(null)}
          onApplied={() => setApplyTarget(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partner Universities</h1>
        <p className="text-gray-500 mt-1">Browse universities and apply courses on behalf of students</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, city, country..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select aria-label="Filter by country" value={country} onChange={e => setCountry(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Countries</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
          <select aria-label="Filter by level" value={level} onChange={e => setLevel(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Levels</option>
            {["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate'].map(l => <option key={l}>{l}</option>)}
          </select>
          {hasFilters && (
            <button type="button" onClick={() => { setQuery(''); setCountry(''); setLevel(''); }}
              className="flex items-center gap-1 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm">
              <X className="w-4 h-4" />Clear
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-3">{filtered.length} universities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(uni => (
          <UniversityCard key={uni.id} uni={uni} onApply={handleApply} />
        ))}
      </div>
    </div>
  );
}
