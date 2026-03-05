import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useSpeech } from '../contexts/SpeechContext'
import { getBnsIssues } from '../services/legalService'

// The local BNS dataset already has all the relevant data.
// We group issues by a simple keyword → incident type mapping.
const INCIDENT_TYPES = [
  { value: '', label: 'Select an incident type...' },
  { value: 'harassment', label: '⚠️  Sexual Harassment' },
  { value: 'domestic_violence', label: '🏠  Domestic Violence' },
  { value: 'stalking', label: '👁️  Stalking' },
  { value: 'workplace', label: '💼  Workplace Harassment' },
]

// Keywords that match BNS issues to each incident category
const CATEGORY_KEYWORDS = {
  harassment: ['harassment', 'assault', 'modesty', 'voyeur', 'word', 'gesture', 'privacy'],
  domestic_violence: ['dowry', 'cruelty', 'wife', 'husband', 'domestic', 'miscarriage', 'grievous'],
  stalking: ['stalking', 'follow', 'monitor', 'contact'],
  workplace: ['workplace', 'harassment', 'sexual favour', 'hostile', 'posh'],
}

// Category titles and summaries displayed above the cards
const CATEGORY_META = {
  harassment: {
    title: 'Sexual Harassment',
    summary: 'Sexual harassment is a criminal offence. You have a right to a safe environment at work, in public, and online.',
  },
  domestic_violence: {
    title: 'Domestic Violence',
    summary: 'Domestic violence — physical, emotional, sexual or economic abuse — is illegal under Indian law. You can seek protection orders and shelter.',
  },
  stalking: {
    title: 'Stalking',
    summary: 'Stalking — repeatedly following or contacting someone against their will — is a cognisable offence under the Bharatiya Nyaya Sanhita.',
  },
  workplace: {
    title: 'Workplace Harassment',
    summary: 'Every woman has the right to a safe, dignified workplace. The POSH Act 2013 mandates employer action against sexual harassment.',
  },
}

function getIssuesForCategory(category) {
  const allIssues = getBnsIssues()
  const keywords = CATEGORY_KEYWORDS[category] || []
  return allIssues.filter(issue => {
    const hay = `${issue.label} ${issue.description}`.toLowerCase()
    return keywords.some(kw => hay.includes(kw))
  }).slice(0, 4)  // Show at most 4 relevant sections
}

function InfoCard({ issue }) {
  const { speak, stop } = useSpeech()

  return (
    <div
      className="glass-card p-5 fade-up"
      onMouseEnter={() => speak(`${issue.label}. ${issue.description}`)}
      onMouseLeave={stop}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-petal-100 to-bloom-100 flex items-center justify-center">
          <span className="text-xl">⚖️</span>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-gray-800 text-base">{issue.label}</h3>
            {issue.section && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-petal-100 text-petal-700">
                BNS § {issue.section}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>
          {issue.punishment && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-0.5">Punishment</p>
              <p className="text-sm text-red-700">{issue.punishment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LegalRights() {
  const [selected, setSelected] = useState('')
  const { speak, stop } = useSpeech()

  const meta = selected ? CATEGORY_META[selected] : null
  const issues = selected ? getIssuesForCategory(selected) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-petal-50 via-white to-pink-50">
      <div className="page-container">
        <PageHeader
          icon="⚖️"
          title="Know Your Legal Rights"
          subtitle="Select an incident type to see the relevant laws, BNS sections, and your rights under Indian law."
        />

        {/* Dropdown */}
        <div className="glass-card p-6 mb-6">
          <label
            className="block text-sm font-semibold text-bloom-700 mb-2"
            onMouseEnter={() => speak('Select Incident Type')}
            onMouseLeave={stop}
          >
            Incident Type
          </label>
          <div className="relative">
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
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
            Information is sourced from the Bharatiya Nyaya Sanhita (BNS) 2023.
          </p>
        </div>

        {/* Results */}
        {selected && meta && (
          <div className="space-y-4 fade-up">
            {/* Summary header */}
            <div className="bg-gradient-to-r from-petal-500 to-bloom-500 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">⚖️</span>
                <h2 className="font-display text-xl font-bold">{meta.title}</h2>
              </div>
              <p className="text-white/80 text-sm">{meta.summary}</p>
            </div>

            {/* BNS cards */}
            {issues.length > 0
              ? issues.map((issue, i) => <InfoCard key={i} issue={issue} />)
              : (
                <div className="glass-card p-6 text-center text-gray-500 text-sm">
                  No specific BNS sections found. Please consult a legal professional.
                </div>
              )
            }

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

        {!selected && (
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