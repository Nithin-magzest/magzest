import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, BookOpen, ExternalLink } from 'lucide-react';
import { api } from '../../api';

export default function CounselorUniversities() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    api.universities.list().then(setUniversities).catch(() => {});
  }, []);

  const countries = [...new Set(universities.map((u: any) => u.country))].sort();

  const filtered = universities.filter((u: any) => {
    const q = query.toLowerCase();
    const matchQuery = !query || u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q);
    const matchCountry = !country || u.country === country;
    return matchQuery && matchCountry;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partner Universities</h1>
        <p className="text-gray-500 mt-1">Browse all partner universities to recommend to students</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search universities..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <select aria-label="Filter by country" value={country} onChange={e => setCountry(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Countries</option>
          {countries.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(uni => (
          <div key={uni.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex gap-4 p-5">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-700 text-xl flex-shrink-0">
                {uni.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 leading-tight">{uni.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">#{uni.ranking}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {uni.city}, {uni.country}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-sm text-gray-600"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />{uni.rating}</span>
                  <span className="flex items-center gap-1 text-sm text-gray-600"><BookOpen className="w-3.5 h-3.5" />{uni.courses.length} courses</span>
                  <span className="text-sm text-gray-600">{uni.acceptanceRate}% acceptance</span>
                </div>
              </div>
            </div>
            <div className="px-5 pb-4 flex gap-2">
              <Link to={`/university/${uni.id}`} className="flex-1 text-center bg-green-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
                View Details
              </Link>
              <a href={uni.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
