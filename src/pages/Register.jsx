import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M1 1l22 22" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconCheck = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconX = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Background ───────────────────────────────────────────────────────────────

function BackgroundGrid() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse 55% 45% at 15% 15%, rgba(108,106,246,0.09) 0%, transparent 70%)',
            'radial-gradient(ellipse 45% 35% at 85% 85%, rgba(78,75,199,0.07) 0%, transparent 70%)',
            'radial-gradient(ellipse 35% 25% at 75% 10%, rgba(52,193,122,0.04) 0%, transparent 60%)',
          ].join(','),
        }}
      />
    </>
  );
}

// ─── Floating label input ─────────────────────────────────────────────────────
// Identical contract to Login's FloatingInput — same component, same behaviour.
// Kept inline so Register.jsx is fully self-contained (no shared file needed).

function FloatingInput({
  id, label, type = 'text', value, onChange,
  autoComplete, icon, suffix, error, success,
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  const borderColor = (() => {
    if (error)   return 'rgba(239,68,68,0.5)';
    if (success) return 'rgba(52,193,122,0.5)';
    if (focused) return 'rgba(108,106,246,0.55)';
    return 'rgba(255,255,255,0.08)';
  })();

  const shadowColor = (() => {
    if (error)   return '0 0 0 3px rgba(239,68,68,0.10)';
    if (success) return '0 0 0 3px rgba(52,193,122,0.10)';
    if (focused) return '0 0 0 3px rgba(108,106,246,0.12)';
    return 'none';
  })();

  const labelColor = (() => {
    if (floated && error)   return '#f87171';
    if (floated && success) return '#6ddfa0';
    if (floated && focused) return '#7c6af6';
    if (floated)            return '#55556a';
    return '#3a3a4a';
  })();

  return (
    <div className="relative">
      <div
        className="relative flex items-center rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: '#0e0e14',
          border: `1px solid ${borderColor}`,
          boxShadow: shadowColor,
        }}
      >
        {/* Leading icon */}
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 z-10"
          style={{
            color: error ? '#f87171' : success ? '#6ddfa0' : focused ? '#7c6af6' : '#3a3a4a',
          }}
        >
          {icon}
        </span>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "
          className={[
            'peer w-full bg-transparent',
            'pl-10 pt-5 pb-2',
            suffix ? 'pr-10' : 'pr-4',
            'text-sm text-[#e8e8f0] placeholder-transparent',
            'focus:outline-none transition-all duration-200',
          ].join(' ')}
          style={{ fontFamily: 'inherit' }}
        />

        {/* Floating label */}
        <label
          htmlFor={id}
          className={[
            'absolute left-10 pointer-events-none transition-all duration-200 origin-left select-none',
            floated
              ? 'top-2 text-[10px] font-semibold tracking-wider uppercase'
              : 'top-1/2 -translate-y-1/2 text-sm font-normal',
          ].join(' ')}
          style={{ color: labelColor }}
        >
          {label}
        </label>

        {/* Trailing — password toggle or validation tick */}
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {suffix}
          </div>
        )}
      </div>

      {/* Error / success message */}
      {error && (
        <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#f87171]">
          <IconAlert />
          {error}
        </p>
      )}
      {success && !error && (
        <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#6ddfa0]">
          <IconCheckCircle />
          {success}
        </p>
      )}
    </div>
  );
}

// ─── Password strength meter ──────────────────────────────────────────────────
// Five-segment bar that colours from red → amber → green as the password
// gets stronger. Labels communicate the current tier in plain language.

