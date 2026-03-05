import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import LegalRights from './pages/LegalRights'
import Report from './pages/Report'
import Emergency from './pages/Emergency'
import Education from './pages/Education'
import { SpeechProvider } from './contexts/SpeechContext'

export default function App() {
  return (
    <Router>
      <SpeechProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/legal" element={<LegalRights />} />
              <Route path="/report" element={<Report />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/education" element={<Education />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </SpeechProvider>
    </Router>
  )
}