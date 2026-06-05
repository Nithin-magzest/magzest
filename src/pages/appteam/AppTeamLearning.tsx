import { useState } from 'react';
import { GraduationCap, BookOpen, CheckCircle, Search, X, Play, FileText, Layers, UserCog, MessageSquare, TrendingUp, AlertCircle, Zap } from 'lucide-react';

const STORAGE_KEY = 'appteam_learning_completed';

const CATEGORIES = [
  { id: 'all',           label: 'All Resources', icon: Layers },
  { id: 'processing',    label: 'Processing',    icon: Zap },
  { id: 'statuses',      label: 'Statuses',      icon: TrendingUp },
  { id: 'documents',     label: 'Documents',     icon: FileText },
  { id: 'coordination',  label: 'Coordination',  icon: UserCog },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
];

const RESOURCES = [
  {
    id: 'app-flow-overview',
    category: 'processing',
    type: 'guide',
    level: 'Beginner',
    featured: true,
    title: 'Application Processing: End-to-End Flow',
    description: 'A complete walkthrough of how an application moves from Submitted → Accepted. Understand every handoff and who is responsible at each stage.',
    duration: '10 min',
    tags: ['workflow', 'overview'],
  },
  {
    id: 'status-meanings',
    category: 'statuses',
    type: 'article',
    level: 'Beginner',
    featured: true,
    title: 'Understanding Every Application Status',
    description: 'Draft, Submitted, Under Review, Offer Received, Accepted, Enrolled, Rejected — what each status means, when to use it, and who triggers the change.',
    duration: '8 min',
    tags: ['statuses', 'reference'],
  },
  {
    id: 'status-update-guide',
    category: 'statuses',
    type: 'guide',
    level: 'Beginner',
    title: 'How to Update an Application Status',
    description: 'Step-by-step guide to updating application status in the system, adding processing notes, and notifying the student and counselor.',
    duration: '5 min',
    tags: ['statuses', 'how-to'],
  },
  {
    id: 'doc-verification',
    category: 'documents',
    type: 'guide',
    level: 'Beginner',
    featured: true,
    title: 'Document Verification Checklist',
    description: 'How to review Passports, Transcripts, SOP, LOR, and bank statements. What to look for, common issues, and how to mark documents verified or rejected.',
    duration: '12 min',
    tags: ['documents', 'checklist'],
  },
  {
    id: 'doc-quality-check',
    category: 'documents',
    type: 'article',
    level: 'Intermediate',
    title: 'Spotting Fraudulent or Incomplete Documents',
    description: 'Red flags to watch for in transcripts, degrees, and bank statements. How to escalate suspected issues to senior admin.',
    duration: '10 min',
    tags: ['documents', 'quality'],
  },
  {
    id: 'processing-notes',
    category: 'processing',
    type: 'guide',
    level: 'Beginner',
    title: 'Writing Effective Processing Notes',
    description: 'How to write clear, actionable notes when updating an application. Best practices that help counselors and students understand the next step.',
    duration: '6 min',
    tags: ['processing', 'notes'],
  },
  {
    id: 'bulk-processing',
    category: 'processing',
    type: 'article',
    level: 'Intermediate',
    title: 'Handling a High Volume of Applications',
    description: 'Prioritisation strategies, batch processing tips, and how to use filters in the applications view to work through a large queue efficiently.',
    duration: '8 min',
    tags: ['processing', 'efficiency'],
  },
  {
    id: 'counselor-coordination',
    category: 'coordination',
    type: 'guide',
    level: 'Beginner',
    title: 'Working with Counselors on Applications',
    description: 'When to involve a counselor, how to use the in-app chat to coordinate, and escalating issues that need counselor action.',
    duration: '7 min',
    tags: ['counselors', 'collaboration'],
  },
  {
    id: 'escalation-procedure',
    category: 'coordination',
    type: 'guide',
    level: 'Intermediate',
    title: 'Escalation Procedures',
    description: 'When and how to escalate an application to senior admin. What information to include, and expected response times.',
    duration: '6 min',
    tags: ['escalation', 'admin'],
  },
  {
    id: 'student-communication',
    category: 'communication',
    type: 'guide',
    level: 'Beginner',
    title: 'Responding to Student Questions',
    description: 'How to use the comment thread on an application to respond to student queries. Tone guidelines and response time expectations.',
    duration: '5 min',
    tags: ['students', 'communication'],
  },
  {
    id: 'offer-handling',
    category: 'processing',
    type: 'article',
    level: 'Intermediate',
    title: 'Processing Offer Letters',
    description: 'What to do when a university sends an offer. How to update the status, attach documents, and guide the student towards acceptance.',
    duration: '8 min',
    tags: ['offers', 'processing'],
  },
  {
    id: 'rejection-handling',
    category: 'processing',
    type: 'guide',
    level: 'Intermediate',
    title: 'Handling Rejections and Reapplications',
    description: 'How to record a rejection, communicate sensitively, and help the student understand reapplication options.',
    duration: '7 min',
    tags: ['rejection', 'student-support'],
  },
  {
    id: 'reporting-basics',
    category: 'coordination',
    type: 'article',
    level: 'Advanced',
    title: 'Using the Live Feed and Activity Logs',
    description: 'How to read the live feed for real-time updates, export activity logs, and prepare summary reports for management.',
    duration: '10 min',
    tags: ['reporting', 'analytics'],
  },
  {
    id: 'pdf-reports',
    category: 'documents',
    type: 'guide',
    level: 'Beginner',
    title: 'Generating and Sharing PDF Application Reports',
    description: 'How to generate the PDF report for any application, what it includes, and when to share it with counselors, students, or admin.',
    duration: '4 min',
    tags: ['pdf', 'reporting'],
  },
  {
    id: 'advanced-filters',
    category: 'processing',
    type: 'article',
    level: 'Advanced',
    title: 'Mastering the Applications Filter & Search',
    description: 'Advanced use of status tabs, counselor filters, and the search bar to quickly locate specific applications and build working queues.',
    duration: '6 min',
    tags: ['filters', 'efficiency'],
  },
];

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Play,
  article: BookOpen,
  guide: FileText,
  webinar: AlertCircle,
};

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     'bg-green-50 text-green-700 border-green-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced:     'bg-red-50 text-red-700 border-red-200',
};

