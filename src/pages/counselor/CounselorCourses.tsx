import { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, Calendar, Award, CheckCircle, X, Plus, ChevronRight } from 'lucide-react';
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
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDropOpen, setStudentDropOpen] = useState(false);
  const [intake, setIntake] = useState(course.intake?.[0] || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const dropRef = useRef<HTMLDivElement>(null);
  const filteredStudents = students.filter(s =>
    !studentSearch || s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase())
  );
  const selectedStudent = students.find(s => (s._id || s.id) === studentId);

  useEffect(() => {
    if (!studentDropOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setStudentDropOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [studentDropOpen]);

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
          <div className="relative" ref={dropRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Student <span className="text-red-500">*</span></label>
            <button type="button"
              onClick={() => setStudentDropOpen(v => !v)}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm text-left flex items-center justify-between bg-white transition-colors ${studentDropOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className={selectedStudent ? 'text-gray-900' : 'text-gray-400'}>
                {selectedStudent ? `${selectedStudent.name} (${selectedStudent.email})` : '— Choose a student —'}
              </span>
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
            {studentDropOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg">
                    <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      placeholder="Search by name or email…"
                      className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                    />
                    {studentSearch && (
                      <button type="button" onClick={() => setStudentSearch('')} aria-label="Clear search">
                        <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No students found</p>
                  ) : (
                    filteredStudents.map(s => (
                      <button type="button" key={s._id || s.id}
                        onClick={() => { setStudentId(s._id || s.id); setStudentDropOpen(false); setStudentSearch(''); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors flex flex-col gap-0.5 ${studentId === (s._id || s.id) ? 'bg-emerald-50' : ''}`}>
                        <span className="font-medium text-gray-900">{s.name}</span>
                        <span className="text-xs text-gray-400">{s.email}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
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
      src={`/api/favicon/${website.replace(/^https?:\/\/(?:www\.)?/, '').split('/')[0]}`}
      alt={name}
      className="w-full h-full object-contain"
      onError={() => setErr(true)}
    />
  );
}

function CourseDetailModal({ course, onClose, onApplyForStudent }: {
  course: any; onClose: () => void; onApplyForStudent: (course: any) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-start gap-4 p-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0 bg-white">
            <UniLogoImg name={course.uniName} website={course.website} />
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
            <p className="text-sm text-[#0d1b4b] mt-0.5 font-medium">{course.uniName}</p>
            {(course.city || course.country) && (
              <p className="text-xs text-gray-400 mt-0.5">{[course.city, course.country].filter(Boolean).join(', ')}</p>
            )}
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
                <p className="font-bold text-emerald-700 text-base">{course.currency || 'USD'} {Number(course.tuitionFee).toLocaleString()}</p>
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

          {course.department && (
            <p className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-100 px-3 py-2.5 rounded-xl">
              Department: <span className="text-gray-700">{course.department}</span>
            </p>
          )}

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
                  <span key={m} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100 font-medium">{m}</span>
                ))}
              </div>
            </div>
          )}

          {course.requirements?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Entry Requirements</p>
              <div className="flex flex-wrap gap-1.5">
                {course.requirements.map((req: string) => (
                  <span key={req} className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />{req}
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
                  <p className="text-sm font-semibold text-gray-800">{course.currency || 'USD'} {Number(course.applicationFee).toLocaleString()}</p>
                </div>
              )}
              {course.registrationFee > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Registration Fee</p>
                  <p className="text-sm font-semibold text-gray-800">{course.currency || 'USD'} {Number(course.registrationFee).toLocaleString()}</p>
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

        <div className="px-6 pb-6">
          <button type="button"
            onClick={() => { onApplyForStudent(course); onClose(); }}
            className="w-full py-3 bg-[#0d1b4b] hover:bg-[#152258] text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />Apply for Student
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, onClick }: { course: any; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="text-left w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-green-200 transition-all group cursor-pointer flex flex-col min-h-[160px]">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
          <UniLogoImg name={course.uniName} website={course.website} />
        </div>
        {course.level && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${LEVEL_COLORS[course.level] || 'bg-gray-100 text-gray-700'}`}>
            {course.level}
          </span>
        )}
      </div>
      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-green-700 transition-colors">{course.name}</h3>
      <p className="text-xs text-[#0d1b4b] truncate mb-0.5 font-medium">{course.uniName}</p>
      {(course.city || course.country) && (
        <p className="text-xs text-gray-400 truncate">{[course.city, course.country].filter(Boolean).join(', ')}</p>
      )}
      <div className="mt-auto pt-3 flex items-center justify-between">
        {course.tuitionFee > 0 ? (
          <p className="text-xs font-bold text-emerald-600">{course.currency || 'USD'} {Number(course.tuitionFee).toLocaleString()}<span className="font-normal text-gray-400">/yr</span></p>
        ) : <span />}
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}

export default function CounselorCourses() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [uniFilter, setUniFilter] = useState('');
  const [applyModal, setApplyModal] = useState<any | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

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
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onApplyForStudent={course => setApplyModal(course)}
        />
      )}

      <div className="bg-gradient-to-r from-green-600 via-green-700 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-green-200 text-xs font-medium uppercase tracking-wide">Counselor Portal</p>
            <h1 className="text-2xl font-bold leading-tight">Available Courses</h1>
          </div>
        </div>
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
        <p className="text-sm text-gray-500 mt-3">{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((course, i) => (
          <CourseCard key={course.id || course._id || i} course={course} onClick={() => setSelectedCourse(course)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-14 text-gray-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{allCourses.length === 0 ? 'Loading courses…' : 'No courses match your filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
