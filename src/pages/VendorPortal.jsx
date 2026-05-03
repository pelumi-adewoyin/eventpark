import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star, TrendingUp, Shield, Users } from 'lucide-react';
import { EventParkLogo } from '../components/Logo';

const benefits = [
  { icon: TrendingUp, title: 'Grow your bookings', desc: 'Get discovered by thousands of event planners searching for your exact services.', color: 'text-brand-600 bg-ep-blue-light' },
  { icon: Shield, title: 'Secure payments', desc: 'Every booking is protected by EventPark escrow. Get paid reliably and on time.', color: 'text-ep-orange bg-ep-orange-pale' },
  { icon: Users, title: 'Build your portfolio', desc: 'Showcase your best work with a professional portfolio that wins more clients.', color: 'text-brand-600 bg-ep-blue-light' },
  { icon: Star, title: 'Build your reputation', desc: 'Collect verified reviews and ratings that help you stand out from the competition.', color: 'text-ep-orange bg-ep-orange-pale' },
];

const steps = [
  { n: '01', title: 'Create your profile', desc: 'Add your services, pricing, photos, and business details.' },
  { n: '02', title: 'Get discovered', desc: 'Appear in searches when planners need your exact service.' },
  { n: '03', title: 'Receive bookings', desc: 'Clients book you directly — payment goes to escrow instantly.' },
  { n: '04', title: 'Get paid', desc: 'Funds are released after the event. Safe, fast, guaranteed.' },
];

export default function VendorPortal() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="bg-ep-navy relative overflow-hidden py-24">
        <div className="absolute inset-0 dot-pattern-white opacity-30" />
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-brand-600 rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute -left-40 bottom-0 w-[400px] h-[400px] bg-ep-orange rounded-full opacity-10 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-ep-orange/20 border border-ep-orange/30 text-ep-orange text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            For Event Professionals
          </span>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Grow your event business<br />on <span className="text-brand-400">EventPark</span>
          </h1>
          <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Join 12,000+ verified vendors — caterers, photographers, decorators, DJs, and more — reaching thousands of event planners every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-ep-orange hover:bg-ep-orange-light text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors">
              Join as a Vendor
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/20 text-white/70 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-white/10 hover:border-white/30 transition-all">
              Vendor Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-600">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '12K+', label: 'Active Vendors' },
              { value: '₦2.4B', label: 'Paid to Vendors' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '48hrs', label: 'Avg. First Booking' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-brand-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Why EventPark</span>
            <h2 className="text-3xl font-extrabold text-ep-navy mt-2 mb-3">Everything you need to succeed</h2>
            <p className="text-gray-400">Built for Nigerian event professionals, by people who understand your market.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {benefits.map(b => (
              <div key={b.title}
                className="bg-white rounded-3xl border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50 transition-all duration-300 p-7 flex gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${b.color}`}>
                  <b.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-ep-navy mb-1.5">{b.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-ep-navy relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern-white opacity-20" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-600 rounded-full opacity-10 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">How it works</span>
            <h2 className="text-3xl font-extrabold text-white mt-2 mb-3">Start getting bookings in 4 steps</h2>
            <p className="text-white/40">No setup fee. Ready in under 5 minutes.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/8 transition-colors">
                <div className="text-3xl font-extrabold text-brand-400/40 mb-4">{s.n}</div>
                <h3 className="font-bold text-white mb-2 text-sm">{s.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <EventParkLogo size="md" />
          </div>
          <h2 className="text-3xl font-extrabold text-ep-navy mb-4">Ready to get your first booking?</h2>
          <p className="text-gray-400 mb-8">Create your vendor profile in under 5 minutes. No setup fee, no hidden charges.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-ep-navy hover:bg-ep-navy-light text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8">
            {['Free to join', 'No setup fee', 'Cancel anytime'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
                <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
