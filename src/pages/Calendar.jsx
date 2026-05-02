import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// --- PREMIUM SKELETON COMPONENT ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-zinc-800/60 rounded-md ${className}`}></div>
);

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- API / VERİ ÇEKME ---
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      // Gerçek senaryoda backend'den o aya ait takvim verilerini çekeceğiz
      // const response = await api.get(`/api/calendar/events?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`);
      // setEvents(response.data);

      // Backend tam hazır olana kadar arayüzü dolu göstermek için simülasyon:
      setTimeout(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        setEvents([
          { id: 1, title: 'Proje Teslimi', date: new Date(year, month, 15), type: 'task', color: 'bg-blue-500', icon: 'fa-check' },
          { id: 2, title: 'Netflix Yenileme', date: new Date(year, month, 22), type: 'sub', color: 'bg-purple-500', icon: 'fa-credit-card' },
          { id: 3, title: 'Ekip Toplantısı', date: new Date(year, month, 5), type: 'event', color: 'bg-emerald-500', icon: 'fa-calendar' },
          { id: 4, title: 'Fatura Ödemesi', date: new Date(year, month, 5), type: 'sub', color: 'bg-purple-500', icon: 'fa-wallet' },
          { id: 5, title: 'Spora Başla', date: new Date(year, month, 28), type: 'event', color: 'bg-yellow-500', icon: 'fa-dumbbell' },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Takvim verileri çekilemedi:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, currentDate]);

  // --- TAKVİM HESAPLAMALARI ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Pazartesiyi haftanın ilk günü yapıyoruz (JS'de 0 Pazar'dır)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const getEventsForDay = (day) => {
    return events.filter(e => e.date.getDate() === day);
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-background font-sans text-zinc-200 flex flex-col h-screen overflow-hidden">
      
      {/* HEADER: Başlık ve Kontroller */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 text-2xl border border-orange-500/20 shadow-sm">
            <i className="fa-regular fa-calendar-days"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
              {monthNames[currentDate.getMonth()]} 
              <span className="text-xl font-bold text-muted">{currentDate.getFullYear()}</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={goToday}
            className="px-4 py-2 bg-surface hover:bg-zinc-800 border border-border text-sm font-bold text-zinc-300 rounded-lg transition-colors shadow-sm"
          >
            Bugün
          </button>
          <div className="flex items-center bg-surface border border-border rounded-lg p-1 shadow-sm">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 text-muted hover:text-white transition-colors">
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <div className="w-px h-4 bg-border mx-1"></div>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 text-muted hover:text-white transition-colors">
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert("Yeni etkinlik ekleme modalı açılacak")}
            className="ml-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-md"
          >
            <i className="fa-solid fa-plus"></i> Ekle
          </motion.button>
        </div>
      </div>

      {/* TAKVİM GRID ALANI */}
      <div className="flex-1 bg-surface border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm">
        
        {/* Haftanın Günleri (Başlık Satırı) */}
        <div className="grid grid-cols-7 border-b border-border bg-zinc-900/50">
          {dayNames.map((day, i) => (
            <div key={day} className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${i >= 5 ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Günler (Hücreler) */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-hidden bg-zinc-900/20">
          {isLoading ? (
             [...Array(35)].map((_, i) => (
               <div key={`skel-${i}`} className="border-r border-b border-border/50 p-2">
                 <Skeleton className="w-6 h-6 rounded-full mb-2" />
                 <Skeleton className="w-full h-4 rounded mt-1" />
               </div>
             ))
          ) : (
            <>
              {/* Ayın ilk gününden önceki boşluklar */}
              {[...Array(startDay)].map((_, i) => (
                <div key={`empty-${i}`} className="border-r border-b border-border/50 bg-zinc-900/40 p-2 opacity-50"></div>
              ))}

              {/* Gerçek Günler */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);

                return (
                  <div key={day} className={`border-r border-b border-border/50 p-2 flex flex-col transition-colors hover:bg-zinc-800/30 group ${isCurrentDay ? 'bg-orange-500/5' : ''}`}>
                    
                    {/* Gün Numarası */}
                    <div className="flex justify-between items-start mb-1">
                      <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full ${
                        isCurrentDay ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'text-zinc-400 group-hover:text-white transition-colors'
                      }`}>
                        {day}
                      </div>
                    </div>

                    {/* Etkinlik Rozetleri */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                      {dayEvents.map(ev => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={ev.id} 
                          title={ev.title}
                          className={`text-[10px] font-bold px-1.5 py-1 rounded border flex items-center gap-1.5 cursor-pointer hover:brightness-125 transition-all truncate
                            ${ev.color === 'bg-blue-500' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                            ${ev.color === 'bg-purple-500' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
                            ${ev.color === 'bg-emerald-500' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                            ${ev.color === 'bg-yellow-500' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : ''}
                          `}
                        >
                          <i className={`fa-solid ${ev.icon} text-[8px]`}></i>
                          <span className="truncate">{ev.title}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Ayın son gününden sonraki boşluklar (Grid'i tamamlamak için) */}
              {[...Array(42 - (startDay + daysInMonth))].slice(0, 35 - (startDay + daysInMonth) >= 0 ? 35 - (startDay + daysInMonth) : 42 - (startDay + daysInMonth)).map((_, i) => (
                <div key={`empty-end-${i}`} className="border-r border-b border-border/50 bg-zinc-900/40 p-2 opacity-50"></div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}