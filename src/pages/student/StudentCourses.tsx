import { useState, useEffect } from 'react';
import { Search, BookOpen, Calendar, Award, CheckCircle, X, ChevronRight } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import ApplicationModal from '../../components/ApplicationModal';

const LEVELS = ["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate'];
const LEVEL_COLORS: Record<string, string> = {
  "Bachelor's": 'bg-blue-100 text-blue-700',
  "Master's": 'bg-purple-100 text-purple-700',
  'PhD': 'bg-red-100 text-red-700',
  'Diploma': 'bg-green-100 text-green-700',
  'Certificate': 'bg-yellow-100 text-yellow-700',
};

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

function CourseDetailModal({ course, student, universities, onClose, onApply }: {
  course: any; student: any; universities: any[];
  onClose: () => void; onApply: (course: any, uni: any) => void;
}) {
  const isApplied = (student?.applications || []).some(
    (a: any) => a.universityId === course.uniId && a.courseId === (course.id || course._id)
  );
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
            <p className="text-sm text-blue-600 mt-0.5 font-medium">{course.uniName}</p>
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
          {isApplied ? (
            <div className="w-full py-3 flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-700">
              <CheckCircle className="w-4 h-4" /> Already Applied
            </div>
          ) : (
            <button type="button"
              onClick={() => {
                const uni = universities.find(u => (u.id || u._id) === course.uniId);
                if (uni) { onApply(course, uni); }
                onClose();
              }}
              className="w-full py-3 bg-[#0d1b4b] hover:bg-[#152258] text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, onClick }: { course: any; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="text-left w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer flex flex-col min-h-[160px]">
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
      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">{course.name}</h3>
      <p className="text-xs text-blue-600 truncate mb-0.5 font-medium">{course.uniName}</p>
      {(course.city || course.country) && (
        <p className="text-xs text-gray-400 truncate">{[course.city, course.country].filter(Boolean).join(', ')}</p>
      )}
      <div className="mt-auto pt-3 flex items-center justify-between">
        {course.tuitionFee > 0 ? (
          <p className="text-xs font-bold text-emerald-600">{course.currency || 'USD'} {Number(course.tuitionFee).toLocaleString()}<span className="font-normal text-gray-400">/yr</span></p>
        ) : <span />}
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}

export default function StudentCourses() {
  const { user } = useAuth();
  const student = user as any;
  const [universities, setUniversities] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [uniFilter, setUniFilter] = useState('');
  const [applyModal, setApplyModal] = useState<{ course: any; uni: any } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  useEffect(() => {
    api.universities.list().then(setUniversities).catch(() => {});
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
        <ApplicationModal
          course={applyModal.course}
          uni={applyModal.uni}
          onClose={() => setApplyModal(null)}
          onSuccess={() => setApplyModal(null)}
        />
      )}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          student={student}
          universities={universities}
          onClose={() => setSelectedCourse(null)}
          onApply={(course, uni) => { setApplyModal({ course, uni }); }}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Available Courses</h1>
        <p className="text-gray-500 mt-1">Browse and apply to courses across partner universities</p>
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
