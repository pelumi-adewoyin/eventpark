import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Upload, X, AlertCircle, RefreshCw, Users, Loader2, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { orgs } from '../../../lib/api';

const ROLE_CONFIG = {
  owner:           { label: 'Owner',           cls: 'bg-orange-100 text-orange-700' },
  admin:           { label: 'Admin',           cls: 'bg-red-100 text-red-700' },
  finance:         { label: 'Finance',         cls: 'bg-blue-100 text-blue-700' },
  procurement:     { label: 'Procurement',     cls: 'bg-purple-100 text-purple-700' },
  approver:        { label: 'Approver',        cls: 'bg-yellow-100 text-yellow-700' },
  event_organizer: { label: 'Event Organizer', cls: 'bg-green-100 text-green-700' },
  comms:           { label: 'Comms',           cls: 'bg-teal-100 text-teal-700' },
  member:          { label: 'Member',          cls: 'bg-gray-100 text-gray-600' },
};

const ROLE_OPTIONS = Object.keys(ROLE_CONFIG).filter(r => r !== 'owner');

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.member;
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function InviteModal({ orgId, onClose, onDone }) {
  const [form, setForm] = useState({ full_name: '', email: '', role: 'member', department: '' });
  const [submitting, setSubmitting] = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    try {
      setSubmitting(true);
      await orgs.inviteMember(orgId, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: form.role,
        department: form.department.trim() || undefined,
      });
      toast.success(`Invitation sent to ${form.email.trim()}`);
      onDone();
    } catch (err) {
      toast.error(err.message || 'Failed to send invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Add Team Member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="Ada Okonkwo"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="ada@company.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => set('role', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
              {ROLE_OPTIONS.map(r => (
                <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={form.department}
              onChange={e => set('department', e.target.value)}
              placeholder="e.g. Finance, Operations…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Send invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CorporateEmployees() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [search, setSearch] = useState('');

  const fetchMembers = useCallback(async () => {
    if (!orgId) {
      setError('Organisation ID not found. Please contact support.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await orgs.listMembers(orgId);
      setMembers(Array.isArray(res) ? res : res?.members || []);
    } catch (err) {
      setError(err.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleInviteDone = () => {
    setShowInviteModal(false);
    fetchMembers();
  };

  const handleImportCSV = () => {
    toast('CSV import coming soon', { icon: '📂' });
  };

  const filtered = members.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (m.full_name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.department || '').toLowerCase().includes(q) ||
      (m.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleImportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition-colors">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition-colors">
            <UserPlus className="w-4 h-4" />
            Add manually
          </button>
        </div>
      </div>

      {/* Search */}
      {!loading && !error && members.length > 0 && (
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or department…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
        </div>
      )}

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
          <button onClick={fetchMembers}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && members.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Users className="w-10 h-10 text-gray-300" />
          <div>
            <p className="font-semibold text-gray-600 mb-1">No team members yet</p>
            <p className="text-sm text-gray-400">Invite your first team member to get started.</p>
          </div>
          <button onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-colors">
            <UserPlus className="w-4 h-4" />
            Invite your first team member
          </button>
        </div>
      )}

      {/* Members table */}
      {!loading && !error && members.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Member</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Department</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                      No members match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map(m => (
                    <tr key={m.id || m.email} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                            {(m.full_name || m.email || 'M')[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 truncate max-w-[120px]">
                            {m.full_name || m.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <RoleBadge role={m.role} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                        {m.department || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell truncate max-w-[180px]">
                        {m.email || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          m.status === 'active' || m.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : m.status === 'pending' || m.status === 'invited'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {m.status === 'invited' ? 'Invited' :
                           m.status === 'active' || m.status === 'accepted' ? 'Active' :
                           m.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInviteModal && (
        <InviteModal
          orgId={orgId}
          onClose={() => setShowInviteModal(false)}
          onDone={handleInviteDone}
        />
      )}
    </div>
  );
}
