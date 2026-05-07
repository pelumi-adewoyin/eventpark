import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Calendar, Users, Clock, ChevronRight, AlertCircle, RefreshCw, MoreHorizontal,
} from 'lucide-react';
import { events } from '../../../lib/api';

function fmt(n) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${(n || 0).toLocaleString()}`;
}

const STATUS_CONFIG = {
  active:    { label: 'Active',    cls: 'bg-green-100 text-green-700' },
  planning:  { label: 'Planning',  cls: 'bg-blue-100 text-blue-700' },
  draft:     { label: 'Draft',     cls: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', cls: 'bg-gray-100 text-gray-500' },
};

const TABS = ['All', 'Active', 'Planning', 'Completed'];

function EventCard({ ev }) {
  const budgetPct = ev.budget > 0 ? Math.round(((ev.spent || 0) / ev.budget) * 100) : 0;
  const status = STATUS_CONFIG[ev.status] || STATUS_CONFIG.draft;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-gray-900 text-base truncate">{ev.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${status.cls}`}>
                {status.label}
              </span>
              {ev.type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold flex-shrink-0">
                  {ev.type}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
              {ev.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{ev.date}
                </span>
              )}
              {ev.days_left != null && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{ev.days_left} days away
                </span>
              )}
              {ev.headcount != null && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />{ev.headcount} attendees
                </span>
              )}
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Budget bar */}
        {ev.budget > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Budget: {fmt(ev.spent || 0)} spent</span>
              <span>{budgetPct}% of {fmt(ev.budget)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${budgetPct >= 90 ? 'bg-red-400' : budgetPct >= 70 ? 'bg-yellow-400' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {ev.department && <span>{ev.department}</span>}
          </div>
          <Link to={`/dashboard/events/${ev.id}`}
            className="flex items-center gap-1 text-sm text-orange-600 font-semibold hover:underline">
            Open event <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CorporateEvents() {
  const [evtList, setEvtList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await events.list();
      setEvtList(Array.isArray(res) ? res : res?.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const filtered = evtList.filter(ev => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return ev.status === 'active';
    if (activeTab === 'Planning') return ev.status === 'planning' || ev.status === 'draft';
    if (activeTab === 'Completed') return ev.status === 'completed';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Corporate Events</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${evtList.length} event${evtList.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link to="/events/create"
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Create event
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
              activeTab === tab
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchEvents}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Events list */}
      {!loading && !error && (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Calendar className="w-10 h-10 text-gray-300" />
              <div>
                <p className="font-semibold text-gray-600 mb-1">
                  {activeTab === 'All' ? 'No events yet' : `No ${activeTab.toLowerCase()} events`}
                </p>
                {activeTab === 'All' && (
                  <p className="text-sm text-gray-400">Plan your first corporate event to get started.</p>
                )}
              </div>
              {activeTab === 'All' && (
                <Link to="/events/create"
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-colors">
                  <Plus className="w-4 h-4" />
                  Create your first corporate event
                </Link>
              )}
            </div>
          ) : (
            filtered.map(ev => <EventCard key={ev.id} ev={ev} />)
          )}

          {/* Add event card */}
          <Link to="/events/create"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-orange-600" />
            </div>
            <div>
              <div className="font-bold text-gray-700 group-hover:text-orange-700 text-sm transition-colors">
                Plan a new corporate event
              </div>
              <div className="text-xs text-gray-400">Conference, team offsite, product launch, and more</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
