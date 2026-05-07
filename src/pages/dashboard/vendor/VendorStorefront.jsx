import { useState } from 'react';
import {
  Upload, Globe, Phone, MapPin, Star, Camera,
  CheckCircle2, ArrowUpRight, Save, Eye,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

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

export default function VendorStorefront() {
  const { user, activeWorkspace } = useAuth();
  const businessName = activeWorkspace?.label || user?.businessName || 'Your Business';

  const [form, setForm] = useState({
    tagline: '',
    bio: '',
    website: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
    years_experience: '',
    events_completed: '',
    highlight_1: '',
    highlight_2: '',
    highlight_3: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-ep-navy">Storefront</h1>
          <p className="text-sm text-gray-400 mt-0.5">How customers see you on EventPark</p>
        </div>
        <div className="flex gap-2">
          <button type="button"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button type="button" onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors">
            {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : saved ? <CheckCircle2 className="w-3.5 h-3.5" />
              : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved!' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Cover photo + logo */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="h-36 bg-gradient-to-br from-brand-100 to-brand-200 relative flex items-center justify-center">
            <button type="button"
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 transition-colors">
              <Camera className="w-3.5 h-3.5" /> Change cover
            </button>
            <p className="text-brand-400 text-xs font-medium">Cover photo</p>
          </div>
          <div className="px-5 pb-5 -mt-8">
            <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-2xl mb-3 relative">
              🏪
              <button type="button"
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>
            <h2 className="text-base font-extrabold text-ep-navy">{businessName}</h2>
            <p className="text-xs text-gray-400">{user?.city || 'Lagos'} · {activeWorkspace?.vendorType === 'service' ? 'Service vendor' : 'Product vendor'}</p>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-ep-navy">Business info</h3>
          <Inp label="Tagline" placeholder="Nigeria's #1 wedding photography studio"
            value={form.tagline} onChange={e => set('tagline', e.target.value)} />
          <div>
            <Lbl>Bio / About</Lbl>
            <textarea placeholder="Tell event planners what makes you special — your experience, style, what you love about events…"
              value={form.bio} onChange={e => set('bio', e.target.value)} rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${form.bio.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                {form.bio.length}/500
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Years of experience" type="number" placeholder="5" value={form.years_experience}
              onChange={e => set('years_experience', e.target.value)} />
            <Inp label="Events completed" type="number" placeholder="200" value={form.events_completed}
              onChange={e => set('events_completed', e.target.value)} />
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-ep-navy">Key highlights</h3>
            <p className="text-xs text-gray-400 mt-0.5">3 bullet points that appear on your listing</p>
          </div>
          {[1, 2, 3].map(i => (
            <Inp key={i} label={`Highlight ${i}`}
              placeholder={['Same-day photo delivery', 'CAC-registered & insured', 'Portfolio of 500+ events'][i - 1]}
              value={form[`highlight_${i}`]} onChange={e => set(`highlight_${i}`, e.target.value)} />
          ))}
        </div>

        {/* Social links */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-ep-navy">Links & social</h3>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="url" placeholder="https://yourwebsite.com" value={form.website}
              onChange={e => set('website', e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
              <input placeholder="instagram_handle" value={form.instagram}
                onChange={e => set('instagram', e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input placeholder="WhatsApp number" value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
        </div>

        {/* Portfolio gallery placeholder */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-ep-navy">Portfolio gallery</h3>
            <button type="button"
              className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">
              <Upload className="w-3.5 h-3.5" /> Upload photos
            </button>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-300 cursor-pointer transition-colors">
            <Camera className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Drag and drop portfolio photos</p>
            <p className="text-xs text-gray-300 mt-1">JPEG, PNG · up to 20 photos · max 10MB each</p>
          </div>
        </div>

        {/* Storefront URL */}
        <div className="bg-ep-navy rounded-2xl p-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-white text-sm font-semibold">Your public storefront</p>
            <p className="text-white/50 text-xs mt-0.5">
              eventpark.ng/vendors/{user?.vendorId || 'your-slug'}
            </p>
          </div>
          <a href={`/vendors/${user?.vendorId || ''}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex-shrink-0">
            View <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
