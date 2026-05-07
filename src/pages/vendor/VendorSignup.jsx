import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, CheckCircle2, ChevronDown, Check, Loader2,
  MapPin, Store, Wrench,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth as authApi, users as usersApi, vendors as vendorsApi } from '../../lib/api';
import { EventParkLogo } from '../../components/Logo';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalisePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('234')) return '+' + digits;
  if (digits.startsWith('0')) return '+234' + digits.slice(1);
  return '+' + digits;
}

// ─── Business category lists ──────────────────────────────────────────────────

const SERVICE_CATEGORIES = [
  { id: 'photography', label: '📷 Photography' },
  { id: 'videography', label: '🎥 Videography' },
  { id: 'catering', label: '🍽️ Catering & Food' },
  { id: 'mc_hosting', label: '🎤 MC & Hosting' },
  { id: 'music_dj', label: '🎶 Music & DJ' },
  { id: 'decor_styling', label: '🌸 Décor & Styling' },
  { id: 'makeup_beauty', label: '💄 Makeup & Beauty' },
  { id: 'logistics_transport', label: '🚐 Logistics & Transport' },
  { id: 'security', label: '🛡️ Event Security' },
  { id: 'sound_lighting', label: '🔊 Sound & Lighting' },
  { id: 'event_planning', label: '📋 Event Planning & Coordination' },
  { id: 'animation_entertainment', label: '🎪 Animation & Entertainment' },
  { id: 'staffing_ushers', label: '👔 Staffing & Ushers' },
  { id: 'venue', label: '🏛️ Venue & Space Rental' },
  { id: 'live_band', label: '🎸 Live Band' },
  { id: 'other_service', label: '✨ Other Service' },
];

const PRODUCT_CATEGORIES = [
  { id: 'invites_stationery', label: '✉️ Invitations & Stationery' },
  { id: 'cakes_pastries', label: '🎂 Cakes & Pastries' },
  { id: 'flowers_bouquets', label: '🌹 Flowers & Bouquets' },
  { id: 'gifts_hampers', label: '🎁 Gifts & Hampers' },
  { id: 'party_supplies', label: '🎉 Party Supplies' },
  { id: 'fabric_asoebi', label: '👗 Fabric & Aso-Ebi' },
  { id: 'event_equipment', label: '🏕️ Event Equipment Rentals' },
  { id: 'clothing_accessories', label: '👒 Clothing & Accessories' },
  { id: 'printing_branding', label: '🖨️ Printing & Branding' },
  { id: 'food_drinks', label: '🥤 Food & Drinks (packaged)' },
  { id: 'beauty_products', label: '💅 Beauty Products' },
  { id: 'other_product', label: '📦 Other Product' },
];

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun',
  'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
];

// ─── Step sequencing ──────────────────────────────────────────────────────────

const STEPS = ['phone', 'phone_otp', 'v1_about_you', 'v2_business', 'v3_location', 'complete'];

function stepIndex(step) { return STEPS.indexOf(step); }

