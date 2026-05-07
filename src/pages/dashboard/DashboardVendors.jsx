import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { vendorDiscover, bookingsApi, vendors, events as eventsApi } from '../../lib/api';
import {
  Store, Plus, Search, Star, MapPin, Filter, Bookmark, BookmarkCheck,
  Clock, CheckCircle, XCircle, ChevronRight, Package, Calendar,
  AlertCircle, ArrowRight, X, ChevronDown, Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Venue', 'Catering', 'Photography', 'Entertainment', 'Decor', 'Transport', 'Tech & AV'];

const STATUS_META = {
  requested:      { label: 'Awaiting response', color: 'bg-yellow-100 text-yellow-800' },
  vendor_quoted:  { label: 'Quote received',    color: 'bg-blue-100 text-blue-800' },
  accepted:       { label: 'Confirmed',         color: 'bg-green-100 text-green-800' },
  declined:       { label: 'Declined',          color: 'bg-red-100 text-red-800' },
  completed:      { label: 'Completed',         color: 'bg-gray-100 text-gray-600' },
  cancelled:      { label: 'Cancelled',         color: 'bg-gray-100 text-gray-600' },
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-gray-100 rounded-lg flex-1" />
        <div className="h-8 bg-gray-100 rounded-lg flex-1" />
      </div>
    </div>
  );
}

// ─── Vendor Card ──────────────────────────────────────────────────────────────

