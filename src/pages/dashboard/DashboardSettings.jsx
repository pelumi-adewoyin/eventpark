import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Shield, ChevronRight, CheckCircle, Camera } from 'lucide-react';

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-brand-600' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

const KYC_TIERS = [
  { tier: 0, label: 'Unverified', desc: 'Limited features. Verify to unlock the full platform.', done: false },
  { tier: 1, label: 'Tier 1 — Phone + BVN', desc: 'Wallet top-up up to ₦50,000/day', done: true },
  { tier: 2, label: 'Tier 2 — NIN', desc: 'Wallet top-up up to ₦500,000/day', done: false },
  { tier: 3, label: 'Tier 3 — Selfie + Docs', desc: 'Full access, unlimited transfers', done: false },
];

export default function DashboardSettings() {
  const { user, triggerKyc } = useAuth();
  const [notifs, setNotifs] = useState({ rsvp: true, vendor: true, gift: true, reminders: false, marketing: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const userTier = user?.kycTier || 1;

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-extrabold text-xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
              <Camera className="w-3 h-3 text-gray-500" />
            </button>
          </div>
          <div>
            <div className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</div>
            <div className="text-sm text-gray-400">{user?.email || 'demo@eventpark.ng'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'First name', value: user?.firstName || 'Demo' },
            { label: 'Last name', value: user?.lastName || 'User' },
            { label: 'Email address', value: user?.email || 'demo@eventpark.ng' },
            { label: 'Phone number', value: user?.phone || '+234 800 000 0000' },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{field.label}</label>
              <input defaultValue={field.value}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white" />
            </div>
          ))}
        </div>

        <button onClick={handleSave}
          className={`mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-ep-navy hover:bg-ep-navy-light text-white'
          }`}>
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Changes'}
        </button>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <ToggleRow label="RSVP updates" sub="When guests confirm or decline" value={notifs.rsvp} onChange={v => setNotifs(n => ({ ...n, rsvp: v }))} />
        <ToggleRow label="Vendor updates" sub="Booking confirmations and messages" value={notifs.vendor} onChange={v => setNotifs(n => ({ ...n, vendor: v }))} />
        <ToggleRow label="Gift contributions" sub="When someone contributes to your wishlist" value={notifs.gift} onChange={v => setNotifs(n => ({ ...n, gift: v }))} />
        <ToggleRow label="Event reminders" sub="Upcoming deadlines and milestones" value={notifs.reminders} onChange={v => setNotifs(n => ({ ...n, reminders: v }))} />
        <ToggleRow label="Marketing & tips" sub="EventPark tips and promotional offers" value={notifs.marketing} onChange={v => setNotifs(n => ({ ...n, marketing: v }))} />
      </Section>

      {/* KYC */}
      <Section title="Identity Verification (KYC)">
        <p className="text-xs text-gray-400 mb-4">Complete verification to unlock higher wallet limits and all platform features.</p>
        <div className="space-y-3">
          {KYC_TIERS.slice(1).map(tier => {
            const isCurrentOrDone = tier.tier <= userTier;
            const isCurrent = tier.tier === userTier + 1;
            return (
              <div key={tier.tier} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                isCurrentOrDone ? 'border-green-200 bg-green-50' : isCurrent ? 'border-brand-200 bg-brand-50' : 'border-gray-100 bg-gray-50'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  isCurrentOrDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCurrentOrDone ? <CheckCircle className="w-4 h-4" /> : tier.tier}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-bold text-gray-900">{tier.label}</div>
                  <div className="text-xs text-gray-500">{tier.desc}</div>
                </div>
                {isCurrent && (
                  <button onClick={() => triggerKyc?.()}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0">
                    Verify
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security">
        {[
          { label: 'Change password', desc: 'Update your account password' },
          { label: 'Two-factor authentication', desc: 'Add an extra layer of security' },
          { label: 'Active sessions', desc: 'Manage devices that are signed in' },
        ].map(item => (
          <button key={item.label} className="w-full flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-5 px-5 transition-colors">
            <div className="text-left">
              <div className="text-sm font-medium text-gray-800">{item.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </Section>

      {/* Danger zone */}
      <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
        <h3 className="font-bold text-red-700 text-sm mb-3">Danger Zone</h3>
        <button className="text-sm text-red-500 font-semibold hover:text-red-700 transition-colors">
          Delete Account
        </button>
        <p className="text-xs text-red-400 mt-1">This action is irreversible. All your data will be permanently deleted.</p>
      </div>
    </div>
  );
}
