import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart, Shield, Truck, CheckCircle } from 'lucide-react';
import { discover } from '../../lib/api';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    // Fetch the full product list and find the matching item.
    // A dedicated /discover/products/:id endpoint can replace this once available.
    discover.products()
      .then(data => {
        const list = Array.isArray(data) ? data : (data.products ?? []);
        const found = list.find(p => String(p.id) === String(id));
        if (found) {
          setProduct(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 animate-pulse">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-4 bg-gray-200 rounded w-28 mb-6" />
          <div className="grid md:grid-cols-2 gap-10 bg-white rounded-2xl border border-gray-100 p-8">
            <div className="rounded-2xl h-80 bg-gray-200" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-7 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-16 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Link to="/discover/products" className="text-brand-600 hover:underline">Back to Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/discover/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-10 bg-white rounded-2xl border border-gray-100 p-8">
          {/* Image */}
          <div>
            <div className="rounded-2xl overflow-hidden h-80 mb-4 bg-gray-100">
              {product.image && (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="text-sm text-brand-600 font-medium mb-1">{product.category}</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating ?? '—'}</span>
              {product.reviews != null && (
                <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
              )}
            </div>

            <div className="text-3xl font-extrabold text-gray-900 mb-4">
              {product.price != null ? `₦${product.price.toLocaleString()}` : 'Price on request'}
            </div>

            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">Options</div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(i)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                        selectedVariant === i
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-semibold text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition font-bold">−</button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-900 border-x border-gray-200">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition font-bold">+</button>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <Link
                to="/signup"
                className="flex-grow flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
              </Link>
              <button className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4">
              {[
                { icon: Shield, text: 'Secure payment via EventPark escrow' },
                { icon: Truck, text: 'Delivery available in Lagos & Abuja' },
                { icon: CheckCircle, text: 'Verified vendor — guaranteed quality' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2 text-xs text-gray-500">
                  <item.icon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vendor */}
        {product.vendor && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                {product.vendor[0]}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{product.vendor}</div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified Vendor on EventPark
                </div>
              </div>
            </div>
            <Link to="/discover/vendors" className="text-sm text-brand-600 font-semibold hover:underline">
              View full vendor profile →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
