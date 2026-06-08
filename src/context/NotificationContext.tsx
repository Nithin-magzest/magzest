import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api';
import { useAuth } from './AuthContext';

export type NotifType = 'meeting' | 'application' | 'discount' | 'subscriber' | 'counselor' | 'task';
export type NotifPriority = 'urgent' | 'normal' | 'info';

export interface AppNotification {
  id: string;
  type: NotifType;
  priority: NotifPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  toasts: AppNotification[];
  unreadCount: number;
  addNotif: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [], toasts: [], unreadCount: 0,
  addNotif: () => {},
  markRead: () => {}, markAllRead: () => {}, dismiss: () => {},
  dismissToast: () => {}, clearAll: () => {},
});

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', submitted: 'Submitted', under_review: 'Under Review',
  offer_received: 'Offer Received', accepted: 'Accepted', rejected: 'Rejected', enrolled: 'Enrolled',
};

const DISCOUNT_NOTIFICATIONS: Omit<AppNotification, 'id' | 'timestamp' | 'read'>[] = [
  { type: 'discount', priority: 'info', title: '🎓 Early Application Discount', message: 'Apply to UK universities before June 30 and get a 15% reduction on application fees!', link: '/student/universities' },
  { type: 'discount', priority: 'info', title: '🇨🇦 Canada Study Visa Update', message: 'New streamlined visa process — processing time for Indian students reduced to 4 weeks.', link: '/student/countries' },
  { type: 'discount', priority: 'info', title: '🌏 Australia Scholarship Alert', message: 'New merit-based scholarships open for STEM courses. Deadline: July 15.', link: '/student/universities' },
];

const MAX_NOTIFICATIONS = 50;
const storageKey   = (uid: string | null) => uid ? `gradzest_notifications_${uid}` : 'gradzest_notifications';
const discountKey  = (uid: string | null) => uid ? `gradzest_discounts_shown_${uid}` : 'gradzest_discounts_shown';
const appStatusKey = (uid: string | null) => uid ? `last_app_statuses_${uid}` : 'last_app_statuses';
const studentsKey  = (uid: string | null) => uid ? `last_counselor_students_${uid}` : 'last_counselor_students';

function loadStored(uid: string | null): AppNotification[] {
  try {
    const raw = localStorage.getItem(storageKey(uid));
    if (!raw) return [];
    return JSON.parse(raw).slice(0, MAX_NOTIFICATIONS).map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
  } catch { return []; }
}

