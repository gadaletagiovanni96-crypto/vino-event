import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || '') + '/api';
let accessToken = null; // l'access token vive solo in memoria
export const setAccessToken = (t) => { accessToken = t; };
export const getAccessToken = () => accessToken;

export const api = axios.create({ baseURL: BASE, withCredentials: true });
api.interceptors.request.use((c) => {
  if (accessToken) c.headers.Authorization = `Bearer ${accessToken}`;
  return c;
});

// Rinnovo dell'access token tramite il refresh token (cookie httpOnly); chiamate concorrenti condividono la stessa richiesta
let refreshing = null;
export function refreshSession() {
  if (!refreshing) {
    refreshing = axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true })
      .then((r) => { setAccessToken(r.data.accessToken); return r.data; })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

api.interceptors.response.use((r) => r, async (err) => {
  const cfg = err.config;
  if (err.response?.status === 401 && cfg && !cfg._retry && !cfg.url.startsWith('/auth/')) {
    cfg._retry = true;
    try { await refreshSession(); return api(cfg); }
    catch { setAccessToken(null); window.dispatchEvent(new Event('auth:lost')); }
  }
  return Promise.reject(err);
});

export const errMsg = (e, fallback = 'Si è verificato un errore') => e?.response?.data?.message || fallback;
