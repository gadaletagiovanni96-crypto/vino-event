import { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Alert, LinearProgress, Stack, Divider, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';

export default function Home() {
  const [ev, setEv] = useState(null);
  const [toast, setToast] = useState(false);
  const { user } = useAuth();
  const { add } = useCart();
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => { api.get('/event').then((r) => setEv(r.data)); }, []);
  // aggiornamenti in tempo reale: sold out, vendite aperte/chiuse, disponibilità
  useEffect(() => {
    if (!socket) return undefined;
    socket.on('event:update', setEv);
    return () => socket.off('event:update', setEv);
  }, [socket]);

  if (!ev) return <Box sx={{ display: 'grid', placeItems: 'center', height: '60vh' }}><CircularProgress /></Box>;

  const canBuy = ev.salesOpen && !ev.soldOut;
  const when = new Date(ev.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time = new Date(ev.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const pct = Math.min(100, Math.round((ev.soldTickets / ev.maxTickets) * 100));

  const addToCart = (t) => {
    if (!user) return navigate('/login', { state: { from: '/' } });
    add(t); setToast(true);
  };

  return (
    <>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ fontSize: { xs: '2.8rem', md: '5rem' }, lineHeight: 1.05 }}>{ev.title}</Typography>
          <Typography variant="h5" sx={{ mt: 1, opacity: 0.9 }}>{ev.subtitle}</Typography>
          <Typography sx={{ mt: 3, fontSize: '1.15rem' }}>{when}, dalle {time}</Typography>
          <Typography sx={{ fontSize: '1.15rem' }}>{ev.location}</Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {ev.soldOut && <Alert severity="error" sx={{ mb: 3 }}><b>Sold out.</b> Tutti i biglietti sono stati venduti.</Alert>}
        {!ev.soldOut && !ev.salesOpen && <Alert severity="warning" sx={{ mb: 3 }}>Le vendite sono momentaneamente chiuse. Torna a trovarci presto.</Alert>}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h4" gutterBottom>L'evento</Typography>
            <Typography sx={{ lineHeight: 1.8, maxWidth: '65ch' }}>{ev.description}</Typography>
            <Typography variant="h4" sx={{ mt: 5 }} gutterBottom>Programma</Typography>
            <Stack divider={<Divider />} spacing={1.5}>
              {ev.program.map((p) => (
                <Box key={p.time + p.title} sx={{ display: 'flex', gap: 3 }}>
                  <Typography sx={{ fontWeight: 700, minWidth: 56 }}>{p.time}</Typography>
                  <Box><Typography sx={{ fontWeight: 600 }}>{p.title}</Typography><Typography variant="body2" color="text.secondary">{p.description}</Typography></Box>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Biglietti</Typography>
              <Typography variant="body2" color="text.secondary">{ev.soldOut ? 'Esauriti' : `Ancora ${ev.available} disponibili su ${ev.maxTickets}`}</Typography>
              <LinearProgress variant="determinate" value={pct} color={ev.soldOut ? 'error' : 'primary'} sx={{ my: 1.5, height: 8, borderRadius: 4 }} />
              <Stack spacing={2} sx={{ mt: 2 }}>
                {ev.ticketTypes.map((t) => (
                  <Box key={t._id} sx={{ border: '1px solid #e3e1dc', borderRadius: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 600 }}>{t.name}</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{t.price.toFixed(2)} €</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{t.description}</Typography>
                    {(!user || user.role === 'user') && (
                      <Button fullWidth variant="contained" disabled={!canBuy} onClick={() => addToCart(t)}>
                        {ev.soldOut ? 'Sold out' : canBuy ? 'Aggiungi al carrello' : 'Vendite chiuse'}
                      </Button>
                    )}
                  </Box>
                ))}
              </Stack>
              {user && user.role !== 'user' && <Alert severity="info" sx={{ mt: 2 }}>L'acquisto dei biglietti è riservato agli account Utente.</Alert>}
              {!user && <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">Per acquistare devi accedere o registrarti.</Typography>}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Snackbar open={toast} autoHideDuration={2500} onClose={() => setToast(false)} message="Aggiunto al carrello"
        action={<Button color="inherit" size="small" onClick={() => navigate('/cart')}>Vai al carrello</Button>} />
    </>
  );
}
