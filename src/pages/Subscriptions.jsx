import { useState, useEffect } from 'react';
import axios from 'axios'; // Metin Axios kullanıyordu

export default function Subscriptions() {
  // --- STATE YÖNETİMİ ---
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Yeni abonelik formu için state
  const [newSub, setNewSub] = useState({
    platformName: '',
    amount: '',
    renewalDate: ''
  });

  // Kullanıcı ID'sini LocalStorage'dan alıyoruz (Auth sisteminden gelmeli)
  const userId = localStorage.getItem('userId') || 1; // Şimdilik test için default 1

  // --- API İŞLEMLERİ (SWAGGER'A GÖRE) ---
  
  // 1. Abonelikleri Getir (READ)
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // Backend URL'niz neyse (örn: http://localhost:8080) baseURL olarak ayarlı varsayıyorum
      const response = await axios.get(`http://localhost:8080/api/subscriptions/user/${userId}`);
      setSubscriptions(response.data);
      setError('');
    } catch (err) {
      console.error("Abonelikler çekilemedi:", err);
      setError('Abonelikler yüklenirken bir hata oluştu. Backend açık mı?');
      // Backend kapalıyken tasarımı görebilmeniz için geçici sahte veri (İleride silinecek)
      setSubscriptions([
        { id: 1, platformName: 'Netflix', amount: 250, renewalDate: 15 },
        { id: 2, platformName: 'Spotify', amount: 60, renewalDate: 5 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa açıldığında verileri çek
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // 2. Yeni Abonelik Ekle (CREATE)
  const handleAddSubscription = async (e) => {
    e.preventDefault();
    if (!newSub.platformName || !newSub.amount || !newSub.renewalDate) return;

    try {
      await axios.post(`http://localhost:8080/api/subscriptions/add/${userId}`, newSub);
      setNewSub({ platformName: '', amount: '', renewalDate: '' }); // Formu temizle
      fetchSubscriptions(); // Listeyi güncelle
    } catch (err) {
      console.error("Eklenemedi:", err);
      alert("Abonelik eklenirken hata oluştu!");
    }
  };

  // 3. Abonelik Sil (DELETE)
  const handleDelete = async (id) => {
    if (!window.confirm("Bu aboneliği silmek istediğine emin misin?")) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/subscriptions/${id}`);
      fetchSubscriptions(); // Listeyi güncelle
    } catch (err) {
      console.error("Silinemedi:", err);
      alert("Silme işlemi başarısız!");
    }
  };

  // --- ARAYÜZ (NOTION DARK THEME) ---
  return (
    <div className="flex flex-col min-h-full bg-[#191919] p-8 lg:p-12">
      
      {/* Üst Başlık Alanı */}
      <div className="mb-10 border-b border-[#2f2f2f] pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span>💳</span> Abonelik Yönetimi
        </h1>
        <p className="text-[#a3a3a3] mt-2 text-sm">Aylık dijital ödemelerini ve yenilenme tarihlerini takip et.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* SOL SÜTUN: YENİ EKLEME FORMU (4 Kolon) */}
        <div className="lg:col-span-4">
          <div className="bg-[#202020] p-6 rounded-lg border border-[#2f2f2f] shadow-sm sticky top-10">
            <h2 className="text-lg font-semibold text-white mb-6 border-b border-[#2f2f2f] pb-3">Yeni Abonelik Ekle</h2>
            
            <form onSubmit={handleAddSubscription} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#a3a3a3] uppercase mb-2">Platform Adı</label>
                <input 
                  type="text" 
                  value={newSub.platformName}
                  onChange={(e) => setNewSub({...newSub, platformName: e.target.value})}
                  placeholder="Örn: Netflix, Adobe..." 
                  className="w-full bg-[#191919] text-[#D4D4D4] border border-[#3f3f3f] rounded-md py-2.5 px-3 focus:outline-none focus:border-[#60a5fa] transition-colors text-sm"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a3a3a3] uppercase mb-2">Aylık Tutar (₺)</label>
                  <input 
                    type="number" 
                    value={newSub.amount}
                    onChange={(e) => setNewSub({...newSub, amount: e.target.value})}
                    placeholder="250" 
                    className="w-full bg-[#191919] text-[#D4D4D4] border border-[#3f3f3f] rounded-md py-2.5 px-3 focus:outline-none focus:border-[#60a5fa] transition-colors text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a3a3a3] uppercase mb-2">Yenilenme (Gün)</label>
                  <input 
                    type="number" 
                    min="1" max="31"
                    value={newSub.renewalDate}
                    onChange={(e) => setNewSub({...newSub, renewalDate: e.target.value})}
                    placeholder="Ayın kaçı? (1-31)" 
                    className="w-full bg-[#191919] text-[#D4D4D4] border border-[#3f3f3f] rounded-md py-2.5 px-3 focus:outline-none focus:border-[#60a5fa] transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full mt-4 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white font-medium py-2.5 rounded-md transition-colors border border-[#4f4f4f]"
              >
                + Listeye Ekle
              </button>
            </form>
          </div>
        </div>

        {/* SAĞ SÜTUN: ABONELİKLER LİSTESİ (8 Kolon) */}
        <div className="lg:col-span-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <p className="text-[#a3a3a3]">Yükleniyor...</p>
            ) : subscriptions.length > 0 ? (
              subscriptions.map(sub => (
                <div key={sub.id} className="group bg-[#202020] p-5 rounded-lg border border-[#2f2f2f] hover:border-[#4f4f4f] transition-all relative overflow-hidden">
                  
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-[#D4D4D4] group-hover:text-white transition-colors">{sub.platformName}</h3>
                    <button 
                      onClick={() => handleDelete(sub.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#737373] hover:text-red-400 transition-all p-1"
                      title="Aboneliği Sil"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between mt-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest">Aylık Ödeme</span>
                      <span className="text-2xl font-black text-white">₺{sub.amount}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest">Yenilenme</span>
                      <span className="text-sm font-medium text-[#a3a3a3] bg-[#191919] px-2 py-1 rounded border border-[#2f2f2f]">Her ayın {sub.renewalDate}. günü</span>
                    </div>
                  </div>
                  
                  {/* Renkli Sol Çizgi Efekti */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-[#202020] border border-[#2f2f2f] border-dashed rounded-lg">
                <span className="text-4xl opacity-50">💸</span>
                <h3 className="mt-4 text-base font-medium text-[#a3a3a3]">Kayıtlı aboneliğin yok.</h3>
                <p className="text-[#737373] text-sm mt-1">Sol taraftaki formu kullanarak eklemeye başla.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}