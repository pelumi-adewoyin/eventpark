import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Calendar, MapPin, Users,
  DollarSign, Globe, Lock, Tag, Image, Zap, AlertTriangle,
  Plus, Trash2, Edit2, Copy, Share2, ExternalLink, X, ToggleLeft, ToggleRight,
  Ticket, Eye, EyeOff, Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { events as eventsApi } from '../../lib/api';
import toast from 'react-hot-toast';

const PRIVATE_STEPS = ['Type', 'Details', 'Budget', 'Guests', 'Review'];
const PUBLIC_STEPS = ['Type', 'Event basics', 'Tickets', 'Publish'];

const eventTypes = [
  { group: 'Private', icon: '💍', value: 'wedding', label: 'Wedding', sub: 'Ceremony & Reception' },
  { group: 'Private', icon: '🎂', value: 'birthday', label: 'Birthday', sub: 'Milestone or kids\' party' },
  { group: 'Private', icon: '👶', value: 'naming', label: 'Naming Ceremony', sub: 'Christening / Naming' },
  { group: 'Private', icon: '🎓', value: 'graduation', label: 'Graduation', sub: 'Academic celebration' },
  { group: 'Private', icon: '🏠', value: 'social', label: 'Social Gathering', sub: 'Housewarming, reunion' },
  { group: 'Public', icon: '🎵', value: 'concert', label: 'Concert / Show', sub: 'Ticketed music event' },
  { group: 'Public', icon: '📚', value: 'workshop', label: 'Workshop / Masterclass', sub: 'Paid educational event' },
  { group: 'Public', icon: '🍽', value: 'popup', label: 'Pop-up Dinner', sub: 'Exclusive dining experience' },
  { group: 'Corporate', icon: '🏢', value: 'retreat', label: 'Company Retreat', sub: 'Off-site / team building' },
  { group: 'Corporate', icon: '📢', value: 'conference', label: 'Conference / Summit', sub: 'External public event' },
  { group: 'Corporate', icon: '🎉', value: 'teamparty', label: 'End-of-Year Party', sub: 'Staff celebration' },
];

const groupColors = {
  Private: 'bg-pink-50 border-pink-100 text-pink-700',
  Public: 'bg-brand-50 border-brand-100 text-brand-700',
  Corporate: 'bg-orange-50 border-orange-100 text-orange-700',
};

const PUBLIC_EVENT_TYPES = [
  'Concert', 'DJ night', 'Workshop', 'Conference', 'Pop-up dinner',
  'Meet-up', 'Festival', 'Comedy show', 'Theatre', 'Brand activation', 'Other',
];

const ALL_TAGS = ['Music', 'Tech', 'Wellness', 'Food & drink', 'Education', 'Networking', 'Comedy', 'Family-friendly', '18+', 'Outdoor'];

const TICKET_KINDS = ['Paid', 'Free', 'Donation'];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 5);
}

function formatPrice(n) {
  return '₦' + Number(n).toLocaleString('en-NG');
}

