import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Calendar, ArrowRight, CheckCircle, Clock, Star, ChevronDown, ChevronUp, User, BookOpen, Globe, DollarSign, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { Student } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const statusOrder = ['draft', 'submitted', 'under_review', 'offer_received', 'accepted', 'rejected', 'enrolled'];

const timeline = [
  { key: 'submitted', label: 'Submitted', icon: CheckCircle },
  { key: 'under_review', label: 'Under Review', icon: Clock },
  { key: 'offer_received', label: 'Offer Received', icon: Star },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle },
];

function DetailRow({ label, value }: { label: string; value?: string | boolean | null }) {
  if (!value && value !== false) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
      <span className="text-xs text-gray-400 sm:w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-700 font-medium">{String(value)}</span>
    </div>
  );
}

function ApplicationCard({ app, onAccept, accepting, onCommentPosted }: {
  app: any;
  onAccept: (id: string) => void;
  accepting: string | null;
  onCommentPosted: () => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const currentStep = statusOrder.indexOf(app.status);
  const appId = app._id || app.id;

  const submitComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.applications.addComment(appId, commentText.trim());
      setCommentText('');
      await onCommentPosted();
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center font-bold text-blue-700 text-xl flex-shrink-0">
              {app.universityName?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{app.universityName}</h3>
              <p className="text-gray-600 text-sm">{app.courseName}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Intake: {app.intake}</span>
                {app.studyMode && <span>{app.studyMode}</span>}
                {app.submittedDate && <span>Submitted: {app.submittedDate}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={app.status} size="md" />
            {app.scholarshipInterest && (
              <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">Scholarship Interest</span>
            )}
          </div>
        </div>

        {/* Timeline */}
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
                  {i < timeline.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${currentStep > stepIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Offer actions */}
        {app.status === 'offer_received' && (
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => onAccept(appId)} disabled={accepting === appId}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60">
              {accepting === appId ? 'Accepting...' : 'Accept Offer'}
            </button>
            <Link to={`/university/${app.universityId}`} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 px-4 py-2.5">
              View University <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Expand/collapse details */}
        <button type="button" onClick={() => setExpanded(e => !e)}
          className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors pt-3 border-t border-gray-50">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Hide Details</> : <><ChevronDown className="w-3.5 h-3.5" /> View Full Application Details</>}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-6 py-5 space-y-5 bg-gray-50 rounded-b-2xl">

          {/* Personal */}
          {(app.dateOfBirth || app.gender || app.passportNumber) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-700">Personal Information</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                <DetailRow label="Date of Birth" value={app.dateOfBirth} />
                <DetailRow label="Gender" value={app.gender} />
                <DetailRow label="Passport No." value={app.passportNumber} />
                <DetailRow label="Phone" value={app.phone} />
                {app.address?.city && <DetailRow label="City" value={`${app.address.city}${app.address.state ? ', ' + app.address.state : ''}`} />}
                {app.address?.country && <DetailRow label="Country" value={app.address.country} />}
              </div>
            </div>
          )}

          {/* Academic */}
          {(app.previousInstitution || app.previousDegree) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-gray-700">Academic Background</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                <DetailRow label="Education Level" value={app.educationLevel} />
                <DetailRow label="Institution" value={app.previousInstitution} />
                <DetailRow label="Degree" value={app.previousDegree} />
                <DetailRow label="Major" value={app.previousMajor} />
                <DetailRow label="Graduation Year" value={app.graduationYear} />
                <DetailRow label="GPA / Grade" value={app.percentage} />
              </div>
            </div>
          )}

          {/* English & Finance */}
          {(app.englishTest?.type || app.fundingSource) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-semibold text-gray-700">Language & Finance</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                {app.englishTest?.type && <DetailRow label="English Test" value={`${app.englishTest.type} — ${app.englishTest.score}`} />}
                {app.englishTest?.testDate && <DetailRow label="Test Date" value={app.englishTest.testDate} />}
                <DetailRow label="Funding Source" value={app.fundingSource} />
                {app.sponsorName && <DetailRow label="Sponsor" value={app.sponsorName} />}
              </div>
            </div>
          )}

          {/* SOP */}
          {(app.whyCourse || app.careerGoals || app.whyUniversity) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-orange-600" />
                <h4 className="text-sm font-semibold text-gray-700">Statement of Purpose</h4>
              </div>
              <div className="pl-6 space-y-3">
                {app.whyCourse && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Why this course?</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{app.whyCourse}</p>
                  </div>
                )}
                {app.careerGoals && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Career goals</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{app.careerGoals}</p>
                  </div>
                )}
                {app.whyUniversity && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Why this university?</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{app.whyUniversity}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents checklist */}
          {app.documentsChecklist && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm font-semibold text-gray-700">Documents Confirmed</h4>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pl-6">
                {([
                  { key: 'passport', label: 'Passport' },
                  { key: 'transcripts', label: 'Transcripts' },
                  { key: 'degreeCertificate', label: 'Degree Certificate' },
                  { key: 'englishCertificate', label: 'English Certificate' },
                  { key: 'bankStatement', label: 'Bank Statement' },
                  { key: 'referenceLetters', label: 'Reference Letters' },
                  { key: 'sop', label: 'Statement of Purpose' },
                ] as { key: string; label: string }[]).map(doc => (
                  <div key={doc.key} className="flex items-center gap-1.5 text-sm">
                    <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${app.documentsChecklist[doc.key as keyof typeof app.documentsChecklist] ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={app.documentsChecklist[doc.key as keyof typeof app.documentsChecklist] ? 'text-gray-700' : 'text-gray-400'}>{doc.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {app.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-yellow-700 mb-1">Counselor Notes</p>
              <p className="text-sm text-yellow-800">{app.notes}</p>
            </div>
          )}

          {/* Q&A Comments */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <h4 className="text-sm font-semibold text-gray-700">Questions & Updates</h4>
              {app.comments?.length > 0 && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{app.comments.length}</span>
              )}
            </div>

            {app.comments?.length > 0 ? (
              <div className="space-y-2 mb-3 max-h-52 overflow-y-auto pr-1">
                {app.comments.map((c: any, i: number) => (
                  <div key={i} className={`flex ${c.authorRole === 'student' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      c.authorRole === 'student'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}>
                      <p className={`font-semibold mb-0.5 ${c.authorRole === 'student' ? 'text-blue-100' : 'text-blue-600'}`}>
                        {c.authorRole === 'counselor' ? `${c.author} · Counselor` : 'You'}
                      </p>
                      <p>{c.text}</p>
                      {c.createdAt && (
                        <p className={`text-[10px] mt-1 ${c.authorRole === 'student' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(c.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-3">No messages yet. Ask your counselor a question below.</p>
            )}

            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                placeholder="Ask a question about your application…"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={submitting}
              />
              <button type="button" aria-label="Send message" onClick={submitComment} disabled={submitting || !commentText.trim()}
                className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
        <Link to="/student/universities" className="flex items-center gap-2 bg-[#0d1b4b] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#152258] transition-colors">
          <Plus className="w-4 h-4" /> New Application
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {([
          { key: 'all',            label: 'All',            inactive: 'bg-blue-50 border-blue-200 text-blue-800',       active: 'bg-[#0d1b4b] border-[#0d1b4b] text-white' },
          { key: 'submitted',      label: 'Submitted',      inactive: 'bg-sky-50 border-sky-200 text-sky-800',           active: 'bg-sky-500 border-sky-500 text-white' },
          { key: 'under_review',   label: 'Under Review',   inactive: 'bg-amber-50 border-amber-200 text-amber-800',     active: 'bg-amber-400 border-amber-400 text-white' },
          { key: 'offer_received', label: 'Offer Received', inactive: 'bg-purple-50 border-purple-200 text-purple-800',  active: 'bg-purple-500 border-purple-500 text-white' },
          { key: 'accepted',       label: 'Accepted',       inactive: 'bg-green-50 border-green-200 text-green-800',     active: 'bg-green-500 border-green-500 text-white' },
        ] as const).map(({ key, label, inactive, active }) => (
          <button type="button" key={key} onClick={() => setFilter(key)}
            className={`py-7 px-4 rounded-3xl text-center border-2 flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
              filter === key ? active : inactive
            }`}>
            <div className="text-3xl font-bold">{counts[key]}</div>
            <div className="text-xs font-medium opacity-80">{label}</div>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No applications yet</h3>
          <p className="text-gray-400 mb-6">Start exploring universities and apply to your dream programs.</p>
          <Link to="/student/universities" className="bg-[#0d1b4b] text-white px-6 py-2.5 rounded-xl hover:bg-[#152258] transition-colors font-medium">Browse Universities</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app: any) => (
            <ApplicationCard key={app._id || app.id} app={app} onAccept={acceptOffer} accepting={accepting} onCommentPosted={refreshUser} />
          ))}
        </div>
      )}
    </div>
  );
}
