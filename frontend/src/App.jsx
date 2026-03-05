// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Chat       from './pages/Chat';
import Education  from './pages/Education';
import Emergency  from './pages/Emergency';
import LegalRights from './pages/LegalRights';
import Report     from './pages/Report';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route path="/"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/chat"        element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/education"   element={<ProtectedRoute><Education /></ProtectedRoute>} />
          <Route path="/emergency"   element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
          <Route path="/legal-rights" element={<ProtectedRoute><LegalRights /></ProtectedRoute>} />
          <Route path="/report"      element={<ProtectedRoute><Report /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}