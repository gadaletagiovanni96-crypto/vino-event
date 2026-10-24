import { useEffect, useState } from 'react';
import { Typography, Grid, Paper, List, ListItemButton, ListItemText } from '@mui/material';
import { api } from '../api';
import { useSocket } from '../context/SocketContext';
import ChatBox from '../components/ChatBox';

export default function AdminChat() {
  const socket = useSocket();
  const [threads, setThreads] = useState([]);
  const [current, setCurrent] = useState(null); // id fornitore
  const [messages, setMessages] = useState([]);

  const loadThreads = () => api.get('/chat/threads').then((r) => setThreads(r.data));
  useEffect(() => { loadThreads(); }, []);
  useEffect(() => { if (current) api.get(`/chat/${current}`).then((r) => setMessages(r.data)); }, [current]);

  useEffect(() => {
    if (!socket) return undefined;
    const onMsg = (m) => {
      if (m.supplier === current) setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));
      loadThreads();
    };
    socket.on('chat:message', onMsg);
    return () => socket.off('chat:message', onMsg);
  }, [socket, current]);

  const active = threads.find((t) => t.supplier._id === current);
  return (
    <>
      <Typography variant="h4" gutterBottom>Chat con i fornitori</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper>
            <List disablePadding>
              {!threads.length && <ListItemText sx={{ p: 2 }} primary="Nessun fornitore registrato" />}
              {threads.map((t) => (
                <ListItemButton key={t.supplier._id} selected={t.supplier._id === current} onClick={() => setCurrent(t.supplier._id)}>
                  <ListItemText primary={t.supplier.company || t.supplier.name} secondary={t.lastText || 'Nessun messaggio'} secondaryTypographyProps={{ noWrap: true }} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          {current ? (
            <>
              <Typography variant="h6" gutterBottom>{active?.supplier.company || active?.supplier.name} <Typography component="span" color="text.secondary">({active?.supplier.email})</Typography></Typography>
              <ChatBox messages={messages} mine={(m) => m.senderRole === 'admin'} onSend={(text) => socket.emit('chat:send', { supplierId: current, text })} />
            </>
          ) : <Typography color="text.secondary">Seleziona un fornitore per aprire la conversazione.</Typography>}
        </Grid>
      </Grid>
    </>
  );
}
