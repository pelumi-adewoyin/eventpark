import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Calendar, ShoppingBag, Users, Shield, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const stats = [
  { value: '50K+', label: 'Events Hosted' },
  { value: '12K+', label: 'Verified Vendors' },
  { value: '2M+',  label: 'Happy Attendees' },
  { value: '36',   label: 'States Covered' },
];

const features = [
  {
    icon: Calendar,
    tag: 'Event Management',
    title: 'Plan every detail, in one place',
    desc: 'Create events, sell tickets, manage RSVPs, and track attendance — all from a single smart dashboard built for how Nigerians plan.',
    color: 'bg-brand-600',
  },
  {
    icon: ShoppingBag,
    tag: 'Marketplace',
    title: 'Find and book vendors instantly',
    desc: 'Cakes, photography, decor, catering — browse thousands of verified vendors across Nigeria with transparent pricing and reviews.',
    color: 'bg-ep-orange',
  },
  {
    icon: Shield,
    tag: 'Secure Payments',
    title: 'Your money is always protected',
    desc: 'Escrow payments mean vendors only get paid after your event runs smoothly. Integrated KYC and Paystack keep every naira safe.',
    color: 'bg-brand-600',
  },
];

const userTypes = [
  {
    role: 'diy',
    tag: 'Personal',
    title: 'Planning for yourself',
    desc: 'Weddings, birthdays, graduations — take full control of your event without needing a planner.',
    cta: 'Start Planning',
    bg: 'bg-ep-blue-light',
    accent: 'text-brand-600',
    border: 'border-brand-200',
  },
  {
    role: 'planner',
    tag: 'Planners',
    title: 'Running a planning business',
    desc: 'Manage multiple clients, juggle vendor rosters, and grow your event planning business with pro tools.',
    cta: 'Grow My Business',
    bg: 'bg-purple-50',
    accent: 'text-purple-600',
    border: 'border-purple-200',
  },
  {
    role: 'corporate',
    tag: 'Corporate',
    title: 'Events for your company',
    desc: 'Retreats, town halls, product launches — with budget approvals, audit trails and compliance built in.',
    cta: 'Explore Corporate',
    bg: 'bg-ep-orange-pale',
    accent: 'text-ep-orange',
    border: 'border-orange-200',
  },
];

const testimonials = [
  { name: 'Adaeze O.', role: 'Bride, Lagos', text: 'EventPark saved us weeks of back-and-forth. We booked our photographer, caterer, and decorator all in one afternoon.', rating: 5 },
  { name: 'Chidi M.', role: 'Event Planner, Abuja', text: 'Managing 8 clients at once used to be chaos. Now I have dashboards, escrow, and vendor tracking all in one place.', rating: 5 },
  { name: 'Funmi A.', role: 'HR Manager, TechFin NG', text: 'Our Q3 company retreat was the smoothest we\'ve ever run. The approval workflow alone saved us 3 weeks.', rating: 5 },
];

const trustedBy = ['Zenith Bank', 'GTBank', 'Flutterwave', 'Interswitch', 'MTN Nigeria', 'Dangote Group'];

