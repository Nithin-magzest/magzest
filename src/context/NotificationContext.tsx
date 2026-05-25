import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

export type NotifType = 'meeting' | 'application' | 'discount';

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  dismiss: () => {},
});

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  offer_received: 'Offer Received',
  accepted: 'Accepted',
  rejected: 'Rejected',
  enrolled: 'Enrolled',
};

const DISCOUNT_NOTIFICATIONS = [
  {
    type: 'discount' as NotifType,
    title: 'Early Application Discount',
    message: 'Apply to UK universities before June 30 and get a 15% reduction on application fees!',
    link: '/universities',
  },
  {
    type: 'discount' as NotifType,
    title: 'Canada Study Visa Update',
    message: 'New streamlined visa process — processing time for Indian students reduced to 4 weeks.',
    link: '/student/countries',
  },
  {
    type: 'discount' as NotifType,
    title: 'Australia Scholarship Alert',
    message: 'New merit-based scholarships open for STEM courses in Australian universities. Deadline: July 15.',
    link: '/universities',
  },
];

const STORAGE_KEY = 'gradzest_notifications';

function loadStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
  } catch {
    return [];
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(loadStoredNotifications);

  // Persist every change to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Use primitive deps instead of object refs to avoid infinite re-renders
  const userId = user?.id ?? null;
  const userRole = user?.role ?? null;

  const notifiedMeetingIds = useRef<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('notified_meeting_ids') || '[]'))
  );
  const lastAppStatuses = useRef<Record<string, string>>(
    JSON.parse(localStorage.getItem('last_app_statuses') || '{}')
  );
  const discountsShown = useRef(false);
  // Keep role accessible in interval callbacks without triggering re-renders
  const userRoleRef = useRef(userRole);
  useEffect(() => { userRoleRef.current = userRole; }, [userRole]);

  // Stable addNotif — only depends on setNotifications (stable) and Notification API
  const addNotif = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setNotifications(prev => [{ ...notif, id, timestamp: new Date(), read: false }, ...prev]);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(notif.title, { body: notif.message });
    }
  }, []);

  // Request browser notification permission once
  useEffect(() => {
    if (isAuthenticated && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isAuthenticated]);

  // Meeting 30-min reminder — poll every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    async function checkMeetings() {
      try {
        const meetings = await api.meetings.list();
        const now = new Date();

        meetings.forEach((m: any) => {
          const id = m._id || m.id;
          if (notifiedMeetingIds.current.has(id)) return;

          const meetingAt = new Date(`${m.scheduledDate}T${m.scheduledTime}`);
          const minsUntil = (meetingAt.getTime() - now.getTime()) / 60000;

          if (minsUntil >= 25 && minsUntil <= 35) {
            const link = userRoleRef.current === 'counselor' ? '/counselor/meetings' : '/student/meetings';
            addNotif({
              type: 'meeting',
              title: 'Meeting in 30 Minutes',
              message: `"${m.title}" starts at ${m.scheduledTime} on ${m.platform?.toUpperCase() ?? 'your platform'}.`,
              link,
            });
            notifiedMeetingIds.current.add(id);
            localStorage.setItem('notified_meeting_ids', JSON.stringify([...notifiedMeetingIds.current]));
          }
        });
      } catch {}
    }

    checkMeetings();
    const interval = setInterval(checkMeetings, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, addNotif]);

  // Application status change — poll every 30 seconds (students only)
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'student') return;

    async function checkApplications() {
      try {
        const apps = await api.applications.list();
        const prev = lastAppStatuses.current;
        const next: Record<string, string> = {};

        apps.forEach((app: any) => {
          const id = app._id || app.id;
          next[id] = app.status;
          if (prev[id] && prev[id] !== app.status) {
            addNotif({
              type: 'application',
              title: 'Application Status Updated',
              message: `Your application to ${app.universityName} — ${app.courseName} is now "${STATUS_LABELS[app.status] ?? app.status}".`,
              link: '/student/applications',
            });
          }
        });

        lastAppStatuses.current = next;
        localStorage.setItem('last_app_statuses', JSON.stringify(next));
      } catch {}
    }

    checkApplications();
    const interval = setInterval(checkApplications, 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, userRole, addNotif]);

  // Discount / abroad update notifications — once per session
  useEffect(() => {
    if (!isAuthenticated || discountsShown.current) return;
    discountsShown.current = true;

    DISCOUNT_NOTIFICATIONS.forEach((d, i) => {
      setTimeout(() => addNotif(d), (i + 1) * 2500);
    });
  }, [isAuthenticated, addNotif]);

  const unreadCount = notifications.filter(n => !n.read).length;

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function dismiss(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
