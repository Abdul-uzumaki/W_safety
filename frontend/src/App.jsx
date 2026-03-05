import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import LegalRights from './pages/LegalRights'
import Report from './pages/Report'
import Emergency from './pages/Emergency'
import Education from './pages/Education'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

import { SpeechProvider } from './contexts/SpeechContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'


// ================= Layout =================
function AppLayout() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">

      {isAuthenticated && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/legal"
            element={
              <ProtectedRoute>
                <LegalRights />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />

          <Route
            path="/emergency"
            element={
              <ProtectedRoute>
                <Emergency />
              </ProtectedRoute>
            }
          />

          <Route
            path="/education"
            element={
              <ProtectedRoute>
                <Education />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>

      {isAuthenticated && <Footer />}

    </div>
  )
}


// ================= Root App =================
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SpeechProvider>
          <AppLayout />
        </SpeechProvider>
      </AuthProvider>
    </Router>
  )
}