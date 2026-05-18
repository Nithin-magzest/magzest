import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, Bell, ArrowRight, Star, MapPin, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Student } from '../../types';
import StatusBadge from '../../components/StatusBadge';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const student = user as Student;
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    api.universities.list().then(unis => {
      const recs = unis.filter(u =>
        u.courses.some((c: any) => student.interestedCourses?.some((ic: string) => c.name.toLowerCase().includes(ic.toLowerCase())))
      ).slice(0, 3);
      setRecommendations(recs);
    }).catch(() => {});
  }, []);

  if (!student) return null;

  const apps = student.applications || [];
  const docs = student.documents || [];

  const appStats = {
    total: apps.length,
    underReview: apps.filter((a: any) => a.status === 'under_review').length,
    offers: apps.filter((a: any) => ['offer_received', 'accepted'].includes(a.status)).length,
  };
  const docStats = {
    total: docs.length,
    verified: docs.filter((d: any) => d.status === 'verified').length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-blue-200 mt-2 text-sm">Track your applications and explore universities</p>
          </div>
          <div className="hidden md:block bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold">{appStats.offers}</div>
            <div className="text-xs text-blue-200">Offer(s) Received</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Applications', value: appStats.total, icon: FileText },
            { label: 'Under Review', value: appStats.underReview, icon: Clock },
            { label: 'Docs Verified', value: `${docStats.verified}/${docStats.total}`, icon: CheckCircle },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <s.icon className="w-5 h-5 mx-auto mb-1 text-blue-200" />
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-blue-200">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {appStats.offers > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-800">You have {appStats.offers} offer(s)!</p>
            <p className="text-green-600 text-sm">Check your applications and respond to offers.</p>
          </div>
          <Link to="/student/applications" className="text-green-700 font-medium text-sm hover:underline whitespace-nowrap">View offers</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">My Applications</h2>
            <Link to="/student/applications" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          {apps.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No applications yet</p>
              <Link to="/student/universities" className="text-blue-600 text-sm hover:underline mt-1 inline-block">Browse universities</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app: any) => (
                <div key={app._id || app.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {app.universityName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{app.universityName}</p>
                    <p className="text-gray-500 text-xs truncate">{app.courseName}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Documents</h2>
            <button type="button" onClick={() => navigate('/student/profile')} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700">
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Completion</span>
              <span className="font-semibold text-gray-900">{docStats.verified}/{docStats.total} verified</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all progress-bar" style={{ '--progress-width': `${docStats.total ? (docStats.verified / docStats.total) * 100 : 0}%` } as React.CSSProperties}></div>
            </div>
          </div>
          <div className="space-y-2">
            {docs.map((doc: any) => (
              <div key={doc._id || doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${doc.status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                  <span className="text-xs text-gray-400">({doc.type})</span>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Profile Snapshot</h2>
          <Link to="/student/profile" className="text-blue-600 text-sm font-medium hover:text-blue-700">Edit Profile</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Nationality', value: student.nationality },
            { label: 'GPA', value: `${student.gpa}/10` },
            { label: 'English', value: student.englishScore ? `${student.englishScore.type} ${student.englishScore.score}` : '—' },
            { label: 'Budget', value: `$${(student.budget || 0).toLocaleString()}/yr` },
          ].map(item => (
            <div key={item.label} className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-500 mb-1">{item.label}</p>
              <p className="font-bold text-blue-800 text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Recommended For You</h2>
            <Link to="/student/universities" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">Explore all <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map(uni => (
              <Link key={uni.id} to={`/university/${uni.id}`} className="flex gap-3 p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700 flex-shrink-0">
                  {uni.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 truncate">{uni.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5"><MapPin className="w-3 h-3" /> {uni.city}</div>
                  <div className="flex items-center gap-1 mt-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /><span className="text-xs text-gray-600">#{uni.ranking} World</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
