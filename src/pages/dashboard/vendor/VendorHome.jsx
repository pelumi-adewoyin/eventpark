import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, CreditCard, Plus, ArrowRight, CheckCircle2, Store,
  TrendingUp, ShoppingBag, Star, Clock, AlertCircle, Wrench,
  Package, MessageSquare, ChevronRight, Boxes, Ticket, MapPin,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

// ─── Onboarding card ──────────────────────────────────────────────────────────

function OnboardingCard({ icon: Icon, title, desc, action, to, done, color = 'brand' }) {
  const colorMap = {
    brand:  { bg: 'bg-brand-50',  icon: 'text-brand-600',  btn: 'bg-brand-600 hover:bg-brand-700 text-white' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', btn: 'bg-orange-500 hover:bg-orange-600 text-white' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  btn: 'bg-green-600 hover:bg-green-700 text-white' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', btn: 'bg-purple-600 hover:bg-purple-700 text-white' },
  };
  const c = colorMap[color];

  return (
    <div className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all ${done ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-white hover:shadow-md'}`}>
      {done && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      )}
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div>
        <h3 className="font-bold text-ep-navy text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      </div>
      {!done && (
        <Link to={to} className={`mt-auto flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${c.btn}`}>
          {action} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
      {done && (
        <Link to={to} className="mt-auto flex items-center gap-1 text-xs text-green-600 font-semibold hover:underline">
          View <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color = 'gray', trend }) {
  const colorMap = {
    gray:   'text-gray-400 bg-gray-100',
    green:  'text-green-600 bg-green-100',
    brand:  'text-brand-600 bg-brand-100',
    orange: 'text-orange-600 bg-orange-100',
    purple: 'text-purple-600 bg-purple-100',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-extrabold text-ep-navy mb-0.5">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );
}

// ─── Tier badge ───────────────────────────────────────────────────────────────

function TierBanner({ status }) {
  const tiers = {
    tier_1: {
      label: 'Tier 1 — Unverified',
      desc: 'You can list 1 service or product. Verify your business to unlock unlimited listings and a verified badge.',
      color: 'border-gray-200 bg-gray-50',
      textColor: 'text-gray-600',
      badgeColor: 'bg-gray-100 text-gray-600',
      icon: AlertCircle,
      iconColor: 'text-gray-400',
      cta: { label: 'Get verified', to: '/dashboard/verification' },
    },
    tier_2_pending: {
      label: 'Tier 2 — Verification pending',
      desc: 'Your documents are under review. We\'ll notify you within 24 hours.',
      color: 'border-amber-200 bg-amber-50',
      textColor: 'text-amber-700',
      badgeColor: 'bg-amber-100 text-amber-700',
      icon: Clock,
      iconColor: 'text-amber-500',
      cta: null,
    },
    tier_2_approved: {
      label: 'Tier 2 — Verified ✓',
      desc: 'Your business is verified. Upgrade to Tier 3 for priority search placement and T+1 bank payouts.',
      color: 'border-brand-200 bg-brand-50',
      textColor: 'text-brand-700',
      badgeColor: 'bg-brand-100 text-brand-700',
      icon: Shield,
      iconColor: 'text-brand-500',
      cta: { label: 'Upgrade to Tier 3', to: '/dashboard/verification' },
    },
    tier_3_pending: {
      label: 'Tier 3 — Upgrade pending',
      desc: 'Your Tier 3 application is under review.',
      color: 'border-purple-200 bg-purple-50',
      textColor: 'text-purple-700',
      badgeColor: 'bg-purple-100 text-purple-700',
      icon: Clock,
      iconColor: 'text-purple-500',
      cta: null,
    },
    tier_3_approved: {
      label: 'Tier 3 — Premium vendor ⭐',
      desc: 'You have priority placement and T+1 payouts. You\'re in our top tier.',
      color: 'border-green-200 bg-green-50',
      textColor: 'text-green-700',
      badgeColor: 'bg-green-100 text-green-700',
      icon: Star,
      iconColor: 'text-green-500',
      cta: null,
    },
  };

  const t = tiers[status] || tiers.tier_1;
  const Icon = t.icon;

  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-3 ${t.color}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${t.iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.badgeColor}`}>{t.label}</span>
        </div>
        <p className={`text-xs leading-relaxed ${t.textColor}`}>{t.desc}</p>
      </div>
      {t.cta && (
        <Link to={t.cta.to}
          className="flex-shrink-0 text-xs font-bold text-white bg-ep-navy hover:bg-ep-navy-light px-3 py-1.5 rounded-xl transition-colors">
          {t.cta.label}
        </Link>
      )}
    </div>
  );
}

// ─── Recent activity item ─────────────────────────────────────────────────────

function ActivityItem({ type, title, sub, time, status }) {
  const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    processing: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    declined: 'bg-red-100 text-red-700',
  };
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-base">
        {type === 'order' ? '📦' : type === 'booking' ? '📅' : type === 'message' ? '💬' : '💰'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ep-navy truncate">{title}</div>
        <div className="text-xs text-gray-400">{sub}</div>
      </div>
      <div className="text-right flex-shrink-0">
        {status && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>}
        <div className="text-xs text-gray-400 mt-0.5">{time}</div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function VendorHome() {
  const { user, activeWorkspace } = useAuth();
  const verificationStatus = activeWorkspace?.verificationStatus || user?.verificationStatus || 'tier_1';
  const vendorType = activeWorkspace?.vendorType || user?.vendorType; // 'product' | 'service'
  const businessName = activeWorkspace?.label || user?.businessName || 'Your Business';

  // Determine onboarding completion state
  // In production these would come from API; we simulate based on user data
  const isVerified = !['tier_1'].includes(verificationStatus);
  const hasInventory = false; // Would come from API
  const hasPayoutAccount = false; // Would come from API

  const onboardingDone = isVerified && hasInventory && hasPayoutAccount;

  // Quick stats (placeholder values — would come from API in production)
  const stats = vendorType === 'product'
    ? [
        { label: 'Total Orders', value: '0', sub: 'Lifetime', icon: ShoppingBag, color: 'brand' },
        { label: 'Pending Orders', value: '0', sub: 'Awaiting action', icon: Clock, color: 'orange' },
        { label: 'Revenue', value: '₦0', sub: 'This month', icon: TrendingUp, color: 'green' },
        { label: 'Products', value: '0', sub: 'Active listings', icon: Package, color: 'purple' },
      ]
    : [
        { label: 'Total Bookings', value: '0', sub: 'Lifetime', icon: Ticket, color: 'brand' },
        { label: 'Pending Bookings', value: '0', sub: 'Awaiting response', icon: Clock, color: 'orange' },
        { label: 'Revenue', value: '₦0', sub: 'This month', icon: TrendingUp, color: 'green' },
        { label: 'Services', value: '0', sub: 'Active listings', icon: Wrench, color: 'purple' },
      ];

  const onboardingCards = [
    {
      icon: Shield,
      title: 'Verify your business',
      desc: 'Get a verified badge and unlock unlimited listings. Upload your CAC document — takes 2 minutes.',
      action: 'Start verification',
      to: '/dashboard/verification',
      done: isVerified,
      color: 'brand',
    },
    {
      icon: CreditCard,
      title: 'Add payout account',
      desc: 'Link your bank account to receive payments from orders and bookings.',
      action: 'Add bank account',
      to: '/dashboard/payments',
      done: hasPayoutAccount,
      color: 'orange',
    },
    vendorType === 'product'
      ? {
          icon: Boxes,
          title: 'Add your first product',
          desc: 'List your first product — photos, pricing, options. Start appearing in search results.',
          action: 'Add product',
          to: '/dashboard/inventory',
          done: hasInventory,
          color: 'green',
        }
      : {
          icon: Wrench,
          title: 'Add your first service',
          desc: 'Create a service listing — description, pricing, portfolio. Get discovered by event planners.',
          action: 'Add service',
          to: '/dashboard/services',
          done: hasInventory,
          color: 'green',
        },
    vendorType === 'product'
      ? {
          icon: MapPin,
          title: 'Add delivery locations',
          desc: 'Set the states and cities you deliver to so customers can find you in their area.',
          action: 'Add delivery zones',
          to: '/dashboard/inventory',
          done: false,
          color: 'purple',
        }
      : {
          icon: Store,
          title: 'Complete your storefront',
          desc: 'Add your logo, cover photo, bio, and gallery so customers can find and trust you.',
          action: 'Edit storefront',
          to: '/dashboard/storefront',
          done: false,
          color: 'purple',
        },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

      {/* Welcome header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-ep-navy">
          {onboardingDone ? `Welcome back, ${user?.firstName}` : `Welcome, ${user?.firstName} 👋`}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {onboardingDone
            ? `${businessName} dashboard`
            : `Let's get ${businessName} set up and ready to take orders.`}
        </p>
      </div>

      {/* Tier status banner */}
      <TierBanner status={verificationStatus} />

      {/* Onboarding checklist (shown until all done) */}
      {!onboardingDone && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-ep-navy">Get started</h2>
            <span className="text-xs text-gray-400 font-medium">
              {[isVerified, hasPayoutAccount, hasInventory].filter(Boolean).length} / 3 done
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {onboardingCards.map((card, i) => (
              <OnboardingCard key={i} {...card} />
            ))}
          </div>
        </div>
      )}

      {/* Stats grid */}
      {onboardingDone && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {vendorType === 'product' ? (
          <>
            <Link to="/dashboard/inventory" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-brand-600" />
              </div>
              <span className="text-xs font-semibold text-ep-navy">Add Product</span>
            </Link>
            <Link to="/dashboard/orders" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-ep-navy">View Orders</span>
            </Link>
            <Link to="/dashboard/workspace" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-ep-navy">Messages</span>
            </Link>
            <Link to="/dashboard/payments" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-ep-navy">Payments</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard/services" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-brand-600" />
              </div>
              <span className="text-xs font-semibold text-ep-navy">Add Service</span>
            </Link>
            <Link to="/dashboard/bookings" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-ep-navy">Bookings</span>
            </Link>
            <Link to="/dashboard/workspace" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-ep-navy">Messages</span>
            </Link>
            <Link to="/dashboard/payments" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-ep-navy">Payments</span>
            </Link>
          </>
        )}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-ep-navy">Recent activity</h2>
          <Link to={vendorType === 'product' ? '/dashboard/orders' : '/dashboard/bookings'}
            className="text-xs text-brand-600 font-semibold hover:underline">
            View all
          </Link>
        </div>
        <div className="px-5">
          {/* Empty state */}
          <div className="py-10 text-center">
            <div className="text-3xl mb-3">
              {vendorType === 'product' ? '📦' : '📅'}
            </div>
            <p className="text-sm font-semibold text-gray-400">
              {vendorType === 'product' ? 'No orders yet' : 'No bookings yet'}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              {vendorType === 'product'
                ? 'Add products and complete setup to start receiving orders'
                : 'Add services and complete setup to start receiving bookings'}
            </p>
            <Link
              to={vendorType === 'product' ? '/dashboard/inventory' : '/dashboard/services'}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">
              <Plus className="w-3.5 h-3.5" />
              {vendorType === 'product' ? 'Add your first product' : 'Add your first service'}
            </Link>
          </div>
        </div>
      </div>

      {/* Wallet summary */}
      <div className="bg-gradient-to-br from-ep-navy to-gray-800 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold">Earnings overview</h2>
          <Link to="/dashboard/payments" className="text-xs text-white/60 hover:text-white font-medium flex items-center gap-1">
            Details <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-white/50 text-xs mb-1">Available</div>
            <div className="text-xl font-extrabold">₦{(user?.walletBalance || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-white/50 text-xs mb-1">In escrow</div>
            <div className="text-xl font-extrabold">₦{(user?.walletEscrow || 0).toLocaleString()}</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-white/50 text-xs mb-1">This month</div>
            <div className="text-xl font-extrabold">₦0</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
          <Link to="/dashboard/payments"
            className="flex-1 py-2 text-center text-xs font-bold bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            Withdraw
          </Link>
          <Link to="/dashboard/payments"
            className="flex-1 py-2 text-center text-xs font-bold bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            Transaction history
          </Link>
        </div>
      </div>
    </div>
  );
}
