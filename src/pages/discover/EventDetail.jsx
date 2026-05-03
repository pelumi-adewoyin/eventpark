import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Share2, Heart, ArrowLeft, CheckCircle, Tag } from 'lucide-react';
import { sampleEvents } from '../../data/sampleData';

export default function EventDetail() {
  const { id } = useParams();
  const event = sampleEvents.find(e => e.id === parseInt(id));

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
          <Link to="/discover/events" className="text-brand-600 hover:underline">Back to Events</Link>
        </div>
      </div>
    );
  }

  const related = sampleEvents.filter(e => e.category === event.category && e.id !== event.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Back */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/discover/events" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <div className="rounded-2xl overflow-hidden h-80 sm:h-96">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {event.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs font-medium bg-brand-50 text-brand-700 px-3 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Title & Meta */}
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{event.title}</h1>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Calendar, label: 'Date', value: event.date },
                  { icon: Clock, label: 'Time', value: event.time },
                  { icon: MapPin, label: 'Location', value: event.location },
                  { icon: Users, label: 'Tickets left', value: `${event.ticketsLeft} remaining` },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium">{item.label}</div>
                      <div className="text-sm font-semibold text-gray-800">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-3">About this event</h2>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
              <p className="text-gray-600 leading-relaxed mt-3">
                Join hundreds of attendees for an unforgettable experience. Whether you're a first-timer or a returning fan, this event promises world-class programming, excellent networking, and memories that last a lifetime. Don't miss out — tickets are going fast.
              </p>
            </div>

            {/* Organizer */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                {event.organizer[0]}
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Organised by</div>
                <div className="font-semibold text-gray-900">{event.organizer}</div>
                <div className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                  Verified Organiser
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — Ticket Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="text-3xl font-extrabold text-gray-900 mb-1">
                {event.price === 0 ? 'Free' : `₦${event.price.toLocaleString()}`}
              </div>
              <p className="text-sm text-gray-400 mb-6">per ticket</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-900">{event.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Availability</span>
                  <span className="font-semibold text-green-600">{event.ticketsLeft} left</span>
                </div>
              </div>

              <Link
                to="/signup"
                className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-colors mb-3"
              >
                {event.price === 0 ? 'Register Free' : 'Buy Ticket'}
              </Link>

              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                  <Heart className="w-4 h-4" />
                  Save
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Secure checkout powered by EventPark
              </p>
            </div>
          </div>
        </div>

        {/* Related Events */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">More {event.category} Events</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {related.map(e => (
                <Link
                  key={e.id}
                  to={`/discover/events/${e.id}`}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <img src={e.image} alt={e.title} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{e.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{e.date}</p>
                    <p className="text-sm font-bold text-brand-600 mt-1">
                      {e.price === 0 ? 'Free' : `₦${e.price.toLocaleString()}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
