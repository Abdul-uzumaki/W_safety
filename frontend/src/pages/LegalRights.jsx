import { useState } from 'react'
import axios from 'axios'
import PageHeader from '../components/PageHeader'

const INCIDENT_TYPES = [
  { value: '',                   label: 'Select an incident type...' },
  { value: 'harassment',         label: '⚠️  Sexual Harassment' },
  { value: 'domestic_violence',  label: '🏠  Domestic Violence' },
  { value: 'stalking',           label: '👁️  Stalking' },
  { value: 'workplace',          label: '💼  Workplace Harassment' },
]

function InfoCard({ section }) {
  return (
    <div className="glass-card p-5 fade-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-petal-100 to-bloom-100 flex items-center justify-center">
          <span className="text-xl">{section.icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-gray-800 text-base">{section.title}</h3>
            {section.ipcSection && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-petal-100 text-petal-700">
                {section.ipcSection}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{section.description}</p>
          {section.punishment && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-0.5">Punishment</p>
              <p className="text-sm text-red-700">{section.punishment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-card p-5 animate-pulse">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-pink-100 rounded-lg" />
              <div className="h-3 w-full bg-pink-50 rounded" />
              <div className="h-3 w-3/4 bg-pink-50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LegalRights() {
  const [selected, setSelected] = useState('')
  const [legalInfo, setLegalInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = async (e) => {
    const value = e.target.value
    setSelected(value)
    setLegalInfo(null)
    setError(null)

    if (!value) return

    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/legal', { type: value })
      setLegalInfo(res.data)
    } catch (err) {
      setError('Unable to fetch legal information. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-petal-50 via-white to-pink-50">
      <div className="page-container">
        <PageHeader
          icon="⚖️"
          title="Know Your Legal Rights"
          subtitle="Select an incident type to see the relevant laws, IPC sections, and your rights under Indian law."
        />

        {/* Dropdown */}
        <div className="glass-card p-6 mb-6">
          <label className="block text-sm font-semibold text-bloom-700 mb-2">
            Incident Type
          </label>
          <div className="relative">
            <select
              value={selected}
              onChange={handleChange}
              className="input-field appearance-none pr-10 cursor-pointer font-medium"
            >
              {INCIDENT_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-bloom-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Information is sourced from Indian Penal Code (IPC) and relevant Acts.
          </p>
        </div>

        {/* Content area */}
        {loading && <Skeleton />}

        {error && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold mb-0.5">Error loading information</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {legalInfo && !loading && (
          <div className="space-y-4 fade-up">
            {/* Summary header */}
            <div className="bg-gradient-to-r from-petal-500 to-bloom-500 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">⚖️</span>
                <h2 className="font-display text-xl font-bold">
                  {legalInfo.title || 'Your Legal Rights'}
                </h2>
              </div>
              <p className="text-white/80 text-sm">
                {legalInfo.summary || 'Here are the applicable laws and sections for your situation.'}
              </p>
            </div>

            {/* Sections */}
            {(legalInfo.sections || []).map((section, i) => (
              <InfoCard key={i} section={section} />
            ))}

            {/* Helpline footer */}
            <div className="p-5 bg-bloom-50 border border-bloom-200 rounded-2xl">
              <p className="text-sm font-semibold text-bloom-700 mb-1">📞 Need help taking action?</p>
              <p className="text-sm text-gray-600">
                Call the <strong>Women Helpline: 181</strong> for free legal advice, or visit your nearest
                One Stop Centre (Sakhi). You can also use the <strong>Report Incident</strong> page to file a report.
              </p>
            </div>
          </div>
        )}

        {!selected && !loading && (
          <div className="text-center py-16 fade-up">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-petal-100 to-bloom-100 flex items-center justify-center mx-auto mb-4 text-4xl">
              ⚖️
            </div>
            <p className="font-display text-lg text-gray-400">
              Select an incident type above to get started
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Knowledge is power — know your rights.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}