import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { sendOtp, verifyOtp } from '../services/authService'

export default function Login() {
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()

    // Steps: 'details' → 'otp' → 'success'
    const [step, setStep] = useState('details')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [successUser, setSuccessUser] = useState(null)

    const otpRefs = useRef([])

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) navigate('/', { replace: true })
    }, [isAuthenticated, navigate])

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    // ─── Handle Send OTP ──────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault()
        setError('')

        if (!name.trim()) return setError('Please enter your name')
        if (name.trim().length < 2) return setError('Name must be at least 2 characters')

        if (!email.trim()) return setError('Please enter your email')
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address')

        if (phone) {
            const cleanPhone = phone.replace(/\D/g, '')
            if (cleanPhone.length !== 10) return setError('Phone number must be 10 digits')
        }

        setIsLoading(true)
        try {
            const result = await sendOtp(email.trim(), name.trim(), phone.replace(/\D/g, ''))
            if (result.success) {
                setStep('otp')
                setCountdown(30)
                setError('')
            } else {
                setError(result.error || 'Failed to send OTP')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        }
        setIsLoading(false)
    }

    // ─── Handle OTP Input ─────────────────────────────
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (text.length === 6) {
            setOtp(text.split(''))
            otpRefs.current[5]?.focus()
        }
    }

    // ─── Handle Verify OTP ────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setError('')

        const otpString = otp.join('')
        if (otpString.length !== 6) return setError('Please enter the complete 6-digit OTP')

        setIsLoading(true)
        try {
            const result = await verifyOtp(email.trim(), otpString)
            if (result.success) {
                setSuccessUser(result.user)
                setStep('success')
                setTimeout(() => {
                    login(result.user, result.token)
                    navigate('/', { replace: true })
                }, 2000)
            } else {
                setError(result.error || 'Invalid OTP')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        }
        setIsLoading(false)
    }

    // ─── Resend OTP ───────────────────────────────────
    const handleResendOtp = async () => {
        if (countdown > 0) return
        setError('')
        setOtp(['', '', '', '', '', ''])

        setIsLoading(true)
        const result = await sendOtp(email.trim(), name.trim(), phone.replace(/\D/g, ''))
        if (result.success) {
            setCountdown(30)
        } else {
            setError(result.error || 'Failed to resend OTP')
        }
        setIsLoading(false)
    }

    // Mask email for display
    const maskedEmail = email ? email.slice(0, 3) + '****@' + email.split('@')[1] : ''

    return (
        <div className="login-page">
            {/* Animated background blobs */}
            <div className="login-bg">
                <div className="login-blob login-blob-1"></div>
                <div className="login-blob login-blob-2"></div>
                <div className="login-blob login-blob-3"></div>
                <div className="login-dot-pattern"></div>
            </div>

            <div className="login-container">
                {/* Left: Illustration side */}
                <div className="login-hero">
                    <div className="login-hero-content">
                        <div className="login-shield-icon">
                            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M32 4L8 16V32C8 46.4 18.4 59.2 32 62C45.6 59.2 56 46.4 56 32V16L32 4Z"
                                    fill="url(#shieldGrad)" stroke="white" strokeWidth="2" />
                                <path d="M28 38L22 32L24.8 29.2L28 32.4L39.2 21.2L42 24L28 38Z" fill="white" />
                                <defs>
                                    <linearGradient id="shieldGrad" x1="8" y1="4" x2="56" y2="62" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#ec4899" />
                                        <stop offset="1" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <h1 className="login-hero-title">SafeHer</h1>
                        <p className="login-hero-subtitle">Your safety companion — always by your side</p>
                        <div className="login-hero-features">
                            <div className="login-feature">
                                <span className="login-feature-icon">🛡️</span>
                                <span>Emergency SOS</span>
                            </div>
                            <div className="login-feature">
                                <span className="login-feature-icon">⚖️</span>
                                <span>Legal Rights</span>
                            </div>
                            <div className="login-feature">
                                <span className="login-feature-icon">💬</span>
                                <span>AI Companion</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form side */}
                <div className="login-form-side">
                    {/* ─── Step 1: Name, Email & Phone ─── */}
                    {step === 'details' && (
                        <form onSubmit={handleSendOtp} className="login-form fade-in" id="login-form-details">
                            <div className="login-form-header">
                                <h2 className="login-form-title">Welcome 🌸</h2>
                                <p className="login-form-desc">Enter your details to get started</p>
                            </div>

                            <div className="login-field-group">
                                <label htmlFor="login-name" className="login-label">
                                    <span className="login-label-icon">👤</span> Your Name
                                </label>
                                <input
                                    id="login-name"
                                    type="text"
                                    className="login-input"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    autoFocus
                                    autoComplete="name"
                                />
                            </div>

                            <div className="login-field-group">
                                <label htmlFor="login-email" className="login-label">
                                    <span className="login-label-icon">📧</span> Email Address
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    className="login-input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </div>

                            <div className="login-field-group">
                                <label htmlFor="login-phone" className="login-label">
                                    <span className="login-label-icon">📱</span> Phone Number <span className="login-optional">(optional)</span>
                                </label>
                                <div className="login-phone-wrap">
                                    <span className="login-country-code">+91</span>
                                    <input
                                        id="login-phone"
                                        type="tel"
                                        className="login-input login-phone-input"
                                        placeholder="Enter 10-digit number"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        maxLength={10}
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="login-error" role="alert">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="login-btn-primary"
                                id="login-send-otp-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="login-spinner-wrap">
                                        <span className="login-spinner"></span>
                                        Sending OTP...
                                    </span>
                                ) : (
                                    <>Send OTP →</>
                                )}
                            </button>

                            <p className="login-privacy-note">
                                🔒 OTP will be sent to your email — 100% free, no charges
                            </p>
                        </form>
                    )}

                    {/* ─── Step 2: OTP Verification ─── */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOtp} className="login-form fade-in" id="login-form-otp">
                            <div className="login-form-header">
                                <h2 className="login-form-title">Verify OTP 🔐</h2>
                                <p className="login-form-desc">
                                    We sent a 6-digit code to<br />
                                    <strong>{maskedEmail}</strong>
                                </p>
                            </div>

                            <div className="login-otp-container" onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={el => otpRefs.current[i] = el}
                                        id={`login-otp-${i}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        className={`login-otp-box ${digit ? 'filled' : ''}`}
                                        value={digit}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="login-error" role="alert">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="login-btn-primary"
                                id="login-verify-btn"
                                disabled={isLoading || otp.join('').length !== 6}
                            >
                                {isLoading ? (
                                    <span className="login-spinner-wrap">
                                        <span className="login-spinner"></span>
                                        Verifying...
                                    </span>
                                ) : (
                                    <>Verify & Continue ✓</>
                                )}
                            </button>

                            <div className="login-resend-row">
                                {countdown > 0 ? (
                                    <span className="login-resend-timer">
                                        Resend OTP in <strong>{countdown}s</strong>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        className="login-resend-btn"
                                        onClick={handleResendOtp}
                                        disabled={isLoading}
                                        id="login-resend-btn"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                className="login-back-btn"
                                onClick={() => { setStep('details'); setError(''); setOtp(['', '', '', '', '', '']) }}
                            >
                                ← Change Email
                            </button>
                        </form>
                    )}

                    {/* ─── Step 3: Success ─── */}
                    {step === 'success' && (
                        <div className="login-form login-success fade-in" id="login-success">
                            <div className="login-success-icon">
                                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="40" cy="40" r="36" fill="url(#successGrad)" />
                                    <path d="M28 42L36 50L54 32" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.6s" fill="freeze" />
                                        <set attributeName="stroke-dasharray" to="40" />
                                    </path>
                                    <defs>
                                        <linearGradient id="successGrad" x1="4" y1="4" x2="76" y2="76" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#22c55e" />
                                            <stop offset="1" stopColor="#16a34a" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <h2 className="login-success-title">Welcome, {successUser?.name}! 🎉</h2>
                            <p className="login-success-desc">Your account is verified. Redirecting you now...</p>
                            <div className="login-success-loader">
                                <div className="login-progress-bar"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}