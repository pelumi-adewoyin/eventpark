import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Phone, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth as authApi } from '../../lib/api';
import toast from 'react-hot-toast';

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 justify-center mb-6">
      <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="14" height="14" rx="3" fill="#4B55F5" />
        <rect x="18" width="14" height="14" rx="3" fill="#F25122" />
        <rect y="18" width="14" height="14" rx="3" fill="#4B55F5" opacity="0.4" />
        <rect x="18" y="18" width="14" height="14" rx="3" fill="#4B55F5" />
      </svg>
      <span className="text-2xl font-extrabold text-ep-navy tracking-tight">
        Event<span className="text-brand-600">park</span>
      </span>
    </Link>
  );
}

export default function Login({ type = 'personal' }) {
  const isB = type === 'business';
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!phone.match(/^0[789][01]\d{8}$/)) {
      toast.error('Enter a valid Nigerian phone number');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.requestOTP(phone);
      toast.success('OTP sent to your phone');
      if (data.code) toast(`Dev OTP: ${data.code}`, { icon: '🔑', duration: 30000 });
      setStep('otp');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const u = await login(phone, otp);
      toast.success(`Welcome back!`);
      const routes = { diy: '/dashboard', planner: '/planner', corporate: '/corporate' };
      navigate(u.onboarding_done ? (routes[u.role] || '/dashboard') : '/onboarding');
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ep-navy p-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern-white opacity-40" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-600 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-ep-orange rounded-full opacity-10 blur-3xl" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="14" height="14" rx="3" fill="#4B55F5" />
              <rect x="18" width="14" height="14" rx="3" fill="#F25122" />
              <rect y="18" width="14" height="14" rx="3" fill="#4B55F5" opacity="0.4" />
              <rect x="18" y="18" width="14" height="14" rx="3" fill="#4B55F5" />
            </svg>
            <span className="text-xl font-bold text-white tracking-tight">Eventpark</span>
          </Link>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Plan Smarter.<br />
            <span className="text-ep-orange">Celebrate Bigger.</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Africa's #1 event infrastructure platform — managing guests, vendors, payments and check-in in one place.
          </p>
        </div>

        <div className="relative flex gap-4">
          {['50K+ Events', '12K+ Vendors', '36 States'].map(tag => (
            <div key={tag} className="bg-white/10 border border-white/10 rounded-xl px-4 py-2">
              <span className="text-white text-sm font-semibold">{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden mb-4"><Logo /></div>
            <h1 className="text-3xl font-extrabold text-ep-navy">
              {step === 'phone' ? 'Welcome back' : 'Check your phone'}
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {step === 'phone'
                ? 'Enter your phone number to receive a one-time code'
                : `We sent a 6-digit code to ${phone}`}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8">
            <Link to="/login"
              className={`flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${!isB ? 'bg-white text-ep-navy shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              Personal
            </Link>
            <Link to="/business/login"
              className={`flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${isB ? 'bg-white text-ep-navy shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              Business
            </Link>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ep-navy mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel" value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ep-navy mb-2">6-Digit OTP</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent tracking-[0.3em] text-center text-xl font-bold bg-white"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Verify & Sign In
              </button>
              <button type="button" onClick={() => { setStep('phone'); setOtp(''); }}
                className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
                ← Change phone number
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/onboarding" className="text-brand-600 font-bold hover:underline">Get Started</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
