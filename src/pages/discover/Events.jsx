import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Filter, X, ChevronDown,
  TrendingUp, Clock, ArrowUpDown, Tag, SlidersHorizontal
} from 'lucide-react';
import { discover } from '../../lib/api';

export const EVENTS = [
  {
    id: 'evt-1',
    slug: 'afrobeats-lagos-festival-2026',
    title: 'Afrobeats Lagos Festival 2026',
    tagline: 'The biggest outdoor music festival in West Africa',
    category: 'Music',
    date: '2026-07-12',
    time: '4:00 PM',
    venue: 'Tafawa Balewa Square',
    city: 'Lagos',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    tags: ['Music', 'Outdoor', '18+'],
    lowestPrice: 15000,
    highestPrice: 85000,
    capacity: 5000,
    sold: 3240,
  },
  {
    id: 'evt-2',
    slug: 'tech-summit-abuja-2026',
    title: 'Tech Summit Abuja 2026',
    tagline: "Africa's premier technology conference",
    category: 'Tech',
    date: '2026-08-20',
    time: '9:00 AM',
    venue: 'International Conference Centre',
    city: 'Abuja',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
    tags: ['Tech', 'Networking', 'Education'],
    lowestPrice: 25000,
    highestPrice: 150000,
    capacity: 1200,
    sold: 780,
  },
  {
    id: 'evt-3',
    slug: 'comedy-night-ibadan',
    title: 'Comedy Night with AY',
    tagline: 'An evening of non-stop laughter',
    category: 'Comedy',
    date: '2026-06-28',
    time: '7:00 PM',
    venue: 'Premier Hotel',
    city: 'Ibadan',
    image: 'https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?w=600',
    tags: ['Comedy', 'Indoor', '18+'],
    lowestPrice: 8000,
    highestPrice: 35000,
    capacity: 600,
    sold: 510,
  },
  {
    id: 'evt-4',
    slug: 'wellness-summit-lagos',
    title: 'Lagos Wellness & Mindfulness Summit',
    tagline: 'Reset. Recharge. Reconnect.',
    category: 'Wellness',
    date: '2026-09-05',
    time: '10:00 AM',
    venue: 'Radisson Blu Anchorage',
    city: 'Lagos',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600',
    tags: ['Wellness', 'Education', 'Indoor'],
    lowestPrice: 0,
    highestPrice: 45000,
    capacity: 300,
    sold: 120,
  },
  {
    id: 'evt-5',
    slug: 'naija-food-festival-2026',
    title: 'Naija Food Festival 2026',
    tagline: 'Celebrating the best of Nigerian cuisine',
    category: 'Food',
    date: '2026-07-19',
    time: '12:00 PM',
    venue: 'Eko Atlantic City',
    city: 'Lagos',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    tags: ['Food & drink', 'Outdoor', 'Family-friendly'],
    lowestPrice: 5000,
    highestPrice: 20000,
    capacity: 2000,
    sold: 1100,
  },
  {
    id: 'evt-6',
    slug: 'business-masterclass-lagos',
    title: 'Business Growth Masterclass',
    tagline: 'Scale your business in 2026',
    category: 'Education',
    date: '2026-06-14',
    time: '9:00 AM',
    venue: 'Oriental Hotel',
    city: 'Lagos',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600',
    tags: ['Education', 'Networking', 'Indoor'],
    lowestPrice: 35000,
    highestPrice: 75000,
    capacity: 200,
    sold: 145,
  },
  {
    id: 'evt-7',
    slug: 'port-harcourt-carnival',
    title: 'Port Harcourt Carnival 2026',
    tagline: 'Rivers of culture, music and colour',
    category: 'Music',
    date: '2026-08-10',
    time: '2:00 PM',
    venue: 'Isaac Boro Park',
    city: 'Port Harcourt',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600',
    tags: ['Music', 'Outdoor', 'Family-friendly'],
    lowestPrice: 3000,
    highestPrice: 15000,
    capacity: 8000,
    sold: 5200,
  },
  {
    id: 'evt-8',
    slug: 'fashion-week-lagos',
    title: 'Lagos Fashion Week 2026',
    tagline: 'Where African fashion meets the world stage',
    category: 'Fashion',
    date: '2026-10-22',
    time: '6:00 PM',
    venue: 'Federal Palace Hotel',
    city: 'Lagos',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    tags: ['Fashion', 'Indoor', 'Networking'],
    lowestPrice: 20000,
    highestPrice: 120000,
    capacity: 500,
    sold: 210,
  },
];

const CATEGORIES = ['All', 'Music', 'Tech', 'Wellness', 'Food', 'Education', 'Comedy', 'Fashion', 'Family-friendly', '18+'];
const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Online'];
const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'soonest', label: 'Soonest', icon: Clock },
  { value: 'newest', label: 'Newest', icon: ArrowUpDown },
  { value: 'price_asc', label: 'Price: Low→High', icon: ArrowUpDown },
];

