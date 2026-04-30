import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';

export default function Notes() {
  // --- STATE YÖNETİMİ ---
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('Tüm Notlar');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tekil Not (Detay Sayfası) State'leri
  const [selectedNote, setSelectedNote] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const sigCanvas = useRef({});

  const tabs = ["Tüm Notlar", "Favoriler", "Roman", "Yazılım", "Tarih"];

  // --- API İŞLEMLERİ (NGROK TÜNELİ) ---
  const fetchNotes = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const response = await axios.get(`https://dentist-antelope-vowel.ngrok-free.dev/api/notes/${userId}`);
      // Eğer backend boş dönerse diye hata almamak için güvenlik:
      setNotes(response.data || []);
    } catch (error) {
      console.error("Notlar çekilemedi:", error);
      // Backend hazır olana kadar arayüzü görebilmen için sahte Samsung Notes tarzı veriler
      setNotes([
        { id: 1, title: 'Clean Code Özetleri', content: 'Fonksiyonlar kısa olmalı ve tek bir iş yapmalıdır...', category: 'Yazılım', isFavorite: true, date: '30 Nis 2026' },
        { id: 2, title: 'Yeni Proje Fikirleri', content: 'Kütüphane uygulaması için veritabanı şeması tasarımı.', category: 'Tüm Notlar', isFavorite: false, date: '29 Nis 2026' },
        { id: 3, title: 'Tarih Sınavı Notları', content: 'Osmanlı yükselme dönemi önemli antlaşmalar.', category: 'Tarih', isFavorite: false, date: '25 Nis 2026' },
      ]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Yeni Not Ekleme (Taslak olarak açar)
  const handleCreateNewNote = () => {
    setSelectedNote({
      id: 'new',
      title: '',
      content: '',
      category: activeTab === 'Tüm Notlar' || activeTab === 'Favoriler' ? 'Genel' : activeTab,
      isFavorite: false,
    });
  };

  // Notu Kaydetme
  const handleSaveNote = async () => {
    const userId = localStorage.getItem("userId");
    // Eğer el yazısı varsa onu da base64 olarak alabiliriz
    const drawingData = isDrawingMode && !sigCanvas.current.isEmpty() 
      ? sigCanvas.current.getTrimmedCanvas().toDataURL('image/png') 
      : null;

    const notePayload = {
      ...selectedNote,
      userId,
      drawing: drawingData
    };

    try {
      if (selectedNote.id === 'new') {
        await axios.post('https://dentist-antelope-vowel.ngrok-free.dev/api/notes/add', notePayload);
      } else {
        await axios.put(`https://dentist-antelope-vowel.ngrok-free.dev/api/notes/update/${selectedNote.id}`, notePayload);
      }
      setSelectedNote(null);
      setIsDrawingMode(false);
      fetchNotes(); // Listeyi yenile
    } catch (error) {
      console.error("Not kaydedilemedi:", error);
      alert("Backend bağlantısında sorun var, ancak arayüz çalışıyor!");
      setSelectedNote(null); // Şimdilik test için kapat
    }
  };

  // --- FİLTRELEME ---
  const filteredNotes = notes.filter(note => {
    const matchesTab = activeTab === 'Tüm Notlar' ? true : (activeTab === 'Favoriler' ? note.isFavorite : note.category === activeTab);
    const matchesSearch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // ==========================================
  // EKRAN 2: TEKİL NOT SAYFASI (EDİTÖR)
  // ==========================================
  if (selectedNote) {
    return (
      <div className="p-8 h-full bg-[#141414] font-sans text-[#D4D4D4] flex flex-col">
        {/* Üst Toolbar */}
        <div className="flex items-center justify-between mb-6 bg-[#1e1e1e] p-4 rounded-2xl border border-[#333]">
          <button onClick={() => setSelectedNote(null)} className="text-[#888] hover:text-white flex items-center gap-2 transition-colors">
            <i className="fa-solid fa-arrow-left"></i> Geri Dön
          </button>
          
          <div className="flex items-center gap-4">
            {/* Araç Çubuğu */}
            <label className="cursor-pointer text-[#888] hover:text-[#4da3ff] transition-colors" title="Resim Ekle">
              <i className="fa-solid fa-image text-lg"></i>
              <input type="file" className="hidden" accept="image/*" />
            </label>
            <label className="cursor-pointer text-[#888] hover:text-[#ff4d4d] transition-colors" title="PDF Ekle">
              <i className="fa-solid fa-file-pdf text-lg"></i>
              <input type="file" className="hidden" accept=".pdf" />
            </label>
            <button 
              onClick={() => setIsDrawingMode(!isDrawingMode)} 
              className={`text-lg transition-colors ${isDrawingMode ? 'text-[#ffb84d]' : 'text-[#888] hover:text-[#ffb84d]'}`}
              title="El Yazısı / Çizim"
            >
              <i className="fa-solid fa-pen-nib"></i>
            </button>
            <div className="w-px h-6 bg-[#333] mx-2"></div>
            <button onClick={handleSaveNote} className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md transition-colors">
              Kaydet
            </button>
          </div>
        </div>

        {/* Not İçeriği Alanı (Samsung Notes Tarzı Kağıt Hissi) */}
        <div className="flex-1 bg-[#1e1e1e] rounded-2xl border border-[#333] p-8 flex flex-col overflow-hidden relative">
          <input 
            type="text" 
            placeholder="Not Başlığı..." 
            value={selectedNote.title}
            onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
            className="text-3xl font-bold bg-transparent border-none outline-none text-white placeholder-[#555] mb-4"
          />
          <p className="text-[#666] text-xs mb-6 font-medium">{new Date().toLocaleDateString('tr-TR')} | {selectedNote.category}</p>

          {isDrawingMode ? (
            <div className="flex-1 bg-[#252525] rounded-xl border border-[#444] cursor-crosshair relative">
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button onClick={() => sigCanvas.current.clear()} className="bg-[#333] text-white p-2 rounded-md hover:bg-[#444] text-xs"><i className="fa-solid fa-eraser"></i> Temizle</button>
              </div>
              <SignatureCanvas 
                ref={sigCanvas} 
                penColor="white"
                canvasProps={{className: 'w-full h-full'}} 
              />
            </div>
          ) : (
            <textarea 
              placeholder="Notlarınızı buraya yazın..."
              value={selectedNote.content}
              onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
              className="flex-1 bg-transparent border-none outline-none text-[#e5e5e5] resize-none leading-relaxed"
            />
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // EKRAN 1: SAMSUNG NOTES TARZI LİSTELEME
  // ==========================================
  return (
    <div className="p-8 h-full bg-[#141414] font-sans text-[#D4D4D4]">
      {/* HEADER BÖLÜMÜ (Görseldeki yapıya uygun) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <i className="fa-solid fa-book-bookmark text-[#888]"></i>
          Notlar
        </h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Arama Çubuğu */}
          <div className="relative w-full md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-[#737373] text-sm"></i>
            <input 
              type="text" 
              placeholder="Not veya içerik ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#333] text-white text-sm rounded-full py-2.5 pl-9 pr-4 focus:outline-none focus:border-[#666] transition-colors"
            />
          </div>
          
          {/* Yeni Not Butonu (Görseldeki Yeşil) */}
          <button 
            onClick={handleCreateNewNote}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-2.5 rounded-md font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap shadow-md"
          >
            <span className="text-xl font-normal leading-none mt-[-2px]">+</span>
            Yeni Not Ekle
          </button>
        </div>
      </div>

      {/* KLASÖRLER / SEKMELER (Görseldeki yapının modern hali) */}
      <div className="flex items-center gap-6 border-b border-[#333] mb-8 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold text-sm whitespace-nowrap transition-colors relative ${
              activeTab === tab ? 'text-white' : 'text-[#737373] hover:text-[#a3a3a3]'
            }`}
          >
            {tab === 'Tüm Notlar' && <i className="fa-solid fa-layer-group mr-2"></i>}
            {tab === 'Favoriler' && <i className="fa-solid fa-heart mr-2"></i>}
            {tab !== 'Tüm Notlar' && tab !== 'Favoriler' && <i className="fa-solid fa-folder mr-2"></i>}
            {tab}
            {/* Aktif Tab Çizgisi */}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-t-md"></div>
            )}
          </button>
        ))}
      </div>

      {/* SAMSUNG NOTES TARZI GRID KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredNotes.map(note => (
          <div 
            key={note.id} 
            onClick={() => setSelectedNote(note)}
            className="bg-[#1e1e1e] border border-[#333] rounded-2xl p-5 hover:bg-[#252525] hover:border-[#555] hover:shadow-xl transition-all cursor-pointer group h-56 flex flex-col relative"
          >
            {/* Favori Kalbi */}
            <div className="absolute top-4 right-4 z-10">
              <i className={`fa-heart text-lg transition-colors ${note.isFavorite ? 'fa-solid text-[#ff4d4d]' : 'fa-regular text-[#555] group-hover:text-[#888]'}`}></i>
            </div>

            <h3 className="font-bold text-white text-lg mb-2 pr-6 truncate">{note.title || "Başlıksız Not"}</h3>
            <p className="text-[#888] text-xs font-medium mb-3">{note.date || 'Tarih Yok'}</p>
            
            {/* Not İçeriği Önizlemesi */}
            <div className="flex-1 overflow-hidden">
              <p className="text-[#a3a3a3] text-sm leading-relaxed line-clamp-4">
                {note.content || "Henüz bir içerik girilmedi..."}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-[#333] flex justify-between items-center text-xs text-[#666]">
              <span className="bg-[#141414] px-2 py-1 rounded-md border border-[#2a2a2a]">{note.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Boş Durum Ekranı */}
      {filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[#555]">
          <i className="fa-regular fa-folder-open text-6xl mb-4 opacity-50"></i>
          <p className="text-lg font-medium">Bu klasörde hiç not yok</p>
          <p className="text-sm mt-1">Hemen yeni bir tane oluştur!</p>
        </div>
      )}
    </div>
  );
  
}