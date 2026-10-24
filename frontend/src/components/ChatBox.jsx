import { useEffect, useRef, useState } from 'react';
import { Box, Paper, TextField, IconButton, Typography, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// Messaggi + campo di invio. "mine(msg)" decide quali messaggi sono a destra.
export default function ChatBox({ messages, onSend, mine, disabled, height = 420 }) {
  const [text, setText] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', height }}>
      <Stack spacing={1} sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.length === 0 && <Typography color="text.secondary">Nessun messaggio. Scrivi per iniziare la conversazione.</Typography>}
        {messages.map((m) => (
          <Box key={m._id} sx={{ alignSelf: mine(m) ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
            <Typography variant="caption" color="text.secondary">{m.senderName} · {new Date(m.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</Typography>
            <Box sx={{ bgcolor: mine(m) ? 'primary.main' : '#ecebe6', color: mine(m) ? 'white' : 'text.primary', px: 1.5, py: 1, borderRadius: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.text}</Box>
          </Box>
        ))}
        <div ref={endRef} />
      </Stack>
      <Box component="form" onSubmit={submit} sx={{ display: 'flex', gap: 1, p: 1.5, borderTop: '1px solid #e3e1dc' }}>
        <TextField fullWidth size="small" placeholder="Scrivi un messaggio…" value={text} onChange={(e) => setText(e.target.value)} disabled={disabled} />
        <IconButton type="submit" color="primary" disabled={disabled || !text.trim()} aria-label="Invia"><SendIcon /></IconButton>
      </Box>
    </Paper>
  );
}
