import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, CheckCircle, Briefcase, Phone, Mail, Calendar } from 'lucide-react';
import { sampleVendors } from '../../data/sampleData';

export default function VendorDetail() {
  const { id } = useParams();
  const vendor = sampleVendors.find(v => v.id === parseInt(id));
  const [activeTab, setActiveTab] = useState('about');

  if (!vendor) {
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
        <img src={vendor.coverImage} alt={vendor.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md -mt-10 relative z-10 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <img src={vendor.image} alt={vendor.name} className="w-20 h-20 rounded-2xl border-2 border-white shadow object-cover" />
            <div className="flex-grow">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-gray-900">{vendor.name}</h1>
                {vendor.verified && (
                  <span className="flex items-center gap-1 text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <div className="text-sm text-brand-600 font-medium">{vendor.category}</div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{vendor.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{vendor.completedJobs} jobs completed</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {vendor.rating} ({vendor.reviews} reviews)
                </span>
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
            <h2 className="font-bold text-gray-900 mb-3">About {vendor.name}</h2>
            <p className="text-gray-600 leading-relaxed">{vendor.description}</p>
            <p className="text-gray-600 leading-relaxed mt-3">
              With a reputation built on quality, reliability, and exceptional customer service, we've become one of Nigeria's most trusted event service providers. Our team of professionals brings creativity and precision to every event we're part of.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-brand-600" />
                <div>
                  <div className="text-xs text-gray-400">Phone</div>
                  <div className="text-sm font-medium text-gray-800">Sign in to view</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-brand-600" />
                <div>
                  <div className="text-xs text-gray-400">Email</div>
                  <div className="text-sm font-medium text-gray-800">Sign in to view</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="mb-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {vendor.portfolios.map((port, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition">
                  <div className="h-48 overflow-hidden">
                    <img src={port.image} alt={port.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-sm">{port.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
            <h2 className="font-bold text-gray-900 mb-4">Services Offered</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {vendor.services.map(service => (
                <div key={service} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{service}</div>
                    <Link to="/signup" className="text-xs text-brand-600 hover:underline">Get a quote →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
