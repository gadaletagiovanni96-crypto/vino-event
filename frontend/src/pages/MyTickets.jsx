import { useEffect, useState } from 'react';
import { Typography, Grid, Paper, Chip, Alert, Box, CircularProgress, Button } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { api } from '../api';

export default function MyTickets() {
  const [tickets, setTickets] = useState(null);
  const location = useLocation();
  useEffect(() => { api.get('/tickets/mine').then((r) => setTickets(r.data)); }, []);

  if (!tickets) return <CircularProgress />;
  return (
    <>
      <Typography variant="h4" gutterBottom>I miei biglietti</Typography>
      {location.state?.purchased && <Alert severity="success" sx={{ mb: 3 }}>Acquisto completato! Abbiamo inviato i biglietti anche alla tua email.</Alert>}
      {!tickets.length && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography gutterBottom>Non hai ancora biglietti.</Typography>
          <Button variant="contained" component={RouterLink} to="/">Acquista i biglietti</Button>
        </Paper>
      )}
      <Grid container spacing={3}>
        {tickets.map((t) => (
          <Grid item xs={12} sm={6} md={4} key={t._id}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">{t.typeName}</Typography>
              <Box sx={{ my: 2, opacity: t.checkedIn ? 0.35 : 1 }}><QRCodeSVG value={t.code} size={180} /></Box>
              <Chip size="small" color={t.checkedIn ? 'default' : 'success'} label={t.checkedIn ? 'Già utilizzato' : 'Valido'} />
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-all' }}>{t.code}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
