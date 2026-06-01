import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar, CheckSquare, Star, Phone, Plus, ChevronLeft, ChevronRight,
  Check, Clock, Video, PhoneCall, PhoneOff, Trash2, X, Bell, BellOff
} from 'lucide-react';

type Tab = 'calendar' | 'tasks' | 'events' | 'calls';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number)    { return new Date(y, m, 1).getDay(); }
function padDate(n: number) { return String(n).padStart(2, '0'); }

const INITIAL_TASKS = [
  { id: 1, title: 'Review student visa documents',       done: false, priority: 'high',   due: '2026-05-29', page: 'applications' },
  { id: 2, title: 'Follow up with university admissions',done: false, priority: 'medium', due: '2026-05-30', page: 'universities' },
  { id: 3, title: 'Update application status reports',   done: true,  priority: 'low',    due: '2026-05-27', page: 'applications' },
  { id: 4, title: 'Prepare counseling session notes',    done: false, priority: 'high',   due: '2026-05-31', page: 'students' },
];

const EVENT_PAGE: Record<string, string> = {
  university: 'universities',
  workshop:   'courses',
  seminar:    'applications',
  meeting:    'chat',
};

const INITIAL_EVENTS = [
  { id: 1, title: 'University Open Day – Melbourne', date: '2026-05-30', time: '10:00 AM', type: 'university', desc: 'Virtual open day for international students' },
  { id: 2, title: 'IELTS Preparation Workshop',      date: '2026-05-31', time: '02:00 PM', type: 'workshop',   desc: 'Group session for IELTS aspirants' },
  { id: 3, title: 'Visa Guidance Seminar',            date: '2026-06-02', time: '11:00 AM', type: 'seminar',    desc: 'Australian student visa process walkthrough' },
  { id: 4, title: 'Parent-Counselor Meet',            date: '2026-06-05', time: '04:00 PM', type: 'meeting',   desc: 'Quarterly parent engagement session' },
];

const INITIAL_CALLS = [
  { id: 1, name: 'Riya Sharma',  type: 'video', status: 'completed', duration: '24 min', time: '10:30 AM', date: 'Today' },
  { id: 2, name: 'Arjun Mehta',  type: 'audio', status: 'missed',    duration: '-',      time: '09:15 AM', date: 'Today' },
  { id: 3, name: 'Priya Nair',   type: 'video', status: 'completed', duration: '45 min', time: '03:00 PM', date: 'Yesterday' },
  { id: 4, name: 'Karan Patel',  type: 'audio', status: 'completed', duration: '12 min', time: '11:00 AM', date: 'Yesterday' },
  { id: 5, name: 'Sara Khan',    type: 'video', status: 'scheduled', duration: '-',      time: '02:00 PM', date: 'Tomorrow' },
];

const INITIAL_REMINDERS = [
  { id: 1, date: '2026-05-28', text: 'Submit monthly progress report', time: '09:00 AM' },
  { id: 2, date: '2026-05-30', text: 'Call Riya about UK visa docs',   time: '11:30 AM' },
];

const PRIORITY_COLOR: Record<string,string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-green-100 text-green-700',
};
const EVENT_TYPE_COLOR: Record<string,string> = {
  university: 'bg-blue-100 text-blue-700',
  workshop:   'bg-purple-100 text-purple-700',
  seminar:    'bg-orange-100 text-orange-700',
  meeting:    'bg-green-100 text-green-700',
};
const EVENT_TYPE_DOT: Record<string,string> = {
  university: 'bg-blue-500',
  workshop:   'bg-purple-500',
  seminar:    'bg-orange-500',
  meeting:    'bg-green-500',
};
const CALL_STATUS_COLOR: Record<string,string> = {
  completed: 'text-green-600',
  missed:    'text-red-500',
  scheduled: 'text-blue-600',
};
const CALL_STATUS_BG: Record<string,string> = {
  completed: 'bg-green-50',
  missed:    'bg-red-50',
  scheduled: 'bg-blue-50',
};

