const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export function getLegacyAuthToken() {
  return sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
}

export function clearClientSession() {
  sessionStorage.removeItem('adminToken');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
}

export function buildAuthHeaders(headers = {}) {
  const token = getLegacyAuthToken();
  const authenticatedHeaders = { 'X-VJ-Client': 'admin-frontend', ...headers };
  return token ? { ...authenticatedHeaders, Authorization: `Bearer ${token}` } : authenticatedHeaders;
}

function handleExpiredSession() {
  clearClientSession();
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('vj:session-expired'));
  }
}

export async function apiFetch(pathOrUrl, options = {}) {
  const url = /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${API_BASE_URL}${pathOrUrl}`;
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: buildAuthHeaders(options.headers)
  });
  if (response.status === 401) handleExpiredSession();
  return response;
}

export async function apiJson(pathOrUrl, options = {}) {
  const response = await apiFetch(pathOrUrl, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `La solicitud falló (${response.status})`);
    error.status = response.status;
    error.code = payload.code || payload.error;
    throw error;
  }
  return payload;
}
