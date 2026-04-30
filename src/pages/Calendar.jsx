import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDay, setNewTaskDay] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('task');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const fetchCalendarData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const response = await axios.get(`https://dentist-antelope-vowel.ngrok-free.dev/api/calendar/${userId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Veriler çekilemedi:", error);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [month, year]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    
    if (!newTaskTitle || !newTaskDay) return;

    const newTaskData = {
      userId: userId,
      title: newTaskTitle,
      day: parseInt(newTaskDay),
      month: month + 1,
      year: year,
      category: newTaskCategory
    };

    try {
      await axios.post('https://dentist-antelope-vowel.ngrok-free.dev/api/calendar/add', newTaskData);
      setIsModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDay('');
      fetchCalendarData();
    } catch (error) {
      console.error("Etkinlik eklenemedi:", error);
      alert("Eklerken bir hata oluştu. Lütfen bağlantıyı kontrol et.");
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const renderCalendarDays = () => {
    const days = [];
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < offset; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-[#191919] border-r border-b border-[#2f2f2f] opacity-30"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayEvents = tasks.filter(t => t.day === d);
      const isToday = new Date().getDate() === d && new Date().getMonth() === month && new Date().getFullYear() === year;

      days.push(
        <div key={d} className={`min-h-[120px] bg-[#1e1e1e] border-r border-b border-[#2f2f2f] p-3 hover:bg-[#252525] transition-all relative group ${isToday ? 'bg-[#232323] shadow-inner' : ''}`}>
          <div className="flex justify-between items-start">
            <span className={`text-sm font-semibold ${isToday ? 'text-white bg-[#333] px-2 py-0.5 rounded-full' : 'text-[#737373]'}`}>{d}</span>
            <button 
              onClick={() => { setNewTaskDay(d); setIsModalOpen(true); }} 
              className="text-[#555] hover:text-white opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
            >
              <i className="fa-solid fa-plus text-sm"></i>
            </button>
          </div>
          
          <div className="mt-3 space-y-1.5">
            {dayEvents.map(event => (
              <div key={`event-${event.id}`} className={`text-xs px-2.5 py-1.5 rounded-md flex items-center gap-2 truncate font-medium ${
                event.category === 'task' ? 'bg-[#1a2332] text-[#8cb4ff]' : 'bg-[#2a1a2f] text-[#d68cff]'
              }`}>
                <i className={`fa-solid ${event.category === 'task' ? 'fa-circle-check' : 'fa-bolt'} opacity-70`}></i>
                <span className="truncate">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="p-8 h-full bg-[#141414] font-sans text-[#D4D4D4] relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
            Takvim
          </h1>
          <p className="text-[#737373] text-sm mt-1">Aylık görev ve abonelik planlaması.</p>
        </div>
        
        <div className="flex items-center gap-5">
          {/* Yeni Ekle Butonu - Resimdeki Referans Tasarım */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-2.5 rounded-md font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <span className="text-xl font-normal leading-none mt-[-2px]">+</span>
            Yeni Ekle
          </button>

          <div className="flex items-center gap-2 bg-[#1e1e1e] p-1.5 border border-[#333] rounded-lg shadow-sm">
            <button onClick={prevMonth} className="px-3 py-1.5 text-[#888] hover:text-white hover:bg-[#2f2f2f] rounded-md transition-colors">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <span className="w-28 text-center font-medium text-[#e5e5e5]">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="px-3 py-1.5 text-[#888] hover:text-white hover:bg-[#2f2f2f] rounded-md transition-colors">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 bg-[#181818] border-b border-[#333]">
          {dayNames.map(day => (
            <div key={day} className="py-3.5 text-center text-[11px] font-bold text-[#666] uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-t border-[#2f2f2f]">
          {renderCalendarDays()}
        </div>
      </div>

      {/* ULTRA PREMIUM MODAL (Glassmorphism & Kolay Çıkış) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-[#181818] w-full max-w-sm rounded-2xl border border-[#333] shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#2a2a2a]">
              <h3 className="font-bold text-white text-lg tracking-tight">Yeni Etkinlik</h3>
              <p className="text-[#737373] text-xs mt-1">Takvime yeni bir kayıt oluştur.</p>
            </div>
            
            <form onSubmit={handleAddTask} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-[#666] uppercase tracking-wider mb-2">Başlık</label>
                <input 
                  type="text" required value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] text-white rounded-lg py-3 px-4 focus:outline-none focus:border-[#666] transition-colors text-sm"
                  placeholder="Örn: Proje Teslimi"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase tracking-wider mb-2">Gün</label>
                  <input 
                    type="number" min="1" max="31" required value={newTaskDay} onChange={(e) => setNewTaskDay(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white rounded-lg py-3 px-4 focus:outline-none focus:border-[#666] transition-colors text-sm"
                    placeholder="1-31"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase tracking-wider mb-2">Kategori</label>
                  <select 
                    value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white rounded-lg py-3 px-4 focus:outline-none focus:border-[#666] transition-colors text-sm appearance-none"
                  >
                    <option value="task">Görev</option>
                    <option value="sub">Abonelik</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-2 border-t border-[#2a2a2a]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-1/2 bg-transparent hover:bg-[#252525] text-[#888] hover:text-white font-semibold py-3 rounded-lg transition-colors border border-[#333] text-sm"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-[#28a745] hover:bg-[#218838] text-white font-bold py-3 rounded-lg transition-colors text-sm shadow-md"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}