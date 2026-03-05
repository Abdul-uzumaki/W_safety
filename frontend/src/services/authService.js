// src/services/authService.js

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const handle = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
};

/**
 * Send OTP (Passwordless)
 * @param {string} phone
 * @param {string} name
 * @param {string} email
 * @param {string} guardianName
 * @param {string} guardianPhone
 */
export const sendOtp = async (phone, name, email, guardianName, guardianPhone) => {
    try {
        return await handle(await fetch(`${API_BASE}/auth/passwordless`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, name, email, guardianName, guardianPhone }),
        }));
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Verify OTP (Passwordless)
 * @param {string} phone
 * @param {string} otp
 */
export const verifyOtp = async (phone, otp) => {
    try {
        return await handle(await fetch(`${API_BASE}/auth/verify-passwordless`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp }),
        }));
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Get current user info
 */
export const getMe = async (token) => {
    return handle(await fetch(`${API_BASE}/auth/me`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }));
};

/**
 * Logout
 */
export const logout = async (token) => {
    return handle(await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }));
};
