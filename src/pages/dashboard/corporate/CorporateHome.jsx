import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, DollarSign, Wallet, AlertCircle, CheckCircle,
  ChevronRight, RefreshCw, Plus, TrendingUp, Building2, Users,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { orgs, events, approvals, corpWallet } from '../../../lib/api';

function fmt(n) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

function KpiTile({ icon: Icon, label, value, sub, accent, to }) {
  const inner = (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all ${to ? 'cursor-pointer' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

const STATUS_PILL = {
  active:    'bg-green-100 text-green-700',
  planning:  'bg-blue-100 text-blue-700',
  draft:     'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-500',
};

const APPROVAL_TYPE_BADGE = {
  PO:       'bg-purple-100 text-purple-700',
  Invoice:  'bg-blue-100 text-blue-700',
  Expense:  'bg-orange-100 text-orange-700',
  'RFQ Award': 'bg-teal-100 text-teal-700',
};

export default function CorporateHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.orgId;

  const [org, setOrg] = useState(null);
  const [evtList, setEvtList] = useState([]);
  const [approvalList, setApprovalList] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [orgRes, evtRes] = await Promise.all([
        orgs.getMe(),
        events.list(),
      ]);
      setOrg(orgRes);
      setEvtList(Array.isArray(evtRes) ? evtRes : evtRes?.events || []);

      const resolvedOrgId = orgRes?.id || orgId;
      if (resolvedOrgId) {
        const [appRes, walRes] = await Promise.allSettled([
          approvals.list(resolvedOrgId, { status: 'pending' }),
          corpWallet.get(resolvedOrgId),
        ]);
        if (appRes.status === 'fulfilled') {
          const d = appRes.value;
          setApprovalList(Array.isArray(d) ? d : d?.approvals || []);
        }
        if (walRes.status === 'fulfilled') setWalletData(walRes.value);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-600 font-medium">{error}</p>
        <button onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const activeEvents = evtList.filter(e => e.status === 'active' || e.status === 'planning');
  const totalBudget = evtList.reduce((s, e) => s + (e.budget || 0), 0);
  const walletBalance = walletData?.balance ?? 0;
  const pendingApprovals = approvalList.filter(a => a.status === 'pending');
  const recentEvents = evtList.slice(0, 3);
  const pendingPreview = pendingApprovals.slice(0, 5);

  const nextActions = [
    !evtList.length && { label: 'Create your first corporate event', to: '/events/create', icon: Calendar },
    pendingApprovals.length > 0 && { label: `Review ${pendingApprovals.length} pending approval${pendingApprovals.length > 1 ? 's' : ''}`, to: '/dashboard/approvals', icon: CheckCircle },
    !walletData && { label: 'Set up your corporate wallet', to: '/dashboard/wallet', icon: Wallet },
    !org?.members_count && { label: 'Invite team members', to: '/dashboard/employees', icon: Users },
  ].filter(Boolean);

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-5xl">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {org?.name || user?.companyName || 'Your organisation'} · Corporate Dashboard
        </p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          icon={Calendar}
          label="Active Events"
          value={activeEvents.length}
          sub={`${evtList.length} total`}
          accent="bg-orange-50 text-orange-600"
          to="/dashboard/events"
        />
        <KpiTile
          icon={AlertCircle}
          label="Pending Approvals"
          value={pendingApprovals.length}
          sub="Awaiting review"
          accent="bg-yellow-50 text-yellow-600"
          to="/dashboard/approvals"
        />
        <KpiTile
          icon={DollarSign}
          label="Total Budget"
          value={totalBudget > 0 ? fmt(totalBudget) : '—'}
          sub="Across all events"
          accent="bg-blue-50 text-blue-600"
        />
        <KpiTile
          icon={Wallet}
          label="Wallet Balance"
          value={walletData ? fmt(walletBalance) : '—'}
          sub={walletData ? 'Available' : 'Not set up'}
          accent="bg-green-50 text-green-600"
          to="/dashboard/wallet"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Recent Events + Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Events */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Events</h3>
              <Link to="/dashboard/events"
                className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {recentEvents.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm mb-3">No events yet</p>
                <Link to="/events/create"
                  className="inline-flex items-center gap-1 text-orange-600 font-semibold text-sm hover:underline">
                  <Plus className="w-4 h-4" />
                  Create your first event
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map(ev => {
                  const budgetPct = ev.budget > 0 ? Math.round(((ev.spent || 0) / ev.budget) * 100) : 0;
                  const pill = STATUS_PILL[ev.status] || STATUS_PILL.draft;
                  return (
                    <div key={ev.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {(ev.title || 'E')[0].toUpperCase()}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm truncate">{ev.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${pill}`}>
                            {ev.status}
                          </span>
                        </div>
                        {ev.date && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {ev.date}
                          </div>
                        )}
                        {ev.budget > 0 && (
                          <div className="mt-1.5">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-orange-400 transition-all"
                                style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                              <span>{fmt(ev.spent || 0)} spent</span>
                              <span>{budgetPct}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <Link to={`/dashboard/events/${ev.id}`}
                        className="text-orange-600 hover:text-orange-700 flex-shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Pending Approvals</h3>
              <Link to="/dashboard/approvals"
                className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {pendingPreview.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No pending approvals — you&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPreview.map(ap => {
                  const typeBadge = APPROVAL_TYPE_BADGE[ap.type] || 'bg-gray-100 text-gray-600';
                  return (
                    <div key={ap.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-yellow-200 transition-all">
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-semibold text-gray-900 text-sm">{ap.ref || ap.id}</span>
                          {ap.type && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${typeBadge}`}>
                              {ap.type}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {ap.vendor_name && <span>{ap.vendor_name} · </span>}
                          {ap.amount != null && <span>{fmt(ap.amount)} · </span>}
                          <span>{ap.requested_by_name || 'Unknown requester'}</span>
                        </div>
                      </div>
                      <Link to="/dashboard/approvals"
                        className="text-xs text-orange-600 font-semibold hover:underline flex-shrink-0">
                        Review
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: What's next */}
        <div className="space-y-6">
          {nextActions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                What&apos;s next
              </h3>
              <div className="space-y-1">
                {nextActions.map((action) => (
                  <Link key={action.label} to={action.to}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50 transition-all text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="flex-grow">{action.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Org summary */}
          {org && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-500" />
                Organisation
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name</span>
                  <span className="font-semibold text-gray-800 truncate max-w-[60%] text-right">{org.name || '—'}</span>
                </div>
                {org.industry && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Industry</span>
                    <span className="font-semibold text-gray-800">{org.industry}</span>
                  </div>
                )}
                {org.members_count != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Members</span>
                    <span className="font-semibold text-gray-800">{org.members_count}</span>
                  </div>
                )}
              </div>
              <Link to="/dashboard/employees"
                className="mt-3 flex items-center gap-1 text-xs text-orange-600 font-semibold hover:underline">
                Manage team <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Quick Links</h3>
            <div className="space-y-1">
              {[
                { label: 'Manage events', to: '/dashboard/events', icon: Calendar },
                { label: 'Approvals inbox', to: '/dashboard/approvals', icon: CheckCircle },
                { label: 'Team members', to: '/dashboard/employees', icon: Users },
                { label: 'Corporate wallet', to: '/dashboard/wallet', icon: Wallet },
              ].map(link => (
                <Link key={link.label} to={link.to}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm text-gray-700 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="flex-grow">{link.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
