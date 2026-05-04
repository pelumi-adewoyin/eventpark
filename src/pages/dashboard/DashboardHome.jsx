import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, Users, DollarSign, Wallet, ChevronRight,
  Clock, CheckCircle, ArrowUpRight, Gift, QrCode, Star, TrendingUp,
  Sparkles, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const myEvents = [
  {
    id: 'e1', title: 'Tunde & Bola – Dec 14 Wedding', type: 'Wedding', date: 'Dec 14, 2026',
    daysLeft: 225, guests: 220, rsvpd: 147, budget: 8000000, spent: 3240000,
    status: 'active', coverColor: 'from-pink-500 to-rose-600',
    vendors: [
      { name: 'Lens & Light Studios', status: 'confirmed', amount: 250000 },
      { name: 'Royal Caterers', status: 'pending_escrow', amount: 680000 },
      { name: 'Décor Dreams', status: 'quoted', amount: 320000 },
    ],
    todos: [
      { text: 'Confirm catering menu tasting', done: false, due: 'May 10' },
      { text: 'Finalise seating chart', done: false, due: 'May 20' },
      { text: 'Send remaining save-the-dates', done: true },
      { text: 'Book photographer', done: true },
    ],
  },
  {
    id: 'e2', title: "Sister's Birthday Pop-up", type: 'Birthday', date: 'Jun 22, 2026',
    daysLeft: 50, guests: 60, rsvpd: 38, budget: 500000, spent: 120000,
    status: 'draft', coverColor: 'from-violet-500 to-purple-600',
    vendors: [],
    todos: [{ text: 'Add venue details', done: false, due: 'May 5' }],
  },
];

const wishlistItems = [
  { name: 'Honeymoon Fund', target: 500000, raised: 185000, contributors: 12 },
  { name: 'KitchenAid Mixer', target: 85000, raised: 85000, contributors: 3 },
  { name: 'Travel Luggage Set', target: 120000, raised: 40000, contributors: 4 },
];

const recentActivity = [
  { type: 'rsvp', text: 'Aunty Ngozi confirmed attendance + 2', time: '2h ago', icon: '✅' },
  { type: 'gift', text: 'Gift contribution: ₦20,000 to Honeymoon Fund', time: '5h ago', icon: '🎁' },
  { type: 'vendor', text: 'Lens & Light confirmed your booking', time: 'Yesterday', icon: '📷' },
  { type: 'rsvp', text: '14 new RSVPs from save-the-date link', time: '2d ago', icon: '💌' },
];

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <button onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all text-left w-full ${onClick ? 'cursor-pointer' : 'cursor-default'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </button>
  );
}

