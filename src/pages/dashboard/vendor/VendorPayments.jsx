import { useState } from 'react';
import {
  CreditCard, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2,
  Shield, Building2, Plus, Eye, EyeOff, Lock, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

// ─── PIN modal ────────────────────────────────────────────────────────────────

function PINModal({ title, onConfirm, onClose }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const refs = [null, null, null, null].map(() => ({ current: null }));

  const handle = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...pin]; next[i] = val;
    setPin(next);
    if (val && i < 3) refs[i + 1].current?.focus();
    if (next.every(d => d !== '') && i === 3) onConfirm(next.join(''));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-2xl">
        <div className="text-center mb-5">
          <Lock className="w-8 h-8 text-brand-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-ep-navy">{title}</h3>
          <p className="text-xs text-gray-400 mt-1">Enter your 4-digit wallet PIN</p>
        </div>
        <div className="flex gap-2 justify-center mb-5">
          {pin.map((d, i) => (
            <input key={i} ref={r => refs[i].current = r} type="password" maxLength={1}
              value={d} onChange={e => handle(i, e.target.value)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400" />
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Withdraw modal ───────────────────────────────────────────────────────────

function WithdrawModal({ available, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('amount'); // 'amount' | 'pin'
  const [error, setError] = useState('');

  const validate = () => {
    const n = parseFloat(amount);
    if (!n || n < 1000) { setError('Minimum withdrawal is ₦1,000'); return false; }
    if (n > available) { setError('Amount exceeds available balance'); return false; }
    return true;
  };

  if (step === 'pin') {
    return (
      <PINModal
        title={`Withdraw ₦${parseFloat(amount).toLocaleString()}`}
        onConfirm={(pin) => { onSubmit(parseFloat(amount), pin); }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h3 className="text-base font-bold text-ep-navy mb-4">Withdraw funds</h3>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="text-xs text-gray-400 mb-1">Available balance</div>
          <div className="text-2xl font-extrabold text-ep-navy">₦{available.toLocaleString()}</div>
        </div>
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-ep-navy mb-1.5">Amount (₦)</label>
            <input type="number" placeholder="Min ₦1,000" value={amount}
              onChange={e => { setAmount(e.target.value); setError(''); }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Payout:</span> T+1 to T+2 business days to your linked bank account.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { if (validate()) setStep('pin'); }}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add bank modal ───────────────────────────────────────────────────────────

function AddBankModal({ onClose, onSave }) {
  const [form, setForm] = useState({ bank: '', account_number: '', account_name: '' });
  const [resolving, setResolving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const BANKS = ['Access Bank', 'First Bank', 'GTBank', 'Zenith Bank', 'UBA', 'Stanbic IBTC', 'FCMB', 'Fidelity Bank', 'Polaris Bank', 'Sterling Bank', 'Union Bank', 'Wema Bank', 'Kuda Bank', 'Opay', 'PalmPay', 'Other'];

  const resolveAccount = async () => {
    if (form.account_number.length !== 10 || !form.bank) return;
    setResolving(true);
    await new Promise(r => setTimeout(r, 1000));
    set('account_name', 'ADA OKONKWO'); // Simulated resolve
    setResolving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h3 className="text-base font-bold text-ep-navy mb-4">Add bank account</h3>
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-ep-navy mb-1.5">Bank</label>
            <div className="relative">
              <select value={form.bank} onChange={e => set('bank', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none bg-white">
                <option value="">Select bank…</option>
                {BANKS.map(b => <option key={b}>{b}</option>)}
              </select>
              <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ep-navy mb-1.5">Account number</label>
            <input type="text" maxLength={10} placeholder="0123456789" value={form.account_number}
              onChange={e => { set('account_number', e.target.value); if (e.target.value.length === 10) resolveAccount(); }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          {(resolving || form.account_name) && (
            <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${resolving ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-700'}`}>
              {resolving ? 'Resolving account…' : form.account_name}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(form)}
            disabled={!form.bank || !form.account_name}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors">
            Save account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Transaction item ─────────────────────────────────────────────────────────

function TxItem({ tx }) {
  const isCredit = tx.type === 'credit';
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-100' : 'bg-orange-100'}`}>
        {isCredit ? <ArrowDownLeft className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-orange-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ep-navy truncate">{tx.description}</div>
        <div className="text-xs text-gray-400">{tx.date}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-sm font-extrabold ${isCredit ? 'text-green-600' : 'text-gray-700'}`}>
          {isCredit ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString()}
        </div>
        {tx.escrow && <div className="text-[10px] text-amber-600 font-medium">in escrow</div>}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function VendorPayments() {
  const { user } = useAuth();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'escrow' | 'withdrawals'

  const available = user?.walletBalance || 0;
  const escrow = user?.walletEscrow || 0;

  const handleWithdraw = (amount, pin) => {
    // In production: call API
    setShowWithdraw(false);
  };

  const handleAddBank = (form) => {
    setBankAccounts(prev => [...prev, { ...form, id: Date.now().toString() }]);
    setShowAddBank(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-extrabold text-ep-navy mb-6">Payments</h1>

      {/* Wallet cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Available */}
        <div className="bg-gradient-to-br from-ep-navy to-gray-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-medium">Available</span>
            <button type="button" onClick={() => setHideBalance(v => !v)} className="text-white/40 hover:text-white/70 transition-colors">
              {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-2xl font-extrabold mb-3">
            {hideBalance ? '••••••' : `₦${available.toLocaleString()}`}
          </div>
          <button type="button" onClick={() => setShowWithdraw(true)}
            className="w-full py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
          </button>
        </div>

        {/* Escrow */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-amber-700 text-xs font-medium">In escrow</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-800 mb-1">
            {hideBalance ? '••••••' : `₦${escrow.toLocaleString()}`}
          </div>
          <p className="text-xs text-amber-600">Released after customer confirms or 7 days pass</p>
        </div>
      </div>

      {/* Bank accounts */}
      <div className="bg-white rounded-2xl border border-gray-200 mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-ep-navy">Payout accounts</h2>
          <button type="button" onClick={() => setShowAddBank(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add account
          </button>
        </div>
        <div className="px-5">
          {bankAccounts.length === 0 ? (
            <div className="py-6 text-center">
              <Building2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">No bank account linked</p>
              <p className="text-xs text-gray-300 mt-1">Add your bank account to receive withdrawals</p>
              <button type="button" onClick={() => setShowAddBank(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add bank account
              </button>
            </div>
          ) : (
            bankAccounts.map(acc => (
              <div key={acc.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ep-navy">{acc.account_name}</div>
                  <div className="text-xs text-gray-400">{acc.bank} · {acc.account_number}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Default</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-ep-navy">Transaction history</h2>
          <div className="flex gap-1">
            {['all', 'escrow', 'withdrawals'].map(t => (
              <button key={t} type="button" onClick={() => setActiveTab(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === t ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5">
          {transactions.length === 0 ? (
            <div className="py-8 text-center">
              <ArrowDownLeft className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">No transactions yet</p>
              <p className="text-xs text-gray-300 mt-1">Earnings and withdrawals will appear here</p>
            </div>
          ) : (
            transactions
              .filter(tx => activeTab === 'all' || (activeTab === 'escrow' ? tx.escrow : tx.type === 'debit'))
              .map(tx => <TxItem key={tx.id} tx={tx} />)
          )}
        </div>
      </div>

      {showWithdraw && <WithdrawModal available={available} onClose={() => setShowWithdraw(false)} onSubmit={handleWithdraw} />}
      {showAddBank && <AddBankModal onClose={() => setShowAddBank(false)} onSave={handleAddBank} />}
    </div>
  );
}
