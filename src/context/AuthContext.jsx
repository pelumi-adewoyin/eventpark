import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi, users as usersApi } from '../lib/api';

const AuthContext = createContext(null);

// Derive active workspace from user role
function deriveWorkspace(user) {
  if (!user) return null;
  const type = user.role === 'corporate' ? 'corporate'
    : user.role === 'planner' ? 'planner'
    : 'personal';
  return {
    id: `ws-${user.id}`,
    type,  // 'personal' | 'corporate' | 'planner'
    role: user.role, // their role within the workspace
    label: type === 'corporate' ? (user.companyName || 'My Company')
         : type === 'planner' ? 'Planner Dashboard'
         : 'Personal',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeWorkspace, setActiveWorkspaceState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycTrigger, setKycTrigger] = useState(null);

  // On mount: restore session from stored token
  useEffect(() => {
    if (authApi.isLoggedIn()) {
      usersApi.me()
        .then(u => {
          const normalized = normalizeUser(u);
          setUser(normalized);
          setActiveWorkspaceState(deriveWorkspace(normalized));
        })
        .catch(() => {}) // token invalid — stay logged out
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (phone, otpCode) => {
    const data = await authApi.verifyOTP(phone, otpCode);
    const normalized = normalizeUser(data.user);
    setUser(normalized);
    setActiveWorkspaceState(deriveWorkspace(normalized));
    return data.user;
  }, []);

  // Used by the signup flow — creates account if phone is new
  const loginSignup = useCallback(async (phone, otpCode) => {
    const data = await authApi.verifyOTPSignup(phone, otpCode);
    const normalized = normalizeUser(data.user);
    setUser(normalized);
    setActiveWorkspaceState(deriveWorkspace(normalized));
    return data.user;
  }, []);

  // Demo login (keeps mock flow working on the landing page)
  const demoLogin = useCallback((role = 'diy') => {
    const DEMO_USERS = {
      diy:       { id: 'demo-diy',  phone: '08012345678', full_name: 'Tunde Adeyemi', role: 'diy',       kyc_tier: '0', onboarding_done: true },
      planner:   { id: 'demo-pln',  phone: '08087654321', full_name: 'Amaka Osei',    role: 'planner',   kyc_tier: '1', onboarding_done: true },
      corporate: { id: 'demo-corp', phone: '07099887766', full_name: 'Chioma Nwosu',  role: 'corporate', kyc_tier: '2', onboarding_done: true, company_name: 'Acme Corp' },
    };
    const normalized = normalizeUser(DEMO_USERS[role] || DEMO_USERS.diy);
    setUser(normalized);
    setActiveWorkspaceState(deriveWorkspace(normalized));
  }, []);

  const setActiveWorkspace = useCallback((workspace) => {
    setActiveWorkspaceState(workspace);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setActiveWorkspaceState(null);
  }, []);

  const upgradeKyc = useCallback((tier) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, kycTier: tier };
      setActiveWorkspaceState(deriveWorkspace(updated));
      return updated;
    });
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
      const normalized = normalizeUser(u);
      setUser(normalized);
      setActiveWorkspaceState(deriveWorkspace(normalized));
    }
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{
      user,
      activeWorkspace,
      setActiveWorkspace,
      login,
      loginSignup,
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
    companyName: u.company_name || null,
    orgId: u.org_id || null,
  };
}
