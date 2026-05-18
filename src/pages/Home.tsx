import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, BookOpen, ArrowRight, ChevronRight, Globe } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const FLAGS: Record<string, string> = {
  Canada: '🇨🇦', Australia: '🇦🇺', 'United Kingdom': '🇬🇧',
  Germany: '🇩🇪', Singapore: '🇸🇬', Netherlands: '🇳🇱',
  'United States': '🇺🇸', 'New Zealand': '🇳🇿',
};

const TABS = ['All', 'Computer Science', 'Business & MBA', 'Engineering', 'Data Science & AI', 'Medicine'];

const BADGE_STYLES: Record<string, string> = {
  'Scholarship Available': 'bg-green-100 text-green-700',
  'High Demand': 'bg-red-100 text-red-700',
  'Top Ranked': 'bg-blue-100 text-blue-700',
  'Free Tuition': 'bg-purple-100 text-purple-700',
  'Accepting Now': 'bg-emerald-100 text-emerald-700',
  'Highly Competitive': 'bg-amber-100 text-amber-700',
};
const BADGES = Object.keys(BADGE_STYLES);

const DESTINATIONS = [
  { country: 'United States', flag: '🇺🇸', count: '4,200+ programs' },
  { country: 'United Kingdom', flag: '🇬🇧', count: '3,800+ programs' },
  { country: 'Canada', flag: '🇨🇦', count: '2,100+ programs' },
  { country: 'Australia', flag: '🇦🇺', count: '1,900+ programs' },
  { country: 'Germany', flag: '🇩🇪', count: '1,200+ programs', badge: 'Free Tuition' },
  { country: 'Singapore', flag: '🇸🇬', count: '450+ programs' },
  { country: 'Netherlands', flag: '🇳🇱', count: '890+ programs' },
  { country: 'New Zealand', flag: '🇳🇿', count: '340+ programs' },
];

const STEPS = [
  { title: 'Register Free', desc: 'Create your profile with academic background and goals.', num: '01' },
  { title: 'Search Programs', desc: 'Browse 200,000+ programs with smart filters that match your profile.', num: '02' },
  { title: 'Meet Your Advisor', desc: 'Get matched with a dedicated counselor specializing in your destination.', num: '03' },
  { title: 'Apply with Support', desc: 'Submit applications with full document assistance and SOP guidance.', num: '04' },
  { title: 'Funding & Visa', desc: 'Discover scholarships and get step-by-step visa application help.', num: '05' },
  { title: 'Fly & Settle', desc: 'Pre-departure briefing and arrival support to start your journey right.', num: '06' },
];

const TRACKER_DEMO = [
  { uni: 'MIT', course: 'MSc Computer Science & AI', flag: '🇺🇸', progress: 100, status: 'Accepted', statusCls: 'text-green-700 bg-green-100' },
  { uni: 'University of Oxford', course: 'MBA', flag: '🇬🇧', progress: 60, status: 'Under Review', statusCls: 'text-amber-700 bg-amber-100' },
  { uni: 'TU Munich', course: 'MSc Electrical Engineering', flag: '🇩🇪', progress: 100, status: 'Submitted', statusCls: 'text-blue-700 bg-blue-100' },
  { uni: 'University of Toronto', course: 'MSc Data Science', flag: '🇨🇦', progress: 40, status: 'Docs Needed', statusCls: 'text-orange-700 bg-orange-100' },
];

const TESTIMONIALS = [
  { name: 'Rahul Mehta', from: '🇮🇳 India', uni: 'University of Toronto', text: 'The platform made my dream of studying in Canada a reality. My counselor guided me every step from shortlisting to visa!' },
  { name: 'Fatima Al-Rashid', from: '🇦🇪 UAE', uni: 'TU Munich', text: 'Got into TU Munich with a full scholarship! The search tools and advisor helped me find the perfect affordable program.' },
  { name: 'Linh Nguyen', from: '🇻🇳 Vietnam', uni: 'University of Edinburgh', text: 'Incredibly easy to use. I compared 20+ universities and found my ideal match. Accepted in just 6 weeks!' },
];

function getField(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('computer') || n.includes('software') || n.includes('information')) return 'Computer Science';
  if (n.includes('data') || n.includes('ai') || n.includes('artificial') || n.includes('machine')) return 'Data Science & AI';
  if (n.includes('business') || n.includes('mba') || n.includes('management') || n.includes('finance')) return 'Business & MBA';
  if (n.includes('engineer') || n.includes('electrical') || n.includes('mechanical') || n.includes('civil')) return 'Engineering';
  if (n.includes('medicine') || n.includes('medical') || n.includes('health')) return 'Medicine';
  return 'Other';
}

