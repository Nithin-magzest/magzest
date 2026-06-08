import { useState } from 'react';
import {
  BookOpen, Play, FileText, Award, CheckCircle, Clock,
  Search, Star, Globe, GraduationCap, ChevronRight, Zap,
  Bookmark, LayoutGrid, ListOrdered,
} from 'lucide-react';

type ResourceType = 'video' | 'article' | 'guide' | 'webinar';
type Category = 'all' | 'getting-started' | 'application' | 'documents' | 'scholarships' | 'visa' | 'saved';

interface Resource {
  id: string;
  category: Exclude<Category, 'all' | 'saved'>;
  type: ResourceType;
  title: string;
  description: string;
  duration: string;
  url: string;
  tags: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  featured?: boolean;
}

const RESOURCES: Resource[] = [
  {
    id: 'gs-1', category: 'getting-started', type: 'video', title: 'How to Choose the Right University for You',
    description: 'A complete walkthrough of how to compare universities by ranking, location, tuition fees, and course quality to find the best fit.',
    duration: '20 min', url: 'https://www.youtube.com/results?search_query=how+to+choose+the+right+university+for+international+students',
    tags: ['Choosing', 'Rankings', 'Research'], level: 'Beginner', featured: true,
  },
  {
    id: 'gs-2', category: 'getting-started', type: 'article', title: 'Understanding University Requirements Before You Apply',
    description: 'Learn what universities look at — academic scores, English proficiency, work experience, and portfolio requirements.',
    duration: '10 min read', url: 'https://www.topuniversities.com/student-info/choosing-university/how-choose-university',
    tags: ['Requirements', 'Eligibility', 'Planning'], level: 'Beginner',
  },
  {
    id: 'gs-3', category: 'getting-started', type: 'guide', title: 'Creating Your Application Timeline: Month by Month',
    description: 'Plan backwards from your intended intake — when to research, test, apply, and accept offers to never miss a deadline.',
    duration: '8 min read', url: 'https://www.internationalstudent.com/study_usa/application-timeline/',
    tags: ['Timeline', 'Deadlines', 'Planning'], level: 'Beginner',
  },
  {
    id: 'gs-4', category: 'getting-started', type: 'webinar', title: 'Study Abroad 101: Everything You Need to Know',
    description: 'From selecting a country to arriving on campus — a comprehensive overview for first-time international applicants.',
    duration: '45 min', url: 'https://www.youtube.com/results?search_query=study+abroad+101+international+students+guide',
    tags: ['Overview', 'Countries', 'First Steps'], level: 'Beginner', featured: true,
  },
  {
    id: 'app-1', category: 'application', type: 'video', title: 'Step-by-Step: Filling a University Application Form',
    description: 'Watch a live walkthrough of completing an international university application — every section explained in detail.',
    duration: '25 min', url: 'https://www.youtube.com/results?search_query=how+to+fill+university+application+form+step+by+step',
    tags: ['Application Form', 'Walkthrough', 'Step-by-step'], level: 'Beginner', featured: true,
  },
  {
    id: 'app-2', category: 'application', type: 'article', title: 'Writing a Winning Statement of Purpose (SOP)',
    description: 'Structure, tone, and content strategies for crafting an SOP that convinces admissions teams you belong at their university.',
    duration: '15 min read', url: 'https://www.shemmassianconsulting.com/blog/statement-of-purpose',
    tags: ['SOP', 'Writing', 'Personal Statement'], level: 'Intermediate',
  },
  {
    id: 'app-3', category: 'application', type: 'guide', title: 'Applying to Multiple Universities: A Smart Strategy',
    description: 'How to build a balanced list of reach, match, and safety schools — and manage multiple applications simultaneously.',
    duration: '12 min read', url: 'https://www.kaplanpathways.com/about/news/applying-to-multiple-universities/',
    tags: ['Multiple Apps', 'Strategy', 'Safety Schools'], level: 'Intermediate',
  },
  {
    id: 'app-4', category: 'application', type: 'webinar', title: 'After Submission: What Happens Next?',
    description: 'Understanding offer letters, conditional vs unconditional offers, and how to respond professionally to university decisions.',
    duration: '30 min', url: 'https://www.youtube.com/results?search_query=university+application+after+submission+offer+letter+guide',
    tags: ['Offer Letters', 'Decisions', 'Next Steps'], level: 'Intermediate',
  },
  {
    id: 'app-5', category: 'application', type: 'video', title: 'Advanced Application Tactics: Standing Out from the Crowd',
    description: 'How top applicants craft portfolios, secure strong references, and tailor each application to a specific program.',
    duration: '35 min', url: 'https://www.youtube.com/results?search_query=how+to+stand+out+in+university+applications+advanced',
    tags: ['Portfolio', 'References', 'Differentiation'], level: 'Advanced', featured: true,
  },
  {
    id: 'doc-1', category: 'documents', type: 'guide', title: 'Complete Document Checklist for International Applications',
    description: 'Every document you will ever need: passport, transcripts, English scores, bank statements, SOP, and recommendation letters — with tips on formatting.',
    duration: '10 min read', url: 'https://www.internationalstudent.com/study_usa/university-application/documents-needed/',
    tags: ['Checklist', 'Documents', 'Formatting'], level: 'Beginner', featured: true,
  },
  {
    id: 'doc-2', category: 'documents', type: 'article', title: 'How to Get Strong Recommendation Letters',
    description: 'Who to ask, how to brief them, and what a great reference letter looks like — with a sample structure.',
    duration: '9 min read', url: 'https://www.prepscholar.com/gre/blog/how-to-ask-for-recommendation-letters/',
    tags: ['Recommendations', 'References', 'Letters'], level: 'Intermediate',
  },
  {
    id: 'doc-3', category: 'documents', type: 'video', title: 'Uploading & Submitting Documents: Avoiding Common Errors',
    description: 'File formats, size limits, naming conventions, and what to do if a document gets rejected by the online portal.',
    duration: '14 min', url: 'https://www.youtube.com/results?search_query=how+to+upload+university+application+documents+online+portal',
    tags: ['Upload', 'File Formats', 'Portals'], level: 'Beginner',
  },
  {
    id: 'doc-4', category: 'documents', type: 'guide', title: 'Financial Documents: Bank Statements & Sponsorship Letters',
    description: 'How to prepare financial proof that meets visa and university requirements — amounts, formatting, and certification.',
    duration: '11 min read', url: 'https://www.gov.uk/student-visa/documents-you-must-provide',
    tags: ['Finance', 'Bank Statement', 'Sponsorship'], level: 'Advanced',
  },
  {
    id: 'sch-1', category: 'scholarships', type: 'video', title: 'Finding Scholarships You Actually Qualify For',
    description: 'How to search scholarship databases, filter by your profile, and shortlist realistic opportunities to maximize success.',
    duration: '22 min', url: 'https://www.youtube.com/results?search_query=how+to+find+scholarships+international+students+guide',
    tags: ['Databases', 'Search', 'Eligibility'], level: 'Beginner', featured: true,
  },
  {
    id: 'sch-2', category: 'scholarships', type: 'article', title: 'Chevening, Commonwealth, Fulbright: Top Global Scholarships',
    description: 'Overview of the most prestigious scholarships for international students — requirements, timelines, and what makes a winning application.',
    duration: '14 min read', url: 'https://www.chevening.org/scholarships/',
    tags: ['Chevening', 'Commonwealth', 'Fulbright'], level: 'Advanced',
  },
  {
    id: 'sch-3', category: 'scholarships', type: 'guide', title: 'Writing a Scholarship Essay That Wins',
    description: 'Structure, tone, and storytelling techniques for crafting scholarship essays that move selection committees.',
    duration: '12 min read', url: 'https://www.scholarships.com/financial-aid/college-scholarships/scholarships-blog/2020/june/tips-for-writing-a-winning-scholarship-essay/',
    tags: ['Essay', 'Writing', 'Storytelling'], level: 'Intermediate',
  },
  {
    id: 'visa-1', category: 'visa', type: 'video', title: 'Student Visa Guide: UK, US, Canada & Australia',
    description: 'Side-by-side comparison of Tier 4, F-1, Study Permit, and Student Visa — requirements, costs, and processing times.',
    duration: '30 min', url: 'https://www.youtube.com/results?search_query=student+visa+guide+UK+US+Canada+Australia+comparison',
    tags: ['UK Visa', 'F-1 Visa', 'Canada', 'Australia'], level: 'Intermediate', featured: true,
  },
  {
    id: 'visa-2', category: 'visa', type: 'article', title: 'Preparing for Your Student Visa Interview',
    description: 'Common questions, correct answers, and what documents to bring — a realistic practice guide for visa applicants.',
    duration: '10 min read', url: 'https://www.internationalstudent.com/study_usa/student-visa/visa-interview/',
    tags: ['Visa Interview', 'Practice', 'Questions'], level: 'Intermediate',
  },
  {
    id: 'visa-3', category: 'visa', type: 'guide', title: 'Pre-Departure Checklist: From Acceptance to Arrival',
    description: 'Everything to do after receiving your visa — accommodation, flights, insurance, banking, and campus orientation.',
    duration: '8 min read', url: 'https://www.internationalstudent.com/study_usa/before-you-go/',
    tags: ['Pre-Departure', 'Accommodation', 'Insurance'], level: 'Beginner',
  },
  {
    id: 'visa-4', category: 'visa', type: 'webinar', title: 'What to Do If Your Visa Is Refused',
    description: 'Understanding refusal reasons, appeal rights, and how to strengthen a reapplication with a real case study.',
    duration: '40 min', url: 'https://www.youtube.com/results?search_query=student+visa+refusal+what+to+do+reapply+guide',
    tags: ['Refusal', 'Appeal', 'Reapplication'], level: 'Advanced',
  },
];

