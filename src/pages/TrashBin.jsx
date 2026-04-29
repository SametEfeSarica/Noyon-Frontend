import React, { useState, useEffect } from 'react';

export default function TrashBin() {
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. VERİ ÇEKME (READ): Sayfa yüklendiğinde çöpleri getir
  useEffect(() => {
    fetch('http://localhost:8080/api/notes/trash/1')
      .then(res => res.json())
      .then(data => {
        setTrashedNotes(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Çöp kutusu yüklenirken hata oluştu:", err);
        setLoading(false);
      });
  }, []);

  // 2. GERİ YÜKLEME (RESTORE) İŞLEMİ
  const handleRestore = (noteId) => {
    fetch(`http://localhost:8080/api/notes/restore/${noteId}`, {
      method: 'PUT',
    })
      .then(res => {
        if (res.ok) {
          // Başarılıysa listeden anında kaldır (ekranı güncelle)
          setTrashedNotes(prev => prev.filter(note => note.id !== noteId));
          alert("Not başarıyla geri yüklendi!");
        }
      })
      .catch(err => console.error("Geri yükleme hatası:", err));
  };

  return (
    <div className="flex flex-col min-h-full bg-[#fcfcfc] font-sans p-12">
      <div className="max-w-[1200px] mx-auto w-full">
        
        {/* Başlık Alanı - Soluk Kırmızı/Gri Tonlar */}
        <div className="mb-10 border-b border-gray-100 pb-8">
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase mb-2">Çöp Kutusu</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">
            Silinen öğeler burada 30 gün boyunca saklanır.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest animate-pulse">
            Yükleniyor...
          </div>
        ) : trashedNotes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {trashedNotes.map(note => (
              <div 
                key={note.id} 
                className="group flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 hover:border-red-100 transition-all shadow-sm"
              >
                <div className="flex items-center space-x-6">
                  <span className="text-3xl opacity-40 grayscale group-hover:grayscale-0 transition-all">
                    {note.icon || '📝'}
                  </span>
                  <div>
                    <h4 className="text-base font-black text-gray-700 tracking-tight uppercase">
                      {note.title}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">
                      SİLİNME TARİHİ: {note.deletedAt || 'Belirtilmedi'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleRestore(note.id)}
                  className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  Geri Yükle
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <span className="text-5xl mb-4 opacity-20">🗑️</span>
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Çöp kutusu boş</p>
          </div>
        )}
      </div>
    </div>
  );
}