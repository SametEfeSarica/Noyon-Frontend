import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const userId = localStorage.getItem('userId') || 1;
  const [dayName, setDayName] = useState('');
  const bannerRef = useRef(null);
  const profileRef = useRef(null);

  // --- CANLI VERİ STATE'LERİ ---
  const [summary, setSummary] = useState({
    username: 'Yükleniyor...', notesCount: 0, booksCount: 0, tasksCount: 0, totalCost: 0.0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Tümü');
  const tabs = ['Tümü', 'Notlar', 'Kütüphane', 'Görev Takibi', 'Abonelik'];

  // --- PC'DEN RESİM YÜKLEME (Lokal Hafıza) ---
  const [userPics, setUserPics] = useState(() => {
    return {
      profilePic: localStorage.getItem('noyon_profile_pic') || null,
      bannerPic: localStorage.getItem('noyon_banner_pic') || null,
    };
  });

  // --- TÜM VERİLERİ BACKEND'DEN ÇEKME (BEYİN BAĞLANTISI) ---
  useEffect(() => {
    setDayName(new Date().toLocaleDateString('tr-TR', { weekday: 'long' }));

    const fetchAllData = async () => {
      try {
        // 1. ÖZET VERİLERİ ÇEK (Ensar'ın Servisi)
        const summaryRes = await axios.get(`http://localhost:8080/api/dashboard/summary/${userId}`);
        setSummary(summaryRes.data);

        // 2. LİSTELERİ ÇEK (Eğer bazı uçlar henüz backend'de yoksa sayfa çökmesin diye Promise.allSettled kullanıyoruz)
        const [tasksRes, subsRes] = await Promise.allSettled([
          axios.get(`http://localhost:8080/api/tasks/active/${userId}`),
          // Not: Bu abonelik ucu backend'de böyle tanımlanmış varsayıyoruz. 
          // Hata verirse backend'deki SubscriptionController'ı kontrol ederiz.
          axios.get(`http://localhost:8080/api/subscriptions/user/${userId}`) 
        ]);

        let combinedItems = [];
        let calendarEvents = [];

        // Görevleri İşle (Takvim ve Listeye Ekle)
        if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
          tasksRes.value.data.forEach(task => {
            combinedItems.push({ id: `task_${task.id}`, title: task.title, category: 'Görev Takibi', date: task.dueDate, isFav: task.priority === 'HIGH' });
            if (task.dueDate) {
              calendarEvents.push({ id: `ev_task_${task.id}`, day: parseInt(task.dueDate.split('-')[2]), title: task.title, color: 'bg-blue-500' });
            }
          });
        }

        // Abonelikleri İşle (Takvim ve Listeye Ekle)
        if (subsRes.status === 'fulfilled' && subsRes.value.data) {
          subsRes.value.data.forEach(sub => {
            combinedItems.push({ id: `sub_${sub.id}`, title: sub.platformName, category: 'Abonelik', date: `Her ayın ${sub.renewalDate}. günü`, isFav: false });
            if (sub.renewalDate) {
              calendarEvents.push({ id: `ev_sub_${sub.id}`, day: sub.renewalDate, title: sub.platformName, color: 'bg-purple-500' });
            }
          });
        }

        setAllItems(combinedItems);
        setUpcomingEvents(calendarEvents);

      } catch (err) {
        console.error("Beyin bağlantısı kurulamadı:", err);
      }
    };

    fetchAllData();
  }, [userId]);

  // --- DOSYA YÜKLEME MANTIĞI ---
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (type === 'banner') {
          setUserPics(prev => ({ ...prev, bannerPic: base64String }));
          localStorage.setItem('noyon_banner_pic', base64String);
        } else {
          setUserPics(prev => ({ ...prev, profilePic: base64String }));
          localStorage.setItem('noyon_profile_pic', base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredItems = allItems.filter(item => activeTab === 'Tümü' || item.category === activeTab);

  return (
    <div className="flex flex-col min-h-screen bg-[#191919] text-[#D4D4D4] font-sans pb-10">
      
      {/* BANNER ALANI */}
      <div className="relative h-72 w-full group overflow-hidden border-b border-[#2f2f2f] cursor-pointer" onClick={() => bannerRef.current.click()}>
        {userPics.bannerPic ? (
          <img src={userPics.bannerPic} alt="Banner" className="w-full h-full object-cover brightness-75 transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide drop-shadow-lg">Hoşgeldin, Bugün {dayName}</h1>
        </div>
        <input type="file" ref={bannerRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
      </div>

      <div className="flex-1 px-8 lg:px-16 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-screen-2xl mx-auto w-full relative">
        
        {/* SOL SÜTUN: Profil ve Takvim */}
        <div className="lg:col-span-3 flex flex-col space-y-6">
          <div className="flex flex-col items-center mt-[-80px] z-10">
            <div onClick={() => profileRef.current.click()} className="relative group cursor-pointer rounded-full bg-[#202020] p-1.5 shadow-xl transition-transform hover:scale-105">
              {userPics.profilePic ? (
                <img src={userPics.profilePic} alt="Profil" className="w-32 h-32 rounded-full object-cover border border-[#2f2f2f]" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#2a2a2a] border border-[#3f3f3f] flex items-center justify-center"><span className="text-5xl font-bold text-gray-300">N</span></div>
              )}
              <input type="file" ref={profileRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
              <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center"><span className="text-white text-xs font-bold">DEĞİŞTİR</span></div>
            </div>
            {/* CANLI KULLANICI ADI */}
            <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">{summary.username}</h2>
          </div>

          {/* DİNAMİK TAKVİM */}
          <div className="bg-[#202020] p-5 rounded-lg border border-[#2f2f2f] shadow-sm mt-4">
            <h3 className="text-sm font-semibold text-[#a3a3a3] mb-4 uppercase flex items-center tracking-wider">📅 Takvim & Yaklaşanlar</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
              {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(day => <div key={day} className="font-bold text-[#737373] pb-2">{day}</div>)}
              {[...Array(30)].map((_, i) => {
                const dayNum = i + 1;
                const dayEvents = upcomingEvents.filter(e => e.day === dayNum);
                return (
                  <div key={i} className={`relative py-1.5 rounded-md font-medium ${dayNum === new Date().getDate() ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-[#a3a3a3]'}`}>
                    {dayNum}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                        {dayEvents.map(ev => <span key={ev.id} className={`w-1 h-1 rounded-full ${ev.color}`}></span>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SAĞ SÜTUN: İstatistikler ve Şablonlar */}
        <div className="lg:col-span-9 flex flex-col h-full">
          
          {/* YENİ: DİNAMİK İSTATİSTİK KARTLARI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             <div className="bg-[#202020] border border-[#2f2f2f] p-4 rounded-lg flex items-center gap-4">
                <div className="text-3xl">🎯</div>
                <div><p className="text-xs text-[#737373] font-bold uppercase">Aktif Görev</p><h3 className="text-xl font-bold text-blue-400">{summary.tasksCount}</h3></div>
             </div>
             <div className="bg-[#202020] border border-[#2f2f2f] p-4 rounded-lg flex items-center gap-4">
                <div className="text-3xl">💸</div>
                <div><p className="text-xs text-[#737373] font-bold uppercase">Aylık Gider</p><h3 className="text-xl font-bold text-red-400">₺{summary.totalCost}</h3></div>
             </div>
             <div className="bg-[#202020] border border-[#2f2f2f] p-4 rounded-lg flex items-center gap-4">
                <div className="text-3xl">📝</div>
                <div><p className="text-xs text-[#737373] font-bold uppercase">Notlarım</p><h3 className="text-xl font-bold text-orange-400">{summary.notesCount}</h3></div>
             </div>
             <div className="bg-[#202020] border border-[#2f2f2f] p-4 rounded-lg flex items-center gap-4">
                <div className="text-3xl">📚</div>
                <div><p className="text-xs text-[#737373] font-bold uppercase">Kitaplık</p><h3 className="text-xl font-bold text-emerald-400">{summary.booksCount}</h3></div>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 border-b border-[#2f2f2f] pb-4 gap-4">
            <h2 className="text-xl font-bold text-white whitespace-nowrap">Son Aktivitelerin</h2>
            <div className="flex space-x-2 overflow-x-auto w-full md:w-auto custom-scrollbar pb-2 md:pb-0">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#2f2f2f] text-white border border-[#4f4f4f]' : 'text-[#a3a3a3] hover:text-[#D4D4D4] border border-transparent'}`}>{tab}</button>
              ))}
            </div>
          </div>
          
          {/* LİSTE */}
          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div key={item.id} className="group flex items-center justify-between bg-[#202020] p-4 rounded-lg border border-[#2f2f2f] hover:bg-[#252525] transition-all cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className={`w-1 h-8 rounded-full ${item.category === 'Abonelik' ? 'bg-purple-500' : item.category === 'Görev Takibi' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-[#D4D4D4] flex items-center gap-2">{item.title} {item.isFav && <span className="text-red-500 text-xs">❤️</span>}</h4>
                      <div className="flex items-center space-x-2 mt-1 text-[11px] font-medium text-[#737373]">
                        <span className="bg-[#191919] px-2 py-0.5 rounded border border-[#2f2f2f] text-[#a3a3a3]">{item.category}</span>
                        <span>• {item.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-[#202020] border border-[#2f2f2f] border-dashed rounded-lg">
                <span className="text-3xl opacity-40">📂</span>
                <h3 className="mt-3 text-sm font-medium text-[#a3a3a3]">Bu alanda henüz kayıtlı veri yok.</h3>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}