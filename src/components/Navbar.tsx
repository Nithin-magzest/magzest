import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { open } = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const dashboardPath = user?.role === 'counselor' ? '/counselor' : user?.role === 'admin' ? '/admin' : '/student';

  const scrollToHowItWorks = (e: React.MouseEvent) => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <div className="flex flex-col items-center justify-center bg-[#0d1b4b] rounded-xl px-3 py-1.5 min-w-[72px]">
                <GraduationCap className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-xs tracking-tight leading-tight">GradZest</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-[#0d1b4b]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Home
              </Link>
              <Link
                to="/universities"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/universities' ? 'text-[#0d1b4b]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Browse Programs
              </Link>
              <a
                href="/#how-it-works"
                onClick={scrollToHowItWorks}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                How It Works
              </a>
              {isAuthenticated && (
                <Link
                  to={dashboardPath}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith(dashboardPath) ? 'text-[#0d1b4b]' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#0d1b4b] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <Link to={dashboardPath} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    {user?.role === 'student' && (
                      <Link
                        to="/student/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                    )}
                    <button type="button" onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => open('login')}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => open('register')}
                  className="hidden md:block bg-[#0d1b4b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#152258] transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
            <button type="button" aria-label="Toggle menu" className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-gray-100">
            <Link to="/" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/universities" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMenuOpen(false)}>Browse Programs</Link>
            <a href="/#how-it-works" onClick={scrollToHowItWorks} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">How It Works</a>
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button type="button" onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">Sign Out</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => { setMenuOpen(false); open('login'); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Log In</button>
                <button type="button" onClick={() => { setMenuOpen(false); open('register'); }} className="block w-full text-left px-3 py-2 text-sm font-semibold text-[#0d1b4b] hover:bg-[#f0f4ff] rounded-md">Get Started</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
