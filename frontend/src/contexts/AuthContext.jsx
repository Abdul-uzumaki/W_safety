// src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carries userId + purpose between step 1 and step 2
  const [pendingOTP, setPendingOTP] = useState(null);

  const isAuthenticated = !!token && !!user;

  const saveSession = (tok, usr) => {
    setToken(tok);
    setUser(usr);
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(usr));
  };

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setPendingOTP(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Auto-validate token on first load
  useEffect(() => {
    if (!token) return;
    authService.getMe(token).catch(() => clearSession());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────────────────

  const run = async (fn) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Registration ──────────────────────────────────────────────────────────

  /** Step 1: name/email/phone/password → OTP sent */
  const register = useCallback((fields) =>
    run(async () => {
      const data = await authService.register(fields);
      setPendingOTP({ userId: data.userId, purpose: 'register' });
      return data;
    }), []);

  /** Step 2: submit OTP → logged in */
  const verifyRegister = useCallback((otp) =>
    run(async () => {
      if (!pendingOTP) throw new Error('No pending registration');
      const data = await authService.verifyRegister({ userId: pendingOTP.userId, otp });
      saveSession(data.token, data.user);
      setPendingOTP(null);
      return data;
    }), [pendingOTP]);

  // ── Login ─────────────────────────────────────────────────────────────────

  /** Step 1: email/password → OTP sent */
  const login = useCallback((fields) =>
    run(async () => {
      const data = await authService.login(fields);
      setPendingOTP({ userId: data.userId, purpose: 'login' });
      return data;
    }), []);

  /** Step 2: submit OTP → logged in */
  const verifyLogin = useCallback((otp) =>
    run(async () => {
      if (!pendingOTP) throw new Error('No pending login');
      const data = await authService.verifyLogin({ userId: pendingOTP.userId, otp });
      saveSession(data.token, data.user);
      setPendingOTP(null);
      return data;
    }), [pendingOTP]);

  // ── Shared ────────────────────────────────────────────────────────────────

  const resendOTP = useCallback(() =>
    run(async () => {
      if (!pendingOTP) throw new Error('No pending OTP');
      return authService.resendOTP(pendingOTP);
    }), [pendingOTP]);

  const logout = useCallback(async () => {
    try { await authService.logout(token); } catch (_) {}
    clearSession();
  }, [token, clearSession]);

  /** Call on every page mount to log page visits */
  const logPageVisit = useCallback((page) => {
    if (token) authService.logPageVisit(token, page);
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, loading, error,
      pendingOTP,
      register, verifyRegister,
      login, verifyLogin,
      resendOTP, logout,
      logPageVisit,
      clearError: () => setError(null),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};