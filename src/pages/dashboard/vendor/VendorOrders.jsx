import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Search, Clock, CheckCircle2, Truck,
  XCircle, MessageSquare, ArrowRight, Loader2, RefreshCw,
} from 'lucide-react';
import { vendorDash } from '../../../lib/api';
import toast from 'react-hot-toast';

// ─── Order state machine ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
  new:              { label: 'New',              color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  processing:       { label: 'Processing',       color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  ready:            { label: 'Ready',            color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  out_for_delivery: { label: 'Out for delivery', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  delivered:        { label: 'Delivered',        color: 'bg-teal-100 text-teal-700',    dot: 'bg-teal-500' },
  confirmed:        { label: 'Confirmed',        color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  cancelled:        { label: 'Cancelled',        color: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
};

const TABS = [
  { id: 'all',         label: 'All' },
  { id: 'new',         label: 'New' },
  { id: 'processing',  label: 'Processing' },
  { id: 'ready',       label: 'Ready' },
  { id: 'out_for_delivery', label: 'Delivering' },
  { id: 'delivered',   label: 'Delivered' },
  { id: 'confirmed',   label: 'Confirmed' },
  { id: 'cancelled',   label: 'Cancelled' },
];

const NEXT_STATUSES = {
  new:              ['processing', 'cancelled'],
  processing:       ['ready', 'cancelled'],
  ready:            ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered:        [],
  confirmed:        [],
  cancelled:        [],
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function OrderCard({ order, onUpdateStatus }) {
  const [updating, setUpdating] = useState(false);
  const nextActions = NEXT_STATUSES[order.status] || [];

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      await onUpdateStatus(order.id, status);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-400">
            {fmtDate(order.created_at)} · {order.customer_name || 'Customer'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-extrabold text-ep-navy">₦{(order.total_amount / 100).toLocaleString()}</div>
        </div>
      </div>

      {order.delivery_address && (
        <div className="flex items-start gap-2 text-xs text-gray-500 mb-3 bg-gray-50 rounded-xl px-3 py-2">
          <Truck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
          <span className="line-clamp-2">{order.delivery_address}</span>
        </div>
      )}

      {order.notes && (
        <p className="text-xs text-gray-500 italic mb-3">"{order.notes}"</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        {nextActions.map(status => (
          <button key={status} type="button"
            onClick={() => handleStatus(status)}
            disabled={updating}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${
              status === 'cancelled'
                ? 'border border-red-200 text-red-600 hover:bg-red-50'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}>
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
              <>
                {status === 'processing' && <><Clock className="w-3.5 h-3.5" /> Start processing</>}
                {status === 'ready' && <><CheckCircle2 className="w-3.5 h-3.5" /> Mark ready</>}
                {status === 'out_for_delivery' && <><Truck className="w-3.5 h-3.5" /> Out for delivery</>}
                {status === 'delivered' && <><CheckCircle2 className="w-3.5 h-3.5" /> Mark delivered</>}
                {status === 'cancelled' && <><XCircle className="w-3.5 h-3.5" /> Cancel</>}
              </>
            )}
          </button>
        ))}
        {nextActions.length === 0 && (
          <p className="text-xs text-gray-400 py-1">
            {order.status === 'confirmed' ? 'Order complete ✓' : order.status === 'cancelled' ? 'Order cancelled' : 'Awaiting customer confirmation'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function VendorOrders() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    setLoading(true);
    vendorDash.listOrders()
      .then(data => setOrders(data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const result = await vendorDash.updateOrderStatus(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: result.status } : o));
      toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const filtered = orders.filter(o => {
    if (activeTab !== 'all' && o.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !(o.customer_name || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = TABS.reduce((acc, tab) => {
    acc[tab.id] = tab.id === 'all' ? orders.length : orders.filter(o => o.status === tab.id).length;
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-ep-navy">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" onClick={loadOrders} disabled={loading}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by order ID or customer name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`text-[10px] font-bold ${activeTab === tab.id ? 'text-white/70' : 'text-gray-400'}`}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">
            {activeTab !== 'all' ? `No ${activeTab.replace(/_/g, ' ')} orders` : 'No orders yet'}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            {activeTab === 'all' ? 'Orders will appear here once customers purchase your products.' : 'Switch tabs to see other orders.'}
          </p>
          {activeTab === 'all' && (
            <Link to="/dashboard/inventory"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">
              Add products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