type DashTheme = {
  calHeader: string; calHeaderSub: string; todayBtnText: string;
  selectedBg: string; selectedNumBg: string; selectedNumText: string;
  todayHighlight: string; todayNumBg: string;
  moreText: string; indicatorDot: string;
  dayDetailBg: string; dayDetailSub: string;
  eventTime: string; starIcon: string; eventsBadge: string;
  reminderBtn: string; reminderLink: string;
  tabBadgeActive: string;
  actionBtn: string; actionBtnHover: string;
  formBorder: string; hoverBorder: string;
};

const THEMES: Record<string, DashTheme> = {
  admin: {
    calHeader: 'from-purple-400 via-purple-500 to-indigo-500', calHeaderSub: 'text-purple-100', todayBtnText: 'text-purple-600',
    selectedBg: 'bg-purple-500', selectedNumBg: 'bg-white', selectedNumText: 'text-purple-600',
    todayHighlight: 'bg-purple-50', todayNumBg: 'bg-purple-500 text-white',
    moreText: 'text-purple-100', indicatorDot: 'bg-white',
    dayDetailBg: 'from-purple-400 to-indigo-500', dayDetailSub: 'text-purple-100',
    eventTime: 'text-purple-600', starIcon: 'text-purple-500', eventsBadge: 'bg-purple-100 text-purple-700',
    reminderBtn: 'text-purple-600 hover:text-purple-800', reminderLink: 'text-purple-600',
    tabBadgeActive: 'bg-purple-100 text-purple-700',
    actionBtn: 'bg-purple-600', actionBtnHover: 'hover:bg-purple-700',
    formBorder: 'focus:border-purple-400', hoverBorder: 'hover:border-gray-200',
  },
  counselor: {
    calHeader: 'from-green-400 to-emerald-500', calHeaderSub: 'text-green-100', todayBtnText: 'text-green-700',
    selectedBg: 'bg-green-500', selectedNumBg: 'bg-white', selectedNumText: 'text-green-700',
    todayHighlight: 'bg-green-50', todayNumBg: 'bg-green-500 text-white',
    moreText: 'text-green-100', indicatorDot: 'bg-white',
    dayDetailBg: 'from-green-400 to-emerald-500', dayDetailSub: 'text-green-100',
    eventTime: 'text-green-600', starIcon: 'text-green-500', eventsBadge: 'bg-green-100 text-green-700',
    reminderBtn: 'text-green-600 hover:text-green-800', reminderLink: 'text-green-600',
    tabBadgeActive: 'bg-green-100 text-green-700',
    actionBtn: 'bg-green-500', actionBtnHover: 'hover:bg-green-600',
    formBorder: 'focus:border-green-400', hoverBorder: 'hover:border-green-100',
  },
  student: {
    calHeader: 'from-blue-700 via-blue-600 to-blue-400', calHeaderSub: 'text-blue-100', todayBtnText: 'text-blue-700',
    selectedBg: 'bg-blue-600', selectedNumBg: 'bg-white', selectedNumText: 'text-blue-700',
    todayHighlight: 'bg-blue-50', todayNumBg: 'bg-blue-600 text-white',
    moreText: 'text-blue-100', indicatorDot: 'bg-white',
    dayDetailBg: 'from-blue-700 to-blue-500', dayDetailSub: 'text-blue-100',
    eventTime: 'text-blue-600', starIcon: 'text-blue-500', eventsBadge: 'bg-blue-100 text-blue-700',
    reminderBtn: 'text-blue-600 hover:text-blue-800', reminderLink: 'text-blue-600',
    tabBadgeActive: 'bg-blue-100 text-blue-700',
    actionBtn: 'bg-blue-600', actionBtnHover: 'hover:bg-blue-700',
    formBorder: 'focus:border-blue-400', hoverBorder: 'hover:border-blue-100',
  },
  appteam: {
    calHeader: 'from-orange-400 to-amber-400', calHeaderSub: 'text-orange-100', todayBtnText: 'text-orange-600',
    selectedBg: 'bg-orange-400', selectedNumBg: 'bg-white', selectedNumText: 'text-orange-600',
    todayHighlight: 'bg-orange-50', todayNumBg: 'bg-orange-400 text-white',
    moreText: 'text-orange-100', indicatorDot: 'bg-white',
    dayDetailBg: 'from-orange-400 to-amber-400', dayDetailSub: 'text-orange-100',
    eventTime: 'text-orange-600', starIcon: 'text-orange-500', eventsBadge: 'bg-orange-100 text-orange-700',
    reminderBtn: 'text-orange-600 hover:text-orange-800', reminderLink: 'text-orange-600',
    tabBadgeActive: 'bg-orange-100 text-orange-700',
    actionBtn: 'bg-orange-500', actionBtnHover: 'hover:bg-orange-600',
    formBorder: 'focus:border-orange-400', hoverBorder: 'hover:border-orange-100',
  },
};