const categoryColors = {
  Music: 'bg-purple-500',
  Tech: 'bg-blue-500',
  Wellness: 'bg-green-500',
  Food: 'bg-orange-500',
  Education: 'bg-yellow-500',
  Comedy: 'bg-pink-500',
  Fashion: 'bg-rose-500',
  'Family-friendly': 'bg-teal-500',
  '18+': 'bg-red-500',
};

function priceLabel(lowestPrice) {
  if (lowestPrice === 0) return 'Free';
  return `From ₦${lowestPrice.toLocaleString('en-NG')}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DiscoverEvents() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cities, setCities] = useState([]);
  const [priceFilter, setPriceFilter] = useState('');
  const [sort, setSort] = useState('trending');
  const [showFilters, setShowFilters] = useState(false);
  const [apiEvents, setApiEvents] = useState([]);

  // Fetch published events from the backend and merge with static list
  useEffect(() => {
    discover.events().then(data => {
      const list = Array.isArray(data) ? data : (data?.events ?? []);
      setApiEvents(list.map(ev => ({
        id: ev.id,
        slug: ev.id,
        title: ev.title,
        tagline: ev.description || '',
        category: ev.event_type || 'Event',
        date: ev.start_at ? ev.start_at.split('T')[0] : '',
        time: ev.start_at ? new Date(ev.start_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '',
        venue: ev.venue_name || '',
        city: ev.venue_city || '',
        image: ev.cover_url || '',
        tags: [],
        lowestPrice: ev.ticket_price || 0,
        highestPrice: ev.ticket_price || 0,
        capacity: ev.max_guests || 0,
        sold: ev.guest_count || 0,
        fromApi: true,
      })));
    }).catch(() => {});
  }, []);

  const toggleCity = (city) => setCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  const clearAll = () => { setSearch(''); setSelectedCategory('All'); setCities([]); setPriceFilter(''); setSort('trending'); };

  const filtered = useMemo(() => {
    let list = [...EVENTS];

    // Merge in live published events from the API (deduplicate by id)
    apiEvents.forEach(ev => {
      if (!list.find(e => e.id === ev.id)) list.push(ev);
    });

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.city.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    }

    if (selectedCategory !== 'All') {
      list = list.filter(e => e.category === selectedCategory || e.tags.includes(selectedCategory));
    }

    if (cities.length > 0) {
      list = list.filter(e => cities.includes(e.city));
    }

    if (priceFilter === 'free') list = list.filter(e => e.lowestPrice === 0);
    else if (priceFilter === 'under10') list = list.filter(e => e.lowestPrice < 10000);
    else if (priceFilter === '10to50') list = list.filter(e => e.lowestPrice >= 10000 && e.lowestPrice <= 50000);
    else if (priceFilter === 'above50') list = list.filter(e => e.lowestPrice > 50000);

    if (sort === 'soonest') list.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sort === 'newest') list.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sort === 'price_asc') list.sort((a, b) => a.lowestPrice - b.lowestPrice);
    else list.sort((a, b) => (b.sold / (b.capacity || 1)) - (a.sold / (a.capacity || 1)));

    return list;
  }, [search, selectedCategory, cities, priceFilter, sort, apiEvents]);

  const hasActiveFilters = cities.length > 0 || priceFilter !== '' || selectedCategory !== 'All';

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <div className="bg-ep-navy relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern-white opacity-20" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-600 rounded-full opacity-10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <span className="inline-block bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Discover</span>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Events near you</h1>
          <p className="text-white/50 mb-8 text-base">Browse events happening across Nigeria and beyond.</p>

          {/* Search */}
          <div className="flex gap-3 flex-col sm:flex-row max-w-2xl">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search events, venues, cities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-white/40 hover:text-white/80" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(p => !p)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-medium transition ${showFilters || hasActiveFilters ? 'bg-brand-600 text-white border border-brand-500' : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {hasActiveFilters && `(${cities.length + (priceFilter ? 1 : 0)})`}
            </button>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-5 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-7">

          {/* Filter sidebar */}
          {showFilters && (
            <aside className="w-56 flex-shrink-0 hidden lg:block">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 text-sm">Filters</span>
                  <button onClick={clearAll} className="text-xs text-brand-600 hover:underline font-medium">Clear all</button>
                </div>

                {/* Date */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Date</h4>
                  {['Today', 'This week', 'This month', 'Custom'].map(d => (
                    <button key={d} className="block w-full text-left text-sm text-gray-600 py-1.5 hover:text-brand-600 transition">{d}</button>
                  ))}
                </div>

                {/* Location */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Location</h4>
                  {CITIES.map(city => (
                    <label key={city} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                      <input type="checkbox" checked={cities.includes(city)} onChange={() => toggleCity(city)} className="rounded border-gray-300 text-brand-600 focus:ring-brand-400" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{city}</span>
                    </label>
                  ))}
                </div>

                {/* Category */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Category</h4>
                  {['Music', 'Tech', 'Wellness', 'Food & drink', 'Education', 'Comedy', 'Fashion', 'Family-friendly', '18+'].map(cat => (
                    <label key={cat} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                      <input type="checkbox" checked={selectedCategory === cat} onChange={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)} className="rounded border-gray-300 text-brand-600 focus:ring-brand-400" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{cat}</span>
                    </label>
                  ))}
                </div>

                {/* Price */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Price</h4>
                  {[
                    { value: 'free', label: 'Free' },
                    { value: 'under10', label: 'Under ₦10k' },
                    { value: '10to50', label: '₦10k–₦50k' },
                    { value: 'above50', label: '₦50k+' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                      <input type="radio" name="price" value={opt.value} checked={priceFilter === opt.value} onChange={() => setPriceFilter(priceFilter === opt.value ? '' : opt.value)} className="border-gray-300 text-brand-600 focus:ring-brand-400" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter drawer */}
            {showFilters && (
              <div className="lg:hidden mb-5 bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-800 text-sm">Filters</span>
                  <button onClick={clearAll} className="text-xs text-brand-600 font-medium">Clear all</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Location</h4>
                    {CITIES.map(city => (
                      <label key={city} className="flex items-center gap-2 py-1 cursor-pointer">
                        <input type="checkbox" checked={cities.includes(city)} onChange={() => toggleCity(city)} className="rounded border-gray-300 text-brand-600" />
                        <span className="text-sm text-gray-600">{city}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Price</h4>
                    {[{ value: 'free', label: 'Free' }, { value: 'under10', label: 'Under ₦10k' }, { value: '10to50', label: '₦10k–₦50k' }, { value: 'above50', label: '₦50k+' }].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 py-1 cursor-pointer">
                        <input type="radio" name="price_mobile" value={opt.value} checked={priceFilter === opt.value} onChange={() => setPriceFilter(priceFilter === opt.value ? '' : opt.value)} className="border-gray-300 text-brand-600" />
                        <span className="text-sm text-gray-600">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sort bar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-gray-800">{filtered.length}</span> event{filtered.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex gap-1.5 overflow-x-auto">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${sort === opt.value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <opt.icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(event => {
                  const isSoldOut = event.sold >= event.capacity && event.capacity > 0;
                  const pctSold = event.capacity > 0 ? Math.round((event.sold / event.capacity) * 100) : 0;
                  return (
                    <Link
                      key={event.id}
                      to={`/discover/events/${event.id}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50/40 transition-all duration-300"
                    >
                      {/* Cover */}
                      <div className="relative overflow-hidden h-48">
                        {event.image
                          ? <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="w-full h-full bg-gradient-to-br from-brand-600 to-ep-navy" />
                        }
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                        {/* Category pill */}
                        <div className="absolute top-3 left-3">
                          <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${categoryColors[event.category] || 'bg-gray-500'}`}>
                            {event.category}
                          </span>
                        </div>

                        {/* Free badge */}
                        {event.lowestPrice === 0 && !isSoldOut && (
                          <div className="absolute top-3 right-3">
                            <span className="text-xs font-bold bg-green-500 text-white px-3 py-1 rounded-full">Free</span>
                          </div>
                        )}

                        {/* Sold out overlay */}
                        {isSoldOut && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-white text-gray-800 font-extrabold text-sm px-5 py-2 rounded-full tracking-wide">SOLD OUT</span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-5">
                        <h3 className="font-bold text-ep-navy text-sm leading-snug mb-1 line-clamp-2">{event.title}</h3>
                        {event.tagline && <p className="text-xs text-gray-400 mb-3 line-clamp-1">{event.tagline}</p>}

                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                          <Calendar className="w-3 h-3 text-brand-400 flex-shrink-0" />
                          {formatDate(event.date)} · {event.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                          <MapPin className="w-3 h-3 text-brand-400 flex-shrink-0" />
                          <span className="line-clamp-1">{event.venue}, {event.city}</span>
                        </div>

                        {/* Availability bar */}
                        {event.capacity > 0 && (
                          <div className="mb-3">
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${pctSold > 85 ? 'bg-red-400' : pctSold > 60 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${pctSold}%` }} />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{pctSold > 85 ? 'Almost sold out' : `${event.capacity - event.sold} tickets left`}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <span className="font-extrabold text-ep-navy text-sm">{priceLabel(event.lowestPrice)}</span>
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${isSoldOut ? 'bg-gray-100 text-gray-400' : 'bg-brand-600 text-white'}`}>
                            {isSoldOut ? 'Sold out' : 'Get tickets'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-bold text-gray-700 text-lg mb-2">No events found</h3>
                <p className="text-sm text-gray-400 mb-6">Try different keywords, categories, or clear your filters.</p>
                <button onClick={clearAll} className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-700 transition">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
