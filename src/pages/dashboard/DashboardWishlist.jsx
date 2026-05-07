import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Gift, Share2, Eye, Users, TrendingUp, MoreHorizontal, Pause, X } from 'lucide-react';
import { wishlist as wishlistApi } from '../../lib/api';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4 animate-pulse">
      <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-3">
        <div className="space-y-2 flex-grow">
          <div className="h-4 bg-gray-200 rounded w-48" />
          <div className="h-3 bg-gray-100 rounded w-32" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-gray-100 rounded-xl" />
          <div className="h-8 w-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-50">
        <div className="h-3 bg-gray-200 rounded w-full mb-2" />
        <div className="h-2 bg-gray-100 rounded-full w-full" />
      </div>
      {[1, 2].map(i => (
        <div key={i} className="px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-gray-100 rounded" />
            <div className="h-3 bg-gray-200 rounded w-40" />
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Manage Tabs ───────────────────────────────────────────────────────────────
function ManageTabs({ list }) {
  const [tab, setTab] = useState('items');
  const TABS = [
    { key: 'items', label: '📋 Items' },
    { key: 'contributors', label: '👥 Contributors' },
    { key: 'settings', label: '⚙️ Settings' },
  ];

  const items = list.items || [];
  const contributors = list.contributors || [];

  return (
    <div className="mt-4">
      <div className="flex gap-1 border-b border-gray-100 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
              tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'items' && (
        <div className="divide-y divide-gray-50">
          {items.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">No items yet.</p>
          )}
          {items.map((item, i) => {
            const pct = item.target > 0 ? Math.min((item.raised / item.target) * 100, 100) : 0;
            return (
              <div key={item.id || i} className="py-4 flex items-center gap-4">
                <span className="text-xl flex-shrink-0">{item.type === 'cash' ? '💸' : '🎁'}</span>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-gray-900 truncate">{item.name}</span>
                    {pct >= 100 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Funded</span>
                    )}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>₦{(item.raised || 0).toLocaleString()} · {item.contributors || 0} contributors</span>
                    <span>₦{(item.target || 0).toLocaleString()}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'contributors' && (
        <div className="space-y-3">
          {contributors.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">No contributions yet.</p>
          )}
          {contributors.map((c, i) => (
            <div key={c.id || i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {c.anonymous ? '?' : (c.name || '?').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-semibold text-gray-900">{c.anonymous ? 'Anonymous' : c.name}</div>
                <div className="text-xs text-gray-400">{c.item_name} · {c.time_ago || c.created_at}</div>
              </div>
              <div className="text-sm font-extrabold text-gray-900 flex-shrink-0">₦{(c.amount || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-3">
          {[
            { icon: Pause, label: 'Pause wishlist', desc: 'Guests see "Paused — check back soon"', danger: false },
            { icon: X, label: 'Close wishlist', desc: 'No more contributions accepted', danger: true },
          ].map(s => (
            <button key={s.label} className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${
              s.danger ? 'border-red-100 hover:bg-red-50' : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                s.danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'
              }`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-sm font-bold ${s.danger ? 'text-red-600' : 'text-gray-900'}`}>{s.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Wishlist card ─────────────────────────────────────────────────────────────
function WishlistCard({ list }) {
  const items = list.items || [];
  const totalRaised = items.reduce((a, i) => a + (i.raised || 0), 0);
  const totalTarget = items.reduce((a, i) => a + (i.target || 0), 0);
  const fundedPct = totalTarget > 0 ? Math.min((totalRaised / totalTarget) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base">{list.name}</h3>
            {list.published && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Live</span>
            )}
          </div>
          {list.event && <p className="text-xs text-gray-400 mt-0.5">{list.event}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/wish/${list.slug}`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-semibold rounded-xl transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <Link to={`/wish/${list.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-semibold rounded-xl transition-colors">
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Link>
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
            style={{ width: `${fundedPct}%` }} />
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {items.map((item, i) => {
          const pct = item.target > 0 ? Math.min((item.raised / item.target) * 100, 100) : 0;
          return (
            <div key={item.id || i} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{item.type === 'cash' ? '💰' : '🎁'}</span>
                  <span className="text-sm font-semibold text-gray-800 truncate">{item.name}</span>
                  {pct >= 100 && (
                    <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">Funded!</span>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{item.contributors || 0} contributors</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>₦{(item.raised || 0).toLocaleString()}</span>
                <span>₦{(item.target || 0).toLocaleString()}</span>
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
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ onCreateGroup }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mb-5">
        <Gift className="w-8 h-8 text-pink-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">No wishlists yet</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-8 leading-relaxed">
        Create a wishlist for your wedding, birthday, or any occasion. Share it with friends and family to collect gifts or contributions.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/wishlist/create"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Create wishlist
        </Link>
        <button
          onClick={onCreateGroup}
          className="inline-flex items-center gap-2 border border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
          <Users className="w-4 h-4" />
          Create a group wishlist
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardWishlist() {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistApi.list()
      .then(data => setWishlists(Array.isArray(data) ? data : (data.wishlists || [])))
      .catch(() => setWishlists([]))
      .finally(() => setLoading(false));
  }, []);

  const totalRaised = wishlists.reduce((sum, w) =>
    sum + (w.items || []).reduce((a, i) => a + (i.raised || 0), 0), 0);
  const totalContributors = wishlists.reduce((sum, w) =>
    sum + (w.items || []).reduce((a, i) => a + (i.contributors || 0), 0), 0);
  const totalItems = wishlists.reduce((sum, w) => sum + (w.items || []).length, 0);

  const handleCreateGroup = () => {
    window.location.href = '/dashboard/group-wishlist';
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Wishlists</h2>
          {!loading && (
            <p className="text-sm text-gray-400 mt-0.5">
              {wishlists.length} wishlist{wishlists.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link to="/wishlist/create"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          New wishlist
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center animate-pulse">
                <div className="w-9 h-9 bg-gray-100 rounded-xl mx-auto mb-2" />
                <div className="h-5 bg-gray-200 rounded w-12 mx-auto mb-1" />
                <div className="h-3 bg-gray-100 rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {/* Loaded — empty */}
      {!loading && wishlists.length === 0 && (
        <EmptyState onCreateGroup={handleCreateGroup} />
      )}

      {/* Loaded — populated */}
      {!loading && wishlists.length > 0 && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Raised', value: `₦${(totalRaised / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
              { label: 'Contributors', value: totalContributors, icon: Users, color: 'text-brand-600 bg-brand-50' },
              { label: 'Items', value: totalItems, icon: Gift, color: 'text-pink-500 bg-pink-50' },
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

          {/* Wishlist cards */}
          {wishlists.map(list => (
            <WishlistCard key={list.id} list={list} />
          ))}

          {/* Create another prompt */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 p-6 text-center mt-2">
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="font-bold text-gray-900 mb-2">Create a wishlist for another event</h3>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Let friends and family contribute cash gifts or purchase items directly for your event.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/wishlist/create"
                className="inline-flex items-center gap-2 bg-ep-navy hover:bg-ep-navy-light text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors">
                <Plus className="w-4 h-4" />
                Create Wishlist
              </Link>
              <button
                onClick={handleCreateGroup}
                className="inline-flex items-center gap-2 border border-gray-200 hover:border-brand-300 hover:bg-white text-gray-700 font-semibold text-sm px-6 py-3 rounded-xl transition-colors">
                <Users className="w-4 h-4" />
                Group Wishlist
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
