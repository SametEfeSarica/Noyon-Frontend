import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { label: 'Notlar',       endpoint: '/api/notes/trash',              icon: 'fa-note-sticky',   restoreKey: 'title'        },
  { label: 'Kütüphane',   endpoint: '/api/library_items/trash',       icon: 'fa-book',          restoreKey: 'title'        },
  { label: 'Abonelikler', endpoint: '/api/subscriptions/trash',       icon: 'fa-credit-card',   restoreKey: 'platformName' },
];

const getRestoreEndpoint = (tab, id) => {
  if (tab === 'Notlar')       return `/api/notes/${id}/restore`;
  if (tab === 'Kütüphane')    return `/api/library_items/${id}/restore`;
  if (tab === 'Abonelikler')  return `/api/subscriptions/${id}/restore`;
};

const getPermanentDeleteEndpoint = (tab, id) => {
  if (tab === 'Notlar')       return `/api/notes/${id}/permanent`;
  if (tab === 'Kütüphane')    return `/api/library_items/${id}/permanent`;
  if (tab === 'Abonelikler')  return `/api/subscriptions/${id}/permanent`;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div
    className="animate-pulse flex items-center justify-between px-4 py-3.5 rounded-lg border"
    style={{ background: '#191919', borderColor: '#2f2f2f' }}
  >
    <div className="flex items-center gap-3 flex-1">
      <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: '#2a2a2a' }} />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-48 rounded" style={{ background: '#2a2a2a' }} />
        <div className="h-2 w-28 rounded" style={{ background: '#2a2a2a' }} />
      </div>
    </div>
    <div className="h-7 w-24 rounded-lg" style={{ background: '#2a2a2a' }} />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrashBin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Notlar');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const currentTab = TABS.find((t) => t.label === activeTab);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTrash = useCallback(async () => {
    setIsLoading(true);
    setItems([]);
    try {
      const response = await api.get(currentTab.endpoint);
      const data = response.data.data ?? response.data ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Çöp çekilemedi', err);
      setItems([]);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) fetchTrash();
  }, [user, fetchTrash]);

  // ── Restore ────────────────────────────────────────────────────────────────
  const handleRestore = async (id) => {
    setRestoringId(id);
    try {
      await api.patch(getRestoreEndpoint(activeTab, id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert('Geri yükleme başarısız oldu.');
    } finally {
      setRestoringId(null);
    }
  };

  // ── Permanent delete ───────────────────────────────────────────────────────
  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Bu öğeyi kalıcı olarak silmek istediğinden emin misin? Bu işlem geri alınamaz.'))
      return;
    setDeletingId(id);
    try {
      await api.delete(getPermanentDeleteEndpoint(activeTab, id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert('Kalıcı silme başarısız oldu.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Restore all ────────────────────────────────────────────────────────────
  const handleRestoreAll = async () => {
    if (!window.confirm(`Tüm ${activeTab.toLowerCase()}leri geri yüklemek istiyor musun?`)) return;
    try {
      await Promise.all(items.map((item) => api.patch(getRestoreEndpoint(activeTab, item.id))));
      setItems([]);
    } catch {
      alert('Toplu geri yükleme başarısız oldu.');
    }
  };

  // ── Item display name ──────────────────────────────────────────────────────
  const getItemName = (item) =>
    item[currentTab.restoreKey] || item.title || item.platformName || 'İsimsiz Öğe';

  const getItemMeta = (item) => {
    if (activeTab === 'Abonelikler')
      return `${item.amount ?? ''} ${item.currency ?? ''} · Ayın ${item.renewalDay ?? '?'}. günü`;
    if (activeTab === 'Kütüphane')
      return item.author ? `Yazar: ${item.author}` : item.type ?? '';
    return item.updatedAt
      ? `Güncellendi: ${new Date(item.updatedAt).toLocaleDateString('tr-TR')}`
      : '';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col min-h-full p-6 md:p-10 font-sans"
      style={{ background: '#111111', color: '#e0e0e0' }}
    >
      {/* ── Page Header ── */}
      <div className="mb-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(90,90,239,0.12)', color: '#5a5aef' }}
            >
              <i className="fa-solid fa-trash-can text-sm" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#e0e0e0] leading-tight">Çöp Kutusu</h1>
              <p className="text-xs text-[#5a5a5a] mt-0.5">
                Silinen öğeleri buradan geri yükleyebilirsin.
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRestoreAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150 whitespace-nowrap"
              style={{
                color: '#22c55e',
                background: 'rgba(34,197,94,0.08)',
                borderColor: 'rgba(34,197,94,0.2)',
              }}
            >
              <i className="fa-solid fa-rotate-left text-xs" />
              Tümünü Geri Yükle
            </motion.button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div
          className="flex items-center gap-1 border-b pb-4"
          style={{ borderColor: '#2f2f2f' }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? '#2a2a2a' : 'transparent',
                  color: active ? '#e0e0e0' : '#5a5a5a',
                }}
              >
                <i className={`fa-solid ${tab.icon} text-xs`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
          className="flex flex-col gap-1.5"
        >
          {isLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} />)
          ) : items.length > 0 ? (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center justify-between px-4 py-3.5 rounded-lg border group transition-colors duration-150 hover:border-[#3f3f3f]"
                  style={{ background: '#191919', borderColor: '#2f2f2f' }}
                >
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(90,90,239,0.1)', color: '#5a5aef' }}
                    >
                      <i className={`fa-solid ${currentTab.icon} text-xs`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-[#d0d0d0] truncate">
                        {getItemName(item)}
                      </h4>
                      {getItemMeta(item) && (
                        <p className="text-[11px] text-[#5a5a5a] mt-0.5 truncate">
                          {getItemMeta(item)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {/* Permanent delete — visible on hover */}
                    <button
                      onClick={() => handlePermanentDelete(item.id)}
                      disabled={deletingId === item.id}
                      title="Kalıcı sil"
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150 disabled:opacity-30"
                      style={{ color: '#5a5a5a' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#5a5a5a';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {deletingId === item.id
                        ? <i className="fa-solid fa-spinner fa-spin text-xs" />
                        : <i className="fa-solid fa-trash text-xs" />}
                    </button>

                    {/* Restore */}
                    <button
                      onClick={() => handleRestore(item.id)}
                      disabled={restoringId === item.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all duration-150 disabled:opacity-40"
                      style={{
                        color: '#22c55e',
                        background: 'rgba(34,197,94,0.08)',
                        borderColor: 'rgba(34,197,94,0.2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(34,197,94,0.15)';
                        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(34,197,94,0.08)';
                        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)';
                      }}
                    >
                      {restoringId === item.id
                        ? <i className="fa-solid fa-spinner fa-spin" />
                        : <i className="fa-solid fa-rotate-left" />}
                      Geri Yükle
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            /* ── Empty state ── */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed"
              style={{ background: '#161616', borderColor: '#2f2f2f' }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(90,90,239,0.1)' }}
              >
                <i
                  className={`fa-solid ${currentTab.icon} text-2xl`}
                  style={{ color: '#5a5aef' }}
                />
              </div>
              <h3 className="text-sm font-semibold text-[#e0e0e0] mb-1.5">
                {activeTab} çöpü boş
              </h3>
              <p className="text-xs text-[#5a5a5a] text-center max-w-xs leading-relaxed">
                Sildiğin {activeTab.toLowerCase()} buraya düşer. Şu an görüntülenecek bir öğe yok.
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
