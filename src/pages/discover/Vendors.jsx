import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, CheckCircle, Briefcase } from 'lucide-react';
import { sampleVendors } from '../../data/sampleData';

const categories = ['All', 'Bakery & Cakes', 'Photography & Video', 'Catering', 'Event Decor', 'Furniture & Equipment', 'Entertainment & Music'];

export default function DiscoverVendors() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = sampleVendors.filter(v => {
    const matchCat = selectedCategory === 'All' || v.category === selectedCategory;
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Discover Vendors</h1>
          <p className="text-gray-500 mb-6">Find and book the best event professionals in Nigeria.</p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors, locations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-500 mb-6">{filtered.length} vendors found</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(vendor => (
            <Link
              key={vendor.id}
              to={`/discover/vendors/${vendor.id}`}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow group"
            >
              {/* Cover */}
              <div className="relative h-40 overflow-hidden bg-gray-100">
                <img src={vendor.coverImage} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80" />
                {/* Avatar */}
                <div className="absolute bottom-0 left-4 translate-y-1/2">
                  <img src={vendor.image} alt={vendor.name} className="w-14 h-14 rounded-xl border-2 border-white object-cover shadow-md" />
                </div>
              </div>

              <div className="pt-10 px-4 pb-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">{vendor.name}</h3>
                  {vendor.verified && (
                    <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="text-xs text-brand-600 font-medium mb-2">{vendor.category}</div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {vendor.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {vendor.completedJobs} jobs
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{vendor.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-gray-700">{vendor.rating}</span>
                    <span className="text-xs text-gray-400">({vendor.reviews})</span>
                  </div>
                  <span className="text-xs font-semibold text-brand-600 hover:underline">View Profile →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No vendors found</p>
          </div>
        )}
      </div>
    </div>
  );
}
