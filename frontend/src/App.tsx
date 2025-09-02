// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Sessions from './pages/Sessions';
import Bookings from './pages/Bookings';
import AuditLogs from './pages/AuditLogs';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route element={<AdminRoute />}>
            <Route path="/classes" element={<Classes />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
