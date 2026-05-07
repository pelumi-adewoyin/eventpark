import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, ChevronDown, ChevronUp, Shield,
  TrendingUp, Users, Star, Package, Briefcase, Camera,
  Music, Utensils, Gift, Scissors, Mic2, Home, Truck,
  DollarSign, BarChart2, Clock, Award,
} from 'lucide-react';
import { EventParkLogo } from '../../components/Logo';

const BENEFITS = [
  {
    icon: DollarSign,
    title: 'Get paid securely with escrow',
    desc: 'Every order and booking is protected. 35% released on confirmation, 65% held safely in escrow until your customer confirms delivery.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Users,
    title: 'Reach hosts, planners & corporates',
    desc: 'Get discovered by thousands of DIY hosts, professional event planners, and corporate teams planning their next event — all in one marketplace.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: BarChart2,
    title: 'Track orders, bookings & payouts',
    desc: 'One dashboard for everything — inventory, orders, bookings, client chat, offers, and your wallet. No spreadsheets needed.',
    color: 'bg-purple-50 text-purple-600',
  },
];

const STEPS = [
  { n: '01', title: 'Sign up free', desc: 'Create your vendor account in 3 minutes. No setup fees.' },
  { n: '02', title: 'Verify your business', desc: 'Unlock more listings and trust badges with our simple tier verification.' },
  { n: '03', title: 'List your services or products', desc: 'Add your portfolio, pricing, and availability. Go live instantly.' },
  { n: '04', title: 'Get paid', desc: 'Receive orders or booking requests. Chat, negotiate, and get paid — all on platform.' },
];

const SERVICE_CATEGORIES = [
  { icon: Camera, label: 'Photography', color: 'bg-pink-50 text-pink-600' },
  { icon: Utensils, label: 'Catering', color: 'bg-orange-50 text-orange-600' },
  { icon: Home, label: 'Decor & Floral', color: 'bg-green-50 text-green-600' },
  { icon: Music, label: 'DJ & Live Band', color: 'bg-purple-50 text-purple-600' },
  { icon: Mic2, label: 'MC / Compere', color: 'bg-blue-50 text-blue-600' },
  { icon: Scissors, label: 'Make-up & Hair', color: 'bg-rose-50 text-rose-600' },
  { icon: Briefcase, label: 'Event Planning', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Truck, label: 'Logistics', color: 'bg-amber-50 text-amber-600' },
];

const PRODUCT_CATEGORIES = [
  { icon: '🎂', label: 'Cakes & Pastries' },
  { icon: '👗', label: 'Fashion & Aso-ebi' },
  { icon: '🎁', label: 'Gifts & Hampers' },
  { icon: '🍷', label: 'Wine & Spirits' },
  { icon: '🖨️', label: 'Print & Stationery' },
  { icon: '💍', label: 'Accessories' },
  { icon: '🏆', label: 'Awards & Plaques' },
  { icon: '🎀', label: 'Souvenirs & Merch' },
];

const FAQS = [
  {
    q: 'Is it free to join as a vendor?',
    a: 'Yes — signing up and listing your first product or service is completely free. Eventpark only earns when you do: we take a 5% platform fee per successful transaction.',
  },
  {
    q: 'How does escrow work?',
    a: 'When a customer pays for your service, 35% is released immediately to your wallet and 65% is held in escrow. After the event, the customer confirms service delivery and the remaining 65% is released to you. If they don\'t confirm within 7 days, it auto-releases.',
  },
  {
    q: 'What\'s the difference between Tier 1, 2, and 3?',
    a: 'Tier 1 lets you list 1 product or service with a cap of 1 order. Tier 2 (verified CAC) raises this to 5 listings and 5 orders each. Tier 3 (full KYC) removes all caps and unlocks unlimited listings, trust badges, and priority visibility.',
  },
  {
    q: 'How long does verification take?',
    a: 'Tier 2 (CAC documents) is typically approved within 2 business hours. Tier 3 (KYC) is usually done within 4 hours. We\'ll email and notify you immediately.',
  },
  {
    q: 'Can I be both a service and product vendor?',
    a: 'Yes. You can select your primary type at sign-up and add up to 3 categories. A cake vendor (product) can also list décor items, for example.',
  },
  {
    q: 'What if a customer doesn\'t confirm delivery?',
    a: 'If a customer doesn\'t confirm within 7 days after the event, your escrow is automatically released. They can still raise a dispute within 30 days if needed.',
  },
];

