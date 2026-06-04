import { useState, useEffect } from 'react';
import { Search, BookOpen, Calendar, Award, CheckCircle, X } from 'lucide-react';
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

function UniLogoImg({ name, website, uniId }: { name: string; website?: string; uniId?: string }) {
  const domain = website ? website.replace(/^https?:\/\/(?:www\.)?/, '').split('/')[0] : '';
  const initial: 'proxy' | 'favicon' | 'letter' = uniId ? 'proxy' : domain ? 'favicon' : 'letter';
  const [stage, setStage] = useState(initial);
  if (stage === 'letter') {
    return (
      <span className="w-full h-full bg-[#0d1b4b] flex items-center justify-center text-white font-bold text-base rounded-lg leading-none">
        {name?.charAt(0) || '?'}
      </span>
    );
  }
  const src = stage === 'proxy' ? `/api/unilogo/${uniId}` : `/api/favicon/${domain}`;
  return (
    <img src={src} alt={name} className="w-full h-full object-contain"
      onError={() => { if (stage === 'proxy' && domain) setStage('favicon'); else setStage('letter'); }} />
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

  useEffect(() => {
    api.universities.list().then(setUniversities).catch(() => {});
  }, []);

  const allCourses = universities.flatMap(uni =>
    (uni.courses || []).map((c: any) => ({ ...c, uniName: uni.name, uniId: uni.id || uni._id, city: uni.city, country: uni.country, website: uni.website, uniLogo: uni.logo }))
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
        <p className="text-sm text-gray-500 mt-3">{filtered.length} courses found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((course, i) => (
          <div key={course.id || course._id || i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-1 flex-shrink-0 mt-0.5">
                <UniLogoImg name={course.uniName} website={course.website} uniId={course.uniId} />
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
              {(student?.applications || []).some((a: any) => a.universityId === course.uniId && a.courseId === (course.id || course._id)) ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium">
                  <CheckCircle className="w-4 h-4" /> Applied
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const uni = universities.find(u => (u.id || u._id) === course.uniId);
                    if (uni) setApplyModal({ course, uni });
                  }}
                  className="bg-[#0d1b4b] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#152258] transition-colors font-medium"
                >
                  Apply Now
                </button>
              )}
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
