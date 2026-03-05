import { useNavigate } from 'react-router-dom'

const features = [
  {
    path: '/chat',
    icon: '💬',
    title: 'AI Emotional Support',
    description: 'Talk to our AI companion. Share your feelings in a safe, judgment-free space.',
    gradient: 'from-pink-400 to-rose-400',
    bg: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    hover: 'hover:shadow-bloom',
    badge: 'AI Powered',
    badgeColor: 'bg-pink-100 text-pink-600',
  },
  {
    path: '/legal',
    icon: '⚖️',
    title: 'Know Your Legal Rights',
    description: 'Understand the laws that protect you. Know IPC sections, punishments & more.',
    gradient: 'from-purple-400 to-violet-400',
    bg: 'from-petal-50 to-violet-50',
    border: 'border-purple-200',
    hover: 'hover:shadow-petal',
    badge: 'Legal Info',
    badgeColor: 'bg-petal-100 text-petal-600',
  },
  {
    path: '/report',
    icon: '📋',
    title: 'Report Incident',
    description: 'Securely file an incident report. Your information is handled with care.',
    gradient: 'from-fuchsia-400 to-pink-400',
    bg: 'from-fuchsia-50 to-pink-50',
    border: 'border-fuchsia-200',
    hover: 'hover:shadow-bloom',
    badge: 'Secure',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-600',
  },
  {
    path: '/emergency',
    icon: '🆘',
    title: 'Emergency Help',
    description: 'Instant access to emergency services. One tap away when you need it most.',
    gradient: 'from-red-400 to-rose-500',
    bg: 'from-red-50 to-rose-50',
    border: 'border-red-200',
    hover: 'hover:shadow-lg hover:shadow-red-100',
    badge: 'Urgent',
    badgeColor: 'bg-red-100 text-red-600',
  },
  {
    path: '/education',
    icon: '📚',
    title: 'Safety Education',
    description: 'Learn how to file an FIR, preserve evidence & take charge of your situation.',
    gradient: 'from-bloom-400 to-petal-400',
    bg: 'from-bloom-50 to-petal-50',
    border: 'border-bloom-200',
    hover: 'hover:shadow-bloom',
    badge: 'Resources',
    badgeColor: 'bg-bloom-100 text-bloom-600',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-12 text-center relative">

          <div className="inline-flex items-center gap-2 bg-white/80 border border-pink-200 rounded-full px-4 py-1.5 text-sm text-bloom-600 font-medium mb-6 shadow-sm fade-up">
            <span className="w-2 h-2 rounded-full bg-bloom-400 animate-pulse" />
            Your safety is our priority
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-bloom-800 leading-tight mb-4 fade-up"
              style={{ animationDelay: '0.1s', opacity: 0 }}>
            You Are Not <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-bloom-500 to-petal-500">
              Alone.
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-gray-500 text-base md:text-lg leading-relaxed mb-8 fade-up"
             style={{ animationDelay: '0.2s', opacity: 0 }}>
            SafeHer is your trusted companion — offering emotional support, legal guidance,
            incident reporting, and emergency help. All in one place.
          </p>

          <div className="flex items-center justify-center gap-3 mb-2 fade-up"
               style={{ animationDelay: '0.3s', opacity: 0 }}>
            <button
              onClick={() => navigate('/chat')}
              className="btn-primary text-sm"
            >
              💬 Talk to AI Support
            </button>
            <button
              onClick={() => navigate('/emergency')}
              className="px-6 py-3 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              🆘 Emergency
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="font-display text-center text-xl font-semibold text-bloom-700 mb-8">
          How can we help you today?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => (
            <button
              key={f.path}
              onClick={() => navigate(f.path)}
              className={`group text-left bg-gradient-to-br ${f.bg} border ${f.border} rounded-2xl p-6
                          transition-all duration-300 ${f.hover} hover:-translate-y-1 cursor-pointer
                          fade-up ${f.path === '/emergency' ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              style={{ animationDelay: `${0.1 + idx * 0.07}s`, opacity: 0 }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl mb-4 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                {f.icon}
              </div>

              {/* Badge */}
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${f.badgeColor} mb-2`}>
                {f.badge}
              </span>

              <h3 className="font-display font-bold text-gray-800 text-lg leading-snug mb-2 group-hover:text-bloom-700 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-bloom-500 group-hover:gap-2 transition-all duration-200">
                Open <span>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-bloom-500 to-petal-500 p-[1px]">
          <div className="bg-white/90 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-bloom-800">Need immediate assistance?</p>
              <p className="text-sm text-gray-500 mt-0.5">Emergency services are one tap away.</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <a href="tel:112" className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-all hover:shadow-md">
                📞 112 Police
              </a>
              <a href="tel:181" className="flex items-center gap-2 bg-bloom-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-bloom-600 transition-all hover:shadow-md">
                💜 181 Helpline
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}