import { useState, useEffect } from 'react';
import {
  Plus, Search, Wrench, Edit2, Eye, EyeOff, Trash2,
  ArrowRight, Upload, ChevronDown, X, Check, Clock, Loader2,
} from 'lucide-react';
import { vendorDash } from '../../../lib/api';
import toast from 'react-hot-toast';

const SERVICE_CATEGORIES = [
  { id: 'photography', label: 'Photography' },
  { id: 'videography', label: 'Videography' },
  { id: 'catering', label: 'Catering & Food' },
  { id: 'mc_hosting', label: 'MC & Hosting' },
  { id: 'music_dj', label: 'Music & DJ' },
  { id: 'decor_styling', label: 'Décor & Styling' },
  { id: 'makeup_beauty', label: 'Makeup & Beauty' },
  { id: 'logistics_transport', label: 'Logistics & Transport' },
  { id: 'sound_lighting', label: 'Sound & Lighting' },
  { id: 'event_planning', label: 'Event Planning' },
  { id: 'animation_entertainment', label: 'Animation & Entertainment' },
  { id: 'staffing_ushers', label: 'Staffing & Ushers' },
  { id: 'venue', label: 'Venue & Space' },
  { id: 'live_band', label: 'Live Band' },
  { id: 'other_service', label: 'Other' },
];

const PRICING_MODELS = [
  { id: 'fixed', label: 'Fixed price', desc: 'Set a clear flat rate' },
  { id: 'starting_from', label: 'Starting from', desc: 'Minimum price — quote for exact' },
  { id: 'per_hour', label: 'Per hour', desc: 'Hourly billing' },
  { id: 'per_day', label: 'Per day', desc: 'Daily billing' },
  { id: 'negotiable', label: 'Negotiable', desc: 'Customer sends offer' },
];

function Lbl({ children }) {
  return <label className="block text-xs font-semibold text-ep-navy mb-1.5">{children}</label>;
}

