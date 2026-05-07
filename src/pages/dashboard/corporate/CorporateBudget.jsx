import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, BarChart2, AlertTriangle, Plus, ChevronRight, X, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { events, orgs } from '../../../lib/api';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`;

function pct(spent, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((spent / total) * 100));
}

function usedColor(p) {
  if (p >= 90) return 'text-red-600';
  if (p >= 70) return 'text-yellow-600';
  return 'text-green-600';
}

function usedBarColor(p) {
  if (p >= 90) return 'bg-red-500';
  if (p >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

const STORAGE_KEY = (orgId) => `ep_corp_budget_${orgId}`;

function loadSavedBudget(orgId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(orgId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveBudget(orgId, data) {
  try {
    localStorage.setItem(STORAGE_KEY(orgId), JSON.stringify(data));
  } catch {}
}

// ─── Set Budget Modal ─────────────────────────────────────────────────────────

function SetBudgetModal({ orgId, current, onSave, onClose }) {
  const [totalNgn, setTotalNgn] = useState(current?.total_ngn ? String(current.total_ngn) : '');
  const [period, setPeriod] = useState(current?.period || 'FY 2026');
  const [depts, setDepts] = useState(current?.depts || [{ name: '', amount: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addDeptRow = () => setDepts((d) => [...d, { name: '', amount: '' }]);

  const updateDept = (i, field, val) =>
    setDepts((d) => d.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const removeDept = (i) => setDepts((d) => d.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!totalNgn || isNaN(Number(totalNgn)) || Number(totalNgn) <= 0) {
      return setError('Enter a valid budget amount.');
    }

    setSaving(true);
    const validDepts = depts.filter((d) => d.name.trim());
    const data = {
      total_ngn: Number(totalNgn),
      period: period.trim() || 'FY 2026',
      depts: validDepts.map((d) => ({
        name: d.name.trim(),
        amount: Number(d.amount) || 0,
      })),
    };
    saveBudget(orgId, data);
    onSave(data);
    setSaving(false);
    onClose();
    toast.success('Annual budget saved.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Set Annual Budget</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Period */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Period</label>
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="FY 2026"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
          </div>

          {/* Total */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Annual Budget Amount *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">₦</span>
              <input
                type="number"
                min="0"
                value={totalNgn}
                onChange={(e) => setTotalNgn(e.target.value)}
                placeholder="50,000,000"
                className="w-full pl-8 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Department breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">Department Breakdown (optional)</label>
            </div>
            <div className="space-y-2">
              {depts.map((dept, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={dept.name}
                    onChange={(e) => updateDept(i, 'name', e.target.value)}
                    placeholder="Department name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₦</span>
                    <input
                      type="number"
                      min="0"
                      value={dept.amount}
                      onChange={(e) => updateDept(i, 'amount', e.target.value)}
                      placeholder="Amount"
                      className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDept(i)}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addDeptRow}
              className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add department
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />{error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ['By Event', 'By Department', 'Summary'];

// ─── By Event Tab ─────────────────────────────────────────────────────────────

function ByEventTab({ eventList }) {
  if (eventList.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-4">
        <BarChart2 className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400 text-sm text-center">
          No events yet. Create events to track spend.
        </p>
        <Link
          to="/events/create"
          className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:underline"
        >
          Create event <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Event</th>
            <th className="px-4 py-3 text-right">Budget</th>
            <th className="px-4 py-3 text-right">Committed</th>
            <th className="px-4 py-3 text-right">Paid</th>
            <th className="px-4 py-3 text-right">Remaining</th>
            <th className="px-4 py-3 text-right">% Used</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {eventList.map((ev) => {
            const budget = ev.budget_total || 0;
            const committed = ev.committed || 0;
            const paid = ev.paid || 0;
            const remaining = budget - committed;
            const used = pct(committed, budget);
            return (
              <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 truncate max-w-[180px]">{ev.name || ev.title || 'Untitled event'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{ev.event_date || ev.date || '—'}</div>
                </td>
                <td className="px-4 py-3 text-right text-gray-700 font-medium whitespace-nowrap">{fmt(budget)}</td>
                <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">{fmt(committed)}</td>
                <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">{fmt(paid)}</td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-gray-900">{fmt(remaining)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-bold text-xs ${usedColor(used)}`}>
                    {budget > 0 ? `${used}%` : '—'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── By Department Tab ────────────────────────────────────────────────────────

function ByDeptTab({ orgId, savedDepts }) {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) { setLoading(false); return; }
    orgs.listDepts(orgId)
      .then((data) => setDepts(Array.isArray(data) ? data : []))
      .catch(() => setDepts([]))
      .finally(() => setLoading(false));
  }, [orgId]);

  // Merge API depts with local saved dept budgets
  const merged = depts.map((d) => {
    const saved = savedDepts?.find((s) => s.name === d.name);
    return {
      ...d,
      allocated: saved?.amount || d.budget || 0,
      committed: d.committed || 0,
      remaining: (saved?.amount || d.budget || 0) - (d.committed || 0),
    };
  });

  // If no API depts but we have saved dept budgets, show those
  const rows = merged.length > 0 ? merged : (savedDepts || []).map((d) => ({
    name: d.name,
    allocated: d.amount,
    committed: 0,
    remaining: d.amount,
  }));

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-4">
        <TrendingUp className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400 text-sm text-center">
          No departments configured.
        </p>
        <Link
          to="/dashboard/employees"
          className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:underline"
        >
          Add departments <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3 text-right">Allocated</th>
            <th className="px-4 py-3 text-right">Committed</th>
            <th className="px-4 py-3 text-right">Remaining</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((dept, i) => (
            <tr key={dept.id || i} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{dept.name}</td>
              <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">{fmt(dept.allocated)}</td>
              <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">{fmt(dept.committed)}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">{fmt(dept.remaining)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────

function SummaryTab({ eventList, savedDepts }) {
  const rows = [
    ...eventList.map((ev) => ({
      label: ev.name || ev.title || 'Untitled event',
      spent: ev.committed || 0,
      budget: ev.budget_total || 0,
      type: 'event',
    })),
    ...(savedDepts || []).map((d) => ({
      label: d.name,
      spent: 0,
      budget: d.amount,
      type: 'dept',
    })),
  ].filter((r) => r.budget > 0);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-4">
        <BarChart2 className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400 text-sm">Create events or set a budget to see the summary.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row, i) => {
        const p = pct(row.spent, row.budget);
        return (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  row.type === 'event' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {row.type === 'event' ? 'Event' : 'Dept'}
                </span>
                <span className="text-sm font-semibold text-gray-900 truncate">{row.label}</span>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {fmt(row.spent)} of {fmt(row.budget)}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usedBarColor(p)}`}
                style={{ width: `${p}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs font-bold ${usedColor(p)}`}>{p}% used</span>
              <span className="text-xs text-gray-400">{fmt(row.budget - row.spent)} remaining</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CorporateBudget() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [savedBudget, setSavedBudget] = useState(() => loadSavedBudget(orgId));
  const [showSetModal, setShowSetModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [eventList, setEventList] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Fetch events
  useEffect(() => {
    events.list()
      .then((data) => setEventList(Array.isArray(data) ? data : []))
      .catch(() => setEventList([]))
      .finally(() => setLoadingEvents(false));
  }, []);

  // Stats
  const annualBudget = savedBudget?.total_ngn || 0;
  const allocatedToEvents = eventList.reduce((s, ev) => s + (ev.budget_total || 0), 0);
  const committed = eventList.reduce((s, ev) => s + (ev.committed || 0), 0);
  const available = annualBudget - committed;

  const stats = [
    { label: 'Annual Budget', value: fmt(annualBudget), icon: DollarSign, color: 'text-gray-900', sub: savedBudget?.period || 'Not set' },
    { label: 'Allocated to Events', value: fmt(allocatedToEvents), icon: TrendingUp, color: 'text-blue-600', sub: `${eventList.length} event${eventList.length !== 1 ? 's' : ''}` },
    { label: 'Committed', value: fmt(committed), icon: BarChart2, color: 'text-orange-600', sub: 'POs + invoices' },
    {
      label: 'Available',
      value: fmt(Math.max(0, available)),
      icon: DollarSign,
      color: available < 0 ? 'text-red-600' : 'text-green-600',
      sub: annualBudget > 0 ? `${Math.max(0, Math.round((available / annualBudget) * 100))}% of annual` : 'Set annual budget',
    },
  ];

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900">Company Budget</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
              {savedBudget?.period || 'FY 2026'}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Annual budget envelope for your organisation</p>
        </div>
        <div className="sm:ml-auto">
          <button
            onClick={() => setShowSetModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Set annual budget
          </button>
        </div>
      </div>

      {/* ── Local storage banner ────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Annual budget is stored locally — financial integrations coming soon.
        </p>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
            </div>
            <div className={`text-lg font-extrabold ${stat.color}`}>{stat.value}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex gap-1 border-b border-gray-100 mb-6">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === i
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 0 && (
          loadingEvents ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <ByEventTab eventList={eventList} />
          )
        )}
        {activeTab === 1 && (
          <ByDeptTab orgId={orgId} savedDepts={savedBudget?.depts} />
        )}
        {activeTab === 2 && (
          <SummaryTab eventList={eventList} savedDepts={savedBudget?.depts} />
        )}
      </div>

      {/* ── Set Budget Modal ─────────────────────────────────────────────────── */}
      {showSetModal && (
        <SetBudgetModal
          orgId={orgId}
          current={savedBudget}
          onSave={setSavedBudget}
          onClose={() => setShowSetModal(false)}
        />
      )}
    </div>
  );
}
