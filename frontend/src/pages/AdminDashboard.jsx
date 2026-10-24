import { useEffect, useState } from 'react';
import { Typography, Grid, Paper, Switch, FormControlLabel, TextField, Button, Chip, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell, Alert, Box, CircularProgress, Stack } from '@mui/material';
import { api, errMsg } from '../api';
import { useSocket } from '../context/SocketContext';

const eur = (n) => `${Number(n || 0).toFixed(2)} €`;
const dt = (d) => new Date(d).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });

function Kpi({ label, value, sub }) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h4">{value}</Typography>
      {sub && <Typography variant="body2" color="text.secondary">{sub}</Typography>}
    </Paper>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [max, setMax] = useState('');
  const [tab, setTab] = useState(0);
  const [msg, setMsg] = useState(null);
  const socket = useSocket();

  useEffect(() => { api.get('/admin/stats').then((r) => { setStats(r.data); setMax(String(r.data.event.maxTickets)); }); }, []);
  // contabilità, stand e biglietti in tempo reale
  useEffect(() => {
    if (!socket) return undefined;
    socket.on('stats:update', setStats);
    return () => socket.off('stats:update', setStats);
  }, [socket]);

  const update = async (body, okText) => {
    try { await api.put('/event', body); setMsg({ severity: 'success', text: okText }); }
    catch (e) { setMsg({ severity: 'error', text: errMsg(e) }); }
  };

  if (!stats) return <CircularProgress />;
  const { event: ev, revenue, tickets, stands, bookings, orders, checkedIn } = stats;

  return (
    <>
      <Typography variant="h4" gutterBottom>Dashboard amministratore</Typography>
      {ev.soldOut && <Alert severity="error" sx={{ mb: 2 }}><b>SOLD OUT:</b> tutti i {ev.maxTickets} biglietti sono stati venduti.</Alert>}
      {msg && <Alert severity={msg.severity} onClose={() => setMsg(null)} sx={{ mb: 2 }}>{msg.text}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><Kpi label="Incasso totale" value={eur(revenue.total)} sub={`Biglietti ${eur(revenue.tickets)} · Stand ${eur(revenue.stands)}`} /></Grid>
        <Grid item xs={6} md={3}><Kpi label="Biglietti venduti" value={`${ev.soldTickets} / ${ev.maxTickets}`} sub={`${ev.available} disponibili`} /></Grid>
        <Grid item xs={6} md={3}><Kpi label="Ingressi convalidati" value={checkedIn} sub={`su ${ev.soldTickets} venduti`} /></Grid>
        <Grid item xs={6} md={3}><Kpi label="Stand venduti" value={`${stands.reduce((n, s) => n + s.sold, 0)} / ${stands.reduce((n, s) => n + s.quantity, 0)}`} /></Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Gestione vendite</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
          <FormControlLabel
            control={<Switch checked={ev.salesOpen} onChange={(e) => update({ salesOpen: e.target.checked }, e.target.checked ? 'Vendite aperte' : 'Vendite chiuse')} />}
            label={ev.salesOpen ? 'Pagina acquisti aperta' : 'Pagina acquisti chiusa'} />
          <Box component="form" sx={{ display: 'flex', gap: 1 }} onSubmit={(e) => { e.preventDefault(); update({ maxTickets: Number(max) }, 'Numero di biglietti aggiornato'); }}>
            <TextField size="small" type="number" label="Biglietti vendibili" value={max} onChange={(e) => setMax(e.target.value)} inputProps={{ min: ev.soldTickets }} />
            <Button type="submit" variant="contained">Salva</Button>
          </Box>
          {ev.soldOut && <Chip color="error" label="Sold out" />}
        </Stack>
      </Paper>

      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
          <Tab label="Contabilità" /><Tab label="Biglietti acquistati" /><Tab label="Stand" />
        </Tabs>
        <Box sx={{ overflowX: 'auto' }}>
          {tab === 0 && (
            <Table size="small">
              <TableHead><TableRow><TableCell>Data</TableCell><TableCell>Cliente</TableCell><TableCell>Tipo</TableCell><TableCell>Dettaglio</TableCell><TableCell align="right">Importo</TableCell></TableRow></TableHead>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o._id}>
                    <TableCell>{dt(o.createdAt)}</TableCell>
                    <TableCell>{o.user?.name}</TableCell>
                    <TableCell>{o.kind === 'ticket' ? 'Biglietti' : 'Stand'}</TableCell>
                    <TableCell>{o.items.map((i) => `${i.quantity}× ${i.label}`).join(', ')}</TableCell>
                    <TableCell align="right">{eur(o.total)}</TableCell>
                  </TableRow>
                ))}
                {!orders.length && <TableRow><TableCell colSpan={5}>Nessun movimento</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
          {tab === 1 && (
            <Table size="small">
              <TableHead><TableRow><TableCell>Acquirente</TableCell><TableCell>Email</TableCell><TableCell>Biglietto</TableCell><TableCell>Acquistato</TableCell><TableCell>Ingresso</TableCell></TableRow></TableHead>
              <TableBody>
                {stats.tickets.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell>{t.owner?.name}</TableCell><TableCell>{t.owner?.email}</TableCell><TableCell>{t.typeName}</TableCell><TableCell>{dt(t.createdAt)}</TableCell>
                    <TableCell>{t.checkedIn ? <Chip size="small" label="Entrato" /> : <Chip size="small" variant="outlined" label="Non ancora" />}</TableCell>
                  </TableRow>
                ))}
                {!stats.tickets.length && <TableRow><TableCell colSpan={5}>Nessun biglietto venduto</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
          {tab === 2 && (
            <>
              <Table size="small">
                <TableHead><TableRow><TableCell>Tipologia</TableCell><TableCell>Prezzo</TableCell><TableCell>Venduti</TableCell><TableCell>Disponibili</TableCell></TableRow></TableHead>
                <TableBody>
                  {stands.map((s) => <TableRow key={s._id}><TableCell>{s.name}</TableCell><TableCell>{eur(s.price)}</TableCell><TableCell>{s.sold} / {s.quantity}</TableCell><TableCell>{s.available}</TableCell></TableRow>)}
                </TableBody>
              </Table>
              <Typography sx={{ p: 2, pb: 0 }} variant="subtitle1">Fornitori con stand</Typography>
              <Table size="small">
                <TableHead><TableRow><TableCell>Azienda</TableCell><TableCell>Email</TableCell><TableCell>Stand</TableCell><TableCell>Data</TableCell></TableRow></TableHead>
                <TableBody>
                  {bookings.map((b) => <TableRow key={b._id}><TableCell>{b.supplier?.company || b.supplier?.name}</TableCell><TableCell>{b.supplier?.email}</TableCell><TableCell>{b.standName}</TableCell><TableCell>{dt(b.createdAt)}</TableCell></TableRow>)}
                  {!bookings.length && <TableRow><TableCell colSpan={4}>Nessuno stand venduto</TableCell></TableRow>}
                </TableBody>
              </Table>
            </>
          )}
        </Box>
      </Paper>
    </>
  );
}
