import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Clock, Users, Share2, Heart,
  CheckCircle, X, ChevronRight, Minus, Plus, QrCode,
  Download, MessageCircle, CreditCard, Shield, Loader2, Ticket, Tag,
} from 'lucide-react';
import { discover as discoverApi } from '../../lib/api';
import toast from 'react-hot-toast';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

function calcFee(subtotal) {
  const pct = subtotal * 0.015;
  const fee = Math.min(pct + 100, 2000);
  return Math.round(fee);
}

// ── Checkout modal ───────────────────────────────────────────────
function CheckoutModal({ event, selection, tiers, onClose }) {
  const [step, setStep] = useState(1);
  const [paying, setPaying] = useState(false);
  const [buyer, setBuyer] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const selectedTiers = tiers.filter(t => (selection[t.id] || 0) > 0);
  const subtotal = selectedTiers.reduce((s, t) => s + (t.price / 100) * selection[t.id], 0);
  const fee = calcFee(subtotal);
  const total = subtotal + fee;

  const bUpdate = (k, v) => setBuyer(p => ({ ...p, [k]: v }));
  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => { setPaying(false); setStep(3); }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && step < 3 && (
              <button onClick={() => setStep(s => s - 1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <h2 className="font-bold text-gray-900">
              {step === 1 ? 'Your details' : step === 2 ? 'Payment' : 'Booking confirmed!'}
            </h2>
          </div>
          {step !== 3 && (
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {selectedTiers.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{t.name} × {selection[t.id]}</span>
                    <span className="font-semibold text-gray-900">₦{((t.price / 100) * selection[t.id]).toLocaleString('en-NG')}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Contact information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>First name *</label><input type="text" value={buyer.firstName} onChange={e => bUpdate('firstName', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Last name *</label><input type="text" value={buyer.lastName} onChange={e => bUpdate('lastName', e.target.value)} className={inputCls} /></div>
                </div>
                <div className="mt-3"><label className={labelCls}>Email *</label><input type="email" placeholder="ticket confirmation sent here" value={buyer.email} onChange={e => bUpdate('email', e.target.value)} className={inputCls} /></div>
                <div className="mt-3"><label className={labelCls}>Phone *</label><input type="tel" placeholder="+234" value={buyer.phone} onChange={e => bUpdate('phone', e.target.value)} className={inputCls} /></div>
              </div>
              <button onClick={() => setStep(2)} disabled={!buyer.firstName || !buyer.email}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
                Continue to payment <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                <p className="text-xs text-brand-600 font-semibold mb-1">You're paying</p>
                <p className="text-3xl font-extrabold text-brand-700">₦{total.toLocaleString('en-NG')}</p>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between"><span>Subtotal</span><span>₦{subtotal.toLocaleString('en-NG')}</span></div>
                  <div className="flex justify-between"><span>Paystack fee (1.5% + ₦100, cap ₦2,000)</span><span>₦{fee.toLocaleString('en-NG')}</span></div>
                  <div className="flex justify-between font-bold text-gray-700 border-t border-gray-100 pt-1 mt-1"><span>Total</span><span>₦{total.toLocaleString('en-NG')}</span></div>
                </div>
              </div>
              <div className="border border-gray-100 rounded-xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-green-500" /></div>
                <div className="flex-1"><p className="text-sm font-semibold text-gray-800">Secured by Paystack</p><p className="text-xs text-gray-400">Your payment info is encrypted and never stored.</p></div>
                <div className="text-xs font-extrabold text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">PAYSTACK</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                <div><label className={labelCls}><CreditCard className="w-3.5 h-3.5 inline mr-1" />Card number</label><input type="text" placeholder="4242 4242 4242 4242" className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Expiry</label><input type="text" placeholder="MM/YY" className={inputCls} /></div>
                  <div><label className={labelCls}>CVV</label><input type="text" placeholder="123" className={inputCls} /></div>
                </div>
              </div>
              <button onClick={handlePay} disabled={paying}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
                {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : `Pay ₦${total.toLocaleString('en-NG')}`}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎟️</div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">You're going to<br />{event.title}!</h2>
              <p className="text-sm text-gray-500 mb-6">Tickets sent to <span className="font-semibold text-gray-700">{buyer.email}</span></p>
              <div className="w-36 h-36 bg-gray-100 border-2 border-dashed border-gray-200 rounded-2xl mx-auto flex flex-col items-center justify-center gap-2 mb-6">
                <QrCode className="w-10 h-10 text-gray-300" /><span className="text-xs text-gray-400">QR code</span>
              </div>
              <div className="space-y-3">
                <a href={`https://wa.me/?text=${encodeURIComponent(`I'm going to ${event.title} 🎉 Get your tickets at eventpark.ng/discover/events/${event.id}`)}`}
                  target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl text-sm transition">
                  <MessageCircle className="w-4 h-4" /> Share with friends
                </a>
                <button onClick={onClose} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Ticket panel ─────────────────────────────────────────────────
function TicketPanel({ event, tiers, onCheckout, loading }) {
  const [selection, setSelection] = useState({});

  const adjust = (id, delta) => {
    setSelection(prev => {
      const cur = prev[id] || 0;
      const tier = tiers.find(t => t.id === id);
      const avail = (tier?.quantity || 0) - (tier?.quantity_sold || 0);
      const next = Math.max(0, Math.min(cur + delta, avail, 10));
      return { ...prev, [id]: next };
    });
  };

  const subtotal = tiers.reduce((s, t) => s + (t.price / 100) * (selection[t.id] || 0), 0);
  const fee = calcFee(subtotal);
  const total = subtotal + fee;
  const anySelected = Object.values(selection).some(v => v > 0);

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
    </div>
  );

  if (tiers.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
      <Ticket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="text-sm text-gray-500">No ticket tiers yet</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-4">Select tickets</h3>
      <div className="space-y-3 mb-5">
        {tiers.map(tier => {
          const avail = (tier.quantity || 0) - (tier.quantity_sold || 0);
          const soldOut = avail <= 0;
          const qty = selection[tier.id] || 0;
          return (
            <div key={tier.id} className={`border rounded-xl p-4 transition-all ${soldOut ? 'border-gray-100 bg-gray-50 opacity-60' : qty > 0 ? 'border-brand-300 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900 text-sm">{tier.name}</span>
                    {soldOut && <span className="text-xs font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Sold out</span>}
                  </div>
                  {tier.description && <p className="text-xs text-gray-400 leading-relaxed">{tier.description}</p>}
                  <p className="text-sm font-extrabold text-brand-700 mt-1">
                    {tier.kind === 'free' || tier.price === 0 ? 'Free' : `₦${(tier.price / 100).toLocaleString('en-NG')}`}
                  </p>
                  {!soldOut && <p className="text-xs text-gray-400">{avail} left</p>}
                </div>
                {!soldOut && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => adjust(tier.id, -1)} disabled={qty === 0}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{qty}</span>
                    <button onClick={() => adjust(tier.id, 1)} disabled={qty >= Math.min(avail, 10)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {anySelected && (
        <div className="mb-4 space-y-1 text-sm border-t border-gray-100 pt-4">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₦{subtotal.toLocaleString('en-NG')}</span></div>
          <div className="flex justify-between text-gray-500"><span>Paystack fee</span><span>₦{fee.toLocaleString('en-NG')}</span></div>
          <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>₦{total.toLocaleString('en-NG')}</span></div>
        </div>
      )}

      <button disabled={!anySelected} onClick={() => onCheckout(selection)}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition">
        {anySelected ? `Get tickets — ₦${total.toLocaleString('en-NG')}` : 'Select tickets above'}
      </button>
      <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" /> Secure checkout by EventPark + Paystack
      </p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSelection, setCheckoutSelection] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    discoverApi.getEvent(id)
      .then(data => setEvent(data))
      .catch(() => toast.error('Could not load event'))
      .finally(() => setLoading(false));

    setTiersLoading(true);
    discoverApi.getEventTickets(id)
      .then(data => setTiers(Array.isArray(data) ? data : []))
      .catch(() => setTiers([]))
      .finally(() => setTiersLoading(false));
  }, [id]);

  const handleCheckout = (selection) => {
    setCheckoutSelection(selection);
    setCheckoutOpen(true);
  };

  const pctSold = event?.max_guests > 0
    ? Math.round((event.guest_count / event.max_guests) * 100)
    : 0;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-gray-50 pt-16 flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500 text-lg">Event not found</p>
      <Link to="/discover/events" className="text-brand-600 font-semibold hover:underline">← Browse events</Link>
    </div>
  );

  const lowestTierPrice = tiers.filter(t => t.price > 0).reduce((m, t) => Math.min(m, t.price), Infinity);
  const hasFree = tiers.some(t => t.price === 0 || t.kind === 'free');

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero */}
      <div className="relative h-80 bg-ep-navy overflow-hidden">
        {event.cover_url
          ? <img src={event.cover_url} alt={event.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-brand-600 to-ep-navy" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-5 left-4 sm:left-8">
          <Link to="/discover/events" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl transition">
            <ArrowLeft className="w-4 h-4" />Back
          </Link>
        </div>

        <div className="absolute top-5 right-4 sm:right-8">
          <button onClick={() => setSaved(p => !p)} className={`p-2.5 rounded-xl backdrop-blur-sm transition ${saved ? 'bg-red-500 text-white' : 'bg-black/20 text-white/80 hover:text-white'}`}>
            <Heart className={`w-5 h-5 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full capitalize">{event.event_type?.replace(/_/g, ' ')}</span>
            {event.start_at && <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(event.start_at)}</span>}
            {event.venue_city && <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue_city}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{event.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 gap-8">

          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">

            {/* Organizer */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg flex-shrink-0">EP</div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">Organised by</p>
                <p className="font-semibold text-gray-900">EventPark</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5"><CheckCircle className="w-3 h-3" />Verified organiser</p>
              </div>
            </div>

            {/* Capacity bar */}
            {event.max_guests > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Ticket availability</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${pctSold > 85 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {pctSold > 85 ? 'Almost sold out!' : `${event.max_guests - event.guest_count} remaining`}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pctSold > 85 ? 'bg-red-400' : pctSold > 60 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${pctSold}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{event.guest_count?.toLocaleString() || 0} of {event.max_guests?.toLocaleString()} tickets sold</p>
              </div>
            )}

            {/* About */}
            {event.description && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-4">About this event</h2>
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {/* Ticket tiers summary */}
            {tiers.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Ticket className="w-4 h-4 text-brand-600" />Ticket tiers</h2>
                <div className="space-y-3">
                  {tiers.map(t => {
                    const avail = (t.quantity || 0) - (t.quantity_sold || 0);
                    return (
                      <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                          {t.description && <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">{avail} available</p>
                        </div>
                        <p className="font-extrabold text-brand-700 text-sm">
                          {t.kind === 'free' || t.price === 0 ? 'Free' : `₦${(t.price / 100).toLocaleString('en-NG')}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Event details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Event details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Calendar, label: 'Date', value: formatDate(event.start_at) || '—' },
                  { icon: Clock, label: 'Time', value: formatTime(event.start_at) || '—' },
                  { icon: MapPin, label: 'Venue', value: [event.venue_name, event.venue_city].filter(Boolean).join(', ') || '—' },
                  { icon: Users, label: 'Capacity', value: event.max_guests ? `${event.max_guests.toLocaleString()} attendees` : '—' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile ticket panel */}
            <div className="lg:hidden">
              <TicketPanel event={event} tiers={tiers} onCheckout={handleCheckout} loading={tiersLoading} />
            </div>
          </div>

          {/* Right col */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              {/* Price summary */}
              {tiers.length > 0 && (
                <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-4">
                  <p className="text-xs text-brand-600 font-semibold mb-1">Tickets from</p>
                  <p className="text-2xl font-extrabold text-brand-700">
                    {hasFree && lowestTierPrice === Infinity ? 'Free' : lowestTierPrice !== Infinity ? `₦${(lowestTierPrice / 100).toLocaleString('en-NG')}` : 'Free'}
                  </p>
                </div>
              )}

              <TicketPanel event={event} tiers={tiers} onCheckout={handleCheckout} loading={tiersLoading} />

              <div className="flex gap-3 mt-4">
                <button onClick={() => setSaved(p => !p)}
                  className={`flex-1 flex items-center justify-center gap-2 border py-2.5 rounded-xl text-sm font-medium transition ${saved ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Check out: ${event.title} — eventpark.vercel.app/discover/events/${event.id}`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  <Share2 className="w-4 h-4" />Share
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          event={event}
          selection={checkoutSelection}
          tiers={tiers}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
