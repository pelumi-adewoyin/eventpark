import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, CheckCircle2, Upload, ChevronDown,
  Check, Shield, Building2, Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth as authApi } from '../../lib/api';
import { EventParkLogo } from '../../components/Logo';
import toast from 'react-hot-toast';

const DEMO_PHONE = '+2340000000000';
const DEMO_OTP = '000000';

// Normalise phone: 08012345678 or +2348012345678 → +234...
function normalisePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('234')) return '+' + digits;
  if (digits.startsWith('0')) return '+234' + digits.slice(1);
  return '+' + digits;
}

// ─── Step sequencing ──────────────────────────────────────────────────────────

const PERSONA_FIRST = {
  diy_personal: 'diy_intent',
  diy_public: 'pub_basics',
  event_planner: 'plan_biz',
  corporate: 'corp_company',
};

function getNext(step, data) {
  const map = {
    email: 'email_otp', email_otp: 'phone',
    phone: 'phone_otp', phone_otp: 'name',
    name: 'role',
    role: PERSONA_FIRST[data.role] || null,
    diy_intent: data.diy_intent === 'exploring' ? null : 'diy_basics',
    diy_basics: 'diy_needs', diy_needs: null,
    pub_basics: 'pub_tickets', pub_tickets: 'pub_needs',
    pub_needs: 'pub_kyc', pub_kyc: null,
    plan_biz: 'plan_brand', plan_brand: 'plan_pricing',
    plan_pricing: 'plan_needs', plan_needs: 'plan_team', plan_team: null,
    corp_company: 'corp_role', corp_role: 'corp_kyb',
    corp_kyb: 'corp_events', corp_events: 'corp_team', corp_team: null,
  };
  return map[step] ?? null;
}

function stepGroup(step) {
  if (['email', 'email_otp'].includes(step)) return 1;
  if (['phone', 'phone_otp'].includes(step)) return 2;
  if (step === 'name') return 3;
  if (step === 'role') return 4;
  return 5;
}

// ─── Left panel content ───────────────────────────────────────────────────────

