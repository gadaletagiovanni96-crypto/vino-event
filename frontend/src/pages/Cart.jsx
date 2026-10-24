import { useState } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Button, Alert, Grid, Box, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { api, errMsg } from '../api';
import { useCart } from '../context/CartContext';
import CardForm, { emptyCard, cardError } from '../components/CardForm';

export default function Cart() {
  const { items, setQty, remove, clear, total } = useCart();
  const [card, setCard] = useState(emptyCard);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (!items.length) return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Il carrello è vuoto</Typography>
      <Button variant="contained" component={RouterLink} to="/">Scegli i biglietti</Button>
    </Paper>
  );

  const pay = async () => {
    const ce = cardError(card);
    if (ce) return setError(ce);
    setError(''); setBusy(true);
    try {
      await api.post('/tickets/checkout', { items: items.map(({ typeId, quantity }) => ({ typeId, quantity })), card });
      clear();
      navigate('/my-tickets', { state: { purchased: true } });
    } catch (e) { setError(errMsg(e, 'Pagamento non riuscito')); } finally { setBusy(false); }
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={7}>
        <Typography variant="h4" gutterBottom>Carrello</Typography>
        <Paper sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead><TableRow><TableCell>Biglietto</TableCell><TableCell>Prezzo</TableCell><TableCell>Quantità</TableCell><TableCell align="right">Totale</TableCell><TableCell /></TableRow></TableHead>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.typeId}>
                  <TableCell>{i.name}</TableCell>
                  <TableCell>{i.price.toFixed(2)} €</TableCell>
                  <TableCell><TextField type="number" size="small" sx={{ width: 80 }} value={i.quantity} inputProps={{ min: 1, max: 10 }} onChange={(e) => setQty(i.typeId, parseInt(e.target.value, 10) || 1)} /></TableCell>
                  <TableCell align="right">{(i.price * i.quantity).toFixed(2)} €</TableCell>
                  <TableCell><IconButton onClick={() => remove(i.typeId)} aria-label="Rimuovi"><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ p: 2, textAlign: 'right' }}><Typography variant="h5">Totale: {total.toFixed(2)} €</Typography></Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <Typography variant="h4" gutterBottom>Pagamento</Typography>
        <Paper sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <CardForm value={card} onChange={setCard} />
          <Button fullWidth size="large" variant="contained" sx={{ mt: 3 }} disabled={busy} onClick={pay}>Paga {total.toFixed(2)} €</Button>
        </Paper>
      </Grid>
    </Grid>
  );
}