function progressWidth(pct: number): string {
  if (pct >= 100) return 'w-full';
  if (pct >= 75) return 'w-3/4';
  if (pct >= 60) return 'w-3/5';
  if (pct >= 50) return 'w-1/2';
  if (pct >= 40) return 'w-2/5';
  if (pct >= 25) return 'w-1/4';
  return 'w-1/5';
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [destination, setDestination] = useState('');
  const [field, setField] = useState('');
  const [level, setLevel] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    api.universities.list().then(setUniversities).catch(() => {});
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set('country', destination);
    if (level) params.set('level', level);
    navigate(`/search?${params.toString()}`);
  };

  const handleApply = () => {
    if (isAuthenticated && user?.role === 'student') navigate('/student/applications');
    else navigate('/login');
  };

  const handleSubscribe = () => {
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  const countries = [...new Set(universities.map((u: any) => u.country))].sort();

  const allPrograms = universities.flatMap((u: any, ui: number) =>
    (u.courses || []).slice(0, 2).map((c: any, ci: number) => ({
      key: `${u.id}-${ci}`,
      uniId: u.id,
      uni: u.name,
      course: c.name,
      country: u.country,
      city: u.city,
      flag: FLAGS[u.country] || '🌍',
      level: c.level,
      duration: c.duration,
      fee: `${u.averageFees?.currency || ''} ${(c.tuition || u.averageFees?.postgraduate || 0).toLocaleString()}/yr`,
      badge: BADGES[(ui * 2 + ci) % BADGES.length],
      field: getField(c.name),
    }))
  );

  const filteredPrograms = (activeTab === 'All' ? allPrograms : allPrograms.filter(p => p.field === activeTab)).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            ⭐ Trusted by 50,000+ students worldwide
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
            Find Your Perfect{' '}
            <span className="text-blue-600">Program</span>
            <br className="hidden sm:block" />
            to Study Abroad
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Search 200,000+ courses at top universities across 40+ countries. Free counseling included.
          </p>

          {/* Search box */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  aria-label="Select destination country"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 text-sm text-gray-700 focus:outline-none bg-gray-50 rounded-xl appearance-none border-0"
                >
                  <option value="">🌍  Destination</option>
                  {countries.map(c => <option key={c} value={c}>{FLAGS[c] || ''} {c}</option>)}
                </select>
              </div>
              <div className="hidden md:block w-px bg-gray-200 my-1" />
              <div className="flex-1 relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  aria-label="Select field of study"
                  value={field}
                  onChange={e => setField(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 text-sm text-gray-700 focus:outline-none bg-gray-50 rounded-xl appearance-none border-0"
                >
                  <option value="">📚  Field of Study</option>
                  {['Computer Science', 'Engineering', 'Business & MBA', 'Data Science & AI', 'Medicine', 'Law', 'Arts & Design'].map(f => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="hidden md:block w-px bg-gray-200 my-1" />
              <div className="flex-1">
                <select
                  aria-label="Select degree level"
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-gray-700 focus:outline-none bg-gray-50 rounded-xl appearance-none border-0"
                >
                  <option value="">🎓  Degree Level</option>
                  {["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate'].map(l => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </div>

          {/* Popular tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-5 items-center">
            <span className="text-sm text-gray-400">Popular:</span>
            {[
              { label: 'Canada', param: 'country=Canada' },
              { label: 'Germany', param: 'country=Germany' },
              { label: 'Computer Science', param: 'q=Computer+Science' },
              { label: "Master's", param: 'level=Master' },
              { label: 'Scholarship', param: 'q=scholarship' },
            ].map(tag => (
              <button
                key={tag.label}
                type="button"
                onClick={() => navigate(`/search?${tag.param}`)}
                className="text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-y border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '200K+', label: 'Programs Listed' },
              { value: '2,400+', label: 'Partner Universities' },
              { value: '40+', label: 'Countries' },
              { value: '50K+', label: 'Students Helped' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-blue-600">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROGRAMS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Programs</h2>
              <p className="text-gray-500 mt-2">Handpicked programs from top-ranked universities</p>
            </div>
            <Link to="/universities" className="hidden md:flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Program cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrograms.map(p => (
              <div key={p.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-700 text-lg flex-shrink-0">
                      {p.uni.charAt(0)}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE_STYLES[p.badge]}`}>{p.badge}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 leading-snug mb-1">{p.course}</h3>
                  <p className="text-sm text-gray-500 mb-3">{p.uni}</p>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                    <MapPin className="w-3 h-3" /> {p.flag} {p.city}, {p.country}
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span className="bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">{p.level}</span>
                    <span className="bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">{p.duration}</span>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Tuition / year</p>
                    <p className="font-bold text-gray-900 text-sm">{p.fee}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/universities" className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
              Browse All Programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARTNER UNIVERSITIES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Partner Universities</h2>
              <p className="text-gray-500 mt-2">Top-ranked institutions from around the world</p>
            </div>
            <Link to="/universities" className="hidden md:flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {universities.map((u: any) => (
              <Link key={u.id} to={`/university/${u.id}`} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group text-center">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 group-hover:bg-blue-700 transition-colors">
                  {u.name.charAt(0)}
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{u.name}</p>
                <p className="text-xs text-gray-400 mt-1">{FLAGS[u.country] || ''} {u.city}, {u.country}</p>
                <p className="text-xs text-blue-600 font-medium mt-2">#{u.ranking} World</p>
                <p className="text-xs text-gray-400"><BookOpen className="w-3 h-3 inline mr-0.5" />{(u.courses || []).length} programs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STUDY DESTINATIONS ── */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Top Study Destinations</h2>
            <p className="text-gray-500 mt-3">Choose your dream country and explore programs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DESTINATIONS.map(d => (
              <Link
                key={d.country}
                to={`/search?country=${encodeURIComponent(d.country)}`}
                className="bg-white rounded-2xl p-5 text-center border border-white hover:border-blue-200 hover:shadow-md transition-all group relative"
              >
                {'badge' in d && (
                  <span className="absolute top-3 right-3 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{d.badge}</span>
                )}
                <div className="text-4xl mb-3">{d.flag}</div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{d.country}</p>
                <p className="text-xs text-gray-400 mt-1">{d.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-3 text-lg">Six simple steps to your dream university abroad</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.num} className="flex gap-4">
                <div className="flex-shrink-0 w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-sm shadow-blue-200">
                  {s.num}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/login" className="bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
              Register Free <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── APPLICATION TRACKER ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
                Real-time Tracking
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Track Every Application in Real Time</h2>
              <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                See exactly where each application stands — from document submission to final acceptance. Never miss a deadline again.
              </p>
              <Link
                to={isAuthenticated && user?.role === 'student' ? '/student/applications' : '/login'}
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Start Tracking Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              {TRACKER_DEMO.map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.flag} {item.uni}</p>
                      <p className="text-xs text-gray-500">{item.course}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${item.statusCls}`}>{item.status}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className={`bg-blue-600 h-1.5 rounded-full ${progressWidth(item.progress)}`} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Students Say</h2>
            <p className="text-gray-500 mt-3">Real stories from students who achieved their dreams</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-7 border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-700 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.from} → {t.uni}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Your Dream University is One Click Away</h2>
          <p className="text-blue-100 text-lg mb-8">Join 50,000+ students who found their perfect program with EduAbroad</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link to="/login" className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors">
              Register for Free
            </Link>
            <Link to="/universities" className="border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2">
              Browse Programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-blue-200 text-sm mb-3">Get study abroad tips in your inbox</p>
          {subscribed ? (
            <p className="text-white font-medium">Thanks for subscribing! 🎉 Check your inbox soon.</p>
          ) : (
            <div className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                placeholder="Your email address"
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="button"
                onClick={handleSubscribe}
                className="bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap text-sm"
              >
                Subscribe Free
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1.5 rounded-lg"><Globe className="w-4 h-4 text-white" /></div>
                <span className="text-white font-bold text-lg">EduAbroad</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">Empowering students worldwide to discover, apply, and thrive at the world's best universities.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Students</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/universities" className="hover:text-white transition-colors">Browse Programs</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">My Applications</Link></li>
                <li><Link to="/search" className="hover:text-white transition-colors">Scholarships</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Visa Guides</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Destinations</h4>
              <ul className="space-y-2 text-sm">
                {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'].map(c => (
                  <li key={c}><Link to={`/search?country=${encodeURIComponent(c)}`} className="hover:text-white transition-colors">{c}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Our Advisors</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Partner with Us</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
            <p>© 2026 EduAbroad. All rights reserved.</p>
            <p className="flex items-center gap-4">
              <span>🔒 SSL Secured</span>
              <span>GDPR Compliant</span>
              <span>Free to Apply</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