const PANELS = {
  default:       { tag: 'Join 2M+ event makers',    headline: 'Plan Smarter.\nCelebrate Bigger.', sub: "Africa's #1 event infrastructure platform — guests, vendors, payments, and check-in. One place.", stats: ['50K+ Events', '12K+ Vendors', '36 States'] },
  diy_personal:  { tag: 'Personal events',           headline: 'Every detail.\nPerfectly planned.', sub: 'Manage your vendor team, track your budget, send invites, and run smooth check-in — all from one dashboard.', stats: ['Wedding tools', 'Guest RSVP', 'Vendor booking'] },
  diy_public:    { tag: 'Public events',             headline: 'Sell tickets.\nPack the room.', sub: 'Custom landing pages, tiered ticketing, QR check-in, and fast payouts to your bank.', stats: ['Ticket sales', 'QR check-in', 'Fast payouts'] },
  event_planner: { tag: 'For event planners',        headline: 'Manage every\nclient. One place.', sub: 'Cross-client dashboard, vendor rolodex, branded check-in, and client invoicing built for planning businesses.', stats: ['Multi-client', 'Vendor rolodex', 'Invoicing'] },
  corporate:     { tag: 'Corporate events',          headline: 'Enterprise-grade\nevent management.', sub: 'Approval workflows, audit trails, team collaboration, and corporate wallet for seamless company events.', stats: ['Approvals', 'Audit trail', 'Team tools'] },
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function ProgressBar({ group }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-400">Step {group} of 5</span>
        <span className="text-xs text-gray-400">{group * 20}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${group * 20}%` }} />
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
        <select {...props} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent appearance-none bg-white">
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function RadioCard({ icon, label, sub, selected, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
        disabled ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' :
        selected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}>
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ep-navy text-sm">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

function CheckCard({ icon, label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${selected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-ep-navy flex-1">{label}</span>
      <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${selected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

function SkipLink({ onClick, label = 'Skip for now' }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
      {label}
    </button>
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

// ─── Universal steps ──────────────────────────────────────────────────────────

function StepEmail({ onNext, onDemo }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const submit = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setError('Enter a valid email address'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    toast.success('Verification code sent to your email');
    toast('Demo mode — enter any 6 digits as OTP', { icon: '🔑', duration: 12000 });
    onNext({ email: email.toLowerCase() });
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await onDemo();
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div>
      <ProgressBar group={1} />
      <h1 className="text-xl sm:text-2xl font-extrabold text-ep-navy mb-1">Create your account</h1>
      <p className="text-sm text-gray-400 mb-6 sm:mb-8">We'll start with your email. No spam, ever.</p>
      <div className="space-y-4">
        <Inp label="Email address" type="email" placeholder="you@email.com" value={email} error={error}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
        <Btn onClick={submit} loading={loading}>Continue <ArrowRight className="w-4 h-4" /></Btn>

        {onDemo && (
          <>
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-200" />
              <span className="mx-3 text-xs text-gray-400 font-medium">or</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>
            <button type="button" onClick={handleDemo} disabled={demoLoading}
              className="w-full border-2 border-dashed border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold py-3 rounded-2xl transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Try Demo'}
            </button>
          </>
        )}

        <p className="text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-brand-600 font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}

function StepEmailOTP({ data, onNext, onBack }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (code) => {
    const val = code || otp;
    if (val.length !== 6) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    onNext({ emailVerified: true });
  };

  return (
    <div>
      <ProgressBar group={1} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Check your email</h1>
      <p className="text-sm text-gray-400 mb-2">We sent a 6-digit code to <span className="font-semibold text-ep-navy">{data.email}</span></p>
      <p className="text-xs text-brand-600 bg-brand-50 rounded-xl px-3 py-2 mb-8">🔑 Demo mode — enter any 6 digits to continue</p>
      <div className="space-y-5">
        <OTPBoxes value={otp} onChange={setOtp} onComplete={submit} />
        <Btn onClick={() => submit()} loading={loading} disabled={otp.length !== 6}>
          Verify email <ArrowRight className="w-4 h-4" />
        </Btn>
        <div className="flex justify-between">
          <Cooldown seconds={30} onResend={() => toast('New code sent', { icon: '📧' })} />
          <button type="button" onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">Wrong email? Edit</button>
        </div>
      </div>
    </div>
  );
}

function StepPhone({ data, onNext, onBack }) {
  const [phone, setPhone] = useState(data.phone || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const clean = phone.replace(/\s/g, '');
    if (!clean.match(/^0[789][01]\d{8}$/)) { setError('Enter a valid Nigerian number (e.g. 08012345678)'); return; }
    setLoading(true);
    try {
      await authApi.requestOTP(normalisePhone(clean));
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
      <ProgressBar group={2} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Add your phone number</h1>
      <p className="text-sm text-gray-400 mb-8">Used for RSVP confirmations, day-of reminders, and account recovery.</p>
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
        <Btn onClick={submit} loading={loading}>Send code <ArrowRight className="w-4 h-4" /></Btn>
      </div>
    </div>
  );
}

function StepPhoneOTP({ data, onNext, onBack }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const submit = async (code) => {
    const val = code || otp;
    if (val.length !== 6) return;
    setLoading(true);
    try {
      await login(normalisePhone(data.phone), val);
      onNext({ phoneVerified: true });
    } catch (err) {
      toast.error(err?.message || 'Invalid code. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.requestOTP(normalisePhone(data.phone));
      toast('New code sent', { icon: '📱' });
    } catch {
      toast.error('Could not resend. Try again.');
    }
  };

  return (
    <div>
      <ProgressBar group={2} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Verify your phone</h1>
      <p className="text-sm text-gray-400 mb-8">We sent a 6-digit code to <span className="font-semibold text-ep-navy">{data.phone}</span></p>
      <div className="space-y-5">
        <OTPBoxes value={otp} onChange={setOtp} onComplete={submit} />
        <Btn onClick={() => submit()} loading={loading} disabled={otp.length !== 6}>
          Verify phone <ArrowRight className="w-4 h-4" />
        </Btn>
        <div className="flex justify-between">
          <Cooldown seconds={30} onResend={handleResend} />
          <button type="button" onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">Wrong number? Edit</button>
        </div>
      </div>
    </div>
  );
}

function StepName({ data, onNext, onBack }) {
  const [firstName, setFirst] = useState(data.firstName || '');
  const [lastName, setLast] = useState(data.lastName || '');

  return (
    <div>
      <ProgressBar group={3} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">What should we call you?</h1>
      <p className="text-sm text-gray-400 mb-8">This is how collaborators and guests will see you.</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <Inp label="First name" placeholder="Ada" value={firstName} onChange={e => setFirst(e.target.value)} autoFocus />
          <Inp label="Last name" placeholder="Okonkwo" value={lastName} onChange={e => setLast(e.target.value)} />
        </div>
        <div>
          <Lbl>Profile photo <span className="text-gray-400 font-normal">(optional)</span></Lbl>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-300 cursor-pointer transition-colors">
            <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Drag a photo here or <span className="text-brand-600 font-medium">browse</span></p>
            <p className="text-xs text-gray-300 mt-1">JPEG or PNG · max 4MB</p>
          </div>
        </div>
        <Btn onClick={() => onNext({ firstName: firstName.trim(), lastName: lastName.trim() })} disabled={!firstName.trim() || !lastName.trim()}>
          Continue <ArrowRight className="w-4 h-4" />
        </Btn>
        <SkipLink onClick={() => onNext({ firstName: firstName.trim() || 'User', lastName: lastName.trim() || '' })} label="Skip photo for now" />
      </div>
    </div>
  );
}

function StepRole({ data, onNext, onBack }) {
  const [selected, setSelected] = useState(data.role || '');
  const roles = [
    { id: 'diy_personal', icon: '🎉', label: 'Planning a personal event', sub: 'Wedding, birthday, naming, anniversary…' },
    { id: 'diy_public',   icon: '🎤', label: 'Hosting a public/ticketed event', sub: 'Concert, workshop, pop-up, paid meet-up' },
    { id: 'event_planner',icon: '📋', label: 'Managing events for clients', sub: 'I run an event-planning business' },
    { id: 'corporate',    icon: '🏢', label: 'Planning events for my company', sub: 'Retreats, conferences, EOY parties' },
    { id: 'vendor',       icon: '🛍️', label: "I'm a vendor / supplier", sub: 'Coming soon', disabled: true },
  ];

  const pick = (id, disabled) => {
    if (disabled) { toast('Vendor onboarding launches Q3 2026. Join the waitlist?', { icon: '🛍️' }); return; }
    setSelected(id);
  };

  return (
    <div>
      <ProgressBar group={4} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">What brings you to Event Park?</h1>
      <p className="text-sm text-gray-400 mb-8">Pick the one that fits best — you can add more later.</p>
      <div className="space-y-2.5 mb-6">
        {roles.map(r => <RadioCard key={r.id} {...r} selected={selected === r.id} onClick={() => pick(r.id, r.disabled)} />)}
      </div>
      <Btn onClick={() => onNext({ role: selected })} disabled={!selected}>
        Continue <ArrowRight className="w-4 h-4" />
      </Btn>
    </div>
  );
}

// ─── DIY Personal ─────────────────────────────────────────────────────────────

function StepDiyIntent({ onNext, onBack }) {
  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <div className="text-xs font-bold text-ep-orange uppercase tracking-widest mb-3">Almost done</div>
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Are you planning something right now?</h1>
      <p className="text-sm text-gray-400 mb-8">No pressure — just exploring is totally fine.</p>
      <div className="space-y-3">
        <RadioCard icon="✨" label="Yes, I have an event in mind" sub="Let's set up your event workspace"
          selected={false} onClick={() => onNext({ diy_intent: 'planning_now' })} />
        <RadioCard icon="👀" label="Just exploring" sub="I'll look around for now"
          selected={false} onClick={() => onNext({ diy_intent: 'exploring' })} />
      </div>
    </div>
  );
}

function StepDiyBasics({ data, onNext, onBack }) {
  const [form, setForm] = useState({
    event_type: '', event_name: '', event_date: '', no_date: false,
    estimated_guests: 100, venue_city: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const types = ['Wedding', 'Traditional wedding', 'Birthday', 'Milestone birthday', 'Anniversary', 'Naming ceremony', 'Graduation', 'Housewarming', 'Engagement', 'Funeral / memorial', 'Other'];

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Tell us about your event</h1>
      <p className="text-sm text-gray-400 mb-8">We'll use this to set up your workspace. Change anything later.</p>
      <div className="space-y-4">
        <Sel label="Event type" value={form.event_type} onChange={e => set('event_type', e.target.value)}>
          <option value="">Select event type…</option>
          {types.map(t => <option key={t}>{t}</option>)}
        </Sel>
        <Inp label="Event name" placeholder="Tunde & Bola's Wedding" value={form.event_name}
          onChange={e => set('event_name', e.target.value)} />
        <div>
          <Lbl>Event date <span className="text-gray-400 font-normal">(optional)</span></Lbl>
          <input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)}
            disabled={form.no_date} min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-gray-50 disabled:text-gray-400" />
          <label className="flex items-center gap-2 mt-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={form.no_date} onChange={e => set('no_date', e.target.checked)} className="accent-brand-600" />
            Date not yet decided
          </label>
        </div>
        <div>
          <Lbl>Estimated guests: <span className="text-brand-600 font-bold">{form.estimated_guests}</span></Lbl>
          <input type="range" min="5" max="2000" step="5" value={form.estimated_guests}
            onChange={e => set('estimated_guests', Number(e.target.value))} className="w-full accent-brand-600 mt-1" />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>5</span><span>2000+</span></div>
        </div>
        <Sel label="Venue city (optional)" value={form.venue_city} onChange={e => set('venue_city', e.target.value)}>
          <option value="">Select city…</option>
          {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Benin City', 'Kaduna', 'Other'].map(c => <option key={c}>{c}</option>)}
        </Sel>
        <Btn onClick={() => onNext(form)} disabled={!form.event_type || !form.event_name}>
          Continue <ArrowRight className="w-4 h-4" />
        </Btn>
        <SkipLink onClick={() => onNext({ event_type: 'Other', event_name: 'My Event', estimated_guests: 100 })} label="Skip — set up later" />
      </div>
    </div>
  );
}

function StepDiyNeeds({ onNext, onBack }) {
  const opts = [
    { id: 'vendors', icon: '🛍️', label: 'Find & book vendors' },
    { id: 'budget', icon: '💰', label: 'Manage budget' },
    { id: 'guests', icon: '👥', label: 'Track guest list & RSVPs' },
    { id: 'wishlist', icon: '🎁', label: 'Build a wishlist' },
    { id: 'invites', icon: '✉️', label: 'Send invites' },
    { id: 'todos', icon: '✅', label: 'To-do list & timeline' },
    { id: 'photos', icon: '📷', label: 'Share photos with guests' },
    { id: 'checkin', icon: '🎟️', label: 'Day-of QR check-in' },
  ];
  const [sel, setSel] = useState([]);
  const toggle = id => setSel(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">How can we help?</h1>
      <p className="text-sm text-gray-400 mb-8">Pick everything that applies — your dashboard highlights these first.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
        {opts.map(o => <CheckCard key={o.id} {...o} selected={sel.includes(o.id)} onClick={() => toggle(o.id)} />)}
      </div>
      <Btn onClick={() => onNext({ needs: sel })} disabled={sel.length === 0}>
        Finish setup <ArrowRight className="w-4 h-4" />
      </Btn>
    </div>
  );
}

// ─── Public Organizer ─────────────────────────────────────────────────────────

function StepPubBasics({ onNext, onBack }) {
  const [form, setForm] = useState({ pub_type: '', event_name: '', event_date: '', no_date: false, capacity: 200, frequency: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const freqs = ['one_off', 'monthly', 'quarterly', 'yearly', 'irregular'];
  const freqLabels = { one_off: 'One-off', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly', irregular: 'Irregular' };
  const pubTypes = ['Concert / live music', 'DJ / club night', 'Workshop / masterclass', 'Conference', 'Pop-up dinner', 'Meet-up / networking', 'Festival', 'Comedy show', 'Theatre / performance', 'Other'];

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Tell us about your event</h1>
      <p className="text-sm text-gray-400 mb-8">We'll set up a workspace tuned for ticketing and check-in.</p>
      <div className="space-y-4">
        <Sel label="Event type" value={form.pub_type} onChange={e => set('pub_type', e.target.value)}>
          <option value="">Select type…</option>
          {pubTypes.map(t => <option key={t}>{t}</option>)}
        </Sel>
        <Inp label="Event name" placeholder="SoundFest Lagos 2026" value={form.event_name} onChange={e => set('event_name', e.target.value)} />
        <div>
          <Lbl>Event date <span className="text-gray-400 font-normal">(optional)</span></Lbl>
          <input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)}
            disabled={form.no_date} min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-gray-50" />
          <label className="flex items-center gap-2 mt-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={form.no_date} onChange={e => set('no_date', e.target.checked)} className="accent-brand-600" />
            Date TBD
          </label>
        </div>
        <div>
          <Lbl>Expected capacity: <span className="text-brand-600 font-bold">{form.capacity}</span></Lbl>
          <input type="range" min="10" max="10000" step="10" value={form.capacity}
            onChange={e => set('capacity', Number(e.target.value))} className="w-full accent-brand-600 mt-1" />
        </div>
        <div>
          <Lbl>How often do you run this?</Lbl>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {freqs.map(f => (
              <button key={f} type="button" onClick={() => set('frequency', f)}
                className={`py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${form.frequency === f ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {freqLabels[f]}
              </button>
            ))}
          </div>
        </div>
        <Btn onClick={() => onNext(form)} disabled={!form.pub_type || !form.event_name || !form.frequency}>
          Continue <ArrowRight className="w-4 h-4" />
        </Btn>
      </div>
    </div>
  );
}

