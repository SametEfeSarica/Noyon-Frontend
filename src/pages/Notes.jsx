import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import SamsungEditor from './Notes/SamsungEditor';
import { useAuth } from '../context/AuthContext';

// --- PREMIUM SKELETON COMPONENT ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-zinc-800/60 rounded-md ${className}`}></div>
);

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tüm Notlar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);

  const tabs = ["Tüm Notlar", "Favoriler", "Kişisel", "Yazılım", "Toplantı"];

  // --- API İŞLEMLERİ ---
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      // Yeni DTO sisteminde pagination olduğu için "size=100" ile bolca not çekiyoruz
      const response = await api.get('/api/notes', { params: { size: 100 } });
      
      // Spring Boot Page objesi dönerse içerik "content" içindedir
      const data = response.data.content || response.data;
      setNotes(data || []);
    } catch (error) {
      console.error("Notlar çekilemedi:", error);
      // Backend kapalıysa arayüzü görebilmen için sahte veriler
      setNotes([
        { id: 1, title: 'Proje Fikirleri', content: 'Kütüphane uygulaması arayüz iyileştirmeleri...', category: 'Yazılım', favorite: true, updatedAt: '2026-05-02T10:00:00Z' },
        { id: 2, title: 'Haftalık Toplantı', content: 'Backend uç noktaları kontrol edilecek.', category: 'Toplantı', favorite: false, updatedAt: '2026-05-01T14:30:00Z' },
      ]);
    } finally {
      setTimeout(() => setIsLoading(false), 400); // Akıcı geçiş için
    }
  };

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const handleCreateNewNote = () => {
    setSelectedNote({
      id: 'new',
      title: '',
      content: '',
      category: activeTab === 'Tüm Notlar' || activeTab === 'Favoriler' ? 'Kişisel' : activeTab,
      favorite: false,
    });
  };

  const handleSaveNote = async (updatedNoteData) => {
    try {
      if (selectedNote.id === 'new') {
        await api.post('/api/notes', updatedNoteData);
      } else {
        await api.put(`/api/notes/${selectedNote.id}`, updatedNoteData);
      }
      setSelectedNote(null);
      fetchNotes();
    } catch (error) {
      alert("Test Modu: Kaydedildi simülasyonu yapıldı!");
      setSelectedNote(null);
    }
  };

  // Notları filtreleme mantığı
  const filteredNotes = notes.filter(note => {
    // Backend'den gelen boolean değer "favorite", string "category"
    const matchesTab = activeTab === 'Tüm Notlar' ? true : (activeTab === 'Favoriler' ? note.favorite : note.category === activeTab);
    const matchesSearch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // ==========================================
  // EĞER BİR NOTA TIKLANDIYSA SAMSUNG EDİTÖRÜNÜ ÇAĞIR
  // ==========================================
  if (selectedNote) {
    return (
      <SamsungEditor 
        note={selectedNote} 
        onClose={() => setSelectedNote(null)} 
        onSave={handleSaveNote} 
      />
    );
  }

  // ==========================================
  // ANA NOTLAR LİSTESİ (KÜTÜPHANE GÖRÜNÜMÜ)
  // ==========================================
  return (
    <div className="p-6 md:p-10 min-h-screen bg-background font-sans text-zinc-200">
      
      {/* HEADER & ARAMA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
          <div className="w-3 h-8 bg-primary rounded-sm shadow-[0_0_15px_rgba(29,185,84,0.4)]"></div>
          Notlarım
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"></i>
            <input 
              type="text" 
              placeholder="Notlarda ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border text-zinc-200 text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNewNote}
            className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-background px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg whitespace-nowrap"
          >
            <i className="fa-solid fa-plus"></i> Yeni Not
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
            {tab === 'Tüm Notlar' && <i className="fa-solid fa-layer-group"></i>}
            {tab === 'Favoriler' && <i className="fa-solid fa-star text-yellow-500/80"></i>}
            {tab !== 'Tüm Notlar' && tab !== 'Favoriler' && <i className="fa-regular fa-folder"></i>}
            {tab}
            
            {activeTab === tab && (
              <motion.div 
                layoutId="activeNoteTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* GRID KARTLARI (NOTLAR) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredNotes.map(note => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -5 }}
                key={note.id} 
                onClick={() => setSelectedNote(note)}
                className="bg-surface border border-border rounded-2xl p-6 hover:border-zinc-500 transition-colors cursor-pointer group h-56 flex flex-col relative shadow-sm hover:shadow-md"
              >
                {/* Sağ üstteki favori ikonu */}
                <div className="absolute top-5 right-5 z-10">
                  <i className={`text-lg transition-transform duration-300 group-hover:scale-110 ${note.favorite ? 'fa-solid fa-star text-yellow-500' : 'fa-regular fa-star text-zinc-600 group-hover:text-zinc-400'}`}></i>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-zinc-800 text-muted px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-border">
                    {note.category || 'Genel'}
                  </span>
                </div>

                <h3 className="font-bold text-white text-xl mb-1 pr-8 truncate group-hover:text-primary transition-colors">
                  {note.title || "Başlıksız Not"}
                </h3>
                
                <div className="flex-1 overflow-hidden relative mt-2">
                  <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                    {/* Eğer içerikte HTML tagleri varsa temizleyip göstermek için basit bir hile (Jodit editörden dolayı HTML gelebilir) */}
                    {note.content ? note.content.replace(/<[^>]+>/g, '') : "İçerik yok..."}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-zinc-500 font-medium">
                  <span>{note.updatedAt ? new Date(note.updatedAt).toLocaleDateString('tr-TR') : 'Tarih Yok'}</span>
                  <i className="fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"></i>
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
          <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
            <i className="fa-regular fa-folder-open text-4xl text-zinc-600"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Not Bulunamadı</h3>
          <p className="text-sm text-muted mb-6 text-center max-w-md">
            Bu kategoride henüz bir notun yok veya aramana uygun sonuç bulunamadı. Hemen yeni bir tane oluştur!
          </p>
          <button 
            onClick={handleCreateNewNote}
            className="text-primary hover:text-primary-hover font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <i className="fa-solid fa-pen-nib"></i> Yazmaya Başla
          </button>
        </motion.div>
      )}
    </div>
  );
}