// ── Sound alert using Web Audio API ─────────────────────────────────────────
function playSound(priority: NotifPriority) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (priority === 'urgent') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else {
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {}
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const userId   = user?.id   ?? null;
  const userRole = user?.role ?? null;

  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStored(userId));
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  // Reload when user changes
  const prevUserId = useRef(userId);
  useEffect(() => {
    if (prevUserId.current !== userId) {
      prevUserId.current = userId;
      setNotifications(loadStored(userId));
      setToasts([]);
    }
  }, [userId]);

  // Persist
  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  }, [notifications, userId]);

  const userRoleRef = useRef(userRole);
  useEffect(() => { userRoleRef.current = userRole; }, [userRole]);

  const notified1h = useRef<Set<string>>(new Set(JSON.parse(localStorage.getItem('notified_meeting_1h') || '[]')));
  const notified5m = useRef<Set<string>>(new Set(JSON.parse(localStorage.getItem('notified_meeting_5m') || '[]')));
  const lastAppStatuses    = useRef<Record<string, string>>(JSON.parse(localStorage.getItem(appStatusKey(userId)) || '{}'));
  const lastCounselorStuds = useRef<Set<string>>(new Set(JSON.parse(localStorage.getItem(studentsKey(userId)) || '[]')));
  const smartNotifDates    = useRef<Record<string, string>>(JSON.parse(localStorage.getItem(`smart_notif_${userId}`) || '{}'));

  // ── Core addNotif ────────────────────────────────────────────────────────
  const addNotif = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const full: AppNotification = { ...notif, id, timestamp: new Date(), read: false };

    setNotifications(prev => [full, ...prev].slice(0, MAX_NOTIFICATIONS));
    setToasts(prev => [...prev.slice(-4), full]); // max 5 toasts at once

    // Sound
    playSound(notif.priority);

    // Browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(notif.title, { body: notif.message });
    }
  }, []);

  // ── Request browser notification permission ──────────────────────────────
  useEffect(() => {
    if (isAuthenticated && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isAuthenticated]);

  // ── Meeting reminders — all roles ────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const meetingsLink = () => {
      const r = userRoleRef.current;
      if (r === 'counselor') return '/counselor/meetings';
      if (r === 'student')   return '/student/meetings';
      return '/admin/meetings';
    };

    const check = async () => {
      try {
        const meetings = await api.meetings.list();
        const now = new Date();
        meetings.forEach((m: any) => {
          const id = m._id || m.id;
          const at = new Date(`${m.scheduledDate}T${m.scheduledTime}`);
          const mins = (at.getTime() - now.getTime()) / 60000;

          if (mins >= 55 && mins <= 65 && !notified1h.current.has(id)) {
            addNotif({ type: 'meeting', priority: 'normal', title: '📅 Meeting in 1 Hour', message: `"${m.title}" starts at ${m.scheduledTime}. Get ready!`, link: meetingsLink() });
            notified1h.current.add(id);
            localStorage.setItem('notified_meeting_1h', JSON.stringify([...notified1h.current]));
          }
          if (mins >= 2 && mins <= 7 && !notified5m.current.has(id)) {
            addNotif({ type: 'meeting', priority: 'urgent', title: '⏰ Meeting Starting Now!', message: `"${m.title}" starts in 5 minutes — join now!`, link: meetingsLink() });
            notified5m.current.add(id);
            localStorage.setItem('notified_meeting_5m', JSON.stringify([...notified5m.current]));
          }
        });
      } catch {}
    };
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, [isAuthenticated, addNotif]);

  // ── Student: application status changes + smart deadline alerts ──────────
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'student' || !userId) return;
    lastAppStatuses.current = JSON.parse(localStorage.getItem(appStatusKey(userId)) || '{}');
    smartNotifDates.current = JSON.parse(localStorage.getItem(`smart_notif_${userId}`) || '{}');

    const check = async () => {
      try {
        const apps = await api.applications.list();
        const prev = lastAppStatuses.current;
        const next: Record<string, string> = {};

        apps.forEach((app: any) => {
          const id = app._id || app.id;
          next[id] = app.status;

          // Status change notification
          if (prev[id] !== undefined && prev[id] !== app.status) {
            const isUrgent  = ['offer_received', 'rejected'].includes(app.status);
            const isGood    = ['offer_received', 'accepted', 'enrolled'].includes(app.status);
            addNotif({
              type: 'application',
              priority: isUrgent ? 'urgent' : 'normal',
              title: isGood ? '🎉 Application Update!' : app.status === 'rejected' ? '❌ Application Update' : '📋 Application Updated',
              message: `${app.universityName} — ${app.courseName} is now "${STATUS_LABELS[app.status] ?? app.status}".`,
              link: '/student/applications',
            });
          }

          // Smart alert: offer received but not acted on for 3+ days
          if (app.status === 'offer_received' && app.updatedDate) {
            const daysOld = (Date.now() - new Date(app.updatedDate).getTime()) / 86400000;
            const smartKey = `offer_${id}`;
            if (daysOld >= 3 && !smartNotifDates.current[smartKey]) {
              addNotif({
                type: 'application', priority: 'urgent',
                title: '⚠️ Offer Expires Soon!',
                message: `Your offer from ${app.universityName} has been pending for ${Math.floor(daysOld)} days. Accept or reject it before it expires.`,
                link: '/student/applications',
              });
              smartNotifDates.current[smartKey] = new Date().toISOString();
              localStorage.setItem(`smart_notif_${userId}`, JSON.stringify(smartNotifDates.current));
            }
          }
        });

        lastAppStatuses.current = next;
        localStorage.setItem(appStatusKey(userId), JSON.stringify(next));
      } catch {}
    };
    check();
    const t = setInterval(check, 30_000);
    return () => clearInterval(t);
  }, [isAuthenticated, userRole, userId, addNotif]);

  // ── Counselor: new student assigned + inactivity smart alerts ───────────
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'counselor' || !userId) return;
    lastCounselorStuds.current = new Set(JSON.parse(localStorage.getItem(studentsKey(userId)) || '[]'));
    smartNotifDates.current = JSON.parse(localStorage.getItem(`smart_notif_${userId}`) || '{}');

    const check = async () => {
      try {
        const students = await api.students.list();
        const prevIds = lastCounselorStuds.current;
        const nextIds = new Set<string>();

        students.forEach((s: any) => {
          const id = (s._id || s.id).toString();
          nextIds.add(id);

          // New student assigned
          if (prevIds.size > 0 && !prevIds.has(id)) {
            addNotif({
              type: 'counselor', priority: 'normal',
              title: '👤 New Student Assigned',
              message: `${s.name} has been assigned to you. Review their profile to get started.`,
              link: '/counselor/students',
            });
          }

          // Smart alert: student inactive for 5+ days
          const lastActive = s.updatedAt || s.joinedDate;
          if (lastActive) {
            const daysInactive = (Date.now() - new Date(lastActive).getTime()) / 86400000;
            const smartKey = `inactive_${id}`;
            const lastNotified = smartNotifDates.current[smartKey];
            const daysSinceNotif = lastNotified ? (Date.now() - new Date(lastNotified).getTime()) / 86400000 : Infinity;

            if (daysInactive >= 5 && daysSinceNotif >= 3) {
              addNotif({
                type: 'counselor', priority: 'normal',
                title: '💬 Follow Up Required',
                message: `${s.name} hasn't had any activity in ${Math.floor(daysInactive)} days. Consider reaching out.`,
                link: '/counselor/students',
              });
              smartNotifDates.current[smartKey] = new Date().toISOString();
              localStorage.setItem(`smart_notif_${userId}`, JSON.stringify(smartNotifDates.current));
            }
          }
        });

        lastCounselorStuds.current = nextIds;
        localStorage.setItem(studentsKey(userId), JSON.stringify([...nextIds]));
      } catch {}
    };
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, [isAuthenticated, userRole, userId, addNotif]);

  // ── Admin: smart alert for stale applications ────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'admin' || !userId) return;
    smartNotifDates.current = JSON.parse(localStorage.getItem(`smart_notif_${userId}`) || '{}');

    const check = async () => {
      try {
        const students = await api.admin.students();
        const allApps = students.flatMap((s: any) =>
          (s.applications || []).map((a: any) => ({ ...a, studentName: s.name }))
        );
        const stale = allApps.filter((a: any) =>
          a.status === 'under_review' && a.updatedDate &&
          (Date.now() - new Date(a.updatedDate).getTime()) / 86400000 >= 7
        );

        const smartKey = `stale_apps_${stale.length}`;
        if (stale.length > 0 && !smartNotifDates.current[smartKey]) {
          addNotif({
            type: 'application', priority: 'normal',
            title: '📊 Applications Need Attention',
            message: `${stale.length} application${stale.length > 1 ? 's have' : ' has'} been under review for more than 7 days without an update.`,
            link: '/admin/applications',
          });
          smartNotifDates.current[smartKey] = new Date().toISOString();
          localStorage.setItem(`smart_notif_${userId}`, JSON.stringify(smartNotifDates.current));
        }
      } catch {}
    };
    check();
    const t = setInterval(check, 5 * 60_000); // every 5 mins
    return () => clearInterval(t);
  }, [isAuthenticated, userRole, userId, addNotif]);

  // ── Discount notifications — students only, once per user ────────────────
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'student' || !userId) return;
    if (localStorage.getItem(discountKey(userId))) return;
    localStorage.setItem(discountKey(userId), 'true');
    DISCOUNT_NOTIFICATIONS.forEach((d, i) => setTimeout(() => addNotif(d), (i + 1) * 3000));
  }, [isAuthenticated, userRole, userId, addNotif]);

  // ── Real-time Socket.io — ALL roles ─────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const socket = import.meta.env.VITE_API_URL
      ? io(import.meta.env.VITE_API_URL)
      : io();
    socket.emit('register', userId);

    // Admin: new subscriber
    if (userRole === 'admin') {
      socket.on('admin:new_subscriber', ({ name, email }: { name?: string; email: string }) => {
        addNotif({
          type: 'subscriber', priority: 'normal',
          title: '🔔 New Registration',
          message: `${name ? name + ' (' + email + ')' : email} just registered from the homepage.`,
          link: '/admin/application-board',
        });
      });
    }

    // Student: new meeting scheduled
    const meetingsLink = userRole === 'counselor' ? '/counselor/meetings' : userRole === 'admin' ? '/admin/meetings' : '/student/meetings';
    if (userRole === 'student') {
      socket.on('meeting:scheduled', (m: any) => {
        addNotif({
          type: 'meeting', priority: 'urgent',
          title: '📅 New Meeting Scheduled',
          message: `"${m.title}" has been scheduled for ${m.scheduledDate} at ${m.scheduledTime} via ${m.platform}.`,
          link: meetingsLink,
        });
        // Push into Activities calendar + reminders in real-time
        window.dispatchEvent(new CustomEvent('meeting:scheduled', { detail: m }));
      });

      // Student: real-time application status update
      socket.on('application:updated', (data: any) => {
        const STATUS_MAP: Record<string, string> = {
          submitted: 'Submitted', under_review: 'Under Review',
          offer_received: 'Offer Received', accepted: 'Accepted',
          rejected: 'Rejected', enrolled: 'Enrolled',
        };
        const isUrgent = ['offer_received', 'rejected', 'accepted'].includes(data.status);
        const isGood   = ['offer_received', 'accepted', 'enrolled'].includes(data.status);
        addNotif({
          type: 'application', priority: isUrgent ? 'urgent' : 'normal',
          title: isGood ? '🎉 Great News!' : data.status === 'rejected' ? '❌ Application Update' : '📋 Application Updated',
          message: `${data.universityName} — ${data.courseName} status is now "${STATUS_MAP[data.status] ?? data.status}".`,
          link: '/student/applications',
        });
      });
    }

    // All roles: real-time activity feed events
    socket.on('new_activity', (event: any) => {
      if (userRole === 'admin' || userRole === 'counselor') {
        const isImportant = ['offer', 'payment', 'visa'].includes(event.type);
        addNotif({
          type: 'application', priority: isImportant ? 'urgent' : 'info',
          title: isImportant ? `⚡ ${event.action}` : `📌 ${event.action}`,
          message: event.detail || `Activity from ${event.studentName || 'a student'}`,
          link: userRole === 'admin' ? '/admin/live-feed' : '/counselor/activities',
        });
      }
    });

    // Students only: call scheduled by their counselor
    socket.on('call:scheduled', (data: any) => {
      if (userRole !== 'student') return;
      const timeLabel = data.scheduledTimeFormatted || data.scheduledTime || '';
      addNotif({
        type: 'meeting', priority: 'urgent',
        title: '📞 Call Scheduled',
        message: `${data.schedulerName || 'Your counselor'} scheduled a ${data.callType || 'video'} call with you on ${data.scheduledDate} at ${timeLabel}.`,
        link: meetingsLink,
      });
      window.dispatchEvent(new CustomEvent('call:scheduled', { detail: data }));
    });

    // All roles: meeting rescheduled / updated
    socket.on('meeting:updated', (m: any) => {
      addNotif({
        type: 'meeting', priority: 'urgent',
        title: '📅 Meeting Rescheduled',
        message: `"${m.title}" has been updated — ${m.scheduledDate} at ${m.scheduledTime} via ${m.platform}.`,
        link: meetingsLink,
      });
      // Sync updated details into Activities calendar
      window.dispatchEvent(new CustomEvent('meeting:updated', { detail: m }));
    });

    // All roles: task assigned to me
    socket.on('task:assigned', (data: any) => {
      const priorityLabel = data.priority === 'high' ? '🔴 High' : data.priority === 'low' ? '🟢 Low' : '🟡 Medium';
      const dueText = data.dueDate ? ` · Due ${data.dueDate}` : '';
      addNotif({
        type: 'task', priority: 'urgent',
        title: '📋 New Task Assigned',
        message: `${data.assignedByName} assigned you "${data.title}" [${priorityLabel}]${dueText}.`,
        link: '/student/activities',
      });
    });

    return () => { socket.disconnect(); };
  }, [isAuthenticated, userRole, userId, addNotif]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead     = (id: string) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead  = ()           => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const dismiss      = (id: string) => setNotifications(p => p.filter(n => n.id !== id));
  const dismissToast = (id: string) => setToasts(p => p.filter(n => n.id !== id));
  const clearAll     = ()           => { setNotifications([]); localStorage.removeItem(storageKey(userId)); };

  return (
    <NotificationContext.Provider value={{ notifications, toasts, unreadCount, addNotif, markRead, markAllRead, dismiss, dismissToast, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
