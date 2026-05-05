import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Search, QrCode, CheckCircle2, XCircle, AlertCircle,
  UserPlus, X, Printer, Play, StopCircle, ChevronRight, Users,
  Percent, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const EVENT_INFO = {
  name: 'Tunde & Bola — Wedding Reception',
  date: 'December 14, 2026',
  venue: 'Eko Hotel & Suites, Lagos',
  totalExpected: 32,
};

const INITIAL_GUESTS = [
  { id: 'g1', name: 'Ngozi Okonkwo', email: 'ngozi@email.com', ticket: 'EP-001-WED', ticketType: 'VVIP', status: 'checked_in', time: '3:45 PM' },
  { id: 'g2', name: 'Emeka Nwosu', email: 'emeka@email.com', ticket: 'EP-002-WED', ticketType: 'Regular', status: 'checked_in', time: '4:02 PM' },
  { id: 'g3', name: 'Bisi Adeyemi', email: 'bisi@email.com', ticket: 'EP-003-WED', ticketType: 'Regular', status: 'pending', time: null },
  { id: 'g4', name: 'Kola Williams', email: 'kola@email.com', ticket: 'EP-004-WED', ticketType: 'VVIP', status: 'pending', time: null },
  { id: 'g5', name: 'Aunty Grace Eze', email: 'grace@email.com', ticket: 'EP-005-WED', ticketType: 'Regular', status: 'checked_in', time: '4:15 PM' },
  { id: 'g6', name: 'Pastor Adeniyi', email: 'pastor@email.com', ticket: 'EP-006-WED', ticketType: 'VVIP', status: 'pending', time: null },
  { id: 'g7', name: 'DJ Krizbeatz', email: 'dj@email.com', ticket: 'EP-007-WED', ticketType: 'Comp', status: 'checked_in', time: '2:00 PM' },
  { id: 'g8', name: 'Chidinma Obi', email: 'chidinma@email.com', ticket: 'EP-008-WED', ticketType: 'Regular', status: 'pending', time: null },
  { id: 'g9', name: 'Femi Adeola', email: 'femi@email.com', ticket: 'EP-009-WED', ticketType: 'Regular', status: 'pending', time: null },
  { id: 'g10', name: 'Yetunde Abiodun', email: 'yetunde@email.com', ticket: 'EP-010-WED', ticketType: 'Regular', status: 'checked_in', time: '3:55 PM' },
  { id: 'g11', name: 'Seun Okonkwo', email: 'seun@email.com', ticket: 'EP-011-WED', ticketType: 'Regular', status: 'pending', time: null },
  { id: 'g12', name: 'Amaka Chukwu', email: 'amaka@email.com', ticket: 'EP-012-WED', ticketType: 'Comp', status: 'pending', time: null },
];

const TICKET_TYPES = ['VVIP', 'Regular', 'Free'];

