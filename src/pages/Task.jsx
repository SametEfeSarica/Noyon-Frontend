import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// --- PREMIUM SKELETON COMPONENT ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-zinc-800/60 rounded-md ${className}`}></div>
);

export default function Task() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kanban Sütunları
  const columns = [
    { id: 'TODO', title: 'Yapılacaklar', icon: 'fa-circle-dot', color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
    { id: 'IN_PROGRESS', title: 'Devam Edenler', icon: 'fa-spinner fa-spin', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'DONE', title: 'Tamamlananlar', icon: 'fa-circle-check', color: 'text-primary', bg: 'bg-primary/10' }
  ];

  // API'den verileri çek
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/tasks');
      const data = response.data.content || response.data;
      setTasks(data || []);
    } catch (error) {
      console.error("Görevler çekilemedi:", error);
      // Backend yoksa arayüzü görebilmen için sahte (dummy) veriler
      setTasks([
        { id: 1, title: 'Yeni Arayüz Tasarımı', description: 'Dashboard ve notlar sayfası Tailwind ile yenilenecek.', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-05-10' },
        { id: 2, title: 'Backend JWT Entegrasyonu', description: 'Spring Security ve JWT altyapısı kurulacak.', status: 'DONE', priority: 'MEDIUM', dueDate: '2026-05-01' },
        { id: 3, title: 'Kullanıcı Testleri', description: 'Yeni arayüz için geri bildirim toplanacak.', status: 'TODO', priority: 'LOW', dueDate: '2026-05-15' },
        { id: 4, title: 'Mobil Uyumluluk', description: 'Sidebar mobilde gizlenebilir olacak.', status: 'TODO', priority: 'HIGH', dueDate: '2026-05-12' },
      ]);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  // Görev durumunu (Kolonunu) değiştirme
  const handleStatusChange = async (taskId, newStatus) => {
    // 1. Arayüzü anında güncelle (Optimistic UI - çok hızlı hissettirir)
    const originalTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    // 2. Arka planda sunucuya bildir
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
    } catch (error) {
      console.warn("Test modu: Gerçek API'ye bağlanılamadı, ancak arayüzde değişti simülasyonu yapıldı.");
    }
  };

  // Öncelik rozetleri için renk ayarlayıcı
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'HIGH': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">YÜKSEK</span>;
      case 'MEDIUM': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">ORTA</span>;
      case 'LOW': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">DÜŞÜK</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-background font-sans text-zinc-200 flex flex-col h-screen overflow-hidden">
      
      {/* HEADER ALANI */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight mb-2">
            <div className="w-3 h-8 bg-blue-500 rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
            Görev Takibi
          </h1>
          <p className="text-sm text-muted ml-6">Projelerini Linear hızında yönet ve takip et.</p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => alert("Yeni görev ekleme modalı buraya gelecek!")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg whitespace-nowrap"
        >
          <i className="fa-solid fa-plus"></i> Görev Oluştur
        </motion.button>
      </div>

      {/* KANBAN BOARD (SÜTUNLAR) */}
      <div className="flex-1 flex gap-6 overflow-x-auto custom-scrollbar pb-6 px-1">
        {columns.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);
          
          return (
            <div key={column.id} className="w-80 md:w-96 shrink-0 flex flex-col max-h-full">
              
              {/* Sütun Başlığı */}
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-sm text-zinc-300 flex items-center gap-2 tracking-wide uppercase">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center ${column.bg}`}>
                    <i className={`fa-solid ${column.icon} text-xs ${column.color}`}></i>
                  </span>
                  {column.title}
                </h3>
                <span className="bg-surface border border-border text-muted text-xs font-bold px-2 py-1 rounded-full">
                  {isLoading ? '-' : columnTasks.length}
                </span>
              </div>

              {/* Sütun İçeriği (Görev Kartları) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 pb-10">
                {isLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                ) : columnTasks.length > 0 ? (
                  <AnimatePresence>
                    {columnTasks.map(task => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        key={task.id} 
                        className="bg-surface border border-border rounded-xl p-4 hover:border-zinc-500 transition-colors cursor-pointer group shadow-sm hover:shadow-md relative"
                      >
                        <div className="flex justify-between items-start mb-2">
                          {getPriorityBadge(task.priority)}
                          
                          {/* Hızlı Aksiyon Menüsü (Hover ile görünür) */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {column.id !== 'TODO' && (
                              <button onClick={() => handleStatusChange(task.id, column.id === 'DONE' ? 'IN_PROGRESS' : 'TODO')} className="w-7 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-arrow-left text-xs"></i>
                              </button>
                            )}
                            {column.id !== 'DONE' && (
                              <button onClick={() => handleStatusChange(task.id, column.id === 'TODO' ? 'IN_PROGRESS' : 'DONE')} className="w-7 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-arrow-right text-xs"></i>
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="font-bold text-white text-base leading-snug mb-2 group-hover:text-blue-400 transition-colors">
                          {task.title}
                        </h4>
                        
                        <p className="text-xs text-muted line-clamp-2 mb-4 leading-relaxed">
                          {task.description || 'Açıklama eklenmemiş...'}
                        </p>

                        <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 bg-background px-2 py-1 rounded-md border border-border">
                            <i className="fa-regular fa-calendar"></i>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : 'Tarihsiz'}
                          </div>
                          
                          {/* İkon */}
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-background border border-border`}>
                             <i className={`fa-solid ${column.icon} text-[10px] ${column.color}`}></i>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted text-xs font-medium">
                    Bu alan şimdilik boş
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}