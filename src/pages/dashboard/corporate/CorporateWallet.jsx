import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, Plus, ArrowUpRight, ArrowDownLeft, X, Loader2, AlertCircle, RefreshCw, TrendingDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { corpWallet } from '../../../lib/api';

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function TopUpModal({ orgId, onClose, onDone }) {
  const [form, setForm] = useState({ amount_ngn: '', reference: '', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount_ngn || Number(form.amount_ngn) <= 0) { toast.error('Enter a valid amount.'); return; }
    if (!form.reference.trim()) { toast.error('Reference is required.'); return; }
    try {
      setSubmitting(true);
      await corpWallet.topup(orgId, {
        amount_ngn: Number(form.amount_ngn),
        reference: form.reference.trim(),
        note: form.note.trim() || undefined,
      });
      toast.success('Top-up recorded successfully!');
      onDone();
    } catch (err) {
      toast.error(err.message || 'Failed to record top-up.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Top up wallet</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Amount (₦) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.amount_ngn}
              onChange={e => set('amount_ngn', e.target.value)}
              placeholder="e.g. 5000000"
              min="1"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {form.amount_ngn && Number(form.amount_ngn) > 0 && (
              <p className="text-xs text-gray-400 mt-1">{fmt(form.amount_ngn)}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Reference <span className="text-red-500">*</span>
            </label>
            <input
              value={form.reference}
              onChange={e => set('reference', e.target.value)}
              placeholder="Bank transfer reference or receipt number"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Note <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="e.g. Q2 event fund allocation"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Top up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function statThisMonthSpend(txs) {
  const now = new Date();
  return txs
    .filter(t => {
      if ((t.type || '').toLowerCase() !== 'debit') return false;
      const d = new Date(t.created_at || t.date || 0);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

function statPendingOutflows(txs) {
  return txs
    .filter(t => (t.status || '').toLowerCase() === 'pending')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

function statLastTopUp(txs) {
  const credits = txs
    .filter(t => (t.type || '').toLowerCase() === 'credit')
    .sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0));
  if (!credits.length) return null;
  return credits[0].created_at || credits[0].date;
}

export default function CorporateWallet() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [walletData, setWalletData] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!orgId) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const [walRes, txRes] = await Promise.allSettled([
        corpWallet.get(orgId),
        corpWallet.transactions(orgId),
      ]);
      if (walRes.status === 'fulfilled') setWalletData(walRes.value);
      if (txRes.status === 'fulfilled') {
        const d = txRes.value;
        setTxs(Array.isArray(d) ? d : d?.transactions || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load wallet data.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const balance = walletData?.balance ?? walletData?.wallet?.balance ?? 0;
  const pendingOutflows = statPendingOutflows(txs);
  const monthSpend = statThisMonthSpend(txs);
  const lastTopUpDate = statLastTopUp(txs);

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Corporate Wallet</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage your organisation's event spend balance.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Balance card */}
          <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 p-6 mb-5 text-white shadow-lg">
            <p className="text-sm font-semibold text-orange-100 mb-1">Corporate wallet</p>
            <p className="text-4xl font-extrabold tracking-tight mb-5">{fmt(balance)}</p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowTopUp(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-orange-700 font-semibold rounded-xl text-sm hover:bg-orange-50 transition-colors">
                <Plus className="w-4 h-4" />
                Top up
              </button>
              <button
                onClick={() => toast('Withdrawal request coming soon.')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white font-semibold rounded-xl text-sm hover:bg-white/30 transition-colors border border-white/30">
                <TrendingDown className="w-4 h-4" />
                Request withdrawal
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Pending outflows', value: fmt(pendingOutflows) },
              { label: 'This month spend', value: fmt(monthSpend) },
              { label: 'Last top-up', value: lastTopUpDate ? fmtDate(lastTopUpDate) : 'None yet' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                <p className="text-xs text-gray-400 font-semibold mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Transactions */}
          {txs.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">No transactions yet</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Top up your corporate wallet to start paying vendors and managing event spend.
                </p>
              </div>
              <button
                onClick={() => setShowTopUp(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
                <Plus className="w-4 h-4" />
                Top up wallet
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {txs.map((tx, i) => {
                      const isCredit = (tx.type || '').toLowerCase() === 'credit';
                      return (
                        <tr key={tx.id || i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                              {isCredit
                                ? <ArrowUpRight className="w-4 h-4 text-green-600" />
                                : <ArrowDownLeft className="w-4 h-4 text-red-600" />
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-700 max-w-xs truncate">
                            {tx.description || tx.narration || '—'}
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                            {fmtDateTime(tx.created_at || tx.date)}
                          </td>
                          <td className={`px-4 py-3.5 text-right font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                            {isCredit ? '+' : '-'}{fmt(tx.amount)}
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">
                            {tx.reference || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold text-gray-700">
                            {tx.balance != null ? fmt(tx.balance) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {showTopUp && (
        <TopUpModal
          orgId={orgId}
          onClose={() => setShowTopUp(false)}
          onDone={() => { setShowTopUp(false); fetchAll(); }}
        />
      )}
    </div>
  );
}
