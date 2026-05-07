import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, CheckCircle, Briefcase } from 'lucide-react';
import { discover } from '../../lib/api';

const categories = ['All', 'Bakery & Cakes', 'Photography & Video', 'Catering', 'Event Decor', 'Furniture & Equipment', 'Entertainment & Music'];

export default function DiscoverVendors() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (search.trim()) params.search = search.trim();

    setLoading(true);
    setError(null);

    discover.vendors(params)
      .then(data => {
        setVendors(Array.isArray(data) ? data : (data.vendors ?? []));
      })
      .catch(() => setError('Failed to load vendors.'))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero header */}
      <div className="bg-ep-navy relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern-white opacity-30" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-ep-orange rounded-full opacity-10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <span className="inline-block bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Vendors</span>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Find your dream team</h1>
          <p className="text-white/50 mb-8">Browse verified event professionals across Nigeria.</p>

          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input type="text" placeholder="Search vendors, locations..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm" />
          </div>

          <div className="flex gap-2 mt-5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!loading && !error && (
          <p className="text-sm text-gray-400 font-medium mb-6">{vendors.length} vendor{vendors.length !== 1 ? 's' : ''} found</p>
        )}

        {/* Loading state — 6 skeleton cards */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-36 bg-gray-200" />
                <div className="pt-10 px-5 pb-5">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-4/5 mb-4" />
                  <div className="flex justify-between pt-3 border-t border-gray-50">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-24">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="font-bold text-gray-400">{error}</p>
            <button onClick={clearFilters} className="mt-3 text-sm text-brand-600 hover:underline">Try again</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && vendors.length === 0 && (
          <div className="text-center py-24">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="font-bold text-gray-400">No vendors found matching your search.</p>
            <button onClick={clearFilters} className="mt-3 text-sm text-brand-600 hover:underline">Clear filters</button>
          </div>
        )}

        {/* Vendor grid */}
        {!loading && !error && vendors.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendors.map(vendor => (
              <Link key={vendor.id} to={`/discover/vendors/${vendor.id}`}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50 transition-all duration-300">
                <div className="relative h-36 overflow-hidden bg-ep-blue-light">
                  {vendor.cover_url && (
                    <img src={vendor.cover_url} alt={vendor.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-4 translate-y-1/2">
                    {vendor.avatar_url ? (
                      <img src={vendor.avatar_url} alt={vendor.business_name}
                        className="w-14 h-14 rounded-2xl border-2 border-white object-cover shadow-lg" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl border-2 border-white bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl shadow-lg">
                        {vendor.business_name?.[0] ?? 'V'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-10 px-5 pb-5">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <h3 className="font-bold text-ep-navy text-sm line-clamp-1">{vendor.business_name}</h3>
                    {vendor.verified && <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />}
                  </div>
                  <div className="text-xs text-brand-600 font-semibold mb-3">{vendor.category}</div>

                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    {vendor.city && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{vendor.city}{vendor.state ? `, ${vendor.state}` : ''}</span>
                    )}
                    {vendor.events_completed != null && vendor.events_completed > 0 && (
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{vendor.events_completed} jobs</span>
                    )}
                  </div>

                  {vendor.bio && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4">{vendor.bio}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-ep-orange text-ep-orange" />
                      <span className="text-xs font-bold text-ep-navy">{vendor.rating ?? '—'}</span>
                      {vendor.review_count != null && vendor.review_count > 0 && (
                        <span className="text-xs text-gray-400">({vendor.review_count})</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-brand-600 group-hover:underline">View Profile →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
