import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, Users, DollarSign, Wallet, Bell, Star,
  ChevronRight, Clock, AlertCircle, ArrowUpRight, Briefcase,
  CheckCircle, TrendingUp, LogOut, Zap, BarChart2, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const clients = [
  {
    id: 'c1', name: 'Adaeze & Chuka', type: 'Wedding', date: 'Aug 30, 2026',
    daysLeft: 119, budget: 4500000, spent: 2100000, status: 'active',
    pendingTasks: 3, vendorsPending: 2, color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'c2', name: 'Kemi Adewale 40th', type: 'Birthday', date: 'Jul 5, 2026',
    daysLeft: 63, budget: 1200000, spent: 890000, status: 'critical',
    pendingTasks: 5, vendorsPending: 1, color: 'from-violet-400 to-purple-600',
  },
  {
    id: 'c3', name: 'TechLagos Summit', type: 'Conference', date: 'Sep 20, 2026',
    daysLeft: 140, budget: 8000000, spent: 1200000, status: 'planning',
    pendingTasks: 8, vendorsPending: 4, color: 'from-brand-400 to-brand-600',
  },
  {
    id: 'c4', name: 'Obi & Ngozi Naming', type: 'Naming Ceremony', date: 'Jun 1, 2026',
    daysLeft: 29, budget: 600000, spent: 540000, status: 'finalizing',
    pendingTasks: 1, vendorsPending: 0, color: 'from-orange-400 to-orange-600',
  },
];

const thisWeek = [
  { type: 'payment', client: 'Adaeze & Chuka', text: 'Catering deposit due', amount: 340000, due: 'Today', urgent: true },
  { type: 'follow', client: 'Kemi Adewale 40th', text: 'Chase photographer invoice', due: 'Tomorrow', urgent: true },
  { type: 'rsvp', client: 'TechLagos Summit', text: 'Speaker confirmations needed', due: 'May 7', urgent: false },
  { type: 'review', client: 'Obi & Ngozi Naming', text: 'Final vendor list review', due: 'May 8', urgent: false },
];

const statusColors = {
  active: 'bg-green-100 text-green-700',
  critical: 'bg-red-100 text-red-700',
  planning: 'bg-blue-100 text-blue-700',
  finalizing: 'bg-orange-100 text-orange-700',
};

export default function PlannerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('clients'); // 'clients' | 'week'

  const totalRevenue = clients.reduce((a, c) => a + c.budget * 0.15, 0);
  const totalPending = clients.reduce((a, c) => a + c.pendingTasks, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-950 flex flex-col z-40 hidden lg:flex">
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">EventPark <span className="text-purple-400 text-xs">Planner</span></span>
          </Link>
        </div>

        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <div className="text-white text-sm font-semibold">{user?.businessName || `${user?.firstName} Events`}</div>
              <div className="text-gray-500 text-xs">Event Planner · Pro</div>
            </div>
          </div>
        </div>

        <nav className="flex-grow px-3 py-4 space-y-1">
          {[
            { label: 'All Clients', icon: Briefcase, active: view === 'clients', action: () => setView('clients') },
            { label: 'This Week', icon: Clock, active: view === 'week', action: () => setView('week') },
            { label: 'Vendor Rolodex', icon: Star, href: '/discover/vendors' },
            { label: 'Wallet', icon: Wallet, href: '/wallet' },
            { label: 'Analytics', icon: BarChart2, href: '/planner/analytics' },
            { label: 'Settings', icon: Settings, href: '/planner/settings' },
          ].map(item => (
            item.href ? (
              <Link key={item.label} to={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ) : (
              <button key={item.label} onClick={item.action} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          ))}
        </nav>

        <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800">
          <div className="text-purple-200 text-xs font-medium mb-1">Wallet Balance</div>
          <div className="text-white text-xl font-extrabold">₦{((user?.walletBalance || 0) / 1000).toFixed(0)}K</div>
          <div className="text-purple-300 text-xs mt-0.5">₦{((user?.walletEscrow || 0) / 1000).toFixed(0)}K in escrow</div>
          <Link to="/wallet" className="mt-3 flex items-center gap-1 text-white text-xs font-semibold hover:underline">
            Manage wallet <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 mx-3 mb-4 px-3 py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 text-sm transition-all">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      <div className="lg:pl-64 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Planner Dashboard</h1>
            <p className="text-xs text-gray-400">{clients.length} active clients · {totalPending} tasks pending</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-xl p-1 text-xs">
              {['clients', 'week'].map(v => (
                <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg font-medium capitalize transition ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                  {v === 'week' ? 'This Week' : 'All Clients'}
                </button>
              ))}
            </div>
            <button className="relative w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">5</span>
            </button>
            <Link to="/events/create" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
              <Plus className="w-4 h-4" />
              New Client
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Clients', value: clients.length, icon: Briefcase, color: 'bg-purple-50 text-purple-600' },
              { label: 'Tasks Pending', value: totalPending, icon: AlertCircle, color: 'bg-orange-50 text-orange-500' },
              { label: 'Platform Earnings', value: `₦${(totalRevenue/1000).toFixed(0)}K`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
              { label: 'Events This Month', value: '2 upcoming', icon: Calendar, color: 'bg-brand-50 text-brand-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {view === 'week' ? (
            /* This Week View */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5">This Week's Priorities</h2>
              <div className="space-y-3">
                {thisWeek.map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition ${item.urgent ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                    <div className={`w-2 h-10 rounded-full flex-shrink-0 ${item.urgent ? 'bg-red-400' : 'bg-gray-200'}`} />
                    <div className="flex-grow">
                      <div className="text-sm font-semibold text-gray-800">{item.text}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Client: {item.client}</div>
                    </div>
                    {item.amount && (
                      <div className="text-sm font-bold text-gray-900">₦{item.amount.toLocaleString()}</div>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.urgent ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {item.due}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Client Grid View */
            <div className="grid md:grid-cols-2 gap-5">
              {clients.map(client => {
                const pct = Math.round((client.spent / client.budget) * 100);
                return (
                  <div key={client.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`h-2 bg-gradient-to-r ${client.color}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{client.name}</h3>
                          <p className="text-xs text-gray-400">{client.type} · {client.date}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[client.status]}`}>
                          {client.status}
                        </span>
                      </div>

                      <div className="flex gap-3 mb-4">
                        <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{client.daysLeft}</div>
                          <div className="text-xs text-gray-400">days left</div>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                          <div className="text-lg font-bold text-orange-500">{client.pendingTasks}</div>
                          <div className="text-xs text-gray-400">tasks</div>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                          <div className="text-lg font-bold text-yellow-500">{client.vendorsPending}</div>
                          <div className="text-xs text-gray-400">vendors</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>Budget: ₦{(client.spent/1000).toFixed(0)}K / ₦{(client.budget/1000).toFixed(0)}K</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div className={`h-2 rounded-full bg-gradient-to-r ${client.color} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <Link
                        to={`/planner/clients/${client.id}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                      >
                        Open workspace
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Add client */}
              <Link to="/events/create" className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center hover:border-purple-300 hover:bg-purple-50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center mb-3 transition">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition" />
                </div>
                <p className="font-semibold text-gray-500 group-hover:text-purple-700">Add new client</p>
                <p className="text-xs text-gray-400 mt-1">Create a client workspace</p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
