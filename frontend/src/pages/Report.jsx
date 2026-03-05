import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import MultiSelect from '../components/MultiSelect'
import { getBnsIssues, matchIssueToBns } from '../services/legalService'
import { submitReport } from '../services/reportService'
import { useSpeech } from '../contexts/SpeechContext'
import { jsPDF } from 'jspdf'

const initialForm = {
  fullName: '',
  mobileNumber: '',
  guardianNumber: '',
  date: '',
  time: '',
  location: '',
  incidentType: [], // Changed to array for multiple selections
  description: '',
}

function SuccessMessage({ onReset, referenceId, form }) {
  const handleDownloadPDF = () => {
    const doc = new jsPDF()
    const padding = 20
    const lineHeight = 10
    let y = 30

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('Incident Report CONFIDENTIAL', 105, y, { align: 'center' })

    y += lineHeight * 2
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')

    const addLine = (label, value) => {
      doc.setFont('helvetica', 'bold')
      doc.text(`${label}:`, padding, y)
      doc.setFont('helvetica', 'normal')

      const splitValue = doc.splitTextToSize(String(value || 'N/A'), 120)
      doc.text(splitValue, padding + 50, y)
      y += (splitValue.length * 7) + 3
      if (y > 280) {
        doc.addPage()
        y = 20
      }
    }

    if (referenceId) {
      addLine('Reference ID', referenceId)
    }

    addLine('Full Name', form.fullName)
    addLine('Mobile Number', form.mobileNumber)
    addLine('Guardian Number', form.guardianNumber)
    addLine('Date of Incident', form.date)
    addLine('Time of Incident', form.time)
    addLine('Location', form.location)

    const types = form.incidentType.map(t => t.label).join(', ')
    addLine('Incident Type(s)', types)

    addLine('Description', form.description)

    doc.save(`Incident_Report_${referenceId || 'draft'}.pdf`)
  }

  return (
    <div className="text-center py-16 fade-up">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-5 text-4xl shadow-sm">
        ✅
      </div>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Report Submitted</h2>
      {referenceId && (
        <p className="text-xs font-mono bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg inline-block mb-3">
          Reference ID: <strong>{referenceId}</strong>
        </p>
      )}
      <p className="text-gray-500 max-w-sm mx-auto text-sm mb-6">
        Your incident report has been securely submitted. Please save your reference ID
        and follow up with local authorities if needed.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={onReset} className="btn-primary text-sm shadow-sm transition-all hover:shadow-md">
          Submit Another Report
        </button>
        <button onClick={handleDownloadPDF} className="btn-outline text-sm flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm transition-all hover:shadow-md">
          📄 Download PDF
        </button>
        <a href="tel:181" className="btn-outline text-sm shadow-sm transition-all hover:shadow-md">
          Call Helpline 181
        </a>
      </div>
    </div>
  )
}