function Inp({ label, error, ...props }) {
  return (
    <div>
      {label && <Lbl>{label}</Lbl>}
      <input {...props}
        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 ${error ? 'border-red-300' : 'border-gray-200'}`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Add Service Modal ────────────────────────────────────────────────────────

function AddServiceModal({ onClose, onSave }) {
  const [step, setStep] = useState(1); // 1: basics, 2: pricing, 3: availability
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', description: '',
    pricing_model: '', base_price: '', price_unit: '',
    min_notice_hours: '24', max_advance_days: '90',
    response_time: '2',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const steps = [
    { num: 1, label: 'Basics' },
    { num: 2, label: 'Pricing' },
    { num: 3, label: 'Availability' },
  ];

  const canProceed = () => {
    if (step === 1) return form.name && form.category;
    if (step === 2) return form.pricing_model && (form.pricing_model === 'negotiable' || form.base_price);
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const priceFrom = form.pricing_model === 'negotiable' ? 0 : Math.round(parseFloat(form.base_price || 0) * 100);
      const body = {
        name: form.name,
        category: form.category || null,
        description: form.description || null,
        price_from: priceFrom,
        pricing_model: form.pricing_model,
        unit: form.price_unit || null,
        min_notice_hours: parseInt(form.min_notice_hours) || 24,
        max_advance_days: parseInt(form.max_advance_days) || 90,
        response_time_hrs: parseInt(form.response_time) || 2,
      };
      const newService = await vendorDash.createService(body);
      toast.success('Service added!');
      onSave(newService);
    } catch (err) {
      if (err?.status === 403) {
        toast.error('Tier 1 limit: upgrade to add more services');
      } else {
        toast.error(err?.message || 'Failed to add service');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-ep-navy">Add service</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 py-3 gap-2 border-b border-gray-100">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step >= s.num ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-ep-navy' : 'text-gray-400'}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${step > s.num ? 'bg-brand-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <>
              <Inp label="Service name" placeholder="Professional wedding photography" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
              <div>
                <Lbl>Category</Lbl>
                <div className="relative">
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none bg-white">
                    <option value="">Select category…</option>
                    {SERVICE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <Lbl>Description</Lbl>
                <textarea placeholder="Describe your service — what's included, your style, experience, unique value…"
                  value={form.description} onChange={e => set('description', e.target.value)} rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Lbl>Pricing model</Lbl>
                <div className="space-y-2">
                  {PRICING_MODELS.map(m => (
                    <button key={m.id} type="button" onClick={() => set('pricing_model', m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${form.pricing_model === m.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${form.pricing_model === m.id ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                        {form.pricing_model === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ep-navy">{m.label}</div>
                        <div className="text-xs text-gray-400">{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {form.pricing_model && form.pricing_model !== 'negotiable' && (
                <div className="grid grid-cols-2 gap-3">
                  <Inp label={form.pricing_model === 'fixed' ? 'Price (₦)' : form.pricing_model === 'starting_from' ? 'Starting from (₦)' : 'Rate (₦)'}
                    type="number" placeholder="150000" value={form.base_price} onChange={e => set('base_price', e.target.value)} />
                  {(form.pricing_model === 'per_hour' || form.pricing_model === 'per_day') && (
                    <Inp label="Min hours/days" type="number" placeholder="4" value={form.price_unit} onChange={e => set('price_unit', e.target.value)} />
                  )}
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Lbl>Min notice (hours)</Lbl>
                  <div className="relative">
                    <select value={form.min_notice_hours} onChange={e => set('min_notice_hours', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none bg-white">
                      {[12, 24, 48, 72, 96].map(h => <option key={h} value={h}>{h}h</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <Inp label="Response time (hrs)" type="number" placeholder="2" value={form.response_time} onChange={e => set('response_time', e.target.value)} />
              </div>
              <div>
                <Lbl>Max advance booking (days)</Lbl>
                <div className="relative">
                  <select value={form.max_advance_days} onChange={e => set('max_advance_days', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none bg-white">
                    {[30, 60, 90, 180, 365].map(d => <option key={d} value={d}>{d} days</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-700 font-medium">📅 Use the Calendar page to block specific dates after publishing.</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSave}
              disabled={saving || !form.name}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish service'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Service card ─────────────────────────────────────────────────────────────

function ServiceCard({ service, onToggle, onDelete }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const priceDisplay = () => {
    const naira = (service.price_from / 100).toLocaleString();
    switch (service.pricing_model) {
      case 'fixed': return `₦${naira}`;
      case 'starting_from': return `From ₦${naira}`;
      case 'per_hour': return `₦${naira}/hr`;
      case 'per_day': return `₦${naira}/day`;
      case 'negotiable': return 'Negotiable';
      default: return service.price_from > 0 ? `₦${naira}` : '—';
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(service.id);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this service? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDelete(service.id);
    } finally {
      setDeleting(false);
    }
  };

  const catLabel = SERVICE_CATEGORIES.find(c => c.id === service.category)?.label || service.category;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-ep-navy">{service.name}</h3>
          {catLabel && <p className="text-xs text-gray-400 mt-0.5">{catLabel}</p>}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {service.is_active ? 'Live' : 'Draft'}
        </span>
      </div>
      {service.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{service.description}</p>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm font-extrabold text-ep-navy">{priceDisplay()}</span>
        <div className="flex gap-1">
          <button type="button" onClick={handleToggle} disabled={toggling}
            title={service.is_active ? 'Hide service' : 'Make live'}
            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50">
            {toggling ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" /> : service.is_active ? <EyeOff className="w-3.5 h-3.5 text-gray-500" /> : <Eye className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting}
            title="Delete service"
            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" /> : <Trash2 className="w-3.5 h-3.5 text-gray-500" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function VendorServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  // Load from API on mount
  useEffect(() => {
    vendorDash.listServices()
      .then(data => setServices(data || []))
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (newService) => {
    setServices(prev => [newService, ...prev]);
    setShowModal(false);
  };

  const handleToggle = async (id) => {
    try {
      const result = await vendorDash.toggleService(id);
      setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: result.is_active } : s));
    } catch {
      toast.error('Failed to update service');
    }
  };

  const handleDelete = async (id) => {
    try {
      await vendorDash.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success('Service deleted');
    } catch {
      toast.error('Failed to delete service');
    }
  };

  const filtered = services.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-ep-navy">Services</h1>
          <p className="text-sm text-gray-400 mt-0.5">{services.length} service{services.length !== 1 ? 's' : ''} listed</p>
        </div>
        <button type="button" onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add service
        </button>
      </div>

      {services.length > 0 && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search services…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Wrench className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">No services yet</p>
          <p className="text-xs text-gray-300 mt-1">Add your first service to get discovered by event planners.</p>
          <button type="button" onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add first service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <ServiceCard key={s.id} service={s} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && <AddServiceModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
