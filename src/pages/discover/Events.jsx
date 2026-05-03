import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import { sampleEvents } from '../../data/sampleData';

const categories = ['All', 'Technology', 'Music', 'Food', 'Wedding', 'Business', 'Family', 'Sports', 'Fashion', 'Entertainment', 'Education', 'Culture', 'Health'];

export default function DiscoverEvents() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = sampleEvents.filter(e => {
    const matchCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero header */}
      <div className="bg-ep-navy relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern-white opacity-30" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-600 rounded-full opacity-10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <span className="inline-block bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Discover</span>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Events near you</h1>
          <p className="text-white/50 mb-8 text-base">Browse events happening across Nigeria and beyond.</p>

          {/* Search bar */}
          <div className="flex gap-3 flex-col sm:flex-row max-w-2xl">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search events, locations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-sm text-white/70 hover:bg-white/20 transition font-medium">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-gray-400 font-medium mb-6">{filtered.length} events found</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(event => (
            <Link key={event.id} to={`/discover/events/${event.id}`}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50 transition-all duration-300">
              <div className="relative overflow-hidden h-44">
                <img src={event.image} alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-bold bg-white text-ep-navy px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                </div>
                {event.price === 0 && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold bg-green-500 text-white px-3 py-1 rounded-full">Free</span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-ep-navy text-sm leading-snug mb-3 line-clamp-2">{event.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Calendar className="w-3 h-3 text-brand-400" />
                  {event.date} · {event.time}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                  <MapPin className="w-3 h-3 text-brand-400" />
                  {event.location}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="font-extrabold text-ep-navy text-sm">
                    {event.price === 0 ? 'Free' : `₦${event.price.toLocaleString()}`}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{event.ticketsLeft} left</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-gray-300">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold text-gray-500">No events match your search</p>
            <p className="text-sm mt-1 text-gray-400">Try different keywords or categories</p>
          </div>
        )}
      </div>
    </div>
  );
}
