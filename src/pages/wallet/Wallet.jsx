import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, ArrowDownLeft, Plus, Wallet as WalletIcon,
  Shield, CheckCircle2, Clock, CreditCard, Building, Download,
  Lock, Loader2, X, ChevronRight, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const transactions = [
  { id: 't1', type: 'credit', desc: 'Gift contribution — Honeymoon Fund', party: 'Aunty Ngozi', amount: 20000, date: 'Today, 2:14 PM', status: 'completed' },
  { id: 't2', type: 'debit', desc: 'Vendor payment — Lens & Light Studios', party: 'Escrow hold', amount: 125000, date: 'Yesterday, 4:30 PM', status: 'escrow' },
  { id: 't3', type: 'credit', desc: 'Wallet top-up via card', party: 'Paystack', amount: 200000, date: 'May 1, 11:00 AM', status: 'completed' },
  { id: 't4', type: 'credit', desc: 'Gift contribution — KitchenAid Mixer', party: 'Uncle Tayo', amount: 35000, date: 'Apr 30, 3:05 PM', status: 'completed' },
  { id: 't5', type: 'debit', desc: 'Vendor escrow — Royal Caterers deposit', party: 'Milestone escrow', amount: 340000, date: 'Apr 28, 9:45 AM', status: 'escrow' },
  { id: 't6', type: 'credit', desc: 'Ticket sales — Sister\'s Birthday Pop-up', party: 'EventPark Payments', amount: 180000, date: 'Apr 25, 6:00 PM', status: 'completed' },
];

