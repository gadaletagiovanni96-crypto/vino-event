import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import MyTickets from './pages/MyTickets';
import Stands from './pages/Stands';
import SupplierChat from './pages/SupplierChat';
import Scanner from './pages/Scanner';
import AdminDashboard from './pages/AdminDashboard';
import AdminChat from './pages/AdminChat';

const Page = ({ children }) => <Container maxWidth="lg" sx={{ py: 4 }}>{children}</Container>;

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Page><Login /></Page>} />
        <Route path="/register" element={<Page><Register /></Page>} />
        <Route path="/cart" element={<ProtectedRoute roles={['user']}><Page><Cart /></Page></ProtectedRoute>} />
        <Route path="/my-tickets" element={<ProtectedRoute roles={['user']}><Page><MyTickets /></Page></ProtectedRoute>} />
        <Route path="/stands" element={<ProtectedRoute roles={['supplier']}><Page><Stands /></Page></ProtectedRoute>} />
        <Route path="/supplier-chat" element={<ProtectedRoute roles={['supplier']}><Page><SupplierChat /></Page></ProtectedRoute>} />
        <Route path="/scanner" element={<ProtectedRoute roles={['operator', 'admin']}><Page><Scanner /></Page></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Page><AdminDashboard /></Page></ProtectedRoute>} />
        <Route path="/admin-chat" element={<ProtectedRoute roles={['admin']}><Page><AdminChat /></Page></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
