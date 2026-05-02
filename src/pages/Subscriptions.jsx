import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// --- PREMIUM SKELETON COMPONENT ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-zinc-800/60 rounded-md ${className}`}></div>
);

export default function Subscriptions() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/subscriptions');
      const data = response.data.content || response.data;
      setSubs(data || []);
    } catch (error) {
      console.error("Abonelikler çekilemedi:", error);
      // Backend kapalıysa arayüzü görebilmen için sahte (dummy) veriler
      setSubs([
        { id: 1, platformName: 'Netflix', amount: 149.99, currency: 'TRY', billingPeriod: 'MONTHLY', renewalDay: 15, category: 'Eğlence', monthlyEquivalent: 149.99, daysUntilRenewal: 3 },
        { id: 2, platformName: 'Spotify', amount: 39.99, currency: 'TRY', billingPeriod: 'MONTHLY', renewalDay: 22, category: 'Müzik', monthlyEquivalent: 39.99, daysUntilRenewal: 10 },
        { id: 3, platformName: 'Amazon Prime', amount: 39.00, currency: 'TRY', billingPeriod: 'MONTHLY', renewalDay: 5, category: 'Alışveriş', monthlyEquivalent: 39.00, daysUntilRenewal: 22 },
        { id: 4, platformName: 'JetBrains IDE', amount: 149.00, currency: 'USD', billingPeriod: 'YEARLY', renewalDay: 10, category: 'Yazılım', monthlyEquivalent: 12.41, daysUntilRenewal: 45 },
      ]);
    } finally {
      setTimeout(() => setIsLoading(false), 400); // Akıcı geçiş için
    }
  };

  useEffect(() => {
    if (user) fetchSubs();
  }, [user]);

  // Toplam Aylık Gider Hesaplama
  const totalMonthlyCost = subs.reduce((acc, curr) => acc + (curr.monthlyEquivalent || curr.amount), 0);

  // Kalan güne göre renk ve ikon belirleme
  const getUrgencyStyles = (days) => {
    if (days <= 3) return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'fa-triangle-exclamation' };
    if (days <= 7) return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'fa-clock' };
    return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'fa-shield-check' };
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-background font-sans text-zinc-200">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight mb-2">
            <div className="w-3 h-8 bg-purple-500 rounded-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
            Abonelik Yönetimi
          </h1>
          <p className="text-sm text-muted ml-6">Tekrarlayan giderlerini takip et, sürpriz ödemelerden kurtul.</p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => alert("Yeni abonelik ekleme modalı açılacak!")}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg whitespace-nowrap"
        >
          <i className="fa-solid fa-plus"></i> Abonelik Ekle
        </motion.button>
      </div>

      {/* FİNANSAL ÖZET KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border p-6 rounded-2xl flex items-center gap-5 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 text-2xl shrink-0"><i className="fa-solid fa-wallet"></i></div>
              <div className="z-10">
                <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-1">Toplam Aylık Gider</p>
                <h3 className="text-3xl font-black text-white">₺{totalMonthlyCost.toFixed(2)}</h3>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface border border-border p-6 rounded-2xl flex items-center gap-5 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl shrink-0"><i className="fa-solid fa-layer-group"></i></div>
              <div className="z-10">
                <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-1">Aktif Abonelik</p>
                <h3 className="text-3xl font-black text-white">{subs.length} <span className="text-sm font-medium text-zinc-500 ml-1">adet</span></h3>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-border p-6 rounded-2xl flex items-center gap-5 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 text-2xl shrink-0"><i className="fa-solid fa-calendar-check"></i></div>
              <div className="z-10">
                <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-1">En Yakın Ödeme</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {subs.length > 0 ? `${Math.min(...subs.map(s => s.daysUntilRenewal))} gün sonra` : 'Yok'}
                </h3>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* ABONELİKLER LİSTESİ (GRID) */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-list text-purple-500"></i> Tüm Aboneliklerin
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
          </div>
        ) : subs.length > 0 ? (
          <motion.div 
            initial="hidden" animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {subs.sort((a,b) => a.daysUntilRenewal - b.daysUntilRenewal).map(sub => {
                const urgency = getUrgencyStyles(sub.daysUntilRenewal);
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    key={sub.id} 
                    className="bg-surface border border-border rounded-2xl p-5 hover:border-zinc-500 transition-all cursor-pointer group flex flex-col relative shadow-sm hover:shadow-md"
                  >
                    {/* Hızlı Aksiyon (Hover) */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-muted hover:text-white transition-colors p-1"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-white text-xl border border-zinc-700 shadow-inner">
                        {/* Kategoriye göre veya isme göre ikon uydurma */}
                        <i className={`fa-brands fa-${sub.platformName.toLowerCase().replace(' ', '')} fa-fw`}></i>
                        {/* Eğer font-awesome'da logosu yoksa ilk harfi gösterelim */}
                        <span className="absolute text-lg font-black opacity-30">{sub.platformName.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight group-hover:text-purple-400 transition-colors">{sub.platformName}</h3>
                        <p className="text-[11px] text-muted uppercase tracking-widest font-semibold mt-1">{sub.category}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">{sub.amount}</span>
                        <span className="text-xs font-bold text-muted">{sub.currency}</span>
                        <span className="text-xs text-zinc-500 ml-1">/ {sub.billingPeriod === 'MONTHLY' ? 'Ay' : 'Yıl'}</span>
                      </div>
                    </div>

                    <div className={`mt-auto pt-3 border-t border-border flex items-center justify-between`}>
                      <span className="text-xs font-semibold text-zinc-400">Yenileme: Ayın {sub.renewalDay}. günü</span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${urgency.bg} ${urgency.color} ${urgency.border}`}>
                        <i className={`fa-solid ${urgency.icon} text-[10px]`}></i>
                        <span className="text-[10px] font-bold">{sub.daysUntilRenewal} gün kaldı</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-surface border border-border border-dashed rounded-3xl"
          >
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
              <i className="fa-solid fa-credit-card text-4xl text-purple-500"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Abonelik Bulunamadı</h3>
            <p className="text-sm text-muted mb-6 text-center max-w-md">
              Sisteme kayıtlı hiçbir aboneliğin yok. Aylık giderlerini takip etmek için hemen bir tane ekle.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}