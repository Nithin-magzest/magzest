import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, BookOpen, X } from 'lucide-react';
import { api } from '../../api';

export default function StudentUniversities() {
  const [allUniversities, setAllUniversities] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [level, setLevel] = useState('');

  useEffect(() => {
    api.universities.list().then(setAllUniversities).catch(() => {});
  }, []);

  const countries = [...new Set(allUniversities.map(u => u.country))].sort() as string[];

  const filtered = useMemo(() => {
    let result = allUniversities;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q) || u.country.toLowerCase().includes(q) || u.tags.some((t: string) => t.toLowerCase().includes(q)));
    }
    if (country) result = result.filter(u => u.country === country);
    if (level) result = result.filter(u => u.courses.some((c: any) => c.level === level));
    return result;
  }, [allUniversities, query, country, level]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Universities</h1>
        <p className="text-gray-500 mt-1">Explore partner universities and their offerings</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, city, tags..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select aria-label="Filter by country" value={country} onChange={e => setCountry(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Countries</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
          <select aria-label="Filter by level" value={level} onChange={e => setLevel(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Levels</option>
            {['Bachelor', 'Master', 'PhD'].map(l => <option key={l}>{l}</option>)}
          </select>
          {(query || country || level) && (
            <button type="button" onClick={() => { setQuery(''); setCountry(''); setLevel(''); }} className="flex items-center gap-1 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-3">{filtered.length} universities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(uni => (
          <Link key={uni.id} to={`/university/${uni.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden group">
            <div className="h-40 bg-gradient-to-br from-blue-400 to-indigo-600 relative overflow-hidden">
              <img src={uni.coverImage} alt={uni.name} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="absolute top-2 left-2 bg-white/90 text-xs font-bold text-blue-800 px-2.5 py-1 rounded-full">#{uni.ranking}</div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-gray-800">{uni.rating}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{uni.name}</h3>
              <div className="flex items-center gap-1 text-gray-500 text-xs mt-1 mb-3">
                <MapPin className="w-3 h-3" /> {uni.city}, {uni.country}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-gray-600"><BookOpen className="w-3.5 h-3.5" /> {uni.courses.length} courses</span>
                <span className="font-semibold text-blue-700">{uni.averageFees.currency} {uni.averageFees.postgraduate.toLocaleString()}/yr</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
