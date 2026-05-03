import { Link } from 'react-router-dom';
import { Globe, MessageCircle, AtSign, Hash } from 'lucide-react';

function EventParkLogo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="14" height="14" rx="3" fill="#4B55F5" />
        <rect x="18" width="14" height="14" rx="3" fill="#F25122" />
        <rect y="18" width="14" height="14" rx="3" fill="#4B55F5" opacity="0.4" />
        <rect x="18" y="18" width="14" height="14" rx="3" fill="#4B55F5" />
      </svg>
      <span className="text-xl font-bold text-white tracking-tight">
        Event<span className="text-brand-400">park</span>
      </span>
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="bg-ep-navy text-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <EventParkLogo />
            <p className="text-sm leading-relaxed max-w-xs mt-4">
              The infrastructure layer powering Africa's events ecosystem — for planners, businesses, and vendors.
            </p>
            <div className="flex gap-3 mt-6">
              {[Globe, MessageCircle, AtSign, Hash].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand-600 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-white/60" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-5">Discover</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/discover/events" className="hover:text-white transition-colors">Events</Link></li>
              <li><Link to="/discover/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/discover/vendors" className="hover:text-white transition-colors">Vendors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-5">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/onboarding" className="hover:text-white transition-colors">Personal</Link></li>
              <li><Link to="/business/login" className="hover:text-white transition-colors">Business</Link></li>
              <li><Link to="/vendor-portal" className="hover:text-white transition-colors">Vendor Portal</Link></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-5">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 EventPark Technologies Ltd. All rights reserved.</p>
          <p>Built with ❤️ for Africa's events industry</p>
        </div>
      </div>
    </footer>
  );
}
