import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: '#2a2a2a' }} />
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
  if (days <= 3) return { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', label: 'Kritik' };
  if (days <= 7) return { color: '#f97316', bg: 'rgba(249,115,22,0.08)', label: 'Yakın' };
  return { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', label: 'Güvenli' };
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
  'netflix','spotify','youtube','github','figma','discord','slack','apple','google','microsoft'
]);

const getPlatformFaClass = (name) => {
  const key = name.toLowerCase().replace(/\s+/g, '');
  const icon = PLATFORM_ICONS[key] || 'fa-circle-dot';
  const prefix = FA_BRANDS.has(key) ? 'fa-brands' : 'fa-solid';
  return `${prefix} ${icon}`;
};

// ─── Category Pill ────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Eğlence: { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  Müzik: { color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
  Yazılım: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  Eğitim: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  Oyun: { color: '#f472b6', bg: 'rgba(244,114,182,0.08)' },
  Diğer: { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
};

// ─── Categories & Currencies ──────────────────────────────────────────────────
const CATEGORIES = ['Eğlence', 'Müzik', 'Yazılım', 'Eğitim', 'Oyun', 'Diğer'];
const CURRENCIES = ['TRY', 'USD', 'EUR'];

// ─── Input / Label shared styles ─────────────────────────────────────────────
const inputCls = [
  'w-full text-sm rounded-lg px-3 py-2 outline-none transition-all duration-150',
  'placeholder-[#4a4a4a] text-[#e0e0e0]',
  'border focus:border-[#5a5aef]',
].join(' ');

