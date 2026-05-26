import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight, BookOpen, DollarSign } from 'lucide-react';
import { api } from '../api';

function UniCoverImg({ website, coverImage, name }: { website?: string; coverImage?: string; name: string }) {
  const thumbUrl = website ? `https://image.thum.io/get/width/1280/crop/640/${website}` : null;
  const [src, setSrc] = useState<string | null>(thumbUrl || coverImage || null);
  const [usedThumb, setUsedThumb] = useState(!!thumbUrl);

  const handleError = () => {
    if (usedThumb && coverImage) { setSrc(coverImage); setUsedThumb(false); }
    else setSrc(null);
  };

  if (!src) return null;
  return <img src={src} alt={name} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300" onError={handleError} />;
}

export default function Universities() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    api.universities.list().then(setUniversities).catch(() => {});
  }, []);

  const countries = [...new Set(universities.map(u => u.country))].sort() as string[];
  const filtered = selectedCountry ? universities.filter(u => u.country === selectedCountry) : universities;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-3">Partner Universities</h1>
          <p className="text-blue-200 text-lg mb-8">Explore our global network of top universities</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setSelectedCountry('')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCountry ? 'bg-white text-blue-700' : 'bg-white/20 text-white hover:bg-white/30'}`}>All Countries</button>
            {countries.map(c => (
              <button type="button" key={c} onClick={() => setSelectedCountry(c === selectedCountry ? '' : c)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCountry === c ? 'bg-white text-blue-700' : 'bg-white/20 text-white hover:bg-white/30'}`}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-gray-600 mb-6"><span className="font-bold text-gray-900">{filtered.length}</span> universities{selectedCountry && ` in ${selectedCountry}`}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(uni => (
            <div key={uni.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group flex flex-col">
              <Link to={`/university/${uni.id}`} className="block">
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600">
                  <UniCoverImg website={uni.website} coverImage={uni.coverImage} name={uni.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 text-xs font-bold text-blue-800 px-2.5 py-1 rounded-full">#{uni.ranking} World</span>
                    <span className="bg-white/90 text-xs text-gray-700 px-2.5 py-1 rounded-full">{uni.type}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white text-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {uni.city}, {uni.country}
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-800">{uni.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">{uni.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{uni.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {uni.tags.slice(0, 3).map((tag: string) => <span key={tag} className="bg-sky-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{tag}</span>)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
                    <div>
                      <p className="font-bold text-gray-900 text-sm flex items-center justify-center gap-0.5"><BookOpen className="w-3.5 h-3.5 text-indigo-500" />{uni.courses.length}</p>
                      <p className="text-xs text-gray-400">Courses</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{(uni.totalStudents / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-gray-400">Students</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-700 text-sm flex items-center justify-center gap-0.5"><DollarSign className="w-3.5 h-3.5" />{(uni.averageFees.postgraduate / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-gray-400">PG/year</p>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="px-5 pb-5 mt-auto">
                <Link
                  to={`/university/${uni.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0d1b4b] hover:bg-[#152258] text-white text-sm font-semibold rounded-xl transition-colors group/btn"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
