import { useState, useEffect, useCallback } from 'react';
import {
  FileSearch, Plus, X, Loader2, AlertCircle, RefreshCw, Eye, Calendar,
  Building2, CheckSquare, Square, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { rfqs, events, orgs } from '../../../lib/api';

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');

const TABS = [
  { key: 'all',        label: 'All' },
  { key: 'draft',      label: 'Draft' },
  { key: 'open',       label: 'Open' },
  { key: 'evaluating', label: 'Evaluating' },
  { key: 'awarded',    label: 'Awarded' },
  { key: 'cancelled',  label: 'Cancelled' },
];

const STATUS_PILL = {
  draft:      'bg-gray-100 text-gray-600',
  open:       'bg-blue-100 text-blue-700',
  evaluating: 'bg-yellow-100 text-yellow-700',
  awarded:    'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

function NewRFQModal({ orgId, eventsList, vendorList, onClose, onDone }) {
  const [form, setForm] = useState({
    title: '', event_id: '', description: '', deadline: '', budget_hint: '',
  });
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleVendor = (id) => {
    setSelectedVendors(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    if (!form.description.trim()) { toast.error('Please describe what you need.'); return; }
    if (!form.deadline) { toast.error('Deadline is required.'); return; }
    try {
      setSubmitting(true);
      await rfqs.create(orgId, {
        title: form.title.trim(),
        event_id: form.event_id || undefined,
        description: form.description.trim(),
        deadline: form.deadline,
        vendor_ids: selectedVendors.length > 0 ? selectedVendors : undefined,
      });
      toast.success('Quote request created and sent to vendors!');
      onDone();
    } catch (err) {
      toast.error(err.message || 'Failed to create quote request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">New quote request</h3>
            <p className="text-xs text-gray-400 mt-0.5">Describe what you need, select vendors, and send — they'll respond with their quotes.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Photography & Videography for Annual Retreat"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              What do you need? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Describe your requirements — dates, quantities, specifications, delivery location…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Response deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Link to event <span className="text-gray-400 font-normal">(opt)</span>
              </label>
              <select
                value={form.event_id}
                onChange={e => set('event_id', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">No event</option>
                {eventsList.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title || ev.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vendor selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Send to vendors <span className="text-gray-400 font-normal">(select from your directory)</span>
            </label>
            {vendorList.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <Info className="w-4 h-4 flex-shrink-0" />
                No vendors in your directory yet. Go to the Vendors tab to add some first.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-36 overflow-y-auto">
                {vendorList.map(v => {
                  const selected = selectedVendors.includes(v.id);
                  return (
                    <button key={v.id} type="button" onClick={() => toggleVendor(v.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${selected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                      {selected
                        ? <CheckSquare className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        : <Square className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                      <span className="text-sm font-medium text-gray-800">{v.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{v.category}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {selectedVendors.length > 0 && (
              <p className="text-xs text-orange-600 font-medium mt-1.5">
                {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Send quote request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CorporateRFQs() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [rfqList, setRfqList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!orgId) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const [rfqRes, evRes, vendorRes] = await Promise.allSettled([
        rfqs.list(orgId),
        events.list(),
        orgs.listVendors(orgId),
      ]);
      if (rfqRes.status === 'fulfilled') {
        const d = rfqRes.value;
        setRfqList(Array.isArray(d) ? d : d?.rfqs || []);
      } else {
        setRfqList([]);
      }
      if (evRes.status === 'fulfilled') {
        const d = evRes.value;
        setEventsList(Array.isArray(d) ? d : d?.events || []);
      }
      if (vendorRes.status === 'fulfilled') {
        const d = vendorRes.value;
        setVendorList(Array.isArray(d) ? d : d?.vendors || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load quote requests.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = rfqList.filter(r =>
    activeTab === 'all' ? true : (r.status || 'draft') === activeTab
  );

  const countFor = (key) =>
    key === 'all' ? rfqList.length : rfqList.filter(r => (r.status || 'draft') === key).length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Quote Requests</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Send requirements to vendors and compare their quotes side by side.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors flex-shrink-0 ml-4">
          <Plus className="w-4 h-4" />
          New quote request
        </button>
      </div>

      {/* How it works */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 mb-6">
        <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2">How it works</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-orange-800">
          <span>① Add vendors to your directory</span>
          <span>→ ② Create a quote request &amp; select vendors</span>
          <span>→ ③ Vendors respond with their prices</span>
          <span>→ ④ You compare &amp; award the best quote</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 mt-5 flex-wrap">
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
          <button onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Empty state (no RFQs at all) */}
      {!loading && !error && rfqList.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
            <FileSearch className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">No quote requests yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Send requirements to multiple vendors at once and compare their quotes side by side.
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" />
            Create your first quote request
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && rfqList.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileSearch className="w-8 h-8 text-gray-300" />
              <p className="text-gray-500 text-sm">No quote requests with this status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ref</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Event</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Responses</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(r => {
                    const status = r.status || 'draft';
                    const pillCls = STATUS_PILL[status] || STATUS_PILL.draft;
                    const deadline = r.deadline ? new Date(r.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{r.ref || r.id?.slice(0, 8)}</td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900 max-w-xs truncate">{r.title}</td>
                        <td className="px-4 py-3.5 text-gray-500">{r.event_name || '—'}</td>
                        <td className="px-4 py-3.5 text-gray-700">
                          {r.response_count != null ? (
                            <span className="font-semibold">{r.response_count}</span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {deadline}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${pillCls}`}>
                            {status}
                          </span>
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

      {showNewModal && (
        <NewRFQModal
          orgId={orgId}
          eventsList={eventsList}
          vendorList={vendorList}
          onClose={() => setShowNewModal(false)}
          onDone={() => { setShowNewModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}
