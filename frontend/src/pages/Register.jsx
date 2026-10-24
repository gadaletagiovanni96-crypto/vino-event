import { useState } from 'react';
import { Paper, Typography, TextField, Button, Alert, Stack, Link, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../components/ProtectedRoute';
import { errMsg } from '../api';

const ROLES = [['user', 'Utente'], ['supplier', 'Fornitore'], ['operator', 'Operatore'], ['admin', 'Amministratore']];

export default function Register() {
  const [form, setForm] = useState({ role: 'user', name: '', email: '', password: '', company: '', inviteCode: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const u = await register(form);
      navigate(homeFor(u.role), { replace: true });
    } catch (err) { setError(errMsg(err, 'Registrazione non riuscita')); } finally { setBusy(false); }
  };

  return (
    <Paper component="form" onSubmit={submit} sx={{ p: 4, maxWidth: 520, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Crea il tuo account</Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <ToggleButtonGroup exclusive fullWidth size="small" color="primary" value={form.role} onChange={(_, v) => v && setForm({ ...form, role: v })}>
          {ROLES.map(([v, l]) => <ToggleButton key={v} value={v}>{l}</ToggleButton>)}
        </ToggleButtonGroup>
        <TextField label="Nome e cognome" value={form.name} onChange={set('name')} required />
        {form.role === 'supplier' && <TextField label="Nome dell'azienda" value={form.company} onChange={set('company')} required />}
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
        <TextField label="Password" type="password" autoComplete="new-password" helperText="Almeno 8 caratteri" value={form.password} onChange={set('password')} required />
        {(form.role === 'operator' || form.role === 'admin') && (
          <TextField label={`Codice ${form.role === 'admin' ? 'amministratore' : 'operatore'}`} helperText="Ti viene fornito dall'organizzazione" value={form.inviteCode} onChange={set('inviteCode')} required />
        )}
        <Button type="submit" variant="contained" size="large" disabled={busy}>Registrati</Button>
        <Typography variant="body2">Hai già un account? <Link component={RouterLink} to="/login">Accedi</Link></Typography>
      </Stack>
    </Paper>
  );
}
