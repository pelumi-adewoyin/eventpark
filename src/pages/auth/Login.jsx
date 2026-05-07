import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth as authApi, users as usersApi, orgs as orgsApi } from '../../lib/api';
import { EventParkLogo } from '../../components/Logo';
import toast from 'react-hot-toast';

function OTPBoxes({ value, onChange, onComplete }) {
  const refs = useRef([]);
  const digits = ((value || '') + '      ').slice(0, 6).split('');

  const handle = (i, e) => {
    if (e.key === 'Backspace') {
      const next = [...digits]; next[i] = ' ';
      onChange(next.join('').trimEnd());
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
    <button type="button" onClick={() => { if (cd > 0) return; setCd(30); onResend(); }}
      className={`text-brand-600 font-medium text-sm ${cd > 0 ? 'opacity-40 cursor-not-allowed' : 'hover:underline'}`}>
      Resend code {cd > 0 ? `(${cd}s)` : ''}
    </button>
  );
}

// Normalise phone: accepts 08012345678 or +2348012345678, returns +234...
function normalisePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('234')) return '+' + digits;
  if (digits.startsWith('0')) return '+234' + digits.slice(1);
  return '+' + digits;
}

const DEMO_PHONE = '+2340000000000';
const DEMO_OTP = '000000';
const DEMO_DISPLAY = '0000000000'; // what the input shows

export default function Login({ type = 'personal' }) {
  const isB = type === 'business';
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const { login, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e) => {
    e?.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneError('Enter a valid Nigerian phone number'); return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      await authApi.requestOTP(normalisePhone(phone));
      toast.success('Verification code sent');
      setStep('otp');
    } catch (err) {
      if (err?.status === 404) {
        // Phone not registered — show inline sign-up prompt
        setNotFound(true);
      } else if (!err?.status) {
        // Network failure (no response from server)
        toast.error('Could not reach the server. Check your connection and try again.');
      } else {
        toast.error(err?.message || 'Could not send code. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (code) => {
    const val = code || otp;
    if (val.length !== 6) return;
    setLoading(true);
    try {
      const resolvedPhone = isDemo ? DEMO_PHONE : normalisePhone(phone);
      const rawUser = await login(resolvedPhone, val);

      // Business login: ensure the user has a corporate role + an org.
      // New users arrive with role=null; set both now so the corporate
      // dashboard loads without a separate onboarding step.
      if (isB && !rawUser?.role) {
        await usersApi.completeOnboarding({ role: 'corporate' });
        // Only create an org if the user doesn't already have one.
        // Use the user's name as a sensible default — they can update it in settings.
        if (!rawUser?.org_id) {
          const orgName = rawUser?.full_name ? `${rawUser.full_name}'s Company` : 'My Company';
          try { await orgsApi.create({ name: orgName }); } catch {}
        }
        await refreshUser();
      }

      toast.success(isDemo ? 'Demo mode — welcome!' : 'Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Invalid code. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.requestOTP(normalisePhone(phone));
      toast('New code sent', { icon: '📧' });
    } catch {
      toast.error('Could not resend. Try again.');
    }
  };

  const handleDemo = async () => {
    setIsDemo(true);
    setPhone(DEMO_DISPLAY);
    setPhoneError('');
    setLoading(true);
    try {
      await authApi.requestOTP(DEMO_PHONE);
      setStep('otp');
      // auto-fill OTP after a short delay so the boxes render first
      setTimeout(() => {
        setOtp(DEMO_OTP);
      }, 150);
    } catch (err) {
      toast.error(err?.message || 'Demo unavailable. Try again.');
      setIsDemo(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ep-blue-light flex pt-16 overflow-x-hidden">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between px-12 py-14 bg-ep-navy relative overflow-hidden w-[420px] flex-shrink-0">
        <div className="absolute inset-0 dot-pattern-white opacity-20" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-brand-600 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-10 right-0 w-60 h-60 bg-ep-orange rounded-full opacity-10 blur-3xl" />

        <div className="relative"><EventParkLogo light size="md" /></div>

        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Plan Smarter.<br />
            <span className="text-ep-orange">Celebrate Bigger.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Africa's #1 event infrastructure platform — managing guests, vendors, payments and check-in in one place.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-2">
          {['50K+ Events', '12K+ Vendors', '36 States'].map(tag => (
            <div key={tag} className="bg-white/10 border border-white/10 rounded-xl px-4 py-2">
              <span className="text-white text-sm font-semibold">{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 min-w-0 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <EventParkLogo size="md" />
          </div>

          {/* Personal / Business toggle */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-8 shadow-sm">
            <Link to="/login"
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${!isB ? 'bg-ep-navy text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              Personal
            </Link>
            <Link to="/business/login"
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${isB ? 'bg-ep-navy text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              Business
            </Link>
          </div>

          {/* Step: phone */}
          {step === 'phone' && (
            <div>
              <h1 className="text-3xl font-extrabold text-ep-navy mb-1">Welcome back</h1>
              <p className="text-gray-400 text-sm mb-8">
                Enter your phone number to receive a one-time sign-in code.
              </p>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ep-navy mb-1.5">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel" value={phone} autoFocus
                      onChange={e => { setPhone(e.target.value); setPhoneError(''); setNotFound(false); }}
                      placeholder="08012345678"
                      className={`w-full pl-11 pr-4 py-3.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white ${phoneError || notFound ? 'border-red-300' : 'border-gray-200'}`}
                    />
                  </div>
                  {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                  {notFound && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <p className="text-sm font-semibold text-red-700 mb-0.5">No account found</p>
                      <p className="text-xs text-red-500">
                        This number isn't registered yet.{' '}
                        <Link to="/signup" className="font-bold underline hover:text-red-700">
                          Create an account →
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="relative my-6 flex items-center">
                <div className="flex-grow border-t border-gray-200" />
                <span className="mx-3 text-xs text-gray-400 font-medium">or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              <button type="button" onClick={handleDemo} disabled={loading}
                className="w-full border-2 border-dashed border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold py-3 rounded-2xl transition-all text-sm disabled:opacity-60">
                Try Demo
              </button>

              <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-brand-600 font-bold hover:underline">Get Started</Link>
              </p>
            </div>
          )}

          {/* Step: otp */}
          {step === 'otp' && (
            <div>
              <button type="button" onClick={() => setStep('phone')}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-3xl font-extrabold text-ep-navy mb-1">Check your phone</h1>
              <p className="text-gray-400 text-sm mb-2">
                We sent a 6-digit code to <span className="font-semibold text-ep-navy">{phone}</span>
              </p>
              <p className="text-xs text-gray-400 mb-8">
                Didn't get it? Wait a moment then tap Resend below.
              </p>

              {isDemo && (
                <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-700 font-medium">
                  Demo mode — code <span className="font-bold tracking-widest">{DEMO_OTP}</span> has been pre-filled for you.
                </div>
              )}

              <div className="space-y-5">
                <OTPBoxes value={otp} onChange={setOtp} onComplete={handleOTPSubmit} />
                <button type="button" disabled={loading || otp.length !== 6}
                  onClick={() => handleOTPSubmit()}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Verify &amp; Sign In</span><ArrowRight className="w-4 h-4" /></>}
                </button>
                <div className="flex items-center justify-center">
                  <Cooldown seconds={30} onResend={handleResend} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
