import { useState } from 'react'
import axios from 'axios'
import PageHeader from '../components/PageHeader'

const initialForm = {
  fullName: '',
  date: '',
  time: '',
  location: '',
  incidentType: '',
  description: '',
}

function SuccessMessage({ onReset }) {
  return (
    <div className="text-center py-16 fade-up">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-5 text-4xl shadow-sm">
        ✅
      </div>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Report Submitted</h2>
      <p className="text-gray-500 max-w-sm mx-auto text-sm mb-6">
        Your incident report has been securely submitted. A reference number will be sent to you.
        Please follow up with local authorities if needed.
      </p>
      <div className="flex justify-center gap-3">
        <button onClick={onReset} className="btn-primary text-sm">
          Submit Another Report
        </button>
        <a href="tel:181" className="btn-outline text-sm">
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
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState({})

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  const isValid = () => {
    return form.fullName && form.date && form.location && form.description
  }

  const getFieldError = (field) => {
    if (!touched[field]) return null
    if (!form[field]) return 'This field is required'
    return null
  }

  const handleSubmit = async () => {
    setTouched({ fullName: true, date: true, location: true, description: true })
    if (!isValid()) return

    setLoading(true)
    setError(null)

    try {
      await axios.post('http://localhost:5000/api/report', form)
      setSuccess(true)
    } catch (err) {
      setError('Failed to submit the report. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-bloom-50">
        <div className="page-container">
          <div className="glass-card p-8">
            <SuccessMessage onReset={() => { setSuccess(false); setForm(initialForm); setTouched({}) }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-pink-50">
      <div className="page-container">
        <PageHeader
          icon="📋"
          title="Report an Incident"
          subtitle="Submit a confidential incident report. All information is handled with the utmost care and privacy."
        />

        <div className="glass-card p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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

            {/* Incident Type */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Type of Incident
              </label>
              <div className="relative">
                <select
                  name="incidentType"
                  value={form.incidentType}
                  onChange={handleChange}
                  className="input-field appearance-none pr-10 cursor-pointer"
                >
                  <option value="">Select type (optional)</option>
                  <option value="harassment">Sexual Harassment</option>
                  <option value="domestic_violence">Domestic Violence</option>
                  <option value="stalking">Stalking</option>
                  <option value="workplace">Workplace Harassment</option>
                  <option value="assault">Physical Assault</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-bloom-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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
              <p className="text-xs text-gray-400 mt-1.5">
                All reports are confidential. Include as much or as little as you feel comfortable sharing.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Privacy note */}
          <div className="mt-5 p-4 bg-bloom-50 border border-bloom-100 rounded-xl flex items-start gap-3">
            <span className="text-lg flex-shrink-0">🔒</span>
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-bloom-700">Privacy assured.</strong> Your report is encrypted and handled confidentially.
              Personal details will only be shared with authorities upon your explicit consent.
            </p>
          </div>

          {/* Submit */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
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
    </div>
  )
}