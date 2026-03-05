import { useSpeech } from '../contexts/SpeechContext'

export default function PageHeader({ icon, title, subtitle, accentColor = 'bloom' }) {
  const { speak, stop } = useSpeech()
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-bloom-50 via-white to-petal-50 border border-pink-100 p-8">
      {/* Decorative blobs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-bloom-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-petal-100/50 blur-3xl pointer-events-none" />

      <div className="relative flex items-start gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-bloom-400 to-petal-500 flex items-center justify-center shadow-bloom text-2xl">
          {icon}
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-bloom-800 leading-tight" onMouseEnter={() => speak(title)} onMouseLeave={stop}>{title}</h1>
          {subtitle && <p className="mt-1 text-sm md:text-base text-gray-500 max-w-xl" onMouseEnter={() => speak(subtitle)} onMouseLeave={stop}>{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}