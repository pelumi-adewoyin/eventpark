import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Search, Filter, ChevronDown, Package,
  Clock, CheckCircle2, Truck, XCircle, MessageSquare,
  ArrowRight, MoreVertical,
} from 'lucide-react';

// ─── Order state machine ──────────────────────────────────────────────────────
// new → processing → ready → out_for_delivery → delivered → confirmed
// Any state → cancelled (before delivered)

const STATUS_CONFIG = {
  new:              { label: 'New',              color: 'bg-blue-100 text-blue-700',    icon: '🆕', dot: 'bg-blue-500' },
  processing:       { label: 'Processing',       color: 'bg-orange-100 text-orange-700', icon: '⚙️', dot: 'bg-orange-500' },
  ready:            { label: 'Ready',            color: 'bg-amber-100 text-amber-700',  icon: '📦', dot: 'bg-amber-500' },
  out_for_delivery: { label: 'Out for delivery', color: 'bg-purple-100 text-purple-700',icon: '🚚', dot: 'bg-purple-500' },
  delivered:        { label: 'Delivered',        color: 'bg-teal-100 text-teal-700',    icon: '✅', dot: 'bg-teal-500' },
  confirmed:        { label: 'Confirmed',        color: 'bg-green-100 text-green-700',  icon: '🎉', dot: 'bg-green-500' },
  cancelled:        { label: 'Cancelled',        color: 'bg-red-100 text-red-700',      icon: '❌', dot: 'bg-red-400' },
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

// Simulated orders (will come from API in production)
const MOCK_ORDERS = [];

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function OrderCard({ order, onUpdateStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const nextStatuses = {
    new:              ['processing', 'cancelled'],
    processing:       ['ready', 'cancelled'],
    ready:            ['out_for_delivery'],
    out_for_delivery: ['delivered'],
    delivered:        [],
    confirmed:        [],
    cancelled:        [],
  };

  const nextActions = nextStatuses[order.status] || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-ep-navy">#{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-400">{order.date} · {order.customerName}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-extrabold text-ep-navy">₦{order.total.toLocaleString()}</div>
          <div className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
              {item.emoji || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-ep-navy truncate">{item.name}</div>
              <div className="text-xs text-gray-400">Qty {item.qty} · ₦{item.price.toLocaleString()} each</div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <Link to={`/dashboard/workspace?order=${order.id}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </Link>
        {nextActions.map(status => (
          <button key={status} type="button"
            onClick={() => onUpdateStatus(order.id, status)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              status === 'cancelled'
                ? 'border border-red-200 text-red-600 hover:bg-red-50'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}>
            {status === 'processing' && <><Clock className="w-3.5 h-3.5" /> Start processing</>}
            {status === 'ready' && <><CheckCircle2 className="w-3.5 h-3.5" /> Mark ready</>}
            {status === 'out_for_delivery' && <><Truck className="w-3.5 h-3.5" /> Out for delivery</>}
            {status === 'delivered' && <><CheckCircle2 className="w-3.5 h-3.5" /> Mark delivered</>}
            {status === 'cancelled' && <><XCircle className="w-3.5 h-3.5" /> Cancel</>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function VendorOrders() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState(MOCK_ORDERS);

  const filtered = orders.filter(o => {
    if (activeTab !== 'all' && o.status !== activeTab) return false;
    if (search && !o.id.includes(search) && !o.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const updateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

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
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} total orders</p>
        </div>
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
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">No orders yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Orders will appear here once customers purchase your products.
          </p>
          <Link to="/dashboard/inventory"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">
            Add products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