export default function Report() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [referenceId, setReferenceId] = useState(null)
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState({})
  const [allIssues] = useState(getBnsIssues())
  const [selectedLaws, setSelectedLaws] = useState([])

  const [suggestions, setSuggestions] = useState([])
  const { speak, stop } = useSpeech()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleIncidentTypeChange = (selected) => {
    setForm(prev => ({ ...prev, incidentType: selected }))
    setSelectedLaws(selected)
  }

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  const applySuggestions = () => {
    if (suggestions.length === 0) return
    const newTypes = [...form.incidentType]
    suggestions.forEach(s => {
      if (!newTypes.find(t => t.id === s.id)) {
        newTypes.push(s)
      }
    })
    handleIncidentTypeChange(newTypes)
    setSuggestions([])
  }

  // Effect to suggest incident types based on description (simulated "small model")
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.description.length > 10) {
        const matches = matchIssueToBns(form.description);
        // Only suggest if not already selected
        const unselectedMatches = matches.filter(m => !form.incidentType.find(t => t.id === m.id));
        setSuggestions(unselectedMatches);
      } else {
        setSuggestions([])
      }
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [form.description, form.incidentType])

  const isValid = () => {
    return form.fullName && form.mobileNumber && form.date && form.location && form.description
  }

  const getFieldError = (field) => {
    if (!touched[field]) return null
    if (!form[field]) return 'This field is required'
    return null
  }

  const handleSubmit = async () => {
    setTouched({ fullName: true, mobileNumber: true, date: true, location: true, description: true })
    if (!isValid()) return

    setLoading(true)
    setError(null)

    try {
      const payload = {
        ...form,
        incidentType: form.incidentType.map(it => it.id)
      }
      const result = await submitReport(payload)
      setReferenceId(result.referenceId || null)
      setSuccess(true)
    } catch (err) {
      console.error('Report submission error:', err)
      setError('Failed to submit the report. Please ensure the backend server is running and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-bloom-50">
        <div className="page-container">
          <div className="glass-card p-8">
            <SuccessMessage
              referenceId={referenceId}
              form={form}
              onReset={() => { setSuccess(false); setForm(initialForm); setTouched({}); setSelectedLaws([]); setReferenceId(null) }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-pink-50 pb-20">
      <div className="page-container">
        <PageHeader
          icon="📋"
          title="Report an Incident"
          subtitle="Submit a confidential incident report. All information is handled with the utmost care and privacy."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" onMouseEnter={() => speak('Full Name')} onMouseLeave={stop}>
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Your full name"
                    className={`input-field ${getFieldError('fullName') ? 'border-red-300 focus:ring-red-300' : ''}`}
                  />
                  {getFieldError('fullName') && (
                    <p className="text-xs text-red-500 mt-1">{getFieldError('fullName')}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" onMouseEnter={() => speak('Mobile Number')} onMouseLeave={stop}>
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="E.g., +91 9876543210"
                    className={`input-field ${getFieldError('mobileNumber') ? 'border-red-300 focus:ring-red-300' : ''}`}
                  />
                  {getFieldError('mobileNumber') && (
                    <p className="text-xs text-red-500 mt-1">{getFieldError('mobileNumber')}</p>
                  )}
                </div>

                {/* Guardian's Mobile Number */}
                <div className="sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" onMouseEnter={() => speak("Guardian's Mobile Number")} onMouseLeave={stop}>
                    Guardian's Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="guardianNumber"
                    value={form.guardianNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="E.g., +91 9876543210"
                    className="input-field"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">For emergency contact (e.g., suicide or severe depression risks).</p>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" onMouseEnter={() => speak('Date of Incident')} onMouseLeave={stop}>
                    Date of Incident <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input-field ${getFieldError('date') ? 'border-red-300' : ''}`}
                  />
                  {getFieldError('date') && (
                    <p className="text-xs text-red-500 mt-1">{getFieldError('date')}</p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" onMouseEnter={() => speak('Time of Incident')} onMouseLeave={stop}>
                    Time of Incident
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                {/* Location */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" onMouseEnter={() => speak('Location')} onMouseLeave={stop}>
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Where did the incident occur?"
                    className={`input-field ${getFieldError('location') ? 'border-red-300' : ''}`}
                  />
                  {getFieldError('location') && (
                    <p className="text-xs text-red-500 mt-1">{getFieldError('location')}</p>
                  )}
                </div>

                {/* Incident Type - Multi Select */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" onMouseEnter={() => speak('Type of Incidents')} onMouseLeave={stop}>
                    Type of Incident(s)
                  </label>
                  <MultiSelect
                    options={allIssues}
                    selected={form.incidentType}
                    onChange={handleIncidentTypeChange}
                    placeholder="Select multiple incident types (e.g. Stalking, Harassment)"
                  />

                  {suggestions.length > 0 && (
                    <div className="mt-2.5 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="animate-pulse">✨</span> AI Suggestion
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {suggestions.map(s => (
                            <span key={s.id} className="text-[10px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-indigo-100 italic">
                              {s.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={applySuggestions}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline uppercase tracking-wider"
                      >
                        Apply all
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5" onMouseEnter={() => speak('Description')} onMouseLeave={stop}>
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={5}
                    placeholder="Describe what happened in as much detail as you're comfortable sharing…"
                    className={`input-field resize-none leading-relaxed ${getFieldError('description') ? 'border-red-300' : ''}`}
                  />
                  {getFieldError('description') && (
                    <p className="text-xs text-red-500 mt-1">{getFieldError('description')}</p>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Mobile Legal Summary */}
              {selectedLaws.length > 0 && (
                <div className="lg:hidden mt-8 p-5 bg-gradient-to-br from-bloom-50 to-white rounded-2xl border border-bloom-100 shadow-sm fade-in">
                  <h3 className="flex items-center gap-2 font-display font-bold text-gray-800 mb-4">
                    <span className="text-xl">⚖️</span> Legal Guidance Summary
                  </h3>
                  <div className="space-y-4">
                    {selectedLaws.map(law => (
                      <div key={law.id} className="pb-3 border-b border-bloom-50 last:border-0">
                        <div className="text-xs font-bold text-bloom-600 mb-1">Section {law.section}: {law.label}</div>
                        <div className="text-[10px] text-gray-500 mb-2">{law.description}</div>
                        {law.filingSteps && (
                          <div className="bg-white/50 p-2 rounded-lg border border-indigo-50">
                            <p className="text-[9px] font-bold text-indigo-600 uppercase mb-1">Steps to Report:</p>
                            <ul className="list-disc list-inside text-[9px] text-gray-600 space-y-1">
                              {law.filingSteps.slice(0, 3).map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  onMouseEnter={() => speak('Submit Report')}
                  onMouseLeave={stop}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <>📋 Submit Report</>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center sm:text-left">
                  Fields marked <span className="text-red-400 font-bold">*</span> are required
                </p>
              </div>
            </div>
          </div>

          {/* Legal Guidance Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`glass-card p-6 border-l-4 border-l-bloom-500 transition-all duration-500 ${selectedLaws.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-60 grayscale'}`}>
              <h3 className="flex items-center gap-2 font-display font-bold text-gray-800 mb-4">
                <span className="text-xl">⚖️</span> BNS Legal Guidance
              </h3>

              {selectedLaws.length === 0 ? (
                <p className="text-xs text-gray-500 leading-relaxed italic">
                  Select incident types to see related sections from the Bharatiya Nyaya Sanhita (BNS) and steps to file a complaint.
                </p>
              ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedLaws.map(law => (
                    <div key={law.id} className="p-4 bg-white rounded-xl border border-bloom-100 shadow-sm fade-in hover:border-bloom-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-bloom-600 bg-bloom-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Section {law.section}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 mb-2">{law.label}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        {law.description}
                      </p>

                      {law.filingSteps && (
                        <div className="mt-3 pt-3 border-t border-bloom-50">
                          <h5 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <span className="text-sm">📝</span> How to file complaint:
                          </h5>
                          <ul className="space-y-2">
                            {law.filingSteps.map((step, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-indigo-400 text-[10px] mt-0.5">•</span>
                                <p className="text-[11px] text-gray-600 leading-tight">{step}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-bloom-50">
                        <div className="flex items-start gap-1.5">
                          <span className="text-xs">🔨</span>
                          <p className="text-[10px] text-gray-500 italic">
                            <span className="font-semibold text-gray-600 uppercase">Punishment:</span> {law.punishment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-bloom-400 text-center uppercase tracking-widest font-bold pt-2">
                    Bharatiya Nyaya Sanhita 2023
                  </p>
                </div>
              )}
            </div>


            {/* Privacy note */}
            <div className="glass-card p-5 bg-gradient-to-br from-bloom-50 to-white">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-lg flex-shrink-0">🔒</span>
                <h4 className="text-sm font-bold text-gray-800">Privacy & Confidentiality</h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your report is encrypted and handled confidentially.
                Personal details will only be shared with authorities upon your explicit consent.
              </p>
            </div>

            <div className="glass-card p-5 bg-gradient-to-br from-indigo-50 to-white">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-lg flex-shrink-0">📜</span>
                <h4 className="text-sm font-bold text-gray-800">Disclaimer</h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                The information provided is based on the Bharatiya Nyaya Sanhita (BNS).
                It is for educational purposes and does not constitute legal advice.
                Please consult a qualified legal professional for your specific case.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
