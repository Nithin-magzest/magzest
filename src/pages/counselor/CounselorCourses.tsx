import { useState, useEffect } from 'react';
import { Search, BookOpen, Calendar, Award, CheckCircle, X, Plus } from 'lucide-react';
import { api } from '../../api';

const LEVELS = ["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate'];
const LEVEL_COLORS: Record<string, string> = {
  "Bachelor's": 'bg-blue-100 text-blue-700',
  "Master's": 'bg-purple-100 text-purple-700',
  'PhD': 'bg-red-100 text-red-700',
  'Diploma': 'bg-green-100 text-green-700',
  'Certificate': 'bg-yellow-100 text-yellow-700',
};

function ApplyModal({ course, students, onClose }: {
  course: { name: string; uniId: string; uniName: string; intake?: string[]; tuitionFee?: number; currency?: string; level?: string };
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
        universityId: course.uniId,
        universityName: course.uniName,
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
            <p className="text-xs text-gray-500 truncate">{course.uniName}</p>
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
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
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
      src={`https://icons.duckduckgo.com/ip3/${website.replace(/^https?:\/\/(?:www\.)?/, '').split('/')[0]}.ico`}
      alt={name}
      className="w-full h-full object-contain"
      onError={() => setErr(true)}
    />
  );
}

export default function CounselorCourses() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [uniFilter, setUniFilter] = useState('');
  const [applyModal, setApplyModal] = useState<any | null>(null);

  useEffect(() => {
    api.universities.list().then(setUniversities).catch(() => {});
    api.students.list().then(setStudents).catch(() => {});
  }, []);

  const allCourses = universities.flatMap(uni =>
    (uni.courses || []).map((c: any) => ({ ...c, uniName: uni.name, uniId: uni.id || uni._id, city: uni.city, country: uni.country, website: uni.website }))
  );

  const uniNames = [...new Set(universities.map(u => u.name))].sort() as string[];

  const filtered = allCourses.filter(c => {
    const q = query.toLowerCase();
    const matchQ = !query || c.name?.toLowerCase().includes(q) || c.uniName?.toLowerCase().includes(q) || c.department?.toLowerCase().includes(q);
    const matchLevel = !level || c.level === level;
    const matchUni = !uniFilter || c.uniName === uniFilter;
    return matchQ && matchLevel && matchUni;
  });

  const hasFilters = query || level || uniFilter;

  return (
    <div className="space-y-6">
      {applyModal && (
        <ApplyModal
          course={applyModal}
          students={students}
          onClose={() => setApplyModal(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Available Courses</h1>
        <p className="text-gray-500 mt-1">Browse courses and apply on behalf of your students</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by course name, university, department..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select aria-label="Filter by level" value={level} onChange={e => setLevel(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Levels</option>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select aria-label="Filter by university" value={uniFilter} onChange={e => setUniFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Universities</option>
            {uniNames.map(n => <option key={n}>{n}</option>)}
          </select>
          {hasFilters && (
            <button type="button" onClick={() => { setQuery(''); setLevel(''); setUniFilter(''); }}
              className="flex items-center gap-1 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm">
              <X className="w-4 h-4" />Clear
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-3">{filtered.length} courses found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((course, i) => (
          <div key={course.id || course._id || i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-1 flex-shrink-0 mt-0.5">
                <UniLogoImg name={course.uniName} website={course.website} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level] || 'bg-gray-100 text-gray-700'}`}>
                    {course.level}
                  </span>
                  {course.department && <span className="text-xs text-gray-400">{course.department}</span>}
                </div>
                <p className="font-bold text-gray-900">{course.name}</p>
                <p className="text-xs text-blue-600 mt-0.5">{course.uniName} · {course.city}, {course.country}</p>
              </div>
              {course.tuitionFee > 0 && (
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-green-700 text-sm">{course.currency || 'USD'} {Number(course.tuitionFee).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">per year</p>
                </div>
              )}
            </div>

            {course.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{course.description}</p>}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
              {course.duration && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{course.duration}</span>}
              {course.intake?.length > 0 && <span className="text-indigo-600">Intake: {course.intake.join(', ')}</span>}
              {course.paymentPlan && <span className="text-purple-600">{course.paymentPlan} billing</span>}
            </div>

            {(course.applicationFee > 0 || course.scholarshipAvailable) && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-2 flex flex-wrap gap-x-4 gap-y-1">
                {course.applicationFee > 0 && (
                  <span className="text-xs text-gray-600">App fee: <span className="font-semibold text-gray-800">{course.currency || 'USD'} {Number(course.applicationFee).toLocaleString()}</span></span>
                )}
                {course.scholarshipAvailable && (
                  <span className="text-xs font-semibold text-yellow-700 flex items-center gap-1">
                    <Award className="w-3 h-3" />{course.scholarshipAmount || 'Scholarship available'}
                  </span>
                )}
              </div>
            )}

            {course.requirements?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {course.requirements.map((req: string) => (
                  <span key={req} className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                    <CheckCircle className="w-3 h-3 text-green-500" />{req}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto pt-2">
              <button type="button" onClick={() => setApplyModal(course)}
                className="flex items-center gap-1.5 bg-[#0d1b4b] hover:bg-[#152258] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
                <Plus className="w-4 h-4" />Apply for Student
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-14 text-gray-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{allCourses.length === 0 ? 'Loading courses…' : 'No courses match your filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
