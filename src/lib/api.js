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

  // Auto-refresh on 401 — but NOT for public auth routes (those 401s mean
  // "wrong credentials", not "expired token") and NOT if already retried.
  const isAuthRoute = path.startsWith('/auth/');
  if (res.status === 401 && !opts._retry && !isAuthRoute) {
    try {
      await refreshAccessToken();
      return request(method, path, body, { ...opts, _retry: true });
    } catch {
      clearTokens();
      // Only redirect to login if we're not already there
      const onAuthPage = window.location.pathname.startsWith('/login') ||
                         window.location.pathname.startsWith('/signup') ||
                         window.location.pathname.startsWith('/business');
      if (!onAuthPage) window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong'), { status: res.status, data });
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

// ─── Personal Budget ──────────────────────────────────────────────────────────
export const personalBudget = {
  list: () => request('GET', '/budgets'),
  get: (id) => request('GET', `/budgets/${id}`),
  create: (body) => request('POST', '/budgets', body),
  update: (id, body) => request('PATCH', `/budgets/${id}`, body),
  delete: (id) => request('DELETE', `/budgets/${id}`),
  addExpense: (id, body) => request('POST', `/budgets/${id}/expenses`, body),
  listExpenses: (id) => request('GET', `/budgets/${id}/expenses`),
  deleteExpense: (id, expenseId) => request('DELETE', `/budgets/${id}/expenses/${expenseId}`),
};

// ─── Organisations ────────────────────────────────────────────────────────────────────────────────
export const orgs = {
  create: (body) => request('POST', '/orgs', body),
  getMe: () => request('GET', '/orgs/me'),
  update: (orgId, body) => request('PATCH', `/orgs/${orgId}`, body),
  listDepts: (orgId) => request('GET', `/orgs/${orgId}/departments`),
  createDept: (orgId, body) => request('POST', `/orgs/${orgId}/departments`),
  listMembers: (orgId) => request('GET', `/orgs/${orgId}/members`),
  inviteMember: (orgId, body) => request('POST', `/orgs/${orgId}/members`, body),
  updateMember: (orgId, userId, body) => request('PATCH', `/orgs/${orgId}/members/${userId}`, body),
};

// ─── Approvals ────────────────────────────────────────────────────────────────────────────────
export const approvals = {
  list: (orgId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/orgs/${orgId}/approvals${q ? `?${q}` : ''}`);
  },
  submit: (orgId, body) => request('POST', `/orgs/${orgId}/approvals`, body),
  get: (orgId, id) => request('GET', `/orgs/${orgId}/approvals/${id}`),
  approve: (orgId, id, body) => request('POST', `/orgs/${orgId}/approvals/${id}/approve`, body),
  reject: (orgId, id, body) => request('POST', `/orgs/${orgId}/approvals/${id}/reject`, body),
  requestChanges: (orgId, id, body) => request('POST', `/orgs/${orgId}/approvals/${id}/request-changes`, body),
};

// ─── RFQs / Quotes ──────────────────────────────────────────────────────────────────────────────
export const rfqs = {
  list: (orgId) => request('GET', `/orgs/${orgId}/rfqs`),
  create: (orgId, body) => request('POST', `/orgs/${orgId}/rfqs`, body),
  get: (orgId, id) => request('GET', `/orgs/${orgId}/rfqs/${id}`),
  send: (orgId, id) => request('POST', `/orgs/${orgId}/rfqs/${id}/send`),
  award: (orgId, id, body) => request('POST', `/orgs/${orgId}/rfqs/${id}/award`, body),
  cancel: (orgId, id) => request('POST', `/orgs/${orgId}/rfqs/${id}/cancel`),
};

// ─── Purchase Orders ────────────────────────────────────────────────────────────────────────────
export const pos = {
  list: (orgId) => request('GET', `/orgs/${orgId}/pos`),
  create: (orgId, body) => request('POST', `/orgs/${orgId}/pos`, body),
  get: (orgId, id) => request('GET', `/orgs/${orgId}/pos/${id}`),
  goodsReceipt: (orgId, id, body) => request('POST', `/orgs/${orgId}/pos/${id}/goods-receipt`, body),
};

// ─── Invoices ─────────────────────────────────────────────────────────────────────────────────
export const invoices = {
  list: (orgId) => request('GET', `/orgs/${orgId}/invoices`),
  create: (orgId, body) => request('POST', `/orgs/${orgId}/invoices`, body),
  matchStatus: (orgId, id) => request('GET', `/orgs/${orgId}/invoices/${id}/match`),
  pay: (orgId, id, body) => request('POST', `/orgs/${orgId}/invoices/${id}/pay`, body),
};

// ─── Corporate Wallet ─────────────────────────────────────────────────────────────────────────────
export const corpWallet = {
  get: (orgId) => request('GET', `/orgs/${orgId}/wallet`),
  transactions: (orgId) => request('GET', `/orgs/${orgId}/wallet/transactions`),
  topup: (orgId, body) => request('POST', `/orgs/${orgId}/wallet/topup`, body),
  requestWithdrawal: (orgId, body) => request('POST', `/orgs/${orgId}/wallet/withdrawal-requests`, body),
};

// ─── Audit Log ───────────────────────────────────────────────────────────────────────────────
export const auditLog = {
  list: (orgId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/orgs/${orgId}/audit${q ? `?${q}` : ''}`);
  },
  verify: (orgId) => request('GET', `/orgs/${orgId}/audit/verify`),
  export: (orgId) => request('GET', `/orgs/${orgId}/audit/export`),
};

// ─── Budget ─────────────────────────────────────────────────────────────────────────────────
export const budget = {
  list: (eventId) => request('GET', `/events/${eventId}/budget`),
  summary: (eventId) => request('GET', `/events/${eventId}/budget/summary`),
  create: (eventId, body) => request('POST', `/events/${eventId}/budget`, body),
  update: (eventId, lineId, body) => request('PATCH', `/events/${eventId}/budget/${lineId}`, body),
  delete: (eventId, lineId) => request('DELETE', `/events/${eventId}/budget/${lineId}`),
};

// ─── Notifications ────────────────────────────────────────────────────────────────────────────
export const notifications = {
  list: () => request('GET', '/notifications'),
  markAllRead: () => request('POST', '/notifications/mark-read'),
};

// ─── Vendor Discovery (enhanced) ──────────────────────────────────────────────
export const vendorDiscover = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/discover/vendors${q ? `?${q}` : ''}`);
  },
  get: (id) => request('GET', `/discover/vendors/${id}`),
  bookmark: (id) => request('POST', `/bookmarks`, { item_type: 'vendor', item_id: id }),
  unbookmark: (id) => request('DELETE', `/bookmarks/vendor/${id}`),
  listBookmarks: () => request('GET', `/bookmarks?type=vendor`),
};

// ─── Bookings (enhanced) ──────────────────────────────────────────────────────
export const bookingsApi = {
  create: (body) => request('POST', '/bookings', body),
  list: () => request('GET', '/bookings'),
  get: (id) => request('GET', `/bookings/${id}`),
  sendQuote: (id, body) => request('POST', `/bookings/${id}/quote`, body),
  respondQuote: (id, body) => request('POST', `/bookings/${id}/quote/respond`, body),
  pay: (id, body) => request('POST', `/bookings/${id}/pay`, body),
  releaseEscrow: (id) => request('POST', `/bookings/${id}/release-escrow`),
};

// ─── Vendor Chat ──────────────────────────────────────────────────────────────
export const vendorChat = {
  listChats: () => request('GET', '/vendor-chats'),
  getMessages: (chatId) => request('GET', `/vendor-chats/${chatId}/messages`),
  sendMessage: (chatId, body) => request('POST', `/vendor-chats/${chatId}/messages`, body),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlist = {
  list: () => request('GET', '/wishlists'),
  get: (id) => request('GET', `/wishlists/${id}`),
  create: (body) => request('POST', '/wishlists', body),
  addItem: (id, body) => request('POST', `/wishlists/${id}/items`, body),
  deleteItem: (id, itemId) => request('DELETE', `/wishlists/${id}/items/${itemId}`),
  contribute: (id, body) => request('POST', `/wishlists/${id}/contribute`, body),
};

// ─── Group Wishlist ───────────────────────────────────────────────────────────
export const groupWishlist = {
  list: () => request('GET', '/group-wishlists'),
  create: (body) => request('POST', '/group-wishlists', body),
  get: (id) => request('GET', `/group-wishlists/${id}`),
  addItem: (id, body) => request('POST', `/group-wishlists/${id}/items`, body),
  inviteContributors: (id, body) => request('POST', `/group-wishlists/${id}/invite`, body),
  contribute: (id, body) => request('POST', `/group-wishlists/${id}/contribute`, body),
};
