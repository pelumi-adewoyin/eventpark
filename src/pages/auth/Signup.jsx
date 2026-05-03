import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import { EventParkLogo } from '../../components/Logo';

const personalPerks = [
  'Create and manage personal events',
  'Buy tickets for any event',
  'Book verified vendors',
  'AI-powered event assistant',
];

const businessPerks = [
  'Unlimited corporate events',
  'Team collaboration tools',
  'Advanced analytics dashboard',
  'Dedicated account manager',
];

export default function Signup({ type = 'personal' }) {
  const [showPw, setShowPw] = useState(false);
  const isB = type === 'business';
  const perks = isB ? businessPerks : personalPerks;

  return (
    <div className="min-h-screen bg-ep-blue-light flex pt-16">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between px-14 py-14 bg-ep-navy relative overflow-hidden w-[420px] flex-shrink-0">
        <div className="absolute inset-0 dot-pattern-white opacity-20" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-brand-600 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-10 right-0 w-60 h-60 bg-ep-orange rounded-full opacity-10 blur-3xl" />

        <div className="relative">
          <EventParkLogo light size="md" />
        </div>

        <div className="relative">
          <h2 className="text-3xl font-extrabold text-white mb-3 leading-tight">
            {isB ? 'Grow your business with events' : 'Your events.\nYour way.'}
          </h2>
          <p className="text-white/40 text-sm mb-10 leading-relaxed">
            {isB
              ? 'Manage company events, discover vendors, and get insights that drive results.'
              : "Join 2M+ people using EventPark to plan, attend, and celebrate life's moments."}
          </p>

          <ul className="space-y-3.5">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-3 text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <p className="text-white/20 text-xs">Free to start · No credit card required</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <EventParkLogo size="md" />
          </div>

          <h1 className="text-2xl font-extrabold text-ep-navy mb-1">
            {isB ? 'Create a Business Account' : 'Create your account'}
          </h1>
          <p className="text-gray-400 text-sm mb-7">
            {isB ? 'For companies and organisations' : 'For individuals and event planners'}
          </p>

          {/* Toggle */}
          <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm">
            <Link to="/signup"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-all ${
                !isB ? 'bg-ep-navy text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}>
              Personal
            </Link>
            <Link to="/business/signup"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-all ${
                isB ? 'bg-ep-navy text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}>
              Business
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8">
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ep-navy mb-1.5">First name</label>
                  <input type="text" placeholder="Ada"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ep-navy mb-1.5">Last name</label>
                  <input type="text" placeholder="Okonkwo"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
                </div>
              </div>

              {isB && (
                <div>
                  <label className="block text-xs font-semibold text-ep-navy mb-1.5">Company name</label>
                  <input type="text" placeholder="Acme Corp Ltd"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">Email address</label>
                <input type="email" placeholder={isB ? 'you@company.com' : 'you@example.com'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">Phone number</label>
                <input type="tel" placeholder="+234 801 234 5678"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded accent-brand-600" />
                <span>
                  I agree to EventPark's{' '}
                  <a href="#" className="text-brand-600 hover:underline font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-brand-600 hover:underline font-medium">Privacy Policy</a>
                </span>
              </label>

              <button type="submit"
                className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to={isB ? '/business/login' : '/login'} className="text-brand-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
