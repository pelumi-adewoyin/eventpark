import { Link } from 'react-router-dom';
import { Zap, Globe, MessageCircle, AtSign, Hash } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Event<span className="text-brand-400">Park</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              The infrastructure layer powering Africa's events ecosystem. For planners, businesses, and vendors.
            </p>
            <div className="flex gap-4 mt-6">
              {[Globe, MessageCircle, AtSign, Hash].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Discover</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/discover/events" className="hover:text-white transition-colors">Events</Link></li>
              <li><Link to="/discover/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/discover/vendors" className="hover:text-white transition-colors">Vendors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/signup" className="hover:text-white transition-colors">Personal</Link></li>
              <li><Link to="/business/signup" className="hover:text-white transition-colors">Business</Link></li>
              <li><Link to="/vendor-portal" className="hover:text-white transition-colors">Vendor Portal</Link></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 EventPark Technologies Ltd. All rights reserved.</p>
          <p>Built with ❤️ for Africa's events industry</p>
        </div>
      </div>
    </footer>
  );
}
