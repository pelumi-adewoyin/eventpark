import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, CheckCircle, Calendar, ShoppingBag, Users,
  TrendingUp, Shield, Zap, Globe, ChevronRight, Play, Sparkles,
  User, Briefcase, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sampleEvents } from '../data/sampleData';

const stats = [
  { value: '50K+', label: 'Events Hosted' },
  { value: '12K+', label: 'Verified Vendors' },
  { value: '2M+', label: 'Happy Attendees' },
  { value: '36', label: 'States Covered' },
];

const features = [
  {
    icon: Calendar,
    title: 'Event Management',
    desc: 'Create, manage, and promote your events with powerful tools. Sell tickets, manage RSVPs, and track attendance — all in one dashboard.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: ShoppingBag,
    title: 'Event Marketplace',
    desc: 'Shop for cakes, decor, photography, and every event essential from verified vendors across Nigeria. AI-powered recommendations.',
    color: 'bg-orange-50 text-orange-500',
  },
  {
    icon: Users,
    title: 'Vendor Network',
    desc: 'Connect with thousands of professional event vendors. View portfolios, read reviews, and book services securely through the platform.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: TrendingUp,
    title: 'Business Intelligence',
    desc: 'Deep analytics for event organisers and businesses. Understand your audience, optimise pricing, and grow your event brand.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    desc: 'Integrated payment infrastructure with escrow protection. Pay vendors safely and get refunds guaranteed by EventPark.',
    color: 'bg-red-50 text-red-500',
  },
  {
    icon: Globe,
    title: 'Pan-African Reach',
    desc: 'From Lagos to Nairobi, Accra to Johannesburg — EventPark is expanding across Africa. One platform, entire continent.',
    color: 'bg-yellow-50 text-yellow-600',
  },
];

const howItWorks = [
  { step: '01', title: 'Create your account', desc: 'Sign up as a personal user, business, or vendor in under 2 minutes.', icon: '🚀' },
  { step: '02', title: 'Set up your event or profile', desc: 'List your event with tickets, or build your vendor portfolio to attract bookings.', icon: '🎨' },
  { step: '03', title: 'Discover & Connect', desc: 'Browse events, shop products, and hire vendors — everything in one place.', icon: '🔍' },
  { step: '04', title: 'Celebrate in style', desc: 'Experience flawlessly planned events backed by our infrastructure.', icon: '🎉' },
];

const testimonials = [
  {
    name: 'Adaeze Okonkwo',
    role: 'Wedding Planner, Lagos',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80',
    quote: 'EventPark completely changed how I run my business. I found all my vendors in one place and my clients love the transparency.',
    rating: 5,
  },
  {
    name: 'Emeka Nwosu',
    role: 'Co-founder, TechAfrica Hub',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    quote: 'We ran our 1,000-person summit through EventPark — ticketing, vendor management, everything. Zero stress.',
    rating: 5,
  },
  {
    name: 'Bola Adesanya',
    role: 'Head Chef, Royal Caterers',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',
    quote: 'Since joining EventPark as a vendor, our bookings tripled. The platform handles payments and contracts professionally.',
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: 'Personal',
    price: 'Free',
    period: '',
    desc: 'For individuals planning personal events.',
    features: ['Create up to 3 events/month', 'Basic ticketing', 'Discover vendors', 'Community support'],
    cta: 'Get Started Free',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '₦15,000',
    period: '/month',
    desc: 'For serious event planners and small businesses.',
    features: ['Unlimited events', 'Advanced ticketing & RSVP', 'Priority vendor matching', 'Analytics dashboard', 'Email support'],
    cta: 'Start Free Trial',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large organisations and corporate events.',
    features: ['Everything in Professional', 'Dedicated account manager', 'Custom integrations', 'White-label options', 'SLA guarantee', '24/7 support'],
    cta: 'Contact Sales',
    href: '/business/signup',
    highlighted: false,
  },
];

const featuredEvents = sampleEvents.filter(e => e.isFeatured).slice(0, 3);

