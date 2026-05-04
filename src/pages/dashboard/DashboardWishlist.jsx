import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Gift, Share2, Eye, Users, TrendingUp, ArrowRight, MoreHorizontal, BarChart2, Settings, Pause, X } from 'lucide-react';

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

const CONTRIBUTORS = [
  { name: 'Aunty Ngozi', amount: 50000, item: 'Honeymoon Fund', time: '2h ago', avatar: 'AN' },
  { name: 'Chukwuemeka F.', amount: 85000, item: 'KitchenAid Mixer', time: '5h ago', avatar: 'CF' },
  { name: 'Tolu Adeyemi', amount: 20000, item: 'New Home Fund', time: 'Yesterday', avatar: 'TA' },
  { name: 'Anonymous', amount: 10000, item: 'Honeymoon Fund', time: 'Yesterday', avatar: '?' },
  { name: 'Kemi Johnson', amount: 75000, item: 'Travel Luggage Set', time: '2d ago', avatar: 'KJ' },
];

function ManageTabs({ list }) {
  const [tab, setTab] = useState('items');
  const TABS = [
    { key: 'items', label: '📋 Items' },
    { key: 'contributors', label: '👥 Contributors' },
    { key: 'insights', label: '📊 Insights' },
    { key: 'settings', label: '⚙️ Settings' },
  ];
  return (
    <div className="mt-4">
      <div className="flex gap-1 border-b border-gray-100 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'items' && (
        <div className="divide-y divide-gray-50">
          {list.items.map((item, i) => {
            const pct = Math.min((item.raised / item.target) * 100, 100);
            return (
              <div key={i} className="py-4 flex items-center gap-4">
                <span className="text-xl flex-shrink-0">{item.type === 'cash' ? '💸' : '🎁'}</span>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-gray-900 truncate">{item.name}</span>
                    {pct >= 100 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Funded</span>}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>₦{item.raised.toLocaleString()} · {item.contributors} contributors</span>
                    <span>₦{item.target.toLocaleString()}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'contributors' && (
        <div className="space-y-3">
          {CONTRIBUTORS.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {c.avatar}
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-400">{c.item} · {c.time}</div>
              </div>
              <div className="text-sm font-extrabold text-gray-900 flex-shrink-0">₦{c.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'insights' && (
        <div className="space-y-4">
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 text-sm text-brand-800 flex gap-2">
            <span>💡</span>
            <span>Your wishlist gets 80% of contributions in the first 7 days after sharing. <button className="font-bold underline">Share again</button></span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Page views', value: '247', sub: 'last 7 days' },
              { label: 'Conversion rate', value: '12%', sub: 'viewers who contributed' },
              { label: 'Avg contribution', value: '₦48K', sub: 'per contributor' },
              { label: 'Total raised', value: '₦350K', sub: 'across all items' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="text-xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</div>
                <div className="text-xs text-gray-400">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-3">
          {[
            { icon: Pause, label: 'Pause wishlist', desc: 'Guests see "Paused — check back soon"', danger: false },
            { icon: X, label: 'Close wishlist', desc: 'No more contributions accepted', danger: true },
          ].map(s => (
            <button key={s.label} className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${s.danger ? 'border-red-100 hover:bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-sm font-bold ${s.danger ? 'text-red-600' : 'text-gray-900'}`}>{s.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
              </div>
            </button>
          ))}
          <div className="pt-2 space-y-3">
            {[
              { label: 'Edit slug', value: 'tunde-bola-dec2026' },
              { label: 'Reservation expiry', value: '48 hours' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">{f.label}</label>
                <input defaultValue={f.value}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardWishlist() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Wishlist</h2>
          <p className="text-sm text-gray-400 mt-0.5">{wishlists.length} wishlist{wishlists.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/wishlist/create"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Create Wishlist
        </Link>
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

          {/* Manage tabs */}
          <div className="px-5 pb-5 border-t border-gray-50">
            <ManageTabs list={list} />
          </div>
        </div>
      ))}

      {/* View public page link */}
      <div className="flex items-center gap-3 mb-4">
        <Link to="/wish/tunde-bola-dec2026"
          className="flex items-center gap-1.5 text-sm text-brand-600 font-semibold hover:underline">
          <Eye className="w-4 h-4" /> View public page
        </Link>
      </div>

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
