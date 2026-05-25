import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { NotificationProvider } from './context/NotificationContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Login from './pages/Login';
import Universities from './pages/Universities';
import UniversityDetail from './pages/UniversityDetail';
import Search from './pages/Search';
import PublicLayout from './pages/PublicLayout';

// Student module
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentUniversities from './pages/student/StudentUniversities';
import StudentApplications from './pages/student/StudentApplications';
import StudentProfile from './pages/student/StudentProfile';
import StudentChat from './pages/student/StudentChat';
import StudentCourses from './pages/student/StudentCourses';
import StudentCountries from './pages/student/StudentCountries';
import StudentMeetings from './pages/student/StudentMeetings';

// Counselor module
import CounselorLayout from './pages/counselor/CounselorLayout';
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import CounselorStudents from './pages/counselor/CounselorStudents';
import CounselorChat from './pages/counselor/CounselorChat';
import CounselorUniversities from './pages/counselor/CounselorUniversities';
import CounselorProfile from './pages/counselor/CounselorProfile';
import CounselorCourses from './pages/counselor/CounselorCourses';
import CounselorCountries from './pages/counselor/CounselorCountries';
import CounselorMeetings from './pages/counselor/CounselorMeetings';
import CounselorApplications from './pages/counselor/CounselorApplications';

// Admin module
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminUniversities from './pages/admin/AdminUniversities';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCountries from './pages/admin/AdminCountries';
import AdminMeetings from './pages/admin/AdminMeetings';
import AdminChat from './pages/admin/AdminChat';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <CallProvider>
      <NotificationProvider>
      <AuthModalProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthModal />
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
            <Route path="counselors" element={<AdminDashboard />} />
            <Route path="students" element={<AdminDashboard />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="meetings" element={<AdminMeetings />} />
            <Route path="chat" element={<AdminChat />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthModalProvider>
      </NotificationProvider>
      </CallProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}
