import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex pt-16">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-gradient-to-br from-brand-600 to-brand-800 w-96 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 mb-12">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">EventPark</span>
        </Link>

        <h2 className="text-3xl font-extrabold text-white mb-3">
          {isB ? 'Grow your business with events' : 'Your events. Your way.'}
        </h2>
        <p className="text-brand-200 text-sm mb-8 leading-relaxed">
          {isB
            ? 'Manage company events, discover vendors, and get insights that drive results.'
            : "Join 2M+ people using EventPark to plan, attend, and celebrate life's moments."}
        </p>

        <ul className="space-y-3">
          {perks.map(p => (
            <li key={p} className="flex items-center gap-2.5 text-white text-sm">
              <CheckCircle className="w-4 h-4 text-brand-300 flex-shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 justify-center">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Event<span className="text-brand-600">Park</span></span>
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            {isB ? 'Create a Business Account' : 'Create your account'}
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            {isB ? 'For companies and organisations' : 'For individuals and event planners'}
          </p>

          {/* Toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-6">
            <Link to="/signup" className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition ${!isB ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}>
              Personal
            </Link>
            <Link to="/business/signup" className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition ${isB ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}>
              Business
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                  <input type="text" placeholder="Ada" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                  <input type="text" placeholder="Okonkwo" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              {isB && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company name</label>
                  <input type="text" placeholder="Acme Corp Ltd" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input type="email" placeholder={isB ? 'you@company.com' : 'you@example.com'} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                <input type="tel" placeholder="+234 801 234 5678" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded" />
                <span>
                  I agree to EventPark's{' '}
                  <a href="#" className="text-brand-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>
                </span>
              </label>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
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
