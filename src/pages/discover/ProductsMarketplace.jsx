import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Heart, Star, Package, ChevronRight, X, Plus, Minus, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discover, wishlist, ordersApi } from '../../lib/api';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'All',
  'Cakes & Pastry',
  'Flowers',
  'Gifts',
  'Branded Swag',
  'Decor',
  'Stationery',
  'Plaques & Awards',
  'Hampers',
  'Custom Made',
  'Tech Gadgets',
  'Beverages',
];

const PRICE_FILTERS = [
  { label: 'Any price', min: null, max: null },
  { label: 'Under ₦10K', min: null, max: 10000 },
  { label: '₦10K–₦50K', min: 10000, max: 50000 },
  { label: '₦50K–₦200K', min: 50000, max: 200000 },
  { label: '₦200K+', min: 200000, max: null },
];

const CATEGORY_SUGGESTIONS = [
  { emoji: '🎂', name: 'Cakes & Pastry', desc: 'Custom celebration cakes, cupcakes, desserts' },
  { emoji: '💐', name: 'Flowers & Decor', desc: 'Bouquets, centrepieces, venue flowers' },
  { emoji: '🎁', name: 'Gift Hampers', desc: 'Curated hampers for any occasion' },
  { emoji: '👕', name: 'Branded Swag', desc: 'Company merchandise and event souvenirs' },
  { emoji: '🏆', name: 'Awards & Plaques', desc: 'Custom trophies, plaques, and recognition gifts' },
  { emoji: '📱', name: 'Tech Gadgets', desc: 'Power banks, earbuds, and branded accessories' },
];

const CATEGORY_EMOJI = {
  'Cakes & Pastry': '🎂',
  'Flowers': '💐',
  'Gifts': '🎁',
  'Branded Swag': '👕',
  'Decor': '🌸',
  'Stationery': '📄',
  'Plaques & Awards': '🏆',
  'Hampers': '🧺',
  'Custom Made': '✨',
  'Tech Gadgets': '📱',
  'Beverages': '🍹',
};

const CATEGORY_GRADIENTS = [
  'from-pink-400 to-rose-500',
  'from-purple-400 to-violet-500',
  'from-orange-400 to-amber-500',
  'from-blue-400 to-sky-500',
  'from-green-400 to-emerald-500',
  'from-teal-400 to-cyan-500',
  'from-yellow-400 to-orange-500',
  'from-red-400 to-pink-500',
];

