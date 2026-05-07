import { useState, useEffect } from 'react';
import {
  Plus, Search, Package, Edit2, Trash2, Eye, EyeOff,
  ArrowRight, Upload, ChevronDown, X, Check, Loader2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { vendorDash } from '../../../lib/api';
import toast from 'react-hot-toast';

const PRODUCT_CATEGORIES = [
  { id: 'invites_stationery', label: 'Invitations & Stationery' },
  { id: 'cakes_pastries', label: 'Cakes & Pastries' },
  { id: 'flowers_bouquets', label: 'Flowers & Bouquets' },
  { id: 'gifts_hampers', label: 'Gifts & Hampers' },
  { id: 'party_supplies', label: 'Party Supplies' },
  { id: 'fabric_asoebi', label: 'Fabric & Aso-Ebi' },
  { id: 'event_equipment', label: 'Event Equipment Rentals' },
  { id: 'clothing_accessories', label: 'Clothing & Accessories' },
  { id: 'printing_branding', label: 'Printing & Branding' },
  { id: 'food_drinks', label: 'Food & Drinks' },
  { id: 'beauty_products', label: 'Beauty Products' },
  { id: 'other_product', label: 'Other' },
];

const DELIVERY_ZONES = [
  'Lagos', 'Abuja (FCT)', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu',
  'Benin City', 'Kaduna', 'Jos', 'Owerri', 'Uyo', 'Warri', 'Nationwide',
];

function Lbl({ children }) {
  return <label className="block text-xs font-semibold text-ep-navy mb-1.5">{children}</label>;
}

function Inp({ label, error, ...props }) {
  return (
    <div>
      {label && <Lbl>{label}</Lbl>}
      <input {...props}
        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 ${error ? 'border-red-300' : 'border-gray-200'}`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Add / Edit Product Modal ─────────────────────────────────────────────────

function ProductModal({ onClose, onSave, editProduct }) {
  const isEdit = !!editProduct;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: editProduct?.name || '',
    category: editProduct?.category || '',
    description: editProduct?.description || '',
    price: editProduct ? String(editProduct.price) : '',
    min_order_qty: editProduct?.min_order_qty ? String(editProduct.min_order_qty) : '1',
    lead_time_days: editProduct?.lead_time_days ? String(editProduct.lead_time_days) : '3',
    stock: editProduct?.stock ? String(editProduct.stock) : '',
    free_delivery_above: editProduct?.free_delivery_above ? String(editProduct.free_delivery_above) : '',
    delivery_zones: editProduct?.delivery_zones || [],
  });
  const [newOption, setNewOption] = useState({ name: '', variants: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const steps = isEdit
    ? [{ num: 1, label: 'Basics' }, { num: 2, label: 'Details' }, { num: 3, label: 'Delivery' }]
    : [{ num: 1, label: 'Basics' }, { num: 2, label: 'Details' }, { num: 3, label: 'Delivery' }];

  const maxStep = 3;

  const toggleZone = (z) =>
    set('delivery_zones', form.delivery_zones.includes(z)
      ? form.delivery_zones.filter(x => x !== z)
      : [...form.delivery_zones, z]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || undefined,
        price: Math.round(Number(form.price) * 100), // convert ₦ to kobo
        min_order_qty: Number(form.min_order_qty) || 1,
        lead_time_days: Number(form.lead_time_days) || 3,
        stock: form.stock ? Number(form.stock) : undefined,
        free_delivery_above: form.free_delivery_above ? Math.round(Number(form.free_delivery_above) * 100) : undefined,
        delivery_zones: form.delivery_zones,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-ep-navy">{isEdit ? 'Edit product' : 'Add product'}</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 py-3 gap-2 border-b border-gray-100">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step >= s.num ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-ep-navy' : 'text-gray-400'}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${step > s.num ? 'bg-brand-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <>
              <Inp label="Product name *" placeholder="Hand-crafted wedding invitation"
                value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
              <div>
                <Lbl>Category *</Lbl>
                <div className="relative">
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none bg-white">
                    <option value="">Select category…</option>
                    {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <Lbl>Product photos</Lbl>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-300 cursor-pointer transition-colors">
                  <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Upload product photos (up to 10)</p>
                  <p className="text-xs text-gray-300 mt-1">JPEG or PNG · max 5MB each</p>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Lbl>Description</Lbl>
                <textarea placeholder="Describe your product — materials, what's included, customisation options…"
                  value={form.description} onChange={e => set('description', e.target.value)} rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Inp label="Price (₦) *" type="number" placeholder="15000" value={form.price}
                  onChange={e => set('price', e.target.value)} />
                <Inp label="Min order qty" type="number" placeholder="1" value={form.min_order_qty}
                  onChange={e => set('min_order_qty', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Inp label="Lead time (days)" type="number" placeholder="3" value={form.lead_time_days}
                  onChange={e => set('lead_time_days', e.target.value)} />
                <Inp label="Stock qty (optional)" type="number" placeholder="Unlimited" value={form.stock}
                  onChange={e => set('stock', e.target.value)} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <Lbl>Delivery zones</Lbl>
                <p className="text-xs text-gray-400 mb-2">Select states / cities you deliver to</p>
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                  {DELIVERY_ZONES.map(z => (
                    <button key={z} type="button" onClick={() => toggleZone(z)}
                      className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all ${form.delivery_zones.includes(z) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>
                      {z}
                    </button>
                  ))}
                </div>
              </div>
              <Inp label="Free delivery above (₦, optional)" type="number" placeholder="50000"
                value={form.free_delivery_above} onChange={e => set('free_delivery_above', e.target.value)} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Back
            </button>
          )}
          {step < maxStep ? (
            <button type="button" onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!form.name.trim() || !form.category)}
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.price}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? 'Save changes' : 'Publish product')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onToggle, onEdit, onDelete }) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(product.id);
    setToggling(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
      <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          : '📦'}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-ep-navy line-clamp-1">{product.name}</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {product.active ? 'Live' : 'Hidden'}
          </span>
        </div>
        {product.description && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-ep-navy">
            ₦{(product.price / 100).toLocaleString()}
          </span>
          <div className="flex gap-1">
            <button type="button" onClick={handleToggle} disabled={toggling}
              title={product.active ? 'Hide product' : 'Show product'}
              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50">
              {toggling
                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                : product.active
                  ? <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                  : <Eye className="w-3.5 h-3.5 text-gray-500" />}
            </button>
            <button type="button" onClick={() => onEdit(product)}
              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Edit2 className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button type="button" onClick={() => onDelete(product.id)}
              className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function VendorInventory() {
  const { activeWorkspace } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');

  const verificationStatus = activeWorkspace?.verificationStatus || 'tier_1';
  const canAddMore = verificationStatus !== 'tier_1' || products.length < 1;

  // Load products from backend
  useEffect(() => {
    vendorDash.listProducts()
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const saveProduct = async (formData) => {
    try {
      if (editProduct) {
        const updated = await vendorDash.updateProduct(editProduct.id, formData);
        setProducts(prev => prev.map(p => p.id === editProduct.id ? updated : p));
        toast.success('Product updated');
      } else {
        const created = await vendorDash.createProduct(formData);
        setProducts(prev => [created, ...prev]);
        toast.success('Product published');
      }
      setShowModal(false);
      setEditProduct(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to save product');
      throw err;
    }
  };

  const toggleProduct = async (id) => {
    try {
      const updated = await vendorDash.toggleProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    } catch {
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await vendorDash.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-ep-navy">Inventory</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} listed</p>
        </div>
        <button type="button"
          onClick={() => canAddMore ? (setEditProduct(null), setShowModal(true)) : null}
          disabled={!canAddMore || loading}
          title={!canAddMore ? 'Verify your business to add more products' : ''}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      {/* Tier 1 warning */}
      {verificationStatus === 'tier_1' && products.length >= 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Tier 1 listing limit reached</p>
            <p className="text-xs text-amber-700 mt-0.5">Verify your business to add unlimited products.</p>
          </div>
        </div>
      )}

      {/* Search */}
      {products.length > 0 && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">No products yet</p>
          <p className="text-xs text-gray-300 mt-1">Add your first product to start selling on EventPark.</p>
          <button type="button" onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add first product
          </button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p}
              onToggle={toggleProduct} onEdit={openEdit} onDelete={deleteProduct} />
          ))}
        </div>
      )}

      {showModal && (
        <ProductModal
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={saveProduct}
          editProduct={editProduct}
        />
      )}
    </div>
  );
}