function ResourceCard({ resource, completed, onToggle }: { resource: typeof RESOURCES[0]; completed: boolean; onToggle: () => void }) {
  const TypeIcon = TYPE_ICONS[resource.type] || FileText;
  return (
    <div className={`bg-white rounded-xl border p-5 flex flex-col gap-3 shadow-sm transition-all ${completed ? 'border-green-300 bg-green-50/30' : 'border-gray-100 hover:border-orange-200 hover:shadow-md'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[resource.level]}`}>{resource.level}</span>
          <span className="text-xs text-gray-400 capitalize">{resource.type}</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          title={completed ? 'Mark as incomplete' : 'Mark as complete'}
          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
            completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {completed && <CheckCircle className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <TypeIcon className="w-4 h-4 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{resource.title}</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{resource.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-wrap gap-1">
          {resource.tags.map(tag => (
            <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{resource.duration}</span>
      </div>
    </div>
  );
}

export default function AppTeamLearning() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
    catch { return new Set(); }
  });

  const toggle = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const visible = RESOURCES.filter(r => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.includes(q));
    }
    return true;
  });

  const featured = visible.filter(r => r.featured);
  const rest = visible.filter(r => !r.featured);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Learning Hub</h1>
            <p className="text-orange-100 text-sm">Application Team Training & Reference</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold">{RESOURCES.length}</div>
            <div className="text-orange-100 text-xs">Resources</div>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold">{completed.size}</div>
            <div className="text-orange-100 text-xs">Completed</div>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold">{RESOURCES.length - completed.size}</div>
            <div className="text-orange-100 text-xs">Remaining</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search resources…"
          className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        {search && (
          <button type="button" aria-label="Clear search" onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No resources match your search.</p>
        </div>
      ) : (
        <>
          {featured.length > 0 && !search && (
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-3">Start Here</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map(r => (
                  <ResourceCard key={r.id} resource={r} completed={completed.has(r.id)} onToggle={() => toggle(r.id)} />
                ))}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div>
              {featured.length > 0 && !search && <h2 className="text-sm font-bold text-gray-700 mb-3">All Resources</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(search ? visible : rest).map(r => (
                  <ResourceCard key={r.id} resource={r} completed={completed.has(r.id)} onToggle={() => toggle(r.id)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
