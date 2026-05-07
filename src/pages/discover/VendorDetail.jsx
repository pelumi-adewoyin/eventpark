import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, CheckCircle, Briefcase, Phone, Mail, Calendar, X, Loader2 } from 'lucide-react';
import { vendorDiscover, bookingsApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Booking Request Modal ─────────────────────────────────────────────────────

function BookingModal({ vendor, onClose }) {
  const [form, setForm] = useState({
    service_id: vendor.services?.[0]?.id || '',
    event_date: '',
    budget: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bookingsApi.create({
        vendor_id: vendor.id,
        service_id: form.service_id || undefined,
        event_date: form.event_date || undefined,
        total_amount: form.budget ? Math.round(parseFloat(form.budget) * 100) : 0,
        notes: form.notes || undefined,
      });
      setDone(true);
    } catch (err) {
      toast.error(err?.message || 'Failed to send booking request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-ep-navy">Request booking</h3>
            <p className="text-xs text-gray-400">{vendor.business_name}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-lg font-extrabold text-ep-navy mb-2">Request sent!</h3>
            <p className="text-sm text-gray-500 mb-6">
              {vendor.business_name} will respond within {vendor.services?.[0]?.response_time_hrs || 24} hours.
              You'll be notified when they reply.
            </p>
            <button type="button" onClick={onClose}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {vendor.services && vendor.services.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">Service</label>
                <select value={form.service_id} onChange={e => set('service_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
                  <option value="">Any / ask for quote</option>
                  {vendor.services.map(svc => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} — From ₦{(svc.price_from / 100).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ep-navy mb-1.5">Event date</label>
              <input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ep-navy mb-1.5">Your budget (₦) — optional</label>
              <input type="number" placeholder="e.g. 150000" value={form.budget} onChange={e => set('budget', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ep-navy mb-1.5">Message to vendor</label>
              <textarea placeholder="Tell them about your event — type, guest count, venue, any special requirements…"
                value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
            </div>

            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3">
              <p className="text-xs text-brand-700">
                💬 This is a <strong>quote request</strong> — no payment yet. {vendor.business_name} will respond and you can confirm the booking together.
              </p>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send booking request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function VendorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    vendorDiscover.get(id)
      .then(data => {
        if (!data || !data.id) {
          setNotFound(true);
        } else {
          setVendor(data);
        }
      })
      .catch(err => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookClick = () => {
    if (!user) {
      navigate(`/login?next=/discover/vendors/${id}`);
    } else {
      setShowBooking(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 animate-pulse">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-4 bg-gray-200 rounded w-28 mb-4" />
        </div>
        <div className="h-56 sm:h-72 bg-gray-200" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md -mt-10 relative z-10 p-6 mb-6">
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 flex-shrink-0" />
              <div className="flex-grow space-y-2">
                <div className="h-5 bg-gray-200 rounded w-48" />
                <div className="h-3 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-56" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !vendor) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor not found</h2>
          <Link to="/discover/vendors" className="text-brand-600 hover:underline">Back to Vendors</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/discover/vendors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Vendors
        </Link>
      </div>

      {/* Cover */}
      <div className="relative h-56 sm:h-72 overflow-hidden bg-gray-200">
        {vendor.cover_url && (
          <img src={vendor.cover_url} alt={vendor.business_name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md -mt-10 relative z-10 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {vendor.avatar_url ? (
              <img src={vendor.avatar_url} alt={vendor.business_name} className="w-20 h-20 rounded-2xl border-2 border-white shadow object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl border-2 border-white bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl shadow">
                {vendor.business_name?.[0] ?? 'V'}
              </div>
            )}
            <div className="flex-grow">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-gray-900">{vendor.business_name}</h1>
                {vendor.verified && (
                  <span className="flex items-center gap-1 text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <div className="text-sm text-brand-600 font-medium">{vendor.category}</div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                {(vendor.city || vendor.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[vendor.city, vendor.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {vendor.events_completed > 0 && (
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{vendor.events_completed} jobs done</span>
                )}
                {vendor.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {vendor.rating}{vendor.review_count > 0 ? ` (${vendor.review_count})` : ''}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleBookClick}
              className="flex-shrink-0 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
            >
              <Calendar className="w-4 h-4" />
              {user ? 'Book Service' : 'Sign in to Book'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {['about', 'services', 'portfolio'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                activeTab === tab ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'services' && vendor.services?.length > 0 && (
                <span className="ml-1.5 text-[10px] font-bold bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full">
                  {vendor.services.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
            <h2 className="font-bold text-gray-900 mb-3">About {vendor.business_name}</h2>
            {vendor.bio && <p className="text-gray-600 leading-relaxed mb-3">{vendor.bio}</p>}
            {vendor.tagline && <p className="text-gray-500 italic text-sm">{vendor.tagline}</p>}
            {!vendor.bio && !vendor.tagline && (
              <p className="text-gray-400 text-sm">No description added yet.</p>
            )}

            {/* Highlights */}
            {(vendor.highlight_1 || vendor.highlight_2 || vendor.highlight_3) && (
              <div className="mt-5 grid sm:grid-cols-3 gap-3">
                {[vendor.highlight_1, vendor.highlight_2, vendor.highlight_3].filter(Boolean).map((h, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-brand-700">{h}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {vendor.website && (
                <a href={vendor.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <Phone className="w-5 h-5 text-brand-600" />
                  <div>
                    <div className="text-xs text-gray-400">Website</div>
                    <div className="text-sm font-medium text-brand-600 truncate">{vendor.website}</div>
                  </div>
                </a>
              )}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-brand-600" />
                <div>
                  <div className="text-xs text-gray-400">Contact</div>
                  <div className="text-sm font-medium text-gray-800">
                    {user ? 'Request via booking →' : 'Sign in to view'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Services Offered</h2>
              <button type="button" onClick={handleBookClick}
                className="text-xs font-bold text-brand-600 hover:underline">
                Request booking →
              </button>
            </div>
            {vendor.services && vendor.services.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {vendor.services.map(svc => (
                  <div key={svc.id} className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl hover:border-brand-200 hover:bg-brand-50 transition-colors cursor-pointer"
                    onClick={handleBookClick}>
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{svc.name}</div>
                      {svc.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{svc.description}</p>}
                      <div className="text-xs text-brand-600 font-semibold mt-1">
                        {svc.pricing_model === 'negotiable' ? 'Negotiable' : `From ₦${(svc.price_from / 100).toLocaleString()}`}
                        {svc.unit ? ` / ${svc.unit}` : ''}
                      </div>
                      {svc.response_time_hrs > 0 && (
                        <div className="text-[10px] text-gray-400 mt-0.5">Responds within {svc.response_time_hrs}h</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No services listed yet.</p>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="mb-8">
            {vendor.portfolio && vendor.portfolio.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {vendor.portfolio.map((port) => (
                  <div key={port.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition">
                    <div className="h-48 overflow-hidden">
                      <img src={port.image_url} alt={port.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    {port.caption && (
                      <div className="p-3">
                        <p className="text-xs text-gray-500">{port.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400 font-medium">No portfolio items yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showBooking && vendor && (
        <BookingModal vendor={vendor} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
}
