import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Mail, Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

export default function Login({ type = 'personal' }) {
  const isB = type === 'business';
  const [step, setStep] = useState('email'); // email | otp | password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e?.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError('Enter a valid email address'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    toast.success('Verification code sent');
    toast('Demo mode — enter any 6 digits to sign in', { icon: '🔑', duration: 12000 });
    setStep('otp');
  };

  const handleOTPSubmit = async (code) => {
    const val = code || otp;
    if (val.length !== 6) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    const role = email.includes('planner') ? 'planner' : email.includes('corp') ? 'corporate' : 'diy';
    demoLogin(role);
    toast.success('Welcome back!');
    const routes = { diy: '/dashboard', planner: '/planner', corporate: '/corporate' };
    navigate(routes[role] || '/dashboard');
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

          {step === 'email' && (
            <div>
              <h1 className="text-3xl font-extrabold text-ep-navy mb-1">Welcome back</h1>
              <p className="text-gray-400 text-sm mb-8">Enter your email to receive a one-time sign-in code.</p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ep-navy mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} autoFocus
                      onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                      placeholder="you@email.com"
                      className={`w-full pl-11 pr-4 py-3.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white ${emailError ? 'border-red-300' : 'border-gray-200'}`} />
                  </div>
                  {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-8">
                Don't have an account?{' '}
                <Link to="/signup" className="text-brand-600 font-bold hover:underline">Get Started</Link>
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <button type="button" onClick={() => setStep('email')}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-3xl font-extrabold text-ep-navy mb-1">Check your email</h1>
              <p className="text-gray-400 text-sm mb-2">
                We sent a 6-digit code to <span className="font-semibold text-ep-navy">{email}</span>
              </p>
              <p className="text-xs text-brand-600 bg-brand-50 rounded-xl px-3 py-2 mb-8">
                🔑 Demo mode — enter any 6 digits to sign in
              </p>

              <div className="space-y-5">
                <OTPBoxes value={otp} onChange={setOtp} onComplete={handleOTPSubmit} />
                <button type="button" disabled={loading || otp.length !== 6}
                  onClick={() => handleOTPSubmit()}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Verify & Sign In</span><ArrowRight className="w-4 h-4" /></>}
                </button>
                <div className="flex items-center justify-between">
                  <Cooldown seconds={30} onResend={() => toast('New code sent', { icon: '📧' })} />
                  <button type="button" onClick={() => setStep('password')}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    Use password instead
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div>
              <button type="button" onClick={() => setStep('otp')}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-3xl font-extrabold text-ep-navy mb-1">Enter your password</h1>
              <p className="text-gray-400 text-sm mb-8">
                Signed in as <span className="font-semibold text-ep-navy">{email}</span>
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleOTPSubmit('000000')}
                    placeholder="Your password"
                    className="w-full pl-11 pr-11 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="button" disabled={loading || !password}
                  onClick={() => handleOTPSubmit('000000')}
                  className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                </button>
                <div className="flex justify-between text-sm">
                  <Link to="/forgot-password" className="text-brand-600 hover:underline">Forgot password?</Link>
                  <button type="button" onClick={() => setStep('otp')} className="text-gray-400 hover:text-gray-600">Use email code instead</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