// Recommended learning order: beginner → expert
const LEARNING_PATH = [
  'gs-4', 'gs-1', 'gs-2', 'gs-3',
  'doc-1', 'app-1', 'app-2', 'doc-2', 'doc-3', 'doc-4',
  'app-3', 'app-5', 'app-4',
  'sch-1', 'sch-3', 'sch-2',
  'visa-1', 'visa-2', 'visa-4', 'visa-3',
];

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'all',             label: 'All Topics',      icon: BookOpen,      color: 'bg-gray-100 text-gray-700' },
  { id: 'getting-started', label: 'Getting Started',  icon: Zap,           color: 'bg-blue-100 text-blue-700' },
  { id: 'application',     label: 'Applications',     icon: FileText,      color: 'bg-indigo-100 text-indigo-700' },
  { id: 'documents',       label: 'Documents',        icon: CheckCircle,   color: 'bg-green-100 text-green-700' },
  { id: 'scholarships',    label: 'Scholarships',     icon: Award,         color: 'bg-amber-100 text-amber-700' },
  { id: 'visa',            label: 'Visa & Departure', icon: Globe,         color: 'bg-orange-100 text-orange-700' },
  { id: 'saved',           label: 'Saved',            icon: Bookmark,      color: 'bg-pink-100 text-pink-700' },
];

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced:     'bg-red-100 text-red-700',
};

