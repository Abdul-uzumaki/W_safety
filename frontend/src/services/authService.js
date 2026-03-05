// src/services/authService.js

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// ── Registration (2 steps) ─────────────────────────────────────────────────

/**
 * Step 1 — send name/email/phone/password → backend creates user + sends OTP
 * @returns { userId, message, channels }
 */
export const register = async ({ name, email, phone, password }) =>
  handle(await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password }),
  }));

/**
 * Step 2 — submit OTP code → backend verifies and issues JWT
 * @returns { token, user }
 */
export const verifyRegister = async ({ userId, otp }) =>
  handle(await fetch(`${API}/auth/verify-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp }),
  }));

// ── Login (2 steps) ────────────────────────────────────────────────────────

/**
 * Step 1 — send email/password → backend validates + sends OTP
 * @returns { userId, message, channels }
 */
export const login = async ({ email, password }) =>
  handle(await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));

/**
 * Step 2 — submit OTP code → backend issues JWT
 * @returns { token, user }
 */
export const verifyLogin = async ({ userId, otp }) =>
  handle(await fetch(`${API}/auth/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp }),
  }));

// ── OTP utilities ──────────────────────────────────────────────────────────

/** Resend OTP for 'register' or 'login' purpose */
export const resendOTP = async ({ userId, purpose }) =>
  handle(await fetch(`${API}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, purpose }),
  }));

// ── Session ────────────────────────────────────────────────────────────────

export const logout = async (token) =>
  handle(await fetch(`${API}/auth/logout`, {
    method: 'POST',
    headers: authHeaders(token),
  }));

export const getMe = async (token) =>
  handle(await fetch(`${API}/auth/me`, {
    headers: authHeaders(token),
  }));

// ── Activity logging (silent — never breaks app) ───────────────────────────

export const logPageVisit = async (token, page) => {
  try {
    await fetch(`${API}/activity/page-visit`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ page }),
    });
  } catch (_) {}
};