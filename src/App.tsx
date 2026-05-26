import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { NotificationProvider } from './context/NotificationContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

import AuthModal from './components/AuthModal';

// Public pages
const Home             = lazy(() => import('./pages/Home'));
const Login            = lazy(() => import('./pages/Login'));
const Universities     = lazy(() => import('./pages/Universities'));
const UniversityDetail = lazy(() => import('./pages/UniversityDetail'));
const Search           = lazy(() => import('./pages/Search'));
const PublicLayout     = lazy(() => import('./pages/PublicLayout'));

// Student module
const StudentLayout       = lazy(() => import('./pages/student/StudentLayout'));
const StudentDashboard    = lazy(() => import('./pages/student/StudentDashboard'));
const StudentUniversities = lazy(() => import('./pages/student/StudentUniversities'));
const StudentApplications = lazy(() => import('./pages/student/StudentApplications'));
const StudentProfile      = lazy(() => import('./pages/student/StudentProfile'));
const StudentChat         = lazy(() => import('./pages/student/StudentChat'));
const StudentCourses      = lazy(() => import('./pages/student/StudentCourses'));
const StudentCountries    = lazy(() => import('./pages/student/StudentCountries'));
const StudentMeetings     = lazy(() => import('./pages/student/StudentMeetings'));

// Counselor module
const CounselorLayout       = lazy(() => import('./pages/counselor/CounselorLayout'));
const CounselorDashboard    = lazy(() => import('./pages/counselor/CounselorDashboard'));
const CounselorStudents     = lazy(() => import('./pages/counselor/CounselorStudents'));
const CounselorChat         = lazy(() => import('./pages/counselor/CounselorChat'));
const CounselorUniversities = lazy(() => import('./pages/counselor/CounselorUniversities'));
const CounselorProfile      = lazy(() => import('./pages/counselor/CounselorProfile'));
const CounselorCourses      = lazy(() => import('./pages/counselor/CounselorCourses'));
const CounselorCountries    = lazy(() => import('./pages/counselor/CounselorCountries'));
const CounselorMeetings     = lazy(() => import('./pages/counselor/CounselorMeetings'));
const CounselorApplications = lazy(() => import('./pages/counselor/CounselorApplications'));

// Admin module
const AdminLayout       = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));
const AdminUniversities = lazy(() => import('./pages/admin/AdminUniversities'));
const AdminCourses      = lazy(() => import('./pages/admin/AdminCourses'));
const AdminCountries    = lazy(() => import('./pages/admin/AdminCountries'));
const AdminMeetings     = lazy(() => import('./pages/admin/AdminMeetings'));
const AdminChat         = lazy(() => import('./pages/admin/AdminChat'));
const AdminCounselors   = lazy(() => import('./pages/admin/AdminCounselors'));
const AdminStudents     = lazy(() => import('./pages/admin/AdminStudents'));

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <span className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <CallProvider>
      <NotificationProvider>
      <AuthModalProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthModal />
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/universities" element={<Universities />} />
              <Route path="/university/:id" element={<UniversityDetail />} />
              <Route path="/search" element={<Search />} />
            </Route>
            <Route path="/login" element={<Login />} />

            {/* Student module */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="universities" element={<StudentUniversities />} />
              <Route path="applications" element={<StudentApplications />} />
              <Route path="chat" element={<StudentChat />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="countries" element={<StudentCountries />} />
              <Route path="meetings" element={<StudentMeetings />} />
            </Route>

            {/* Counselor module */}
            <Route path="/counselor" element={<CounselorLayout />}>
              <Route index element={<CounselorDashboard />} />
              <Route path="students/*" element={<CounselorStudents />} />
              <Route path="chat" element={<CounselorChat />} />
              <Route path="universities" element={<CounselorUniversities />} />
              <Route path="profile" element={<CounselorProfile />} />
              <Route path="courses" element={<CounselorCourses />} />
              <Route path="countries" element={<CounselorCountries />} />
              <Route path="meetings" element={<CounselorMeetings />} />
              <Route path="applications" element={<CounselorApplications />} />
            </Route>

            {/* Admin module */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="universities" element={<AdminUniversities />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="countries" element={<AdminCountries />} />
              <Route path="counselors" element={<AdminCounselors />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="meetings" element={<AdminMeetings />} />
              <Route path="chat" element={<AdminChat />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      </AuthModalProvider>
      </NotificationProvider>
      </CallProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}
