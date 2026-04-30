import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TrashBin() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Notlar'); // Sekme mantığı
  const userId = localStorage.getItem('userId') || 1;

  // Hangi sekme seçiliyse onun çöplerini getir
  const fetchTrash = async () => {
    let endpoint = '';
    if (activeTab === 'Notlar') endpoint = `api/notes/trash/${userId}`;
    else if (activeTab === 'Kütüphane') endpoint = `api/library_items/trash/${userId}`;
    else if (activeTab === 'Abonelikler') endpoint = `api/subscriptions/trash/${userId}`;

    try {
      const response = await axios.get(`http://localhost:8080/${endpoint}`);
      setItems(response.data);
    } catch (err) {
      console.error("Çöp çekilemedi");
      setItems([]);
    }
  };

  useEffect(() => { fetchTrash(); }, [activeTab]);

  const handleRestore = async (id) => {
    let endpoint = '';
    if (activeTab === 'Notlar') endpoint = `api/notes/restore/${id}`;
    else if (activeTab === 'Kütüphane') endpoint = `api/library_items/restore/${id}`;
    else if (activeTab === 'Abonelikler') endpoint = `api/subscriptions/restore/${id}`;

    try {
      await axios.put(`http://localhost:8080/${endpoint}`);
      fetchTrash(); // Listeyi tazele
    } catch (err) { alert("Geri yüklenemedi"); }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#191919] p-8 lg:p-12">
      <div className="mb-10 border-b border-[#2f2f2f] pb-6">
        <h1 className="text-3xl font-bold text-gray-400">🗑️ Noyon Çöp Kutusu</h1>
        
        {/* SEKMELER: Hangisinin çöpüne bakıyoruz? */}
        <div className="flex gap-4 mt-6">
          {['Notlar', 'Kütüphane', 'Abonelikler'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-[#202020] text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-[#1e1e1e] p-4 rounded-lg border border-[#2f2f2f]">
              <div>
                <h4 className="text-sm font-semibold text-gray-300 line-through">
                  {item.title || item.platformName || "İsimsiz Öğe"}
                </h4>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Silinmiş Öğe</span>
              </div>
              <button 
                onClick={() => handleRestore(item.id)}
                className="bg-emerald-600/10 text-emerald-500 border border-emerald-600/30 px-4 py-1.5 rounded text-xs font-bold hover:bg-emerald-600 hover:text-white"
              >
                ♻️ GERİ YÜKLE
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-[#2f2f2f] rounded-lg">
            <h3 className="text-[#737373]">{activeTab} çöpü şu an boş.</h3>
          </div>
        )}
      </div>
    </div>
  );
}