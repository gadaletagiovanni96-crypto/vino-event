import { useEffect, useRef, useState } from 'react';
import { Typography, Grid, Paper, TextField, Button, Alert, Chip, Stack, Box } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api, errMsg } from '../api';

export default function Scanner() {
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');
  const [done, setDone] = useState(false);
  const lastCode = useRef(null);

  const lookup = async (code) => {
    if (!code || code === lastCode.current) return; // evita letture ripetute dello stesso QR
    lastCode.current = code;
    setError(''); setDone(false);
    try { setTicket((await api.get(`/tickets/verify/${encodeURIComponent(code)}`)).data); }
    catch (e) { setTicket(null); setError(errMsg(e, 'Biglietto non valido')); }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 240 }, false);
    scanner.render((text) => lookup(text.trim()), () => {});
    return () => { scanner.clear().catch(() => {}); };
  }, []);

  const checkin = async () => {
    try { setTicket((await api.post(`/tickets/checkin/${ticket.code}`)).data); setDone(true); }
    catch (e) { setError(errMsg(e, 'Impossibile convalidare')); }
  };
  const reset = () => { lastCode.current = null; setTicket(null); setError(''); setDone(false); setManual(''); };

  return (
    <>
      <Typography variant="h4" gutterBottom>Scansione biglietti</Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <div id="qr-reader" />
            <Box component="form" sx={{ display: 'flex', gap: 1, mt: 2 }} onSubmit={(e) => { e.preventDefault(); lookup(manual.trim()); }}>
              <TextField size="small" fullWidth label="Oppure inserisci il codice" value={manual} onChange={(e) => setManual(e.target.value)} />
              <Button type="submit" variant="outlined">Cerca</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {ticket ? (
            <Paper sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h5">{ticket.owner?.name}</Typography>
                <Typography color="text.secondary">{ticket.owner?.email}</Typography>
                <Typography>Biglietto: <b>{ticket.typeName}</b></Typography>
                <Typography>Acquistato il {new Date(ticket.createdAt).toLocaleString('it-IT')}</Typography>
                {ticket.checkedIn
                  ? <Alert severity={done ? 'success' : 'warning'}>{done ? 'Ingresso convalidato.' : `Già utilizzato il ${new Date(ticket.checkedInAt).toLocaleString('it-IT')}`}</Alert>
                  : <Chip color="success" label="Valido, non ancora utilizzato" sx={{ alignSelf: 'flex-start' }} />}
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button variant="contained" disabled={ticket.checkedIn} onClick={checkin}>Convalida ingresso</Button>
                  <Button onClick={reset}>Nuova scansione</Button>
                </Stack>
              </Stack>
            </Paper>
          ) : !error && <Typography color="text.secondary">Inquadra il QR code del biglietto per vedere i dati di chi lo ha acquistato.</Typography>}
          {error && <Button onClick={reset}>Nuova scansione</Button>}
        </Grid>
      </Grid>
    </>
  );
}
