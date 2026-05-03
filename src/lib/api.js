const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('ep_access_token');
}

function setTokens(access, refresh) {
  localStorage.setItem('ep_access_token', access);
  if (refresh) localStorage.setItem('ep_refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('ep_access_token');
  localStorage.removeItem('ep_refresh_token');
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem('ep_refresh_token');
  if (!refresh) throw new Error('no refresh token');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) {
    clearTokens();
    throw new Error('session expired');
  }
  const { access_token } = await res.json();
  setTokens(access_token, null);
  return access_token;
}

async function request(method, path, body, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (import.meta.env.DEV) headers['X-Dev-Mode'] = 'true';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });

  // Auto-refresh on 401
  if (res.status === 401 && !opts._retry) {
    try {
      await refreshAccessToken();
      return request(method, path, body, { ...opts, _retry: true });
    } catch {
      clearTokens();
      window.location.href = '/login';
      throw new Error('session expired');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'request failed'), { status: res.status, data });
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  requestOTP: (phone) => request('POST', '/auth/request-otp', { phone }),
  verifyOTP: async (phone, code) => {
    const data = await request('POST', '/auth/verify-otp', { phone, code });
    setTokens(data.access_token, data.refresh_token);
    return data;
  },
  logout: async () => {
    try { await request('POST', '/auth/logout'); } catch {}
    clearTokens();
  },
  isLoggedIn: () => !!getToken(),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = {
  me: () => request('GET', '/users/me'),
  update: (body) => request('PATCH', '/users/me', body),
  completeOnboarding: (body) => request('POST', '/users/onboarding', body),
};

// ─── Events ───────────────────────────────────────────────────────────────────

export const events = {
  create: (body) => request('POST', '/events', body),
  list: () => request('GET', '/events'),
  get: (id) => request('GET', `/events/${id}`),
  update: (id, body) => request('PATCH', `/events/${id}`, body),
  publish: (id) => request('POST', `/events/${id}/publish`),
  delete: (id) => request('DELETE', `/events/${id}`),
};

// ─── Guests ───────────────────────────────────────────────────────────────────

export const guests = {
  invite: (eventId, guestList) => request('POST', `/events/${eventId}/guests`, { guests: guestList }),
  list: (eventId) => request('GET', `/events/${eventId}/guests`),
  checkIn: (eventId, body) => request('POST', `/checkin/${eventId}`, body),
  stats: (eventId) => request('GET', `/checkin/${eventId}/stats`),
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const wallet = {
  get: () => request('GET', '/wallet'),
  transactions: (type) => request('GET', `/wallet/transactions${type ? `?type=${type}` : ''}`),
  initializeTopUp: (amount, email) => request('POST', '/wallet/topup/initialize', { amount, email }),
  verifyTopUp: (reference) => request('GET', `/wallet/topup/verify?reference=${reference}`),
  withdraw: (body) => request('POST', '/wallet/withdraw', body),
};

// ─── KYC ──────────────────────────────────────────────────────────────────────

export const kyc = {
  status: () => request('GET', '/kyc/status'),
  verifyBVN: (body) => request('POST', '/kyc/verify-bvn', body),
  verifyNIN: (body) => request('POST', '/kyc/verify-nin', body),
};

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const vendors = {
  create: (body) => request('POST', '/vendors', body),
  get: (id) => request('GET', `/vendors/${id}`),
  addService: (vendorId, body) => request('POST', `/vendors/${vendorId}/services`, body),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookings = {
  create: (body) => request('POST', '/bookings', body),
  releaseEscrow: (id) => request('POST', `/bookings/${id}/release-escrow`),
};

// ─── Discover (public) ────────────────────────────────────────────────────────

export const discover = {
  events: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/discover/events${q ? `?${q}` : ''}`);
  },
  vendors: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/discover/vendors${q ? `?${q}` : ''}`);
  },
  products: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/discover/products${q ? `?${q}` : ''}`);
  },
};
