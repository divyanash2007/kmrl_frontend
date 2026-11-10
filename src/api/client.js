const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const API_BASE = rawBase 
  ? (rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`)
  : '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const { headers: customHeaders, ...restOptions } = options;
  const config = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(customHeaders || {}),
    },
  };

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    let msg = `Request failed with status ${res.status}`;
    if (typeof data.detail === 'string') {
      msg = data.detail;
    } else if (Array.isArray(data.detail)) {
      msg = data.detail
        .map((err) => `${err.loc ? err.loc.slice(1).join('.') : 'field'}: ${err.msg}`)
        .join(', ');
    }
    throw new Error(msg);
  }
  return data;
}

// ── Citizen Endpoints ──

export function createGuestSession(guestIdentifier) {
  return request('/sessions/create', {
    method: 'POST',
    body: JSON.stringify({ guest_identifier: guestIdentifier || null }),
  });
}

export function submitTicket(payload) {
  return request('/tickets/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function trackTicket(ticketId) {
  return request(`/tickets/track/${ticketId}`);
}

export function submitFeedback(ticketId, payload) {
  return request(`/tickets/${ticketId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getSessionTickets(sessionId) {
  return request(`/tickets/session/${sessionId}`);
}

// ── Official Endpoints ──

export function officialLogin(safeKey) {
  return request('/official/auth', {
    method: 'POST',
    body: JSON.stringify({ safe_key: safeKey }),
  });
}

export function getAnalytics(safeKey) {
  return request('/official/analytics', {
    headers: { 'X-Safe-Key': safeKey },
  });
}

export function getEscalationQueue(safeKey, params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/official/queue${query ? `?${query}` : ''}`, {
    headers: { 'X-Safe-Key': safeKey },
  });
}

export function resolveTicket(ticketId, payload, safeKey) {
  return request(`/official/resolve/${ticketId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'X-Safe-Key': safeKey },
  });
}

export function getAuditLogs(ticketId, safeKey) {
  return request(`/official/audit-logs/${ticketId}`, {
    headers: { 'X-Safe-Key': safeKey },
  });
}

