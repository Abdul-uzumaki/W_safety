import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useSpeech } from '../contexts/SpeechContext'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/chat', label: 'Support' },
  { path: '/legal', label: 'Legal' },
  { path: '/report', label: 'Report' },
  { path: '/emergency', label: 'Emergency' },
  { path: '/education', label: 'Education' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isSpeechEnabled, toggleSpeech, speak, stop } = useSpeech()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onMouseEnter={() => speak('MASK Home')}
            onMouseLeave={stop}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bloom-400 to-petal-400 flex items-center justify-center shadow-bloom group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-sm font-bold">✿</span>
            </div>
            <span className="font-display font-bold text-xl text-bloom-700 tracking-tight">
              MA<span className="text-petal-500">SK</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* TTS Toggle Button */}
            <button
              onClick={toggleSpeech}
              title={isSpeechEnabled ? "Disable Voice Assistant" : "Enable Voice Assistant"}
              className={`mr-2 p-2 rounded-full transition-colors ${isSpeechEnabled
                ? 'bg-bloom-100 text-bloom-700 hover:bg-bloom-200'
                : 'text-gray-400 hover:bg-gray-100'
                }`}
              aria-label="Toggle Text to Speech"
            >
              {isSpeechEnabled ? '🔊' : '🔇'}
            </button>
            {navItems.map(item => (
              item.path === '/emergency' ? (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => speak('Emergency')}
                  onMouseLeave={stop}
                  className="ml-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 hover:shadow-md"
                >
                  🆘 Emergency
                </NavLink>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onMouseEnter={() => speak(item.label)}
                  onMouseLeave={stop}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                    ${isActive
                      ? 'bg-bloom-100 text-bloom-700 font-semibold'
                      : 'text-gray-600 hover:text-bloom-600 hover:bg-pink-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            ))}

            {/* User info & Logout */}
            {user && (
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-pink-200">
                <span className="text-sm text-bloom-600 font-medium">
                  Hi, {user.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  onMouseEnter={() => speak('Logout')}
                  onMouseLeave={stop}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-pink-50 text-bloom-600 hover:bg-bloom-100 transition-all duration-200"
                  id="navbar-logout-btn"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger & TTS toggle container */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleSpeech}
              title={isSpeechEnabled ? "Disable Voice Assistant" : "Enable Voice Assistant"}
              className={`p-2 rounded-full transition-colors ${isSpeechEnabled
                ? 'bg-bloom-100 text-bloom-700'
                : 'text-gray-400'
                }`}
              aria-label="Toggle Text to Speech"
            >
              {isSpeechEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={() => setOpen(!open)}
              onMouseEnter={() => !open ? speak('Menu') : speak('Close menu')}
              onMouseLeave={stop}
              className="p-2 rounded-lg text-bloom-500 hover:bg-pink-50 transition"
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-4 pb-4 pt-1 space-y-1 border-t border-pink-100 bg-white/95">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setOpen(false)}
              onMouseEnter={() => speak(item.label)}
              onMouseLeave={stop}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${item.path === '/emergency'
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : isActive
                    ? 'bg-bloom-100 text-bloom-700 font-semibold'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-bloom-600'
                }`
              }
            >
              {item.path === '/emergency' ? '🆘 ' : ''}{item.label}
            </NavLink>
          ))}
          {/* Mobile Logout */}
          {user && (
            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200 w-full"
            >
              🚪 Logout ({user.name?.split(' ')[0]})
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}