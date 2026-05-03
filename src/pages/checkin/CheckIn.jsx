import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, QrCode, CheckCircle2, XCircle, Users, Zap, Search } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const mockGuests = [
  { id: 'g1', name: 'Ngozi Okonkwo', ticket: 'EP-0001-WED', table: 'A1', meal: 'Chicken', status: 'arrived', time: '3:45 PM' },
  { id: 'g2', name: 'Emeka Nwosu + 1', ticket: 'EP-0002-WED', table: 'B3', meal: 'Fish', status: 'arrived', time: '4:02 PM' },
  { id: 'g3', name: 'Bisi Adeyemi', ticket: 'EP-0003-WED', table: 'A2', meal: 'Veg', status: 'not_arrived', time: null },
  { id: 'g4', name: 'Kola & Titi Williams', ticket: 'EP-0004-WED', table: 'C1', meal: 'Chicken', status: 'not_arrived', time: null },
  { id: 'g5', name: 'Aunty Grace Eze', ticket: 'EP-0005-WED', table: 'A3', meal: 'Fish', status: 'arrived', time: '4:15 PM' },
  { id: 'g6', name: 'Pastor & Mrs Adeniyi', ticket: 'EP-0006-WED', table: 'VIP-1', meal: 'Chicken', status: 'not_arrived', time: null },
  { id: 'g7', name: 'DJ Krizbeatz', ticket: 'EP-0007-WED', table: 'Staff', meal: 'Staff meal', status: 'arrived', time: '2:00 PM' },
  { id: 'g8', name: 'Chidinma Obi', ticket: 'EP-0008-WED', table: 'B1', meal: 'Chicken', status: 'not_arrived', time: null },
];

const eventInfo = {
  title: 'Tunde & Bola — Wedding Reception',
  date: 'Dec 14, 2026',
  venue: 'Eko Hotel & Suites, Lagos',
  totalCapacity: 220,
};

export default function CheckIn() {
  const { id } = useParams();
  const [guests, setGuests] = useState(mockGuests);
  const [scanInput, setScanInput] = useState('');
  const [lastScan, setLastScan] = useState(null);
  const [scanMode, setScanMode] = useState(false);
  const [search, setSearch] = useState('');

  const arrived = guests.filter(g => g.status === 'arrived').length;
  const pct = Math.round((arrived / guests.length) * 100);

  const handleScan = (ticket) => {
    const guest = guests.find(g => g.ticket === ticket || g.name.toLowerCase().includes(ticket.toLowerCase()));
    if (!guest) {
      setLastScan({ success: false, message: 'Ticket not found', ticket });
      return;
    }
    if (guest.status === 'arrived') {
      setLastScan({ success: false, message: `${guest.name} already checked in`, ticket });
      return;
    }
    setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, status: 'arrived', time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) } : g));
    setLastScan({ success: true, message: `${guest.name} checked in!`, guest });
    setScanInput('');
    setTimeout(() => setLastScan(null), 3000);
  };

  const handleManualCheckIn = (guestId) => {
    const guest = guests.find(g => g.id === guestId);
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, status: g.status === 'arrived' ? 'not_arrived' : 'arrived', time: g.status === 'not_arrived' ? new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : null } : g));
    if (guest?.status === 'not_arrived') {
      setLastScan({ success: true, message: `${guest.name} checked in!`, guest });
      setTimeout(() => setLastScan(null), 2500);
    }
  };

  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.ticket.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="font-bold text-sm">{eventInfo.title}</div>
            <div className="text-xs text-gray-400">{eventInfo.venue}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Live</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Live counter */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-600/20 blur-xl" />
          <div className="relative">
            <div className="text-7xl font-extrabold mb-1">{arrived}</div>
            <div className="text-brand-200 text-sm font-medium">of {guests.length} guests arrived</div>
            <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-3 rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 text-white/80 text-xs">{pct}% capacity · {guests.length - arrived} still expected</div>
          </div>
        </div>

        {/* Last scan notification */}
        {lastScan && (
          <div className={`rounded-2xl p-4 flex items-center gap-3 border ${lastScan.success ? 'bg-green-900/50 border-green-500/30' : 'bg-red-900/50 border-red-500/30'}`}>
            {lastScan.success
              ? <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
              : <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            }
            <div>
              <div className={`font-bold text-sm ${lastScan.success ? 'text-green-300' : 'text-red-300'}`}>{lastScan.message}</div>
              {lastScan.guest && (
                <div className="text-xs text-gray-400 mt-0.5">Table {lastScan.guest.table} · {lastScan.guest.meal}</div>
              )}
            </div>
          </div>
        )}

        {/* Scanner input */}
        <div className="bg-gray-900 rounded-2xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-4 h-4 text-brand-400" />
            <h3 className="font-bold text-sm">Scan / Enter ticket</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Scan QR or type ticket number..."
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && scanInput && handleScan(scanInput)}
              className="flex-grow px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder-gray-500"
              autoFocus
            />
            <button
              onClick={() => scanInput && handleScan(scanInput)}
              className="px-4 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-bold transition flex-shrink-0"
            >
              Check In
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Point a barcode scanner here, or type the guest name to check in manually below.</p>
        </div>

        {/* Sample QR */}
        <div className="bg-gray-900 rounded-2xl border border-white/10 p-5 text-center">
          <p className="text-xs text-gray-400 mb-3">Sample guest QR code</p>
          <div className="inline-block bg-white p-3 rounded-xl">
            <QRCodeSVG value="EP-0001-WED" size={100} />
          </div>
          <p className="text-xs text-gray-500 mt-2">EP-0001-WED</p>
        </div>

        {/* Guest list */}
        <div className="bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search guests..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-white placeholder-gray-500"
              />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{filtered.length} guests</span>
          </div>

          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {filtered.map(guest => (
              <div
                key={guest.id}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition cursor-pointer ${guest.status === 'arrived' ? 'opacity-70' : ''}`}
                onClick={() => handleManualCheckIn(guest.id)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  guest.status === 'arrived' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'
                }`}>
                  {guest.status === 'arrived' ? '✓' : guest.name[0]}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{guest.name}</div>
                  <div className="text-xs text-gray-500">{guest.ticket} · Table {guest.table} · {guest.meal}</div>
                </div>
                {guest.status === 'arrived' ? (
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-green-400 font-medium">Checked in</div>
                    <div className="text-xs text-gray-500">{guest.time}</div>
                  </div>
                ) : (
                  <button className="px-3 py-1.5 bg-brand-600/30 border border-brand-500/30 text-brand-400 text-xs font-semibold rounded-lg hover:bg-brand-600 hover:text-white transition flex-shrink-0">
                    Check in
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
