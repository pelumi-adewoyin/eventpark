import { Link } from 'react-router-dom';
import { Zap, CheckCircle, ArrowRight, Star, TrendingUp, Shield, Users } from 'lucide-react';

const benefits = [
  { icon: TrendingUp, title: 'Grow your bookings', desc: 'Get discovered by thousands of event planners searching for your exact services.' },
  { icon: Shield, title: 'Secure payments', desc: 'Every booking is protected by EventPark escrow. Get paid reliably and on time.' },
  { icon: Users, title: 'Build your portfolio', desc: 'Showcase your best work with a professional portfolio that wins more clients.' },
  { icon: Star, title: 'Build your reputation', desc: 'Collect verified reviews and ratings that help you stand out from the competition.' },
];

export default function VendorPortal() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-950 to-gray-900 py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            For Event Professionals
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Grow your event business on{' '}
            <span className="bg-gradient-to-r from-green-400 to-brand-400 bg-clip-text text-transparent">EventPark</span>
          </h1>
          <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto">
            Join 12,000+ verified vendors — caterers, photographers, decorators, DJs, and more — reaching thousands of event planners every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition"
            >
              Join as a Vendor
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition"
            >
              Vendor Login
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Everything you need to succeed</h2>
            <p className="text-gray-500">Built for Nigerian event professionals, by people who understand your market.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map(b => (
              <div key={b.title} className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-gray-500 text-sm">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-green-600">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '12K+', label: 'Active Vendors' },
              { value: '₦2.4B', label: 'Paid to Vendors' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '48hrs', label: 'Avg. First Booking' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-green-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ready to get your first booking?</h2>
          <p className="text-gray-500 mb-8">Create your vendor profile in under 5 minutes. No setup fee.</p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
