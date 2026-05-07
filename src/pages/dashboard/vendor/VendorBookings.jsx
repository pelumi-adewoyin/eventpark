import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket, Search, Clock, CheckCircle2, XCircle,
  MessageSquare, ArrowRight, Calendar, User,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  accepted:  { label: 'Accepted',  color: 'bg-brand-100 text-brand-700',   dot: 'bg-brand-500' },
  in_progress:{ label: 'In progress', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  declined:  { label: 'Declined',  color: 'bg-red-100 text-red-700',       dot: 'bg-red-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500',     dot: 'bg-gray-400' },
};

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'declined', label: 'Declined' },
];

const MOCK_BOOKINGS = [];

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function BookingCard({ booking, onAccept, onDecline }) {
  const isPending = booking.status === 'pending';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-ep-navy">{booking.serviceName}</span>
            <StatusBadge status={booking.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {booking.customerName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {booking.eventDate}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-extrabold text-ep-navy">₦{booking.amount.toLocaleString()}</div>
          <div className="text-xs text-gray-400">{booking.bookingDate}</div>
        </div>
      </div>

      {booking.message && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-600 italic">"{booking.message}"</p>
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <Link to={`/dashboard/workspace?booking=${booking.id}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </Link>
        {isPending && (
          <>
            <button type="button" onClick={() => onDecline(booking.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Decline
            </button>
            <button type="button" onClick={() => onAccept(booking.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> Accept booking
            </button>
          </>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-1.5 mt-2 px-3 py-2 bg-amber-50 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-xs text-amber-700">Respond within 12 hours or it auto-declines</span>
        </div>
      )}
    </div>
  );
}

export default function VendorBookings() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);

  const filtered = bookings.filter(b => {
    if (activeTab !== 'all' && b.status !== activeTab) return false;
    if (search && !b.customerName.toLowerCase().includes(search.toLowerCase()) &&
        !b.serviceName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const accept = (id) => setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted' } : b));
  const decline = (id) => setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'declined' } : b));

  const counts = TABS.reduce((acc, tab) => {
    acc[tab.id] = tab.id === 'all' ? bookings.length : bookings.filter(b => b.status === tab.id).length;
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-ep-navy">Bookings</h1>
          <p className="text-sm text-gray-400 mt-0.5">{bookings.length} total bookings</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search bookings…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`text-[10px] font-bold ${activeTab === tab.id ? 'text-white/70' : 'text-gray-400'}`}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Ticket className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">No bookings yet</p>
          <p className="text-xs text-gray-300 mt-1">Bookings will appear here once planners request your services.</p>
          <Link to="/dashboard/services"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">
            Add services <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <BookingCard key={b.id} booking={b} onAccept={accept} onDecline={decline} />
          ))}
        </div>
      )}
    </div>
  );
}
