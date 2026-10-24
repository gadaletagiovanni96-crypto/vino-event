import { useEffect, useState, useCallback } from 'react';
import { Typography, Grid, Paper, Button, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Box, CircularProgress } from '@mui/material';
import { api, errMsg } from '../api';
import { useSocket } from '../context/SocketContext';
import CardForm, { emptyCard, cardError } from '../components/CardForm';

export default function Stands() {
  const [stands, setStands] = useState(null);
  const [mine, setMine] = useState(undefined);
  const [selected, setSelected] = useState(null);
  const [card, setCard] = useState(emptyCard);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const socket = useSocket();

  const load = useCallback(async () => {
    const [s, m] = await Promise.all([api.get('/stands'), api.get('/stands/mine')]);
    setStands(s.data); setMine(m.data);
  }, []);
  useEffect(() => { load(); }, [load]);
  // la disponibilità degli stand si aggiorna quando qualcun altro acquista
  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => api.get('/stands').then((r) => setStands(r.data));
    socket.on('event:update', refresh);
    return () => socket.off('event:update', refresh);
  }, [socket]);

  const buy = async () => {
    const ce = cardError(card);
    if (ce) return setError(ce);
    setError(''); setBusy(true);
    try {
      await api.post(`/stands/${selected._id}/purchase`, { card });
      setSelected(null); setCard(emptyCard); await load();
    } catch (e) { setError(errMsg(e, 'Acquisto non riuscito')); } finally { setBusy(false); }
  };

  if (!stands || mine === undefined) return <CircularProgress />;
  return (
    <>
      <Typography variant="h4" gutterBottom>Stand espositori</Typography>
      {mine
        ? <Alert severity="success" sx={{ mb: 3 }}>Hai acquistato lo stand <b>{mine.standName}</b> ({mine.price.toFixed(2)} €). Scrivi all'organizzazione dalla chat per i dettagli.</Alert>
        : <Typography color="text.secondary" sx={{ mb: 3 }}>Scegli la tipologia di stand: più alto è il livello, maggiore è la visibilità. Puoi acquistare un solo stand.</Typography>}
      <Grid container spacing={3}>
        {stands.map((s) => (
          <Grid item xs={12} md={4} key={s._id}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', borderColor: s.level === 3 ? 'primary.main' : undefined, borderWidth: s.level === 3 ? 2 : 1 }}>
              <Typography variant="h5">{s.name}</Typography>
              <Typography variant="h4" sx={{ my: 1 }}>{s.price.toFixed(0)} €</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>{s.description}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>Visibilità: {s.visibility}</Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip size="small" color={s.available ? 'default' : 'error'} label={s.available ? `${s.available} disponibili` : 'Esauriti'} />
                <Button variant="contained" disabled={!!mine || !s.available} onClick={() => { setSelected(s); setError(''); }}>Acquista</Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="xs">
        <DialogTitle>Stand {selected?.name} · {selected?.price.toFixed(2)} €</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ pt: 1 }}><CardForm value={card} onChange={setCard} /></Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelected(null)}>Annulla</Button>
          <Button variant="contained" disabled={busy} onClick={buy}>Paga e acquista</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
