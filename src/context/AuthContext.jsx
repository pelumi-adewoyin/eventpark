import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi, users as usersApi } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycTrigger, setKycTrigger] = useState(null);

  // On mount: restore session from stored token
  useEffect(() => {
    if (authApi.isLoggedIn()) {
      usersApi.me()
        .then(u => setUser(normalizeUser(u)))
        .catch(() => {}) // token invalid — stay logged out
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (phone, otpCode) => {
    const data = await authApi.verifyOTP(phone, otpCode);
    setUser(normalizeUser(data.user));
    return data.user;
  }, []);

  // Demo login (keeps mock flow working on the landing page)
  const demoLogin = useCallback((role = 'diy') => {
    const DEMO_USERS = {
      diy:       { id: 'demo-diy',  phone: '08012345678', full_name: 'Tunde Adeyemi', role: 'diy',       kyc_tier: '0', onboarding_done: true },
      planner:   { id: 'demo-pln',  phone: '08087654321', full_name: 'Amaka Osei',    role: 'planner',   kyc_tier: '1', onboarding_done: true },
      corporate: { id: 'demo-corp', phone: '07099887766', full_name: 'Chioma Nwosu',  role: 'corporate', kyc_tier: '2', onboarding_done: true },
    };
    setUser(normalizeUser(DEMO_USERS[role] || DEMO_USERS.diy));
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const upgradeKyc = useCallback((tier) => {
    setUser(prev => prev ? { ...prev, kycTier: tier } : prev);
  }, []);

  const triggerKyc = useCallback((reason) => {
    setKycTrigger(reason);
    setKycModalOpen(true);
  }, []);

  const topUpWallet = useCallback((amount) => {
    setUser(prev => prev ? { ...prev, walletBalance: (prev.walletBalance || 0) + amount } : prev);
  }, []);

  const refreshUser = useCallback(async () => {
    if (authApi.isLoggedIn()) {
      const u = await usersApi.me();
      setUser(normalizeUser(u));
    }
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      demoLogin,
      logout,
      upgradeKyc,
      kycModalOpen, setKycModalOpen,
      kycTrigger, triggerKyc,
      topUpWallet,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Map backend user shape → frontend shape (keeps all existing dashboard code working)
function normalizeUser(u) {
  if (!u) return null;
  const [firstName, ...rest] = (u.full_name || '').split(' ');
  return {
    id: u.id,
    phone: u.phone,
    email: u.email || null,
    firstName: firstName || '',
    lastName: rest.join(' ') || '',
    fullName: u.full_name || '',
    role: u.role || null,
    kycTier: parseInt(u.kyc_tier || '0', 10),
    onboarded: u.onboarding_done,
    walletBalance: u.wallet?.balance || 0,
    walletEscrow: u.wallet?.escrow_held || 0,
  };
}
