import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter, Tag } from 'lucide-react';
import { sampleEvents } from '../../data/sampleData';

const categories = ['All', 'Technology', 'Music', 'Food', 'Wedding', 'Business', 'Family', 'Sports', 'Fashion', 'Entertainment', 'Education', 'Culture', 'Health', 'Real Estate'];

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
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Discover Events</h1>
          <p className="text-gray-500 mb-6">Browse events happening across Nigeria and beyond.</p>

          {/* Search */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, locations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-500 mb-6">{filtered.length} events found</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(event => (
            <Link
              key={event.id}
              to={`/discover/events/${event.id}`}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow group"
            >
              <div className="relative overflow-hidden h-44">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-semibold bg-white/90 backdrop-blur-sm text-brand-700 px-2 py-1 rounded-full">
                    {event.category}
                  </span>
                </div>
                {event.price === 0 && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold bg-green-500 text-white px-2 py-1 rounded-full">Free</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{event.title}</h3>

                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Calendar className="w-3 h-3" />
                  {event.date} · {event.time}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-600 text-sm">
                    {event.price === 0 ? 'Free' : `₦${event.price.toLocaleString()}`}
                  </span>
                  <span className="text-xs text-gray-400">{event.ticketsLeft} left</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No events match your search</p>
            <p className="text-sm mt-1">Try different keywords or categories</p>
          </div>
        )}
      </div>
    </div>
  );
}
