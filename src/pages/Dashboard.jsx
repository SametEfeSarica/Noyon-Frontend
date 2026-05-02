import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// --- PREMIUM SKELETON COMPONENT ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-zinc-800/60 rounded-md ${className}`}></div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [dayName, setDayName] = useState('');
  const bannerRef = useRef(null);
  const profileRef = useRef(null);

  // --- STATE'LER ---
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    username: '', notesCount: 0, booksCount: 0, tasksCount: 0, totalMonthlyCost: 0.0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Tümü');
  const tabs = ['Tümü', 'Notlar', 'Kütüphane', 'Görev Takibi', 'Abonelik'];

  // Lokal Resimler
  const [userPics, setUserPics] = useState(() => ({
    profilePic: localStorage.getItem('noyon_profile_pic') || null,
    bannerPic: localStorage.getItem('noyon_banner_pic') || null,
  }));

  // --- VERİ ÇEKME ---
  useEffect(() => {
    if (!user) return;
    setDayName(new Date().toLocaleDateString('tr-TR', { weekday: 'long' }));

    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        // Backend'in yeni DTO ve JWT sistemine uygun istekler
        const summaryRes = await api.get('/api/dashboard/summary');
        setSummary(summaryRes.data);

        const [tasksRes, subsRes] = await Promise.allSettled([
          api.get('/api/tasks'),
          api.get('/api/subscriptions') 
        ]);

        let combinedItems = [];
        let calendarEvents = [];

        if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
          const tasks = tasksRes.value.data.content || tasksRes.value.data;
          tasks.forEach(task => {
            combinedItems.push({ id: `task_${task.id}`, title: task.title, category: 'Görev Takibi', date: task.dueDate, isFav: task.priority === 'HIGH' });
            if (task.dueDate) {
              calendarEvents.push({ id: `ev_task_${task.id}`, day: parseInt(task.dueDate.split('-')[2]), title: task.title, color: 'bg-primary' });
            }
          });
        }

        if (subsRes.status === 'fulfilled' && subsRes.value.data) {
          subsRes.value.data.forEach(sub => {
            combinedItems.push({ id: `sub_${sub.id}`, title: sub.platformName, category: 'Abonelik', date: `Her ayın ${sub.renewalDay}. günü`, isFav: false });
            if (sub.renewalDay) {
              calendarEvents.push({ id: `ev_sub_${sub.id}`, day: sub.renewalDay, title: sub.platformName, color: 'bg-purple-500' });
            }
          });
        }

        setAllItems(combinedItems);
        setUpcomingEvents(calendarEvents);
      } catch (err) {
        console.error("Dashboard verileri çekilemedi:", err);
      } finally {
        // Yumuşak geçiş için ufak bir gecikme
        setTimeout(() => setIsLoading(false), 400);
      }
    };

    fetchAllData();
  }, [user]);

  // --- DOSYA YÜKLEME VE 2MB KORUMASI ---
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Seçtiğiniz resim 2MB'dan küçük olmalıdır! Aksi takdirde tarayıcı belleği dolar.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (type === 'banner') {
        setUserPics(prev => ({ ...prev, bannerPic: base64String }));
        try { localStorage.setItem('noyon_banner_pic', base64String); } catch(e) {}
      } else {
        setUserPics(prev => ({ ...prev, profilePic: base64String }));
        try { localStorage.setItem('noyon_profile_pic', base64String); } catch(e) {}
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredItems = allItems.filter(item => activeTab === 'Tümü' || item.category === activeTab);

  // --- ANİMASYON VARYASYONLARI ---
  const containerAnim = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemAnim = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-zinc-200 font-sans pb-10">
      
      {/* BANNER ALANI */}
      <div 
        className="relative h-64 md:h-72 w-full group overflow-hidden border-b border-border cursor-pointer bg-surface" 
        onClick={() => bannerRef.current.click()}
      >
        {userPics.bannerPic ? (
          <motion.img 
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            src={userPics.bannerPic} 
            alt="Banner" 
            className="w-full h-full object-cover brightness-[0.65] transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center opacity-30" style={{ backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {isLoading ? (
            <Skeleton className="h-10 w-64 mb-2 bg-zinc-800/40" />
          ) : (
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl"
            >
              Hoşgeldin, {summary.username?.split(' ')[0] || user?.username}
            </motion.h1>
          )}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} className="text-zinc-400 font-medium mt-2 drop-shadow-md">
            Bugün {dayName}, harika bir gün.
          </motion.p>
        </div>
        <input type="file" ref={bannerRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
      </div>

      <div className="flex-1 px-6 lg:px-12 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-screen-2xl mx-auto w-full relative">
        
        {/* SOL SÜTUN: Profil ve Takvim */}
        <div className="lg:col-span-3 flex flex-col space-y-6">
          <div className="flex flex-col items-center mt-[-80px] z-10">
            <div 
              onClick={() => profileRef.current.click()} 
              className="relative group cursor-pointer rounded-full bg-background p-1.5 shadow-xl transition-all duration-300 hover:shadow-glow"
            >
              {userPics.profilePic ? (
                <img src={userPics.profilePic} alt="Profil" className="w-32 h-32 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                  <span className="text-5xl font-black text-zinc-600">
                    {user?.username?.charAt(0).toUpperCase() || 'N'}
                  </span>
                </div>
              )}
              <input type="file" ref={profileRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
              <div className="absolute inset-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
                <i className="fa-solid fa-camera text-white text-xl"></i>
              </div>
            </div>
          </div>

          {/* DİNAMİK TAKVİM */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface p-6 rounded-2xl border border-border shadow-sm"
          >
            <h3 className="text-xs font-bold text-muted mb-5 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-regular fa-calendar text-primary"></i> Yaklaşanlar
            </h3>
            {isLoading ? (
              <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] mb-2">
                {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(day => <div key={day} className="font-bold text-zinc-500 pb-2">{day}</div>)}
                {[...Array(30)].map((_, i) => {
                  const dayNum = i + 1;
                  const dayEvents = upcomingEvents.filter(e => e.day === dayNum);
                  const isToday = dayNum === new Date().getDate();
                  return (
                    <div key={i} className={`relative py-2 rounded-lg font-medium transition-colors ${isToday ? 'bg-primary/20 text-primary border border-primary/30' : 'text-zinc-400 hover:bg-zinc-800'}`}>
                      {dayNum}
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                          {dayEvents.slice(0, 3).map(ev => <span key={ev.id} className={`w-1 h-1 rounded-full ${ev.color}`}></span>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* SAĞ SÜTUN: İstatistikler ve Aktiviteler */}
        <div className="lg:col-span-9 flex flex-col h-full">
          
          {/* İSTATİSTİK KARTLARI */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
          ) : (
            <motion.div variants={containerAnim} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <motion.div variants={itemAnim} whileHover={{ y: -5 }} className="bg-surface border border-border p-5 rounded-2xl flex items-center gap-4 transition-colors hover:bg-zinc-800/50">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 text-xl"><i className="fa-solid fa-list-check"></i></div>
                  <div><p className="text-[10px] text-muted font-bold uppercase tracking-wider">Aktif Görev</p><h3 className="text-2xl font-black text-white">{summary.tasksCount}</h3></div>
               </motion.div>
               <motion.div variants={itemAnim} whileHover={{ y: -5 }} className="bg-surface border border-border p-5 rounded-2xl flex items-center gap-4 transition-colors hover:bg-zinc-800/50">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 text-xl"><i className="fa-solid fa-wallet"></i></div>
                  <div><p className="text-[10px] text-muted font-bold uppercase tracking-wider">Aylık Gider</p><h3 className="text-2xl font-black text-white">₺{summary.totalMonthlyCost}</h3></div>
               </motion.div>
               <motion.div variants={itemAnim} whileHover={{ y: -5 }} className="bg-surface border border-border p-5 rounded-2xl flex items-center gap-4 transition-colors hover:bg-zinc-800/50">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 text-xl"><i className="fa-solid fa-note-sticky"></i></div>
                  <div><p className="text-[10px] text-muted font-bold uppercase tracking-wider">Notlarım</p><h3 className="text-2xl font-black text-white">{summary.notesCount}</h3></div>
               </motion.div>
               <motion.div variants={itemAnim} whileHover={{ y: -5 }} className="bg-surface border border-border p-5 rounded-2xl flex items-center gap-4 transition-colors hover:bg-zinc-800/50">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl"><i className="fa-solid fa-book"></i></div>
                  <div><p className="text-[10px] text-muted font-bold uppercase tracking-wider">Kitaplık</p><h3 className="text-2xl font-black text-white">{summary.booksCount}</h3></div>
               </motion.div>
            </motion.div>
          )}

          {/* FİLTRE TABS */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 border-b border-border pb-4 gap-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-bolt text-primary"></i> Son Aktiviteler
            </h2>
            <div className="flex space-x-1 overflow-x-auto w-full md:w-auto custom-scrollbar pb-2 md:pb-0 bg-surface p-1 rounded-lg border border-border">
              {tabs.map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`px-4 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all duration-200 ${activeTab === tab ? 'bg-zinc-700 text-white shadow-sm' : 'text-muted hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* LİSTE */}
          <div className="space-y-3 pb-8">
            {isLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            ) : filteredItems.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredItems.map(item => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={item.id} 
                    className="group flex items-center justify-between bg-surface p-4 rounded-xl border border-border hover:border-zinc-600 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.category === 'Abonelik' ? 'bg-purple-500/10 text-purple-500' : item.category === 'Görev Takibi' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                        <i className={`fa-solid ${item.category === 'Abonelik' ? 'fa-credit-card' : item.category === 'Görev Takibi' ? 'fa-check' : 'fa-file-lines'}`}></i>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                          {item.title} 
                          {item.isFav && <i className="fa-solid fa-star text-yellow-500 text-[10px]"></i>}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1 text-[11px] font-semibold text-muted">
                          <span>{item.category}</span>
                          <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fa-solid fa-chevron-right text-zinc-500 text-sm"></i>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-surface border border-border border-dashed rounded-2xl"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                  <i className="fa-solid fa-ghost text-2xl text-zinc-500"></i>
                </div>
                <h3 className="text-sm font-bold text-zinc-300">Burası şimdilik sessiz...</h3>
                <p className="text-xs text-muted mt-1">Bu kategoride henüz bir aktivite bulunmuyor.</p>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}