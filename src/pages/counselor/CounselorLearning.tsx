import { useState, useEffect } from 'react';
import {
  BookOpen, Play, FileText, Award, CheckCircle, Clock, ExternalLink,
  Search, Filter, Star, TrendingUp, Zap, Globe, GraduationCap, Users, ChevronRight
} from 'lucide-react';

type ResourceType = 'video' | 'article' | 'guide' | 'webinar';
type Category = 'all' | 'admissions' | 'universities' | 'visa' | 'scholarships' | 'skills';

interface Resource {
  id: string;
  category: Exclude<Category, 'all'>;
  type: ResourceType;
  title: string;
  description: string;
  duration: string;
  url: string;
  tags: string[];
  featured?: boolean;
}

const RESOURCES: Resource[] = [
  // Admissions
  {
    id: 'adm-1',
    category: 'admissions',
    type: 'video',
    title: 'Understanding University Application Requirements',
    description: 'A comprehensive walkthrough of typical document requirements, deadlines, and how to guide students through the checklist.',
    duration: '22 min',
    url: 'https://www.youtube.com/results?search_query=university+application+process+counselor+guide',
    tags: ['Documents', 'Deadlines', 'Checklist'],
    featured: true,
  },
  {
    id: 'adm-2',
    category: 'admissions',
    type: 'article',
    title: 'Personal Statement Coaching: Best Practices',
    description: 'How to help students craft compelling personal statements that stand out to admissions committees.',
    duration: '12 min read',
    url: 'https://www.nacac.org/resources/knowledge-center/',
    tags: ['Personal Statement', 'Writing', 'Coaching'],
  },
  {
    id: 'adm-3',
    category: 'admissions',
    type: 'guide',
    title: 'Admissions Timeline Planner',
    description: 'Month-by-month guide for managing student applications across multiple universities and intake cycles.',
    duration: '8 min read',
    url: 'https://www.iecaonline.com/resources/',
    tags: ['Planning', 'Timeline', 'Intakes'],
  },
  {
    id: 'adm-4',
    category: 'admissions',
    type: 'webinar',
    title: 'Common Mistakes in Application Processing',
    description: 'Recorded session covering frequent errors counselors make when reviewing and submitting applications.',
    duration: '45 min',
    url: 'https://www.youtube.com/results?search_query=study+abroad+counselor+application+mistakes',
    tags: ['Errors', 'Quality Control', 'Review'],
  },

  // Universities
  {
    id: 'uni-1',
    category: 'universities',
    type: 'video',
    title: 'How to Research and Compare Universities',
    description: 'Learn to evaluate rankings, program quality, campus life, and job outcomes when advising students on university selection.',
    duration: '18 min',
    url: 'https://www.youtube.com/results?search_query=how+to+compare+universities+for+students',
    tags: ['Rankings', 'Comparison', 'Research'],
    featured: true,
  },
  {
    id: 'uni-2',
    category: 'universities',
    type: 'article',
    title: 'Understanding University Rankings & What They Really Mean',
    description: 'QS, THE, US News — how to interpret rankings and explain their relevance (and limitations) to students.',
    duration: '10 min read',
    url: 'https://www.topuniversities.com/qs-world-university-rankings/methodology',
    tags: ['QS', 'THE', 'Rankings'],
  },
  {
    id: 'uni-3',
    category: 'universities',
    type: 'guide',
    title: 'University Partner Relations Guide',
    description: 'Best practices for building and maintaining strong relationships with university admission partners.',
    duration: '15 min read',
    url: 'https://www.icef.com/academy/',
    tags: ['Partnerships', 'Networking', 'B2B'],
  },

  // Visa & Immigration
  {
    id: 'visa-1',
    category: 'visa',
    type: 'video',
    title: 'Student Visa Types: UK, US, Canada, Australia',
    description: 'Overview of Tier 4, F-1, Study Permit, and Student Visa requirements — eligibility, documents, and timelines.',
    duration: '30 min',
    url: 'https://www.youtube.com/results?search_query=student+visa+types+UK+US+Canada+Australia+guide',
    tags: ['UK Visa', 'F-1', 'Canada', 'Australia'],
    featured: true,
  },
  {
    id: 'visa-2',
    category: 'visa',
    type: 'article',
    title: 'Financial Evidence Requirements by Country',
    description: 'What bank statements and sponsorship letters need to show for different destination countries.',
    duration: '9 min read',
    url: 'https://www.gov.uk/student-visa',
    tags: ['Financials', 'Bank Statements', 'Sponsorship'],
  },
  {
    id: 'visa-3',
    category: 'visa',
    type: 'guide',
    title: 'Pre-Departure Checklist for Students',
    description: 'Everything students need before they fly: accommodation, insurance, banking, and arrival orientation tips.',
    duration: '7 min read',
    url: 'https://www.internationalstudent.com/study_usa/before-you-go/',
    tags: ['Pre-Departure', 'Checklist', 'Orientation'],
  },
  {
    id: 'visa-4',
    category: 'visa',
    type: 'webinar',
    title: 'Navigating Visa Refusals and Appeals',
    description: 'What to do when a student\'s visa is refused — grounds, reapplication strategies, and counselor responsibilities.',
    duration: '50 min',
    url: 'https://www.youtube.com/results?search_query=student+visa+refusal+appeal+guide',
    tags: ['Refusals', 'Appeals', 'Reapplication'],
  },

  // Scholarships
  {
    id: 'sch-1',
    category: 'scholarships',
    type: 'video',
    title: 'Finding Scholarships: A Counselor\'s Guide',
    description: 'Databases, eligibility criteria, and how to match the right scholarships to each student\'s profile.',
    duration: '20 min',
    url: 'https://www.youtube.com/results?search_query=scholarship+guide+for+international+students+counselor',
    tags: ['Databases', 'Eligibility', 'Matching'],
    featured: true,
  },
  {
    id: 'sch-2',
    category: 'scholarships',
    type: 'article',
    title: 'Merit vs Need-Based Scholarships: Key Differences',
    description: 'Understanding the distinction and how to position students for each type effectively.',
    duration: '8 min read',
    url: 'https://www.scholarships.com/financial-aid/college-scholarships/',
    tags: ['Merit', 'Need-Based', 'Positioning'],
  },
  {
    id: 'sch-3',
    category: 'scholarships',
    type: 'guide',
    title: 'Scholarship Application Letter Templates',
    description: 'Proven letter structures and examples that have helped students win competitive scholarships.',
    duration: '11 min read',
    url: 'https://www.chevening.org/scholarships/',
    tags: ['Templates', 'Letters', 'Writing'],
  },

  // Skills
  {
    id: 'skl-1',
    category: 'skills',
    type: 'video',
    title: 'Motivational Interviewing for Counselors',
    description: 'Evidence-based communication techniques to help students clarify their goals and overcome hesitation.',
    duration: '35 min',
    url: 'https://www.youtube.com/results?search_query=motivational+interviewing+counselor+technique',
    tags: ['Communication', 'Motivation', 'Technique'],
    featured: true,
  },
  {
    id: 'skl-2',
    category: 'skills',
    type: 'article',
    title: 'Managing Difficult Student Conversations',
    description: 'How to deliver bad news (rejections, visa refusals) professionally while keeping students engaged.',
    duration: '10 min read',
    url: 'https://www.nacac.org/professional-development/',
    tags: ['Difficult Conversations', 'Empathy', 'Retention'],
  },
  {
    id: 'skl-3',
    category: 'skills',
    type: 'guide',
    title: 'Building Your Personal Brand as a Counselor',
    description: 'LinkedIn, referrals, and professional presence — how to grow your client base and reputation.',
    duration: '14 min read',
    url: 'https://www.icef.com/academy/',
    tags: ['Personal Brand', 'LinkedIn', 'Referrals'],
  },
  {
    id: 'skl-4',
    category: 'skills',
    type: 'webinar',
    title: 'CRM and Pipeline Management for Counselors',
    description: 'Using digital tools to track student journeys, follow-ups, and conversion metrics.',
    duration: '40 min',
    url: 'https://www.youtube.com/results?search_query=crm+pipeline+management+education+counselor',
    tags: ['CRM', 'Pipeline', 'Tracking'],
  },
];

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<{ className?: string }> | string; color: string }[] = [
  { id: 'all', label: 'All Resources', icon: BookOpen, color: 'bg-gray-100 text-gray-700' },
  { id: 'admissions', label: 'Admissions', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  { id: 'universities', label: 'Universities', icon: GraduationCap, color: 'bg-purple-100 text-purple-700' },
  { id: 'visa', label: 'Visa & Immigration', icon: Globe, color: 'bg-orange-100 text-orange-700' },
  { id: 'scholarships', label: 'Scholarships', icon: Award, color: 'bg-amber-100 text-amber-700' },
  { id: 'skills', label: 'Counseling Skills', icon: Users, color: 'bg-green-100 text-green-700' },
];

const TYPE_CONFIG: Record<ResourceType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  video: { label: 'Video', color: 'bg-red-100 text-red-700', icon: Play },
  article: { label: 'Article', color: 'bg-blue-100 text-blue-700', icon: FileText },
  guide: { label: 'Guide', color: 'bg-green-100 text-green-700', icon: BookOpen },
  webinar: { label: 'Webinar', color: 'bg-purple-100 text-purple-700', icon: Star },
};