function VendorCard({ vendor, bookmarked, onToggleBookmark, onGetQuote }) {
  const [saving, setSaving] = useState(false);

  const initial = (vendor.name || '?')[0].toUpperCase();
  const colors = ['bg-orange-100 text-orange-600', 'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600',
                  'bg-green-100 text-green-600', 'bg-pink-100 text-pink-600', 'bg-teal-100 text-teal-600'];
  const colorClass = colors[(vendor.name || '').charCodeAt(0) % colors.length];

  async function handleBookmark() {
    setSaving(true);
    await onToggleBookmark(vendor);
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${colorClass}`}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-sm truncate">{vendor.name}</h3>
            {vendor.verified && (
              <span className="flex items-center gap-0.5 text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          {vendor.category && (
            <span className="inline-block text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mt-0.5">
              {vendor.category}
            </span>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            {vendor.rating && (
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {Number(vendor.rating).toFixed(1)}
              </span>
            )}
            {vendor.location && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" /> {vendor.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {vendor.description && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{vendor.description}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleBookmark}
          disabled={saving}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition flex-1 justify-center ${
            bookmarked
              ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          {bookmarked ? 'Saved' : 'Save'}
        </button>
        <Link
          to={`/discover/vendors/${vendor.id}`}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition flex-1 justify-center"
        >
          View profile
        </Link>
        <button
          onClick={() => onGetQuote(vendor)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition flex-1 justify-center"
        >
          Get a quote
        </button>
      </div>
    </div>
  );
}

// ─── Booking Request Modal ────────────────────────────────────────────────────

function BookingRequestModal({ vendor, onClose, onSuccess }) {
  const [form, setForm] = useState({
    event_id: '',
    service_date: '',
    requirements_brief: '',
    budget_hint: '',
    headcount: '',
  });
  const [eventsList, setEventsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    eventsApi.list().then(setEventsList).catch(() => setEventsList([]));
  }, []);

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.service_date) { toast.error('Please enter a service date.'); return; }
    if (!form.requirements_brief.trim()) { toast.error('Please describe what you need.'); return; }

    setSubmitting(true);
    try {
      const body = {
        vendor_id: vendor.id,
        service_date: form.service_date,
        requirements_brief: form.requirements_brief,
      };
      if (form.event_id) body.event_id = form.event_id;
      if (form.budget_hint) body.budget_hint = Number(form.budget_hint);
      if (form.headcount) body.headcount = Number(form.headcount);

      await bookingsApi.create(body);
      toast.success("Booking request sent! You'll hear back within 24h.");
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to send booking request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Request a quote</h2>
            <p className="text-sm text-gray-500 mt-0.5">{vendor.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Event (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link to an event <span className="text-gray-400 font-normal">(optional)</span></label>
            <select
              value={form.event_id}
              onChange={e => set('event_id', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
            >
              <option value="">— No event —</option>
              {eventsList.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title || ev.name}</option>
              ))}
            </select>
          </div>

          {/* Service date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.service_date}
              onChange={e => set('service_date', e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">What do you need? <span className="text-red-500">*</span></label>
            <textarea
              value={form.requirements_brief}
              onChange={e => set('requirements_brief', e.target.value)}
              required
              rows={4}
              placeholder="Describe what you need — the more detail, the better the quote."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>

          {/* Budget hint */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Approximate budget <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₦</span>
              <input
                type="number"
                value={form.budget_hint}
                onChange={e => set('budget_hint', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>

          {/* Headcount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected headcount <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="number"
              value={form.headcount}
              onChange={e => set('headcount', e.target.value)}
              placeholder="e.g. 150"
              min="1"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send request
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

// ─── Booking Detail Modal ─────────────────────────────────────────────────────

function BookingDetailModal({ booking, onClose, onRefresh }) {
  const [acting, setActing] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', method: 'Wallet' });
  const [showPay, setShowPay] = useState(false);

  const statusMeta = STATUS_META[booking.status] || { label: booking.status, color: 'bg-gray-100 text-gray-600' };

  const TIMELINE = [
    { key: 'requested',     label: 'Request sent' },
    { key: 'vendor_quoted', label: 'Vendor responded' },
    { key: 'accepted',      label: 'Confirmed' },
    { key: 'completed',     label: 'Completed' },
  ];
  const statusOrder = ['requested', 'vendor_quoted', 'accepted', 'completed'];
  const currentIdx = statusOrder.indexOf(booking.status);

  async function act(action, extra = {}) {
    setActing(true);
    try {
      await bookingsApi.respondQuote(booking.id, { action, ...extra });
      toast.success(action === 'accept' ? 'Quote accepted!' : action === 'reject' ? 'Quote rejected.' : 'Counter-offer sent.');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    } finally {
      setActing(false);
    }
  }

  async function handlePay() {
    if (!payForm.amount) { toast.error('Enter an amount.'); return; }
    setActing(true);
    try {
      await bookingsApi.pay(booking.id, { amount: Number(payForm.amount), method: payForm.method });
      toast.success('Payment initiated!');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Payment failed.');
    } finally {
      setActing(false);
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{booking.vendor_name || 'Booking'}</h2>
            {booking.ref && <p className="text-xs text-gray-400 mt-0.5">Ref: {booking.ref}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Timeline</p>
            <ol className="flex items-center gap-0">
              {TIMELINE.map((step, i) => {
                const done = currentIdx >= i;
                const active = currentIdx === i;
                return (
                  <li key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition ${
                        done ? 'bg-orange-600 border-orange-600' : 'bg-white border-gray-200'
                      } ${active ? 'ring-2 ring-orange-200' : ''}`}>
                        {done ? <CheckCircle className="w-4 h-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 text-center leading-tight w-16">{step.label}</span>
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-4 mx-1 ${currentIdx > i ? 'bg-orange-400' : 'bg-gray-200'}`} />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Requirements */}
          {booking.requirements_brief && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">What you requested</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{booking.requirements_brief}</p>
            </div>
          )}

          {/* Quote card — vendor_quoted status */}
          {booking.status === 'vendor_quoted' && booking.quote && (
            <div className="border border-blue-100 bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">Quote received</p>
              {Array.isArray(booking.quote.line_items) && booking.quote.line_items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-700 mb-1.5">
                  <span>{item.description}</span>
                  <span className="font-medium">₦{Number(item.amount).toLocaleString()}</span>
                </div>
              ))}
              {booking.quote.total && (
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-blue-200 pt-2 mt-2">
                  <span>Total</span>
                  <span>₦{Number(booking.quote.total).toLocaleString()}</span>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => act('accept')}
                  disabled={acting}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-60"
                >
                  Accept quote
                </button>
                <button
                  onClick={() => act('counter')}
                  disabled={acting}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-60"
                >
                  Counter-offer
                </button>
                <button
                  onClick={() => act('reject')}
                  disabled={acting}
                  className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Pay now — accepted status */}
          {booking.status === 'accepted' && (
            <div>
              {!showPay ? (
                <button
                  onClick={() => setShowPay(true)}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold transition"
                >
                  Pay now
                </button>
              ) : (
                <div className="border border-orange-100 bg-orange-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Payment</p>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Amount (₦)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₦</span>
                      <input
                        type="number"
                        value={payForm.amount}
                        onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Payment method</label>
                    <select
                      value={payForm.method}
                      onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                    >
                      <option value="Wallet">Wallet</option>
                      <option value="Bank">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPay(false)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                    <button onClick={handlePay} disabled={acting} className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-60">
                      {acting ? 'Processing...' : 'Confirm payment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leave a review — completed */}
          {booking.status === 'completed' && (
            <div className="text-center py-2">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-3">This booking is complete!</p>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Leave a review
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ─── Add Vendor Manually Modal ────────────────────────────────────────────────

function AddVendorModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', category: '', contact: '' });
  const [submitting, setSubmitting] = useState(false);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Vendor name is required.'); return; }
    setSubmitting(true);
    try {
      await vendors.create(form);
      toast.success('Vendor added successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to add vendor.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Add vendor manually</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              placeholder="e.g. Funke Cakes & Events"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
            >
              <option value="">— Select category —</option>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact (phone or email)</label>
            <input
              type="text"
              value={form.contact}
              onChange={e => set('contact', e.target.value)}
              placeholder="e.g. 08012345678 or vendor@email.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Add vendor
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

// ─── Modal Backdrop ───────────────────────────────────────────────────────────

function ModalBackdrop({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>
  );
}

// ─── Tab: Eventpark Vendors ──────────────────────────────────────────────────

function TabAllVendors({ onSwitchTab }) {
  const [vendors_list, setVendorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [quoteVendor, setQuoteVendor] = useState(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search.trim()) params.search = search.trim();
      const data = await vendorDiscover.list(params);
      setVendorsList(Array.isArray(data) ? data : (data.vendors || data.data || []));
    } catch {
      setVendorsList([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const t = setTimeout(fetchVendors, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchVendors]);

  // Fetch bookmarks to know which are saved
  useEffect(() => {
    vendorDiscover.listBookmarks()
      .then(data => {
        const list = Array.isArray(data) ? data : (data.bookmarks || data.data || []);
        setBookmarkedIds(new Set(list.map(b => b.item_id || b.vendor_id || b.id)));
      })
      .catch(() => {});
  }, []);

  async function handleToggleBookmark(vendor) {
    const isSaved = bookmarkedIds.has(vendor.id);
    // Optimistic update
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.delete(vendor.id); else next.add(vendor.id);
      return next;
    });
    try {
      if (isSaved) {
        await vendorDiscover.unbookmark(vendor.id);
        toast.success('Removed from saved vendors.');
      } else {
        await vendorDiscover.bookmark(vendor.id);
        toast.success('Vendor saved!');
      }
    } catch (err) {
      // Revert
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (isSaved) next.add(vendor.id); else next.delete(vendor.id);
        return next;
      });
      toast.error(err.message || 'Action failed.');
    }
  }

  function clearFilters() {
    setSearch('');
    setCategory('All');
  }

  return (
    <div>
      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              category === cat
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : vendors_list.length === 0 ? (
        <div className="text-center py-20">
          <Store className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-400 mb-1">No vendors found matching your criteria.</p>
          <button onClick={clearFilters} className="text-sm text-orange-600 hover:underline mt-1">Clear filters</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {vendors_list.map(v => (
            <VendorCard
              key={v.id}
              vendor={v}
              bookmarked={bookmarkedIds.has(v.id)}
              onToggleBookmark={handleToggleBookmark}
              onGetQuote={setQuoteVendor}
            />
          ))}
        </div>
      )}

      {quoteVendor && (
        <BookingRequestModal
          vendor={quoteVendor}
          onClose={() => setQuoteVendor(null)}
          onSuccess={() => { setQuoteVendor(null); onSwitchTab('bookings'); }}
        />
      )}
    </div>
  );
}

// ─── Tab: My Vendors ──────────────────────────────────────────────────────────

function TabMyVendors({ onSwitchTab }) {
  const [savedVendors, setSavedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [quoteVendor, setQuoteVendor] = useState(null);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vendorDiscover.listBookmarks();
      const list = Array.isArray(data) ? data : (data.bookmarks || data.data || []);
      setSavedVendors(list);
    } catch {
      setSavedVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  async function handleRemoveBookmark(vendor) {
    try {
      await vendorDiscover.unbookmark(vendor.id);
      toast.success('Removed from saved vendors.');
      setSavedVendors(prev => prev.filter(v => (v.item_id || v.vendor_id || v.id) !== vendor.id));
    } catch (err) {
      toast.error(err.message || 'Failed to remove.');
    }
  }

  // Normalise bookmark record to a vendor-like shape
  function normalise(b) {
    return b.vendor || {
      id: b.item_id || b.vendor_id || b.id,
      name: b.vendor_name || b.name || 'Unnamed vendor',
      category: b.category,
      rating: b.rating,
      location: b.location,
      verified: b.verified,
      last_engaged: b.last_engaged,
      total_paid: b.total_paid,
    };
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{savedVendors.length} saved vendor{savedVendors.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition"
        >
          <Plus className="w-4 h-4" /> Add vendor manually
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : savedVendors.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-400 mb-1">No saved vendors yet.</p>
          <p className="text-sm text-gray-400 mb-4">Browse Eventpark Vendors to find and save vendors you like.</p>
          <button
            onClick={() => onSwitchTab('all')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:underline"
          >
            Browse vendors <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {savedVendors.map(b => {
            const v = normalise(b);
            return (
              <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <VendorCard
                  vendor={v}
                  bookmarked={true}
                  onToggleBookmark={() => handleRemoveBookmark(v)}
                  onGetQuote={setQuoteVendor}
                />
                {(b.last_engaged || b.total_paid) && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex gap-4 text-xs text-gray-400">
                    {b.last_engaged && <span>Last engaged: {new Date(b.last_engaged).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    {b.total_paid && <span>Total paid: ₦{Number(b.total_paid).toLocaleString()}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddVendorModal onClose={() => setShowAddModal(false)} onSuccess={fetchSaved} />
      )}
      {quoteVendor && (
        <BookingRequestModal
          vendor={quoteVendor}
          onClose={() => setQuoteVendor(null)}
          onSuccess={() => { setQuoteVendor(null); onSwitchTab('bookings'); }}
        />
      )}
    </div>
  );
}

// ─── Tab: Bookings ────────────────────────────────────────────────────────────

function TabBookings({ onSwitchTab }) {
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingsApi.list();
      setBookingsList(Array.isArray(data) ? data : (data.bookings || data.data || []));
    } catch {
      setBookingsList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  function fmt(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-6 w-24 bg-gray-100 rounded-full" />
                <div className="h-8 w-16 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : bookingsList.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-400 mb-1">No bookings yet.</p>
          <p className="text-sm text-gray-400 mb-4">Find a vendor and send a booking request.</p>
          <button
            onClick={() => onSwitchTab('all')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:underline"
          >
            Browse vendors <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {bookingsList.map((b, idx) => {
            const meta = STATUS_META[b.status] || { label: b.status, color: 'bg-gray-100 text-gray-600' };
            return (
              <div key={b.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition ${idx !== 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{b.vendor_name || 'Unknown vendor'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.event_title || 'No event linked'} · {fmt(b.service_date)}</p>
                </div>
                <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.color}`}>
                  {meta.label}
                </span>
                {b.amount && (
                  <span className="flex-shrink-0 text-sm font-bold text-gray-800">₦{Number(b.amount).toLocaleString()}</span>
                )}
                <button
                  onClick={() => setSelected(b)}
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 px-3 py-1.5 border border-orange-200 rounded-lg hover:bg-orange-50 transition"
                >
                  View <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <BookingDetailModal
          booking={selected}
          onClose={() => setSelected(null)}
          onRefresh={fetchBookings}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardVendors() {
  const [activeTab, setActiveTab] = useState('all');

  const TABS = [
    { key: 'all',      label: 'Eventpark Vendors', icon: Store },
    { key: 'my',       label: 'My Vendors',         icon: Bookmark },
    { key: 'bookings', label: 'Bookings',            icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">Discover, save, and manage your event vendors in one place.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-8 w-fit shadow-sm">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === key
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'all'      && <TabAllVendors  onSwitchTab={setActiveTab} />}
        {activeTab === 'my'       && <TabMyVendors   onSwitchTab={setActiveTab} />}
        {activeTab === 'bookings' && <TabBookings     onSwitchTab={setActiveTab} />}
      </div>
    </div>
  );
}
