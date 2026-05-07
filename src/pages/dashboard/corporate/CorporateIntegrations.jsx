import { useState, useEffect, useCallback } from 'react';
import { Settings, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('ep_access_token');
}

async function listIntegrations(orgId) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (import.meta.env.DEV) headers['X-Dev-Mode'] = 'true';
  const res = await fetch(`${BASE_URL}/orgs/${orgId}/integrations`, { headers });
  if (!res.ok) throw new Error('Failed to fetch integrations');
  return res.json();
}

async function toggleIntegration(orgId, name) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (import.meta.env.DEV) headers['X-Dev-Mode'] = 'true';
  const res = await fetch(`${BASE_URL}/orgs/${orgId}/integrations/${name}/toggle`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Toggle failed');
  return res.json();
}

const INTEGRATION_DEFS = [
  {
    key: 'slack',
    name: 'Slack',
    description: 'Notify your team of approvals, payments, and events.',
    initials: 'SL',
    color: 'bg-purple-600',
    comingSoon: false,
    alwaysOn: false,
  },
  {
    key: 'ms_teams',
    name: 'Microsoft Teams',
    description: 'Send notifications to Teams channels.',
    initials: 'MT',
    color: 'bg-blue-700',
    comingSoon: false,
    alwaysOn: false,
  },
  {
    key: 'sage',
    name: 'Sage',
    description: 'Sync invoices and payments to Sage accounting.',
    initials: 'SG',
    color: 'bg-green-700',
    comingSoon: false,
    alwaysOn: false,
  },
  {
    key: 'quickbooks',
    name: 'QuickBooks',
    description: 'Export transactions to QuickBooks.',
    initials: 'QB',
    color: 'bg-green-500',
    comingSoon: false,
    alwaysOn: false,
  },
  {
    key: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync events to Google Calendar.',
    initials: 'GC',
    color: 'bg-red-500',
    comingSoon: false,
    alwaysOn: false,
  },
  {
    key: 'workday',
    name: 'Workday (HRIS)',
    description: 'Sync employee directory from Workday.',
    initials: 'WD',
    color: 'bg-orange-700',
    comingSoon: true,
    alwaysOn: false,
  },
  {
    key: 'ripple',
    name: 'Ripple HRMS',
    description: 'Sync employees from Ripple.',
    initials: 'RP',
    color: 'bg-teal-600',
    comingSoon: true,
    alwaysOn: false,
  },
  {
    key: 'paystack',
    name: 'Paystack',
    description: 'Connected — payment processing.',
    initials: 'PS',
    color: 'bg-blue-500',
    comingSoon: false,
    alwaysOn: true,
  },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
        checked ? 'bg-orange-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function IntegrationCard({ def, enabled, onToggle, toggling }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 ${def.comingSoon ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className={`w-11 h-11 rounded-xl ${def.color} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-sm">{def.initials}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900 text-sm">{def.name}</span>
              {def.comingSoon && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                  Coming soon
                </span>
              )}
              {def.alwaysOn && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Connected
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{def.description}</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 pt-0.5">
          {toggling && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
          {!def.alwaysOn && (
            <Toggle
              checked={enabled}
              onChange={onToggle}
              disabled={def.comingSoon || toggling}
            />
          )}
        </div>
      </div>

      {/* Configure button (only when active and not alwaysOn / comingSoon) */}
      {enabled && !def.alwaysOn && !def.comingSoon && (
        <button
          onClick={() => toast(`${def.name} configuration coming soon.`)}
          className="self-start flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors">
          <Settings className="w-3.5 h-3.5" />
          Configure
        </button>
      )}
    </div>
  );
}

export default function CorporateIntegrations() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  // Map of key → enabled
  const [states, setStates] = useState(() =>
    Object.fromEntries(INTEGRATION_DEFS.map(d => [d.key, d.alwaysOn ? true : false]))
  );
  const [toggling, setToggling] = useState({}); // key → bool
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIntegrations = useCallback(async () => {
    if (!orgId) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const res = await listIntegrations(orgId);
      const data = Array.isArray(res) ? res : res?.integrations || [];
      // Merge fetched state into our map
      const updated = { ...states };
      data.forEach(item => {
        if (item.key && item.key in updated) {
          updated[item.key] = !!item.enabled;
        }
        if (item.name) {
          const found = INTEGRATION_DEFS.find(d => d.name.toLowerCase() === item.name.toLowerCase());
          if (found) updated[found.key] = !!item.enabled;
        }
      });
      setStates(updated);
    } catch {
      // Gracefully degrade — show all as off (already the default)
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  useEffect(() => { fetchIntegrations(); }, [fetchIntegrations]);

  const handleToggle = async (def) => {
    if (def.comingSoon || def.alwaysOn) return;
    setToggling(t => ({ ...t, [def.key]: true }));
    const prev = states[def.key];
    // Optimistic update
    setStates(s => ({ ...s, [def.key]: !prev }));
    try {
      await toggleIntegration(orgId, def.key);
      toast.success(`${def.name} ${!prev ? 'connected' : 'disconnected'}.`);
    } catch (err) {
      // Revert
      setStates(s => ({ ...s, [def.key]: prev }));
      toast.error(err.message || `Failed to update ${def.name}.`);
    } finally {
      setToggling(t => ({ ...t, [def.key]: false }));
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Integrations</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Connect EventPark to the tools your team already uses.
          </p>
        </div>
        <button
          onClick={fetchIntegrations}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors bg-white">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchIntegrations}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INTEGRATION_DEFS.map(def => (
            <IntegrationCard
              key={def.key}
              def={def}
              enabled={states[def.key]}
              onToggle={() => handleToggle(def)}
              toggling={!!toggling[def.key]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
