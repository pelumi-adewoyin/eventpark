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
        <p className="text-sm text-gray-400 font-medium mb-6">{filtered.length} vendors found</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(vendor => (
            <Link key={vendor.id} to={`/discover/vendors/${vendor.id}`}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50 transition-all duration-300">
              <div className="relative h-36 overflow-hidden bg-ep-blue-light">
                <img src={vendor.coverImage} alt={vendor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-0 left-4 translate-y-1/2">
                  <img src={vendor.image} alt={vendor.name}
                    className="w-14 h-14 rounded-2xl border-2 border-white object-cover shadow-lg" />
                </div>
              </div>

              <div className="pt-10 px-5 pb-5">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <h3 className="font-bold text-ep-navy text-sm line-clamp-1">{vendor.name}</h3>
                  {vendor.verified && <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />}
                </div>
                <div className="text-xs text-brand-600 font-semibold mb-3">{vendor.category}</div>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{vendor.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{vendor.completedJobs} jobs</span>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{vendor.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-ep-orange text-ep-orange" />
                    <span className="text-xs font-bold text-ep-navy">{vendor.rating}</span>
                    <span className="text-xs text-gray-400">({vendor.reviews})</span>
                  </div>
                  <span className="text-xs font-bold text-brand-600 group-hover:underline">View Profile →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="font-bold text-gray-400">No vendors found</p>
          </div>
        )}
      </div>
    </div>
  );
}
