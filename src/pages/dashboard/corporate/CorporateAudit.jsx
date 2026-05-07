import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Download, CheckCircle2, AlertTriangle, RefreshCw, AlertCircle, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { auditLog } from '../../../lib/api';

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');

function fmtDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const ACTION_TYPES = [
  'All',
  'create', 'approve', 'reject', 'delete',
  'update', 'login', 'payment', 'system',
];

function rowBorderColor(action) {
  if (!action) return 'border-gray-200';
  const a = action.toLowerCase();
  if (a.includes('create') || a.includes('approve')) return 'border-green-400';
  if (a.includes('reject') || a.includes('delete')) return 'border-red-400';
  if (a.includes('system') || a.includes('login')) return 'border-blue-400';
  return 'border-gray-300';
}

export default function CorporateAudit() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actorSearch, setActorSearch] = useState('');
  const [actionType, setActionType] = useState('All');

  const fetchLogs = useCallback(async () => {
    if (!orgId) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;
      if (actionType && actionType !== 'All') params.action = actionType;
      const res = await auditLog.list(orgId, params);
      setLogs(Array.isArray(res) ? res : res?.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, startDate, endDate, actionType]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleVerify = async () => {
    if (!orgId) return;
    try {
      setVerifying(true);
      const res = await auditLog.verify(orgId);
      if (res?.valid || res?.ok || res?.status === 'ok') {
        toast.success('Chain verified ✓ — no tampering detected.');
      } else {
        toast.error('Warning: chain integrity check failed ⚠️');
      }
    } catch {
      toast.error('Warning: chain broken ⚠️ — please contact support.');
    } finally {
      setVerifying(false);
    }
  };

  const handleExport = async () => {
    if (!orgId) return;
    try {
      setExporting(true);
      const res = await auditLog.export(orgId);
      // Try to trigger a download if the backend returns CSV text or a URL
      if (typeof res === 'string') {
        const blob = new Blob([res], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${orgId}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (res?.url) {
        window.open(res.url, '_blank');
      } else {
        toast.success('Export initiated. Check your email shortly.');
      }
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Client-side actor filter (applied after API fetch since API may not support it)
  const filtered = logs.filter(log => {
    if (!actorSearch.trim()) return true;
    const search = actorSearch.toLowerCase();
    return (
      (log.actor_name || '').toLowerCase().includes(search) ||
      (log.actor_email || '').toLowerCase().includes(search) ||
      (log.actor_id || '').toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Audit Log</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Tamper-evident record of every action in your organisation.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-4">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-60 bg-white">
            {verifying
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CheckCircle2 className="w-4 h-4" />
            }
            Verify chain
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-60 bg-white">
            {exporting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />
            }
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Actor</label>
          <input
            value={actorSearch}
            onChange={e => setActorSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-52"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Action type</label>
          <select
            value={actionType}
            onChange={e => setActionType(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {ACTION_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All actions' : t}</option>)}
          </select>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Apply
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && logs.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">Audit trail starts here</p>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              Every action taken in your organisation — approvals, payments, logins, changes — is recorded here with a tamper-evident hash chain.
            </p>
          </div>
          <p className="text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            Your first action will appear here automatically.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && logs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Shield className="w-8 h-8 text-gray-300" />
              <p className="text-gray-500 text-sm">No audit entries match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Timestamp</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Detail</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((log, i) => {
                    const borderCls = rowBorderColor(log.action);
                    return (
                      <tr key={log.id || i} className="hover:bg-gray-50 transition-colors">
                        <td className={`px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap border-l-2 ${borderCls}`}>
                          {fmtDateTime(log.timestamp || log.created_at)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-gray-800 text-sm">
                            {log.actor_name || log.actor_email || log.actor_id || 'System'}
                          </span>
                          {log.actor_email && log.actor_name && (
                            <span className="block text-xs text-gray-400">{log.actor_email}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                            {log.action || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 max-w-xs truncate text-xs">
                          {log.detail || log.description || log.resource_type
                            ? `${log.resource_type || ''} ${log.resource_id || ''} ${log.detail || log.description || ''}`.trim()
                            : '—'
                          }
                        </td>
                        <td className="px-5 py-3.5">
                          {log.hash ? (
                            <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                              {log.hash.slice(0, 6)}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
