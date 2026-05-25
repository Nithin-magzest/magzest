import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Bell,
  Calendar,
  FileText,
  Tag,
  CheckCheck,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import {
  useNotifications,
  AppNotification,
} from "../context/NotificationContext";

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  meeting: <Calendar className="w-4 h-4 text-[#0d1b4b]" />,
  application: <FileText className="w-4 h-4 text-emerald-600" />,
  discount: <Tag className="w-4 h-4 text-amber-500" />,
};

const NOTIF_COLORS: Record<string, string> = {
  meeting: "bg-[#f0f4ff]",
  application: "bg-emerald-50",
  discount: "bg-amber-50",
};

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { open } = useAuthModal();
  const { notifications, unreadCount, markRead, markAllRead, dismiss } =
    useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const updateScrollButtons = () => {
    const el = listRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  };

  useEffect(() => {
    if (notifOpen) setTimeout(updateScrollButtons, 50);
    else {
      setCanScrollUp(false);
      setCanScrollDown(false);
    }
  }, [notifOpen, notifications]);

  const scrollList = (dir: "up" | "down") => {
    listRef.current?.scrollBy({
      top: dir === "down" ? 160 : -160,
      behavior: "smooth",
    });
    setTimeout(updateScrollButtons, 200);
  };

  function handleNotifClick(n: AppNotification) {
    markRead(n.id);
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  }

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileOpen(false);
  };

  const dashboardPath =
    user?.role === "counselor"
      ? "/counselor"
      : user?.role === "admin"
        ? "/admin"
        : "/student";

  const scrollToHowItWorks = (e: React.MouseEvent) => {
    setMenuOpen(false);
    if (location.pathname === "/") {
      e.preventDefault();
      document
        .getElementById("how-it-works")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-extrabold tracking-tight select-none">
                <span className="text-[#0d1b4b]">Grad</span><span className="text-blue-500">zest</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === "/" ? "text-[#0d1b4b]" : "text-gray-600 hover:text-gray-900"}`}
              >
                Home
              </Link>
              <Link
                to="/universities"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === "/universities" ? "text-[#0d1b4b]" : "text-gray-600 hover:text-gray-900"}`}
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith(dashboardPath) ? "text-[#0d1b4b]" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-900">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="flex items-center gap-1 text-xs text-[#0d1b4b] hover:underline font-medium"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Scroll up button */}
                    {canScrollUp && (
                      <button
                        type="button"
                        onClick={() => scrollList("up")}
                        aria-label="Scroll notifications up"
                        className="w-full flex items-center justify-center py-1.5 bg-gray-50 hover:bg-gray-100 border-b border-gray-100 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      </button>
                    )}

                    {/* List */}
                    <div
                      ref={listRef}
                      onScroll={updateScrollButtons}
                      className="max-h-80 overflow-y-auto divide-y divide-gray-50 scroll-smooth"
                    >
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">
                          <Bell className="w-7 h-7 mx-auto mb-2 text-gray-300" />
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}
                            onClick={() => handleNotifClick(n)}
                          >
                            <div
                              className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${NOTIF_COLORS[n.type]}`}
                            >
                              {NOTIF_ICONS[n.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-xs font-semibold leading-snug ${!n.read ? "text-gray-900" : "text-gray-700"}`}
                                >
                                  {n.title}
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dismiss(n.id);
                                  }}
                                  className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {timeAgo(n.timestamp)}
                              </p>
                            </div>
                            {!n.read && (
                              <span className="mt-1.5 w-2 h-2 bg-[#0d1b4b] rounded-full flex-shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Scroll down button */}
                    {canScrollDown && (
                      <button
                        type="button"
                        onClick={() => scrollList("down")}
                        aria-label="Scroll notifications down"
                        className="w-full flex items-center justify-center py-1.5 bg-gray-50 hover:bg-gray-100 border-t border-gray-100 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

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
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <Link
                      to={dashboardPath}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    {user?.role === "student" && (
                      <Link
                        to="/student/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => open("login")}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => open("register")}
                  className="hidden md:block bg-[#0d1b4b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#152258] transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
            <button
              type="button"
              aria-label="Toggle menu"
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-gray-100">
            <Link
              to="/"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/universities"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              Browse Programs
            </Link>
            <a
              href="/#how-it-works"
              onClick={scrollToHowItWorks}
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              How It Works
            </a>
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    open("login");
                  }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    open("register");
                  }}
                  className="block w-full text-left px-3 py-2 text-sm font-semibold text-[#0d1b4b] hover:bg-[#f0f4ff] rounded-md"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