const STORAGE_KEY = 'counselor_learning_completed';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export default function CounselorLearning() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [completed, setCompleted] = useState<Set<string>>(loadCompleted);
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');

  useEffect(() => { saveCompleted(completed); }, [completed]);

  const toggleComplete = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = RESOURCES.filter(r => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const featured = RESOURCES.filter(r => r.featured);
  const totalCount = RESOURCES.length;
  const completedCount = completed.size;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const catCounts = Object.fromEntries(
    CATEGORIES.slice(1).map(c => [c.id, RESOURCES.filter(r => r.category === c.id).length])
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-green-200" />
              <span className="text-green-200 text-sm font-medium">Counselor Learning Hub</span>
            </div>
            <h1 className="text-2xl font-bold">Upgrade Your Skills</h1>
            <p className="text-green-100 text-sm mt-1">
              Curated resources to help you become a better counselor — from admissions to visa guidance.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/10 rounded-2xl p-4 min-w-[180px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-100">Your Progress</span>
              <span className="text-lg font-bold">{progressPct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-green-200">{completedCount} of {totalCount} completed</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Total Resources', value: totalCount, icon: BookOpen },
            { label: 'Completed', value: completedCount, icon: CheckCircle },
            { label: 'Categories', value: 5, icon: Filter },
            { label: 'Remaining', value: totalCount - completedCount, icon: TrendingUp },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <stat.icon className="w-5 h-5 text-green-200 flex-shrink-0" />
              <div>
                <p className="text-xl font-bold leading-none">{stat.value}</p>
                <p className="text-xs text-green-200 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Resources */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" /> Featured This Week
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map(r => (
            <FeaturedCard key={r.id} resource={r} completed={completed.has(r.id)} onToggle={() => toggleComplete(r.id)} />
          ))}
        </div>
      </div>

      {/* Category tabs + filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Category scroll tabs */}
        <div className="overflow-x-auto border-b border-gray-100">
          <div className="flex gap-1 p-3 min-w-max">
            {CATEGORIES.map(cat => {
              const count = cat.id === 'all' ? RESOURCES.length : catCounts[cat.id] ?? 0;
              const isActive = activeCategory === cat.id;
              const Icon = typeof cat.icon === 'string' ? null : cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {cat.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search + type filter */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'video', 'article', 'guide', 'webinar'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  typeFilter === t ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'all' ? 'All Types' : TYPE_CONFIG[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* Resource list */}
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No resources match your search.</p>
            </div>
          ) : (
            filtered.map(r => (
              <ResourceRow key={r.id} resource={r} completed={completed.has(r.id)} onToggle={() => toggleComplete(r.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ resource: r, completed, onToggle }: { resource: Resource; completed: boolean; onToggle: () => void }) {
  const typeConf = TYPE_CONFIG[r.type];
  const TypeIcon = typeConf.icon;
  const catConf = CATEGORIES.find(c => c.id === r.category);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${completed ? 'border-green-200 bg-green-50/30' : 'border-gray-100 hover:shadow-md'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${typeConf.color}`}>
              <TypeIcon className="w-3 h-3" />{typeConf.label}
            </span>
            {catConf && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catConf.color}`}>
                {catConf.label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onToggle}
            title={completed ? 'Mark incomplete' : 'Mark complete'}
            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
              completed ? 'bg-green-600 border-green-600 text-white' : 'border-gray-200 hover:border-green-400'
            }`}
          >
            {completed && <CheckCircle className="w-4 h-4" />}
          </button>
        </div>

        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5">{r.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{r.description}</p>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />{r.duration}
          </span>
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800"
          >
            Open <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
      {completed && (
        <div className="px-5 py-2 bg-green-50 border-t border-green-100 text-xs text-green-700 font-medium flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> Completed
        </div>
      )}
    </div>
  );
}

function ResourceRow({ resource: r, completed, onToggle }: { resource: Resource; completed: boolean; onToggle: () => void }) {
  const typeConf = TYPE_CONFIG[r.type];
  const TypeIcon = typeConf.icon;

  return (
    <div className={`flex items-center gap-4 px-5 py-4 transition-colors ${completed ? 'bg-green-50/40' : 'hover:bg-gray-50/50'}`}>
      {/* Type icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConf.color}`}>
        <TypeIcon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className={`font-semibold text-sm ${completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {r.title}
          </h3>
          {r.featured && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Featured</span>
          )}
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">{r.description}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />{r.duration}
          </span>
          <div className="flex gap-1 flex-wrap">
            {r.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open
        </a>
        <button
          type="button"
          onClick={onToggle}
          title={completed ? 'Mark incomplete' : 'Mark complete'}
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
            completed
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-gray-200 hover:border-green-400 text-transparent hover:text-green-400'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