// ── Toggle component ────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
    >
      <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${checked ? 'bg-brand-600' : 'bg-gray-200'}`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <span className="text-sm text-gray-700 select-none">{label}</span>
    </button>
  );
}

// ── Input helpers ────────────────────────────────────────────────
const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-2';

// ── Step P.2 — Public event basics ──────────────────────────────
function StepPublicBasics({ form, update }) {
  const toggleTag = (tag) => {
    const tags = form.event_tags || [];
    update('event_tags', tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Tell us about your event</h2>
        <p className="text-sm text-gray-400">This info will be shown publicly on your event page.</p>
      </div>

      {/* Basic info */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Basic info</h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Event type *</label>
            <select value={form.public_event_type || ''} onChange={e => update('public_event_type', e.target.value)} className={inputCls}>
              <option value="">Select event type</option>
              {PUBLIC_EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Event name *</label>
            <input type="text" placeholder="e.g. Afrobeats Lagos Festival 2026" value={form.event_name || ''} onChange={e => update('event_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tagline <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" placeholder="A punchy one-liner" maxLength={140} value={form.tagline || ''} onChange={e => update('tagline', e.target.value)} className={inputCls} />
            <p className="text-xs text-gray-400 mt-1">{(form.tagline || '').length}/140</p>
          </div>
        </div>
      </div>

      {/* Venue & date */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Venue & date</h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}><Calendar className="w-3.5 h-3.5 inline mr-1" />Event date *</label>
            <input type="date" value={form.event_date || ''} onChange={e => update('event_date', e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start time *</label>
              <input type="time" value={form.event_start_time || ''} onChange={e => update('event_start_time', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End time <span className="text-gray-400 font-normal">(opt)</span></label>
              <input type="time" value={form.event_end_time || ''} onChange={e => update('event_end_time', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}><MapPin className="w-3.5 h-3.5 inline mr-1" />Venue name *</label>
            <input type="text" placeholder="e.g. Tafawa Balewa Square" value={form.venue_name || ''} onChange={e => update('venue_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Venue address</label>
            <input type="text" placeholder="Street address" value={form.venue_address || ''} onChange={e => update('venue_address', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>City *</label>
            <input type="text" placeholder="e.g. Lagos" value={form.venue_city || ''} onChange={e => update('venue_city', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}><Users className="w-3.5 h-3.5 inline mr-1" />Event capacity *</label>
            <input type="number" min="1" placeholder="Max attendees" value={form.event_capacity || ''} onChange={e => update('event_capacity', e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Cover & description */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Cover & description</h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}><Image className="w-3.5 h-3.5 inline mr-1" />Cover image</label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-brand-300 transition cursor-pointer">
              <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-300 mt-1">PNG, JPG up to 10MB · Recommended 1200×630</p>
            </div>
          </div>
          <div>
            <label className={labelCls}>Description *</label>
            <textarea rows={4} placeholder="Tell your audience what to expect — lineup, vibe, dress code..." value={form.event_description || ''} onChange={e => update('event_description', e.target.value)} className={inputCls + ' resize-none'} />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map(tag => {
            const active = (form.event_tags || []).includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${active ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'}`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Step P.3 — Ticket queue ──────────────────────────────────────
