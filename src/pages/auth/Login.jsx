import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Phone, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth as authApi } from '../../lib/api';
import toast from 'react-hot-toast';

export default function Login({ type = 'personal' }) {
  const isB = type === 'business';
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
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
      // In dev mode the API returns the code — show it for easy testing
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
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const u = await login(phone, otp);
      toast.success(`Welcome back, ${u.full_name || 'there'}!`);
      const routes = { diy: '/dashboard', planner: '/planner', corporate: '/corporate' };
      if (u.onboarding_done) {
        navigate(routes[u.role] || '/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Event<span className="text-brand-600">Park</span></span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {step === 'phone' ? (isB ? 'Business Login' : 'Welcome back') : 'Enter your OTP'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'phone'
              ? 'Enter your phone number to receive a one-time code'
              : `We sent a 6-digit code to ${phone}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {/* Account type toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-6">
            <Link
              to="/login"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition ${
                !isB ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              Personal
            </Link>
            <Link
              to="/business/login"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition ${
                isB ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              Business
            </Link>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  6-Digit OTP
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 tracking-widest text-center text-lg font-semibold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Verify & Sign In
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Change phone number
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/onboarding" className="text-brand-600 font-semibold hover:underline">
            Get Started
          </Link>
        </p>
      </div>
    </div>
  );
}
