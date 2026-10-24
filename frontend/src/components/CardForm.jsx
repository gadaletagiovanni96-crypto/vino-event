import { Grid, TextField, Alert } from '@mui/material';

// Simulazione dei campi carta: form controllato, nessun dato reale viene addebitato o salvato
export const emptyCard = { number: '', name: '', expiry: '', cvv: '' };

export function cardError(c) {
  const num = c.number.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(num)) return 'Numero di carta non valido';
  if (!c.name.trim()) return 'Inserisci l\'intestatario';
  const m = /^(\d{2})\/(\d{2})$/.exec(c.expiry);
  if (!m || +m[1] < 1 || +m[1] > 12) return 'Scadenza non valida (MM/AA)';
  if (new Date(2000 + +m[2], +m[1], 0, 23, 59, 59) < new Date()) return 'Carta scaduta';
  if (!/^\d{3,4}$/.test(c.cvv)) return 'CVV non valido';
  return null;
}

export default function CardForm({ value, onChange }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const setNumber = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 19);
    onChange({ ...value, number: digits.replace(/(.{4})/g, '$1 ').trim() });
  };
  const setExpiry = (e) => {
    let d = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (d.length > 2) d = `${d.slice(0, 2)}/${d.slice(2)}`;
    onChange({ ...value, expiry: d });
  };
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}><Alert severity="info">Pagamento simulato: nessun addebito reale. Prova con 4242 4242 4242 4242, scadenza futura, CVV a piacere.</Alert></Grid>
      <Grid item xs={12}><TextField fullWidth label="Numero carta" value={value.number} onChange={setNumber} inputProps={{ inputMode: 'numeric', autoComplete: 'off' }} /></Grid>
      <Grid item xs={12}><TextField fullWidth label="Intestatario" value={value.name} onChange={set('name')} /></Grid>
      <Grid item xs={6}><TextField fullWidth label="Scadenza (MM/AA)" value={value.expiry} onChange={setExpiry} inputProps={{ inputMode: 'numeric' }} /></Grid>
      <Grid item xs={6}><TextField fullWidth label="CVV" type="password" value={value.cvv} onChange={(e) => onChange({ ...value, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} inputProps={{ inputMode: 'numeric', autoComplete: 'off' }} /></Grid>
    </Grid>
  );
}
