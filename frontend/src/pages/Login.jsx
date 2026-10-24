import { useState } from 'react';
import { Paper, Typography, TextField, Button, Alert, Stack, Link } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../components/ProtectedRoute';
import { errMsg } from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const u = await login(form.email, form.password);
      navigate(location.state?.from && u.role === 'user' ? location.state.from : homeFor(u.role), { replace: true });
    } catch (err) { setError(errMsg(err, 'Accesso non riuscito')); } finally { setBusy(false); }
  };

  return (
    <Paper component="form" onSubmit={submit} sx={{ p: 4, maxWidth: 440, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Accedi</Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <TextField label="Password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <Button type="submit" variant="contained" size="large" disabled={busy}>Accedi</Button>
        <Typography variant="body2">Non hai un account? <Link component={RouterLink} to="/register">Registrati</Link></Typography>
      </Stack>
    </Paper>
  );
}
