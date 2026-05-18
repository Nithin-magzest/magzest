import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Calendar, ArrowRight, CheckCircle, Clock, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Student } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const statusOrder = ['draft', 'submitted', 'under_review', 'offer_received', 'accepted', 'rejected', 'enrolled'];

export default function StudentApplications() {
  const { user, refreshUser } = useAuth();
  const student = user as Student;
  const [filter, setFilter] = useState('all');
  const [accepting, setAccepting] = useState<string | null>(null);

  if (!student) return null;

  const apps = student.applications || [];
  const filtered = filter === 'all' ? apps : apps.filter((a: any) => a.status === filter);

  const counts: Record<string, number> = {
    all: apps.length,
    submitted: apps.filter((a: any) => a.status === 'submitted').length,
    under_review: apps.filter((a: any) => a.status === 'under_review').length,
    offer_received: apps.filter((a: any) => a.status === 'offer_received').length,
    accepted: apps.filter((a: any) => a.status === 'accepted').length,
  };

  const timeline = [
    { key: 'submitted', label: 'Submitted', icon: CheckCircle },
    { key: 'under_review', label: 'Under Review', icon: Clock },
    { key: 'offer_received', label: 'Offer Received', icon: Star },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle },
  ];

  const acceptOffer = async (appId: string) => {
    setAccepting(appId);
    try {
      await api.applications.update(appId, { status: 'accepted' });
      await refreshUser();
    } catch {}
    setAccepting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">Track the status of all your university applications</p>
        </div>
        <Link to="/student/universities" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> New Application
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(counts).map(([key, val]) => (
          <button type="button" key={key} onClick={() => setFilter(key)}
            className={`p-4 rounded-2xl text-center border-2 transition-all ${filter === key ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            <div className={`text-2xl font-bold ${filter === key ? 'text-blue-700' : 'text-gray-800'}`}>{val}</div>
            <div className="text-xs text-gray-500 capitalize mt-0.5">{key.replace('_', ' ')}</div>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No applications yet</h3>
          <p className="text-gray-400 mb-6">Start exploring universities and apply to your dream programs.</p>
          <Link to="/student/universities" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium">Browse Universities</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app: any) => {
            const currentStep = statusOrder.indexOf(app.status);
            const appId = app._id || app.id;
            return (
              <div key={appId} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center font-bold text-blue-700 text-xl flex-shrink-0">
                      {app.universityName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{app.universityName}</h3>
                      <p className="text-gray-600 text-sm">{app.courseName}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Intake: {app.intake}</span>
                        {app.submittedDate && <span>Submitted: {app.submittedDate}</span>}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={app.status} size="md" />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-0">
                    {timeline.map((step, i) => {
                      const stepIdx = statusOrder.indexOf(step.key);
                      const isCompleted = currentStep >= stepIdx;
                      const isCurrent = app.status === step.key;
                      return (
                        <div key={step.key} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}>
                              <step.icon className={`w-3.5 h-3.5 ${isCompleted ? 'text-white' : 'text-gray-300'}`} />
                            </div>
                            <span className={`text-xs mt-1 ${isCurrent ? 'text-blue-600 font-semibold' : isCompleted ? 'text-gray-600' : 'text-gray-300'}`}>{step.label}</span>
                          </div>
                          {i < timeline.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${currentStep > stepIdx ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {app.status === 'offer_received' && (
                  <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => acceptOffer(appId)} disabled={accepting === appId}
                      className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60">
                      {accepting === appId ? 'Accepting...' : 'Accept Offer'}
                    </button>
                    <Link to={`/university/${app.universityId}`} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 px-4 py-2.5">
                      View University <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