function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function now() {
  return new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, highlight }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${highlight ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
      <span className="text-sm font-extrabold">{value}</span>
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
function Badge({ type }) {
  const map = {
    VVIP: 'bg-yellow-100 text-yellow-700',
    Regular: 'bg-blue-100 text-blue-700',
    Comp: 'bg-purple-100 text-purple-700',
    Free: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[type] || map.Regular}`}>
      {type}
    </span>
  );
}

// ── Walk-in modal ────────────────────────────────────────────────────────────
function WalkInModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', ticketType: 'Regular' });

  const handle = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    if (!form.firstName || !form.lastName) {
      toast.error('First and last name required');
      return;
    }
    onAdd(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Add walk-in guest</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="First name *" value={form.firstName} onChange={handle('firstName')}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30" />
          <input placeholder="Last name *" value={form.lastName} onChange={handle('lastName')}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30" />
        </div>
        <input type="email" placeholder="Email" value={form.email} onChange={handle('email')}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30" />
        <input type="tel" placeholder="Phone" value={form.phone} onChange={handle('phone')}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30" />
        <select value={form.ticketType} onChange={handle('ticketType')}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30 bg-white">
          {TICKET_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button onClick={submit}
          className="w-full py-3.5 rounded-xl bg-ep-navy text-white font-bold text-sm hover:opacity-90 transition">
          Add & check in
        </button>
      </div>
    </div>
  );
}

// ── End check-in modal ───────────────────────────────────────────────────────
function EndModal({ checkedIn, total, onClose, onConfirm }) {
  const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-900 text-base">End check-in for this event?</h3>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Checked in</span>
            <span className="font-bold text-green-600">{checkedIn}</span>
          </div>
          <div className="flex justify-between">
            <span>Total expected</span>
            <span className="font-bold">{total}</span>
          </div>
          <div className="flex justify-between">
            <span>Attendance rate</span>
            <span className="font-bold text-ep-navy">{pct}%</span>
          </div>
        </div>
        <button
          onClick={() => {
            const csv = `Name,Ticket,Type,Status,Time\n`;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'attendance-report.csv';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report downloaded');
          }}
          className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-400 transition flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" /> Download report
        </button>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-400 transition">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition">
            End check-in
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CheckIn() {
  const { id } = useParams();

  const [preEvent, setPreEvent] = useState(true);
  const [guests, setGuests] = useState(INITIAL_GUESTS);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'qr'
  const [search, setSearch] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [lastScan, setLastScan] = useState(null); // { type: 'success'|'duplicate'|'invalid', guest?, message }
  const [selected, setSelected] = useState(new Set());
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [ended, setEnded] = useState(false);
  const qrInputRef = useRef(null);

  const checkedIn = guests.filter((g) => g.status === 'checked_in').length;
  const total = guests.length;
  const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  const noShows = guests.filter((g) => g.status === 'pending').length;

  // ── Scan logic ─────────────────────────────────────────────────────────────
  const handleScan = (input) => {
    const val = input.trim();
    if (!val) return;
    const guest = guests.find(
      (g) =>
        g.ticket.toLowerCase() === val.toLowerCase() ||
        g.name.toLowerCase().includes(val.toLowerCase()) ||
        g.email.toLowerCase().includes(val.toLowerCase())
    );
    if (!guest) {
      setLastScan({ type: 'invalid', message: 'Guest not found — ticket invalid' });
      setQrInput('');
      return;
    }
    if (guest.status === 'checked_in') {
      setLastScan({ type: 'duplicate', guest, message: `Already checked in at ${guest.time}` });
      setQrInput('');
      return;
    }
    const t = now();
    setGuests((prev) =>
      prev.map((g) => g.id === guest.id ? { ...g, status: 'checked_in', time: t } : g)
    );
    setLastScan({ type: 'success', guest: { ...guest, time: t }, message: `${guest.name} — Checked in ✓` });
    setQrInput('');
    setTimeout(() => setLastScan(null), 4000);
  };

  const handleAllowReEntry = (guest) => {
    toast.success(`Re-entry allowed for ${guest.name}`);
    setLastScan(null);
  };

  // ── Search check-in ────────────────────────────────────────────────────────
  const handleManualCheckIn = (guestId) => {
    const g = guests.find((x) => x.id === guestId);
    if (!g || g.status === 'checked_in') return;
    const t = now();
    setGuests((prev) => prev.map((x) => x.id === guestId ? { ...x, status: 'checked_in', time: t } : x));
    setLastScan({ type: 'success', guest: { ...g, time: t }, message: `${g.name} — Checked in ✓` });
    setTimeout(() => setLastScan(null), 3000);
  };

  // ── Bulk check-in ──────────────────────────────────────────────────────────
  const handleBulkCheckIn = () => {
    const t = now();
    setGuests((prev) =>
      prev.map((g) => selected.has(g.id) && g.status === 'pending' ? { ...g, status: 'checked_in', time: t } : g)
    );
    toast.success(`${selected.size} guest(s) checked in`);
    setSelected(new Set());
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Walk-in ────────────────────────────────────────────────────────────────
  const handleAddWalkIn = (form) => {
    const t = now();
    const newGuest = {
      id: `w${Date.now()}`,
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      ticket: `EP-WALKIN-${Date.now().toString().slice(-4)}`,
      ticketType: form.ticketType,
      status: 'checked_in',
      time: t,
    };
    setGuests((prev) => [newGuest, ...prev]);
    setShowWalkIn(false);
    toast.success(`${newGuest.name} added & checked in`);
  };

  const filtered = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      g.ticket.toLowerCase().includes(search.toLowerCase())
  );

  // ── Post-event summary ─────────────────────────────────────────────────────
  if (ended) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full space-y-6 text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <span className="text-4xl font-extrabold text-green-600">{pct}%</span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Event wrapped!</h2>
            <p className="text-gray-500 text-sm mt-1">{EVENT_INFO.name}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Checked in</span>
              <span className="font-bold text-green-600">{checkedIn}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">No-shows</span>
              <span className="font-bold text-red-500">{noShows}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total expected</span>
              <span className="font-bold">{EVENT_INFO.totalExpected}</span>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="block w-full py-3.5 rounded-xl bg-ep-navy text-white font-bold text-sm hover:opacity-90 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Pre-event state ────────────────────────────────────────────────────────
  if (preEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard" className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <p className="font-bold text-gray-900 text-sm">{EVENT_INFO.name}</p>
            <p className="text-xs text-gray-400">{EVENT_INFO.venue}</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
          {/* Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium">Check-in opens 2 hours before your event</p>
          </div>

          {/* Event card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h2 className="font-extrabold text-gray-900 text-lg">{EVENT_INFO.name}</h2>
            <div className="space-y-1.5 text-sm text-gray-500">
              <p>📅 {EVENT_INFO.date}</p>
              <p>📍 {EVENT_INFO.venue}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900">{EVENT_INFO.totalExpected}</p>
              <p className="text-xs text-gray-400 mt-1">Expected</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-green-600">0</p>
              <p className="text-xs text-gray-400 mt-1">Checked in</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900">0%</p>
              <p className="text-xs text-gray-400 mt-1">Attendance</p>
            </div>
          </div>

          <button
            onClick={() => setPreEvent(false)}
            className="w-full py-4 rounded-2xl bg-ep-navy text-white font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm"
          >
            <Play className="w-5 h-5" />
            Open check-in now
          </button>
          <button
            onClick={() => toast.success(`Printing... ${EVENT_INFO.totalExpected} attendees`)}
            className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:border-gray-400 transition"
          >
            <Printer className="w-4 h-4" />
            Print attendee list
          </button>
        </div>
      </div>
    );
  }

  // ── Active check-in ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky header strip */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard" className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-grow min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{EVENT_INFO.name}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-600">Live</span>
          </div>
          <button
            onClick={() => setShowEndModal(true)}
            className="text-red-500 text-xs font-bold hover:text-red-700 transition flex-shrink-0 flex items-center gap-1"
          >
            <StopCircle className="w-4 h-4" />
            End
          </button>
        </div>

        {/* Stats row */}
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
          <StatPill icon={<Users className="w-3 h-3" />} label="Expected" value={EVENT_INFO.totalExpected} />
          <StatPill icon={<CheckCircle2 className="w-3 h-3" />} label="In" value={checkedIn} highlight />
          <StatPill icon={<Percent className="w-3 h-3" />} label="" value={`${pct}%`} />
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-green-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex-grow max-w-2xl mx-auto w-full px-4 py-5 space-y-4">

        {/* Mode toggle */}
        <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
          {[
            { id: 'search', label: '🔍 Search' },
            { id: 'qr', label: '📷 QR Scanner' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setLastScan(null);
                if (tab.id === 'qr') setTimeout(() => qrInputRef.current?.focus(), 100);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── QR Scanner mode ── */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            {/* Simulated camera viewport */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden h-64 relative flex items-center justify-center">
              {/* Scan frame */}
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 border-2 border-white/20 rounded-xl" />
                {/* Corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-400 rounded-br-lg" />
                {/* Pulsing center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-ping opacity-75" />
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/50 text-xs">Point camera at QR code</p>
              </div>
            </div>

            {/* Manual ticket entry */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Or enter ticket manually</p>
              <div className="flex gap-2">
                <input
                  ref={qrInputRef}
                  type="text"
                  placeholder="Ticket ID, name, or email..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan(qrInput)}
                  className="flex-grow px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30"
                  autoFocus={activeTab === 'qr'}
                />
                <button
                  onClick={() => handleScan(qrInput)}
                  className="px-4 py-2.5 rounded-xl bg-ep-navy text-white text-sm font-bold hover:opacity-90 transition flex-shrink-0"
                >
                  Scan
                </button>
              </div>
            </div>

            {/* Last scan result */}
            {lastScan && (
              <div
                className={`rounded-2xl p-4 border flex items-start gap-3 animate-pulse-once ${
                  lastScan.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : lastScan.type === 'duplicate'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {lastScan.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                {lastScan.type === 'duplicate' && <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                {lastScan.type === 'invalid' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                <div className="flex-grow">
                  <p
                    className={`text-sm font-bold ${
                      lastScan.type === 'success'
                        ? 'text-green-800'
                        : lastScan.type === 'duplicate'
                        ? 'text-amber-800'
                        : 'text-red-800'
                    }`}
                  >
                    {lastScan.message}
                  </p>
                  {lastScan.guest && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lastScan.guest.ticket} · {lastScan.guest.ticketType}
                    </p>
                  )}
                  {lastScan.type === 'duplicate' && (
                    <button
                      onClick={() => handleAllowReEntry(lastScan.guest)}
                      className="mt-2 text-xs font-semibold text-amber-700 underline"
                    >
                      Allow re-entry
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Search mode ── */}
        {activeTab === 'search' && (
          <div className="space-y-3">
            {/* Search box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, or ticket #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30 shadow-sm"
                autoFocus={activeTab === 'search'}
              />
            </div>

            {/* Scan result (also visible in search mode) */}
            {lastScan && (
              <div
                className={`rounded-2xl p-4 border flex items-start gap-3 ${
                  lastScan.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : lastScan.type === 'duplicate'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {lastScan.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                {lastScan.type === 'duplicate' && <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                {lastScan.type === 'invalid' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                <p className={`text-sm font-bold ${lastScan.type === 'success' ? 'text-green-800' : lastScan.type === 'duplicate' ? 'text-amber-800' : 'text-red-800'}`}>
                  {lastScan.message}
                </p>
              </div>
            )}

            {/* Guest list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  {filtered.length} guests
                </span>
                {selected.size > 0 && (
                  <span className="text-xs font-semibold text-ep-navy">{selected.size} selected</span>
                )}
              </div>

              <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
                {filtered.map((g) => (
                  <div key={g.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                    {/* Checkbox */}
                    {g.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selected.has(g.id)}
                        onChange={() => toggleSelect(g.id)}
                        className="accent-ep-navy flex-shrink-0"
                      />
                    )}
                    {g.status === 'checked_in' && (
                      <div className="w-4 flex-shrink-0" />
                    )}

                    {/* Avatar */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        g.status === 'checked_in'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {g.status === 'checked_in' ? '✓' : initials(g.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">{g.name}</span>
                        <Badge type={g.ticketType} />
                      </div>
                      <p className="text-xs text-gray-400 truncate">{g.ticket}</p>
                    </div>

                    {/* Status / action */}
                    {g.status === 'checked_in' ? (
                      <div className="text-right flex-shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> In
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">{g.time}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleManualCheckIn(g.id)}
                        className="px-3 py-1.5 rounded-xl bg-ep-navy text-white text-xs font-bold hover:opacity-90 transition flex-shrink-0"
                      >
                        Check in
                      </button>
                    )}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    No guests found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk check-in sticky bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
          <div className="max-w-2xl mx-auto bg-ep-navy text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl">
            <span className="font-semibold text-sm">{selected.size} guest{selected.size > 1 ? 's' : ''} selected</span>
            <button
              onClick={handleBulkCheckIn}
              className="px-4 py-2 bg-white text-ep-navy text-sm font-bold rounded-xl hover:bg-gray-100 transition"
            >
              Check in selected
            </button>
          </div>
        </div>
      )}

      {/* Walk-in FAB */}
      <button
        onClick={() => setShowWalkIn(true)}
        className="fixed bottom-6 right-4 z-30 flex items-center gap-2 px-4 py-3 bg-ep-orange text-white rounded-2xl shadow-lg hover:opacity-90 transition font-bold text-sm"
      >
        <UserPlus className="w-4 h-4" />
        Add walk-in
      </button>

      {showWalkIn && (
        <WalkInModal onClose={() => setShowWalkIn(false)} onAdd={handleAddWalkIn} />
      )}

      {showEndModal && (
        <EndModal
          checkedIn={checkedIn}
          total={EVENT_INFO.totalExpected}
          onClose={() => setShowEndModal(false)}
          onConfirm={() => {
            setShowEndModal(false);
            setEnded(true);
          }}
        />
      )}
    </div>
  );
}
