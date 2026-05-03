import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Calendar, MapPin, Users,
  DollarSign, Globe, Lock, Tag, Image, Zap, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const steps = ['Type', 'Details', 'Budget', 'Guests', 'Review'];

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

export default function CreateEvent() {
  const { user, triggerKyc } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    type: null, typeGroup: null,
    name: '', date: '', time: '', venue: '', city: '',
    budget: '', currency: 'NGN',
    capacity: '', ticketed: false, ticketPrice: '',
    coverImage: null,
  });

  const isPublic = form.typeGroup === 'Public' || (form.typeGroup === 'Corporate' && form.type === 'conference');

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const next = () => {
    if (currentStep === 3 && isPublic && user?.kycTier < 1) {
      triggerKyc('publish_ticket');
      return;
    }
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
  };

  const prev = () => setCurrentStep(s => Math.max(0, s - 1));

  const handleSubmit = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to={user?.role === 'planner' ? '/planner' : user?.role === 'corporate' ? '/corporate' : '/dashboard'} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">
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

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

          {/* STEP 0: Event Type */}
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

          {/* STEP 1: Event Details */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Event details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event name *</label>
                  <input
                    type="text"
                    placeholder={form.type === 'wedding' ? 'e.g. Tunde & Bola – Dec 2026 Wedding' : 'Give your event a name'}
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />Date
                    </label>
                    <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                    <input type="time" value={form.time} onChange={e => update('time', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />Venue name
                  </label>
                  <input type="text" placeholder="e.g. Eko Hotel & Suites, Lagos" value={form.venue} onChange={e => update('venue', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City / Area</label>
                  <input type="text" placeholder="e.g. Victoria Island, Lagos" value={form.city} onChange={e => update('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>

                {/* Cover image upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Image className="w-3.5 h-3.5 inline mr-1" />Cover image (optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-brand-300 transition cursor-pointer">
                    <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-300 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Budget */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Budget & tickets</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total event budget</label>
                  <div className="flex gap-2">
                    <div className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-600 font-medium flex-shrink-0">₦</div>
                    <input type="number" placeholder="0" value={form.budget} onChange={e => update('budget', e.target.value)}
                      className="flex-grow px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">We'll track your spending against this ceiling.</p>
                </div>

                {isPublic && (
                  <div className="p-5 bg-brand-50 border border-brand-100 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-600" />
                      <span className="font-semibold text-brand-800 text-sm">Ticket Settings</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Users className="w-3.5 h-3.5 inline mr-1" />Capacity
                      </label>
                      <input type="number" placeholder="Max attendees" value={form.capacity} onChange={e => update('capacity', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ticket price (₦)</label>
                      <input type="number" placeholder="0 for free" value={form.ticketPrice} onChange={e => update('ticketPrice', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-700">
                        <strong>KYC required to publish:</strong> Selling tickets means we'll hold buyer funds. A quick BVN verification is required before you can go live.
                      </p>
                    </div>
                  </div>
                )}

                {/* Budget categories */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Budget categories (optional)</label>
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

          {/* STEP 3: Guests */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">
                {isPublic ? 'Audience & promotion' : 'Guest list & collaborators'}
              </h2>
              <div className="space-y-5">
                {!isPublic && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expected guest count</label>
                      <input type="number" placeholder="e.g. 220" value={form.capacity} onChange={e => update('capacity', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Import guest list</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Upload CSV', 'Google Contacts', 'Add manually'].map(opt => (
                          <button key={opt} className="p-3 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition text-center font-medium">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Invite collaborators</label>
                      <input type="text" placeholder="Enter email or +234 phone number"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 mb-2" />
                      <div className="flex gap-2 flex-wrap">
                        {['View-only', 'Guest mgmt', 'Vendor liaison', 'Budget', 'Full edit'].map(scope => (
                          <button key={scope} className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-brand-400 hover:text-brand-600 transition font-medium">
                            {scope}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {isPublic && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-sm text-green-700">
                      <strong>Your event page</strong> will be live at eventpark.com/events/[your-slug] after publishing.
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Event description (shown publicly)</label>
                      <textarea rows={4} placeholder="Tell your audience what to expect..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Social sharing</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Twitter / X', 'Instagram', 'WhatsApp link'].map(s => (
                          <label key={s} className="flex items-center gap-2 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-xs text-gray-600">{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {currentStep === 4 && (
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
                  ...(isPublic ? [{ label: 'Ticket price', value: form.ticketPrice ? `₦${parseInt(form.ticketPrice).toLocaleString()}` : 'Free' }] : []),
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2.5 border-b border-gray-100 text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>

              {isPublic && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">
                    This event will be saved as a draft. Complete BVN verification in your profile to publish and start selling tickets.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={next}
              disabled={currentStep === 0 && !form.type}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition ${
                currentStep === 0 && !form.type
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Create Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
