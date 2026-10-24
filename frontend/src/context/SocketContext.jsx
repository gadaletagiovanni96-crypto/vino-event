import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../api';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

// Una connessione Socket.IO; si ricrea quando cambia l'utente (login/logout) per autenticarla con il token giusto
export function SocketProvider({ children }) {
  const { user, loading } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (loading) return undefined;
    const s = io(import.meta.env.VITE_API_URL || undefined, {
      auth: (cb) => cb({ token: getAccessToken() }),
      withCredentials: true,
    });
    setSocket(s);
    return () => { s.disconnect(); };
  }, [user?.id, loading]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
