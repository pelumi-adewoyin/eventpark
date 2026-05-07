import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, Users, DollarSign, Wallet, ChevronRight,
  Clock, CheckCircle, ArrowUpRight, Gift, QrCode, Star, TrendingUp,
  Sparkles, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { events as eventsApi, notifications as notificationsApi } from '../../lib/api';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <button onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all text-left w-full ${onClick ? 'cursor-pointer' : 'cursor-default'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </button>
  );
}

function ExploringView() {
  const features = [
    { icon: '🎉', title: 'Plan any event', desc: 'Weddings, birthdays, corporate — every type, fully supported.' },
    { icon: '🛒', title: 'Book vendors', desc: 'Find and book from 12K+ verified vendors across Nigeria.' },
    { icon: '🎁', title: 'Create a wishlist', desc: 'Let guests contribute gifts or cash directly to your event.' },
    { icon: '✅', title: 'Manage tasks', desc: 'Stay on track with smart to-do lists and team collaboration.' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-brand-50 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-brand-600" />
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Welcome to EventPark</h2>
      <p className="text-gray-400 mb-10 leading-relaxed">
        You're all set! Create your first event to start planning, or explore what EventPark can do for you.
      </p>
      <Link to="/events/create"
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-colors mb-12">
        <Plus className="w-5 h-5" />
        Create your first event
      </Link>

      <div className="grid grid-cols-2 gap-4 text-left">
        {features.map(f => (
          <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-2xl mb-3">{f.icon}</div>
            <div className="font-bold text-gray-900 text-sm mb-1">{f.title}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const COLORS = [
  'from-pink-500 to-rose-600',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-green-600',
];

function PlanningView({ events, activeEvent, setActiveEvent, notifications, navigate, user }) {
  const budget = activeEvent.budget_total || 0;
  const spent = activeEvent.budget_spent || 0;
  const guests = activeEvent.guests_count || 0;
  const budgetPct = budget > 0 ? Math.round((spent / budget) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Event switcher */}
      <div className="flex gap-3 flex-wrap">
        {events.map(ev => (
          <button key={ev.id} onClick={() => setActiveEvent(ev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              activeEvent.id === ev.id
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.status === 'active' ? 'bg-green-500' : 'bg-yellow-400'}`} />
            {ev.title}
          </button>
        ))}
        <Link to="/events/create"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-dashed border-gray-300 text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-all">
          <Plus className="w-4 h-4" />
          Add event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Days to go"
          value={activeEvent.start_at ? Math.max(0, Math.ceil((new Date(activeEvent.start_at) - Date.now()) / 86400000)) : '—'}
          sub={fmtDate(activeEvent.start_at)}
          color="bg-brand-50 text-brand-600"
        />
        <StatCard
          icon={Users}
          label="Guests"
          value={guests}
          sub="invited"
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={DollarSign}
          label="Budget used"
          value={budget > 0 ? `${budgetPct}%` : '—'}
          sub={budget > 0 ? `₦${(spent / 1000000).toFixed(1)}M of ₦${(budget / 1000000).toFixed(0)}M` : 'No budget set'}
          color="bg-orange-50 text-orange-500"
          onClick={() => {}}
        />
        <StatCard
          icon={Wallet}
          label="Wallet"
          value={`₦${((user?.walletBalance || 0) / 1000).toFixed(0)}K`}
          sub="Available balance"
          color="bg-purple-50 text-purple-600"
          onClick={() => navigate('/wallet')}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recent events */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Events</h3>
              <Link to="/dashboard/events" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {events.slice(0, 3).map((ev, idx) => {
                const evBudget = ev.budget_total || 0;
                const evSpent = ev.budget_spent || 0;
                const evPct = evBudget > 0 ? Math.round((evSpent / evBudget) * 100) : 0;
                const color = COLORS[idx % COLORS.length];
                return (
                  <div key={ev.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-2 h-10 rounded-full bg-gradient-to-b ${color} flex-shrink-0`} />
                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{ev.title}</div>
                      <div className="text-xs text-gray-400">{fmtDate(ev.start_at)} · {ev.guests_count || 0} guests</div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                      ev.status === 'active' ? 'bg-green-100 text-green-700' :
                      ev.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {ev.status || 'draft'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wishlist preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-4 h-4 text-pink-500" />
                Wishlist
              </h3>
              <Link to="/dashboard/wishlist" className="text-xs text-brand-600 font-semibold hover:underline">View all</Link>
            </div>
            <div className="text-center py-6 text-gray-400 text-sm">
              No wishlist items yet.{' '}
              <Link to="/dashboard/wishlist" className="text-brand-600 hover:underline">Create a wishlist</Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {[
                { label: 'Invite collaborator', icon: Users, to: '/dashboard/collaborators' },
                { label: 'Top up wallet', icon: Wallet, to: '/wallet' },
                { label: 'Browse vendors', icon: Star, to: '/discover/vendors' },
              ].map(action => (
                <Link key={action.label} to={action.to}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm text-gray-700 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <action.icon className="w-4 h-4" />
                  </div>
                  {action.label}
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No recent activity.</p>
              ) : (
                notifications.slice(0, 5).map((notif, i) => (
                  <div key={notif.id || i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-700 leading-snug">{notif.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    Promise.all([
      eventsApi.list().catch(() => []),
      notificationsApi.list().catch(() => []),
    ]).then(([evData, notifData]) => {
      const evList = evData || [];
      const notifList = notifData || [];
      setEvents(evList);
      setNotifications(notifList);
      if (evList.length > 0) setActiveEvent(evList[0]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-32" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="animate-pulse bg-gray-200 rounded-2xl h-48" />
            <div className="animate-pulse bg-gray-200 rounded-2xl h-32" />
          </div>
          <div className="space-y-5">
            <div className="animate-pulse bg-gray-200 rounded-2xl h-40" />
            <div className="animate-pulse bg-gray-200 rounded-2xl h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) return <ExploringView />;

  return (
    <PlanningView
      events={events}
      activeEvent={activeEvent}
      setActiveEvent={setActiveEvent}
      notifications={notifications}
      navigate={navigate}
      user={user}
    />
  );
}
