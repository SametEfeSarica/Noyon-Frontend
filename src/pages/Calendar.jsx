import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  // Mevcut ay bilgilerini hesaplamak için basit bir yapı
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0: Pazar, 1: Pazartesi vs.
  
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  useEffect(() => {
    // API İstekleri (Backend hazır olduğunda burası çalışacak)
    const fetchCalendarData = async () => {
      try {
        const userId = localStorage.getItem("userId") || 1;
        const [tasksRes, subsRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/tasks/active?userId=${userId}`),
          axios.get(`http://localhost:8080/api/subscriptions?userId=${userId}`)
        ]);
        
        // Şimdilik gelen veriyi state'e atıyoruz. 
        // Not: Gerçek veriler geldiğinde tarih eşleştirmesi için map'leme yapılmalı.
        setTasks(tasksRes.data);
        setSubscriptions(subsRes.data);
      } catch (error) {
        console.log("Backend bağlantısı kurulamadı, statik veriler gösteriliyor.");
        // Test amaçlı sahte veriler (Backend gelene kadar UI görebilmen için)
        setTasks([{ id: 1, title: 'UI Tasarımı', day: 15 }]);
        setSubscriptions([{ id: 1, title: 'Netflix', day: 22 }]);
      }
    };

    fetchCalendarData();
  }, []);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Takvim ızgarasını oluştur
  const renderCalendarDays = () => {
    const days = [];
    // Pazartesi'den başlatmak için offset (Pazar 0 olduğu için)
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Boş kutular (önceki ayın günleri)
    for (let i = 0; i < offset; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-[#191919] border border-[#2f2f2f] opacity-50"></div>);
    }

    // Ayın günleri
    for (let d = 1; d <= daysInMonth; d++) {
      // Bu güne ait görev veya abonelik var mı kontrol et
      const dayTasks = tasks.filter(t => t.day === d);
      const daySubs = subscriptions.filter(s => s.day === d);
      const isToday = new Date().getDate() === d && new Date().getMonth() === month && new Date().getFullYear() === year;

      days.push(
        <div key={d} className={`min-h-[120px] bg-[#202020] border border-[#2f2f2f] p-2 hover:bg-[#252525] transition-colors relative ${isToday ? 'ring-1 ring-blue-500' : ''}`}>
          <span className={`text-sm font-bold ${isToday ? 'text-blue-400' : 'text-[#737373]'}`}>{d}</span>
          
          <div className="mt-2 space-y-1">
            {/* Görev Etiketleri */}
            {dayTasks.map(task => (
              <div key={`task-${task.id}`} className="bg-[#122a4a] border border-[#1a3a6a] text-[#6b9dff] text-xs px-2 py-1 rounded-md flex items-center gap-2 truncate">
                <i className="fa-solid fa-list-check"></i>
                <span className="truncate">{task.title}</span>
              </div>
            ))}

            {/* Abonelik Etiketleri */}
            {daySubs.map(sub => (
              <div key={`sub-${sub.id}`} className="bg-[#2a1a2f] border border-[#4a2a50] text-[#c96bff] text-xs px-2 py-1 rounded-md flex items-center gap-2 truncate">
                <i className="fa-solid fa-credit-card"></i>
                <span className="truncate">{sub.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="p-8 h-full bg-[#191919] font-sans text-[#D4D4D4]">
      {/* Üst Kısım: Başlık ve Kontroller */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <i className="fa-regular fa-calendar text-[#737373]"></i>
            Takvim
          </h1>
          <p className="text-[#737373] text-sm mt-1">Görevlerinizi ve aboneliklerinizi buradan takip edin.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#202020] p-1 border border-[#2f2f2f] rounded-md shadow-sm">
          <button onClick={prevMonth} className="px-3 py-2 text-[#a3a3a3] hover:text-white hover:bg-[#2f2f2f] rounded-md transition-colors">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="w-32 text-center font-semibold text-white tracking-wide">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="px-3 py-2 text-[#a3a3a3] hover:text-white hover:bg-[#2f2f2f] rounded-md transition-colors">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Takvim Izgarası */}
      <div className="bg-[#202020] rounded-md border border-[#2f2f2f] overflow-hidden shadow-lg">
        {/* Gün İsimleri Header */}
        <div className="grid grid-cols-7 bg-[#1c1c1c] border-b border-[#2f2f2f]">
          {dayNames.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-[#737373] uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Gün Kutuları */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
}