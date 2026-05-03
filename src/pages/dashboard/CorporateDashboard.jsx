import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, Users, DollarSign, Wallet, Bell, Building2,
  ChevronRight, CheckCircle, AlertCircle, ArrowUpRight, FileText,
  TrendingUp, LogOut, Zap, BarChart2, Settings, Clock, Shield,
  Send, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const events = [
  {
    id: 'corp1', title: '2026 Annual Company Retreat', type: 'Internal', date: 'Aug 15–17, 2026',
    daysLeft: 104, budget: 40000000, spent: 12400000, headcount: 250, rsvpd: 198,
    status: 'active', approvalsPending: 2,
  },
  {
    id: 'corp2', title: 'Q2 All-Hands Town Hall', type: 'Internal', date: 'Jun 30, 2026',
    daysLeft: 58, budget: 3500000, spent: 800000, headcount: 250, rsvpd: 210,
    status: 'planning', approvalsPending: 0,
  },
  {
    id: 'corp3', title: 'Product Launch — NexGen Suite', type: 'External', date: 'Jul 22, 2026',
    daysLeft: 80, budget: 15000000, spent: 4200000, headcount: 500, rsvpd: 312,
    status: 'active', approvalsPending: 1,
  },
];

const pendingApprovals = [
  {
    id: 'a1', event: '2026 Annual Company Retreat', vendor: 'Transcorp Hilton – Venue Deposit',
    amount: 8500000, requestedBy: 'Chioma N.', type: 'vendor', urgency: 'high',
  },
  {
    id: 'a2', event: '2026 Annual Company Retreat', vendor: 'Royal Caterers – Full Engagement',
    amount: 12000000, requestedBy: 'Chioma N.', type: 'vendor', urgency: 'medium',
  },
  {
    id: 'a3', event: 'Product Launch – NexGen Suite', vendor: 'AV Solutions Ng – Equipment',
    amount: 2800000, requestedBy: 'Emeka F.', type: 'vendor', urgency: 'medium',
  },
];

const spendCategories = [
  { name: 'Venue', amount: 8500000, budget: 18000000, color: 'bg-brand-400' },
  { name: 'Catering', amount: 3200000, budget: 12000000, color: 'bg-orange-400' },
  { name: 'A/V & Tech', amount: 1400000, budget: 4000000, color: 'bg-purple-400' },
  { name: 'Transport', amount: 850000, budget: 3000000, color: 'bg-green-400' },
  { name: 'Accommodation', amount: 0, budget: 8000000, color: 'bg-blue-400' },
];

