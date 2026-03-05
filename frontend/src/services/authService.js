const API_BASE = 'http://localhost:4000'

/**
 * Send OTP to the given email address
 */
export async function sendOtp(email, name, phone) {
    try {
        const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, phone })
        })
        return await res.json()
    } catch (error) {
        console.error('Send OTP error:', error)
        return { success: false, error: 'Unable to connect to server. Please try again.' }
    }
}

/**
 * Verify the OTP
 */
export async function verifyOtp(email, otp) {
    try {
        const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        })
        return await res.json()
    } catch (error) {
        console.error('Verify OTP error:', error)
        return { success: false, error: 'Unable to connect to server. Please try again.' }
    }
}

/**
 * Get the current user info
 */
export async function getCurrentUser() {
    const token = localStorage.getItem('safeher_token')
    if (!token) return { success: false, error: 'Not authenticated' }

    try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        return await res.json()
    } catch (error) {
        return { success: false, error: 'Connection error' }
    }
}