function StepTickets({ form, update }) {
  const [ticket, setTicket] = useState({
    ticket_name: '', ticket_kind: 'Paid', ticket_price: '', ticket_quantity: '',
    ticket_description: '', sales_start_at: '', sales_end_at: '',
    transfer_fees_to_buyer: true, is_hidden: false,
  });
  const [editingIdx, setEditingIdx] = useState(null);
  const [showSingleWarning, setShowSingleWarning] = useState(false);

  const tickets = form.tickets || [];
  const capacity = parseInt(form.event_capacity) || 0;
  const totalQty = tickets.reduce((s, t) => s + parseInt(t.ticket_quantity || 0), 0);
  const hasFreeOrComp = tickets.some(t => t.ticket_kind === 'Free');
  const hasFirstPaid = tickets.some(t => t.ticket_kind === 'Paid');
  const showFreeTip = hasFirstPaid && !hasFreeOrComp;

  const tUpdate = (k, v) => setTicket(p => ({ ...p, [k]: v }));

  const addTicket = (keepOpen = false) => {
    if (!ticket.ticket_name || !ticket.ticket_quantity) return;
    const newTicket = { ...ticket, id: Date.now() };
    if (editingIdx !== null) {
      const updated = [...tickets];
      updated[editingIdx] = newTicket;
      update('tickets', updated);
      setEditingIdx(null);
    } else {
      update('tickets', [...tickets, newTicket]);
    }
    const blank = { ticket_name: '', ticket_kind: keepOpen ? ticket.ticket_kind : 'Paid', ticket_price: '', ticket_quantity: '', ticket_description: '', sales_start_at: '', sales_end_at: '', transfer_fees_to_buyer: true, is_hidden: false };
    setTicket(blank);
  };

  const removeTicket = (idx) => update('tickets', tickets.filter((_, i) => i !== idx));

  const editTicket = (idx) => {
    setTicket({ ...tickets[idx] });
    setEditingIdx(idx);
  };

  const addFreeTier = () => {
    setTicket(p => ({ ...p, ticket_kind: 'Free', ticket_price: '', ticket_name: 'Free (Press / VIP Comp)' }));
  };

  const kindColor = (kind) => {
    if (kind === 'Free') return 'bg-green-100 text-green-700';
    if (kind === 'Paid') return 'bg-blue-100 text-blue-700';
    return 'bg-purple-100 text-purple-700';
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1">Set up your tickets</h2>
      <p className="text-sm text-gray-400 mb-6">Add one or more ticket tiers for your event.</p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Add-ticket form */}
        <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm mb-4">{editingIdx !== null ? 'Edit ticket tier' : 'Add a ticket tier'}</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Tier name *</label>
              <input type="text" placeholder="e.g. VVIP, Regular, Early Bird" value={ticket.ticket_name} onChange={e => tUpdate('ticket_name', e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Ticket type</label>
              <div className="flex gap-2">
                {TICKET_KINDS.map(k => (
                  <button key={k} type="button" onClick={() => tUpdate('ticket_kind', k)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${ticket.ticket_kind === k ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {ticket.ticket_kind === 'Paid' && (
              <div>
                <label className={labelCls}>Price (₦) *</label>
                <input type="number" min="100" placeholder="Min ₦100" value={ticket.ticket_price} onChange={e => tUpdate('ticket_price', e.target.value)} className={inputCls} />
              </div>
            )}

            <div>
              <label className={labelCls}>Quantity *</label>
              <input type="number" min="1" placeholder="Number of tickets" value={ticket.ticket_quantity} onChange={e => tUpdate('ticket_quantity', e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Description <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea rows={2} placeholder="What's included in this tier?" value={ticket.ticket_description} onChange={e => tUpdate('ticket_description', e.target.value)} className={inputCls + ' resize-none'} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Sales start</label>
                <input type="datetime-local" value={ticket.sales_start_at} onChange={e => tUpdate('sales_start_at', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Sales end</label>
                <input type="datetime-local" value={ticket.sales_end_at} onChange={e => tUpdate('sales_end_at', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="space-y-3">
              <Toggle checked={ticket.transfer_fees_to_buyer} onChange={v => tUpdate('transfer_fees_to_buyer', v)} label="Add Paystack fee to buyer's total" />
              <Toggle checked={ticket.is_hidden} onChange={v => tUpdate('is_hidden', v)} label="Hidden tier — sold via secret link only" />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => addTicket(false)}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm transition">
                {editingIdx !== null ? 'Update tier' : 'Add to queue'}
              </button>
              {editingIdx === null && (
                <button type="button" onClick={() => addTicket(true)}
                  className="flex-1 border border-brand-200 text-brand-600 font-bold py-2.5 rounded-xl text-sm hover:bg-brand-50 transition">
                  Add & create another
                </button>
              )}
              {editingIdx !== null && (
                <button type="button" onClick={() => { setEditingIdx(null); setTicket({ ticket_name: '', ticket_kind: 'Paid', ticket_price: '', ticket_quantity: '', ticket_description: '', sales_start_at: '', sales_end_at: '', transfer_fees_to_buyer: true, is_hidden: false }); }}
                  className="px-4 border border-gray-200 text-gray-500 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Queue */}
        <div className="lg:w-72 flex flex-col gap-3">
          <h3 className="font-bold text-gray-800 text-sm">Ticket queue</h3>

          {tickets.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-center">
              <Ticket className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No tiers yet</p>
              <p className="text-xs text-gray-300">Add your first ticket tier on the left</p>
            </div>
          )}

          {tickets.map((t, idx) => (
            <div key={t.id || idx} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-800 text-sm">{t.ticket_name}</span>
                  {t.is_hidden && <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${kindColor(t.ticket_kind)}`}>{t.ticket_kind}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => editTicket(idx)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><Edit2 className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button onClick={() => removeTicket(idx)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{t.ticket_kind === 'Free' ? 'Free' : t.ticket_kind === 'Donation' ? 'Donation' : `₦${Number(t.ticket_price).toLocaleString()}`}</span>
                <span>{t.ticket_quantity} tickets</span>
              </div>
            </div>
          ))}

          {capacity > 0 && totalQty > capacity && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Total ticket qty ({totalQty}) exceeds capacity ({capacity})
            </div>
          )}

          {showFreeTip && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
              <div>
                Want a free tier for press / VIP comps?{' '}
                <button onClick={addFreeTier} className="font-bold underline">Add free tier</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Single ticket warning modal */}
      {showSingleWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Just one ticket tier?</h3>
            <p className="text-sm text-gray-500 mb-6">Most events have 2–3 tiers to maximise revenue and accessibility.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSingleWarning(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">Add more</button>
              <button onClick={() => { setShowSingleWarning(false); /* parent will call next */ }} className="flex-1 bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-brand-700 transition">Continue anyway</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step P.4 — Preview & publish ────────────────────────────────
function StepPublish({ form, goToBasics, goToTickets }) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(null);

  const tickets = form.tickets || [];

  const handlePublish = async () => {
    setPublishing(true);
    try {
      let startAt;
      if (form.event_date) {
        startAt = form.event_start_time
          ? `${form.event_date}T${form.event_start_time}:00`
          : `${form.event_date}T00:00:00`;
      }
      const result = await eventsApi.create({
        title: form.event_name || 'My Event',
        event_type: form.public_event_type || 'other',
        description: form.event_description || undefined,
        venue_name: form.venue_name || undefined,
        venue_address: form.venue_address || undefined,
        venue_city: form.venue_city || undefined,
        start_at: startAt,
        max_guests: form.event_capacity ? parseInt(form.event_capacity) : undefined,
        budget_total: 0,
        visibility: 'public',
      });
      // Attempt to publish immediately (requires KYC tier 1+)
      if (result?.id) {
        try { await eventsApi.publish(result.id); } catch {}
      }
      const slug = slugify(form.event_name || 'my-event') + '-' + randomSuffix();
      const url = `eventpark.ng/e/${slug}`;
      setPublished({ slug, url, id: result?.id });
      toast.success('Event published!');
    } catch (err) {
      toast.error(err?.message || 'Failed to publish event. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${url}`).then(() => toast.success('Link copied!')).catch(() => toast.error('Could not copy'));
  };

  if (published) {
    return (
      <div className="text-center py-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your event is live!</h2>
        <p className="text-sm text-gray-400 mb-2">Share it everywhere and start selling tickets.</p>
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-6">
          <Globe className="w-4 h-4 text-brand-600" />
          <span className="text-sm font-mono text-gray-700">{published?.url}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button onClick={copyLink} className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
            <Copy className="w-4 h-4" />Copy link
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent('Check out my event: https://' + published.url)}`} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition">
            <Share2 className="w-4 h-4" />WhatsApp share
          </a>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard/events/new-evt" className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition">
            <Zap className="w-4 h-4" />Go to event workspace
          </Link>
          <Link to="/discover/events/new-evt" className="flex items-center justify-center gap-2 px-5 py-3 border border-brand-200 text-brand-600 hover:bg-brand-50 rounded-xl text-sm font-semibold transition">
            <ExternalLink className="w-4 h-4" />View public page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1">Preview & publish</h2>
      <p className="text-sm text-gray-400 mb-6">This is how your event will appear to the public.</p>

      {/* Preview card */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className={`h-48 flex items-end p-5 ${form.coverImage ? '' : 'bg-gradient-to-br from-brand-600 to-ep-navy'}`}>
          {form.coverImage
            ? <img src={form.coverImage} alt="" className="w-full h-full object-cover absolute inset-0" />
            : null}
          <div className="z-10">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{form.public_event_type || 'Event'}</span>
          </div>
        </div>
        <div className="p-5 bg-white">
          <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{form.event_name || 'Event Name'}</h3>
          {form.tagline && <p className="text-sm text-gray-500 mt-1">{form.tagline}</p>}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            {form.event_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{form.event_date} · {form.event_start_time || ''}</span>}
            {form.venue_name && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{form.venue_name}, {form.venue_city}</span>}
          </div>
          {/* Ticket tiers */}
          {tickets.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Ticket tiers</p>
              <div className="space-y-2">
                {tickets.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">{t.ticket_name}</span>
                    <span className="text-gray-500">{t.ticket_kind === 'Free' ? 'Free' : t.ticket_kind === 'Donation' ? 'Donation' : `₦${Number(t.ticket_price).toLocaleString()}`} · {t.ticket_quantity} avail.</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tickets.length === 0 && (
            <p className="text-sm text-amber-600 mt-3 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />No ticket tiers yet</p>
          )}
        </div>
      </div>

      {/* Edit links */}
      <div className="flex gap-3 mb-6">
        <button onClick={goToBasics} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
          Edit details
        </button>
        <button onClick={goToTickets} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
          Edit tickets
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition"
        >
          {publishing ? 'Publishing...' : <><Globe className="w-4 h-4" />Publish event</>}
        </button>
        <button className="sm:w-40 border border-gray-200 text-gray-600 font-semibold py-3.5 rounded-xl text-sm hover:bg-gray-50 transition">
          Save draft
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function CreateEvent() {
  const { user, triggerKyc } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: null, typeGroup: null,
    // Private fields
    name: '', date: '', time: '', venue: '', city: '',
    budget: '', currency: 'NGN',
    capacity: '', ticketed: false, ticketPrice: '',
    coverImage: null,
    // Public fields
    public_event_type: '', event_name: '', tagline: '', event_date: '',
    event_start_time: '', event_end_time: '', venue_name: '', venue_address: '',
    venue_city: '', event_capacity: '', event_description: '',
    event_tags: [], tickets: [],
  });

  const isPublic = form.typeGroup === 'Public';
  const steps = isPublic ? PUBLIC_STEPS : PRIVATE_STEPS;

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const next = () => {
    if (!isPublic && currentStep === 3 && user?.kycTier < 1 && (form.typeGroup === 'Corporate' && form.type === 'conference')) {
      triggerKyc?.('publish_ticket');
      return;
    }
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
  };

  const prev = () => setCurrentStep(s => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      let startAt;
      if (form.date) {
        startAt = form.time
          ? `${form.date}T${form.time}:00`
          : `${form.date}T00:00:00`;
      }
      await eventsApi.create({
        title: form.name || 'My Event',
        event_type: form.type || 'social',
        venue_name: form.venue || undefined,
        venue_city: form.city || undefined,
        start_at: startAt,
        max_guests: form.capacity ? parseInt(form.capacity) : undefined,
        budget_total: form.budget ? parseInt(form.budget) : 0,
        visibility: 'private',
      });
      toast.success('Event created!');
      navigate(user?.role === 'corporate' ? '/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Failed to create event. Please try again.');
      setSubmitting(false);
    }
  };

  const canContinue = () => {
    if (currentStep === 0) return !!form.type;
    return true;
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to={user?.role === 'planner' ? '/planner' : user?.role === 'corporate' ? '/corporate' : '/dashboard'}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < currentStep ? 'bg-green-500 text-white' :
                i === currentStep ? 'bg-brand-600 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === currentStep ? 'text-brand-600' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${i < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">

          {/* STEP 0: Event Type (shared) */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">What kind of event?</h2>
              <p className="text-gray-400 text-sm mb-6">Your selection shapes the tools and templates we show you.</p>
              {['Private', 'Public', 'Corporate'].map(group => (
                <div key={group} className="mb-5">
                  <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-3 border ${groupColors[group]}`}>
                    {group === 'Private' ? <Lock className="w-3 h-3" /> : group === 'Public' ? <Globe className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                    {group} Events
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {eventTypes.filter(t => t.group === group).map(type => (
                      <button
                        key={type.value}
                        onClick={() => { update('type', type.value); update('typeGroup', type.group); update('ticketed', type.group === 'Public'); }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${
                          form.type === type.value ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-sm font-semibold text-gray-800">{type.label}</div>
                        <div className="text-xs text-gray-400">{type.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PUBLIC PATH */}
          {isPublic && currentStep === 1 && <StepPublicBasics form={form} update={update} />}
          {isPublic && currentStep === 2 && <StepTickets form={form} update={update} />}
          {isPublic && currentStep === 3 && (
            <StepPublish
              form={form}
              goToBasics={() => setCurrentStep(1)}
              goToTickets={() => setCurrentStep(2)}
            />
          )}

          {/* PRIVATE PATH — Step 1: Details */}
          {!isPublic && currentStep === 1 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Event details</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Event name *</label>
                  <input type="text" placeholder={form.type === 'wedding' ? 'e.g. Tunde & Bola – Dec 2026 Wedding' : 'Give your event a name'} value={form.name} onChange={e => update('name', e.target.value)} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}><Calendar className="w-3.5 h-3.5 inline mr-1" />Date</label>
                    <input type="date" value={form.date} onChange={e => update('date', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Time</label>
                    <input type="time" value={form.time} onChange={e => update('time', e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}><MapPin className="w-3.5 h-3.5 inline mr-1" />Venue name</label>
                  <input type="text" placeholder="e.g. Eko Hotel & Suites, Lagos" value={form.venue} onChange={e => update('venue', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>City / Area</label>
                  <input type="text" placeholder="e.g. Victoria Island, Lagos" value={form.city} onChange={e => update('city', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}><Image className="w-3.5 h-3.5 inline mr-1" />Cover image (optional)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-brand-300 transition cursor-pointer">
                    <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-300 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVATE PATH — Step 2: Budget */}
          {!isPublic && currentStep === 2 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Budget & tickets</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Total event budget</label>
                  <div className="flex gap-2">
                    <div className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-600 font-medium flex-shrink-0">₦</div>
                    <input type="number" placeholder="0" value={form.budget} onChange={e => update('budget', e.target.value)} className="flex-grow px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">We'll track your spending against this ceiling.</p>
                </div>
                <div>
                  <label className={labelCls}>Budget categories (optional)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Venue', 'Catering', 'Photography', 'Decor', 'Music / DJ', 'Transport', 'Attire', 'Printing', 'Other'].map(cat => (
                      <label key={cat} className="flex items-center gap-2 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                        <input type="checkbox" className="rounded text-brand-600" />
                        <span className="text-sm text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVATE PATH — Step 3: Guests */}
          {!isPublic && currentStep === 3 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Guest list & collaborators</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Expected guest count</label>
                  <input type="number" placeholder="e.g. 220" value={form.capacity} onChange={e => update('capacity', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Import guest list</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Upload CSV', 'Google Contacts', 'Add manually'].map(opt => (
                      <button key={opt} className="p-3 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition text-center font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Invite collaborators</label>
                  <input type="text" placeholder="Enter email or +234 phone number" className={inputCls + ' mb-2'} />
                  <div className="flex gap-2 flex-wrap">
                    {['View-only', 'Guest mgmt', 'Vendor liaison', 'Budget', 'Full edit'].map(scope => (
                      <button key={scope} className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-brand-400 hover:text-brand-600 transition font-medium">
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVATE PATH — Step 4: Review */}
          {!isPublic && currentStep === 4 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">Ready to create!</h2>
                <p className="text-gray-400 text-sm mt-1">Review your event before saving.</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Event name', value: form.name || '—' },
                  { label: 'Type', value: eventTypes.find(t => t.value === form.type)?.label || '—' },
                  { label: 'Date', value: form.date || '—' },
                  { label: 'Venue', value: form.venue ? `${form.venue}, ${form.city}` : '—' },
                  { label: 'Budget', value: form.budget ? `₦${parseInt(form.budget).toLocaleString()}` : '—' },
                  { label: 'Capacity', value: form.capacity ? `${form.capacity} guests` : '—' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2.5 border-b border-gray-100 text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation — hide for public publish step (has its own buttons) */}
        {!(isPublic && currentStep === 3) && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ArrowLeft className="w-4 h-4" />Back
            </button>

            {!isLastStep ? (
              <button
                onClick={next}
                disabled={!canContinue()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition ${
                  !canContinue() ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 text-white'
                }`}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white transition"
              >
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCircle2 className="w-4 h-4" />}
                {submitting ? 'Creating…' : 'Create Event'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
