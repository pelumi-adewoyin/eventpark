import { useState } from 'react';
import { X, Shield, CheckCircle2, AlertTriangle, Upload, Camera, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const triggerMessages = {
  publish_ticket: {
    title: 'Verify your identity to publish',
    desc: 'You\'re about to sell tickets and hold buyer funds. A quick BVN verification (Tier 1) is required before going live.',
    tier: 1,
  },
  withdraw: {
    title: 'Verify to withdraw funds',
    desc: 'To move money from your EventPark wallet to your bank account, we need to verify your BVN.',
    tier: 1,
  },
  vendor_payout: {
    title: 'Tier 2 verification required',
    desc: 'Vendor payments above ₦500,000 require NIN + ID verification for your protection.',
    tier: 2,
  },
  kyb: {
    title: 'Company verification (KYB)',
    desc: 'We need your CAC certificate and authorised signatory details for corporate accounts.',
    tier: 'kyb',
  },
};

const tierLimits = {
  1: { daily: '₦200,000', monthly: '₦2,000,000', label: 'Tier 1 — BVN Verified' },
  2: { daily: '₦1,000,000', monthly: '₦20,000,000', label: 'Tier 2 — ID Verified' },
};

export default function KYCModal() {
  const { kycModalOpen, setKycModalOpen, kycTrigger, upgradeKyc, user } = useAuth();
  const [step, setStep] = useState('intro'); // intro | form | processing | success
  const [showBvn, setShowBvn] = useState(false);
  const [form, setForm] = useState({ bvn: '', nin: '', phone: '', idType: 'NIN', idNumber: '' });

  if (!kycModalOpen) return null;

  const config = triggerMessages[kycTrigger] || triggerMessages.withdraw;
  const tierNum = typeof config.tier === 'number' ? config.tier : null;

  const handleSubmit = async () => {
    setStep('processing');
    // In production: call Dojah API via your backend
    // POST /api/kyc/verify with { bvn, tier }
    // Dojah endpoint: https://api.dojah.io/api/v1/kyc/bvn
    await new Promise(r => setTimeout(r, 2500));
    upgradeKyc(tierNum || 1);
    setStep('success');
    toast.success('Identity verified successfully!');
    setTimeout(() => {
      setKycModalOpen(false);
      setStep('intro');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setKycModalOpen(false)} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-brand-500 via-brand-400 to-accent-400" />

        {/* Close */}
        <button
          onClick={() => setKycModalOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* INTRO */}
          {step === 'intro' && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-lg leading-tight">{config.title}</h2>
                  <p className="text-xs text-gray-400">Powered by Dojah · Your data is encrypted</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-5">{config.desc}</p>

              {tierNum && (
                <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-5">
                  <div className="text-xs font-bold text-brand-700 mb-2">After verification you unlock:</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Daily limit</span>
                      <span className="font-semibold text-gray-800">{tierLimits[tierNum]?.daily}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Monthly limit</span>
                      <span className="font-semibold text-gray-800">{tierLimits[tierNum]?.monthly}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Takes less than 2 minutes
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Your BVN / NIN is never stored — only verification status
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Verified by Dojah, Nigeria's leading identity platform
                </div>
              </div>

              <button
                onClick={() => setStep('form')}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl transition"
              >
                Start Verification
              </button>
              <button
                onClick={() => setKycModalOpen(false)}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-3 transition"
              >
                I'll do this later
              </button>
            </>
          )}

          {/* FORM */}
          {step === 'form' && (
            <>
              <h2 className="font-extrabold text-gray-900 text-lg mb-5">
                {config.tier === 1 ? 'BVN Verification' : 'ID Verification'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone number (linked to BVN)
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">BVN</label>
                  <div className="relative">
                    <input
                      type={showBvn ? 'text' : 'password'}
                      placeholder="Enter your 11-digit BVN"
                      maxLength={11}
                      value={form.bvn}
                      onChange={e => setForm(p => ({ ...p, bvn: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBvn(!showBvn)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showBvn ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Dial *565*0# on any network to get your BVN</p>
                </div>

                {config.tier === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Type</label>
                      <select
                        value={form.idType}
                        onChange={e => setForm(p => ({ ...p, idType: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                      >
                        <option value="NIN">NIN (National ID)</option>
                        <option value="passport">International Passport</option>
                        <option value="drivers">Driver's License</option>
                        <option value="voters">Voter's Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Number</label>
                      <input type="text" placeholder="Enter your ID number" value={form.idNumber}
                        onChange={e => setForm(p => ({ ...p, idNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:border-brand-300 transition">
                      <Camera className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 font-medium">Upload selfie or take photo</p>
                      <p className="text-xs text-gray-300 mt-1">Clear, well-lit photo of your face</p>
                    </div>
                  </>
                )}

                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">
                    Your details are verified in real-time via Dojah's secure API. We never store your BVN — only a verification token.
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!form.bvn || form.bvn.length < 11 || !form.phone}
                  className={`w-full py-3.5 rounded-2xl font-bold transition ${
                    form.bvn.length === 11 && form.phone
                      ? 'bg-brand-600 hover:bg-brand-700 text-white'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Verify Identity
                </button>
              </div>
            </>
          )}

          {/* PROCESSING */}
          {step === 'processing' && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Verifying your identity</h3>
              <p className="text-sm text-gray-400">Checking with Dojah and NIBSS...</p>
              <div className="mt-6 space-y-2">
                {['Connecting to Dojah API', 'Matching BVN with NIBSS', 'Completing verification'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2 justify-center text-xs text-gray-400">
                    <div className="w-4 h-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" style={{ animationDelay: `${i * 0.3}s` }} />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-xl mb-2">Verified! 🎉</h3>
              <p className="text-sm text-gray-500">Your identity has been confirmed. You can now proceed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
