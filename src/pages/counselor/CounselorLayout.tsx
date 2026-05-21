import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, GraduationCap, User, BookOpen, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

type NavIcon = React.ComponentType<{ className?: string }> | string;

const navItems: { to: string; label: string; icon: NavIcon; end?: boolean; mobileHide?: boolean }[] = [
  { to: '/counselor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/counselor/students', label: 'Students', icon: Users },
  { to: '/counselor/chat', label: 'Chat', icon: MessageSquare },
  { to: '/counselor/universities', label: 'Universities', icon: GraduationCap },
  { to: '/counselor/profile', label: 'My Profile', icon: User },
  { to: '/counselor/courses', label: 'Courses', icon: BookOpen, mobileHide: true },
  { to: '/counselor/countries', label: 'Countries', icon: '🌍' },
  { to: '/counselor/meetings', label: 'Meetings', icon: CalendarDays },
];

function NavIcon({ icon, size }: { icon: NavIcon; size: 'sm' | 'md' }) {
  if (typeof icon === 'string') {
    return <span className={size === 'md' ? 'text-xl leading-none' : 'text-base leading-none'}>{icon}</span>;
  }
  const Icon = icon;
  return <Icon className={size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} />;
}

export default function CounselorLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const unreadCount = useUnreadMessages();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'counselor') return <Navigate to="/student" />;

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 sticky top-16 p-4 gap-1">
          <div className="mb-4 px-3 py-3 bg-sky-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                <p className="text-xs text-sky-600">Counselor Portal</p>
              </div>
            </div>
          </div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                }`
              }
            >
              <div className="relative flex-shrink-0">
                <NavIcon icon={item.icon} size="sm" />
                {item.label === 'Chat' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </div>
              {item.label}
            </NavLink>
          ))}
        </aside>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40">
          {navItems.filter(item => !item.mobileHide).map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex-1 flex flex-col items-center py-3 text-xs gap-1 ${isActive ? 'text-sky-600' : 'text-gray-500'}`}>
              <div className="relative">
                <NavIcon icon={item.icon} size="md" />
                {item.label === 'Chat' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
