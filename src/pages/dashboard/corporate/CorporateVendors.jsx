import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, X, Loader2, AlertCircle, RefreshCw, Eye, Star,
  Search, Store, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { orgs, discover } from '../../../lib/api';

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');

const CATEGORIES = [
  'Venue', 'Catering', 'Photography', 'Entertainment',
  'Decor', 'Transport', 'Tech & AV', 'Print', 'Security', 'Other',
];

const STATUS_TABS = [
  { key: 'all',         label: 'All' },
  { key: 'preferred',   label: 'Preferred' },
  { key: 'active',      label: 'Active' },
  { key: 'blacklisted', label: 'Blacklisted' },
];

const STATUS_BADGE = {
  preferred:   'bg-green-100 text-green-700',
  active:      'bg-blue-100 text-blue-700',
  blacklisted: 'bg-red-100 text-red-700',
  inactive:    'bg-gray-100 text-gray-500',
};

// ─── Add Vendor Modal ────────────────────────────────────────────────────────
function AddVendorModal({ orgId, onClose, onDone }) {
  const [form, setForm] = useState({
    name: '', category: '', email: '', phone: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Vendor name is required.'); return; }
    if (!form.category) { toast.error('Please select a category.'); return; }
    try {
      setSubmitting(true);
      await orgs.addVendor(orgId, {
        name: form.name.trim(),
        category: form.category,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success('Vendor added to your directory!');
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
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Sunshine Events Photography"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="vendor@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="08012345678"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              placeholder="Any notes about this vendor…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
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

// ─── Marketplace vendor card ─────────────────────────────────────────────────
function MarketplaceCard({ vendor, orgId, onAdded }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (adding || added) return;
    setAdding(true);
    try {
      await orgs.addVendor(orgId, {
        name: vendor.business_name,
        category: vendor.category,
      });
      setAdded(true);
      onAdded?.();
      toast.success(`${vendor.business_name} added to your directory!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add vendor.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-snug">{vendor.business_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {vendor.category}
            {vendor.city ? ` · ${vendor.city}` : ''}
            {vendor.state ? `, ${vendor.state}` : ''}
          </p>
        </div>
        {vendor.rating != null && (
          <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold flex-shrink-0">
            <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
            {Number(vendor.rating).toFixed(1)}
          </span>
        )}
      </div>
      {vendor.bio && (
        <p className="text-xs text-gray-500 line-clamp-2">{vendor.bio}</p>
      )}
      <button onClick={handleAdd} disabled={adding || added}
        className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 mt-auto ${
          added
            ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
            : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 disabled:opacity-60'
        }`}>
        {adding
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : added
          ? <CheckCircle className="w-3.5 h-3.5" />
          : <Plus className="w-3.5 h-3.5" />}
        {added ? 'Added to directory' : 'Add to my vendors'}
      </button>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function CorporateVendors() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [pageTab, setPageTab] = useState('mine');

  // My Vendors state
  const [vendorList, setVendorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Marketplace state
  const [mktVendors, setMktVendors] = useState([]);
  const [mktLoading, setMktLoading] = useState(false);
  const [mktSearch, setMktSearch] = useState('');
  const [mktCategory, setMktCategory] = useState('');
  const [mktFetched, setMktFetched] = useState(false);

  const fetchMyVendors = useCallback(async () => {
    if (!orgId) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await orgs.listVendors(orgId);
      setVendorList(Array.isArray(res) ? res : res?.vendors || []);
    } catch {
      setVendorList([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const fetchMarketplace = useCallback(async () => {
    setMktLoading(true);
    try {
      const params = {};
      if (mktSearch.trim()) params.q = mktSearch.trim();
      if (mktCategory) params.category = mktCategory;
      const res = await discover.vendors(params);
      setMktVendors(Array.isArray(res) ? res : res?.vendors || []);
      setMktFetched(true);
    } catch {
      setMktVendors([]);
      setMktFetched(true);
    } finally {
      setMktLoading(false);
    }
  }, [mktSearch, mktCategory]);

  useEffect(() => { fetchMyVendors(); }, [fetchMyVendors]);

  // Auto-load marketplace when switching to that tab
  useEffect(() => {
    if (pageTab === 'discover' && !mktFetched) fetchMarketplace();
  }, [pageTab, mktFetched, fetchMarketplace]);

  const filtered = vendorList.filter(v =>
    statusTab === 'all' ? true : (v.status || 'active') === statusTab
  );
  const countFor = (key) =>
    key === 'all' ? vendorList.length : vendorList.filter(v => (v.status || 'active') === key).length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Vendors</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage your vendor directory or discover verified vendors on Eventpark.
          </p>
        </div>
        {pageTab === 'mine' && (
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add vendor
          </button>
        )}
      </div>

      {/* Page tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit shadow-sm">
        {[{ key: 'mine', label: 'My Vendors' }, { key: 'discover', label: 'Find on Eventpark' }].map(tab => (
          <button key={tab.key} onClick={() => setPageTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              pageTab === tab.key ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── MY VENDORS ── */}
      {pageTab === 'mine' && (
        <>
          {/* Status filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {STATUS_TABS.map(tab => {
              const count = countFor(tab.key);
              return (
                <button key={tab.key} onClick={() => setStatusTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                    statusTab === tab.key
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'
                  }`}>
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      statusTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && vendorList.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Your vendor directory is empty</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Add vendors you already work with, or discover verified vendors on the Eventpark marketplace.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
                  <Plus className="w-4 h-4" /> Add manually
                </button>
                <button onClick={() => setPageTab('discover')}
                  className="flex items-center gap-2 px-5 py-2.5 border border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold rounded-xl text-sm transition-colors">
                  <Store className="w-4 h-4" /> Browse Eventpark vendors
                </button>
              </div>
            </div>
          )}

          {!loading && vendorList.length > 0 && (
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
                            <td className="px-5 py-3.5 font-semibold text-gray-900">{v.name}</td>
                            <td className="px-4 py-3.5 text-gray-500">{v.category || '—'}</td>
                            <td className="px-4 py-3.5 text-gray-500">{v.email || v.phone || '—'}</td>
                            <td className="px-4 py-3.5">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${badgeCls}`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right font-semibold text-gray-700">
                              {v.total_paid != null ? fmt(v.total_paid) : '—'}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => toast('Go to Quote Requests tab to send an RFQ to this vendor.', { icon: '📋' })}
                                  className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-colors">
                                  Request Quote
                                </button>
                                <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors">
                                  <Eye className="w-3.5 h-3.5" /> View
                                </button>
                              </div>
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
        </>
      )}

      {/* ── FIND ON EVENTPARK ── */}
      {pageTab === 'discover' && (
        <div>
          {/* Search bar */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={mktSearch}
                onChange={e => setMktSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchMarketplace()}
                placeholder="Search vendors by name…"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <select value={mktCategory} onChange={e => setMktCategory(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => { setMktFetched(false); fetchMarketplace(); }}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
              Search
            </button>
          </div>

          {mktLoading && (
            <div className="flex items-center justify-center h-48">
              <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!mktLoading && mktFetched && mktVendors.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <Store className="w-10 h-10 text-gray-300" />
              <p className="font-semibold text-gray-600">No vendors found</p>
              <p className="text-sm text-gray-400 max-w-sm">
                Try different search terms or clear the category filter to browse all Eventpark vendors.
              </p>
            </div>
          )}

          {!mktLoading && mktVendors.length > 0 && (
            <>
              <p className="text-xs text-gray-400 mb-4">{mktVendors.length} vendor{mktVendors.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mktVendors.map(v => (
                  <MarketplaceCard
                    key={v.id}
                    vendor={v}
                    orgId={orgId}
                    onAdded={fetchMyVendors}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddVendorModal
          orgId={orgId}
          onClose={() => setShowAddModal(false)}
          onDone={() => { setShowAddModal(false); fetchMyVendors(); }}
        />
      )}
    </div>
  );
}
