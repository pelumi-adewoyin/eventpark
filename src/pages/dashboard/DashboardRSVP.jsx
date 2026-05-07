import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, CheckCircle, Clock, XCircle, Search, MoreHorizontal,
  Download, Bell, ChevronRight,
} from 'lucide-react';
import { events as eventsApi, guests as guestsApi } from '../../lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  'from-brand-400 to-brand-600',
  'from-rose-400 to-pink-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
  'from-green-400 to-emerald-600',
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-pink-600',
];

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function AvatarCircle({ name, index }) {
  const grad = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {initials(name)}
    </div>
  );
}

const STATUS_STYLES = {
  Accepted:  'bg-green-100 text-green-700',
  accepted:  'bg-green-100 text-green-700',
  rsvp_yes:  'bg-green-100 text-green-700',
  Pending:   'bg-amber-100 text-amber-700',
  pending:   'bg-amber-100 text-amber-700',
  invited:   'bg-amber-100 text-amber-700',
  sent:      'bg-amber-100 text-amber-700',
  Declined:  'bg-red-100  text-red-600',
  declined:  'bg-red-100  text-red-600',
  rsvp_no:   'bg-red-100  text-red-600',
};

function normalizeStatus(g) {
  const raw = g.rsvp_status || g.status || 'pending';
  if (raw === 'rsvp_yes' || raw === 'accepted')  return 'Accepted';
  if (raw === 'rsvp_no'  || raw === 'declined')  return 'Declined';
  return 'Pending';
}

function StatusBadge({ status }) {
  const display = normalizeStatus({ status });
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {display}
    </span>
  );
}