export default function Landing() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = (role) => {
    demoLogin(role);
    const routes = { diy: '/dashboard', planner: '/planner', corporate: '/corporate' };
    navigate(routes[role]);
  };

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-ep-navy min-h-screen flex items-center pt-16">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern-white opacity-60" />

        {/* Orange blob */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-ep-orange rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-600 rounded-full opacity-15 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-ep-orange animate-pulse" />
              <span className="text-white/80 text-sm font-medium">Africa's #1 Event Infrastructure Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
              Plan Smarter.<br />
              <span className="text-brand-400">Celebrate</span>{' '}
              <span className="text-ep-orange">Bigger.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-xl leading-relaxed">
              The complete platform for events in Africa — manage guests, book verified vendors, process payments, and run day-of check-in. All in one place.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/onboarding"
                className="inline-flex items-center gap-2 bg-ep-orange hover:bg-ep-orange-light text-white font-bold px-8 py-4 rounded-2xl transition-all text-base glow-orange">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/discover/events"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base">
                Browse Events
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-12">
              <div className="flex -space-x-2">
                {['🧑🏾', '👩🏽', '👨🏿', '👩🏾'].map((e, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-brand-700 border-2 border-ep-navy flex items-center justify-center text-sm">{e}</div>
                ))}
              </div>
              <div>
                <div className="flex text-ep-orange text-sm">{'★★★★★'}</div>
                <p className="text-white/50 text-xs mt-0.5">Trusted by 50,000+ event organisers</p>
              </div>
            </div>
          </div>

          {/* Hero card preview */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block">
            <div className="w-80 bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur-sm float">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-bold text-sm">Your next event</span>
                <span className="bg-green-400/20 text-green-400 text-xs px-2 py-1 rounded-full font-semibold">Live</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'RSVPs', value: 'Tracking live', pct: 72 },
                  { label: 'Budget Used', value: 'On track', pct: 65 },
                  { label: 'Vendors Booked', value: 'All confirmed', pct: 100 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>{item.label}</span><span className="text-white">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-400 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/50 text-xs">Check-in ready</span>
                <span className="text-green-400 font-bold text-sm">QR codes sent</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="bg-brand-600 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-4xl font-extrabold text-white stat-number">{s.value}</div>
                <div className="text-brand-200 text-sm font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ───────────────────────────────────── */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm font-medium mb-6 uppercase tracking-widest">Trusted by leading organisations</p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {trustedBy.map(name => (
              <span key={name} className="text-gray-300 font-bold text-sm tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-ep-blue-light text-brand-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">What we do</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-ep-navy tracking-tight">
              Everything your event needs
            </h2>
            <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              One platform replaces a dozen tools — built specifically for how events work in Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.tag} className="group p-8 rounded-3xl border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50 transition-all duration-300 card-lift">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-6`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{f.tag}</span>
                <h3 className="text-xl font-bold text-ep-navy mt-2 mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-6 flex items-center gap-1 text-brand-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUILT FOR EVERYONE ───────────────────────────── */}
      <section className="py-24 bg-gray-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-ep-orange-pale text-ep-orange text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">Who it's for</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-ep-navy tracking-tight">
              Find, Book, Celebrate.
            </h2>
            <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              Whether it's your wedding or your company's annual retreat — EventPark has a dashboard built for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {userTypes.map((u) => (
              <div key={u.role}
                className={`${u.bg} border ${u.border} rounded-3xl p-8 flex flex-col`}>
                <span className={`text-xs font-bold uppercase tracking-widest ${u.accent} mb-4`}>{u.tag}</span>
                <h3 className="text-2xl font-extrabold text-ep-navy mb-3">{u.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{u.desc}</p>
                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => handleDemoLogin(u.role)}
                    className="w-full flex items-center justify-center gap-2 bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3 rounded-2xl transition-colors text-sm">
                    Try Demo Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link to="/onboarding"
                    className={`w-full flex items-center justify-center gap-1 ${u.accent} font-semibold py-2 text-sm hover:underline`}>
                    {u.cta} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-24 bg-ep-navy relative overflow-hidden" id="about">
        <div className="absolute inset-0 dot-pattern-white opacity-40" />
        <div className="absolute -right-32 top-0 w-96 h-96 bg-ep-orange rounded-full opacity-10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">How it works</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              From idea to celebration<br />in 4 steps
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '01', title: 'Create your event', desc: 'Set up your event in minutes — add details, set your budget, and choose public or private.' },
              { n: '02', title: 'Book your vendors', desc: 'Browse verified vendors, compare quotes, and book with 50% escrow protection.' },
              { n: '03', title: 'Invite your guests', desc: 'Send invites, manage RSVPs, and sell tickets — all tracked in one dashboard.' },
              { n: '04', title: 'Run the day', desc: 'QR check-in, live attendance stats, and instant escrow release when the event is done.' },
            ].map((step) => (
              <div key={step.n} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="text-5xl font-extrabold text-brand-400/30 mb-4">{step.n}</div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-ep-blue-light text-brand-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">Reviews</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-ep-navy tracking-tight">
              Nigerians love EventPark
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="border border-gray-100 rounded-3xl p-8 hover:shadow-lg hover:shadow-brand-50 transition-all">
                <div className="flex text-ep-orange mb-4">
                  {Array(t.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <div className="font-bold text-ep-navy text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 bg-ep-orange relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to celebrate bigger?
          </h2>
          <p className="text-white/70 text-lg mb-10">
            Join 50,000+ event organisers across Nigeria who run their events on EventPark.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/onboarding"
              className="inline-flex items-center gap-2 bg-white text-ep-orange font-bold px-8 py-4 rounded-2xl hover:bg-ep-blue-light transition-all text-base">
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/discover/events"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all text-base">
              Browse Events
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/70 text-sm">
            {['Free to get started', 'No credit card needed', 'Cancel anytime'].map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-white" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