const STRENGTH_RULES = [
  { id: 'len',    label: 'En az 8 karakter',         test: (p) => p.length >= 8 },
  { id: 'upper',  label: 'Büyük harf (A-Z)',          test: (p) => /[A-Z]/.test(p) },
  { id: 'num',    label: 'Rakam (0-9)',               test: (p) => /[0-9]/.test(p) },
  { id: 'symbol', label: 'Özel karakter (!@#…)',      test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password, visible }) {
  const score = STRENGTH_RULES.filter(r => r.test(password)).length;

  const color = (() => {
    if (score <= 1) return '#ef4444';
    if (score === 2) return '#f59e0b';
    if (score === 3) return '#eab308';
    return '#34c17a';
  })();

  const label = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü'][score] ?? '';

  if (!visible || !password) return null;

  return (
    <div
      className="overflow-hidden transition-all duration-300"
      style={{ maxHeight: visible && password ? '120px' : '0', opacity: password ? 1 : 0 }}
    >
      {/* Bar segments */}
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-400"
            style={{
              background: i <= score ? color : 'rgba(255,255,255,0.06)',
              transitionDelay: `${(i - 1) * 50}ms`,
            }}
          />
        ))}
        <span
          className="text-[10px] font-semibold ml-1 w-12 flex-shrink-0 text-right leading-none"
          style={{ color, lineHeight: '4px', marginTop: '-2px' }}
        >
          {label}
        </span>
      </div>

      {/* Rule checklist */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
        {STRENGTH_RULES.map(rule => {
          const passed = rule.test(password);
          return (
            <div key={rule.id} className="flex items-center gap-1.5">
              <span
                className="flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: passed ? 'rgba(52,193,122,0.15)' : 'rgba(255,255,255,0.05)',
                  color: passed ? '#6ddfa0' : '#3a3a4a',
                }}
              >
                {passed ? <IconCheck /> : <IconX />}
              </span>
              <span
                className="text-[10px] transition-colors duration-200"
                style={{ color: passed ? '#6ddfa0' : '#3a3a4a' }}
              >
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress steps ───────────────────────────────────────────────────────────
// Visual indicator showing how many fields are complete — gives users a sense
// of progress in a multi-field form, which reduces drop-off.

function ProgressDots({ total, filled }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i < filled ? '16px' : '4px',
            height: '4px',
            background: i < filled ? '#6c6af6' : 'rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Success overlay ──────────────────────────────────────────────────────────
// After successful registration, the card fades into a confirmation state
// before redirecting — more delightful than an instant redirect.

function SuccessOverlay({ name }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-4 text-center"
      style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      {/* Animated checkmark ring */}
      <div
        className="relative flex items-center justify-center w-16 h-16 rounded-full mb-5"
        style={{
          background: 'rgba(52,193,122,0.1)',
          border: '1px solid rgba(52,193,122,0.25)',
          boxShadow: '0 0 40px rgba(52,193,122,0.2)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#34c17a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: 'checkDraw 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both' }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '1px solid rgba(52,193,122,0.3)',
            animation: 'pulseRing 1.4s ease-out infinite',
          }}
        />
      </div>

      <h2 className="text-lg font-bold text-[#e8e8f0] mb-1.5" style={{ letterSpacing: '-0.02em' }}>
        Hesabın oluşturuldu!
      </h2>
      <p className="text-[13px] text-[#55556a] max-w-[220px] leading-relaxed">
        Hoşgeldin, <span style={{ color: '#9d9cf8' }}>{name}</span>. Giriş sayfasına yönlendiriliyorsun…
      </p>

      {/* Progress bar */}
      <div
        className="mt-6 h-0.5 rounded-full overflow-hidden"
        style={{ width: '120px', background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #6c6af6, #34c17a)',
            animation: 'progressFill 2s linear both',
          }}
        />
      </div>
    </div>
  );
}

// ─── Main Register page ───────────────────────────────────────────────────────

export default function Register() {
  const navigate  = useNavigate();
  const { register } = useAuth();

  // Form values
  const [username,        setUsername]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UX
  const [showPw,          setShowPw]          = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [pwFocused,       setPwFocused]       = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [mounted,         setMounted]         = useState(false);
  const [globalError,     setGlobalError]     = useState('');

  // Per-field validation errors
  const [errors, setErrors] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });

  // Per-field success messages (shown when field passes)
  const [fieldSuccess, setFieldSuccess] = useState({
    username: '', email: '', confirmPassword: '',
  });

  // Trigger entrance animation after first paint
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  // ── Progress score (how many fields are filled and valid) ─────────────────
  const filledCount = [
    username.trim().length >= 2,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    password.length >= 8,
    confirmPassword === password && confirmPassword.length > 0,
  ].filter(Boolean).length;

  // ── Live validation on blur / change ─────────────────────────────────────
  const validateUsername = useCallback((val) => {
    if (!val.trim()) return 'Kullanıcı adı gerekli.';
    if (val.trim().length < 2) return 'En az 2 karakter olmalı.';
    if (val.trim().length > 50) return 'En fazla 50 karakter olabilir.';
    if (/\s/.test(val)) return 'Kullanıcı adı boşluk içeremez.';
    return '';
  }, []);

  const validateEmail = useCallback((val) => {
    if (!val.trim()) return 'E-posta adresi gerekli.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Geçerli bir e-posta adresi girin.';
    return '';
  }, []);

  const validatePassword = useCallback((val) => {
    if (!val) return 'Şifre gerekli.';
    if (val.length < 8) return 'En az 8 karakter olmalı.';
    return '';
  }, []);

  const validateConfirm = useCallback((val, pw) => {
    if (!val) return 'Şifrenizi onaylayın.';
    if (val !== pw) return 'Şifreler eşleşmiyor.';
    return '';
  }, []);

  // ── Handlers with live feedback ───────────────────────────────────────────
  const handleUsername = (e) => {
    const v = e.target.value;
    setUsername(v);
    if (errors.username) {
      const err = validateUsername(v);
      setErrors(p => ({ ...p, username: err }));
      setFieldSuccess(p => ({ ...p, username: err ? '' : 'Kullanıcı adı uygun.' }));
    } else {
      setFieldSuccess(p => ({ ...p, username: '' }));
    }
    if (globalError) setGlobalError('');
  };

  const handleUsernameBlur = () => {
    const err = validateUsername(username);
    setErrors(p => ({ ...p, username: err }));
    setFieldSuccess(p => ({ ...p, username: err ? '' : username.trim() ? 'Kullanıcı adı uygun.' : '' }));
  };

  const handleEmail = (e) => {
    const v = e.target.value;
    setEmail(v);
    if (errors.email) {
      const err = validateEmail(v);
      setErrors(p => ({ ...p, email: err }));
      setFieldSuccess(p => ({ ...p, email: err ? '' : 'E-posta adresi geçerli.' }));
    } else {
      setFieldSuccess(p => ({ ...p, email: '' }));
    }
    if (globalError) setGlobalError('');
  };

  const handleEmailBlur = () => {
    const err = validateEmail(email);
    setErrors(p => ({ ...p, email: err }));
    setFieldSuccess(p => ({ ...p, email: err ? '' : email.trim() ? 'E-posta adresi geçerli.' : '' }));
  };

  const handlePassword = (e) => {
    const v = e.target.value;
    setPassword(v);
    if (errors.password) setErrors(p => ({ ...p, password: validatePassword(v) }));
    // Re-validate confirm if it already has a value
    if (confirmPassword) {
      const cErr = validateConfirm(confirmPassword, v);
      setErrors(p => ({ ...p, confirmPassword: cErr }));
      setFieldSuccess(p => ({ ...p, confirmPassword: cErr ? '' : 'Şifreler eşleşiyor.' }));
    }
    if (globalError) setGlobalError('');
  };

  const handlePasswordBlur = () => {
    setErrors(p => ({ ...p, password: validatePassword(password) }));
    setPwFocused(false);
  };

  const handleConfirm = (e) => {
    const v = e.target.value;
    setConfirmPassword(v);
    const err = validateConfirm(v, password);
    setErrors(p => ({ ...p, confirmPassword: err }));
    setFieldSuccess(p => ({ ...p, confirmPassword: err ? '' : v ? 'Şifreler eşleşiyor.' : '' }));
    if (globalError) setGlobalError('');
  };

  // ── Full validation before submit ─────────────────────────────────────────
  const validateAll = () => {
    const errs = {
      username:        validateUsername(username),
      email:           validateEmail(email),
      password:        validatePassword(password),
      confirmPassword: validateConfirm(confirmPassword, password),
    };
    setErrors(errs);
    return Object.values(errs).every(e => e === '');
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setGlobalError('');
    if (!validateAll()) return;

    setLoading(true);
    try {
      // Use AuthContext register() which stores the JWT and user info
      await register(username.trim(), email.trim().toLowerCase(), password);
      setSuccess(true);
      // Redirect after the success animation completes
      setTimeout(() => navigate('/dashboard'), 2200);
    } catch (err) {
      const msg = err.response?.data?.message
        ?? 'Kayıt işlemi başarısız. Bu e-posta kullanılıyor olabilir.';
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }, [username, email, password, confirmPassword, register, navigate]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: '#0e0e14',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Scoped styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes errorShake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes checkDraw {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }

        .card-enter  { animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-1   { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) 0.08s both; }
        .fade-up-2   { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) 0.14s both; }
        .fade-up-3   { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) 0.20s both; }
        .fade-up-4   { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) 0.26s both; }
        .fade-up-5   { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
        .fade-up-6   { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) 0.38s both; }
        .fade-up-7   { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) 0.44s both; }
        .error-shake { animation: errorShake 0.4s ease both; }

        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.22);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
      `}</style>

      <BackgroundGrid />

      {/* ── Auth card ────────────────────────────────────────────────────── */}
      <div
        className={[
          'relative z-10 w-full max-w-[420px]',
          mounted ? 'card-enter' : 'opacity-0',
        ].join(' ')}
      >
        {/* Outer glow halo */}
        <div
          aria-hidden="true"
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(108,106,246,0.22) 0%, rgba(78,75,199,0.08) 50%, transparent 100%)',
            filter: 'blur(1px)',
          }}
        />

        {/* Card surface */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(19,19,26,0.96)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: [
              '0 24px 64px rgba(0,0,0,0.6)',
              '0 8px 24px rgba(0,0,0,0.4)',
              '0 0 0 1px rgba(255,255,255,0.04) inset',
            ].join(','),
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Top accent line */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(108,106,246,0.6) 50%, transparent 100%)',
            }}
          />

          <div className="px-8 py-8">

            {success ? (
              /* ── Success state ────────────────────────────────────────── */
              <SuccessOverlay name={username.trim()} />
            ) : (
              /* ── Form state ───────────────────────────────────────────── */
              <>
                {/* Header */}
                <div className={['text-center mb-7', mounted ? 'fade-up-1' : 'opacity-0'].join(' ')}>
                  {/* Logo */}
                  <div className="flex items-center justify-center mb-5">
                    <div
                      className="flex items-center justify-center w-11 h-11 rounded-xl text-white font-bold text-lg select-none"
                      style={{
                        background: 'linear-gradient(135deg, #6c6af6, #4e4bc7)',
                        boxShadow:
                          '0 4px 16px rgba(108,106,246,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
                      }}
                    >
                      N
                    </div>
                  </div>

                  <h1
                    className="text-[22px] font-bold"
                    style={{ color: '#e8e8f0', letterSpacing: '-0.03em' }}
                  >
                    Hesap oluştur
                  </h1>
                  <p className="mt-1.5 text-[13px]" style={{ color: '#55556a' }}>
                    Noyon'a katıl ve kendi çalışma alanını kur
                  </p>

                  {/* Progress dots */}
                  <div className="flex justify-center mt-4">
                    <ProgressDots total={4} filled={filledCount} />
                  </div>
                </div>

                {/* Global error */}
                {globalError && (
                  <div
                    className="flex items-start gap-2.5 mb-5 px-3.5 py-3 rounded-xl error-shake"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                    }}
                  >
                    <span className="flex-shrink-0 mt-0.5" style={{ color: '#f87171' }}>
                      <IconAlert />
                    </span>
                    <p className="text-[13px] leading-relaxed" style={{ color: '#f87171' }}>
                      {globalError}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">

                  {/* Username */}
                  <div
                    className={mounted ? 'fade-up-2' : 'opacity-0'}
                    onBlur={handleUsernameBlur}
                  >
                    <FloatingInput
                      id="reg-username"
                      label="Kullanıcı adı"
                      type="text"
                      value={username}
                      onChange={handleUsername}
                      autoComplete="username"
                      icon={<IconUser />}
                      error={errors.username}
                      success={fieldSuccess.username}
                    />
                  </div>

                  {/* Email */}
                  <div
                    className={mounted ? 'fade-up-3' : 'opacity-0'}
                    onBlur={handleEmailBlur}
                  >
                    <FloatingInput
                      id="reg-email"
                      label="E-posta adresi"
                      type="email"
                      value={email}
                      onChange={handleEmail}
                      autoComplete="email"
                      icon={<IconMail />}
                      error={errors.email}
                      success={fieldSuccess.email}
                    />
                  </div>

                  {/* Password */}
                  <div className={mounted ? 'fade-up-4' : 'opacity-0'}>
                    <FloatingInput
                      id="reg-password"
                      label="Şifre"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={handlePassword}
                      autoComplete="new-password"
                      icon={<IconLock />}
                      error={errors.password}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPw(v => !v)}
                          aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
                          className="text-[#3a3a4a] hover:text-[#9090a8] transition-colors duration-150 focus:outline-none"
                          tabIndex={-1}
                        >
                          {showPw ? <IconEyeOff /> : <IconEye />}
                        </button>
                      }
                    />
                    {/* Strength meter — shown when field has been focused */}
                    <PasswordStrength
                      password={password}
                      visible={pwFocused || password.length > 0}
                    />
                    {/* Track focus separately from FloatingInput's internal state */}
                    <input
                      type="hidden"
                      onFocus={() => setPwFocused(true)}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  </div>

                  {/* Confirm password */}
                  <div className={mounted ? 'fade-up-5' : 'opacity-0'}>
                    <FloatingInput
                      id="reg-confirm"
                      label="Şifreyi onayla"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={handleConfirm}
                      autoComplete="new-password"
                      icon={<IconLock />}
                      error={errors.confirmPassword}
                      success={fieldSuccess.confirmPassword}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowConfirm(v => !v)}
                          aria-label={showConfirm ? 'Şifreyi gizle' : 'Şifreyi göster'}
                          className="text-[#3a3a4a] hover:text-[#9090a8] transition-colors duration-150 focus:outline-none"
                          tabIndex={-1}
                        >
                          {showConfirm ? <IconEyeOff /> : <IconEye />}
                        </button>
                      }
                    />
                  </div>

                  {/* Submit */}
                  <div className={['mt-1', mounted ? 'fade-up-6' : 'opacity-0'].join(' ')}>
                    <button
                      type="submit"
                      disabled={loading}
                      className={[
                        'relative w-full flex items-center justify-center gap-2.5',
                        'h-11 rounded-xl text-white font-semibold text-sm',
                        'transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#13131a]',
                        'disabled:cursor-not-allowed',
                        loading ? '' : 'hover:brightness-110 active:scale-[0.98]',
                      ].join(' ')}
                      style={{
                        background: loading
                          ? 'rgba(108,106,246,0.4)'
                          : 'linear-gradient(135deg, #6c6af6 0%, #5350d4 100%)',
                        boxShadow: loading
                          ? 'none'
                          : '0 4px 20px rgba(108,106,246,0.35), 0 1px 0 rgba(255,255,255,0.1) inset',
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner" />
                          <span>Hesap oluşturuluyor…</span>
                        </>
                      ) : (
                        <>
                          <span>Hesap Oluştur</span>
                          <IconArrowRight />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Terms note */}
                  <p
                    className={[
                      'text-center text-[11px] leading-relaxed',
                      mounted ? 'fade-up-6' : 'opacity-0',
                    ].join(' ')}
                    style={{ color: '#2a2a36' }}
                  >
                    Kayıt olarak{' '}
                    <Link
                      to="/terms"
                      className="underline underline-offset-2 transition-colors hover:text-[#55556a]"
                      style={{ color: '#2a2a36' }}
                    >
                      kullanım şartlarını
                    </Link>
                    {' '}ve{' '}
                    <Link
                      to="/privacy"
                      className="underline underline-offset-2 transition-colors hover:text-[#55556a]"
                      style={{ color: '#2a2a36' }}
                    >
                      gizlilik politikasını
                    </Link>
                    {' '}kabul etmiş olursun.
                  </p>

                  {/* Divider */}
                  <div
                    className={[
                      'flex items-center gap-3',
                      mounted ? 'fade-up-7' : 'opacity-0',
                    ].join(' ')}
                  >
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <span className="text-[11px] font-medium" style={{ color: '#2e2e3a' }}>
                      VEYA
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>

                  {/* Login link */}
                  <p
                    className={[
                      'text-center text-[13px]',
                      mounted ? 'fade-up-7' : 'opacity-0',
                    ].join(' ')}
                    style={{ color: '#3a3a4a' }}
                  >
                    Zaten hesabın var mı?{' '}
                    <Link
                      to="/login"
                      className="font-medium transition-colors duration-150"
                      style={{ color: '#7c6af6' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#9d9cf8'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#7c6af6'; }}
                    >
                      Giriş yap
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
