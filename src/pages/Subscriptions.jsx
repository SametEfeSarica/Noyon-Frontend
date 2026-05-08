import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div
    className={`animate-pulse rounded-2xl ${className}`}
    style={{ background: '#111119', border: '1px solid #1e1e2c' }}
  />
);

// ─── Utility ──────────────────────────────────────────────────────────────────
const calculateDaysUntil = (renewalDay) => {
  const today = new Date();
  const currentDay = today.getDate();
  let daysLeft = renewalDay - currentDay;
  if (daysLeft < 0) {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    daysLeft += daysInMonth;
  }
  return daysLeft;
};

const getUrgencyConfig = (days) => {
  if (days <= 3) return { color: '#f87171', bg: 'rgba(248,113,113,0.08)', label: 'Kritik' };
  if (days <= 7) return { color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  label: 'Yakın'  };
  return            { color: '#34d399', bg: 'rgba(52,211,153,0.08)',   label: 'Güvenli' };
};

const PLATFORM_ICONS = {
  netflix:   'fa-film',
  spotify:   'fa-music',
  youtube:   'fa-play',
  github:    'fa-code-branch',
  figma:     'fa-pen-nib',
  notion:    'fa-file-lines',
  discord:   'fa-headset',
  slack:     'fa-comments',
  adobe:     'fa-bezier-curve',
  apple:     'fa-apple',
  google:    'fa-google',
  microsoft: 'fa-windows',
};

const FA_BRANDS = new Set([
  'netflix','spotify','youtube','github','figma','discord','slack','apple','google','microsoft',
]);

const getPlatformFaClass = (name) => {
  const key    = name.toLowerCase().replace(/\s+/g, '');
  const icon   = PLATFORM_ICONS[key] || 'fa-circle-dot';
  const prefix = FA_BRANDS.has(key) ? 'fa-brands' : 'fa-solid';
  return `${prefix} ${icon}`;
};

// ─── Category colours — matched to Library palette ────────────────────────────
const CATEGORY_COLORS = {
  Eğlence: { color: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
  Müzik:   { color: '#34d399', bg: 'rgba(52,211,153,0.10)'  },
  Yazılım: { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)'  },
  Eğitim:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)'  },
  Oyun:    { color: '#f472b6', bg: 'rgba(244,114,182,0.10)' },
  Diğer:   { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
};

const CATEGORIES = ['Eğlence', 'Müzik', 'Yazılım', 'Eğitim', 'Oyun', 'Diğer'];
const CURRENCIES  = ['TRY', 'USD', 'EUR'];

// ─── Shared input styles — identical to Library ───────────────────────────────
const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #252530', background: '#0e0e14',
  color: '#d8d8e0', fontSize: 13, outline: 'none', transition: 'border-color 0.2s',
};
const labelStyle = {
  display: 'block', fontSize: 11.5, fontWeight: 600, color: '#55556a',
  textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6,
};

