import { useState, useEffect, useCallback } from 'react';
import {
  Calculator, Plus, ArrowLeft, Trash2, Edit2, ChevronRight,
  X, AlertCircle, CheckCircle,
} from 'lucide-react';
import { personalBudget } from '../../lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`;

const CATEGORY_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-yellow-500',
];

const SCOPE_LABELS = { event: 'Event', period: 'Monthly', lifetime: 'Open-ended' };

const DEFAULT_CATEGORIES = ['Venue', 'Catering', 'Decor', 'Photography', 'Miscellaneous'];

const today = () => new Date().toISOString().slice(0, 10);

function pct(spent, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((spent / total) * 100));
}

function remainingColor(remaining, total) {
  if (!total) return 'text-gray-600';
  const ratio = remaining / total;
  if (ratio > 0.2) return 'text-green-600';
  if (ratio > 0.1) return 'text-yellow-600';
  return 'text-red-600';
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white text-sm font-medium transition-all ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <p className="text-gray-800 text-sm mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} my-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Create Budget Modal ──────────────────────────────────────────────────────

function CreateBudgetModal({ onClose, onCreate, initialScope }) {
  const [name, setName] = useState('');
  const [scope, setScope] = useState(initialScope || 'event');
  const [totalNgn, setTotalNgn] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState('');
  const [categories, setCategories] = useState(
    DEFAULT_CATEGORIES.map((n) => ({ name: n, allocated: '' }))
  );
  const [trackBy, setTrackBy] = useState('manual');
  const [alert70, setAlert70] = useState(false);
  const [alert90, setAlert90] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addCategoryRow = () => setCategories((c) => [...c, { name: '', allocated: '' }]);

  const updateCategory = (i, field, val) =>
    setCategories((c) => c.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const removeCategory = (i) =>
    setCategories((c) => c.filter((_, idx) => idx !== i));

  const autoBalance = () => {
    const total = parseFloat(totalNgn);
    if (!total || categories.length === 0) return;
    const each = Math.floor(total / categories.length);
    setCategories((c) => c.map((r) => ({ ...r, allocated: String(each) })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Budget name is required.');
    if (!totalNgn || isNaN(Number(totalNgn))) return setError('Enter a valid total amount.');

    const validCats = categories.filter((c) => c.name.trim());
    const body = {
      name: name.trim(),
      scope,
      total_ngn: Number(totalNgn),
      categories: validCats.map((c) => ({
        name: c.name.trim(),
        allocated_ngn: Number(c.allocated) || 0,
      })),
      alerts: { at_70: alert70, at_90: alert90 },
      track_by: trackBy,
    };
    if (scope === 'period') {
      body.period_start = startDate;
      body.period_end = endDate;
    }

    setSaving(true);
    try {
      const created = await personalBudget.create(body);
      onCreate(created || { ...body, id: `local-${Date.now()}`, spent_ngn: 0 });
    } catch {
      // Graceful — treat as local optimistic add
      onCreate({ ...body, id: `local-${Date.now()}`, spent_ngn: 0 });
    } finally {
      setSaving(false);
    }
  };

  const scopeOptions = [
    { value: 'event', label: 'For an event' },
    { value: 'period', label: 'For a time period' },
    { value: 'lifetime', label: 'Open-ended' },
  ];

  return (
    <Modal title="Create Budget" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Budget name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wedding budget, May expenses"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
        </div>

        {/* Scope */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Budget scope *</label>
          <div className="grid grid-cols-3 gap-2">
            {scopeOptions.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => setScope(o.value)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  scope === o.value
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-600'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dates (period only) */}
        {scope === 'period' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
            </div>
          </div>
        )}

        {/* Total */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total budget amount *</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">₦</span>
            <input
              type="number"
              min="0"
              value={totalNgn}
              onChange={(e) => setTotalNgn(e.target.value)}
              placeholder="5,000,000"
              className="w-full pl-8 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-600">Categories</label>
            <button type="button" onClick={autoBalance} className="text-xs font-semibold text-orange-600 hover:text-orange-700">
              Auto-balance
            </button>
          </div>
          <div className="space-y-2">
            {categories.map((cat, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={cat.name}
                  onChange={(e) => updateCategory(i, 'name', e.target.value)}
                  placeholder="Category name"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
                <div className="relative w-32">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₦</span>
                  <input
                    type="number"
                    min="0"
                    value={cat.allocated}
                    onChange={(e) => updateCategory(i, 'allocated', e.target.value)}
                    placeholder="Amount"
                    className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
                <button type="button" onClick={() => removeCategory(i)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addCategoryRow} className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add category
          </button>
        </div>

        {/* Track by */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Track expenses by</label>
          <div className="flex gap-3">
            {[{ value: 'manual', label: 'Manual entry' }, { value: 'both', label: 'Both' }].map((o) => (
              <label key={o.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="radio" name="trackBy" value={o.value} checked={trackBy === o.value} onChange={() => setTrackBy(o.value)} className="accent-orange-600" />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600">Spending alerts</label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={alert70} onChange={(e) => setAlert70(e.target.checked)} className="accent-orange-600 w-4 h-4" />
            Notify me at 70% of each category
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={alert90} onChange={(e) => setAlert90(e.target.checked)} className="accent-orange-600 w-4 h-4" />
            Notify me at 90% of each category
          </label>
        </div>

        {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl transition-colors">
            {saving ? 'Creating…' : 'Create budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────

function AddExpenseModal({ budget, preCategory, onClose, onAdded }) {
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(preCategory?.id || preCategory?.name || budget?.categories?.[0]?.name || '');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(today());
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const cats = budget?.categories || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!description.trim()) return setError('Description is required.');
    if (!amount || isNaN(Number(amount))) return setError('Enter a valid amount.');
    if (!categoryId) return setError('Select a category.');

    const body = {
      description: description.trim(),
      category_id: categoryId,
      amount_ngn: Number(amount),
      expense_date: expenseDate,
      payment_method: paymentMethod,
      notes: notes.trim() || undefined,
    };

    setSaving(true);
    try {
      const created = await personalBudget.addExpense(budget.id, body);
      onAdded(created || { ...body, id: `local-${Date.now()}` });
    } catch {
      onAdded({ ...body, id: `local-${Date.now()}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Add Expense" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description *</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Hall deposit"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white">
            <option value="">Select category…</option>
            {cats.map((c, i) => (
              <option key={c.id || i} value={c.id || c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount *</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">₦</span>
            <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
              className="w-full pl-8 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date *</label>
          <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment method *</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white">
            <option value="wallet">Wallet</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any notes…"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 resize-none" />
        </div>

        {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl transition-colors">
            {saving ? 'Adding…' : 'Add expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Budget Card ──────────────────────────────────────────────────────────────

function BudgetCard({ budget, onView }) {
  const spent = budget.spent_ngn || 0;
  const total = budget.total_ngn || 0;
  const remaining = total - spent;
  const progress = pct(spent, total);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 text-sm truncate">{budget.name}</h3>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700">
            {SCOPE_LABELS[budget.scope] || budget.scope}
          </span>
        </div>
        <button onClick={() => onView(budget)}
          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
          View <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{fmt(spent)} spent</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${progress >= 90 ? 'bg-red-500' : progress >= 70 ? 'bg-yellow-500' : 'bg-orange-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[11px] text-gray-400 font-medium">Total</div>
          <div className="text-xs font-bold text-gray-800 truncate">{fmt(total)}</div>
        </div>
        <div>
          <div className="text-[11px] text-gray-400 font-medium">Spent</div>
          <div className="text-xs font-bold text-gray-800 truncate">{fmt(spent)}</div>
        </div>
        <div>
          <div className="text-[11px] text-gray-400 font-medium">Left</div>
          <div className={`text-xs font-bold truncate ${remainingColor(remaining, total)}`}>{fmt(remaining)}</div>
        </div>
      </div>

      {/* Category chips */}
      {(budget.categories || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {budget.categories.slice(0, 5).map((c, i) => (
            <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}>
              {c.name}
            </span>
          ))}
          {budget.categories.length > 5 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
              +{budget.categories.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Detail: Category Grid ────────────────────────────────────────────────────

function CategoryCard({ cat, colorClass, onAddExpense }) {
  const spent = cat.spent_ngn || 0;
  const allocated = cat.allocated_ngn || 0;
  const progress = pct(spent, allocated);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-1.5 w-full ${colorClass}`} />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-bold text-gray-900">{cat.name}</span>
          <span className={`text-xs font-semibold ${progress >= 90 ? 'text-red-600' : progress >= 70 ? 'text-yellow-600' : 'text-gray-500'}`}>
            {progress}%
          </span>
        </div>
        <div className="text-xs text-gray-500">{fmt(spent)} <span className="text-gray-300">/</span> {fmt(allocated)}</div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${colorClass} opacity-80`} style={{ width: `${progress}%` }} />
        </div>
        <button onClick={() => onAddExpense(cat)}
          className="mt-1 w-full py-2 text-xs font-semibold text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add expense
        </button>
      </div>
    </div>
  );
}

// ─── Detail: Expenses Table ───────────────────────────────────────────────────

function ExpensesTable({ expenses, budget, onDelete }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const sorted = [...expenses].sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = sorted.length > page * PAGE_SIZE;

  const methodLabel = (m) => ({
    wallet: 'Wallet', cash: 'Cash', bank_transfer: 'Bank transfer', card: 'Card', other: 'Other',
  }[m] || m);

  const catName = (expense) => {
    const cats = budget?.categories || [];
    const match = cats.find((c) => c.id === expense.category_id || c.name === expense.category_id);
    return match?.name || expense.category_id || '—';
  };

  if (expenses.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No expenses recorded yet.</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visible.map((exp) => (
              <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{exp.expense_date}</td>
                <td className="px-4 py-3 text-gray-800 font-medium max-w-[180px] truncate">{exp.description}</td>
                <td className="px-4 py-3 text-gray-600">{catName(exp)}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">{fmt(exp.amount_ngn)}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{methodLabel(exp.payment_method)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => onDelete(exp)} className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button onClick={() => setPage((p) => p + 1)} className="mt-3 w-full py-2.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          View {Math.min(PAGE_SIZE, sorted.length - page * PAGE_SIZE)} more
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardBudget() {
  const [budgets, setBudgets] = useState([]);
  const [activeBudget, setActiveBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createScope, setCreateScope] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Fetch budgets ──────────────────────────────────────────────────────────

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await personalBudget.list();
      setBudgets(data || []);
    } catch {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  // ── Fetch expenses when detail view opens ──────────────────────────────────

  const fetchExpenses = useCallback(async (budgetId) => {
    try {
      const data = await personalBudget.listExpenses(budgetId);
      setExpenses(data || []);
    } catch {
      setExpenses([]);
    }
  }, []);

  useEffect(() => {
    if (activeBudget) fetchExpenses(activeBudget.id);
    else setExpenses([]);
  }, [activeBudget, fetchExpenses]);

  // ── Create budget ──────────────────────────────────────────────────────────

  const handleCreate = (created) => {
    setBudgets((prev) => [created, ...prev]);
    setShowCreateModal(false);
    showToast('Budget created!');
  };

  const openCreate = (scope) => {
    setCreateScope(scope);
    setShowCreateModal(true);
  };

  // ── Delete budget ──────────────────────────────────────────────────────────

  const handleDeleteBudget = () => {
    setConfirm({
      message: `Delete "${activeBudget.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try { await personalBudget.delete(activeBudget.id); } catch {}
        setBudgets((prev) => prev.filter((b) => b.id !== activeBudget.id));
        setActiveBudget(null);
        showToast('Budget deleted.');
      },
    });
  };

  // ── Add expense ────────────────────────────────────────────────────────────

  const handleExpenseAdded = (expense) => {
    setExpenses((prev) => [expense, ...prev]);
    setShowExpenseModal(false);
    setActiveCategory(null);
    showToast('Expense added!');
    // Optimistically update budget spent amount
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === activeBudget.id
          ? { ...b, spent_ngn: (b.spent_ngn || 0) + (expense.amount_ngn || 0) }
          : b
      )
    );
    if (activeBudget) {
      setActiveBudget((ab) => ab ? { ...ab, spent_ngn: (ab.spent_ngn || 0) + (expense.amount_ngn || 0) } : ab);
    }
  };

  // ── Delete expense ─────────────────────────────────────────────────────────

  const handleDeleteExpense = (expense) => {
    setConfirm({
      message: `Remove expense "${expense.description}"?`,
      onConfirm: async () => {
        setConfirm(null);
        try { await personalBudget.deleteExpense(activeBudget.id, expense.id); } catch {}
        setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
        showToast('Expense removed.');
      },
    });
  };

  const openExpenseModal = (cat) => {
    setActiveCategory(cat);
    setShowExpenseModal(true);
  };

  // ── Stats for detail view ──────────────────────────────────────────────────

  const detailSpent = activeBudget?.spent_ngn || 0;
  const detailTotal = activeBudget?.total_ngn || 0;
  const detailRemaining = detailTotal - detailSpent;
  const detailProgress = pct(detailSpent, detailTotal);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

      {/* ── Detail View ─────────────────────────────────────────────────────── */}
      {activeBudget !== null ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button onClick={() => setActiveBudget(null)}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors self-start">
              <ArrowLeft className="w-4 h-4" /> All budgets
            </button>
            <div className="sm:ml-auto flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-gray-900 mr-2">{activeBudget.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                {SCOPE_LABELS[activeBudget.scope] || activeBudget.scope}
              </span>
            </div>
            <div className="flex gap-2 sm:ml-0">
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={handleDeleteBudget} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: fmt(detailTotal), color: 'text-gray-900' },
              { label: 'Spent', value: fmt(detailSpent), color: 'text-gray-900' },
              { label: 'Remaining', value: fmt(detailRemaining), color: remainingColor(detailRemaining, detailTotal) },
              { label: 'Progress', value: `${detailProgress}%`, color: detailProgress >= 90 ? 'text-red-600' : detailProgress >= 70 ? 'text-yellow-600' : 'text-green-600' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="text-xs text-gray-400 font-medium mb-1">{stat.label}</div>
                <div className={`text-base font-extrabold ${stat.color}`}>{stat.value}</div>
                {stat.label === 'Progress' && (
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${detailProgress >= 90 ? 'bg-red-500' : detailProgress >= 70 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                      style={{ width: `${detailProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Categories */}
          {(activeBudget.categories || []).length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-3">Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeBudget.categories.map((cat, i) => (
                  <CategoryCard
                    key={cat.id || i}
                    cat={cat}
                    colorClass={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                    onAddExpense={openExpenseModal}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add expense button (global) */}
          <div className="flex justify-end">
            <button onClick={() => openExpenseModal(null)}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Add expense
            </button>
          </div>

          {/* Expenses table */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Expenses</h2>
            <ExpensesTable expenses={expenses} budget={activeBudget} onDelete={handleDeleteExpense} />
          </div>
        </div>

      ) : (
        /* ── List View ──────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-gray-900">Budget</h1>
            <button onClick={() => openCreate(null)}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Create budget
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm h-48 animate-pulse" />
              ))}
            </div>
          ) : budgets.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center py-12 gap-6">
              <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center">
                <Calculator className="w-10 h-10 text-orange-400" />
              </div>
              <div className="text-center">
                <p className="text-gray-900 font-bold text-base mb-1">Plan, track, and stay on top of every Naira.</p>
                <p className="text-gray-400 text-sm">Pick how you want to start:</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                <button onClick={() => openCreate('event')}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-5 text-left transition-shadow group">
                  <div className="text-2xl mb-3">💰</div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Budget for an event</h3>
                  <p className="text-xs text-gray-500 mb-4">Track spend for one specific event — venue, catering, decor, and more.</p>
                  <span className="text-xs font-semibold text-orange-600 group-hover:underline flex items-center gap-1">
                    Start planning <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
                <button onClick={() => openCreate('period')}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-5 text-left transition-shadow group">
                  <div className="text-2xl mb-3">📅</div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">General budget</h3>
                  <p className="text-xs text-gray-500 mb-4">Set a monthly or quarterly spend cap for any purpose.</p>
                  <span className="text-xs font-semibold text-orange-600 group-hover:underline flex items-center gap-1">
                    Create budget <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Populated grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {budgets.map((b) => (
                <BudgetCard key={b.id} budget={b} onView={setActiveBudget} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <CreateBudgetModal
          initialScope={createScope}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {showExpenseModal && activeBudget && (
        <AddExpenseModal
          budget={activeBudget}
          preCategory={activeCategory}
          onClose={() => { setShowExpenseModal(false); setActiveCategory(null); }}
          onAdded={handleExpenseAdded}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
