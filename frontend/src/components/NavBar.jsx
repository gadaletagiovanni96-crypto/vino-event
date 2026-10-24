import { AppBar, Toolbar, Typography, Button, Badge, Box, Chip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const LINKS = {
  user: [['/', 'Evento'], ['/my-tickets', 'I miei biglietti']],
  supplier: [['/', 'Evento'], ['/stands', 'Stand'], ['/supplier-chat', 'Chat con l\'organizzazione']],
  operator: [['/', 'Evento'], ['/scanner', 'Scansiona biglietti']],
  admin: [['/', 'Evento'], ['/admin', 'Dashboard'], ['/admin-chat', 'Chat fornitori']],
};
const ROLE_LABEL = { user: 'Utente', supplier: 'Fornitore', operator: 'Operatore', admin: 'Amministratore' };

export default function NavBar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const links = user ? LINKS[user.role] : [['/', 'Evento']];

  return (
    <AppBar position="sticky" color="primary" elevation={0}>
      <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'inherit', textDecoration: 'none', mr: 2 }}>
          Calici &amp; Colline
        </Typography>
        {links.map(([to, label]) => <Button key={to} color="inherit" component={RouterLink} to={to}>{label}</Button>)}
        <Box sx={{ flexGrow: 1 }} />
        {user?.role === 'user' && (
          <Button color="inherit" component={RouterLink} to="/cart" aria-label="Carrello">
            <Badge badgeContent={count} color="secondary"><ShoppingCartIcon /></Badge>
          </Button>
        )}
        {user ? (
          <>
            <Chip size="small" label={`${user.name} · ${ROLE_LABEL[user.role]}`} sx={{ bgcolor: 'rgba(255,255,255,.18)', color: 'white' }} />
            <Button color="inherit" onClick={async () => { await logout(); navigate('/'); }}>Esci</Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={RouterLink} to="/login">Accedi</Button>
            <Button variant="contained" color="secondary" component={RouterLink} to="/register">Registrati</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
