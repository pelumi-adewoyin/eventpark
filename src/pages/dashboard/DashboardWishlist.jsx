import { Link } from 'react-router-dom';
import { Plus, Gift, Share2, Eye, Users, TrendingUp, ArrowRight } from 'lucide-react';

const wishlists = [
  {
    id: 'w1', name: 'Tunde & Bola Wedding Wishlist', event: 'Tunde & Bola Wedding',
    slug: 'tunde-bola-2026', published: true,
    items: [
      { name: 'Honeymoon Fund', target: 500000, raised: 185000, contributors: 12, type: 'cash' },
      { name: 'KitchenAid Mixer', target: 85000, raised: 85000, contributors: 3, type: 'gift' },
      { name: 'Travel Luggage Set', target: 120000, raised: 40000, contributors: 4, type: 'gift' },
      { name: 'Home Appliance Fund', target: 300000, raised: 75000, contributors: 8, type: 'cash' },
    ],
  },
];

const totalRaised = wishlists[0].items.reduce((a, i) => a + i.raised, 0);
const totalTarget = wishlists[0].items.reduce((a, i) => a + i.target, 0);
const totalContributors = wishlists[0].items.reduce((a, i) => a + i.contributors, 0);

export default function DashboardWishlist() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Wishlist</h2>
          <p className="text-sm text-gray-400 mt-0.5">{wishlists.length} wishlist{wishlists.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Create Wishlist
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Raised', value: `₦${(totalRaised / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Contributors', value: totalContributors, icon: Users, color: 'text-brand-600 bg-brand-50' },
          { label: 'Items', value: wishlists[0].items.length, icon: Gift, color: 'text-pink-500 bg-pink-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-extrabold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Wishlist card */}
      {wishlists.map(list => (
        <div key={list.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          {/* Header */}
          <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-base">{list.name}</h3>
                {list.published && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Live</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{list.event}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-semibold rounded-xl transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-semibold rounded-xl transition-colors">
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>
          </div>

          {/* Overall progress */}
          <div className="px-5 py-4 bg-gradient-to-br from-pink-50 to-rose-50 border-b border-gray-50">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span className="font-semibold">₦{totalRaised.toLocaleString()} raised</span>
              <span className="text-gray-400">of ₦{totalTarget.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all"
                style={{ width: `${Math.min((totalRaised / totalTarget) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-50">
            {list.items.map((item, i) => {
              const pct = Math.min((item.raised / item.target) * 100, 100);
              return (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{item.type === 'cash' ? '💰' : '🎁'}</span>
                      <span className="text-sm font-semibold text-gray-800 truncate">{item.name}</span>
                      {pct >= 100 && <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">Funded!</span>}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{item.contributors} contributors</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>₦{item.raised.toLocaleString()}</span>
                    <span>₦{item.target.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add item */}
          <div className="p-5 border-t border-gray-50">
            <button className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-pink-300 hover:bg-pink-50 text-gray-400 hover:text-pink-500 text-sm font-medium transition-all">
              <Plus className="w-4 h-4" />
              Add wishlist item
            </button>
          </div>
        </div>
      ))}

      {/* Create new */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 p-6 text-center">
        <div className="text-4xl mb-3">🎁</div>
        <h3 className="font-bold text-gray-900 mb-2">Create a wishlist for another event</h3>
        <p className="text-sm text-gray-400 mb-5 leading-relaxed">
          Let friends and family contribute cash gifts or purchase items directly for your event.
        </p>
        <button className="inline-flex items-center gap-2 bg-ep-navy hover:bg-ep-navy-light text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Create Wishlist
        </button>
      </div>
    </div>
  );
}
