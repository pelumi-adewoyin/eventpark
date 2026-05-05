import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, CheckCircle, Clock, XCircle, Search, MoreHorizontal,
  Download, Bell, ChevronRight,
} from 'lucide-react';

// ─── Mock data ────────────────────────────────────────────────────────────────

const EVENTS = [
  { id: 'evt-001', name: 'Tunde & Bola Wedding', date: 'Dec 14, 2026', invited: 32, accepted: 20, pending: 9, declined: 3 },
  { id: 'evt-002', name: "Mum's 60th Birthday", date: 'Aug 3, 2026', invited: 15, accepted: 8, pending: 5, declined: 2 },
];

const ALL_GUESTS = [
  { id: 1, name: 'Ngozi Okonkwo',    email: 'ngozi@email.com',   event: 'Tunde & Bola Wedding', eventId: 'evt-001', status: 'Accepted', date: 'May 2' },
  { id: 2, name: 'Emeka Adeyemi',    email: 'emeka@email.com',   event: 'Tunde & Bola Wedding', eventId: 'evt-001', status: 'Accepted', date: 'May 1' },
  { id: 3, name: 'Bisi Williams',    email: 'bisi@email.com',    event: "Mum's 60th Birthday",  eventId: 'evt-002', status: 'Pending',  date: null },
  { id: 4, name: 'Kemi Johnson',     email: 'kemi@email.com',    event: 'Tunde & Bola Wedding', eventId: 'evt-001', status: 'Declined', date: 'Apr 30' },
  { id: 5, name: 'Aunty Grace',      email: 'grace@email.com',   event: "Mum's 60th Birthday",  eventId: 'evt-002', status: 'Accepted', date: 'May 3' },
  { id: 6, name: 'Tolu Okafor',      email: 'tolu@email.com',    event: 'Tunde & Bola Wedding', eventId: 'evt-001', status: 'Pending',  date: null },
  { id: 7, name: 'Chukwuemeka F.',   email: 'chuks@email.com',   event: 'Tunde & Bola Wedding', eventId: 'evt-001', status: 'Accepted', date: 'May 2' },
  { id: 8, name: 'Fatima Al-Rashid', email: 'fatima@email.com',  event: "Mum's 60th Birthday",  eventId: 'evt-002', status: 'Pending',  date: null },
];

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

function initials(name) {
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
  Accepted: 'bg-green-100 text-green-700',
  Pending:  'bg-amber-100 text-amber-700',
  Declined: 'bg-red-100  text-red-600',
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// ─── Event RSVP Card ──────────────────────────────────────────────────────────

function EventRSVPCard({ event }) {
  const acceptPct = Math.round((event.accepted / event.invited) * 100);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-bold text-gray-900">{event.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{event.date}</p>
        </div>
        <Link to={`/dashboard/events/${event.id}`} className="text-sm text-brand-600 font-semibold hover:underline whitespace-nowrap flex items-center gap-0.5">
          Manage <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mini stats */}
      <div className="flex flex-wrap gap-2 mb-3">
        {[
          { label: 'Invited',  val: event.invited,  cls: 'bg-gray-100 text-gray-600' },
          { label: 'Accepted', val: event.accepted, cls: 'bg-green-100 text-green-700' },
          { label: 'Pending',  val: event.pending,  cls: 'bg-amber-100 text-amber-700' },
          { label: 'Declined', val: event.declined, cls: 'bg-red-100 text-red-600' },
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
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const totalInvited  = EVENTS.reduce((s, e) => s + e.invited,  0);
  const totalAccepted = EVENTS.reduce((s, e) => s + e.accepted, 0);
  const totalPending  = EVENTS.reduce((s, e) => s + e.pending,  0);
  const totalDeclined = EVENTS.reduce((s, e) => s + e.declined, 0);

  const visibleGuests = ALL_GUESTS.filter(g => {
    if (eventFilter !== 'all' && g.eventId !== eventFilter) return false;
    if (statusFilter !== 'All' && g.status !== statusFilter) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-4xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">RSVPs</h2>
          <p className="text-sm text-gray-400 mt-0.5">Guest responses across all your events</p>
        </div>
        <select
          value={eventFilter}
          onChange={e => setEventFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-600 bg-white focus:outline-none focus:border-brand-400 cursor-pointer"
        >
          <option value="all">All events</option>
          {EVENTS.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users,         label: 'Total invited', val: totalInvited,  iconCls: 'bg-gray-100 text-gray-600',   valCls: 'text-gray-900' },
          { icon: CheckCircle,   label: 'Accepted',      val: totalAccepted, iconCls: 'bg-green-100 text-green-600', valCls: 'text-green-700' },
          { icon: Clock,         label: 'Pending',       val: totalPending,  iconCls: 'bg-amber-100 text-amber-600', valCls: 'text-amber-700' },
          { icon: XCircle,       label: 'Declined',      val: totalDeclined, iconCls: 'bg-red-100 text-red-500',     valCls: 'text-red-600' },
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

      {/* ── Event RSVP Cards ── */}
      <div className="space-y-4 mb-6">
        {EVENTS.filter(ev => eventFilter === 'all' || ev.id === eventFilter).map(ev => (
          <EventRSVPCard key={ev.id} event={ev} />
        ))}
      </div>

      {/* ── Combined Guest Table ── */}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Guest</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden sm:table-cell">Event</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Responded</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {visibleGuests.map((guest, idx) => (
                <tr
                  key={guest.id}
                  className={`border-b border-gray-50 hover:bg-brand-50/30 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  {/* Avatar + name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarCircle name={guest.name} index={idx} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{guest.name}</p>
                        <p className="text-xs text-gray-400 truncate">{guest.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Event */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 whitespace-nowrap">
                      {guest.event}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={guest.status} />
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-400">{guest.date ?? '—'}</span>
                  </td>
                  {/* Menu */}
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {visibleGuests.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                    No guests match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
