import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, XCircle, Eye, AlertCircle, RefreshCw, X, Loader2, Plus, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { approvals as approvalsApi } from '../../../lib/api';

function fmt(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

const TABS = [
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all',      label: 'All' },
];

const TYPE_BADGE = {
  PO:         'bg-purple-100 text-purple-700',
  Invoice:    'bg-blue-100 text-blue-700',
  Expense:    'bg-orange-100 text-orange-700',
  'RFQ Award': 'bg-teal-100 text-teal-700',
};

const URGENCY_BADGE = {
  urgent: 'bg-red-100 text-red-700',
  high:   'bg-orange-100 text-orange-700',
  normal: 'bg-gray-100 text-gray-500',
};

const STATUS_PILL = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  changes_requested: 'bg-blue-100 text-blue-700',
};

// ─── Request Approval Modal ──────────────────────────────────────────────────
function RequestApprovalModal({ orgId, onClose, onDone }) {
  const [form, setForm] = useState({
    type: 'Expense', vendor_name: '', amount: '', event_name: '', urgency: 'normal', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.notes.trim()) { toast.error('Please describe what you need approved.'); return; }
    try {
      setSubmitting(true);
      await approvalsApi.submit(orgId, {
        type: form.type,
        vendor_name: form.vendor_name.trim() || undefined,
        amount: form.amount ? parseInt(form.amount) : undefined,
        event_name: form.event_name.trim() || undefined,
        urgency: form.urgency,
        notes: form.notes.trim(),
      });
      toast.success('Approval request submitted — your approver will be notified.');
      onDone();
    } catch (err) {
      toast.error(err.message || 'Failed to submit approval request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Request approval</h3>
            <p className="text-xs text-gray-400 mt-0.5">Submit for review by your designated approver.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
            <div className="flex gap-2 flex-wrap">
              {['PO', 'Invoice', 'Expense', 'RFQ Award'].map(t => (
                <button key={t} type="button" onClick={() => set('type', t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.type === t
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor / Supplier</label>
              <input value={form.vendor_name} onChange={e => set('vendor_name', e.target.value)}
                placeholder="e.g. Royal Caterers"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₦)</label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Linked event</label>
            <input value={form.event_name} onChange={e => set('event_name', e.target.value)}
              placeholder="e.g. Annual Company Retreat"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Urgency</label>
            <div className="flex gap-2">
              {[['normal', 'Normal'], ['high', 'High'], ['urgent', 'Urgent']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => set('urgency', v)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.urgency === v
                      ? v === 'urgent' ? 'bg-red-600 text-white border-red-600'
                        : v === 'high' ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-gray-600 text-white border-gray-600'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Notes / reason <span className="text-red-500">*</span>
            </label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              placeholder="Explain what this is for and why it needs approval…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit for approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function RejectModal({ approval, orgId, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    try {
      setSubmitting(true);
      await approvalsApi.reject(orgId, approval.id, { reason: reason.trim() });
      toast.success('Approval rejected.');
      onDone();
    } catch (err) {
      toast.error(err.message || 'Failed to reject approval.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Reject Approval</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Ref: <span className="font-semibold text-gray-700">{approval.ref || approval.id}</span>
          {approval.vendor_name && <span> · {approval.vendor_name}</span>}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              placeholder="Explain why this approval is being rejected…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApprovalCard({ ap, orgId, onRefresh }) {
  const [approving, setApproving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const typeBadge = TYPE_BADGE[ap.type] || 'bg-gray-100 text-gray-600';
  const urgencyBadge = URGENCY_BADGE[ap.urgency] || URGENCY_BADGE.normal;
  const statusPill = STATUS_PILL[ap.status] || STATUS_PILL.pending;

  const handleApprove = async () => {
    try {
      setApproving(true);
      await approvalsApi.approve(orgId, ap.id, {});
      toast.success('Approval granted.');
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to approve.');
    } finally {
      setApproving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 transition-all p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-gray-900 text-sm">{ap.ref || ap.id}</span>
              {ap.type && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${typeBadge}`}>
                  {ap.type}
                </span>
              )}
              {ap.urgency && ap.urgency !== 'normal' && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${urgencyBadge}`}>
                  {ap.urgency.charAt(0).toUpperCase() + ap.urgency.slice(1)}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${statusPill}`}>
                {ap.status}
              </span>
            </div>
            <div className="text-xs text-gray-400 flex flex-wrap gap-x-3 gap-y-0.5">
              {ap.vendor_name && <span>Vendor: <span className="text-gray-600 font-medium">{ap.vendor_name}</span></span>}
              {ap.amount != null && <span>Amount: <span className="text-gray-600 font-medium">{fmt(ap.amount)}</span></span>}
              {ap.requested_by_name && <span>By: <span className="text-gray-600 font-medium">{ap.requested_by_name}</span></span>}
              {ap.event_name && <span>Event: <span className="text-gray-600 font-medium">{ap.event_name}</span></span>}
              {ap.created_at && <span>{new Date(ap.created_at).toLocaleDateString()}</span>}
            </div>
          </div>
        </div>

        {/* Action buttons — only shown for pending items */}
        {ap.status === 'pending' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button onClick={handleApprove} disabled={approving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-xs font-semibold transition-colors">
              {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Approve
            </button>
            <button onClick={() => setShowRejectModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors border border-red-200">
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition-colors border border-gray-200 ml-auto">
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
          </div>
        )}
      </div>

      {showRejectModal && (
        <RejectModal
          approval={ap}
          orgId={orgId}
          onClose={() => setShowRejectModal(false)}
          onDone={() => { setShowRejectModal(false); onRefresh(); }}
        />
      )}
    </>
  );
}

export default function CorporateApprovals() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [allApprovals, setAllApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const fetchApprovals = useCallback(async () => {
    if (!orgId) {
      setError('Organisation ID not found. Please contact support.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await approvalsApi.list(orgId);
      setAllApprovals(Array.isArray(res) ? res : res?.approvals || []);
    } catch (err) {
      setError(err.message || 'Failed to load approvals.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  const filtered = allApprovals.filter(ap => {
    if (activeTab === 'all') return true;
    return ap.status === activeTab;
  });

  const countByTab = (key) => {
    if (key === 'all') return allApprovals.length;
    return allApprovals.filter(a => a.status === key).length;
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Approvals</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Review incoming requests or submit your own for approval.
          </p>
        </div>
        <button onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Request approval
        </button>
      </div>

      {/* How it works */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 mb-6">
        <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2">How approvals work</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-orange-800">
          <span>① Team member submits a request (PO, invoice, expense)</span>
          <span>→ ② Approver sees it here</span>
          <span>→ ③ Approve or reject with notes</span>
          <span>→ ④ Requester is notified &amp; payment proceeds</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(tab => {
          const count = countByTab(tab.key);
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                activeTab === tab.key
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'
              }`}>
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
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
          <button onClick={fetchApprovals}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Approvals list */}
      {!loading && !error && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 opacity-60" />
              <div>
                <p className="font-semibold text-gray-600">
                  {activeTab === 'pending'
                    ? "No pending approvals — you're all caught up!"
                    : `No ${activeTab} approvals`}
                </p>
                {activeTab === 'pending' && (
                  <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                    When your team submits expenses, POs, or invoice payments they'll appear here for you to action.
                  </p>
                )}
              </div>
              {activeTab === 'pending' && (
                <button onClick={() => setShowRequestModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold rounded-xl text-sm transition-colors">
                  <Plus className="w-4 h-4" /> Submit a request yourself
                </button>
              )}
            </div>
          ) : (
            filtered.map(ap => (
              <ApprovalCard key={ap.id} ap={ap} orgId={orgId} onRefresh={fetchApprovals} />
            ))
          )}
        </div>
      )}

      {showRequestModal && (
        <RequestApprovalModal
          orgId={orgId}
          onClose={() => setShowRequestModal(false)}
          onDone={() => { setShowRequestModal(false); fetchApprovals(); }}
        />
      )}
    </div>
  );
}
