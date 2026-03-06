import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-auto bg-white/80 backdrop-blur-sm border-t border-pink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-bloom-400 to-petal-400 flex items-center justify-center">
                <span className="text-white text-xs font-bold">✿</span>
              </div>
              <span className="font-display font-bold text-lg text-bloom-700">
                MA<span className="text-petal-500">SK</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              A safe space for every woman. You are seen, heard, and protected.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm text-bloom-700 mb-3 uppercase tracking-wider">Quick Links</h3>
            <div className="space-y-1.5">
              {[
                { to: '/chat', label: 'AI Emotional Support' },
                { to: '/legal', label: 'Legal Rights' },
                { to: '/report', label: 'Report Incident' },
                { to: '/education', label: 'Safety Education' },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="block text-sm text-gray-500 hover:text-bloom-500 transition-colors duration-150">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="font-semibold text-sm text-red-500 mb-3 uppercase tracking-wider">Emergency</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">🚔</span>
                <span className="text-gray-600">Police: <strong className="text-red-500">112</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">💜</span>
                <span className="text-gray-600">Women Helpline: <strong className="text-bloom-600">181</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">🏥</span>
                <span className="text-gray-600">Ambulance: <strong className="text-red-500">108</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} MASK. Built with 💜 for women everywhere.
          </p>
          <p className="text-xs text-gray-400">
            In an emergency, always call <strong>112</strong>.
          </p>
        </div>
      </div>
    </footer>
  )
}