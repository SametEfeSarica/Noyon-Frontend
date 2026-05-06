import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

// ─── Inline SVG atoms ─────────────────────────────────────────────────────────
// No icon-font dependency. Each icon is a pure SVG so the page renders
// correctly even before any web fonts load.

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
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Floating-label input ─────────────────────────────────────────────────────
// The label starts inside the input box and floats up on focus or when a value
// is present. This technique reduces visual noise (no separate label row) while
// preserving accessibility — the label is always visible and associated with the
// input via htmlFor/id.

function FloatingInput({
  id, label, type = 'text', value, onChange,
  autoComplete, icon, suffix, error,
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
      {/* Input container */}
      <div
        className="relative flex items-center rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: '#0e0e14',
          border: `1px solid ${
            error    ? 'rgba(239,68,68,0.5)' :
            focused  ? 'rgba(108,106,246,0.55)' :
                       'rgba(255,255,255,0.08)'
          }`,
          boxShadow: error
            ? '0 0 0 3px rgba(239,68,68,0.1)'
            : focused
            ? '0 0 0 3px rgba(108,106,246,0.12)'
            : 'none',
        }}
      >
        {/* Leading icon */}
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 z-10"
          style={{ color: focused ? '#7c6af6' : '#3a3a4a' }}
        >
          {icon}
        </span>

        {/* Native input */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "       // space keeps :placeholder-shown reliable
          className={[
            'peer w-full bg-transparent',
            'pl-10 pr-4 pt-5 pb-2',
            'text-sm text-[#e8e8f0] placeholder-transparent',
            'focus:outline-none',
            'transition-all duration-200',
            suffix ? 'pr-10' : 'pr-4',
          ].join(' ')}
          style={{ fontFamily: 'inherit' }}
        />

        {/* Floating label — transforms via CSS when peer has value */}
        <label
          htmlFor={id}
          className={[
            'absolute left-10 pointer-events-none',
            'transition-all duration-200 origin-left',
            'select-none',
            floated
              ? 'top-2 text-[10px] font-semibold tracking-wider uppercase'
              : 'top-1/2 -translate-y-1/2 text-sm font-normal',
          ].join(' ')}
          style={{
            color: floated
              ? (focused ? '#7c6af6' : '#55556a')
              : '#3a3a4a',
          }}
        >
          {label}
        </label>

        {/* Trailing element (password toggle, etc.) */}
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>

      {/* Inline error */}
      {error && (
        <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#f87171]">
          <IconAlert />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Animated background grid ─────────────────────────────────────────────────
// A subtle dot-grid pattern that gives the page atmosphere without competing
// with the card. Pure CSS — zero JS overhead.

function BackgroundGrid() {
  return (
    <>
      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Ambient radial glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 20% 20%, rgba(108,106,246,0.09) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 40% at 80% 80%, rgba(78,75,199,0.07) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 30% at 50% 100%, rgba(52,193,122,0.04) 0%, transparent 60%)',
          ].join(','),
        }}
      />
    </>
  );
}

// ─── Check box ────────────────────────────────────────────────────────────────

function Checkbox({ id, checked, onChange, label }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2.5 cursor-pointer group select-none"
    >
      <span
        role="checkbox"
        aria-checked={checked}
        className={[
          'flex-shrink-0 w-4 h-4 rounded flex items-center justify-center',
          'border transition-all duration-150',
          checked
            ? 'bg-[#6c6af6] border-[#6c6af6]'
            : 'bg-transparent border-[rgba(255,255,255,0.14)] group-hover:border-[rgba(108,106,246,0.5)]',
        ].join(' ')}
        onClick={() => onChange(!checked)}
      >
        {checked && <IconCheck />}
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-[13px] text-[#6a6a7a] group-hover:text-[#9090a8] transition-colors duration-150">
        {label}
      </span>
    </label>
  );
}

// ─── Main Login page ──────────────────────────────────────────────────────────

