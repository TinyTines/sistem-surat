import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import SuratList  from './pages/SuratList';
import SuratBuat  from './pages/SuratBuat';
import SuratDetail from './pages/SuratDetail';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/surat" element={
          <ProtectedRoute><SuratList /></ProtectedRoute>
        } />

        <Route path="/surat/buat" element={
          <ProtectedRoute role="pengaju"><SuratBuat /></ProtectedRoute>
        } />

        <Route path="/surat/:id" element={
          <ProtectedRoute><SuratDetail /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

