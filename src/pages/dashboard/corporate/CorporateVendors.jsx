import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, X, Loader2, AlertCircle, RefreshCw, Eye, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { vendors } from '../../../lib/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('ep_access_token');
}

async function listCorpVendors(orgId) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (import.meta.env.DEV) headers['X-Dev-Mode'] = 'true';
  const res = await fetch(`${BASE_URL}/orgs/${orgId}/vendors`, { headers });
  if (!res.ok) throw new Error('Failed to fetch vendors');
  return res.json();
}

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');

const CATEGORIES = [
  'Venue', 'Catering', 'Photography', 'Entertainment',
  'Decor', 'Transport', 'Tech & AV', 'Print', 'Security', 'Other',
];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'preferred', label: 'Preferred' },
  { key: 'active', label: 'Active' },
  { key: 'blacklisted', label: 'Blacklisted' },
];

const STATUS_BADGE = {
  preferred:   'bg-green-100 text-green-700',
  active:      'bg-blue-100 text-blue-700',
  blacklisted: 'bg-red-100 text-red-700',
  inactive:    'bg-gray-100 text-gray-500',
};

function AddVendorModal({ orgId, onClose, onDone }) {
  const [form, setForm] = useState({
    name: '', category: '', contact_email: '', contact_phone: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Vendor name is required.'); return; }
    if (!form.category) { toast.error('Please select a category.'); return; }
    try {
      setSubmitting(true);
      await vendors.create({
        name: form.name.trim(),
        category: form.category,
        contact_email: form.contact_email.trim() || undefined,
        contact_phone: form.contact_phone.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success('Vendor added!');
      onDone();
    } catch (err) {
      toast.error(err.message || 'Failed to add vendor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Add vendor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Vendor name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Sunshine Events Photography"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={e => set('contact_email', e.target.value)}
                placeholder="vendor@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact phone</label>
              <input
                value={form.contact_phone}
                onChange={e => set('contact_phone', e.target.value)}
                placeholder="08012345678"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Any notes about this vendor…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
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
              Add vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CorporateVendors() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [vendorList, setVendorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchVendors = useCallback(async () => {
    if (!orgId) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const res = await listCorpVendors(orgId);
      setVendorList(Array.isArray(res) ? res : res?.vendors || []);
    } catch {
      setVendorList([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const filtered = vendorList.filter(v => {
    if (activeTab === 'all') return true;
    return (v.status || 'active') === activeTab;
  });

  const countFor = (key) =>
    key === 'all' ? vendorList.length : vendorList.filter(v => (v.status || 'active') === key).length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Vendors</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage vendors you work with and track spend.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Add vendor
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(tab => {
          const count = countFor(tab.key);
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
          <button onClick={fetchVendors}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && vendorList.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">Your vendor directory</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Add vendors you work with — caterers, venues, photographers — and track spend, ratings, and status in one place.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" />
            Add your first vendor
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && vendorList.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Building2 className="w-8 h-8 text-gray-300" />
              <p className="text-gray-500 text-sm">No vendors in this category.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">YTD Spend</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(v => {
                    const status = v.status || 'active';
                    const badgeCls = STATUS_BADGE[status] || STATUS_BADGE.inactive;
                    return (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-gray-900">{v.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500">{v.category || '—'}</td>
                        <td className="px-4 py-3.5 text-gray-500">{v.contact_email || '—'}</td>
                        <td className="px-4 py-3.5">
                          {v.rating != null ? (
                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                              {Number(v.rating).toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${badgeCls}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-gray-700">
                          {v.ytd_spend != null ? fmt(v.ytd_spend) : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors ml-auto">
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
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

      {showAddModal && (
        <AddVendorModal
          orgId={orgId}
          onClose={() => setShowAddModal(false)}
          onDone={() => { setShowAddModal(false); fetchVendors(); }}
        />
      )}
    </div>
  );
}