function StepPubTickets({ onNext, onBack }) {
  const platforms = ['Selar', 'Eventbrite', 'Tix.Africa', 'Nairabox', 'Direct (DM/transfer)', 'Other', 'None — first event'];
  const ranges = ['<₦5k', '₦5k–₦20k', '₦20k–₦50k', '₦50k+'];
  const [sel, setSel] = useState([]);
  const [range, setRange] = useState('');
  const toggle = p => setSel(s => s.includes(p) ? s.filter(i => i !== p) : [...s, p]);

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Where do you sell tickets today?</h1>
      <p className="text-sm text-gray-400 mb-8">Optional — helps us tailor the import experience.</p>
      <div className="space-y-5">
        <div>
          <Lbl>Current platforms <span className="text-gray-400 font-normal">(select all that apply)</span></Lbl>
          <div className="flex flex-wrap gap-2 mt-1">
            {platforms.map(p => (
              <button key={p} type="button" onClick={() => toggle(p)}
                className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all ${sel.includes(p) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>Expected ticket price range <span className="text-gray-400 font-normal">(optional)</span></Lbl>
          <div className="flex gap-2 flex-wrap mt-1">
            {ranges.map(r => (
              <button key={r} type="button" onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${range === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <Btn onClick={() => onNext({ platforms: sel, price_range: range })}>Continue <ArrowRight className="w-4 h-4" /></Btn>
        <SkipLink onClick={() => onNext({ platforms: [], price_range: '' })} />
      </div>
    </div>
  );
}

function StepPubNeeds({ onNext, onBack }) {
  const opts = [
    { id: 'tickets', icon: '🎟️', label: 'Sell tickets' },
    { id: 'landing', icon: '🎨', label: 'Custom event landing page' },
    { id: 'scanner', icon: '📲', label: 'QR check-in scanner' },
    { id: 'payouts', icon: '💸', label: 'Fast payouts to my bank' },
    { id: 'crm', icon: '👥', label: 'Audience CRM (rebook attendees)' },
    { id: 'sponsors', icon: '🤝', label: 'Sponsor / partner management' },
    { id: 'analytics', icon: '📊', label: 'Sales & attendance analytics' },
    { id: 'staff', icon: '👨‍💼', label: 'Manage door staff & promoters' },
  ];
  const [sel, setSel] = useState([]);
  const toggle = id => setSel(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">How can we help?</h1>
      <p className="text-sm text-gray-400 mb-8">Select everything that matters to your events.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
        {opts.map(o => <CheckCard key={o.id} {...o} selected={sel.includes(o.id)} onClick={() => toggle(o.id)} />)}
      </div>
      <Btn onClick={() => onNext({ needs: sel })} disabled={sel.length === 0}>Continue <ArrowRight className="w-4 h-4" /></Btn>
    </div>
  );
}

function StepPubKYC({ onNext }) {
  return (
    <div>
      <ProgressBar group={5} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">One thing to know about money 💰</h1>
      <p className="text-sm text-gray-400 mb-6">Sign-up is free and you can build your event right now. To publish a paid ticketed event, we'll ask you to verify your identity — it takes 2 minutes.</p>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-3">Identity verification needed for:</p>
        <ul className="space-y-2">
          {['Publishing a paid ticketed event', 'Withdrawing wallet funds', 'Paying vendors over ₦500k'].map(t => (
            <li key={t} className="flex items-center gap-2 text-sm text-amber-700"><Shield className="w-4 h-4 flex-shrink-0" />{t}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-3">
        <Btn onClick={onNext}>Got it — let me get started <ArrowRight className="w-4 h-4" /></Btn>
        <Btn variant="outline" onClick={() => { toast('KYC flow coming soon', { icon: '🔐' }); onNext(); }}>Verify now (2 min)</Btn>
      </div>
    </div>
  );
}

// ─── Event Planner ────────────────────────────────────────────────────────────

function StepPlanBiz({ onNext, onBack }) {
  const [form, setForm] = useState({ business_name: '', biz_type: '', years: '', clients: 0, archetypes: [] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const types = [{ id: 'solo', label: 'Solo planner', sub: "It's just me" }, { id: 'boutique', label: 'Boutique studio', sub: '2–5 people' }, { id: 'agency', label: 'Agency', sub: '6+ people' }];
  const archs = ['Weddings', 'Birthdays', 'Corporate events', 'Naming ceremonies', 'Anniversaries', 'Funerals', 'Conferences', 'Other'];

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Tell us about your business</h1>
      <p className="text-sm text-gray-400 mb-8">Your dashboard will be tuned for managing many clients at once.</p>
      <div className="space-y-5">
        <Inp label="Business name" placeholder="Amaka Events" value={form.business_name} onChange={e => set('business_name', e.target.value)} autoFocus />
        <div>
          <Lbl>Business size</Lbl>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {types.map(t => (
              <button key={t.id} type="button" onClick={() => set('biz_type', t.id)}
                className={`p-3 rounded-xl border-2 text-left sm:text-center transition-all flex sm:block items-center gap-3 ${form.biz_type === t.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-xs font-bold text-ep-navy">{t.label}</div>
                <div className="text-xs text-gray-400 mt-0 sm:mt-0.5">{t.sub}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>Years in business</Lbl>
          <div className="flex gap-2">
            {['<1', '1-3', '3-5', '5+'].map(y => (
              <button key={y} type="button" onClick={() => set('years', y)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${form.years === y ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {y}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>Active clients: <span className="text-brand-600 font-bold">{form.clients === 30 ? '30+' : form.clients}</span></Lbl>
          <input type="range" min="0" max="30" value={form.clients} onChange={e => set('clients', Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
        <div>
          <Lbl>Types of events you plan <span className="text-gray-400 font-normal">(select all)</span></Lbl>
          <div className="flex flex-wrap gap-2 mt-1">
            {archs.map(a => (
              <button key={a} type="button"
                onClick={() => set('archetypes', form.archetypes.includes(a) ? form.archetypes.filter(x => x !== a) : [...form.archetypes, a])}
                className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all ${form.archetypes.includes(a) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <Btn onClick={() => onNext(form)} disabled={!form.business_name || !form.biz_type || !form.years}>
          Continue <ArrowRight className="w-4 h-4" />
        </Btn>
      </div>
    </div>
  );
}

function StepPlanBrand({ onNext, onBack }) {
  const [color, setColor] = useState('#4B55F5');
  const [website, setWebsite] = useState('');

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Make it yours</h1>
      <p className="text-sm text-gray-400 mb-8">Your clients and guests will see your brand — not ours — on RSVPs and check-in pages.</p>
      <div className="space-y-5">
        <div>
          <Lbl>Business logo <span className="text-gray-400 font-normal">(optional)</span></Lbl>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-300 cursor-pointer transition-colors">
            <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Upload logo · JPEG, PNG, or SVG · max 4MB</p>
          </div>
        </div>
        <div>
          <Lbl>Brand colour <span className="text-gray-400 font-normal">(optional)</span></Lbl>
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <span className="text-sm font-mono text-gray-500">{color}</span>
          </div>
        </div>
        <Inp label="Business website (optional)" placeholder="https://amakaevents.com" value={website} onChange={e => setWebsite(e.target.value)} />
        <Btn onClick={() => onNext({ brand_color: color, business_website: website })}>Continue <ArrowRight className="w-4 h-4" /></Btn>
        <SkipLink onClick={() => onNext({ brand_color: '', business_website: '' })} label="Skip — set up branding later" />
      </div>
    </div>
  );
}

function StepPlanPricing({ onNext, onBack }) {
  const [model, setModel] = useState('');
  const [budget, setBudget] = useState('');
  const models = [{ id: 'package', label: 'Fixed packages' }, { id: 'hourly', label: 'Hourly' }, { id: 'percentage', label: '% of event budget' }, { id: 'mix', label: 'Mixed / varies' }];
  const budgets = ['<₦500k', '₦500k–₦2M', '₦2M–₦10M', '₦10M+', 'Mixed'];

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">How do you charge clients?</h1>
      <p className="text-sm text-gray-400 mb-8">Optional — we'll use this to suggest invoice templates.</p>
      <div className="space-y-5">
        <div>
          <Lbl>Pricing model <span className="text-gray-400 font-normal">(optional)</span></Lbl>
          <div className="grid grid-cols-2 gap-2">
            {models.map(m => (
              <button key={m.id} type="button" onClick={() => setModel(m.id)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${model === m.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>Typical event budget <span className="text-gray-400 font-normal">(optional)</span></Lbl>
          <div className="flex flex-wrap gap-2">
            {budgets.map(b => (
              <button key={b} type="button" onClick={() => setBudget(b)}
                className={`px-4 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${budget === b ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <Btn onClick={() => onNext({ pricing_model: model, typical_budget: budget })}>Continue <ArrowRight className="w-4 h-4" /></Btn>
        <SkipLink onClick={() => onNext({ pricing_model: '', typical_budget: '' })} />
      </div>
    </div>
  );
}

function StepPlanNeeds({ onNext, onBack }) {
  const opts = [
    { id: 'dashboard', icon: '📊', label: 'Cross-client dashboard' },
    { id: 'rolodex', icon: '📒', label: 'Vendor rolodex' },
    { id: 'checkin', icon: '🎨', label: 'Branded check-in for each client' },
    { id: 'invoicing', icon: '🧾', label: 'Client invoicing & payments' },
    { id: 'team', icon: '👥', label: 'Team workload management' },
    { id: 'templates', icon: '📁', label: 'Reusable event templates' },
    { id: 'vendor_pay', icon: '💸', label: 'Pay vendors from one wallet' },
    { id: 'calendar', icon: '📅', label: 'Master calendar of all events' },
  ];
  const [sel, setSel] = useState([]);
  const toggle = id => setSel(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">What should your dashboard show first?</h1>
      <p className="text-sm text-gray-400 mb-8">Pick everything relevant to your practice.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
        {opts.map(o => <CheckCard key={o.id} {...o} selected={sel.includes(o.id)} onClick={() => toggle(o.id)} />)}
      </div>
      <Btn onClick={() => onNext({ needs: sel })} disabled={sel.length === 0}>Continue <ArrowRight className="w-4 h-4" /></Btn>
    </div>
  );
}

function StepPlanTeam({ onNext }) {
  const [members, setMembers] = useState([{ name: '', contact: '', role: '' }]);
  const roles = ['Junior planner', 'Assistant', 'Bookkeeper', 'Designer', 'Other'];
  const update = (i, k, v) => setMembers(m => m.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  return (
    <div>
      <ProgressBar group={5} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Bring your team in</h1>
      <p className="text-sm text-gray-400 mb-8">Add up to 5 collaborators — they'll get an invite link and don't need to do KYC.</p>
      <div className="space-y-3 mb-5">
        {members.map((m, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl">
            <input placeholder="Name" value={m.name} onChange={e => update(i, 'name', e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <input placeholder="Email or phone" value={m.contact} onChange={e => update(i, 'contact', e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <select value={m.role} onChange={e => update(i, 'role', e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="">Role…</option>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        ))}
        {members.length < 5 && (
          <button type="button" onClick={() => setMembers(m => [...m, { name: '', contact: '', role: '' }])}
            className="text-sm text-brand-600 font-medium hover:underline">+ Add team member</button>
        )}
      </div>
      <Btn onClick={() => onNext({ team: members })}>Send invites & finish <ArrowRight className="w-4 h-4" /></Btn>
      <SkipLink onClick={() => onNext({ team: [] })} label="Skip — invite team later" />
    </div>
  );
}

// ─── Corporate ────────────────────────────────────────────────────────────────

function StepCorpCompany({ onNext, onBack }) {
  const [form, setForm] = useState({ company_name: '', rc_number: '', industry: '', company_size: '', city: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const industries = ['Banking & Finance', 'Tech / SaaS', 'FMCG', 'Telco', 'Energy / Oil & Gas', 'Healthcare', 'Education', 'Retail', 'Hospitality', 'Real Estate', 'Public sector', 'Non-profit', 'Other'];
  const sizes = ['<50', '50–250', '250–1000', '1000–5000', '5000+'];

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Tell us about your company</h1>
      <p className="text-sm text-gray-400 mb-8">We'll create your company workspace. Multiple events live here.</p>
      <div className="space-y-4">
        <Inp label="Company name" placeholder="Acme Corp Ltd" value={form.company_name} onChange={e => set('company_name', e.target.value)} autoFocus />
        <Inp label="CAC registration number (optional)" placeholder="RC1234567"
          hint="Your CAC number. Skip if you don't have it handy."
          value={form.rc_number} onChange={e => set('rc_number', e.target.value)} />
        <Sel label="Industry" value={form.industry} onChange={e => set('industry', e.target.value)}>
          <option value="">Select industry…</option>
          {industries.map(i => <option key={i}>{i}</option>)}
        </Sel>
        <div>
          <Lbl>Company size</Lbl>
          <div className="flex flex-wrap gap-2">
            {sizes.map(s => (
              <button key={s} type="button" onClick={() => set('company_size', s)}
                className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all ${form.company_size === s ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <Sel label="City" value={form.city} onChange={e => set('city', e.target.value)}>
          <option value="">Select city…</option>
          {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Other'].map(c => <option key={c}>{c}</option>)}
        </Sel>
        <Btn onClick={() => onNext(form)} disabled={!form.company_name || !form.industry || !form.company_size}>
          Continue <ArrowRight className="w-4 h-4" />
        </Btn>
      </div>
    </div>
  );
}

function StepCorpRole({ data, onNext, onBack }) {
  const [form, setForm] = useState({ user_role: '', is_budget_owner: null, needs_approvers: null, approvers: [{ email: '', role: '' }] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const corpRoles = ['HR / People Ops', 'Operations / Admin', 'Communications / Marketing', 'Executive Assistant', 'Finance / Procurement', 'Founder / Exec', 'Other'];
  const approverRoles = ['CFO', 'CEO', 'COO', 'Head of HR', 'Other'];
  const updateApprover = (i, k, v) => setForm(f => ({ ...f, approvers: f.approvers.map((a, idx) => idx === i ? { ...a, [k]: v } : a) }));

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Your role at {data.company_name || 'your company'}</h1>
      <p className="text-sm text-gray-400 mb-8">Helps us configure the right approval flows.</p>
      <div className="space-y-5">
        <div>
          <Lbl>Your role</Lbl>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {corpRoles.map(r => (
              <button key={r} type="button" onClick={() => set('user_role', r)}
                className={`py-2.5 px-3 rounded-xl border-2 text-xs font-semibold text-left transition-all ${form.user_role === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>Authorised to commit company funds?</Lbl>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <button key={String(v)} type="button" onClick={() => set('is_budget_owner', v)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${form.is_budget_owner === v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>Do others need to approve event spend?</Lbl>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <button key={String(v)} type="button" onClick={() => set('needs_approvers', v)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${form.needs_approvers === v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>
        {form.needs_approvers && (
          <div>
            <Lbl>Approver emails <span className="text-gray-400 font-normal">(optional, up to 3)</span></Lbl>
            {form.approvers.map((a, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <input placeholder="approver@company.com" value={a.email} onChange={e => updateApprover(i, 'email', e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <select value={a.role} onChange={e => updateApprover(i, 'role', e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                  <option value="">Role…</option>
                  {approverRoles.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            ))}
            {form.approvers.length < 3 && (
              <button type="button" onClick={() => set('approvers', [...form.approvers, { email: '', role: '' }])}
                className="text-sm text-brand-600 hover:underline">+ Add approver</button>
            )}
          </div>
        )}
        <Btn onClick={() => onNext(form)} disabled={!form.user_role || form.is_budget_owner === null || form.needs_approvers === null}>
          Continue <ArrowRight className="w-4 h-4" />
        </Btn>
      </div>
    </div>
  );
}

function StepCorpKYB({ onNext }) {
  return (
    <div>
      <ProgressBar group={5} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Verifying your business 🏢</h1>
      <p className="text-sm text-gray-400 mb-6">Sign-up is free. To pay vendors or run public-facing events, we'll need to verify your business via CAC + the BVN of your authorised signatory. You can do this now or later.</p>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-3">Business verification required for:</p>
        <ul className="space-y-2">
          {['Loading the corporate wallet', 'Paying vendors directly', 'Publishing a public-facing event'].map(t => (
            <li key={t} className="flex items-center gap-2 text-sm text-blue-700"><Building2 className="w-4 h-4 flex-shrink-0" />{t}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-3">
        <Btn onClick={onNext}>Continue — verify later <ArrowRight className="w-4 h-4" /></Btn>
        <Btn variant="outline" onClick={() => { toast('Business verification coming soon', { icon: '🏢' }); onNext(); }}>Verify business now (5 min)</Btn>
      </div>
    </div>
  );
}

function StepCorpEvents({ onNext, onBack }) {
  const opts = ['Annual retreat / off-site', 'End-of-year party', 'Town hall / all-hands', 'Conference / summit', 'Product launch', 'Team building / away-day', 'Board / leadership offsite', 'Internal awards', 'External brand activation', 'Other'];
  const [sel, setSel] = useState([]);
  const toggle = v => setSel(s => s.includes(v) ? s.filter(i => i !== v) : [...s, v]);

  return (
    <div>
      <ProgressBar group={5} />
      <Back onClick={onBack} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">What events do you typically run?</h1>
      <p className="text-sm text-gray-400 mb-8">Select all that apply.</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {opts.map(o => (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={`px-4 py-2 rounded-full border-2 text-xs font-semibold transition-all ${sel.includes(o) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            {o}
          </button>
        ))}
      </div>
      <Btn onClick={() => onNext({ corp_archetypes: sel })} disabled={sel.length === 0}>Continue <ArrowRight className="w-4 h-4" /></Btn>
    </div>
  );
}

function StepCorpTeam({ onNext }) {
  const [members, setMembers] = useState([{ email: '', role: '', permission: '' }]);
  const roles = ['CFO', 'CEO', 'COO', 'Head HR', 'Comms', 'Exec Asst', 'Procurement', 'Other'];
  const perms = ['Approver', 'Editor', 'Viewer'];
  const update = (i, k, v) => setMembers(m => m.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  return (
    <div>
      <ProgressBar group={5} />
      <h1 className="text-2xl font-extrabold text-ep-navy mb-1">Bring stakeholders in</h1>
      <p className="text-sm text-gray-400 mb-8">Add CFO, comms lead, exec assistants. They'll get invite links — no KYC needed for them.</p>
      <div className="space-y-3 mb-5">
        {members.map((m, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl">
            <input placeholder="Email" value={m.email} onChange={e => update(i, 'email', e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <select value={m.role} onChange={e => update(i, 'role', e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="">Role…</option>{roles.map(r => <option key={r}>{r}</option>)}
            </select>
            <select value={m.permission} onChange={e => update(i, 'permission', e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="">Access…</option>{perms.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        ))}
        {members.length < 5 && (
          <button type="button" onClick={() => setMembers(m => [...m, { email: '', role: '', permission: '' }])}
            className="text-sm text-brand-600 font-medium hover:underline">+ Add stakeholder</button>
        )}
      </div>
      <Btn onClick={() => onNext({ stakeholders: members })}>Send invites & finish <ArrowRight className="w-4 h-4" /></Btn>
      <SkipLink onClick={() => onNext({ stakeholders: [] })} label="Skip — invite later" />
    </div>
  );
}

// ─── Complete ─────────────────────────────────────────────────────────────────

function StepComplete({ data }) {
  const labels = { diy_personal: 'personal event', diy_public: 'public event', event_planner: 'planner', corporate: 'corporate' };
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-400" />
      </div>
      <h1 className="text-2xl font-extrabold text-ep-navy mb-2">You're all set!</h1>
      <p className="text-gray-400 text-sm mb-6">Setting up your {labels[data.role] || ''} workspace…</p>
      <div className="flex justify-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const STEP_MAP = {
  email: StepEmail, email_otp: StepEmailOTP,
  phone: StepPhone, phone_otp: StepPhoneOTP,
  name: StepName, role: StepRole,
  diy_intent: StepDiyIntent, diy_basics: StepDiyBasics, diy_needs: StepDiyNeeds,
  pub_basics: StepPubBasics, pub_tickets: StepPubTickets, pub_needs: StepPubNeeds, pub_kyc: StepPubKYC,
  plan_biz: StepPlanBiz, plan_brand: StepPlanBrand, plan_pricing: StepPlanPricing, plan_needs: StepPlanNeeds, plan_team: StepPlanTeam,
  corp_company: StepCorpCompany, corp_role: StepCorpRole, corp_kyb: StepCorpKYB, corp_events: StepCorpEvents, corp_team: StepCorpTeam,
  complete: StepComplete,
};

export default function Signup() {
  const [step, setStep] = useState('email');
  const [history, setHistory] = useState(['email']);
  const [data, setData] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleDemo = async () => {
    await authApi.requestOTP(DEMO_PHONE);
    await login(DEMO_PHONE, DEMO_OTP);
    // Skip email + phone verification steps, jump straight to name
    setHistory(['email', 'name']);
    setStep('name');
    toast.success('Phone verified — continue setting up your account');
  };

  const update = patch => setData(prev => ({ ...prev, ...patch }));

  const advance = (patch = {}) => {
    const merged = { ...data, ...patch };
    update(patch);
    const next = getNext(step, merged);
    if (next === null) {
      finish(merged);
    } else {
      setHistory(h => [...h, next]);
      setStep(next);
    }
  };

  const goBack = () => {
    if (history.length <= 1) return;
    const h = history.slice(0, -1);
    setHistory(h);
    setStep(h[h.length - 1]);
  };

  const finish = (final) => {
    // User is already authenticated (login happened at phone OTP step).
    // Show the completion screen then redirect to dashboard — workspace
    // type (personal / corporate) is derived automatically from user.role.
    setHistory(h => [...h, 'complete']);
    setStep('complete');
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  const panel = PANELS[data.role] || PANELS.default;
  const CurrentStep = STEP_MAP[step] || StepEmail;

  return (
    <div className="min-h-screen bg-ep-blue-light flex pt-16 overflow-x-hidden">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between px-12 py-14 bg-ep-navy relative overflow-hidden w-[380px] flex-shrink-0">
        <div className="absolute inset-0 dot-pattern-white opacity-20" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-brand-600 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-10 right-0 w-60 h-60 bg-ep-orange rounded-full opacity-10 blur-3xl" />
        <div className="relative"><EventParkLogo light size="md" /></div>
        <div className="relative">
          <span className="inline-block text-xs font-bold text-ep-orange/80 uppercase tracking-widest mb-4">{panel.tag}</span>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4 whitespace-pre-line">{panel.headline}</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-8">{panel.sub}</p>
          <div className="flex flex-wrap gap-2">
            {panel.stats.map(s => (
              <span key={s} className="bg-white/10 border border-white/10 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
        <div className="relative"><p className="text-white/20 text-xs">Free to start · No credit card required</p></div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 min-w-0 flex items-start justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-lg">
          <div className="flex justify-center mb-6 lg:hidden"><EventParkLogo size="md" /></div>
          <CurrentStep data={data} onNext={advance} onBack={goBack} onFinish={finish}
            {...(step === 'email' ? { onDemo: handleDemo } : {})} />
        </div>
      </div>
    </div>
  );
}
