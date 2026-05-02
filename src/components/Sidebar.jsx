import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // Güvenli çıkış fonksiyonumuz

  const menuItems = [
    { name: 'Ana Sayfa', icon: 'fa-solid fa-house', path: '/dashboard' },
    { name: 'Notlar', icon: 'fa-solid fa-book-open', path: '/dashboard/notes' },
    { name: 'Kütüphane', icon: 'fa-solid fa-book-bookmark', path: '/dashboard/kutuphane' },
    { name: 'Görevler', icon: 'fa-solid fa-check-double', path: '/dashboard/gorevler' },
    { name: 'Abonelikler', icon: 'fa-solid fa-credit-card', path: '/dashboard/abonelikler' },
    { name: 'Takvim', icon: 'fa-regular fa-calendar-days', path: '/dashboard/takvim' },
  ];

  const bottomItems = [
    { name: 'Favoriler', icon: 'fa-solid fa-star', path: '/dashboard/favoriler' },
    { name: 'Çöp Kutusu', icon: 'fa-regular fa-trash-can', path: '/dashboard/trash' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
    
    return (
      <Link
        to={item.path}
        title={!isExpanded ? item.name : ""}
        className={`flex items-center px-3 py-2.5 mb-1 rounded-lg transition-all duration-200 group relative overflow-hidden ${
          isActive 
            ? 'bg-zinc-800/80 text-white font-medium shadow-sm' 
            : 'text-muted hover:bg-zinc-800/40 hover:text-zinc-200'
        }`}
      >
        {/* Aktif sekme solundaki o şık yeşil çizgi */}
        {isActive && (
          <motion.div layoutId="activeTab" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full" />
        )}
        
        <div className="w-5 flex justify-center items-center shrink-0 z-10">
          <i className={`${item.icon} text-[15px] ${isActive ? 'text-primary' : 'group-hover:scale-110 transition-transform'}`}></i>
        </div>
        
        <AnimatePresence mode='wait'>
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="ml-3 text-sm whitespace-nowrap z-10"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 260 : 72 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-surface border-r border-border h-screen flex flex-col relative z-20 shrink-0"
    >
      {/* Şık Aç/Kapat Butonu */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3.5 top-6 bg-surface border border-border text-muted hover:text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg transition-colors z-30"
      >
        <motion.i 
          animate={{ rotate: isExpanded ? 0 : 180 }}
          className="fa-solid fa-chevron-left text-[10px]"
        ></motion.i>
      </button>

      {/* Logo */}
      <div className="h-20 flex items-center px-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white font-black italic shadow-md shrink-0 border border-zinc-700">
          N
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-3 font-extrabold text-white tracking-widest uppercase whitespace-nowrap"
            >
              Noyon
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Ana Menü */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-3 px-3">
          {isExpanded ? 'Genel Bakış' : '•'}
        </div>
        {menuItems.map(item => <NavItem key={item.name} item={item} />)}
        
        <div className="mt-8 mb-3 px-3 h-px bg-border"></div>
        
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-3 px-3">
          {isExpanded ? 'Kişisel' : '•'}
        </div>
        {bottomItems.map(item => <NavItem key={item.name} item={item} />)}
      </nav>

      {/* Çıkış Yap */}
      <div className="p-3 border-t border-border">
        <button 
          onClick={handleLogout}
          title={!isExpanded ? "Çıkış Yap" : ""}
          className="w-full flex items-center px-3 py-2.5 rounded-lg text-muted hover:bg-danger/10 hover:text-danger transition-colors group relative overflow-hidden"
        >
          <div className="w-5 flex justify-center items-center shrink-0">
            <i className="fa-solid fa-arrow-right-from-bracket text-[15px] group-hover:-translate-x-1 transition-transform"></i>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3 text-sm font-medium whitespace-nowrap"
              >
                Çıkış Yap
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}