export default function VendorLanding() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white pt-16">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-ep-navy relative overflow-hidden py-24">
        <div className="absolute inset-0 dot-pattern-white opacity-20" />
        <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-brand-600 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -left-40 bottom-0 w-[400px] h-[400px] bg-ep-orange rounded-full opacity-10 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-ep-orange/20 border border-ep-orange/30 text-ep-orange text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            For Event Professionals
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Sell your services and products<br className="hidden sm:block" /> to thousands of event planners.
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            List once, get discovered by hosts, planners, and corporates planning their next event. Get paid securely. Grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/vendor/signup"
              className="inline-flex items-center justify-center gap-2 bg-ep-orange hover:bg-ep-orange-light text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors">
              Start selling — it's free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/20 text-white/70 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-white/10 hover:border-white/30 transition-all">
              See how it works
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/40 text-sm font-medium">
            {['12,000+ active vendors', '₦2.4B in payouts', 'Lagos · Abuja · PH · Ibadan', '2-hr verification'].map(s => (
              <span key={s} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {BENEFITS.map(b => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="flex flex-col gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${b.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-ep-blue-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-3 block">How it works</span>
            <h2 className="text-3xl font-extrabold text-ep-navy">Start earning in 4 steps</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.n} className="bg-white rounded-2xl p-6 border border-gray-100 relative">
                <div className="text-4xl font-extrabold text-gray-100 mb-4">{step.n}</div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vendor types ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-3 block">Who's on Eventpark</span>
            <h2 className="text-3xl font-extrabold text-ep-navy">Service vendors</h2>
            <p className="text-gray-400 mt-2">Photographers, caterers, DJs, planners, make-up artists, and more</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            {SERVICE_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <div key={cat.label} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 text-center">{cat.label}</span>
                </div>
              );
            })}
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-ep-navy">Product vendors</h2>
            <p className="text-gray-400 mt-2">Cakes, fashion, gifts, wines, stationery, and more</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRODUCT_CATEGORIES.map(cat => (
              <div key={cat.label} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all">
                <div className="text-3xl">{cat.icon}</div>
                <span className="text-sm font-semibold text-gray-700 text-center">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing & fees ────────────────────────────────────────────────── */}
      <section className="py-20 bg-ep-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3 block">Transparent pricing</span>
          <h2 className="text-3xl font-extrabold mb-4">Simple, fair fees</h2>
          <p className="text-white/50 mb-12 max-w-lg mx-auto">No monthly fees. No hidden charges. We only earn when you earn.</p>

          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
              { label: 'Platform fee', value: '5%', sub: 'Per successful transaction. No upfront cost.' },
              { label: 'Payout speed', value: 'T+0 to T+1', sub: 'Funds hit your bank same day or next business day.' },
              { label: 'Verification', value: 'Free', sub: 'Tier 2 & 3 verification is always free.' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-extrabold text-brand-400 mb-1">{item.value}</div>
                <div className="text-white font-semibold mb-2">{item.label}</div>
                <div className="text-white/40 text-sm">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tier badges ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-3 block">Trust & verification</span>
            <h2 className="text-3xl font-extrabold text-ep-navy">Start small, grow with confidence</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                tier: 'Tier 1', badge: '🔵', title: 'Start listing', desc: 'No documents needed. List 1 product or service immediately. Perfect for testing the water.',
                perks: ['1 listing', '1 order/booking', 'Instant start', 'Basic support'],
              },
              {
                tier: 'Tier 2', badge: '⭐', title: 'Verified business', desc: 'Upload your CAC certificate. Get approved in 2 hours and unlock more listings.',
                perks: ['5 listings', '5 orders/bookings per listing', 'Verified badge', 'Priority in search'],
                highlight: true,
              },
              {
                tier: 'Tier 3', badge: '🏆', title: 'Fully verified', desc: 'Complete identity and address verification. No caps, maximum trust, best visibility.',
                perks: ['Unlimited listings', 'No order/booking caps', 'Top trust badge', 'Priority support'],
              },
            ].map(t => (
              <div key={t.tier} className={`rounded-2xl p-7 border-2 ${t.highlight ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white'}`}>
                <div className="text-3xl mb-3">{t.badge}</div>
                <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">{t.tier}</div>
                <h3 className="font-bold text-ep-navy text-lg mb-2">{t.title}</h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">{t.desc}</p>
                <ul className="space-y-2">
                  {t.perks.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-ep-blue-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-ep-navy">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA repeat ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-ep-navy">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to start selling?</h2>
          <p className="text-white/50 mb-8">Join thousands of vendors growing their event business on Eventpark.</p>
          <Link to="/vendor/signup"
            className="inline-flex items-center gap-2 bg-ep-orange hover:bg-ep-orange-light text-white font-bold px-10 py-4 rounded-2xl text-base transition-colors">
            Start selling — it's free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/30 text-xs mt-5">
            Already a vendor?{' '}
            <Link to="/vendor/login" className="underline hover:text-white/60 transition-colors">Sign in</Link>
            {' '}· Questions?{' '}
            <a href="mailto:vendors@eventpark.ng" className="underline hover:text-white/60 transition-colors">vendors@eventpark.ng</a>
          </p>
        </div>
      </section>

      {/* ── Footer links ──────────────────────────────────────────────────── */}
      <div className="bg-ep-navy border-t border-white/5 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-xs text-white/30">
          <EventParkLogo light size="sm" />
          <div className="flex gap-6">
            {['Vendor agreement', 'Escrow terms', 'Privacy policy', 'Vendor support'].map(l => (
              <a key={l} href="#" className="hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