export default function Login() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  // Form state
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [rememberMe,  setRememberMe]  = useState(false);

  // UX state
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [mounted,     setMounted]     = useState(false);

  // Trigger enter animation after first paint
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  // Pre-fill from localStorage if remember-me was used before
  useEffect(() => {
    const saved = localStorage.getItem('noyon_saved_email');
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = { email: '', password: '' };
    let ok = true;
    if (!email.trim()) {
      errs.email = 'E-posta adresi gerekli.'; ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Geçerli bir e-posta adresi girin.'; ok = false;
    }
    if (!password) {
      errs.password = 'Şifre gerekli.'; ok = false;
    } else if (password.length < 6) {
      errs.password = 'Şifre en az 6 karakter olmalı.'; ok = false;
    }
    setFieldErrors(errs);
    return ok;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      if (rememberMe) localStorage.setItem('noyon_saved_email', email.trim().toLowerCase());
      else            localStorage.removeItem('noyon_saved_email');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'E-posta veya şifre hatalı.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, login, navigate]);

  // Clear field error on change
  const handleEmail = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: '' }));
    if (error) setError('');
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: '' }));
    if (error) setError('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: '#0e0e14',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Scoped keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }

        .card-enter    { animation: cardIn  0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-1     { animation: fadeUp  0.4s cubic-bezier(0.22,1,0.36,1) 0.08s both; }
        .fade-up-2     { animation: fadeUp  0.4s cubic-bezier(0.22,1,0.36,1) 0.16s both; }
        .fade-up-3     { animation: fadeUp  0.4s cubic-bezier(0.22,1,0.36,1) 0.24s both; }
        .fade-up-4     { animation: fadeUp  0.4s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
        .fade-up-5     { animation: fadeUp  0.4s cubic-bezier(0.22,1,0.36,1) 0.40s both; }
        .error-shake   { animation: errorShake 0.4s ease both; }

        .btn-shimmer {
          background: linear-gradient(
            90deg,
            #6c6af6 0%,
            #8b89f8 45%,
            #6c6af6 55%,
            #5350d4 100%
          );
          background-size: 200% auto;
          animation: shimmer 2.4s linear infinite;
        }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
      `}</style>

      {/* Background layer */}
      <BackgroundGrid />

      {/* ── Auth card ──────────────────────────────────────────────────────── */}
      <div
        className={[
          'relative z-10 w-full max-w-[400px]',
          mounted ? 'card-enter' : 'opacity-0',
        ].join(' ')}
      >
        {/* Outer glow ring behind the card */}
        <div
          aria-hidden="true"
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(108,106,246,0.25) 0%, rgba(78,75,199,0.1) 50%, transparent 100%)',
            filter: 'blur(1px)',
          }}
        />

        {/* Card surface */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(19,19,26,0.95)',
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

          <div className="px-8 py-9">

            {/* ── Logo + headline ─────────────────────────────────────────── */}
            <div className={['text-center mb-8', mounted ? 'fade-up-1' : 'opacity-0'].join(' ')}>
              {/* Logo mark */}
              <div className="flex items-center justify-center mb-5">
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-xl text-white font-bold text-lg select-none"
                  style={{
                    background: 'linear-gradient(135deg, #6c6af6, #4e4bc7)',
                    boxShadow: '0 4px 16px rgba(108,106,246,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
                  }}
                >
                  N
                </div>
              </div>

              <h1
                className="text-[22px] font-bold tracking-tight"
                style={{ color: '#e8e8f0', letterSpacing: '-0.03em' }}
              >
                Tekrar hoşgeldin
              </h1>
              <p className="mt-1.5 text-[13px]" style={{ color: '#55556a' }}>
                Noyon hesabına giriş yap
              </p>
            </div>

            {/* ── Global error banner ──────────────────────────────────────── */}
            {error && (
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
                  {error}
                </p>
              </div>
            )}

            {/* ── Form ─────────────────────────────────────────────────────── */}
            <form onSubmit={handleLogin} noValidate className="flex flex-col gap-3.5">

              {/* Email */}
              <div className={mounted ? 'fade-up-2' : 'opacity-0'}>
                <FloatingInput
                  id="login-email"
                  label="E-posta adresi"
                  type="email"
                  value={email}
                  onChange={handleEmail}
                  autoComplete="email"
                  icon={<IconMail />}
                  error={fieldErrors.email}
                />
              </div>

              {/* Password */}
              <div className={mounted ? 'fade-up-3' : 'opacity-0'}>
                <FloatingInput
                  id="login-password"
                  label="Şifre"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={handlePassword}
                  autoComplete="current-password"
                  icon={<IconLock />}
                  error={fieldErrors.password}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
                      className="text-[#3a3a4a] hover:text-[#9090a8] transition-colors duration-150 focus:outline-none focus-visible:text-[#7c6af6]"
                    >
                      {showPw ? <IconEyeOff /> : <IconEye />}
                    </button>
                  }
                />
              </div>

              {/* Remember me + Forgot password */}
              <div
                className={[
                  'flex items-center justify-between mt-0.5',
                  mounted ? 'fade-up-4' : 'opacity-0',
                ].join(' ')}
              >
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onChange={setRememberMe}
                  label="Beni hatırla"
                />
                <Link
                  to="/forgot-password"
                  className="text-[13px] transition-colors duration-150"
                  style={{ color: '#55556a' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#7c6af6'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#55556a'; }}
                >
                  Şifremi unuttum
                </Link>
              </div>

              {/* Submit */}
              <div className={['mt-2', mounted ? 'fade-up-5' : 'opacity-0'].join(' ')}>
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
                      <span>Giriş yapılıyor…</span>
                    </>
                  ) : (
                    <>
                      <span>Giriş Yap</span>
                      <IconArrowRight />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* ── Divider ──────────────────────────────────────────────────── */}
            <div
              className={['flex items-center gap-3 my-6', mounted ? 'fade-up-5' : 'opacity-0'].join(' ')}
            >
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[11px] font-medium" style={{ color: '#2e2e3a' }}>
                VEYA
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* ── Register link ─────────────────────────────────────────────── */}
            <p
              className={[
                'text-center text-[13px]',
                mounted ? 'fade-up-5' : 'opacity-0',
              ].join(' ')}
              style={{ color: '#3a3a4a' }}
            >
              Hesabın yok mu?{' '}
              <Link
                to="/register"
                className="font-medium transition-colors duration-150"
                style={{ color: '#7c6af6' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#9d9cf8'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#7c6af6'; }}
              >
                Ücretsiz kaydol
              </Link>
            </p>

          </div>{/* /px-8 py-9 */}
        </div>{/* /card surface */}

        {/* ── Footer note below card ──────────────────────────────────────── */}
        <p
          className={[
            'text-center text-[11px] mt-5',
            mounted ? 'fade-up-5' : 'opacity-0',
          ].join(' ')}
          style={{ color: '#2a2a36' }}
        >
          Giriş yaparak{' '}
          <Link
            to="/terms"
            className="underline underline-offset-2 hover:text-[#55556a] transition-colors"
            style={{ color: '#2a2a36' }}
          >
            kullanım şartlarını
          </Link>
          {' '}kabul etmiş olursun.
        </p>

      </div>{/* /card wrapper */}
    </div>
  );
}