const inputStyle = { background: '#1a1a1a', borderColor: '#2f2f2f', color: '#e0e0e0' };
const labelCls = 'block text-[11px] font-semibold text-[#5a5a5a] uppercase tracking-widest mb-1.5';

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const SubModal = ({ initial, onClose, onSaved }) => {
  const empty = {
    platformName: '',
    amount: '',
    currency: 'TRY',
    renewalDay: '',
    category: 'Eğlence',
    billingPeriod: 'MONTHLY',
  };

  const [form, setForm] = useState(initial ? { ...initial } : empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.platformName.trim() || !form.amount || !form.renewalDay) {
      setError('Platform adı, tutar ve yenileme günü zorunludur.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        renewalDay: parseInt(form.renewalDay),
      };
      if (initial?.id) {
        await api.put(`/api/subscriptions/${initial.id}`, payload);
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
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md rounded-xl border shadow-2xl"
        style={{ background: '#191919', borderColor: '#2f2f2f' }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: '#2f2f2f' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
              style={{ background: 'rgba(90,90,239,0.15)', color: '#5a5aef' }}
            >
              {initial?.id ? (
                <i className="fa-solid fa-pen text-xs" style={{ color: '#5a5aef' }} />
              ) : (
                <i className="fa-solid fa-plus text-xs" style={{ color: '#5a5aef' }} />
              )}
            </div>
            <h2 className="text-sm font-semibold text-[#e0e0e0]">
              {initial?.id ? 'Aboneliği Düzenle' : 'Yeni Abonelik'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#5a5a5a] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] transition-all text-sm"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className={labelCls}>Platform Adı *</label>
            <input
              className={inputCls}
              style={inputStyle}
              placeholder="Netflix, Spotify, GitHub…"
              value={form.platformName}
              onChange={(e) => set('platformName', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tutar *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                style={inputStyle}
                placeholder="149.99"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Para Birimi</label>
              <select
                className={inputCls + ' cursor-pointer'}
                style={inputStyle}
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} style={{ background: '#1a1a1a' }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Yenileme Günü *</label>
              <input
                type="number"
                min="1"
                max="31"
                className={inputCls}
                style={inputStyle}
                placeholder="1–31"
                value={form.renewalDay}
                onChange={(e) => set('renewalDay', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Dönem</label>
              <select
                className={inputCls + ' cursor-pointer'}
                style={inputStyle}
                value={form.billingPeriod}
                onChange={(e) => set('billingPeriod', e.target.value)}
              >
                <option value="MONTHLY" style={{ background: '#1a1a1a' }}>Aylık</option>
                <option value="YEARLY" style={{ background: '#1a1a1a' }}>Yıllık</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Kategori</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const cfg = CATEGORY_COLORS[c] || CATEGORY_COLORS['Diğer'];
                const active = form.category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('category', c)}
                    className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 border"
                    style={{
                      background: active ? cfg.bg : 'transparent',
                      color: active ? cfg.color : '#5a5a5a',
                      borderColor: active ? cfg.color + '40' : '#2f2f2f',
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              className="text-xs rounded-lg px-3 py-2.5 border"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}
            >
              {error}
            </p>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium border transition-all duration-150 hover:bg-[#2a2a2a]"
              style={{ borderColor: '#2f2f2f', color: '#8a8a8a' }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40"
              style={{ background: '#5a5aef' }}
            >
              {saving ? 'Kaydediliyor…' : initial?.id ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.25 }}
    className="rounded-xl border p-5 flex items-center gap-4 group"
    style={{ background: '#191919', borderColor: '#2f2f2f' }}
  >
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-base shrink-0 transition-transform duration-200 group-hover:scale-110"
      style={{ background: accent + '12', color: accent }}
    >
      {icon}
    </div>
    <div>
      <p className="text-[11px] font-semibold text-[#5a5a5a] uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xl font-bold text-[#e0e0e0]">{value}</p>
    </div>
  </motion.div>
);

// ─── Subscription Card ────────────────────────────────────────────────────────
const SubCard = ({ sub, onEdit, onDelete }) => {
  const urgency = getUrgencyConfig(sub.daysUntilRenewal);
  const catCfg = CATEGORY_COLORS[sub.category] || CATEGORY_COLORS['Diğer'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="rounded-xl border group flex flex-col relative overflow-hidden transition-colors duration-150 hover:border-[#3f3f3f]"
      style={{ background: '#191919', borderColor: '#2f2f2f' }}
    >
      {/* Urgency top strip */}
      <div
        className="h-0.5 w-full"
        style={{ background: urgency.color, opacity: 0.5 }}
      />

      <div className="p-4 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center border select-none"
              style={{ background: '#222222', borderColor: '#2f2f2f', color: '#5a5aef' }}
            >
              <i className={`${getPlatformFaClass(sub.platformName)} fa-fw`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#e0e0e0] leading-tight">{sub.platformName}</h3>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 inline-block"
                style={{ background: catCfg.bg, color: catCfg.color }}
              >
                {sub.category}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(sub); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#5a5a5a] hover:text-[#5a5aef] hover:bg-[#5a5aef]/10 transition-all text-xs"
              title="Düzenle"
            >
              <i className="fa-solid fa-pen text-xs" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#5a5a5a] hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
              title="Sil"
            >
              <i className="fa-solid fa-trash text-xs" />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#e0e0e0]">
              {sub.currency === 'TRY' ? '₺' : sub.currency === 'USD' ? '$' : '€'}
              {Number(sub.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#5a5a5a] font-medium">
              / {sub.billingPeriod === 'YEARLY' ? 'yıl' : 'ay'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-auto pt-3 border-t flex items-center justify-between"
          style={{ borderColor: '#2a2a2a' }}
        >
          <span className="text-xs text-[#5a5a5a]">Her ayın {sub.renewalDay}. günü</span>
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold"
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

// ─── Filter Tab ───────────────────────────────────────────────────────────────
const FilterTab = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
    style={{
      background: active ? '#2a2a2a' : 'transparent',
      color: active ? '#e0e0e0' : '#5a5a5a',
    }}
  >
    {label}
    {count !== undefined && (
      <span
        className="text-[10px] px-1.5 py-0.5 rounded"
        style={{ background: active ? '#3a3a3a' : '#2a2a2a', color: active ? '#e0e0e0' : '#5a5a5a' }}
      >
        {count}
      </span>
    )}
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Subscriptions() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchSubs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/subscriptions');
      const data = response.data.data || response.data || [];
      setSubs(data.map((sub) => ({ ...sub, daysUntilRenewal: calculateDaysUntil(sub.renewalDay) })));
    } catch {
      setSubs([
        { id: 1, platformName: 'Netflix',  amount: 149.99, currency: 'TRY', renewalDay: 15, category: 'Eğlence',  billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(15) },
        { id: 2, platformName: 'Spotify',  amount:  39.99, currency: 'TRY', renewalDay: 22, category: 'Müzik',    billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(22) },
        { id: 3, platformName: 'YouTube',  amount:  54.99, currency: 'TRY', renewalDay:  5, category: 'Eğlence',  billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(5)  },
        { id: 4, platformName: 'GitHub',   amount:   4.00, currency: 'USD', renewalDay:  1, category: 'Yazılım',  billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(1)  },
        { id: 5, platformName: 'Figma',    amount:  15.00, currency: 'USD', renewalDay: 10, category: 'Yazılım',  billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(10) },
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: '#111111', color: '#e0e0e0' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <i className="fa-solid fa-credit-card text-lg" style={{ color: '#5a5aef' }} />
              <h1 className="text-xl font-bold text-[#e0e0e0]">Abonelikler</h1>
            </div>
            <p className="text-sm text-[#5a5a5a]">
              Tekrarlayan giderlerini takip et.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalData({})}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity whitespace-nowrap"
            style={{ background: '#5a5aef' }}
          >
            <i className="fa-solid fa-plus text-xs" /> Abonelik Ekle
          </motion.button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : (
            <>
              <StatCard
                icon={<i className="fa-solid fa-wallet fa-fw" />}
                label="Aylık Gider (TRY)"
                value={`₺${totalTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                accent="#5a5aef"
                delay={0}
              />
              <StatCard
                icon={<i className="fa-solid fa-layer-group fa-fw" />}
                label="Aktif Abonelik"
                value={`${subs.length} adet`}
                accent="#22c55e"
                delay={0.05}
              />
              <StatCard
                icon={<i className="fa-solid fa-calendar-check fa-fw" />}
                label="En Yakın Ödeme"
                value={nearestRenewal !== null ? `${nearestRenewal} gün sonra` : '—'}
                accent={nearestRenewal !== null && nearestRenewal <= 3 ? '#ef4444' : nearestRenewal <= 7 ? '#f97316' : '#60a5fa'}
                delay={0.1}
              />
            </>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 pb-5 border-b"
          style={{ borderColor: '#2f2f2f' }}
        >
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a] text-sm">🔍</span>
            <input
              className="w-full text-sm rounded-lg pl-8 pr-3 py-2 outline-none border transition-colors duration-150 focus:border-[#5a5aef] placeholder-[#4a4a4a]"
              style={{ background: '#191919', borderColor: '#2f2f2f', color: '#e0e0e0' }}
              placeholder="Platform ara…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1 flex-wrap">
            {allCategories.map((cat) => (
              <FilterTab
                key={cat}
                label={cat}
                active={activeFilter === cat}
                onClick={() => setActiveFilter(cat)}
                count={cat !== 'Tümü' ? subs.filter((s) => s.category === cat).length : undefined}
              />
            ))}
          </div>

          {/* Upcoming badge */}
          {upcomingCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
              style={{ background: 'rgba(249,115,22,0.08)', color: '#f97316', border: '1px solid rgba(249,115,22,0.15)' }}
            >
              <i className="fa-solid fa-bolt text-xs" /> {upcomingCount} yaklaşan ödeme
            </div>
          )}
        </div>

        {/* ── Subscription Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filtered.map((sub) => (
                <SubCard
                  key={sub.id}
                  sub={sub}
                  onEdit={setModalData}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed"
            style={{ background: '#161616', borderColor: '#2f2f2f' }}
          >
            <i className="fa-solid fa-credit-card text-4xl mb-4" style={{ color: '#5a5aef' }} />
            <h3 className="text-base font-semibold text-[#e0e0e0] mb-2">
              {searchQuery ? 'Sonuç bulunamadı' : 'Abonelik bulunamadı'}
            </h3>
            <p className="text-sm text-[#5a5a5a] mb-6 text-center max-w-xs">
              {searchQuery
                ? `"${searchQuery}" ile eşleşen abonelik yok.`
                : 'Aylık giderlerini takip etmek için ilk aboneliğini ekle.'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setModalData({})}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#5a5aef' }}
              >
                <i className="fa-solid fa-plus text-xs" /> İlk Aboneliği Ekle
              </motion.button>
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