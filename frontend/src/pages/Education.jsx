import PageHeader from '../components/PageHeader'
import { useSpeech } from '../contexts/SpeechContext'

const SECTIONS = [
  {
    id: 'fir',
    icon: '📄',
    title: 'How to File an FIR',
    color: 'from-bloom-500 to-petal-500',
    bg: 'from-bloom-50 to-petal-50',
    border: 'border-bloom-200',
    steps: [
      { step: '1', text: 'Visit the nearest police station. If unable to visit, you can file an e-FIR online through your state police portal.' },
      { step: '2', text: 'Approach the Station House Officer (SHO) or duty officer. Clearly state that you want to file an FIR — they cannot refuse.' },
      { step: '3', text: 'Narrate the incident clearly: who, what, when, and where. Include as many details as possible.' },
      { step: '4', text: 'Ensure the FIR is written in your language or one you understand. Read it carefully before signing.' },
      { step: '5', text: 'Get a free copy of the FIR. This is your legal right under Section 154 CrPC. Keep it safe.' },
      { step: '6', text: 'If police refuse to register an FIR, complain to the Superintendent of Police or file a complaint before a Magistrate (Section 156(3) CrPC).' },
    ],
  },
  {
    id: 'evidence',
    icon: '🔍',
    title: 'Preserve Evidence',
    color: 'from-fuchsia-500 to-pink-500',
    bg: 'from-fuchsia-50 to-pink-50',
    border: 'border-fuchsia-200',
    steps: [
      { step: '✓', text: 'Do not wash clothes or clean yourself immediately after an assault — this preserves DNA and physical evidence.' },
      { step: '✓', text: 'Screenshot all threatening messages, emails, and social media posts. Note the date and time.' },
      { step: '✓', text: "Save call logs with the perpetrator's number Do not block them until evidence is secured." },
      { step: '✓', text: 'Photograph injuries, marks, or damaged property with timestamps enabled.' },
      { step: '✓', text: 'Write down a detailed account of events while memory is fresh — include witnesses if any.' },
      { step: '✓', text: 'Visit a government hospital for medical examination. Request a medico-legal certificate (MLC).' },
    ],
  },
  {
    id: 'rights',
    icon: '🛡️',
    title: 'Know Your Rights',
    color: 'from-petal-500 to-violet-500',
    bg: 'from-petal-50 to-violet-50',
    border: 'border-petal-200',
    steps: [
      { step: '⚖', text: 'You have the right to file an FIR at any police station, regardless of where the incident occurred (Zero FIR).' },
      { step: '⚖', text: 'Statement of a sexual assault survivor must be recorded by a female police officer.' },
      { step: '⚖', text: 'You cannot be called to a police station at night (after sunset / before sunrise) — Section 160 CrPC.' },
      { step: '⚖', text: 'Right to free legal aid: Contact the District Legal Services Authority (DLSA) for a free lawyer.' },
      { step: '⚖', text: 'Protection Orders are available under DV Act, 2005 — you can get an ex-parte (one-sided) order quickly.' },
      { step: '⚖', text: 'You have the right to anonymity. Your name and address cannot be published in media.' },
    ],
  },
  {
    id: 'post',
    icon: '🌱',
    title: 'Post-Incident Steps',
    color: 'from-green-500 to-emerald-500',
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    steps: [
      { step: '→', text: 'Reach out to a trusted friend, family member, or counsellor. You should not go through this alone.' },
      { step: '→', text: 'Contact an NGO like iCall, Snehi, or iDare for free psychological support and legal guidance.' },
      { step: '→', text: 'Visit a One Stop Centre (Sakhi) — available in every district, offering medical, legal & psychological help.' },
      { step: '→', text: 'Track your FIR status online via your state police portal using your FIR number.' },
      { step: '→', text: 'Keep all documents safe: FIR copy, medical reports, screenshots, and correspondence.' },
      { step: '→', text: 'Follow up regularly with the investigating officer and note every interaction for your records.' },
    ],
  },
]

function SectionCard({ section }) {
  const { speak, stop } = useSpeech()

  return (
    <div className={`glass-card overflow-hidden mb-6 fade-up`} id={section.id}>
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${section.bg} border-b ${section.border} px-6 py-5 flex items-center gap-3`}
        onMouseEnter={() => speak(section.title)}
        onMouseLeave={stop}
      >
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-xl shadow-sm`}>
          {section.icon}
        </div>
        <h2 className="font-display text-xl font-bold text-gray-800">{section.title}</h2>
      </div>

      {/* Steps */}
      <div className="px-6 py-5 space-y-4">
        {section.steps.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-4"
            onMouseEnter={() => speak(`Step ${item.step}. ${item.text}`)}
            onMouseLeave={stop}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center text-white text-xs font-bold shadow-sm mt-0.5`}>
              {item.step}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pt-1.5">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Education() {
  const { speak, stop } = useSpeech()

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloom-50 via-white to-petal-50">
      <div className="page-container">
        <PageHeader
          icon="📚"
          title="Safety Education"
          subtitle="Practical, actionable knowledge to help you navigate difficult situations with confidence and clarity."
        />

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onMouseEnter={() => speak(`Jump to ${s.title}`)}
              onMouseLeave={stop}
              className="text-sm font-medium px-4 py-2 bg-white/80 border border-pink-200 rounded-full text-gray-600 hover:text-bloom-600 hover:border-bloom-300 hover:bg-bloom-50 transition-all duration-200"
            >
              {s.icon} {s.title}
            </a>
          ))}
        </div>

        {/* Content */}
        {SECTIONS.map(section => (
          <SectionCard key={section.id} section={section} />
        ))}

        {/* Helpline footer */}
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-bloom-500 to-petal-500 p-[1px]">
          <div className="bg-white/95 rounded-2xl px-6 py-6">
            <h3 className="font-display font-bold text-bloom-800 text-lg mb-3 flex items-center gap-2">
              <span>📞</span> Key Helpline Numbers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Police', number: '112' },
                { label: 'Women Helpline', number: '181' },
                { label: 'Ambulance', number: '108' },
                { label: 'Child Helpline', number: '1098' },
                { label: 'Cyber Crime', number: '1930' },
                { label: 'iCall (Counselling)', number: '9152987821' },
              ].map(item => (
                <a key={item.number} href={`tel:${item.number}`}
                  onMouseEnter={() => speak(`Call ${item.label} on ${item.number}`)}
                  onMouseLeave={stop}
                  className="flex items-center gap-2 p-3 bg-bloom-50 border border-bloom-100 rounded-xl hover:bg-bloom-100 transition-colors">
                  <span className="text-lg">📞</span>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-bold text-bloom-700 text-sm">{item.number}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 pb-4">
          Information is based on Indian law and government resources. For specific legal advice, consult a qualified lawyer.
        </p>
      </div>
    </div>
  )
}