import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Universities from './pages/Universities';
import UniversityDetail from './pages/UniversityDetail';
import Search from './pages/Search';

// Student module
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentUniversities from './pages/student/StudentUniversities';
import StudentApplications from './pages/student/StudentApplications';
import StudentProfile from './pages/student/StudentProfile';
import StudentChat from './pages/student/StudentChat';

// Counselor module
import CounselorLayout from './pages/counselor/CounselorLayout';
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import CounselorStudents from './pages/counselor/CounselorStudents';
import CounselorChat from './pages/counselor/CounselorChat';
import CounselorUniversities from './pages/counselor/CounselorUniversities';

// Admin module
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';

export default function App() {
  return (
    <AuthProvider>
      <CallProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/university/:id" element={<UniversityDetail />} />
          <Route path="/search" element={<Search />} />

          {/* Student module */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="universities" element={<StudentUniversities />} />
            <Route path="applications" element={<StudentApplications />} />
            <Route path="chat" element={<StudentChat />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Counselor module */}
          <Route path="/counselor" element={<CounselorLayout />}>
            <Route index element={<CounselorDashboard />} />
            <Route path="students/*" element={<CounselorStudents />} />
            <Route path="chat" element={<CounselorChat />} />
            <Route path="universities" element={<CounselorUniversities />} />
          </Route>

          {/* Admin module */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="counselors" element={<AdminDashboard />} />
            <Route path="students" element={<AdminDashboard />} />
            <Route path="applications" element={<AdminApplications />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </CallProvider>
    </AuthProvider>
  );
}
