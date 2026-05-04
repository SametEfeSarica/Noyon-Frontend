import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[#1e1e2c] rounded-md ${className}`} />
);

// ─── Utility: days until renewal day this/next month ─────────────────────────
const calculateDaysUntil = (renewalDay) => {
  const today = new Date();
  const currentDay = today.getDate();
  let daysLeft = renewalDay - currentDay;
  if (daysLeft < 0) {
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    daysLeft += daysInMonth;
  }
  return daysLeft;
};

// ─── Urgency styling by days remaining ───────────────────────────────────────
const getUrgencyStyles = (days) => {
  if (days <= 3)
    return {
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: 'fa-triangle-exclamation',
    };
  if (days <= 7)
    return {
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      icon: 'fa-clock',
    };
  return {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'fa-shield-check',
  };
};

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const CATEGORIES = ['Eğlence', 'Müzik', 'Yazılım', 'Eğitim', 'Oyun', 'Diğer'];
const CURRENCIES = ['TRY', 'USD', 'EUR'];

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
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full bg-[#0d0d14] border border-[#2a2a3c] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#6c6af6] transition-colors placeholder-zinc-600';
  const labelCls = 'block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 12 }}
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ background: '#111119', borderColor: '#1e1e2c' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white">
            {initial?.id ? 'Aboneliği Düzenle' : 'Yeni Abonelik Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Platform Adı *</label>
            <input
              className={inputCls}
              placeholder="Netflix, Spotify…"
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
                placeholder="149.99"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Para Birimi</label>
              <select
                className={inputCls + ' cursor-pointer'}
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
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
                placeholder="1–31"
                value={form.renewalDay}
                onChange={(e) => set('renewalDay', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Dönem</label>
              <select
                className={inputCls + ' cursor-pointer'}
                value={form.billingPeriod}
                onChange={(e) => set('billingPeriod', e.target.value)}
              >
                <option value="MONTHLY">Aylık</option>
                <option value="YEARLY">Yıllık</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Kategori</label>
            <select
              className={inputCls + ' cursor-pointer'}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-sm font-semibold text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
              style={{ borderColor: '#2a2a3c' }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50"
              style={{ background: '#6c6af6' }}
            >
              {saving ? 'Kaydediliyor…' : initial?.id ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Subscriptions() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalData, setModalData] = useState(null); // null = closed, {} = new, sub = edit

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchSubs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/subscriptions');
      const data = response.data.data || response.data || [];
      const mapped = data.map((sub) => ({
        ...sub,
        daysUntilRenewal: calculateDaysUntil(sub.renewalDay),
      }));
      setSubs(mapped);
    } catch (error) {
      console.error('Abonelikler çekilemedi:', error);
      // Fallback demo verisi — backend kapalıyken arayüzü görmek için
      setSubs([
        { id: 1, platformName: 'Netflix',  amount: 149.99, currency: 'TRY', renewalDay: 15, category: 'Eğlence',  billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(15) },
        { id: 2, platformName: 'Spotify',  amount:  39.99, currency: 'TRY', renewalDay: 22, category: 'Müzik',    billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(22) },
        { id: 3, platformName: 'YouTube',  amount:  54.99, currency: 'TRY', renewalDay:  5, category: 'Eğlence',  billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(5)  },
        { id: 4, platformName: 'GitHub',   amount:   4.00, currency: 'USD', renewalDay:  1, category: 'Yazılım',  billingPeriod: 'MONTHLY', daysUntilRenewal: calculateDaysUntil(1)  },
      ]);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
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

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalMonthlyCost = subs.reduce((acc, s) => acc + (s.amount || 0), 0);
  const nearestRenewal =
    subs.length > 0 ? Math.min(...subs.map((s) => s.daysUntilRenewal)) : null;
  const sorted = [...subs].sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="p-6 md:p-10 min-h-screen font-sans text-zinc-200"
      style={{ background: '#09090b' }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight mb-2">
            <div
              className="w-3 h-8 rounded-sm"
              style={{
                background: '#6c6af6',
                boxShadow: '0 0 15px rgba(108,106,246,0.4)',
              }}
            />
            Abonelik Yönetimi
          </h1>
          <p className="text-sm text-gray-500 ml-6">
            Tekrarlayan giderlerini takip et, sürpriz ödemelerden kurtul.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalData({})}
          className="w-full sm:w-auto text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg whitespace-nowrap"
          style={{ background: '#6c6af6' }}
        >
          <i className="fa-solid fa-plus" /> Abonelik Ekle
        </motion.button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))
        ) : (
          <>
            {/* Toplam */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border p-6 rounded-2xl flex items-center gap-5 shadow-sm relative overflow-hidden group"
              style={{ background: '#111119', borderColor: '#1e1e2c' }}
            >
              <div
                className="absolute -right-4 -top-4 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"
                style={{ background: 'rgba(108,106,246,0.05)' }}
              />
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: 'rgba(108,106,246,0.1)', color: '#6c6af6' }}
              >
                <i className="fa-solid fa-wallet" />
              </div>
              <div className="z-10">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                  Toplam Aylık Gider
                </p>
                <h3 className="text-3xl font-black text-white">
                  ₺{totalMonthlyCost.toFixed(2)}
                </h3>
              </div>
            </motion.div>

            {/* Aktif */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border p-6 rounded-2xl flex items-center gap-5 shadow-sm relative overflow-hidden group"
              style={{ background: '#111119', borderColor: '#1e1e2c' }}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl shrink-0">
                <i className="fa-solid fa-layer-group" />
              </div>
              <div className="z-10">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                  Aktif Abonelik
                </p>
                <h3 className="text-3xl font-black text-white">
                  {subs.length}
                  <span className="text-sm font-medium text-zinc-500 ml-1">adet</span>
                </h3>
              </div>
            </motion.div>

            {/* En Yakın */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border p-6 rounded-2xl flex items-center gap-5 shadow-sm relative overflow-hidden group"
              style={{ background: '#111119', borderColor: '#1e1e2c' }}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 text-2xl shrink-0">
                <i className="fa-solid fa-calendar-check" />
              </div>
              <div className="z-10">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                  En Yakın Ödeme
                </p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {nearestRenewal !== null ? `${nearestRenewal} gün sonra` : 'Yok'}
                </h3>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* LIST */}
      <div>
        <div
          className="flex items-center justify-between mb-6 border-b pb-4"
          style={{ borderColor: '#1e1e2c' }}
        >
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-list" style={{ color: '#6c6af6' }} />
            Tüm Aboneliklerin
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : subs.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {sorted.map((sub) => {
                const urgency = getUrgencyStyles(sub.daysUntilRenewal);
                return (
                  <motion.div
                    layout
                    key={sub.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    className="border rounded-2xl p-5 hover:border-zinc-500 transition-all cursor-pointer group flex flex-col relative shadow-sm hover:shadow-md"
                    style={{ background: '#111119', borderColor: '#1e1e2c' }}
                  >
                    {/* Action menu */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setModalData(sub); }}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-[#6c6af6] hover:bg-[#6c6af6]/10 transition-colors"
                        title="Düzenle"
                      >
                        <i className="fa-solid fa-pencil text-xs" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Sil"
                      >
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    </div>

                    {/* Platform info */}
                    <div className="flex items-center gap-4 mb-5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl border shadow-inner relative"
                        style={{ background: '#161622', borderColor: '#2a2a3c' }}
                      >
                        <i
                          className={`fa-brands fa-${sub.platformName
                            .toLowerCase()
                            .replace(/\s+/g, '')} fa-fw`}
                        />
                        <span className="absolute text-lg font-black opacity-20 select-none">
                          {sub.platformName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-base leading-tight text-gray-200">
                          {sub.platformName}
                        </h3>
                        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mt-1">
                          {sub.category}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">
                          {sub.amount}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          {sub.currency}
                        </span>
                        <span className="text-xs text-zinc-500 ml-1">
                          /{' '}
                          {sub.billingPeriod === 'YEARLY' ? 'Yıl' : 'Ay'}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      className="mt-auto pt-3 border-t flex items-center justify-between"
                      style={{ borderColor: '#1e1e2c' }}
                    >
                      <span className="text-xs font-semibold text-zinc-400">
                        Ayın {sub.renewalDay}. günü
                      </span>
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${urgency.bg} ${urgency.color} ${urgency.border}`}
                      >
                        <i className={`fa-solid ${urgency.icon} text-[10px]`} />
                        <span className="text-[10px] font-bold">
                          {sub.daysUntilRenewal} gün
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 border border-dashed rounded-3xl"
            style={{ background: '#111119', borderColor: '#1e1e2c' }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'rgba(108,106,246,0.1)' }}
            >
              <i
                className="fa-solid fa-credit-card text-4xl"
                style={{ color: '#6c6af6' }}
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Abonelik Bulunamadı
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
              Sisteme kayıtlı hiçbir aboneliğin yok. Aylık giderlerini takip
              etmek için hemen bir tane ekle.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalData({})}
              className="text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
              style={{ background: '#6c6af6' }}
            >
              <i className="fa-solid fa-plus" /> İlk Aboneliğini Ekle
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
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