export default function Activities() {
  const { pathname } = useLocation();
  const t: DashTheme =
    pathname.includes('/admin')    ? THEMES.admin :
    pathname.includes('/counselor') ? THEMES.counselor :
    pathname.includes('/student')  ? THEMES.student :
    pathname.includes('/appteam') || pathname.includes('/board') ? THEMES.appteam :
    THEMES.admin;

  const role =
    pathname.includes('/admin')     ? 'admin' :
    pathname.includes('/counselor') ? 'counselor' :
    pathname.includes('/student')   ? 'student' :
    pathname.includes('/appteam')   ? 'appteam' :
    pathname.includes('/board')     ? 'board' : 'counselor';

  const today = new Date();
  const [tab, setTab]           = useState<Tab>('calendar');
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [tasks, setTasks]           = useState(INITIAL_TASKS);
  const [newTask, setNewTask]       = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const [events, setEvents]           = useState(INITIAL_EVENTS);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent]       = useState({ title: '', date: '', time: '', type: 'meeting', desc: '' });

  const [calls, setCalls]               = useState(INITIAL_CALLS);
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [newCall, setNewCall]           = useState({ name: '', type: 'video', time: '', date: 'Tomorrow' });

  const [reminders, setReminders]         = useState(INITIAL_REMINDERS);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder]     = useState({ text: '', time: '' });

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay    = getFirstDay(calYear, calMonth);

  const prevMonth = () => calMonth === 0 ? (setCalYear(y => y - 1), setCalMonth(11)) : setCalMonth(m => m - 1);
  const nextMonth = () => calMonth === 11 ? (setCalYear(y => y + 1), setCalMonth(0)) : setCalMonth(m => m + 1);

  const selectedDateStr = `${calYear}-${padDate(calMonth + 1)}-${padDate(selectedDay)}`;
  const dayEvents    = events.filter(e => e.date === selectedDateStr);
  const dayReminders = reminders.filter(r => r.date === selectedDateStr);

  const toggleTask  = (id: number) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask  = (id: number) => setTasks(ts => ts.filter(t => t.id !== id));
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(ts => [...ts, { id: Date.now(), title: newTask.trim(), done: false, priority: 'medium', due: '' }]);
    setNewTask(''); setShowAddTask(false);
  };

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    setEvents(ev => [...ev, { id: Date.now(), ...newEvent }]);
    setNewEvent({ title: '', date: '', time: '', type: 'meeting', desc: '' });
    setShowAddEvent(false);
  };

  const addCall = () => {
    if (!newCall.name.trim() || !newCall.time) return;
    setCalls(cs => [...cs, { id: Date.now(), ...newCall, status: 'scheduled', duration: '-' }]);
    setNewCall({ name: '', type: 'video', time: '', date: 'Tomorrow' });
    setShowScheduleCall(false);
  };

  const addReminder = () => {
    if (!newReminder.text.trim()) return;
    setReminders(rs => [...rs, { id: Date.now(), date: selectedDateStr, text: newReminder.text.trim(), time: newReminder.time }]);
    setNewReminder({ text: '', time: '' });
    setShowAddReminder(false);
  };
  const deleteReminder = (id: number) => setReminders(rs => rs.filter(r => r.id !== id));

  const TABS: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { key: 'tasks',    label: 'Tasks',    icon: <CheckSquare className="w-4 h-4" />, count: tasks.filter(t => !t.done).length },
    { key: 'events',   label: 'Events',   icon: <Star className="w-4 h-4" />,        count: events.length },
    { key: 'calls',    label: 'Calls',    icon: <Phone className="w-4 h-4" />,       count: calls.filter(c => c.status === 'scheduled').length },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your calendar, tasks, events and calls in one place</p>
      </div>

      {/* Tabs – top of page, horizontal */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button type="button" key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}>
            {t.icon}
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                tab === t.key ? t.tabBadgeActive : 'bg-gray-200 text-gray-600'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Full-width Calendar (only when Calendar tab active) ── */}
      {tab === 'calendar' && <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Month nav */}
        <div className={`flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r ${t.calHeader}`}>
          <div>
            <h2 className="text-xl font-bold text-white">{MONTH_NAMES[calMonth]} {calYear}</h2>
            <p className={`${t.calHeaderSub} text-xs mt-0.5`}>{DAY_NAMES[today.getDay()]}, {today.getDate()} {MONTH_NAMES[today.getMonth()]}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button"
              onClick={() => { setCalYear(today.getFullYear()); setCalMonth(today.getMonth()); setSelectedDay(today.getDate()); }}
              className={`px-3 py-1.5 text-xs font-semibold ${t.todayBtnText} bg-white rounded-lg hover:bg-gray-50 transition-colors`}>
              Today
            </button>
            <button type="button" onClick={prevMonth} title="Previous month" className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button type="button" onClick={nextMonth} title="Next month" className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Day-name header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {DAY_SHORT.map(d => (
            <div key={d} className="text-center text-xs font-bold text-gray-400 py-3 tracking-wide">{d}</div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} className="h-20 bg-gray-50/50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${calYear}-${padDate(calMonth + 1)}-${padDate(day)}`;
            const hasEvent    = events.some(e => e.date === dateStr);
            const hasReminder = reminders.some(r => r.date === dateStr);
            const isToday     = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
            const isSelected  = day === selectedDay;
            const dayEvs = events.filter(e => e.date === dateStr);

            return (
              <button type="button" key={day} title={`Select ${MONTH_NAMES[calMonth]} ${day}`} onClick={() => setSelectedDay(day)}
                className={`h-20 flex flex-col items-start justify-start p-2 text-left transition-all duration-150 relative group ${
                  isSelected ? `${t.selectedBg} text-white` : isToday ? t.todayHighlight : 'hover:bg-gray-50'
                }`}>
                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                  isSelected ? `${t.selectedNumBg} ${t.selectedNumText}` : isToday ? t.todayNumBg : 'text-gray-700'
                }`}>{day}</span>

                {/* Event dots / mini labels */}
                <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                  {dayEvs.slice(0, 2).map(e => (
                    <span key={e.id} className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate leading-tight ${
                      isSelected ? 'bg-white/20 text-white' : EVENT_TYPE_COLOR[e.type]
                    }`}>{e.title}</span>
                  ))}
                  {dayEvs.length > 2 && (
                    <span className={`text-[10px] font-medium ${isSelected ? t.moreText : 'text-gray-400'}`}>+{dayEvs.length - 2} more</span>
                  )}
                </div>

                {/* Indicator dots */}
                <div className="absolute bottom-1.5 right-2 flex gap-1">
                  {hasReminder && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-yellow-300' : 'bg-yellow-400'}`} />}
                  {hasEvent && !dayEvs.length && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? t.indicatorDot : 'bg-gray-300'}`} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-6 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-400 font-medium">Legend:</span>
          {Object.entries(EVENT_TYPE_COLOR).map(([type, cls]) => (
            <span key={type} className={`text-[10px] px-2 py-0.5 rounded font-medium ${cls}`}>{type}</span>
          ))}
          <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Reminder</span>
        </div>
      </div>

      }

      {/* ── CALENDAR (day detail) ── */}
      {tab === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Selected day header */}
          <div className={`bg-gradient-to-br ${t.dayDetailBg} rounded-2xl p-5 text-white`}>
            <p className={`${t.dayDetailSub} text-xs font-semibold uppercase tracking-widest mb-1`}>{MONTH_NAMES[calMonth]} {calYear}</p>
            <p className="text-4xl font-bold">{String(selectedDay).padStart(2, '0')}</p>
            <p className={`${t.dayDetailSub} text-sm`}>{DAY_NAMES[new Date(calYear, calMonth, selectedDay).getDay()]}</p>
            <div className="mt-3 flex gap-3">
              <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                <p className="text-lg font-bold">{dayEvents.length}</p>
                <p className="text-[10px] text-indigo-200">Events</p>
              </div>
              <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                <p className="text-lg font-bold">{dayReminders.length}</p>
                <p className="text-[10px] text-indigo-200">Reminders</p>
              </div>
            </div>
          </div>

          {/* Events for selected day */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Star className={`w-4 h-4 ${t.starIcon}`} /> Events
              </h3>
              {dayEvents.length > 0 && (
                <span className={`text-xs ${t.eventsBadge} px-2 py-0.5 rounded-full font-medium`}>{dayEvents.length}</span>
              )}
            </div>
            <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
              {dayEvents.length > 0 ? dayEvents.map(e => (
                <div key={e.id} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${EVENT_TYPE_DOT[e.type] || 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 leading-tight">{e.title}</p>
                    <p className={`text-[11px] ${t.eventTime} font-medium mt-0.5`}>{e.time}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-5">
                  <Calendar className="w-7 h-7 text-gray-200 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-400">No events</p>
                </div>
              )}
            </div>
          </div>

          {/* Reminders for selected day */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" /> Reminders
              </h3>
              <button type="button" onClick={() => setShowAddReminder(true)}
                className={`flex items-center gap-1 text-xs font-medium ${t.reminderBtn} transition-colors`}>
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {showAddReminder && (
              <div className="mx-3 mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <input value={newReminder.text} onChange={e => setNewReminder(n => ({ ...n, text: e.target.value }))}
                  placeholder="Reminder note..." autoFocus
                  className="w-full text-xs border border-amber-200 rounded-lg px-3 py-2 outline-none focus:border-amber-400 bg-white text-gray-900 placeholder-gray-400 mb-2" />
                <input type="time" value={newReminder.time} onChange={e => setNewReminder(n => ({ ...n, time: e.target.value }))}
                  title="Reminder time"
                  className="w-full text-xs border border-amber-200 rounded-lg px-3 py-2 outline-none focus:border-amber-400 bg-white text-gray-700 mb-2" />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowAddReminder(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">Cancel</button>
                  <button type="button" onClick={addReminder} className="text-xs bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600">Save</button>
                </div>
              </div>
            )}

            <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
              {dayReminders.length > 0 ? dayReminders.map(r => (
                <div key={r.id} className="flex items-start gap-2.5 bg-amber-50 rounded-xl p-3 group">
                  <Bell className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 leading-tight">{r.text}</p>
                    {r.time && <p className="text-[11px] text-amber-600 font-medium mt-0.5">{r.time}</p>}
                  </div>
                  <button type="button" onClick={() => deleteReminder(r.id)} title="Delete reminder"
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )) : (
                <div className="text-center py-5">
                  <BellOff className="w-7 h-7 text-gray-200 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-400">No reminders for this day</p>
                  <button type="button" onClick={() => setShowAddReminder(true)}
                    className={`mt-2 text-xs ${t.reminderLink} font-medium hover:underline`}>+ Add a reminder</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TASKS ── */}
      {tab === 'tasks' && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-4">
              <span className="text-sm text-gray-500"><span className="font-semibold text-gray-800">{tasks.filter(t => !t.done).length}</span> pending</span>
              <span className="text-sm text-gray-500"><span className="font-semibold text-gray-800">{tasks.filter(t => t.done).length}</span> completed</span>
            </div>
            <button type="button" onClick={() => setShowAddTask(true)}
              className={`flex items-center gap-2 px-4 py-2 ${t.actionBtn} text-white text-sm font-medium rounded-xl ${t.actionBtnHover} transition-colors shadow-sm`}>
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>

          {showAddTask && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-md mb-4">
              <input value={newTask} onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="What needs to be done?" autoFocus
                className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none ${t.formBorder} text-gray-900 placeholder-gray-400 mb-3`} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAddTask(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                <button type="button" onClick={addTask} className={`px-4 py-1.5 ${t.actionBtn} text-white text-sm rounded-lg ${t.actionBtnHover}`}>Add</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {tasks.filter(t => !t.done).map(task => (
              <div key={task.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3.5 shadow-sm hover:border-gray-200 transition-all">
                <button type="button" title="Mark complete" onClick={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded-md border-2 border-gray-300 flex items-center justify-center flex-shrink-0 hover:border-gray-500 transition-colors" />
                <Link to={`/${role}/${task.page}`} className="flex-1 min-w-0 group">
                  <p className="text-sm font-medium text-gray-900 group-hover:underline">{task.title}</p>
                  {task.due && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />Due {task.due}</p>}
                </Link>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                <button type="button" onClick={() => deleteTask(task.id)} title="Delete task" className="p-1 text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {tasks.filter(t => t.done).length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 pt-3 pb-1">Completed</p>
                {tasks.filter(t => t.done).map(task => (
                  <div key={task.id} className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 opacity-60">
                    <button type="button" title="Mark incomplete" onClick={() => toggleTask(task.id)}
                      className="w-5 h-5 rounded-md bg-green-500 border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </button>
                    <Link to={`/${role}/${task.page}`} className="flex-1 min-w-0">
                      <p className="text-sm text-gray-400 line-through hover:underline">{task.title}</p>
                    </Link>
                    <button type="button" onClick={() => deleteTask(task.id)} title="Delete task" className="p-1 text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-gray-500"><span className="font-semibold text-gray-800">{events.length}</span> upcoming events</span>
            <button type="button" onClick={() => setShowAddEvent(true)}
              className={`flex items-center gap-2 px-4 py-2 ${t.actionBtn} text-white text-sm font-medium rounded-xl ${t.actionBtnHover} transition-colors shadow-sm`}>
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>

          {showAddEvent && (
            <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-md mb-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">New Event</h3>
              <div className="grid grid-cols-1 gap-3">
                <input value={newEvent.title} onChange={e => setNewEvent(n => ({ ...n, title: e.target.value }))}
                  placeholder="Event title" className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none ${t.formBorder} text-gray-900 placeholder-gray-400`} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" title="Event date" value={newEvent.date} onChange={e => setNewEvent(n => ({ ...n, date: e.target.value }))}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 text-gray-700" />
                  <input type="time" title="Event time" value={newEvent.time} onChange={e => setNewEvent(n => ({ ...n, time: e.target.value }))}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 text-gray-700" />
                </div>
                <select title="Event type" value={newEvent.type} onChange={e => setNewEvent(n => ({ ...n, type: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 text-gray-700">
                  <option value="meeting">Meeting</option>
                  <option value="university">University</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                </select>
                <textarea value={newEvent.desc} onChange={e => setNewEvent(n => ({ ...n, desc: e.target.value }))}
                  placeholder="Description (optional)" rows={2}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 text-gray-700 placeholder-gray-400 resize-none" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowAddEvent(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                <button type="button" onClick={addEvent} className={`px-4 py-1.5 ${t.actionBtn} text-white text-sm rounded-lg ${t.actionBtnHover}`}>Save Event</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {events.map(ev => (
              <Link key={ev.id} to={`/${role}/${EVENT_PAGE[ev.type] || 'activities'}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all overflow-hidden">
                <div className="flex">
                  <div className={`w-1.5 flex-shrink-0 ${EVENT_TYPE_DOT[ev.type] || 'bg-gray-400'}`} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">{ev.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EVENT_TYPE_COLOR[ev.type] || 'bg-gray-100 text-gray-600'}`}>{ev.type}</span>
                        </div>
                        <p className="text-xs text-gray-500">{ev.desc}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-600">{ev.time}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{ev.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── CALLS ── */}
      {tab === 'calls' && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-4">
              <span className="text-sm text-gray-500"><span className="font-semibold text-blue-600">{calls.filter(c => c.status === 'scheduled').length}</span> scheduled</span>
              <span className="text-sm text-gray-500"><span className="font-semibold text-red-500">{calls.filter(c => c.status === 'missed').length}</span> missed</span>
            </div>
            <button type="button" onClick={() => setShowScheduleCall(true)}
              className={`flex items-center gap-2 px-4 py-2 ${t.actionBtn} text-white text-sm font-medium rounded-xl ${t.actionBtnHover} transition-colors shadow-sm`}>
              <Plus className="w-4 h-4" /> Schedule Call
            </button>
          </div>

          {showScheduleCall && (
            <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-md mb-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Schedule a Call</h3>
              <div className="grid grid-cols-1 gap-3">
                <input value={newCall.name} onChange={e => setNewCall(n => ({ ...n, name: e.target.value }))}
                  placeholder="Contact name" className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 text-gray-900 placeholder-gray-400" />
                <div className="grid grid-cols-2 gap-3">
                  <select title="Call type" value={newCall.type} onChange={e => setNewCall(n => ({ ...n, type: e.target.value }))}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 text-gray-700">
                    <option value="video">Video Call</option>
                    <option value="audio">Audio Call</option>
                  </select>
                  <select title="Call date" value={newCall.date} onChange={e => setNewCall(n => ({ ...n, date: e.target.value }))}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 text-gray-700">
                    <option>Today</option>
                    <option>Tomorrow</option>
                    <option>Yesterday</option>
                  </select>
                </div>
                <input type="time" title="Call time" value={newCall.time} onChange={e => setNewCall(n => ({ ...n, time: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 text-gray-700" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowScheduleCall(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                <button type="button" onClick={addCall} className={`px-4 py-1.5 ${t.actionBtn} text-white text-sm rounded-lg ${t.actionBtnHover}`}>Schedule</button>
              </div>
            </div>
          )}

          {(['Today', 'Tomorrow', 'Yesterday'] as const).map(group => {
            const groupCalls = calls.filter(c => c.date === group);
            if (!groupCalls.length) return null;
            return (
              <div key={group} className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{group}</p>
                <div className="space-y-2">
                  {groupCalls.map(call => (
                    <Link key={call.id} to={`/${role}/chat`}
                      className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-4 py-3.5 shadow-sm hover:border-gray-200 hover:shadow-md transition-all">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${CALL_STATUS_BG[call.status]}`}>
                        {call.type === 'video'
                          ? <Video className={`w-5 h-5 ${CALL_STATUS_COLOR[call.status]}`} />
                          : call.status === 'missed'
                          ? <PhoneOff className="w-5 h-5 text-red-500" />
                          : <PhoneCall className={`w-5 h-5 ${CALL_STATUS_COLOR[call.status]}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{call.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{call.type === 'video' ? 'Video' : 'Audio'} · {call.time}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-semibold capitalize ${CALL_STATUS_COLOR[call.status]}`}>{call.status}</p>
                        {call.duration !== '-' && <p className="text-xs text-gray-400 mt-0.5">{call.duration}</p>}
                      </div>
                      {call.status === 'scheduled' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg">
                          <Video className="w-3 h-3" /> Join
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