const banks = [
  { code: '044', name: 'Access Bank' },
  { code: '058', name: 'GTBank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '033', name: 'UBA' },
  { code: '011', name: 'First Bank' },
  { code: '063', name: 'Access Bank (Diamond)' },
  { code: '070', name: 'Fidelity Bank' },
];

function TopUpModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const presets = [5000, 10000, 50000, 100000, 200000, 500000];

  const handlePay = async () => {
    if (!amount || parseInt(amount) < 100) {
      toast.error('Minimum top-up is ₦100');
      return;
    }
    setLoading(true);

    // Paystack integration
    // In production, load the Paystack script and call:
    // window.PaystackPop.setup({
    //   key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    //   email: user.email,
    //   amount: parseInt(amount) * 100,
    //   currency: 'NGN',
    //   callback: (response) => { verify reference on backend, then credit wallet },
    //   onClose: () => { setLoading(false) }
    // }).openIframe();

    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    onSuccess(parseInt(amount));
    toast.success(`₦${parseInt(amount).toLocaleString()} added to your wallet!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-green-400 to-brand-500" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-gray-900 text-lg">Top up wallet</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Amount */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₦)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-4 border border-gray-200 rounded-2xl text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {presets.map(p => (
                <button key={p} onClick={() => setAmount(p.toString())}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition">
                  ₦{(p/1000).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pay with</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'card', label: 'Debit Card', icon: CreditCard, sub: 'Instant' },
                { id: 'bank', label: 'Bank Transfer', icon: Building, sub: '1–5 minutes' },
              ].map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition ${method === m.id ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <m.icon className={`w-5 h-5 ${method === m.id ? 'text-brand-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <div className={`text-sm font-semibold ${method === m.id ? 'text-brand-700' : 'text-gray-700'}`}>{m.label}</div>
                    <div className="text-xs text-gray-400">{m.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-xl flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
            Secured by Paystack. EventPark never stores your card details.
          </div>

          <button
            onClick={handlePay}
            disabled={loading || !amount}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2 ${
              amount && !loading ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <>Pay ₦{amount ? parseInt(amount).toLocaleString() : '0'} via Paystack</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function WithdrawModal({ onClose }) {
  const { user, triggerKyc } = useAuth();
  const [acct, setAcct] = useState({ bank: '', number: '', name: '' });
  const [amount, setAmount] = useState('');
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    if (user?.kycTier < 1) {
      onClose();
      triggerKyc('withdraw');
      return;
    }
    setResolving(true);
    await new Promise(r => setTimeout(r, 1000));
    setAcCount(p => ({ ...p, name: 'ADEYEMI TUNDE OLANREWAJU' }));
    setResolving(false);
  };

  const setAcCount = setAcct;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-brand-500 to-purple-500" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-gray-900 text-lg">Withdraw funds</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          {user?.kycTier < 1 ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">KYC required</h3>
              <p className="text-sm text-gray-500 mb-4">Verify your BVN to unlock withdrawals.</p>
              <button onClick={() => { onClose(); triggerKyc('withdraw'); }}
                className="bg-brand-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-brand-700 transition">
                Start Verification
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bank</label>
                <select value={acct.bank} onChange={e => setAcct(p => ({ ...p, bank: e.target.value, name: '' }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account number</label>
                <div className="flex gap-2">
                  <input type="text" maxLength={10} placeholder="0000000000" value={acct.number}
                    onChange={e => setAcct(p => ({ ...p, number: e.target.value, name: '' }))}
                    className="flex-grow px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  <button onClick={handleResolve} disabled={acct.number.length < 10 || !acct.bank}
                    className="px-4 py-3 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-40 transition">
                    {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                  </button>
                </div>
                {acct.name && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-green-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {acct.name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                  <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1">T+1 payout. Processes within 24 hours.</p>
              </div>
              <button onClick={() => { toast.success('Withdrawal initiated! T+1 payout.'); onClose(); }}
                disabled={!acct.name || !amount}
                className="w-full py-3.5 rounded-2xl font-bold bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition">
                Withdraw ₦{amount ? parseInt(amount).toLocaleString() : '0'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const { user, topUpWallet, triggerKyc } = useAuth();
  const navigate = useNavigate();
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [filter, setFilter] = useState('all');

  const balance = user?.walletBalance || 0;
  const escrow = user?.walletEscrow || 0;
  const filteredTx = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  const backPath = user?.role === 'planner' ? '/planner' : user?.role === 'corporate' ? '/corporate' : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} onSuccess={topUpWallet} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back */}
        <Link to={backPath} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Wallet Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-brand-900 to-gray-950 p-6 mb-6 shadow-xl">
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-500/20 blur-2xl" />
          <div className="absolute -bottom-10 -left-5 w-32 h-32 rounded-full bg-accent-400/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <WalletIcon className="w-5 h-5 text-brand-300" />
              <span className="text-brand-200 text-sm font-medium">EventPark Wallet</span>
            </div>

            <div className="mb-1 text-gray-400 text-sm">Available balance</div>
            <div className="text-4xl font-extrabold text-white mb-1">₦{balance.toLocaleString()}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ₦{escrow.toLocaleString()} held in vendor escrow
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTopUp(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold py-3 rounded-2xl text-sm transition backdrop-blur-sm"
              >
                <Plus className="w-4 h-4" />
                Top up
              </button>
              <button
                onClick={() => user?.kycTier < 1 ? triggerKyc('withdraw') : setShowWithdraw(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold py-3 rounded-2xl text-sm transition backdrop-blur-sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* KYC Tier Status */}
        <div className={`rounded-2xl p-4 mb-5 border flex items-center gap-3 ${
          (user?.kycTier || 0) >= 1 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'
        }`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            (user?.kycTier || 0) >= 1 ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            {(user?.kycTier || 0) >= 1 ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-orange-500" />}
          </div>
          <div className="flex-grow">
            <div className={`text-sm font-semibold ${(user?.kycTier || 0) >= 1 ? 'text-green-800' : 'text-orange-800'}`}>
              {(user?.kycTier || 0) >= 1 ? `Verified — Tier ${user?.kycTier}` : 'Unverified — Tier 0'}
            </div>
            <div className={`text-xs mt-0.5 ${(user?.kycTier || 0) >= 1 ? 'text-green-600' : 'text-orange-600'}`}>
              {(user?.kycTier || 0) >= 1 ? 'Up to ₦200K/day outflow' : 'Verify BVN to unlock withdrawals'}
            </div>
          </div>
          {(user?.kycTier || 0) < 1 && (
            <button onClick={() => triggerKyc('withdraw')}
              className="text-xs font-bold text-orange-700 hover:underline flex-shrink-0">
              Verify now →
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Money in', value: `₦${(transactions.filter(t=>t.type==='credit').reduce((a,t)=>a+t.amount,0)/1000).toFixed(0)}K`, icon: ArrowDownLeft, color: 'text-green-600 bg-green-50' },
            { label: 'Money out', value: `₦${(transactions.filter(t=>t.type==='debit').reduce((a,t)=>a+t.amount,0)/1000).toFixed(0)}K`, icon: ArrowUpRight, color: 'text-brand-600 bg-brand-50' },
            { label: 'Escrow', value: `₦${(escrow/1000).toFixed(0)}K`, icon: Shield, color: 'text-orange-500 bg-orange-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div className="font-extrabold text-gray-900 text-sm">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Transactions</h3>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 text-xs">
              {['all', 'credit', 'debit'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-medium capitalize transition ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                  {f === 'all' ? 'All' : f === 'credit' ? 'In' : 'Out'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredTx.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'credit' ? 'bg-green-50' : tx.status === 'escrow' ? 'bg-orange-50' : 'bg-red-50'
                }`}>
                  {tx.type === 'credit'
                    ? <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    : tx.status === 'escrow'
                    ? <Shield className="w-4 h-4 text-orange-500" />
                    : <ArrowUpRight className="w-4 h-4 text-red-500" />
                  }
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{tx.desc}</p>
                  <p className="text-xs text-gray-400">{tx.party} · {tx.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-700'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </div>
                  <div className={`text-xs font-medium ${tx.status === 'escrow' ? 'text-orange-500' : 'text-green-500'}`}>
                    {tx.status === 'escrow' ? 'In escrow' : '✓ Done'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 text-center">
            <button className="text-sm text-brand-600 font-semibold hover:underline flex items-center gap-1 mx-auto">
              <Download className="w-3.5 h-3.5" />
              Export statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
