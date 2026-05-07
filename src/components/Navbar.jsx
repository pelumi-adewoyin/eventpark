import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EventParkLogo } from './Logo';

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
  const discoverRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!discoverOpen) return;
    const handler = (e) => {
      if (discoverRef.current && !discoverRef.current.contains(e.target)) {
        setDiscoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [discoverOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <EventParkLogo size="md" />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative" ref={discoverRef}>
                  <button
                    onClick={() => setDiscoverOpen(o => !o)}
                    className="flex items-center gap-1 text-gray-600 hover:text-brand-600 font-medium text-sm transition-colors"
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${discoverOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {discoverOpen && (
                    // pt-2 bridges the visual gap so the panel feels connected to the button
                    <div className="absolute top-full left-0 pt-2 w-64">
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            onClick={() => setDiscoverOpen(false)}
                            className="flex flex-col px-4 py-3 rounded-xl hover:bg-ep-blue-light transition-colors group"
                          >
                            <span className="font-semibold text-ep-navy text-sm group-hover:text-brand-600">{child.label}</span>
                            <span className="text-gray-400 text-xs mt-0.5">{child.desc}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.label} to={link.href}
                  className="text-gray-600 hover:text-brand-600 font-medium text-sm transition-colors">
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={dashboardRoutes[user.role] || '/dashboard'}
                  className="flex items-center gap-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-colors">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors px-3 py-1.5">
                  Log in
                </Link>
                <Link to="/onboarding"
                  className="text-sm font-bold bg-ep-navy hover:bg-ep-navy-light text-white px-5 py-2.5 rounded-xl transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          <Link to="/discover/events" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-xl text-gray-700 font-medium hover:bg-ep-blue-light">Events</Link>
          <Link to="/discover/products" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-xl text-gray-700 font-medium hover:bg-ep-blue-light">Products</Link>
          <Link to="/discover/vendors" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-xl text-gray-700 font-medium hover:bg-ep-blue-light">Vendors</Link>
          <Link to="/business/login" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-xl text-gray-700 font-medium hover:bg-ep-blue-light">For Business</Link>
          <div className="pt-2 space-y-2">
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2.5 text-center border border-gray-200 rounded-xl text-gray-700 font-medium">Log in</Link>
            <Link to="/onboarding" onClick={() => setMenuOpen(false)} className="block py-2.5 text-center bg-ep-navy text-white rounded-xl font-bold">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