// Prices stored as kobo (integer × 100) — divide for display
const fmt = (kobo) => `₦${Number((kobo || 0) / 100).toLocaleString('en-NG')}`;

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, index, onAddToCart, savedIds, onToggleSave }) {
  const emoji = CATEGORY_EMOJI[product.category] || '📦';
  const gradient = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];
  const isSaved = savedIds.has(product.id);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      {/* Image placeholder */}
      <div className={`w-full aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center text-5xl relative`}>
        {emoji}
        <button
          onClick={() => onToggleSave(product)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${
            isSaved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'
          }`}
          title={isSaved ? 'Saved' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        {product.min_order && product.min_order > 1 && (
          <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Min {product.min_order}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{product.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{product.vendor_name || 'Eventpark Vendor'}</p>
        </div>

        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-gray-600">{product.rating.toFixed(1)}</span>
            {product.review_count > 0 && (
              <span className="text-xs text-gray-400">({product.review_count})</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-base font-extrabold text-orange-600">{fmt(product.price)}</span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="w-full py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to cart
        </button>
      </div>
    </div>
  );
}

// ─── Checkout Modal ───────────────────────────────────────────────────────────

function CheckoutModal({ cartItems, onClose, onSuccess, user, navigate }) {
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const subtotal = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  const handleSubmit = async () => {
    if (!user) {
      toast('Please log in to place an order', { icon: '🔐' });
      navigate('/login?next=/discover/products');
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    // Group items by vendor
    const byVendor = {};
    for (const { product, quantity } of cartItems) {
      const vid = product.vendor_id;
      if (!byVendor[vid]) byVendor[vid] = [];
      byVendor[vid].push({ product_id: product.id, quantity });
    }

    setSubmitting(true);
    try {
      const vendorIds = Object.keys(byVendor);
      await Promise.all(vendorIds.map(vid =>
        ordersApi.place({
          vendor_id: vid,
          items: byVendor[vid],
          delivery_address: address.trim(),
          notes: notes.trim() || undefined,
        })
      ));
      setDone(true);
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
          {done ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Order placed!</h2>
              <p className="text-sm text-gray-500 mb-6">The vendor will confirm and reach out with delivery details.</p>
              <button onClick={onClose} className="px-6 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors">
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Checkout</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-4">
                {/* Order summary */}
                <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-gray-700 truncate max-w-[200px]">{product.name} × {quantity}</span>
                      <span className="font-semibold text-gray-900 flex-shrink-0 ml-2">{fmt(product.price * quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-sm font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">{fmt(subtotal)}</span>
                  </div>
                </div>

                {/* Delivery address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    Delivery address *
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address…"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Order notes (optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special instructions for the vendor…"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>
              </div>
              <div className="px-5 pb-5">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing order…</> : `Place order · ${fmt(subtotal)}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({ cartItems, onClose, onUpdateQty, onRemove, onClear, onCheckout }) {
  const subtotal = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            Cart
            {cartItems.length > 0 && (
              <span className="bg-orange-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartItems.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button onClick={onClear} className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors">
                Clear
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <ShoppingCart className="w-12 h-12 text-gray-200" />
              <p className="text-gray-400 text-sm text-center">Your cart is empty.<br />Add products to get started.</p>
            </div>
          ) : (
            cartItems.map(({ product, quantity }) => {
              const emoji = CATEGORY_EMOJI[product.category] || '📦';
              const gradient = CATEGORY_GRADIENTS[product.id?.charCodeAt(0) % CATEGORY_GRADIENTS.length || 0];
              return (
                <div key={product.id} className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl flex-shrink-0`}>
                    {emoji}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-orange-600 font-bold">{fmt(product.price * quantity)}</p>
                  </div>

                  {/* Qty stepper */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onUpdateQty(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => onUpdateQty(product.id, quantity + 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemove(product.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Subtotal</span>
              <span className="text-base font-extrabold text-gray-900">{fmt(subtotal)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Checkout · {fmt(subtotal)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-12 gap-8">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
        <Package className="w-8 h-8 text-orange-400" />
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Explore products from Eventpark vendors</h2>
        <p className="text-sm text-gray-400">Browse and order cakes, gifts, branded swag, decor, and more — directly from verified vendors.</p>
      </div>

      {/* Category suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
        {CATEGORY_SUGGESTIONS.map((cat) => (
          <Link
            key={cat.name}
            to={`/discover/vendors?category=${encodeURIComponent(cat.name)}`}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3 group"
          >
            <div className="text-3xl">{cat.emoji}</div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{cat.desc}</p>
            </div>
            <span className="text-xs font-semibold text-orange-600 flex items-center gap-1 group-hover:underline mt-auto">
              Browse vendors in this category <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductsMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasProducts, setHasProducts] = useState(false);

  const [activeCategory, setActiveCategory] = useState('All');
  const [activePriceIdx, setActivePriceIdx] = useState(0);
  const [search, setSearch] = useState('');

  const [cartItems, setCartItems] = useState([]); // [{ product, quantity }]
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [savedIds, setSavedIds] = useState(new Set());

  // ── Fetch products ──────────────────────────────────────────────────────────

  useEffect(() => {
    const priceFilter = PRICE_FILTERS[activePriceIdx];
    const params = {};
    if (activeCategory !== 'All') params.category = activeCategory;
    if (priceFilter.min != null) params.min_price = priceFilter.min;
    if (priceFilter.max != null) params.max_price = priceFilter.max;

    setLoading(true);
    discover.products(params)
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.products || data?.items || []);
        setProducts(items);
        setHasProducts(items.length > 0);
      })
      .catch(() => {
        setProducts([]);
        setHasProducts(false);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, activePriceIdx]);

  // ── Cart actions ────────────────────────────────────────────────────────────

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCartItems((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i));
    }
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  // ── Wishlist toggle ─────────────────────────────────────────────────────────

  const toggleSave = async (product) => {
    const alreadySaved = savedIds.has(product.id);

    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (alreadySaved) next.delete(product.id);
      else next.add(product.id);
      return next;
    });

    if (!user) {
      toast('Sign in to save products to your wishlist', { icon: '💡' });
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (alreadySaved) next.add(product.id);
        else next.delete(product.id);
        return next;
      });
      return;
    }

    try {
      // Attempt to add to the first wishlist; graceful degradation if it fails
      if (!alreadySaved) {
        const lists = await wishlist.list().catch(() => []);
        const firstList = Array.isArray(lists) ? lists[0] : null;
        if (firstList) {
          await wishlist.addItem(firstList.id, { name: product.name, price_ngn: product.price });
        }
        toast.success('Saved to wishlist');
      } else {
        toast('Removed from saved items', { icon: '💔' });
      }
    } catch {
      // Keep optimistic state — save is best-effort
    }
  };

  // ── Filtered products ───────────────────────────────────────────────────────

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.vendor_name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">Products</h1>
              <p className="text-xs text-gray-400 mt-0.5">From Eventpark vendors</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 w-52"
                />
              </div>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="relative mt-3 sm:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
          </div>

          {/* Filter bar */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {/* Category chips */}
            <div className="flex items-center gap-1.5 flex-nowrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 flex-shrink-0 mx-1" />

            {/* Price filter */}
            <select
              value={activePriceIdx}
              onChange={(e) => setActivePriceIdx(Number(e.target.value))}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            >
              {PRICE_FILTERS.map((f, i) => (
                <option key={i} value={i}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                <div className="w-full aspect-square bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-8 bg-gray-100 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasProducts ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <Package className="w-12 h-12 text-gray-200" />
            <p className="text-gray-400 text-sm">No products match your search.</p>
            <button onClick={() => setSearch('')} className="text-sm font-semibold text-orange-600 hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onAddToCart={addToCart}
                savedIds={savedIds}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Cart Drawer ─────────────────────────────────────────────────────── */}
      {cartOpen && (
        <CartDrawer
          cartItems={cartItems}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClear={clearCart}
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        />
      )}

      {/* ── Checkout Modal ───────────────────────────────────────────────────── */}
      {checkoutOpen && (
        <CheckoutModal
          cartItems={cartItems}
          user={user}
          navigate={navigate}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => { clearCart(); }}
        />
      )}
    </div>
  );
}