function progressPct(step) {
  const idx = stepIndex(step);
  return Math.round(((idx + 1) / STEPS.length) * 100);
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  const pct = progressPct(step);
  const idx = stepIndex(step);
  const labels = ['Phone', 'Verify', 'About you', 'Business', 'Location', 'Done'];
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-400">{labels[idx] || ''}</span>
        <span className="text-xs text-gray-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled, loading, variant = 'navy', className = '' }) {
  const styles = {
    navy: 'bg-ep-navy hover:bg-ep-navy-light text-white',
    orange: 'bg-ep-orange hover:bg-ep-orange-light text-white',
    outline: 'border-2 border-brand-200 text-brand-600 hover:bg-brand-50',
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading}
      className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 ${styles[variant]} ${className}`}>
      {loading
        ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        : children}
    </button>
  );
}

function Back({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
      <ArrowLeft className="w-4 h-4" /> Back
    </button>
  );
}

function Lbl({ children }) {
  return <label className="block text-xs font-semibold text-ep-navy mb-1.5">{children}</label>;
}

function Inp({ label, error, hint, className = '', ...props }) {
  return (
    <div>
      {label && <Lbl>{label}</Lbl>}
      <input {...props}
        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'} ${className}`} />
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Sel({ label, children, ...props }) {
  return (
    <div>
      {label && <Lbl>{label}</Lbl>}
      <div className="relative">
        <select {...props}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent appearance-none bg-white">
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function OTPBoxes({ value, onChange, onComplete }) {
  const refs = useRef([]);
  const digits = ((value || '') + '      ').slice(0, 6).split('');

  const handle = (i, e) => {
    if (e.key === 'Backspace') {
      const next = [...digits]; next[i] = ' ';
      const joined = next.join('').trimEnd();
      onChange(joined);
      if (i > 0 && !digits[i].trim()) refs.current[i - 1]?.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits]; next[i] = e.key;
    const joined = next.join('').replace(/ /g, '');
    onChange(joined);
    if (i < 5) refs.current[i + 1]?.focus();
    if (joined.length === 6) onComplete?.(joined);
  };

  const onPaste = (e) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(p);
    if (p.length === 6) onComplete?.(p);
    refs.current[Math.min(p.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-1.5 sm:gap-2">
      {digits.map((d, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} value={d.trim()} onChange={() => {}}
          onKeyDown={e => handle(i, e)} onPaste={onPaste}
          className="flex-1 min-w-0 h-11 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-inset focus:ring-brand-400 transition-all" />
      ))}
    </div>
  );
}

function Cooldown({ seconds, onResend }) {
  const [cd, setCd] = useState(seconds);
  useEffect(() => {
    if (cd <= 0) return;
    const t = setInterval(() => setCd(c => c - 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <button type="button" onClick={() => { if (cd <= 0) { setCd(30); onResend(); } }}
      className={`text-brand-600 font-medium text-sm ${cd > 0 ? 'opacity-40 cursor-not-allowed' : 'hover:underline'}`}>
      Resend code {cd > 0 ? `(${cd}s)` : ''}
    </button>
  );
}

// ─── Step: Phone ──────────────────────────────────────────────────────────────

function StepPhone({ data, onNext }) {
  const [phone, setPhone] = useState(data.phone || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const clean = phone.replace(/\s/g, '');
    if (!clean.match(/^0[789][01]\d{8}$/)) {
      setError('Enter a valid Nigerian number (e.g. 08012345678)');
      return;
    }
    setLoading(true);
    try {
      await authApi.requestOTPSignup(normalisePhone(clean));
      toast.success('SMS code sent');
      onNext({ phone: clean });
    } catch (err) {
      toast.error(err?.message || 'Could not send code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProgressBar step="phone" />
      <div className="text-xs font-bold text-ep-orange uppercase tracking-widest mb-2">Vendor sign-up · Step 1</div>
      <h1 className="text-xl sm:text-2xl font-extrabold text-ep-navy mb-1">Create your vendor account</h1>
      <p className="text-sm text-gray-400 mb-8">We'll send a verification code to your phone number.</p>
      <div className="space-y-4">
        <div>
          <Lbl>Phone number</Lbl>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-semibold text-ep-navy flex-shrink-0">
              🇳🇬 +234
            </div>
            <input type="tel" value={phone} placeholder="0801 234 5678" autoFocus
              onChange={e => { setPhone(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className={`flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 ${error ? 'border-red-300' : 'border-gray-200'}`} />
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <Btn onClick={submit} loading={loading}>Send verification code <ArrowRight className="w-4 h-4" /></Btn>
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/vendor/login" className="text-brand-600 font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Step: Phone OTP ──────────────────────────────────────────────────────────

function StepPhoneOTP({ data, onNext, onBack }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSignup } = useAuth();

  const submit = async (code) => {
    const val = code || otp;
    if (val.length !== 6) return;
    setLoading(true);
    try {
      await loginSignup(normalisePhone(data.phone), val);
      onNext({ phoneVerified: true });
    } catch (err) {
      toast.error(err?.message || 'Invalid code. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.requestOTPSignup(normalisePhone(data.phone));
      toast('New code sent', { icon: '📱' });
    } catch {
      toast.error('Could not resend. Try again.');
    }
  };

  return (
    <div>
      <ProgressBar step="phone_otp" />
      <Back onClick={onBack} />
      <div className="text-xs font-bold text-ep-orange uppercase tracking-widest mb-2">Vendor sign-up · Step 1</div>
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Verify your phone</h1>
      <p className="text-sm text-gray-400 mb-8">
        We sent a 6-digit code to <span className="font-semibold text-ep-navy">{data.phone}</span>
      </p>
      <div className="space-y-5">
        <OTPBoxes value={otp} onChange={setOtp} onComplete={submit} />
        <Btn onClick={() => submit()} loading={loading} disabled={otp.length !== 6}>
          Verify &amp; continue <ArrowRight className="w-4 h-4" />
        </Btn>
        <div className="flex justify-between">
          <Cooldown seconds={30} onResend={handleResend} />
          <button type="button" onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">
            Wrong number? Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step V.1: About You ──────────────────────────────────────────────────────

function StepV1AboutYou({ data, onNext, onBack }) {
  const [form, setForm] = useState({
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email || '',
  });
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim()) errs.last_name = 'Required';
    if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <div>
      <ProgressBar step="v1_about_you" />
      <Back onClick={onBack} />
      <div className="text-xs font-bold text-ep-orange uppercase tracking-widest mb-2">Vendor sign-up · Step 2</div>
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Tell us about you</h1>
      <p className="text-sm text-gray-400 mb-8">Your personal details for your vendor account.</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Inp label="First name" placeholder="Ada" value={form.first_name}
            error={errors.first_name}
            onChange={e => set('first_name', e.target.value)} autoFocus />
          <Inp label="Last name" placeholder="Okonkwo" value={form.last_name}
            error={errors.last_name}
            onChange={e => set('last_name', e.target.value)} />
        </div>
        <Inp label={<>Email address <span className="text-gray-400 font-normal">(optional)</span></>}
          type="email" placeholder="you@email.com"
          value={form.email} error={errors.email}
          hint="Used for order receipts and booking notifications"
          onChange={e => set('email', e.target.value)} />
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-700 font-medium">
            📱 Phone <span className="font-bold text-blue-900">{data.phone}</span> verified ✓
          </p>
        </div>
        <Btn onClick={() => { if (validate()) onNext(form); }}>
          Continue <ArrowRight className="w-4 h-4" />
        </Btn>
      </div>
    </div>
  );
}

// ─── Step V.2: About Your Business ───────────────────────────────────────────

function StepV2Business({ data, onNext, onBack }) {
  const [form, setForm] = useState({
    business_name: data.business_name || '',
    is_registered: data.is_registered ?? null,   // true | false
    cac_rc_number: data.cac_rc_number || '',
    vendor_type: data.vendor_type || '',          // 'service' | 'product'
    business_category: data.business_category || '',
  });
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const categories = form.vendor_type === 'service' ? SERVICE_CATEGORIES
    : form.vendor_type === 'product' ? PRODUCT_CATEGORIES
    : [];

  const validate = () => {
    const errs = {};
    if (!form.business_name.trim()) errs.business_name = 'Required';
    if (form.is_registered === null) errs.is_registered = 'Please select one';
    if (!form.vendor_type) errs.vendor_type = 'Please select one';
    if (!form.business_category) errs.business_category = 'Please select your primary category';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <div>
      <ProgressBar step="v2_business" />
      <Back onClick={onBack} />
      <div className="text-xs font-bold text-ep-orange uppercase tracking-widest mb-2">Vendor sign-up · Step 3</div>
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">About your business</h1>
      <p className="text-sm text-gray-400 mb-8">Help event planners find and trust you.</p>
      <div className="space-y-5">

        {/* Business name */}
        <Inp label="Business name" placeholder="Ada Photography Studio"
          value={form.business_name} error={errors.business_name}
          onChange={e => set('business_name', e.target.value)} autoFocus />

        {/* CAC registered? */}
        <div>
          <Lbl>Is your business CAC-registered?</Lbl>
          {errors.is_registered && <p className="text-xs text-red-500 mb-1">{errors.is_registered}</p>}
          <div className="grid grid-cols-2 gap-3">
            {[{ val: true, label: 'Yes', sub: 'I have a CAC number' }, { val: false, label: 'No', sub: "I'm not registered" }].map(o => (
              <button key={String(o.val)} type="button" onClick={() => set('is_registered', o.val)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${form.is_registered === o.val ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-sm font-bold text-ep-navy">{o.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{o.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* CAC number — conditional */}
        {form.is_registered === true && (
          <Inp label="CAC RC Number"
            placeholder="RC1234567"
            hint="Enter your Corporate Affairs Commission registration number"
            value={form.cac_rc_number}
            onChange={e => set('cac_rc_number', e.target.value)} />
        )}

        {/* Vendor type */}
        <div>
          <Lbl>What do you primarily offer?</Lbl>
          {errors.vendor_type && <p className="text-xs text-red-500 mb-1">{errors.vendor_type}</p>}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => { set('vendor_type', 'service'); set('business_category', ''); }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${form.vendor_type === 'service' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <Wrench className={`w-5 h-5 mb-2 ${form.vendor_type === 'service' ? 'text-brand-600' : 'text-gray-400'}`} />
              <div className="text-sm font-bold text-ep-navy">Services</div>
              <div className="text-xs text-gray-400 mt-0.5">Photography, catering, DJ, décor…</div>
            </button>
            <button type="button" onClick={() => { set('vendor_type', 'product'); set('business_category', ''); }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${form.vendor_type === 'product' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <Store className={`w-5 h-5 mb-2 ${form.vendor_type === 'product' ? 'text-brand-600' : 'text-gray-400'}`} />
              <div className="text-sm font-bold text-ep-navy">Products</div>
              <div className="text-xs text-gray-400 mt-0.5">Cakes, flowers, invites, hampers…</div>
            </button>
          </div>
        </div>

        {/* Business category */}
        {form.vendor_type && (
          <div>
            <Lbl>Primary category</Lbl>
            {errors.business_category && <p className="text-xs text-red-500 mb-1">{errors.business_category}</p>}
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {categories.map(cat => (
                <button key={cat.id} type="button" onClick={() => set('business_category', cat.id)}
                  className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold text-left transition-all ${form.business_category === cat.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Btn onClick={() => { if (validate()) onNext(form); }}>
          Continue <ArrowRight className="w-4 h-4" />
        </Btn>
      </div>
    </div>
  );
}

// ─── Step V.3: Location ───────────────────────────────────────────────────────

function StepV3Location({ data, onNext, onBack, loading: submitting }) {
  const [form, setForm] = useState({
    address: data.address || '',
    state: data.state || '',
    city: data.city || '',
    postal_code: data.postal_code || '',
  });
  const [agree_terms, setAgreeTerms] = useState(false);
  const [agree_escrow, setAgreeEscrow] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const errs = {};
    if (!form.state) errs.state = 'Please select your state';
    if (!form.city.trim()) errs.city = 'Required';
    if (!agree_terms) errs.terms = 'You must accept the Terms of Service';
    if (!agree_escrow) errs.escrow = 'You must acknowledge the escrow policy';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <div>
      <ProgressBar step="v3_location" />
      <Back onClick={onBack} />
      <div className="text-xs font-bold text-ep-orange uppercase tracking-widest mb-2">Vendor sign-up · Step 4</div>
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Where is your business based?</h1>
      <p className="text-sm text-gray-400 mb-8">Used to match you with nearby event planners.</p>
      <div className="space-y-4">

        {/* Business address */}
        <div>
          <Lbl>Business address <span className="text-gray-400 font-normal">(optional)</span></Lbl>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="5 Adeola Odeku, Victoria Island" value={form.address}
              onChange={e => set('address', e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>

        {/* State + City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Lbl>State</Lbl>
            {errors.state && <p className="text-xs text-red-500 mb-1">{errors.state}</p>}
            <div className="relative">
              <select value={form.state} onChange={e => set('state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none bg-white">
                <option value="">Select state…</option>
                {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <Inp label="City" placeholder="Lagos" value={form.city}
            error={errors.city}
            onChange={e => set('city', e.target.value)} />
        </div>

        {/* Postal code */}
        <Inp label={<>Postal code <span className="text-gray-400 font-normal">(optional)</span></>}
          placeholder="101001" value={form.postal_code}
          onChange={e => set('postal_code', e.target.value)} />

        {/* Agreements */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${agree_terms ? 'border-brand-500 bg-brand-500' : 'border-gray-300 group-hover:border-gray-400'}`}
                onClick={() => setAgreeTerms(v => !v)}>
                {agree_terms && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-gray-600">
                I agree to the EventPark{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline font-medium">
                  Vendor Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline font-medium">
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-500 mt-1 ml-8">{errors.terms}</p>}
          </div>
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${agree_escrow ? 'border-brand-500 bg-brand-500' : 'border-gray-300 group-hover:border-gray-400'}`}
                onClick={() => setAgreeEscrow(v => !v)}>
                {agree_escrow && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-gray-600">
                I understand that 65% of order payments are held in escrow until the customer confirms delivery or 7 days elapse
              </span>
            </label>
            {errors.escrow && <p className="text-xs text-red-500 mt-1 ml-8">{errors.escrow}</p>}
          </div>
        </div>

        <Btn onClick={() => { if (validate()) onNext({ ...form, agree_terms, agree_escrow }); }}
          loading={submitting}>
          Create my vendor account <ArrowRight className="w-4 h-4" />
        </Btn>
      </div>
    </div>
  );
}

// ─── Step: Complete ───────────────────────────────────────────────────────────

function StepComplete({ data }) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-400" />
      </div>
      <h1 className="text-2xl font-extrabold text-ep-navy mb-2">Welcome to EventPark!</h1>
      <p className="text-gray-500 text-sm mb-1">
        <span className="font-semibold text-ep-navy">{data.business_name}</span> is now registered.
      </p>
      <p className="text-gray-400 text-sm mb-6">Setting up your vendor dashboard…</p>
      <div className="flex justify-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Left panel ───────────────────────────────────────────────────────────────

const PANEL = {
  tag: 'For vendors & suppliers',
  headline: 'Reach thousands\nof event planners.',
  sub: 'Join Nigeria\'s fastest-growing vendor marketplace. Get discovered, get booked, get paid — all through one dashboard.',
  stats: ['12K+ Planners', 'Escrow protection', '5% platform fee'],
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VendorSignup() {
  const [step, setStep] = useState('phone');
  const [history, setHistory] = useState(['phone']);
  const [data, setData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const update = (patch) => setData(prev => ({ ...prev, ...patch }));

  const goNext = (nextStep, patch = {}) => {
    update(patch);
    setHistory(h => [...h, nextStep]);
    setStep(nextStep);
  };

  const goBack = () => {
    if (history.length <= 1) return;
    const h = history.slice(0, -1);
    setHistory(h);
    setStep(h[h.length - 1]);
  };

  const handlePhone = (patch) => goNext('phone_otp', patch);
  const handlePhoneOTP = (patch) => goNext('v1_about_you', patch);
  const handleV1 = (patch) => goNext('v2_business', patch);
  const handleV2 = (patch) => goNext('v3_location', patch);

  const handleV3 = async (patch) => {
    const final = { ...data, ...patch };
    update(patch);
    setSubmitting(true);

    try {
      // 1. Complete onboarding — sets role = 'vendor'
      await usersApi.completeOnboarding({
        role: 'vendor',
        full_name: [final.first_name, final.last_name].filter(Boolean).join(' ') || undefined,
        email: final.email || undefined,
      });

      // 2. Create vendor profile
      await vendorsApi.create({
        business_name: final.business_name,
        vendor_type: final.vendor_type,
        business_category: final.business_category,
        is_registered: final.is_registered,
        cac_rc_number: final.is_registered ? (final.cac_rc_number || undefined) : undefined,
        address: final.address || undefined,
        state: final.state || undefined,
        city: final.city || undefined,
        postal_code: final.postal_code || undefined,
      });

      await refreshUser();

      setStep('complete');
      setHistory(h => [...h, 'complete']);

      // Navigate to vendor dashboard after brief delay
      setTimeout(() => navigate('/dashboard'), 2200);
    } catch (err) {
      console.error('Vendor signup error:', err);
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return <StepPhone data={data} onNext={handlePhone} />;
      case 'phone_otp':
        return <StepPhoneOTP data={data} onNext={handlePhoneOTP} onBack={goBack} />;
      case 'v1_about_you':
        return <StepV1AboutYou data={data} onNext={handleV1} onBack={goBack} />;
      case 'v2_business':
        return <StepV2Business data={data} onNext={handleV2} onBack={goBack} />;
      case 'v3_location':
        return <StepV3Location data={data} onNext={handleV3} onBack={goBack} loading={submitting} />;
      case 'complete':
        return <StepComplete data={data} />;
      default:
        return <StepPhone data={data} onNext={handlePhone} />;
    }
  };

  return (
    <div className="min-h-screen bg-ep-blue-light flex pt-16 overflow-x-hidden">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between px-12 py-14 bg-ep-navy relative overflow-hidden w-[380px] flex-shrink-0">
        <div className="absolute inset-0 dot-pattern-white opacity-20" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-brand-600 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-10 right-0 w-60 h-60 bg-ep-orange rounded-full opacity-10 blur-3xl" />

        <div className="relative"><EventParkLogo light size="md" /></div>

        <div className="relative">
          <span className="inline-block text-xs font-bold text-ep-orange/80 uppercase tracking-widest mb-4">
            {PANEL.tag}
          </span>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4 whitespace-pre-line">
            {PANEL.headline}
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-8">{PANEL.sub}</p>
          <div className="flex flex-wrap gap-2">
            {PANEL.stats.map(s => (
              <span key={s} className="bg-white/10 border border-white/10 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full">
                {s}
              </span>
            ))}
          </div>

          {/* Tier preview */}
          <div className="mt-8 space-y-2">
            {[
              { tier: 'Tier 1', desc: 'List up to 1 service/product · Free', color: 'bg-gray-500/20 text-gray-300' },
              { tier: 'Tier 2', desc: 'Unlimited listings · Verified badge', color: 'bg-brand-500/20 text-brand-300' },
              { tier: 'Tier 3', desc: 'Priority search · Bank payout T+1', color: 'bg-ep-orange/20 text-ep-orange' },
            ].map(t => (
              <div key={t.tier} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${t.color.split(' ')[0]} border border-white/5`}>
                <span className={`text-xs font-bold ${t.color.split(' ')[1]}`}>{t.tier}</span>
                <span className="text-white/40 text-xs">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-white/20 text-xs">Free to join · No monthly fee · 5% per transaction</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 min-w-0 flex items-start justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-lg">
          <div className="flex justify-center mb-6 lg:hidden">
            <EventParkLogo size="md" />
          </div>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