export default function Landing() {
  const { demoLogin: login } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-gray-950 via-brand-950 to-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute top-60 -left-20 w-72 h-72 rounded-full bg-accent-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-brand-300 text-sm font-medium mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              The infrastructure for Africa's events industry
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Every Event.{' '}
              <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                One Platform.
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10">
              EventPark is the infrastructure layer for everything events — from discovery and ticketing to vendors and products. Built for Africa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-brand-600/30 hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/discover/events"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all backdrop-blur-sm"
              >
                <Play className="w-4 h-4" />
                Discover Events
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-12 text-gray-400 text-sm">
              {['No credit card required', 'Free to get started', 'Cancel anytime'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero visual — event cards preview */}
          <div className="mt-20 relative">
            <div className="flex gap-4 overflow-hidden justify-center">
              {featuredEvents.map((event, i) => (
                <div
                  key={event.id}
                  className={`flex-shrink-0 w-72 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden ${i === 1 ? '-translate-y-4' : ''}`}
                >
                  <img src={event.image} alt={event.title} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <span className="text-xs font-medium text-brand-300 bg-brand-600/20 px-2 py-1 rounded-full">{event.category}</span>
                    <h3 className="text-white font-semibold mt-2 text-sm leading-snug">{event.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{event.date} · {event.location}</p>
                    <p className="text-brand-300 font-bold text-sm mt-2">
                      {event.price === 0 ? 'Free' : `₦${event.price.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-extrabold text-brand-600 mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Everything you need to{' '}
              <span className="gradient-text">run great events</span>
            </h2>
            <p className="text-gray-500 text-lg">
              From planning your first birthday party to running a 10,000-person conference — EventPark has the tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover CTA Band */}
      <section className="py-16 bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Explore what's happening near you</h2>
              <p className="text-brand-200">Events, products, and vendors — all in the Discover hub.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Discover Events', href: '/discover/events' },
                { label: 'Shop Products', href: '/discover/products' },
                { label: 'Find Vendors', href: '/discover/vendors' },
              ].map(btn => (
                <Link
                  key={btn.label}
                  to={btn.href}
                  className="inline-flex items-center gap-1.5 bg-white text-brand-700 font-semibold px-5 py-3 rounded-xl hover:bg-brand-50 transition-colors text-sm"
                >
                  {btn.label}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Get started in minutes</h2>
            <p className="text-gray-500 text-lg">EventPark is built to be simple. Here's how it works.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-brand-200 to-transparent z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <div className="text-xs font-bold text-brand-600 tracking-widest mb-2">{step.step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-24 bg-gray-950" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Built for{' '}
              <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">everyone</span>{' '}
              in the events ecosystem
            </h2>
            <p className="text-gray-400 text-lg">Three platforms, one infrastructure.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: '🎉',
                icon: User,
                title: 'Personal',
                desc: 'For individuals planning birthdays, weddings, graduations, and every personal milestone. Discover, plan, and celebrate.',
                href: '/onboarding',
                demoHref: '/dashboard',
                demoRole: 'diy',
                cta: 'Create Personal Account',
                color: 'from-brand-600 to-brand-800',
                glow: 'shadow-brand-600/30',
              },
              {
                emoji: '🏢',
                icon: Building2,
                title: 'Corporate',
                desc: 'For companies running retreats, conferences, and staff celebrations. Procurement-grade approvals and audit trails.',
                href: '/business/signup',
                demoHref: '/corporate',
                demoRole: 'corporate',
                cta: 'Create Business Account',
                color: 'from-orange-500 to-orange-700',
                glow: 'shadow-orange-600/30',
              },
              {
                emoji: '🛠️',
                icon: Briefcase,
                title: 'Vendor',
                desc: 'Showcase your services, build your portfolio, get bookings, and grow your event business. Join 12,000+ verified vendors.',
                href: '/vendor-portal',
                demoHref: '/vendor-portal',
                demoRole: null,
                cta: 'Join as a Vendor',
                color: 'from-green-600 to-green-800',
                glow: 'shadow-green-600/30',
              },
            ].map((card) => (
              <div key={card.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col hover:border-gray-700 transition-all card-lift">
                <div className="text-5xl mb-4">{card.emoji}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-grow">{card.desc}</p>
                <Link
                  to={card.href}
                  className={`mt-6 inline-flex items-center justify-center gap-2 bg-gradient-to-r ${card.color} text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:opacity-90 shadow-lg ${card.glow}`}
                >
                  {card.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {card.demoRole && (
                  <Link
                    to={card.demoHref}
                    onClick={() => card.demoRole && login(card.demoRole)}
                    className="mt-2 text-center text-xs text-gray-500 hover:text-gray-300 transition py-1"
                  >
                    → Preview dashboard as demo user
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Loved by event professionals</h2>
            <p className="text-gray-500 text-lg">Don't take our word for it — hear from the EventPark community.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when you're ready to scale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col ${
                  plan.highlighted
                    ? 'bg-brand-600 text-white ring-2 ring-brand-600 shadow-xl shadow-brand-600/20 scale-105'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="mb-6">
                  <div className={`text-sm font-semibold mb-1 ${plan.highlighted ? 'text-brand-200' : 'text-gray-500'}`}>{plan.name}</div>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={`text-sm pb-1 ${plan.highlighted ? 'text-brand-200' : 'text-gray-400'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm mt-2 ${plan.highlighted ? 'text-brand-200' : 'text-gray-500'}`}>{plan.desc}</p>
                </div>

                <ul className="space-y-3 flex-grow mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-brand-200' : 'text-green-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.href}
                  className={`text-center font-semibold py-3 rounded-xl transition-all ${
                    plan.highlighted
                      ? 'bg-white text-brand-700 hover:bg-brand-50'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-600 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Ready to transform how you do events?
          </h2>
          <p className="text-brand-200 text-xl mb-10">
            Join 50,000+ event creators and professionals already on EventPark.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-brand-50 transition-all shadow-lg hover:scale-105"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/business/signup"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-all"
            >
              Business Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