function ExploringView() {
  const features = [
    { icon: '🎉', title: 'Plan any event', desc: 'Weddings, birthdays, corporate — every type, fully supported.' },
    { icon: '🛒', title: 'Book vendors', desc: 'Find and book from 12K+ verified vendors across Nigeria.' },
    { icon: '🎁', title: 'Create a wishlist', desc: 'Let guests contribute gifts or cash directly to your event.' },
    { icon: '✅', title: 'Manage tasks', desc: 'Stay on track with smart to-do lists and team collaboration.' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-brand-50 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-brand-600" />
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Welcome to EventPark</h2>
      <p className="text-gray-400 mb-10 leading-relaxed">
        You're all set! Create your first event to start planning, or explore what EventPark can do for you.
      </p>
      <Link to="/events/create"
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-colors mb-12">
        <Plus className="w-5 h-5" />
        Create your first event
      </Link>

      <div className="grid grid-cols-2 gap-4 text-left">
        {features.map(f => (
          <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-2xl mb-3">{f.icon}</div>
            <div className="font-bold text-gray-900 text-sm mb-1">{f.title}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanningView({ activeEvent, setActiveEvent, navigate, user }) {
  const budgetPct = Math.round((activeEvent.spent / activeEvent.budget) * 100);
  const rsvpPct = Math.round((activeEvent.rsvpd / activeEvent.guests) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Event switcher */}
      <div className="flex gap-3 flex-wrap">
        {myEvents.map(ev => (
          <button key={ev.id} onClick={() => setActiveEvent(ev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              activeEvent.id === ev.id
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.status === 'active' ? 'bg-green-500' : 'bg-yellow-400'}`} />
            {ev.title.split(' – ')[0]}
          </button>
        ))}
        <Link to="/events/create"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-dashed border-gray-300 text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-all">
          <Plus className="w-4 h-4" />
          Add event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Days to go" value={activeEvent.daysLeft} sub={activeEvent.date} color="bg-brand-50 text-brand-600" />
        <StatCard icon={Users} label="RSVPs" value={`${activeEvent.rsvpd}/${activeEvent.guests}`} sub={`${rsvpPct}% confirmed`} color="bg-green-50 text-green-600" />
        <StatCard icon={DollarSign} label="Budget used" value={`${budgetPct}%`}
          sub={`₦${(activeEvent.spent/1000000).toFixed(1)}M of ₦${(activeEvent.budget/1000000).toFixed(0)}M`}
          color="bg-orange-50 text-orange-500" onClick={() => {}} />
        <StatCard icon={Wallet} label="Wallet" value={`₦${((user?.walletBalance || 0)/1000).toFixed(0)}K`}
          sub="Available balance" color="bg-purple-50 text-purple-600" onClick={() => navigate('/wallet')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Budget tracker */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Budget Tracker</h3>
              <span className="text-xs text-gray-400">₦{(activeEvent.budget - activeEvent.spent).toLocaleString()} remaining</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500" style={{ width: `${budgetPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-4">
              <span>₦{(activeEvent.spent/1000000).toFixed(2)}M spent</span>
              <span>₦{(activeEvent.budget/1000000).toFixed(0)}M total</span>
            </div>
            <div className="space-y-2">
              {[
                { cat: 'Photography', amount: 250000, color: 'bg-brand-400' },
                { cat: 'Catering', amount: 680000, color: 'bg-orange-400' },
                { cat: 'Venue', amount: 1800000, color: 'bg-green-400' },
                { cat: 'Decor', amount: 320000, color: 'bg-purple-400' },
                { cat: 'Attire', amount: 190000, color: 'bg-pink-400' },
              ].map(item => (
                <div key={item.cat} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
                  <span className="text-xs text-gray-600 flex-grow">{item.cat}</span>
                  <span className="text-xs font-semibold text-gray-800">₦{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vendors */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Vendor Bookings</h3>
              <Link to="/discover/vendors" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
                Find more <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {activeEvent.vendors.map(v => (
                <div key={v.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {v.name[0]}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{v.name}</div>
                    <div className="text-xs text-gray-400">₦{v.amount.toLocaleString()}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    v.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    v.status === 'pending_escrow' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {v.status === 'confirmed' ? '✓ Confirmed' : v.status === 'pending_escrow' ? '⏳ Escrow' : '💬 Quoted'}
                  </span>
                </div>
              ))}
              {activeEvent.vendors.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No vendors yet.{' '}
                  <Link to="/discover/vendors" className="text-brand-600 hover:underline">Browse vendors →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Todos */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">To-do List</h3>
              <Link to="/dashboard/todos" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {activeEvent.todos.map((todo, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition ${todo.done ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${todo.done ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                    {todo.done && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm flex-grow ${todo.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{todo.text}</span>
                  {todo.due && !todo.done && <span className="text-xs text-orange-500 font-medium flex-shrink-0">Due {todo.due}</span>}
                </div>
              ))}
              <Link to="/dashboard/todos"
                className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-500 text-sm transition-all">
                <Plus className="w-4 h-4" />
                Add task
              </Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* RSVP donut */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">RSVPs</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#4f52e6" strokeWidth="2.5"
                    strokeDasharray={`${rsvpPct} ${100 - rsvpPct}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-gray-900">{rsvpPct}%</span>
                  <span className="text-xs text-gray-400">confirmed</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Going', count: activeEvent.rsvpd, color: 'text-green-600 bg-green-50' },
                { label: 'Pending', count: activeEvent.guests - activeEvent.rsvpd - 12, color: 'text-yellow-600 bg-yellow-50' },
                { label: 'Declined', count: 12, color: 'text-red-500 bg-red-50' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-2 ${s.color}`}>
                  <div className="text-lg font-bold">{s.count}</div>
                  <div className="text-xs font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Wishlist preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-4 h-4 text-pink-500" />
                Wishlist
              </h3>
              <Link to="/dashboard/wishlist" className="text-xs text-brand-600 font-semibold hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {wishlistItems.map(item => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="text-gray-400">{item.contributors} gifts</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500"
                      style={{ width: `${Math.min((item.raised / item.target) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>₦{item.raised.toLocaleString()}</span>
                    <span>₦{item.target.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {[
                { label: 'Invite collaborator', icon: Users, to: '/dashboard/collaborators' },
                { label: 'Day-of check-in', icon: QrCode, to: '/checkin/e1' },
                { label: 'Top up wallet', icon: Wallet, to: '/wallet' },
                { label: 'Browse vendors', icon: Star, to: '/discover/vendors' },
              ].map(action => (
                <Link key={action.label} to={action.to}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm text-gray-700 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <action.icon className="w-4 h-4" />
                  </div>
                  {action.label}
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{act.icon}</span>
                  <div>
                    <p className="text-xs text-gray-700 leading-snug">{act.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeEvent, setActiveEvent] = useState(myEvents[0]);
  const hasEvents = myEvents.length > 0;

  if (!hasEvents) return <ExploringView />;
  return <PlanningView activeEvent={activeEvent} setActiveEvent={setActiveEvent} navigate={navigate} user={user} />;
}
