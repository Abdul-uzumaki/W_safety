import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useSpeech } from '../contexts/SpeechContext'

const EMERGENCY_NUMBERS = [
  { icon: '🚔', label: 'Police', number: '112', color: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-50', border: 'border-red-200', text: 'text-red-600' },
  { icon: '💜', label: 'Women Helpline', number: '181', color: 'from-bloom-500 to-petal-500', bg: 'from-bloom-50 to-petal-50', border: 'border-bloom-200', text: 'text-bloom-600' },
  { icon: '🏥', label: 'Ambulance', number: '108', color: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-600' },
  { icon: '🔥', label: 'Fire', number: '101', color: 'from-orange-500 to-amber-500', bg: 'from-orange-50 to-amber-50', border: 'border-orange-200', text: 'text-orange-600' },
]

const TIPS = [
  { icon: '📍', tip: 'Share your live location with a trusted person immediately.' },
  { icon: '🗣️', tip: 'Make noise — scream, honk, or attract attention in public.' },
  { icon: '📸', tip: 'Safely document the situation if possible (photos, screenshots).' },
  { icon: '🏃', tip: 'Move to a populated, well-lit area as quickly as possible.' },
  { icon: '📞', tip: 'Call 112 and stay on the line — operators can trace your location.' },
]
export default function Emergency() {
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [alertSent, setAlertSent] = useState(false)
  const [alertLoading, setAlertLoading] = useState(false)
  const { speak, stop } = useSpeech()

  const handleSendAlert = () => {
    if (!contactName || !contactPhone) return
    setAlertLoading(true)
    setTimeout(() => {
      setAlertLoading(false)
      setAlertSent(true)
      setTimeout(() => setAlertSent(false), 5000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      <div className="page-container max-w-2xl">

        {/* Urgent header */}
        <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-red-500 to-rose-600 p-8 text-white text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mx-auto mb-4 text-4xl animate-pulse">
              🆘
            </div>
            <h1 className="font-display text-3xl font-bold mb-2" onMouseEnter={() => speak('Emergency Help')} onMouseLeave={stop}>
              Emergency Help
            </h1>
            <p className="text-white/80 text-sm max-w-xs mx-auto" onMouseEnter={() => speak('Stay calm. Help is available. Call the numbers below immediately.')} onMouseLeave={stop}>
              Stay calm. Help is available. Call the numbers below immediately.
            </p>
          </div>
        </div>

        {/* Big SOS Call Button */}
        <div className="text-center mb-8">
          <a
            href="tel:112"
            onMouseEnter={() => speak('Call 112 Emergency')}
            onMouseLeave={stop}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-rose-600 text-white
                       px-10 py-5 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl
                       hover:from-red-600 hover:to-rose-700 transition-all duration-200 hover:-translate-y-1
                       active:translate-y-0 animate-pulse-slow"
          >
            <span className="text-3xl">📞</span>
            Call 112 — Emergency
          </a>
          <p className="text-sm text-gray-500 mt-3">Available 24/7 · Free · All networks</p>
        </div>

        {/* Emergency Numbers Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {EMERGENCY_NUMBERS.map(item => (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              onMouseEnter={() => speak(`Call ${item.label} on ${item.number}`)}
              onMouseLeave={stop}
              className={`group flex flex-col items-center gap-2 p-5 bg-gradient-to-br ${item.bg} border ${item.border} rounded-2xl
                          hover:-translate-y-1 transition-all duration-200 hover:shadow-md cursor-pointer`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                <p className={`font-display text-2xl font-bold ${item.text}`}>{item.number}</p>
              </div>
              <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-600">Tap to call →</span>
            </a>
          ))}
        </div>

        {/* Alert Trusted Contact */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-display font-bold text-gray-800 text-lg mb-1 flex items-center gap-2" onMouseEnter={() => speak('Alert a Trusted Contact')} onMouseLeave={stop}>
            <span>📲</span> Alert a Trusted Contact
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Simulate sending an emergency alert to someone you trust.
          </p>

          <div className="space-y-3">
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Contact's name"
              className="input-field"
            />
            <input
              type="tel"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              placeholder="Contact's phone number"
              className="input-field"
            />
          </div>

          {alertSent && (
            <div className="mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2 fade-up">
              <span>✅</span>
              <span>Alert sent to <strong>{contactName}</strong>! They know you need help.</span>
            </div>
          )}

          <button
            onClick={handleSendAlert}
            disabled={!contactName || !contactPhone || alertLoading}
            onMouseEnter={() => speak('Send Emergency Alert')}
            onMouseLeave={stop}
            className="mt-4 w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {alertLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Sending Alert…
              </>
            ) : '📲 Send Emergency Alert'}
          </button>
        </div>

        {/* Safety Tips */}
        <div className="glass-card p-6">
          <h2 className="font-display font-bold text-gray-800 text-lg mb-4 flex items-center gap-2" onMouseEnter={() => speak('Immediate Safety Tips')} onMouseLeave={stop}>
            <span>⚡</span> Immediate Safety Tips
          </h2>
          <div className="space-y-3">
            {TIPS.map((item, i) => (
              <div key={i} className="flex items-start gap-3" onMouseEnter={() => speak(item.tip)} onMouseLeave={stop}>
                <span className="flex-shrink-0 text-xl leading-none mt-0.5">{item.icon}</span>
                <p className="text-sm text-gray-600 leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          MASK is not a substitute for emergency services. Always call 112 in life-threatening situations.
        </p>
      </div>
    </div>
  )
}