import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Shield, FileText, GraduationCap, BookOpen, CalendarDays, MessageSquare, Activity, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

type NavIcon = React.ComponentType<{ className?: string }> | string;

const navItems: { to: string; label: string; icon: NavIcon; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/counselors', label: 'Counselors', icon: UserCog },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/applications', label: 'Applications', icon: FileText },
  { to: '/admin/countries', label: 'Countries & Visa', icon: '🌍' },
  { to: '/admin/universities', label: 'Universities', icon: GraduationCap },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/activities', label: 'Activities', icon: CalendarDays },
  { to: '/admin/live-feed', label: 'Live Feed', icon: Activity },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/admin/chat', label: 'Chat', icon: MessageSquare },
];

function NavIcon({ icon, size }: { icon: NavIcon; size: 'sm' | 'md' }) {
  if (typeof icon === 'string') {
    return <span className={size === 'md' ? 'text-xl leading-none' : 'text-base leading-none'}>{icon}</span>;
  }
  const Icon = icon;
  return <Icon className={size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} />;
}

export default function AdminLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const unreadCount = useUnreadMessages();
  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-purple-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <aside className="hidden md:flex flex-col w-64 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 gap-1">
          <div className="mb-4 px-3 py-3 bg-purple-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Admin Portal</p>
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
                  isActive ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex z-40">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex-1 flex flex-col items-center py-3 text-xs gap-1 ${isActive ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'}`}>
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
