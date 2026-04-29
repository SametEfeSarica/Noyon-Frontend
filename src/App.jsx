import { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';

function DashboardHome() {
  const [bannerImage, setBannerImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  
  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('Tümü');

  const handleUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) setter(URL.createObjectURL(file));
  };

  const allContents = [
    { id: 1, category: 'Notlar', title: 'Biyoloji Vize Notları', time: '10 dk önce', icon: '📝' },
    { id: 2, category: 'Kütüphane', title: 'Aylık Gider Şablonu', time: '2 saat önce', icon: '📊' },
    { id: 3, category: 'Projeler', title: 'Noyon Frontend Tasarımı', time: 'Dün', icon: '💻' },
    { id: 4, category: 'Notlar', title: 'Toplantı Özetleri', time: '2 gün önce', icon: '📝' },
    { id: 5, category: 'Kütüphane', title: 'Antrenman Programı', time: '3 gün önce', icon: '🏋️' },
    { id: 6, category: 'Projeler', title: 'Veritabanı Mimarisi', time: '1 hafta önce', icon: '🗄️' },
    { id: 7, category: 'Abonelikler', title: 'Premium Plan (Yıllık)', time: 'Aktif', icon: '⭐' },
    { id: 8, category: 'Abonelikler', title: 'Ekstra 50GB Bulut Alanı', time: 'Oto Yenileme', icon: '☁️' },
  ];

  const filteredContents = activeTab === 'Tümü' 
    ? allContents 
    : allContents.filter(item => item.category === activeTab);

  return (
    <div className="flex flex-col min-h-full bg-[#fcfcfc] font-sans pb-10">
      
      {/* 1. DİNAMİK BANNER ALANI */}
      <div 
        className="relative h-40 w-full bg-[#1e1b4b] overflow-hidden shadow-sm flex items-center justify-center flex-col z-20 group cursor-pointer"
        onClick={() => bannerInputRef.current.click()}
      >
        {bannerImage ? (
          <img src={bannerImage} alt="Banner" className="absolute inset-0 w-full h-full object-cover brightness-50 transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        )}

        <div className="flex flex-col items-center z-10 text-center px-4 mt-2">
          <div className="flex items-center space-x-6 mb-2 opacity-80">
             <span className="text-white text-2xl">☁️</span>
             <span className="text-yellow-400 text-3xl animate-pulse">☀️</span>
             <span className="text-white text-2xl">☁️</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-[0.2em] uppercase leading-tight drop-shadow-md" style={{ fontFamily: 'Georgia, serif' }}>
            Hoşgeldin
          </h1>
          <div className="h-px w-20 bg-white/40 my-3"></div>
          <p className="text-white font-bold text-xs tracking-[0.2em] uppercase italic drop-shadow-sm">
            Efe, vizyonunu bugün gerçeğe dönüştür.
          </p>
        </div>

        <div className="absolute bottom-4 right-6 bg-black/50 backdrop-blur-md px-3 py-1 rounded text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
          Arka Planı Değiştir
        </div>
        <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, setBannerImage)} />
      </div>
      
      {/* 2. İÇERİK IZGARASI */}
      <div className="flex-1 px-12 py-10 max-w-[1400px] mx-auto w-full grid grid-cols-1 xl:grid-cols-4 gap-10 -mt-8 z-30">
        
        {/* SOL SÜTUN */}
        <div className="col-span-1 space-y-10">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200 flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); profileInputRef.current.click(); }}>
              {profileImage ? (
                <img src={profileImage} alt="Profil" className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl" />
              ) : (
                <div className="w-36 h-36 rounded-full bg-gray-50 border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 group-hover:bg-indigo-50 transition-all">
                  <span className="text-xs font-bold uppercase tracking-widest">Fotoğraf</span>
                </div>
              )}
              <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, setProfileImage)} />
            </div>
            <h2 className="mt-6 text-2xl font-black text-gray-900 tracking-tight">Efe</h2>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-200 pb-4">Nisan 2026</h3>
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-black text-gray-400 mb-4">
              {['PT', 'SA', 'ÇA', 'PE', 'CU', 'CT', 'PZ'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              <div className="py-2 text-gray-300 font-bold">30</div>
              {[...Array(29)].map((_, i) => (
                <div key={i} className={`py-2 rounded-lg font-bold transition-colors ${i + 1 === 29 ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-800 hover:bg-gray-100'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SAĞ SÜTUN */}
        <div className="col-span-1 xl:col-span-3 flex flex-col h-full w-full overflow-hidden">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-10 flex-1 flex flex-col w-full">
            
            {/* BAŞLIK VE SEKMELER (SABİTLENDİ) */}
            <div className="flex items-center justify-between mb-10 w-full overflow-hidden">
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter whitespace-nowrap mr-6">NOTLAR</h2>
              
              {/* Flex-wrap kaldırıldı, whitespace-nowrap eklendi, kaydırma engellendi */}
              <div 
                className="flex items-center space-x-1 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto"
                style={{ scrollbarWidth: 'none' }} /* Kaydırma çubuğunu gizler */
              >
                {['Tümü', 'Notlar', 'Kütüphane', 'Projeler', 'Abonelikler'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-4 lg:px-5 py-2 rounded-xl text-[11px] lg:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-indigo-700 shadow-md border border-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              {filteredContents.map(work => (
                <div key={work.id} className="group flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer shadow-sm hover:shadow-md">
                  <div className="flex items-center space-x-6 overflow-hidden">
                    <span className="text-3xl opacity-90 group-hover:scale-110 transition-transform flex-shrink-0">{work.icon}</span>
                    <div className="truncate">
                      <h4 className="text-base font-black text-gray-900 tracking-tight group-hover:text-indigo-700 transition-colors uppercase truncate">{work.title}</h4>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1 block truncate">{work.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 flex-shrink-0">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest hidden sm:block">{work.time}</span>
                    <button className="text-gray-400 hover:text-gray-800 transition-colors text-2xl">•••</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardLayout />}><Route index element={<DashboardHome />} /></Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;