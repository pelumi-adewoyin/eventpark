import { useState } from 'react';
import {
  Shield, CheckCircle2, Clock, Upload, ArrowRight,
  FileText, User, Building2, Star, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

function TierCard({ tier, title, benefits, status, onApply }) {
  const statusConfig = {
    current:  { label: 'Your current tier', color: 'bg-gray-100 text-gray-600', badge: 'bg-gray-100 text-gray-600' },
    pending:  { label: 'Review in progress', color: 'bg-amber-100 text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Verified ✓', color: 'bg-green-100 text-green-700', badge: 'bg-green-100 text-green-700' },
    available:{ label: 'Available to unlock', color: 'bg-brand-50 text-brand-700', badge: null },
    locked:   { label: 'Complete Tier 2 first', color: 'bg-gray-50 text-gray-400', badge: null },
  };
  const s = statusConfig[status] || statusConfig.current;

  return (
    <div className={`rounded-2xl border-2 p-5 ${status === 'available' ? 'border-brand-300 bg-brand-50/30' : status === 'approved' ? 'border-green-200 bg-green-50/20' : status === 'pending' ? 'border-amber-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-extrabold text-ep-navy">{title}</span>
            {(status === 'approved' || status === 'current') && status !== 'current' && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
        </div>
        <span className="text-2xl">{tier === 1 ? '🌱' : tier === 2 ? '🏅' : '⭐'}</span>
      </div>
      <ul className="space-y-1.5 mb-4">
        {benefits.map((b, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${status === 'locked' ? 'text-gray-300' : 'text-green-500'}`} />
            {b}
          </li>
        ))}
      </ul>
      {status === 'available' && (
        <button type="button" onClick={onApply}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
          Apply for verification <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
      {status === 'pending' && (
        <div className="flex items-center gap-2 py-2.5 bg-amber-50 rounded-xl px-3">
          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-xs text-amber-700 font-medium">Under review · typically 24 hours</span>
        </div>
      )}
    </div>
  );
}

function VerificationForm({ tier, onSubmit, onClose }) {
  const [form, setForm] = useState({ cac_rc: '', cac_doc: null, id_type: '', id_doc: null, selfie: null, note: '' });
  const [step, setStep] = useState(1);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-ep-navy">Apply for Tier {tier} verification</h3>
          <p className="text-xs text-gray-400 mt-0.5">Documents are reviewed within 24 hours</p>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {tier === 2 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">CAC Registration Number</label>
                <input placeholder="RC1234567" value={form.cac_rc}
                  onChange={e => set('cac_rc', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">CAC Certificate</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-brand-300 cursor-pointer transition-colors">
                  <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Upload your CAC certificate · PDF or JPEG</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">Government-issued ID</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['NIN', 'Passport', "Driver's Licence"].map(id => (
                    <button key={id} type="button" onClick={() => set('id_type', id)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${form.id_type === id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>
                      {id}
                    </button>
                  ))}
                </div>
                {form.id_type && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-brand-300 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Upload {form.id_type}</p>
                  </div>
                )}
              </div>
            </>
          )}
          {tier === 3 && (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-blue-700 font-medium">
                  Tier 3 requires a review of your booking history (min 10 completed bookings/orders) and a video verification call.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">Bank statement (last 3 months)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-brand-300 cursor-pointer transition-colors">
                  <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Upload PDF bank statement</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">Note (optional)</label>
                <textarea placeholder="Tell us about your business track record…" value={form.note}
                  onChange={e => set('note', e.target.value)} rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
              </div>
            </>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={onSubmit}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors">
            Submit application
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorVerification() {
  const { user, activeWorkspace } = useAuth();
  const verificationStatus = activeWorkspace?.verificationStatus || user?.verificationStatus || 'tier_1';
  const [applyingFor, setApplyingFor] = useState(null);
  const [localStatus, setLocalStatus] = useState(verificationStatus);

  const submit = () => {
    if (applyingFor === 2) setLocalStatus('tier_2_pending');
    if (applyingFor === 3) setLocalStatus('tier_3_pending');
    setApplyingFor(null);
  };

  const getTierStatus = (tier) => {
    if (tier === 1) {
      return localStatus === 'tier_1' ? 'current' : 'approved';
    }
    if (tier === 2) {
      if (localStatus === 'tier_1') return 'available';
      if (localStatus === 'tier_2_pending') return 'pending';
      if (['tier_2_approved', 'tier_3_pending', 'tier_3_approved'].includes(localStatus)) return 'approved';
      return 'available';
    }
    if (tier === 3) {
      if (['tier_1', 'tier_2_pending'].includes(localStatus)) return 'locked';
      if (localStatus === 'tier_2_approved') return 'available';
      if (localStatus === 'tier_3_pending') return 'pending';
      if (localStatus === 'tier_3_approved') return 'approved';
      return 'locked';
    }
  };

  const tiers = [
    {
      tier: 1, title: 'Tier 1 — Basic',
      benefits: ['1 free listing (product or service)', 'Appear in search results', 'Receive bookings / orders', 'Access to EventPark workspace'],
    },
    {
      tier: 2, title: 'Tier 2 — Verified',
      benefits: ['Unlimited listings', 'Verified badge on storefront', 'Priority in search results over Tier 1', 'Reduced hold period (5 days vs 7)', 'Access to corporate RFQs'],
    },
    {
      tier: 3, title: 'Tier 3 — Premium',
      benefits: ['Top search placement across all categories', 'T+1 bank payouts (Tier 2 is T+2)', 'Featured in "Top Vendors" discovery', 'Dedicated account manager', 'Lower platform fee (4% vs 5%)'],
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-ep-navy">Verification</h1>
        <p className="text-sm text-gray-400 mt-0.5">Unlock more features by verifying your business</p>
      </div>

      {/* Current status */}
      <div className="bg-ep-navy rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-white/60 text-xs">Current status</p>
          <p className="text-white text-base font-bold">
            {localStatus === 'tier_1' ? 'Tier 1 — Unverified'
              : localStatus === 'tier_2_pending' ? 'Tier 2 review in progress'
              : localStatus === 'tier_2_approved' ? 'Tier 2 — Verified ✓'
              : localStatus === 'tier_3_pending' ? 'Tier 3 review in progress'
              : localStatus === 'tier_3_approved' ? 'Tier 3 — Premium ⭐'
              : '—'}
          </p>
        </div>
      </div>

      {/* Tier cards */}
      <div className="space-y-4">
        {tiers.map(t => (
          <TierCard key={t.tier} {...t}
            status={getTierStatus(t.tier)}
            onApply={() => setApplyingFor(t.tier)} />
        ))}
      </div>

      {/* Info */}
      <div className="mt-5 bg-gray-50 rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-500 space-y-1">
            <p>All documents are reviewed by the EventPark trust & safety team.</p>
            <p>Verification is free. Once approved, your status does not expire.</p>
            <p>Questions? Email <a href="mailto:trust@eventpark.ng" className="text-brand-600 hover:underline">trust@eventpark.ng</a></p>
          </div>
        </div>
      </div>

      {applyingFor && (
        <VerificationForm tier={applyingFor} onSubmit={submit} onClose={() => setApplyingFor(null)} />
      )}
    </div>
  );
}
