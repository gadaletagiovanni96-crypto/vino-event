import { useEffect, useState } from 'react';
import { Typography, Alert } from '@mui/material';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ChatBox from '../components/ChatBox';

export default function SupplierChat() {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => { api.get('/chat/me').then((r) => setMessages(r.data)); }, []);
  useEffect(() => {
    if (!socket) return undefined;
    const onMsg = (m) => m.supplier === user.id && setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));
    socket.on('chat:message', onMsg);
    return () => socket.off('chat:message', onMsg);
  }, [socket, user.id]);

  return (
    <>
      <Typography variant="h4" gutterBottom>Chat con l'organizzazione</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>Presenta i tuoi prodotti all'amministratore: ti risponderà qui per valutare l'adesione all'evento.</Alert>
      <ChatBox messages={messages} mine={(m) => m.senderRole === 'supplier'} disabled={!socket}
        onSend={(text) => socket.emit('chat:send', { text })} />
    </>
  );
}