function fmtDate(str) {
  if (!str) return null;
  return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

// ─── Event RSVP Card ──────────────────────────────────────────────────────────

function EventRSVPCard({ event }) {
  const invited  = event._guestCount?.invited  ?? event.invited  ?? 0;
  const accepted = event._guestCount?.accepted ?? event.accepted ?? 0;
  const pending  = event._guestCount?.pending  ?? event.pending  ?? 0;
  const declined = event._guestCount?.declined ?? event.declined ?? 0;
  const acceptPct = invited > 0 ? Math.round((accepted / invited) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-bold text-gray-900">{event.title || event.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{event.start_at ? fmtDate(event.start_at) : event.date}</p>
        </div>
        <Link to={`/dashboard/events/${event.id}`} className="text-sm text-brand-600 font-semibold hover:underline whitespace-nowrap flex items-center gap-0.5">
          Manage <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mini stats */}
      <div className="flex flex-wrap gap-2 mb-3">
        {[
          { label: 'Invited',  val: invited,  cls: 'bg-gray-100 text-gray-600' },
          { label: 'Accepted', val: accepted, cls: 'bg-green-100 text-green-700' },
          { label: 'Pending',  val: pending,  cls: 'bg-amber-100 text-amber-700' },
          { label: 'Declined', val: declined, cls: 'bg-red-100 text-red-600' },
        ].map(s => (
          <span key={s.label} className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${s.cls}`}>
            {s.label} {s.val}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-1.5">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Acceptance rate</span>
          <span>{acceptPct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
            style={{ width: `${acceptPct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 hover:border-brand-300 hover:text-brand-600 text-gray-600 px-3 py-1.5 rounded-xl transition-all">
          <Bell className="w-3.5 h-3.5" /> Send reminder
        </button>
        <button className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 hover:border-brand-300 hover:text-brand-600 text-gray-600 px-3 py-1.5 rounded-xl transition-all">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardRSVP() {
  const [allEvents, setAllEvents]           = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventGuests, setEventGuests]       = useState([]);
  const [loadingEvents, setLoadingEvents]   = useState(true);
  const [loadingGuests, setLoadingGuests]   = useState(false);

  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch]             = useState('');

  // Fetch all events on mount
  useEffect(() => {
    eventsApi.list()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.events ?? []);
        setAllEvents(list);
        if (list.length > 0) setSelectedEventId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, []);

  // Fetch guests whenever selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) {
      setEventGuests([]);
      return;
    }
    setLoadingGuests(true);
    guestsApi.list(selectedEventId)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.guests ?? []);
        setEventGuests(list);
      })
      .catch(() => setEventGuests([]))
      .finally(() => setLoadingGuests(false));
  }, [selectedEventId]);

  const selectedEvent = allEvents.find(ev => ev.id === selectedEventId) ?? null;

  // Stats computed from real guest data
  const totalInvited  = eventGuests.length;
  const totalAccepted = eventGuests.filter(g => g.rsvp_status === 'accepted' || g.rsvp_status === 'rsvp_yes' || g.status === 'rsvp_yes' || g.status === 'Accepted').length;
  const totalPending  = eventGuests.filter(g => {
    const s = g.rsvp_status || g.status || '';
    return ['pending', 'invited', 'sent', 'Pending', 'Invited'].includes(s);
  }).length;
  const totalDeclined = eventGuests.filter(g => g.rsvp_status === 'declined' || g.rsvp_status === 'rsvp_no' || g.status === 'rsvp_no' || g.status === 'Declined').length;

  // Build display guests
  const visibleGuests = eventGuests.filter(g => {
    const status = normalizeStatus(g);
    if (statusFilter !== 'All' && status !== statusFilter) return false;
    const name = g.full_name || g.name || '';
    const email = g.email || '';
    if (search && !name.toLowerCase().includes(search.toLowerCase()) && !email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Loading skeleton
  if (loadingEvents) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-32 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  // No events state
  if (allEvents.length === 0) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl">
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">RSVPs</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-4">Create an event first to manage RSVPs.</p>
          <Link
            to="/dashboard/events/new"
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Create event <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">RSVPs</h2>
          <p className="text-sm text-gray-400 mt-0.5">Guest responses for your events</p>
        </div>
      </div>

      {/* ── Event picker bar ── */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <span className="text-sm text-gray-500">Showing:</span>
        <span className="font-semibold text-gray-900">{selectedEvent?.title || selectedEvent?.name || 'All events'}</span>
        <select
          value={selectedEventId || ''}
          onChange={(e) => setSelectedEventId(e.target.value || null)}
          className="ml-auto text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          {allEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.title || ev.name}</option>)}
        </select>
        <button
          onClick={() => setSelectedEventId(null)}
          className="text-sm text-brand-600 font-semibold hover:underline whitespace-nowrap"
        >
          See all events
        </button>
      </div>

      {/* ── Stats strip (per-event view) ── */}
      {selectedEventId && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Users,       label: 'Total invited', val: totalInvited,  iconCls: 'bg-gray-100 text-gray-600',   valCls: 'text-gray-900' },
            { icon: CheckCircle, label: 'Accepted',      val: totalAccepted, iconCls: 'bg-green-100 text-green-600', valCls: 'text-green-700' },
            { icon: Clock,       label: 'Pending',       val: totalPending,  iconCls: 'bg-amber-100 text-amber-600', valCls: 'text-amber-700' },
            { icon: XCircle,     label: 'Declined',      val: totalDeclined, iconCls: 'bg-red-100 text-red-500',     valCls: 'text-red-600' },
          ].map(({ icon: Icon, label, val, iconCls, valCls }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${iconCls}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className={`text-2xl font-extrabold ${valCls}`}>{val}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── All events view: event cards ── */}
      {!selectedEventId && (
        <div className="space-y-4 mb-6">
          {allEvents.map(ev => (
            <EventRSVPCard key={ev.id} event={ev} />
          ))}
        </div>
      )}

      {/* ── Per-event guest table ── */}
      {selectedEventId && (
        <>
          {/* Event card */}
          <div className="mb-6">
            <EventRSVPCard event={{
              ...selectedEvent,
              _guestCount: { invited: totalInvited, accepted: totalAccepted, pending: totalPending, declined: totalDeclined },
            }} />
          </div>

          {/* Guest table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table toolbar */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search guests…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 placeholder:text-gray-400"
                  />
                </div>
                {/* Status tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0">
                  {['All', 'Accepted', 'Pending', 'Declined'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        statusFilter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            {loadingGuests ? (
              <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading guests…</div>
            ) : eventGuests.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-3">No guests yet.</p>
                <Link
                  to={`/dashboard/events/${selectedEventId}`}
                  className="inline-flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:underline"
                >
                  Invite guests <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Guest</th>
                      <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Responded</th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleGuests.map((guest, idx) => {
                      const name = guest.full_name || guest.name || guest.email || '—';
                      const status = normalizeStatus(guest);
                      const responded = guest.responded_at ? fmtDate(guest.responded_at) : (guest.date ?? null);
                      return (
                        <tr
                          key={guest.id}
                          className={`border-b border-gray-50 hover:bg-brand-50/30 transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          {/* Avatar + name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <AvatarCircle name={name} index={idx} />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">{name}</p>
                                <p className="text-xs text-gray-400 truncate">{guest.email}</p>
                              </div>
                            </div>
                          </td>
                          {/* Status */}
                          <td className="px-4 py-3">
                            <StatusBadge status={guest.rsvp_status || guest.status || 'pending'} />
                          </td>
                          {/* Date */}
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs text-gray-400">{responded ?? '—'}</span>
                          </td>
                          {/* Menu */}
                          <td className="px-4 py-3">
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {visibleGuests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-gray-400 text-sm">
                          No guests match your filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Bottom CTA ── */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 mt-6 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Ready to invite more guests? Add them from your event workspace.
        </p>
        <Link
          to="/dashboard/events"
          className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          Go to My Events <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
