import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { label: 'Notlar',      endpoint: '/api/notes/trash',         icon: NoteIcon,   restoreKey: 'title'        },
  { label: 'Kütüphane',   endpoint: '/api/library/trash',       icon: BookIcon,   restoreKey: 'title'        },
  { label: 'Abonelikler', endpoint: '/api/subscriptions/trash', icon: CardIcon,   restoreKey: 'platformName' },
];

const getRestoreEndpoint        = (tab, id) => {
  if (tab === 'Notlar')       return `/api/notes/${id}/restore`;
  if (tab === 'Kütüphane')    return `/api/library/${id}/restore`;
  if (tab === 'Abonelikler')  return `/api/subscriptions/${id}/restore`;
};
const getPermanentDeleteEndpoint = (tab, id) => {
  if (tab === 'Notlar')       return `/api/notes/${id}/permanent`;
  if (tab === 'Kütüphane')    return `/api/library/${id}/permanent`;
  if (tab === 'Abonelikler')  return `/api/subscriptions/${id}/permanent`;
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function NoteIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
    </svg>
  );
}
function BookIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
function CardIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}
function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}
function RestoreIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v6h6"/><path d="M3 8C5.2 4.4 9.3 2 14 2a10 10 0 1 1-10 10"/>
    </svg>
  );
}
function SpinnerIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse flex items-center justify-between px-5 py-4 rounded-2xl"
    style={{ background: '#111119', border: '1px solid #1e1e2c' }}>
    <div className="flex items-center gap-3 flex-1">
      <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: '#1e1e2c' }} />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-48 rounded" style={{ background: '#1e1e2c' }} />
        <div className="h-2 w-28 rounded" style={{ background: '#1e1e2c' }} />
      </div>
    </div>
    <div className="h-8 w-28 rounded-lg" style={{ background: '#1e1e2c' }} />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrashBin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab]     = useState('Notlar');
  const [items, setItems]             = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId]   = useState(null);

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

  useEffect(() => { if (user) fetchTrash(); }, [user, fetchTrash]);

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
    if (!window.confirm('Bu öğeyi kalıcı olarak silmek istediğinden emin misin?')) return;
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

  const TabIcon = currentTab.icon;

  // ── Tab accent colors matching Settings icon colors ────────────────────────
  const tabColor = {
    'Notlar':      '#a78bfa',
    'Kütüphane':   '#60a5fa',
    'Abonelikler': '#f59e0b',
  }[activeTab] ?? '#6c6af6';

  return (
    <div className="min-h-full" style={{ background: '#09090b', color: '#e5e7eb', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ── */}
        <div className="mb-8 fade-up flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Çöp Kutusu</h1>
            <p className="text-sm text-gray-500 mt-1">Silinen öğeleri buradan geri yükleyebilirsin.</p>
          </div>

          {items.length > 0 && (
            <motion.button
              whileHover={{ translateY: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRestoreAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 flex-shrink-0"
              style={{ background: '#34d39922', color: '#34d399', border: '1px solid #34d39933' }}
              onMouseEnter={e => e.currentTarget.style.background = '#34d39933'}
              onMouseLeave={e => e.currentTarget.style.background = '#34d39922'}
            >
              <RestoreIcon size={13} />
              Tümünü Geri Yükle
            </motion.button>
          )}
        </div>

        {/* ── Tabs + Content card ── */}
        <div className="fade-up rounded-2xl overflow-hidden" style={{ background: '#111119', border: '1px solid #1e1e2c' }}
          // slight animation delay
          >

          {/* Tab bar — mirrors Settings sidebar style */}
          <div className="flex items-center gap-1 px-5 py-4 border-b" style={{ borderColor: '#1e1e2c' }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.label;
              const color = { 'Notlar': '#a78bfa', 'Kütüphane': '#60a5fa', 'Abonelikler': '#f59e0b' }[tab.label];
              const Icon = tab.icon;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-[450] transition-all duration-150"
                  style={{
                    background: active ? color + '18' : 'transparent',
                    color: active ? color : '#606070',
                    border: `1px solid ${active ? color + '33' : 'transparent'}`,
                  }}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="flex flex-col gap-2"
              >
                {isLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} />)
                ) : items.length > 0 ? (
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center justify-between px-4 py-3.5 rounded-xl group transition-all duration-150"
                        style={{ background: '#161622', border: '1px solid #1e1e2c' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = tabColor + '33'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2c'}
                      >
                        {/* Left */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: tabColor + '18', color: tabColor }}>
                            <TabIcon size={14} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium text-gray-200 truncate">{getItemName(item)}</h4>
                            {getItemMeta(item) && (
                              <p className="text-[11px] text-gray-500 mt-0.5 truncate">{getItemMeta(item)}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          {/* Permanent delete */}
                          <button
                            onClick={() => handlePermanentDelete(item.id)}
                            disabled={deletingId === item.id}
                            title="Kalıcı sil"
                            className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-30"
                            style={{ color: '#606070', background: 'transparent' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#ef444418'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#606070'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            {deletingId === item.id ? <SpinnerIcon /> : <TrashIcon />}
                          </button>

                          {/* Restore */}
                          <button
                            onClick={() => handleRestore(item.id)}
                            disabled={restoringId === item.id}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-40"
                            style={{ background: '#34d39922', color: '#34d399', border: '1px solid #34d39933' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#34d39933'; e.currentTarget.style.borderColor = '#34d39955'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#34d39922'; e.currentTarget.style.borderColor = '#34d39933'; }}
                          >
                            {restoringId === item.id ? <SpinnerIcon /> : <RestoreIcon />}
                            Geri Yükle
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  /* Empty state */
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 rounded-xl"
                    style={{ background: '#0d0d14', border: `1px dashed ${tabColor}33` }}
                  >
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: tabColor + '18', color: tabColor }}>
                      <TabIcon size={22} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-1.5">{activeTab} çöpü boş</h3>
                    <p className="text-xs text-gray-500 text-center max-w-xs leading-relaxed">
                      Sildiğin {activeTab.toLowerCase()} buraya düşer. Şu an görüntülenecek bir öğe yok.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
