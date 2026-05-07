import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, Clock, ChevronRight, MoreHorizontal } from 'lucide-react';
import { events } from '../../lib/api';

const COLORS = [
  'from-pink-500 to-rose-600',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-green-600',
];

const STATUS = {
  active: { label: 'Active', cls: 'bg-green-100 text-green-700' },
  draft: { label: 'Draft', cls: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', cls: 'bg-gray-100 text-gray-500' },
};

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DashboardEvents() {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    events.list()
      .then(data => setMyEvents(data || []))
      .catch(() => setMyEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Events</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${myEvents.length} event${myEvents.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link to="/events/create"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          New Event
        </Link>
      </div>

      {/* Event cards */}
      <div className="space-y-4">
        {/* Loading skeletons */}
        {loading && [1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-40 animate-pulse" />
        ))}

        {/* Empty state */}
        {!loading && myEvents.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-400 text-sm mb-6">
              Create your first event to get started with planning, invites, and vendor management.
            </p>
            <Link to="/events/create"
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-700 transition-colors">
              <Plus className="w-4 h-4" /> Create event
            </Link>
          </div>
        )}

        {/* Real event cards */}
        {!loading && myEvents.map((ev, index) => {
          const budget = ev.budget_total || 0;
          const spent = ev.budget_spent || 0;
          const guests = ev.guests_count || 0;
          const budgetPct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
          const daysLeft = ev.start_at
            ? Math.max(0, Math.ceil((new Date(ev.start_at) - Date.now()) / 86400000))
            : null;
          const color = COLORS[index % COLORS.length];
          const status = STATUS[ev.status] || STATUS.draft;
          const avatarCount = Math.min(4, Math.floor(guests / 30));

          return (
            <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 transition-all overflow-hidden">
              {/* Cover strip */}
              <div className={`h-2 bg-gradient-to-r ${color}`} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900 text-base truncate">{ev.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${status.cls}`}>{status.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(ev.start_at)}</span>
                      {daysLeft !== null && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{daysLeft} days away</span>
                      )}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{guests} guests</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Budget bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Budget: ₦{(spent / 1000000).toFixed(1)}M spent</span>
                    <span>{budget > 0 ? `${budgetPct}% of ₦${(budget / 1000000).toFixed(0)}M` : 'No budget set'}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${budgetPct}%` }} />
                  </div>
                </div>

                {/* RSVP progress */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    {avatarCount > 0 && (
                      <div className="flex -space-x-1.5">
                        {[...Array(avatarCount)].map((_, i) => (
                          <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br ${color} flex items-center justify-center`} />
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-gray-500 font-medium">{guests} guests invited</span>
                  </div>
                  <Link to={`/dashboard/events/${ev.id}`}
                    className="flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline">
                    Open <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add event card (shown when there are events) */}
        {!loading && myEvents.length > 0 && (
          <Link to="/events/create"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-brand-600" />
            </div>
            <div>
              <div className="font-bold text-gray-700 group-hover:text-brand-700 text-sm transition-colors">Plan a new event</div>
              <div className="text-xs text-gray-400">Wedding, birthday, corporate, and more</div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