const TYPE_CONFIG: Record<ResourceType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  video:   { label: 'Video',   color: 'bg-red-100 text-red-700',      icon: Play },
  article: { label: 'Article', color: 'bg-blue-100 text-blue-700',    icon: FileText },
  guide:   { label: 'Guide',   color: 'bg-green-100 text-green-700',  icon: BookOpen },
  webinar: { label: 'Webinar', color: 'bg-purple-100 text-purple-700', icon: Star },
};

const STORAGE_KEY   = 'student_learning_completed';
const COMMENTS_KEY  = 'student_learning_comments';
const BOOKMARKS_KEY = 'student_learning_bookmarks';

function loadSet(key: string): Set<string> {
  try { const r = localStorage.getItem(key); return r ? new Set(JSON.parse(r)) : new Set(); }
  catch { return new Set(); }
}
function saveSet(key: string, s: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...s]));
}
function parseMins(d: string): number {
  const m = d.match(/(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

export default function StudentLearning() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');
  const [viewMode, setViewMode]     = useState<'grid' | 'path'>('grid');
  const [completed, setCompleted]   = useState<Set<string>>(() => loadSet(STORAGE_KEY));
  const [bookmarks, setBookmarks]   = useState<Set<string>>(() => loadSet(BOOKMARKS_KEY));
  const [comments, setComments]     = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}'); } catch { return {}; }
  });

  const toggle = (id: string) => setCompleted(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id);
    saveSet(STORAGE_KEY, next); return next;
  });

  const toggleBookmark = (id: string) => setBookmarks(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id);
    saveSet(BOOKMARKS_KEY, next); return next;
  });

  const setComment = (id: string, text: string) => setComments(prev => {
    const next = { ...prev, [id]: text };
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(next)); return next;
  });

  const total         = RESOURCES.length;
  const completedCount = completed.size;
  const progressPct   = Math.round((completedCount / total) * 100);
  const remainingMins = RESOURCES.filter(r => !completed.has(r.id)).reduce((s, r) => s + parseMins(r.duration), 0);
  const timeLeft      = remainingMins >= 60
    ? `${Math.floor(remainingMins / 60)}h ${remainingMins % 60}m`
    : `${remainingMins}m`;

  const catDone = (catId: string) => {
    const rs = RESOURCES.filter(r => r.category === catId);
    return rs.length > 0 && rs.every(r => completed.has(r.id));
  };

  const filtered = RESOURCES.filter(r => {
    if (activeCategory === 'saved') return bookmarks.has(r.id);
    const matchCat  = activeCategory === 'all' || r.category === activeCategory;
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const q = search.toLowerCase();
    const matchQ = !search || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchType && matchQ;
  });

  const featured = filtered.filter(r => r.featured);
  const rest     = filtered.filter(r => !r.featured);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d1b4b] via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Student Portal</p>
                <h1 className="text-2xl font-bold leading-tight">Learning Hub</h1>
              </div>
            </div>
            <p className="text-blue-100 text-sm max-w-xl">
              Everything you need to navigate the university application process — from choosing a course to arriving on campus.
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-blue-200 flex-wrap">
              <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" />{RESOURCES.filter(r => r.type === 'video').length} videos</span>
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{RESOURCES.filter(r => r.type === 'article').length} articles</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{RESOURCES.filter(r => r.type === 'guide').length} guides</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeLeft} left</span>
            </div>
          </div>
          {/* Progress card */}
          <div className="bg-white/10 rounded-2xl p-4 min-w-[180px] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Your Progress</span>
              <span className="text-lg font-bold">{progressPct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-blue-200">{completedCount} of {total} completed</p>
            {bookmarks.size > 0 && (
              <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                <Bookmark className="w-3 h-3 fill-amber-300" />{bookmarks.size} saved
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Search + view mode */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search topics, guides, videos…"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <button type="button" onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-[#0d1b4b] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
          <button type="button" onClick={() => setViewMode('path')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'path' ? 'bg-[#0d1b4b] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            <ListOrdered className="w-4 h-4" /> Path
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const Icon  = cat.icon;
          const count = cat.id === 'all' ? RESOURCES.length
            : cat.id === 'saved' ? bookmarks.size
            : RESOURCES.filter(r => r.category === cat.id).length;
          const done  = cat.id !== 'all' && cat.id !== 'saved' && catDone(cat.id);
          return (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                activeCategory === cat.id
                  ? 'bg-[#0d1b4b] text-white border-[#0d1b4b] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              {done && <CheckCircle className="w-3 h-3 text-green-400" />}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20 text-white' : cat.color}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Type filter (hidden in path mode) */}
      {viewMode === 'grid' && activeCategory !== 'saved' && (
        <div className="flex gap-2 flex-wrap">
          {(['all', 'video', 'article', 'guide', 'webinar'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-[#0d1b4b] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {t === 'all' ? 'All Types' : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {viewMode === 'path' ? (
        <PathView
          resources={RESOURCES}
          learningPath={LEARNING_PATH}
          categories={CATEGORIES}
          completed={completed}
          bookmarks={bookmarks}
          onToggle={toggle}
          onBookmark={toggleBookmark}
          comments={comments}
          onComment={setComment}
        />
      ) : (
        <>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{activeCategory === 'saved' ? 'No saved resources yet. Click the bookmark icon on any card.' : `No results for "${search}"`}</p>
            </div>
          )}

          {featured.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> Featured
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featured.map(r => (
                  <ResourceCard key={r.id} r={r} done={completed.has(r.id)} bookmarked={bookmarks.has(r.id)}
                    onToggle={() => toggle(r.id)} onBookmark={() => toggleBookmark(r.id)}
                    comment={comments[r.id] || ''} onComment={v => setComment(r.id, v)} />
                ))}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div>
              {featured.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">More Resources</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rest.map(r => (
                  <ResourceCard key={r.id} r={r} done={completed.has(r.id)} bookmarked={bookmarks.has(r.id)}
                    onToggle={() => toggle(r.id)} onBookmark={() => toggleBookmark(r.id)}
                    comment={comments[r.id] || ''} onComment={v => setComment(r.id, v)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Resource Card (Grid) ─────────────────────────────────────────────────── */
function ResourceCard({ r, done, bookmarked, onToggle, onBookmark, comment, onComment }: {
  r: Resource; done: boolean; bookmarked: boolean;
  onToggle: () => void; onBookmark: () => void;
  comment: string; onComment: (v: string) => void;
}) {
  const typeCfg = TYPE_CONFIG[r.type];
  const TypeIcon = typeCfg.icon;
  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${done ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${typeCfg.color}`}>
              <TypeIcon className="w-3 h-3" />{typeCfg.label}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[r.level]}`}>
              {r.level}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button type="button" onClick={onBookmark} title={bookmarked ? 'Remove bookmark' : 'Save for later'}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${bookmarked ? 'bg-amber-100 text-amber-500' : 'bg-gray-100 text-gray-300 hover:text-amber-400 hover:bg-amber-50'}`}>
              <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
            <button type="button" onClick={onToggle} title={done ? 'Mark incomplete' : 'Mark complete'}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'}`}>
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <a href={r.url} target="_blank" rel="noopener noreferrer" className={`font-bold text-sm leading-snug mb-1.5 block hover:underline ${done ? 'line-through text-gray-400' : 'text-gray-900 hover:text-blue-700'}`}>{r.title}</a>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">{r.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {r.tags.map(tag => (
            <span key={tag} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">{tag}</span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />{r.duration}
          </span>
          <a href={r.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#0d1b4b] text-white hover:bg-[#152258] px-3 py-1.5 rounded-lg transition-colors">
            Open <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
      {done && (
        <div className="border-t border-green-100 bg-green-50/40 px-5 py-3">
          <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Notes</p>
          <textarea value={comment} onChange={e => onComment(e.target.value)}
            placeholder="Add a note about this resource…" rows={2}
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 placeholder-gray-300 bg-white" />
        </div>
      )}
    </div>
  );
}

/* ─── Path View ────────────────────────────────────────────────────────────── */
function PathView({ resources, learningPath, categories, completed, bookmarks, onToggle, onBookmark, comments, onComment }: {
  resources: Resource[];
  learningPath: string[];
  categories: typeof CATEGORIES;
  completed: Set<string>;
  bookmarks: Set<string>;
  onToggle: (id: string) => void;
  onBookmark: (id: string) => void;
  comments: Record<string, string>;
  onComment: (id: string, v: string) => void;
}) {
  const pathMap = new Map(learningPath.map((id, i) => [id, i + 1]));
  const pathResources = learningPath.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];

  const groups = categories
    .filter(c => c.id !== 'all' && c.id !== 'saved')
    .map(cat => ({ ...cat, items: pathResources.filter(r => r.category === cat.id) }))
    .filter(g => g.items.length > 0);

  const totalSteps   = learningPath.length;
  const doneSteps    = learningPath.filter(id => completed.has(id)).length;
  const pathProgress = Math.round((doneSteps / totalSteps) * 100);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-gray-800">Learning Roadmap</p>
            <p className="text-xs text-gray-500 mt-0.5">Follow this path from beginner to ready-to-depart</p>
          </div>
          <span className="text-2xl font-bold text-[#0d1b4b]">{pathProgress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${pathProgress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">{doneSteps} of {totalSteps} steps completed</p>
      </div>

      {groups.map(group => {
        const Icon    = group.icon;
        const allDone = group.items.every(r => completed.has(r.id));
        return (
          <div key={group.id}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${allDone ? 'bg-green-100' : group.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-gray-800">{group.label}</h2>
              {allDone && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Complete
                </span>
              )}
            </div>

            <div className="relative pl-8 space-y-3">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200 rounded-full" />
              {group.items.map(r => {
                const step = pathMap.get(r.id) ?? 0;
                const done = completed.has(r.id);
                const bm   = bookmarks.has(r.id);
                const typeCfg  = TYPE_CONFIG[r.type];
                const TypeIcon = typeCfg.icon;
                return (
                  <div key={r.id} className="relative flex gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 text-[10px] font-bold mt-3 -ml-[3px] ${
                      done ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {done ? '✓' : step}
                    </div>
                    <div className={`flex-1 bg-white rounded-xl border shadow-sm p-4 transition-all ${done ? 'border-green-100 bg-green-50/20' : 'border-gray-100 hover:shadow-md'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${typeCfg.color}`}>
                            <TypeIcon className="w-3 h-3" />{typeCfg.label}
                          </span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[r.level]}`}>{r.level}</span>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button type="button" onClick={() => onBookmark(r.id)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${bm ? 'bg-amber-100 text-amber-500' : 'bg-gray-100 text-gray-300 hover:text-amber-400'}`}>
                            <Bookmark className="w-3.5 h-3.5" fill={bm ? 'currentColor' : 'none'} />
                          </button>
                          <button type="button" onClick={() => onToggle(r.id)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'}`}>
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className={`font-bold text-sm leading-snug mb-1 ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{r.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-2">{r.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{r.duration}</span>
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold bg-[#0d1b4b] text-white hover:bg-[#152258] px-3 py-1.5 rounded-lg transition-colors">
                          Open <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                      {done && (
                        <div className="mt-3 border-t border-green-100 pt-3">
                          <textarea value={comments[r.id] || ''} onChange={e => onComment(r.id, e.target.value)}
                            placeholder="Add a note…" rows={1}
                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 placeholder-gray-300 bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
