import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const navItems = [
  { path: '/',           label: 'Home' },
  { path: '/chat',       label: 'Support' },
  { path: '/legal',      label: 'Legal' },
  { path: '/report',     label: 'Report' },
  { path: '/emergency',  label: 'Emergency' },
  { path: '/education',  label: 'Education' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bloom-400 to-petal-400 flex items-center justify-center shadow-bloom group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-sm font-bold">✿</span>
            </div>
            <span className="font-display font-bold text-xl text-bloom-700 tracking-tight">
              Safe<span className="text-petal-500">Her</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              item.path === '/emergency' ? (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="ml-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 hover:shadow-md"
                >
                  🆘 Emergency
                </NavLink>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
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
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-bloom-500 hover:bg-pink-50 transition"
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

      {/* Mobile drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-4 pb-4 pt-1 space-y-1 border-t border-pink-100 bg-white/95">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setOpen(false)}
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
        </div>
      </div>
    </nav>
  )
}