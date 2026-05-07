import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket, Search, Clock, CheckCircle2, XCircle,
  MessageSquare, ArrowRight, Calendar, User, Loader2, RefreshCw,
} from 'lucide-react';
import { vendorDash } from '../../../lib/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',      color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  accepted:    { label: 'Accepted',     color: 'bg-brand-100 text-brand-700',  dot: 'bg-brand-500' },
  in_progress: { label: 'In progress',  color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  completed:   { label: 'Completed',    color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  declined:    { label: 'Declined',     color: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
  cancelled:   { label: 'Cancelled',    color: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
};

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'declined', label: 'Declined' },
];

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function BookingCard({ booking, onAccept, onDecline }) {
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const isPending = booking.status === 'pending';

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await onAccept(booking.id);
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      await onDecline(booking.id);
    } finally {
      setDeclining(false);
    }
  };

  const eventDateStr = fmtDate(booking.event_date);
  const bookedDateStr = fmtDate(booking.created_at);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-ep-navy">Booking request</span>
            <StatusBadge status={booking.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {booking.client_name || 'Client'}
            </span>
            {eventDateStr && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Event: {eventDateStr}
              </span>
            )}
            {bookedDateStr && (
              <span>Booked: {bookedDateStr}</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {booking.total_amount > 0 && (
            <div className="text-sm font-extrabold text-ep-navy">₦{(booking.total_amount / 100).toLocaleString()}</div>
          )}
          <div className="text-xs text-gray-400">Budget</div>
        </div>
      </div>

      {booking.notes && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-600 italic">"{booking.notes}"</p>
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        {isPending ? (
          <>
            <button type="button" onClick={handleDecline} disabled={declining || accepting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
              {declining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Decline
            </button>
            <button type="button" onClick={handleAccept} disabled={accepting || declining}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white transition-colors disabled:opacity-50">
              {accepting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Accept booking
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-400 py-1">
            {booking.status === 'completed' ? 'Booking complete ✓' : `Status: ${STATUS_CONFIG[booking.status]?.label || booking.status}`}
          </p>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-1.5 mt-2 px-3 py-2 bg-amber-50 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-xs text-amber-700">Respond promptly — timely replies improve your ranking</span>
        </div>
      )}
    </div>
  );
}

export default function VendorBookings() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = () => {
    setLoading(true);
    vendorDash.listBookings()
      .then(data => setBookings(data || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBookings(); }, []);

  const accept = async (id) => {
    try {
      await vendorDash.acceptBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted' } : b));
      toast.success('Booking accepted!');
    } catch {
      toast.error('Failed to accept booking');
    }
  };

  const decline = async (id) => {
    try {
      await vendorDash.declineBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'declined' } : b));
      toast('Booking declined', { icon: '❌' });
    } catch {
      toast.error('Failed to decline booking');
    }
  };

  const filtered = bookings.filter(b => {
    if (activeTab !== 'all' && b.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(b.client_name || '').toLowerCase().includes(q) && !(b.notes || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = TABS.reduce((acc, tab) => {
    acc[tab.id] = tab.id === 'all' ? bookings.length : bookings.filter(b => b.status === tab.id).length;
    return acc;
  }, {});

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-ep-navy">Bookings</h1>
            {pendingCount > 0 && (
              <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">{pendingCount} pending</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" onClick={loadBookings} disabled={loading}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search bookings by client name or notes…" value={search}
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Ticket className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">
            {activeTab !== 'all' ? `No ${activeTab} bookings` : 'No bookings yet'}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            {activeTab === 'all' ? 'Booking requests from event planners will appear here.' : 'Switch tabs to see other bookings.'}
          </p>
          {activeTab === 'all' && (
            <Link to="/dashboard/services"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">
              Add services <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
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
