import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, CheckCircle, Briefcase, Phone, Mail, Calendar } from 'lucide-react';
import { vendorDiscover } from '../../lib/api';

export default function VendorDetail() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    vendorDiscover.get(id)
      .then(data => {
        if (!data || !data.id) {
          setNotFound(true);
        } else {
          setVendor(data);
        }
      })
      .catch(err => {
        if (err?.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 animate-pulse">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-4 bg-gray-200 rounded w-28 mb-4" />
        </div>
        <div className="h-56 sm:h-72 bg-gray-200" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md -mt-10 relative z-10 p-6 mb-6">
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 flex-shrink-0" />
              <div className="flex-grow space-y-2">
                <div className="h-5 bg-gray-200 rounded w-48" />
                <div className="h-3 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-56" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !vendor) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor not found</h2>
          <Link to="/discover/vendors" className="text-brand-600 hover:underline">Back to Vendors</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/discover/vendors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Vendors
        </Link>
      </div>

      {/* Cover */}
      <div className="relative h-56 sm:h-72 overflow-hidden bg-gray-200">
        {vendor.cover_url && (
          <img src={vendor.cover_url} alt={vendor.business_name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md -mt-10 relative z-10 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {vendor.avatar_url ? (
              <img src={vendor.avatar_url} alt={vendor.business_name} className="w-20 h-20 rounded-2xl border-2 border-white shadow object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl border-2 border-white bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl shadow">
                {vendor.business_name?.[0] ?? 'V'}
              </div>
            )}
            <div className="flex-grow">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-gray-900">{vendor.business_name}</h1>
                {vendor.verified && (
                  <span className="flex items-center gap-1 text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <div className="text-sm text-brand-600 font-medium">{vendor.category}</div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                {(vendor.city || vendor.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[vendor.city, vendor.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {vendor.events_completed > 0 && (
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{vendor.events_completed} jobs completed</span>
                )}
                {vendor.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {vendor.rating}{vendor.review_count > 0 ? ` (${vendor.review_count} reviews)` : ''}
                  </span>
                )}
              </div>
            </div>
            <Link
              to="/signup"
              className="flex-shrink-0 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
            >
              <Calendar className="w-4 h-4" />
              Book Service
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {['about', 'portfolio', 'services'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                activeTab === tab ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
            <h2 className="font-bold text-gray-900 mb-3">About {vendor.business_name}</h2>
            {vendor.bio && <p className="text-gray-600 leading-relaxed mb-3">{vendor.bio}</p>}
            {vendor.tagline && <p className="text-gray-500 italic text-sm">{vendor.tagline}</p>}
            {!vendor.bio && !vendor.tagline && (
              <p className="text-gray-400 text-sm">No description added yet.</p>
            )}

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {vendor.website && (
                <a href={vendor.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <Phone className="w-5 h-5 text-brand-600" />
                  <div>
                    <div className="text-xs text-gray-400">Website</div>
                    <div className="text-sm font-medium text-brand-600 truncate">{vendor.website}</div>
                  </div>
                </a>
              )}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-brand-600" />
                <div>
                  <div className="text-xs text-gray-400">Contact</div>
                  <div className="text-sm font-medium text-gray-800">Sign in to view</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="mb-8">
            {vendor.portfolio && vendor.portfolio.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {vendor.portfolio.map((port) => (
                  <div key={port.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition">
                    <div className="h-48 overflow-hidden">
                      <img src={port.image_url} alt={port.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    {port.caption && (
                      <div className="p-3">
                        <p className="text-xs text-gray-500">{port.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400 font-medium">No portfolio items yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
            <h2 className="font-bold text-gray-900 mb-4">Services Offered</h2>
            {vendor.services && vendor.services.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {vendor.services.map(svc => (
                  <div key={svc.id} className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{svc.name}</div>
                      {svc.description && <p className="text-xs text-gray-400 mt-0.5">{svc.description}</p>}
                      <div className="text-xs text-brand-600 font-semibold mt-1">
                        From ₦{(svc.price_from / 100).toLocaleString()}
                        {svc.unit ? ` / ${svc.unit}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No services listed yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
