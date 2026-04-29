import { useState } from 'react';

export default function DashboardHome() {
  // Samet'in istediği dinamik değiştirilebilir banner ve profil state'leri
  const [banner, setBanner] = useState('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80');
  const [profilePic, setProfilePic] = useState('https://ui-avatars.com/api/?name=Efe&background=0D8ABC&color=fff&size=200');

  // Sahte not verileri (Favoriler ve Favori olmayanlar)
  const notes = [
    { id: 1, title: 'Biyoloji Notu', isFav: true, date: '2026-04-29' },
    { id: 2, title: 'Ödemelerim', isFav: true, date: '2026-04-28' },
    { id: 3, title: 'Kitaplarım', isFav: false, date: '2026-04-27' },
    { id: 4, title: 'Patronun Görevleri', isFav: false, date: '2026-04-26' },
  ];

  // Favorileri üste alacak şekilde sıralama
  const sortedNotes = [...notes].sort((a, b) => (a.isFav === b.isFav ? 0 : a.isFav ? -1 : 1));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* ÜST: HOŞGELDİN BANNER ALANI (Paint Vizyonu Güncellendi) */}
      <div className="relative h-72 w-full group cursor-pointer overflow-hidden shadow-sm">
        <img src={banner} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        
        {/* Paint Vizyonu - Üst-Orta Yerleşim (Modern İkonografi) */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
          {/* Çizimdeki Güneş ve Bulut Temsili (Modern İkonlar) */}
          <div className="flex items-center space-x-6 text-7xl drop-shadow-md mb-2">
            <span className="text-blue-400 group-hover:rotate-12 transition-transform">☁️</span> {/* Mavi Karalamalar */}
            <span className="text-yellow-400 group-hover:scale-110 transition-transform">☀️</span> {/* Sarı Güneş */}
            <span className="text-gray-400 group-hover:-rotate-12 transition-transform">☁️</span> {/* Gri Bulutlar */}
          </div>
          
          {/* Çizimdeki gibi Kırmızı "HOŞGELDİN" Başlığı */}
          <h1 className="text-6xl font-black text-red-500 tracking-tighter drop-shadow-lg uppercase italic">
            Hoşgeldin
          </h1>
          <p className="text-white mt-3 font-semibold text-xl tracking-tight opacity-90">Bugün harika işler başarmaya hazır mısın?</p>
        </div>
        
        {/* Banner Değiştirme Butonu (Hover'da çıkar) */}
        <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 z-10">
          Banner Değiştir
        </button>
      </div>

      {/* ALT: İKİ SÜTUNLU YAPI (Flexbox/Grid) */}
      <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* SOL TARAF (1/3 Oran): Profil ve Takvim */}
        <div className="col-span-1 space-y-8">
          
          {/* Profil Kartı */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <img src={profilePic} alt="Profil" className="w-40 h-40 rounded-full object-cover border-4 border-gray-50 shadow-md" />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white font-bold text-sm">Resmi Değiştir</span>
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-800">Efe</h2>
            <p className="text-gray-400 font-medium mt-1">Premium Kullanıcı</p>
          </div>

          {/* Modern Takvim Bileşeni */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📅</span> Nisan 2026
            </h3>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(day => (
                <div key={day} className="font-bold text-gray-400">{day}</div>
              ))}
              {/* Takvim Günleri (Örnek Doldurma) */}
              {[...Array(30)].map((_, i) => (
                <div key={i} className={`py-2 rounded-lg font-medium ${i + 1 === 29 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 cursor-pointer'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SAĞ TARAF (2/3 Oran): Not Kartları */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800">Son Çalışmalar</h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-800">Tümünü Gör</button>
          </div>
          
          <div className="space-y-4">
            {sortedNotes.map(note => (
              <div 
                key={note.id} 
                className="group flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-10 rounded-full ${note.isFav ? 'bg-red-400' : 'bg-gray-300'}`}></div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{note.title}</h4>
                    <span className="text-xs font-medium text-gray-400">Oluşturulma: {note.date}</span>
                  </div>
                </div>
                <div>
                  {note.isFav ? (
                    <span className="text-2xl text-red-500 drop-shadow-sm">❤️</span>
                  ) : (
                    <span className="text-2xl text-gray-300 group-hover:text-red-300 transition-colors">🤍</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}