// ─── Icon helper ──────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  card:   "M2 7h20M2 12h20M6 17h.01M10 17h.01M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  wallet: "M20 12V8H6a2 2 0 0 1 0-4h12v4M20 12v4H6a2 2 0 0 0 0 4h14v-4M20 12H6",
  layers: "M12 2l9 4.5-9 4.5-9-4.5L12 2zM3 12l9 4.5 9-4.5M3 17l9 4.5 9-4.5",
  cal:    "M3 4h18M8 2v4M16 2v4M3 10h18M5 20h14a2 2 0 0 0 2-2V8H3v10a2 2 0 0 0 2 2z",
  search: "M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5zM16 16l4.5 4.5",
  plus:   "M12 5v14M5 12h14",
  x:      "M18 6L6 18M6 6l12 12",
  edit:   "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:  "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  bolt:   "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const SubModal = ({ initial, onClose, onSaved }) => {
  const empty = {
    platformName:  '',
    amount:        '',
    currency:      'TRY',
    renewalDay:    '',
    category:      'Eğlence',
    billingPeriod: 'MONTHLY',
  };

  const [form,   setForm]   = useState(initial ? { ...initial } : empty);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.platformName.trim() || !form.amount || !form.renewalDay) {
      setError('Platform adı, tutar ve yenileme günü zorunludur.');
      return;
    }
    const payload = {
      platformName:  form.platformName,
      amount:        parseFloat(form.amount),
      currency:      form.currency,
      renewalDay:    parseInt(form.renewalDay),
      category:      form.category,
      billingPeriod: form.billingPeriod,
    };
    try {
      setSaving(true);
      if (initial?.id) {
        await api.delete(`/api/subscriptions/${initial.id}`);
        await api.post('/api/subscriptions', payload);
      } else {
        await api.post('/api/subscriptions', payload);
      }
      onSaved();
      onClose();
    } catch {
      setError('Kayıt sırasında bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{    scale: 0.96, y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md rounded-2xl flex flex-col shadow-2xl"
        style={{ background: '#16161e', border: '1px solid #252530', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: '#1e1e26' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Icon d={initial?.id ? icons.edit : icons.plus} size={13} className="text-white" />
            </div>
            <h2 className="text-[15px] font-semibold text-gray-200">
              {initial?.id ? 'Aboneliği Düzenle' : 'Yeni Abonelik'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <Icon d={icons.x} size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Platform Adı *</label>
            <input
              style={inputStyle}
              placeholder="Netflix, Spotify, GitHub…"
              value={form.platformName}
              onChange={(e) => set('platformName', e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Tutar *</label>
              <input
                type="number" min="0" step="0.01"
                style={inputStyle}
                placeholder="149.99"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Para Birimi</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} style={{ background: '#0e0e14' }}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Yenileme Günü *</label>
              <input
                type="number" min="1" max="31"
                style={inputStyle}
                placeholder="1–31"
                value={form.renewalDay}
                onChange={(e) => set('renewalDay', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Dönem</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.billingPeriod}
                onChange={(e) => set('billingPeriod', e.target.value)}
              >
                <option value="MONTHLY" style={{ background: '#0e0e14' }}>Aylık</option>
                <option value="YEARLY"  style={{ background: '#0e0e14' }}>Yıllık</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Kategori</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const cfg    = CATEGORY_COLORS[c] || CATEGORY_COLORS['Diğer'];
                const active = form.category === c;
                return (
                  <button
                    key={c} type="button"
                    onClick={() => set('category', c)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                    style={{
                      background:  active ? cfg.bg        : 'transparent',
                      color:       active ? cfg.color     : '#55556a',
                      border:      `1px solid ${active ? cfg.color + '40' : '#252530'}`,
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2.5"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </p>
          )}

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
              style={{ background: 'transparent', border: '1px solid #2a2a36' }}>
              İptal
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#7c3aed' }}>
              {saving ? 'Kaydediliyor…' : initial?.id ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ iconD, label, value, accent, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.25 }}
    className="rounded-2xl border p-5 flex items-center gap-4 group"
    style={{ background: '#111119', borderColor: '#1e1e2c' }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
      style={{ background: accent + '18', color: accent }}
    >
      <Icon d={iconD} size={18} />
    </div>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5"
        style={{ color: '#55556a' }}>{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </motion.div>
);

// ─── Subscription Card ────────────────────────────────────────────────────────
const SubCard = ({ sub, onEdit, onDelete }) => {
  const urgency = getUrgencyConfig(sub.daysUntilRenewal);
  const catCfg  = CATEGORY_COLORS[sub.category] || CATEGORY_COLORS['Diğer'];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1  }}
      exit={{    opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl flex flex-col relative overflow-hidden cursor-default"
      style={{
        background:   hovered ? '#161622' : '#111119',
        border:       `1px solid ${hovered ? urgency.color + '33' : '#1e1e2c'}`,
        boxShadow:    hovered ? `0 0 0 1px ${urgency.color}18, 0 8px 30px #00000060` : 'none',
        transition:   'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        transform:    hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Urgency top strip */}
      <div className="h-0.5 w-full" style={{ background: urgency.color, opacity: 0.6 }} />

      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, #1a1a28, #111119)`,
                border: '1px solid #252530',
                color: '#9d9cf8',
              }}
            >
              <i className={`${getPlatformFaClass(sub.platformName)} fa-fw text-sm`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white leading-tight">{sub.platformName}</h3>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-md mt-1 inline-block"
                style={{ background: catCfg.bg, color: catCfg.color }}
              >
                {sub.category}
              </span>
            </div>
          </div>

          {/* Actions — visible on hover */}
          <div
            className="flex gap-1 transition-opacity duration-150"
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(sub); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
              style={{ color: '#55556a' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.background = 'rgba(96,165,250,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#55556a'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon d={icons.edit} size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
              style={{ color: '#55556a' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#55556a'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon d={icons.trash} size={13} />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">
              {sub.currency === 'TRY' ? '₺' : sub.currency === 'USD' ? '$' : '€'}
              {Number(sub.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-medium" style={{ color: '#55556a' }}>
              / {sub.billingPeriod === 'YEARLY' ? 'yıl' : 'ay'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t flex items-center justify-between"
          style={{ borderColor: '#1e1e2c' }}>
          <span className="text-xs" style={{ color: '#55556a' }}>Her ayın {sub.renewalDay}. günü</span>
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold"
            style={{ background: urgency.bg, color: urgency.color }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: urgency.color }} />
            {sub.daysUntilRenewal === 0 ? 'Bugün!' : `${sub.daysUntilRenewal} gün`}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Subscriptions() {
  const { user } = useAuth();
  const [subs,         setSubs]         = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [modalData,    setModalData]    = useState(null);
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [searchQuery,  setSearchQuery]  = useState('');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchSubs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/subscriptions');
      const data = response.data.data || response.data || [];
      setSubs(data.map((sub) => ({ ...sub, daysUntilRenewal: calculateDaysUntil(sub.renewalDay) })));
    } catch {
      setSubs([
        { id: 1, platformName: 'Netflix', amount: 149.99, currency: 'TRY', renewalDay: 15, category: 'Eğlence', billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(15) },
        { id: 2, platformName: 'Spotify', amount:  39.99, currency: 'TRY', renewalDay: 22, category: 'Müzik',   billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(22) },
        { id: 3, platformName: 'YouTube', amount:  54.99, currency: 'TRY', renewalDay:  5, category: 'Eğlence', billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(5)  },
        { id: 4, platformName: 'GitHub',  amount:   4.00, currency: 'USD', renewalDay:  1, category: 'Yazılım', billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(1)  },
        { id: 5, platformName: 'Figma',   amount:  15.00, currency: 'USD', renewalDay: 10, category: 'Yazılım', billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(10) },
      ]);
    } finally {
      setTimeout(() => setIsLoading(false), 350);
    }
  }, []);

  useEffect(() => {
    if (user) fetchSubs();
  }, [user, fetchSubs]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Bu aboneliği silmek istediğinden emin misin?')) return;
    try {
      await api.delete(`/api/subscriptions/${id}`);
      setSubs((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('Silme işlemi başarısız oldu.');
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalTRY = subs
    .filter((s) => s.currency === 'TRY')
    .reduce((acc, s) => acc + (s.amount || 0), 0);

  const nearestRenewal = subs.length > 0
    ? Math.min(...subs.map((s) => s.daysUntilRenewal))
    : null;

  const upcomingCount = subs.filter((s) => s.daysUntilRenewal <= 7).length;

  const allCategories = ['Tümü', ...CATEGORIES.filter((c) => subs.some((s) => s.category === c))];

  const filtered = [...subs]
    .filter((s) => activeFilter === 'Tümü' || s.category === activeFilter)
    .filter((s) => !searchQuery || s.platformName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

  const nearestUrgencyColor =
    nearestRenewal !== null && nearestRenewal <= 3 ? '#f87171' :
    nearestRenewal !== null && nearestRenewal <= 7 ? '#fb923c' :
    '#34d399';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col min-h-screen w-full"
      style={{ background: '#09090b', color: '#e5e7eb', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex flex-col flex-1">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Icon d={icons.card} size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Abonelikler</h1>
              <p className="text-xs mt-0.5" style={{ color: '#55556a' }}>
                {subs.length} abonelik · {upcomingCount > 0 ? `${upcomingCount} yaklaşan ödeme` : 'ödeme yok'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalData({})}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{ background: '#252535', color: '#9d9cf8', border: '1px solid rgba(108,106,246,0.35)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e1e28'; e.currentTarget.style.color = '#c0c0d0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#252535'; e.currentTarget.style.color = '#9d9cf8'; }}
          >
            <Icon d={icons.plus} size={14} />
            Abonelik Ekle
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)
          ) : (
            <>
              <StatCard
                iconD={icons.wallet}
                label="Aylık Gider (TRY)"
                value={`₺${totalTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                accent="#7c3aed"
                delay={0}
              />
              <StatCard
                iconD={icons.layers}
                label="Aktif Abonelik"
                value={`${subs.length} adet`}
                accent="#34d399"
                delay={0.05}
              />
              <StatCard
                iconD={icons.cal}
                label="En Yakın Ödeme"
                value={nearestRenewal !== null ? `${nearestRenewal} gün sonra` : '—'}
                accent={nearestUrgencyColor}
                delay={0.1}
              />
            </>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 pb-5 border-b"
          style={{ borderColor: '#1e1e2c' }}>

          {/* Search */}
          <div className="relative w-64 flex-shrink-0">
            <Icon d={icons.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#55556a' }} />
            <input
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg outline-none transition-all duration-200"
              style={{ background: '#111119', border: '1px solid #1e1e2c', color: '#d1d5db' }}
              placeholder="Platform ara…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-400 transition-colors"
                style={{ color: '#55556a' }}>
                <Icon d={icons.x} size={12} />
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {allCategories.map((cat) => {
              const isActive = activeFilter === cat;
              const count    = cat !== 'Tümü' ? subs.filter((s) => s.category === cat).length : undefined;
              return (
                <button key={cat} onClick={() => setActiveFilter(cat)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5"
                  style={{
                    background: isActive ? '#252535' : 'transparent',
                    color:      isActive ? '#9d9cf8' : '#9090a0',
                    border:     `1px solid ${isActive ? 'rgba(108,106,246,0.35)' : '#252530'}`,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#1e1e28'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {cat}
                  {count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md"
                      style={{
                        background: isActive ? 'rgba(108,106,246,0.2)' : '#1e1e2c',
                        color:      isActive ? '#9d9cf8' : '#55556a',
                      }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Upcoming badge */}
          {upcomingCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ml-auto"
              style={{ background: 'rgba(251,146,60,0.08)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.15)' }}>
              <Icon d={icons.bolt} size={12} />
              {upcomingCount} yaklaşan ödeme
            </div>
          )}
        </div>

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-44" />)}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show:   { opacity: 1, transition: { staggerChildren: 0.04 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filtered.map((sub) => (
                <SubCard key={sub.id} sub={sub} onEdit={setModalData} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed"
            style={{ background: '#0e0e14', borderColor: '#1e1e2c' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #7c3aed22, #4f46e522)', border: '1px solid #252535' }}>
              <Icon d={icons.card} size={24} style={{ color: '#7c3aed' }} className="text-purple-500" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              {searchQuery ? 'Sonuç bulunamadı' : 'Abonelik bulunamadı'}
            </h3>
            <p className="text-sm text-center max-w-xs mb-6" style={{ color: '#55556a' }}>
              {searchQuery
                ? `"${searchQuery}" ile eşleşen abonelik yok.`
                : 'Aylık giderlerini takip etmek için ilk aboneliğini ekle.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setModalData({})}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#7c3aed' }}
              >
                <Icon d={icons.plus} size={14} />
                İlk Aboneliği Ekle
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalData !== null && (
          <SubModal
            initial={modalData?.id ? modalData : null}
            onClose={() => setModalData(null)}
            onSaved={fetchSubs}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
