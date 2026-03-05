// src/components/OTPInput.jsx

import { useState, useRef, useEffect } from 'react';

/**
 * OTPInput
 * Props:
 *   onVerify(code)   — called automatically when all 6 digits entered
 *   onResend()       — called when user clicks Resend
 *   loading          — disables inputs
 *   error            — error string shown below boxes
 *   resendCooldown   — seconds before Resend is enabled (default 60)
 */
export default function OTPInput({
  onVerify,
  onResend,
  loading = false,
  error = '',
  resendCooldown = 60,
}) {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(resendCooldown);
  const inputs = useRef([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const update = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    const code = next.join('');
    if (code.length === 6) onVerify(code);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((ch, idx) => { next[idx] = ch; });
    setDigits(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) onVerify(pasted);
  };

  const handleResend = () => {
    setDigits(Array(6).fill(''));
    setTimer(resendCooldown);
    inputs.current[0]?.focus();
    onResend();
  };

  return (
    <div className="otp-wrap">
      <div className="otp-boxes" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            className={`otp-box ${error ? 'otp-box--error' : ''} ${d ? 'otp-box--filled' : ''}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={loading}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
          />
        ))}
      </div>

      {error && <p className="otp-error">{error}</p>}

      <div className="otp-resend">
        {timer > 0 ? (
          <span className="otp-timer">
            Resend in <strong>{timer}s</strong>
          </span>
        ) : (
          <button
            type="button"
            className="otp-resend-btn"
            onClick={handleResend}
            disabled={loading}
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}