import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Layers, Users, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const navItems: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; end?: boolean }[] = [
  { to: '/appteam',              label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/appteam/applications', label: 'Applications', icon: Layers },
  { to: '/appteam/students',     label: 'Students',     icon: Users },
  { to: '/appteam/counselors',   label: 'Counselors',   icon: UserCog },
];

export default function AppTeamLayout() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login?redirect=/appteam" />;
  if (user?.role !== 'admin') return <Navigate to="/login?redirect=/appteam" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 sticky top-16 flex-shrink-0">
          <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em] px-3 mb-2">Application Team</p>
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border-l-2 ${
                    isActive
                      ? 'bg-orange-50 text-orange-800 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
                  }`
                }>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400">Application Team</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2.5 text-[10px] gap-1 font-medium ${isActive ? 'text-orange-600' : 'text-gray-400'}`
              }>
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 min-w-0 p-6 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
