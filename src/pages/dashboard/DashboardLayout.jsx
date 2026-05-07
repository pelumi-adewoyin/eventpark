import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Gift, Wallet, Users, Settings,
  ListTodo, Bell, Plus, LogOut, Menu, X, Store, ArrowUpRight, Ticket,
  CheckSquare, FileText, DollarSign, Shield, BarChart2, Zap, Heart, Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EventParkLogo } from '../../components/Logo';

// Personal nav
const NAV = [
  { label: 'Overview', icon: LayoutDashboard, to: '/dashboard', end: true },
  { label: 'My Events', icon: Calendar, to: '/dashboard/events' },
  { label: 'To-Do', icon: ListTodo, to: '/dashboard/todos' },
  { label: 'Budget', icon: DollarSign, to: '/dashboard/budget' },
  { label: 'Wishlist', icon: Gift, to: '/dashboard/wishlist' },
  { label: 'Group Gifting', icon: Heart, to: '/dashboard/group-wishlist' },
  { label: 'RSVP', icon: Ticket, to: '/dashboard/rsvp' },
  { label: 'Collaborators', icon: Users, to: '/dashboard/collaborators' },
];

const NAV_EXT = [
  { label: 'Wallet', icon: Wallet, to: '/wallet' },
  { label: 'Discover Vendors', icon: Store, to: '/discover/vendors' },
];

const BOTTOM_NAV = [
  { label: 'Home', icon: LayoutDashboard, to: '/dashboard', end: true },
  { label: 'Events', icon: Calendar, to: '/dashboard/events' },
  { label: 'RSVP', icon: Ticket, to: '/dashboard/rsvp' },
  { label: 'Wallet', icon: Wallet, to: '/wallet' },
  { label: 'More', icon: Settings, to: '/dashboard/settings' },
];

// Corporate nav
const CORP_NAV = [
  { label: 'Overview', icon: LayoutDashboard, to: '/dashboard', end: true },
  { label: 'Events', icon: Calendar, to: '/dashboard/events' },
  { label: 'Approvals', icon: CheckSquare, to: '/dashboard/approvals' },
  { label: 'Employees', icon: Users, to: '/dashboard/employees' },
  { label: 'Vendors', icon: Store, to: '/dashboard/vendors' },
  { label: 'Get Quotes', icon: FileText, to: '/dashboard/rfqs' },
  { label: 'Products', icon: Package, to: '/dashboard/products' },
  { label: 'Budget', icon: DollarSign, to: '/dashboard/budget' },
  { label: 'Wallet', icon: Wallet, to: '/dashboard/wallet' },
  { label: 'Audit Log', icon: Shield, to: '/dashboard/audit' },
  { label: 'Reports', icon: BarChart2, to: '/dashboard/reports' },
  { label: 'Integrations', icon: Zap, to: '/dashboard/integrations' },
  { label: 'Settings', icon: Settings, to: '/dashboard/settings' },
];

const WORKSPACE_BADGE = {
  corporate: { label: 'Corporate', color: 'bg-orange-100 text-orange-700' },
  planner:   { label: 'Planner',   color: 'bg-purple-100 text-purple-700' },
  personal:  { label: 'Personal',  color: 'bg-blue-100 text-blue-700' },
};

function SidebarContent({ onClose }) {
  const { user, logout, activeWorkspace } = useAuth();
  const navigate = useNavigate();
  const wsType = activeWorkspace?.type || 'personal';
  const isCorporate = wsType === 'corporate';

  const cls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  const navItems = isCorporate ? CORP_NAV : NAV;

  return (
    <div className="h-full flex flex-col bg-gray-950 overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <Link to="/" onClick={onClose}><EventParkLogo light size="sm" /></Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</div>
            {isCorporate ? (
              <div className="text-gray-500 text-xs truncate">{activeWorkspace.label}</div>
            ) : (
              <div className="text-gray-500 text-xs">Personal · Tier {user?.kycTier || 1}</div>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-grow px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end} className={cls} onClick={onClose}>
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}

        {!isCorporate && (
          <>
            <div className="pt-3 mt-2 border-t border-white/10 space-y-0.5">
              {NAV_EXT.map(item => (
                <Link key={item.to} to={item.to} onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 mt-2 border-t border-white/10">
              <NavLink to="/dashboard/settings" className={cls} onClick={onClose}>
                <Settings className="w-4 h-4 flex-shrink-0" />
                Settings
              </NavLink>
            </div>
          </>
        )}
      </nav>

      {/* Wallet card (personal only) */}
      {!isCorporate && (
        <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex-shrink-0">
          <div className="text-brand-200 text-xs font-medium mb-1">Wallet Balance</div>
          <div className="text-white text-xl font-extrabold">₦{(user?.walletBalance || 0).toLocaleString()}</div>
          {(user?.walletEscrow || 0) > 0 && (
            <div className="text-brand-300 text-xs mt-0.5">₦{(user.walletEscrow).toLocaleString()} in escrow</div>
          )}
          <Link to="/wallet" onClick={onClose}
            className="mt-3 flex items-center gap-1 text-white text-xs font-semibold hover:underline">
            Manage wallet <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={() => { logout(); navigate('/'); }}
        className="flex items-center gap-3 mx-3 mb-4 px-3 py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 text-sm transition-all flex-shrink-0"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, activeWorkspace } = useAuth();
  const wsType = activeWorkspace?.type || 'personal';
  const badge = WORKSPACE_BADGE[wsType] || WORKSPACE_BADGE.personal;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[220px] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-[220px] min-h-screen flex flex-col pb-16 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
              <Menu className="w-4 h-4 text-gray-600" />
            </button>

            <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
              <EventParkLogo size="sm" />
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            <div className="hidden lg:block flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-900">Good morning, {user?.firstName} 👋</h1>
              <p className="text-xs text-gray-400">Welcome to your EventPark dashboard</p>
            </div>

            <div className="flex-1 lg:hidden" />

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/wallet"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors">
                <Wallet className="w-3.5 h-3.5" />
                ₦{((user?.walletBalance || 0) / 1000).toFixed(0)}K
              </Link>

              <button className="relative w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">3</span>
              </button>

              <Link to="/events/create"
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-colors">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Event</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 z-30 safe-area-inset-bottom">
        <div className="flex">
          {BOTTOM_NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-brand-600' : 'text-gray-400'
                }`
              }>
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