export default function CorporateDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState(pendingApprovals);
  const [activeEvent, setActiveEvent] = useState(events[0]);

  const handleApprove = (id) => setApprovals(prev => prev.filter(a => a.id !== id));
  const handleReject = (id) => setApprovals(prev => prev.filter(a => a.id !== id));

  const totalBudget = activeEvent.budget;
  const totalSpent = activeEvent.spent;
  const spentPct = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-950 flex flex-col z-40 hidden lg:flex">
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">EventPark <span className="text-orange-400 text-xs">Corporate</span></span>
          </Link>
        </div>

        <div className="px-4 py-4 border-b border-white/10">
          <div className="p-2 rounded-xl">
            <div className="text-white text-sm font-semibold">{user?.companyName || 'TechFin Nigeria'}</div>
            <div className="text-gray-500 text-xs mt-0.5">RC {user?.rcNumber || 'RC1234567'}</div>
            <div className="flex items-center gap-1 mt-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-green-400 font-medium">KYB Verified</span>
            </div>
          </div>
        </div>

        <nav className="flex-grow px-3 py-4 space-y-1">
          {[
            { label: 'Events', icon: Calendar, active: true },
            { label: 'Approvals', icon: CheckCircle, badge: approvals.length },
            { label: 'Vendors & RFQ', icon: Send },
            { label: 'Corporate Wallet', icon: Wallet, href: '/wallet' },
            { label: 'Reports', icon: BarChart2 },
            { label: 'Team & Roles', icon: Users },
            { label: 'Settings', icon: Settings },
          ].map(item => (
            item.href ? (
              <Link key={item.label} to={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ) : (
              <button key={item.label} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className="w-4 h-4" />
                <span className="flex-grow text-left">{item.label}</span>
                {item.badge > 0 && (
                  <span className="w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{item.badge}</span>
                )}
              </button>
            )
          ))}
        </nav>

        <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-800">
          <div className="text-orange-200 text-xs font-medium mb-1">Corporate Wallet</div>
          <div className="text-white text-xl font-extrabold">₦{((user?.walletBalance || 0)/1000000).toFixed(1)}M</div>
          <div className="text-orange-300 text-xs mt-0.5">₦{((user?.walletEscrow || 0)/1000000).toFixed(1)}M in escrow</div>
          <Link to="/wallet" className="mt-3 flex items-center gap-1 text-white text-xs font-semibold hover:underline">
            Manage <ArrowUpRight className="w-3 h-3" />
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
            <h1 className="text-lg font-bold text-gray-900">Corporate Events</h1>
            <p className="text-xs text-gray-400">{user?.companyName} · {approvals.length} approvals pending</p>
          </div>
          <div className="flex items-center gap-3">
            {approvals.length > 0 && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5" />
                {approvals.length} approvals needed
              </div>
            )}
            <button className="relative w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">{approvals.length}</span>
            </button>
            <Link to="/events/create" className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
              <Plus className="w-4 h-4" />
              New Event
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Event selector */}
          <div className="flex gap-3 flex-wrap">
            {events.map(ev => (
              <button
                key={ev.id}
                onClick={() => setActiveEvent(ev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${activeEvent.id === ev.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
              >
                <span className={`w-2 h-2 rounded-full ${ev.status === 'active' ? 'bg-green-500' : 'bg-blue-400'}`} />
                {ev.title.split(' – ')[0].substring(0, 28)}
                {ev.approvalsPending > 0 && (
                  <span className="w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{ev.approvalsPending}</span>
                )}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Budget Spent', value: `${spentPct}%`, sub: `₦${(totalSpent/1000000).toFixed(1)}M of ₦${(totalBudget/1000000).toFixed(0)}M`, icon: DollarSign, color: 'bg-orange-50 text-orange-500' },
              { label: 'Headcount', value: `${activeEvent.rsvpd}/${activeEvent.headcount}`, sub: `${Math.round(activeEvent.rsvpd/activeEvent.headcount*100)}% confirmed`, icon: Users, color: 'bg-brand-50 text-brand-600' },
              { label: 'Days Away', value: activeEvent.daysLeft, sub: activeEvent.date, icon: Calendar, color: 'bg-green-50 text-green-600' },
              { label: 'Approvals', value: approvals.length, sub: 'Pending your action', icon: Shield, color: 'bg-red-50 text-red-500' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">

              {/* Pending Approvals */}
              {approvals.length > 0 && (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-red-500" />
                    <h3 className="font-bold text-gray-900">Pending Approvals</h3>
                    <span className="ml-auto text-xs text-gray-400">Requires CFO action</span>
                  </div>
                  <div className="space-y-3">
                    {approvals.map(a => (
                      <div key={a.id} className={`p-4 rounded-2xl border ${a.urgency === 'high' ? 'border-red-100 bg-red-50' : 'border-orange-100 bg-orange-50'}`}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{a.vendor}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{a.event} · Requested by {a.requestedBy}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-gray-900">₦{a.amount.toLocaleString()}</div>
                            <div className={`text-xs font-semibold mt-0.5 ${a.urgency === 'high' ? 'text-red-500' : 'text-orange-500'}`}>
                              {a.urgency === 'high' ? '🔴 High priority' : '🟡 Medium'}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(a.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(a.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold py-2 rounded-xl transition"
                          >
                            Reject
                          </button>
                          <button className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold px-3 py-2 rounded-xl transition">
                            <FileText className="w-3.5 h-3.5" />
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                    {approvals.length === 0 && (
                      <div className="text-center py-4 text-green-600 font-medium text-sm flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        All caught up! No pending approvals.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Spend tracker */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Budget by Category</h3>
                  <button className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold hover:underline">
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>

                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex mb-4">
                  {spendCategories.map(cat => (
                    <div
                      key={cat.name}
                      className={`h-full ${cat.color} transition-all`}
                      style={{ width: `${(cat.amount / totalBudget) * 100}%` }}
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  {spendCategories.map(cat => {
                    const catPct = Math.round((cat.amount / cat.budget) * 100);
                    return (
                      <div key={cat.name} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${cat.color}`} />
                        <span className="text-sm text-gray-600 flex-grow">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full">
                            <div className={`h-1.5 rounded-full ${cat.color}`} style={{ width: `${catPct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-12 text-right">₦{(cat.amount/1000).toFixed(0)}K</span>
                          <span className="text-xs text-gray-400 w-12 text-right">/ ₦{(cat.budget/1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* RSVP / Headcount */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">Headcount Tracker</h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-extrabold text-gray-900">{activeEvent.rsvpd}</div>
                  <div className="text-sm text-gray-400">of {activeEvent.headcount} employees</div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all" style={{ width: `${Math.round(activeEvent.rsvpd/activeEvent.headcount*100)}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
                  <div className="bg-blue-50 rounded-xl p-2">
                    <div className="font-bold text-blue-700">84</div>
                    <div className="text-blue-500">Dietary needs</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2">
                    <div className="font-bold text-green-700">142</div>
                    <div className="text-green-500">Transport req.</div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Send RFQ to vendors', icon: Send, href: '/discover/vendors' },
                    { label: 'Export receipts pack', icon: Download, action: () => {} },
                    { label: 'Manage collaborators', icon: Users, href: '/corporate/team' },
                    { label: 'Day-of check-in', icon: Shield, href: '/checkin/corp1' },
                  ].map(a => (
                    a.href ? (
                      <Link key={a.label} to={a.href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 font-medium transition-all">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                          <a.icon className="w-4 h-4" />
                        </div>
                        {a.label}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300" />
                      </Link>
                    ) : (
                      <button key={a.label} onClick={a.action} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 font-medium transition-all">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                          <a.icon className="w-4 h-4" />
                        </div>
                        {a.label}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300" />
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Audit note */}
              <div className="bg-gray-950 rounded-2xl p-5 text-sm">
                <div className="text-white font-semibold mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  Audit Trail Active
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  All vendor payments, approvals, and budget changes are logged with timestamps for your finance team.
                </p>
                <button className="mt-3 flex items-center gap-1.5 text-xs text-green-400 font-semibold hover:underline">
                  <Download className="w-3.5 h-3.5" />
                  Download receipts pack
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
