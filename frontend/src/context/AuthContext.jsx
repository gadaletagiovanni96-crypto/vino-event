import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAccessToken, refreshSession } from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // All'avvio prova a ripristinare la sessione dal refresh token (cookie)
  useEffect(() => {
    refreshSession().then((d) => setUser(d.user)).catch(() => {}).finally(() => setLoading(false));
    const lost = () => setUser(null);
    window.addEventListener('auth:lost', lost);
    return () => window.removeEventListener('auth:lost', lost);
  }, []);

  const start = ({ accessToken, user: u }) => { setAccessToken(accessToken); setUser(u); return u; };
  const login = async (email, password) => start((await api.post('/auth/login', { email, password })).data);
  const register = async (form) => start((await api.post('/auth/register', form)).data);
  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignora */ }
    setAccessToken(null); setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
