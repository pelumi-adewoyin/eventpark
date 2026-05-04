import { useState } from 'react';
import { UserPlus, Mail, Link2, MoreHorizontal, Shield, Edit3, Eye } from 'lucide-react';

const collaborators = [
  { id: 1, name: 'Amara Okonkwo', email: 'amara@example.com', role: 'Editor', event: 'Tunde & Bola Wedding', avatar: 'AO', joined: 'Apr 20', status: 'active' },
  { id: 2, name: 'Chidi Nwosu', email: 'chidi@example.com', role: 'Viewer', event: 'Tunde & Bola Wedding', avatar: 'CN', joined: 'Apr 25', status: 'active' },
  { id: 3, name: 'Kemi Adeleke', email: 'kemi@example.com', role: 'Editor', event: "Sister's Birthday Pop-up", avatar: 'KA', joined: 'May 1', status: 'pending' },
];

const ROLES = {
  Editor: { icon: Edit3, cls: 'bg-brand-50 text-brand-700', desc: 'Can edit event details, manage tasks, and vendors' },
  Viewer: { icon: Eye, cls: 'bg-gray-100 text-gray-600', desc: 'Read-only access to event information' },
  Admin: { icon: Shield, cls: 'bg-purple-50 text-purple-700', desc: 'Full access including finances and settings' },
};

export default function DashboardCollaborators() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Collaborators</h2>
          <p className="text-sm text-gray-400 mt-0.5">{collaborators.length} people with access</p>
        </div>
        <button onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
          <UserPlus className="w-4 h-4" />
          Invite
        </button>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {Object.entries(ROLES).map(([role, info]) => (
          <div key={role} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-8 h-8 rounded-lg ${info.cls} flex items-center justify-center mb-2`}>
              <info.icon className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">{role}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{info.desc}</div>
          </div>
        ))}
      </div>

      {/* Collaborator list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Active Collaborators</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {collaborators.map(collab => {
            const roleInfo = ROLES[collab.role] || ROLES.Viewer;
            return (
              <div key={collab.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {collab.avatar}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{collab.name}</span>
                    {collab.status === 'pending' && (
                      <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-semibold">Pending</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{collab.email} · {collab.event}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleInfo.cls}`}>{collab.role}</span>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share link section */}
      <div className="mt-5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">Share link</div>
            <div className="text-xs text-gray-400">Anyone with the link can view your event</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-500 font-mono truncate border border-gray-200">
            eventpark.ng/e/tunde-bola-2026/view
          </div>
          <button className="px-4 py-2.5 bg-ep-navy hover:bg-ep-navy-light text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0">
            Copy
          </button>
        </div>
      </div>

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-lg font-extrabold text-gray-900">Invite Collaborator</h3>
              <p className="text-sm text-gray-400 mt-1">They'll receive an email to join your event.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colleague@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(ROLES).map(role => (
                    <button key={role} onClick={() => setInviteRole(role)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        inviteRole === role ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {role}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{ROLES[inviteRole]?.desc}</p>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => setShowInviteModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowInviteModal(false)}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
