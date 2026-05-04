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
  <div className="animate-pulse flex items-center justify-between p-4 rounded-xl border" style={{ background: '#111119', borderColor: '#1e1e2c' }}>
    <div className="flex items-center gap-3 flex-1">
      <div className="w-9 h-9 rounded-lg bg-[#1e1e2c]" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-48 bg-[#1e1e2c] rounded" />
        <div className="h-2 w-24 bg-[#1e1e2c] rounded" />
      </div>
    </div>
    <div className="h-7 w-24 bg-[#1e1e2c] rounded-lg" />
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
      style={{ background: '#09090b' }}
    >
      {/* HEADER */}
      <div className="mb-8 border-b pb-6" style={{ borderColor: '#1e1e2c' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight mb-1">
              <div
                className="w-3 h-8 rounded-sm"
                style={{ background: '#6c6af6', boxShadow: '0 0 15px rgba(108,106,246,0.4)' }}
              />
              Çöp Kutusu
            </h1>
            <p className="text-sm text-gray-500 ml-6">
              Silinen öğeleri buradan geri yükleyebilirsin.
            </p>
          </div>

          {items.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRestoreAll}
              className="text-emerald-400 border border-emerald-600/30 bg-emerald-600/10 px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-colors whitespace-nowrap"
            >
              <i className="fa-solid fa-rotate-left" />
              Tümünü Geri Yükle
            </motion.button>
          )}
        </div>

        {/* TABS */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.label
                  ? 'text-white shadow-md'
                  : 'text-gray-500 hover:text-white'
              }`}
              style={{
                background: activeTab === tab.label ? '#6c6af6' : '#111119',
              }}
            >
              <i className={`fa-solid ${tab.icon} text-xs`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col gap-2"
        >
          {isLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} />)
          ) : items.length > 0 ? (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-4 rounded-xl border group hover:border-zinc-600 transition-all"
                  style={{ background: '#111119', borderColor: '#1e1e2c' }}
                >
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(108,106,246,0.1)', color: '#6c6af6' }}
                    >
                      <i className={`fa-solid ${currentTab.icon} text-sm`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-300 truncate">
                        {getItemName(item)}
                      </h4>
                      {getItemMeta(item) && (
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                          {getItemMeta(item)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handlePermanentDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
                      title="Kalıcı sil"
                    >
                      {deletingId === item.id ? (
                        <i className="fa-solid fa-spinner fa-spin text-xs" />
                      ) : (
                        <i className="fa-solid fa-trash text-xs" />
                      )}
                    </button>

                    <button
                      onClick={() => handleRestore(item.id)}
                      disabled={restoringId === item.id}
                      className="flex items-center gap-1.5 bg-emerald-600/10 text-emerald-500 border border-emerald-600/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {restoringId === item.id ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        <i className="fa-solid fa-rotate-left" />
                      )}
                      Geri Yükle
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 border border-dashed rounded-2xl"
              style={{ background: '#111119', borderColor: '#1e1e2c' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(108,106,246,0.1)' }}
              >
                <i
                  className={`fa-solid ${currentTab.icon} text-3xl`}
                  style={{ color: '#6c6af6' }}
                />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {activeTab} çöpü boş
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Sildiğin {activeTab.toLowerCase()} buraya düşer. Şu an
                görüntülenecek bir öğe yok.
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
