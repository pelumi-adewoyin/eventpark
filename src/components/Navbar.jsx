import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Zap, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  {
    label: 'Discover',
    children: [
      { label: 'Events', href: '/discover/events', desc: 'Browse upcoming events' },
      { label: 'Products', href: '/discover/products', desc: 'Shop event essentials' },
      { label: 'Vendors', href: '/discover/vendors', desc: 'Find event professionals' },
    ],
  },
  { label: 'For Business', href: '/business/login' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/#about' },
];

const dashboardRoutes = { diy: '/dashboard', planner: '/planner', corporate: '/corporate' };

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Event<span className="text-brand-600">Park</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    className="flex items-center gap-1 text-gray-600 hover:text-brand-600 font-medium text-sm transition-colors"
                    onMouseEnter={() => setDiscoverOpen(true)}
                    onMouseLeave={() => setDiscoverOpen(false)}
                  >
                    {link.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {discoverOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2"
                      onMouseEnter={() => setDiscoverOpen(true)}
                      onMouseLeave={() => setDiscoverOpen(false)}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="flex flex-col px-4 py-3 rounded-xl hover:bg-brand-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 text-sm">{child.label}</span>
                          <span className="text-gray-500 text-xs">{child.desc}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-gray-600 hover:text-brand-600 font-medium text-sm transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={dashboardRoutes[user.role] || '/dashboard'}
                  className="flex items-center gap-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/vendor-portal"
                  className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
                >
                  Vendor Portal
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors px-3 py-1.5"
                >
                  Log in
                </Link>
                <Link
                  to="/onboarding"
                  className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          <Link to="/discover/events" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Discover Events</Link>
          <Link to="/discover/products" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Discover Products</Link>
          <Link to="/discover/vendors" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Discover Vendors</Link>
          <hr className="border-gray-100" />
          <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Log in</Link>
          <Link to="/signup" onClick={() => setMenuOpen(false)} className="block py-2 text-center bg-brand-600 text-white rounded-xl font-semibold">Get Started</Link>
        </div>
      )}
    </nav>
  );
}
