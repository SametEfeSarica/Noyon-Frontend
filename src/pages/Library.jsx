import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-zinc-800/60 rounded-md ${className}`}></div>
);

export default function Library() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['Tümü', 'Okunuyor', 'Bitti', 'İstek Listesi'];

  const fetchLibrary = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/library');
      const data = response.data.content || response.data;
      setItems(data || []);
    } catch (error) {
      console.error("Kütüphane verisi çekilemedi:", error);
      // Backend bağlantısı henüz yoksa arayüzü görebilmen için sahte (dummy) veriler
      setItems([
        { id: 1, title: 'Kozmos', author: 'Carl Sagan', status: 'Okunuyor', progress: 45, coverUrl: null, type: 'Kitap' },
        { id: 2, title: 'Clean Architecture', author: 'Robert C. Martin', status: 'Bitti', progress: 100, coverUrl: null, type: 'PDF' },
        { id: 3, title: 'Dune', author: 'Frank Herbert', status: 'İstek Listesi', progress: 0, coverUrl: null, type: 'Kitap' },
        { id: 4, title: 'React Tasarım Desenleri', author: 'Addy Osmani', status: 'Okunuyor', progress: 12, coverUrl: null, type: 'Makale' },
        { id: 5, title: '1984', author: 'George Orwell', status: 'Bitti', progress: 100, coverUrl: null, type: 'Kitap' },
      ]);
    } finally {
      setTimeout(() => setIsLoading(false), 400); // Yumuşak geçiş hissi için ufak gecikme
    }
  };

  useEffect(() => {
    if (user) fetchLibrary();
  }, [user]);

  // Sekme ve Arama Filtrelemesi
  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'Tümü' ? true : item.status === activeTab;
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 min-h-screen bg-background font-sans text-zinc-200">
      
      {/* HEADER & ARAMA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
          <div className="w-3 h-8 bg-emerald-500 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
          Dijital Kitaplık
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Kitap veya yazar ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border text-zinc-200 text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-sm"
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert("Eser ekleme modülü buraya gelecek!")}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg whitespace-nowrap"
          >
            <i className="fa-solid fa-plus"></i> Eser Ekle
          </motion.button>
        </div>
      </div>

      {/* KLASÖRLER / SEKMELER (Framer Motion ile akıcı çizgi animasyonu) */}
      <div className="flex items-center border-b border-border mb-8 overflow-x-auto custom-scrollbar pb-1">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-4 text-sm font-semibold transition-colors relative flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab ? 'text-white' : 'text-muted hover:text-zinc-300'
            }`}
          >
            {tab === 'Tümü' && <i className="fa-solid fa-layer-group"></i>}
            {tab === 'Okunuyor' && <i className="fa-solid fa-book-open-reader"></i>}
            {tab === 'Bitti' && <i className="fa-solid fa-check-double text-emerald-500/80"></i>}
            {tab === 'İstek Listesi' && <i className="fa-solid fa-bookmark text-yellow-500/80"></i>}
            {tab}
            
            {activeTab === tab && (
              <motion.div 
                layoutId="activeLibraryTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* KİTAP RAF GÖRÜNÜMÜ (GRID) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <motion.div 
          initial="hidden" animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 gap-y-10"
        >
          <AnimatePresence>
            {filteredItems.map(item => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                key={item.id} 
                className="group cursor-pointer flex flex-col"
              >
                {/* KİTAP KAPAĞI */}
                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border border-border bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="p-4 text-center z-10 w-full">
                      <h4 className="text-white font-black uppercase tracking-widest text-xs md:text-sm drop-shadow-md line-clamp-4 leading-tight">{item.title}</h4>
                      <p className="text-emerald-400 font-medium text-[10px] mt-3 uppercase tracking-wider">{item.author}</p>
                    </div>
                  )}
                  
                  {/* Hover Eylem Menüsü */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                     <button className="bg-emerald-500 hover:bg-emerald-400 text-white w-12 h-12 rounded-full flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                       <i className="fa-solid fa-book-open text-lg"></i>
                     </button>
                  </div>

                  {/* Tür Rozeti (Kitap / PDF vb.) */}
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md text-[9px] font-bold text-zinc-300 px-2 py-1 rounded border border-border shadow-sm">
                    {item.type || 'Kitap'}
                  </div>
                </div>

                {/* İSİM VE DETAYLAR */}
                <div className="mt-4 flex flex-col flex-1">
                  <h3 className="font-bold text-white text-sm md:text-base leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-muted text-xs mt-1 truncate">{item.author}</p>

                  {/* İlerleme Çubuğu (Sadece okunuyorsa çıkar) */}
                  {item.status === 'Okunuyor' && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
                        <span>İlerleme</span>
                        <span className="text-emerald-400">% {item.progress}</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 bg-surface border border-border border-dashed rounded-3xl"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <i className="fa-solid fa-book text-4xl text-emerald-500"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Rafın Şimdilik Boş</h3>
          <p className="text-sm text-muted mb-6 text-center max-w-md">
            Bu kategoride henüz bir eser bulunmuyor. Kütüphanene yeni kitaplar, PDF'ler veya makaleler ekleyerek doldurmaya başla!
          </p>
          <button className="text-emerald-500 hover:text-emerald-400 font-bold text-sm flex items-center gap-2 transition-colors">
            <i className="fa-solid fa-cloud-arrow-up"></i> Hemen Ekle
          </button>
        </motion.div>
      )}
    </div>
  );
}