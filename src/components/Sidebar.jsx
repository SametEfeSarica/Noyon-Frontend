import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Senin istediğin modül isimlendirmeleri
  const menuItems = [
    { name: 'Ana Sayfa', icon: '🏠', path: '/dashboard' },
    { name: 'Notlar', icon: '📝', path: '/dashboard/notlar' },
    { name: 'Kütüphane', icon: '📚', path: '/dashboard/kutuphane' },
    { name: 'Görev Takibi', icon: '✅', path: '/dashboard/gorevler' },
    { name: 'Abonelikler', icon: '💳', path: '/dashboard/abonelikler' },
    { name: 'Favoriler', icon: '⭐', path: '/dashboard/favoriler' },
    { name: 'Takvim', icon: '📅', path: '/dashboard/takvim' },
    { name: 'Çöp Kutusu', icon: '🗑️', path: '/dashboard/trash' },
  ];

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/login');
  };

  return (
    <aside 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`bg-[#0f172a] text-gray-300 min-h-screen transition-all duration-300 ease-in-out flex flex-col shadow-2xl border-r border-gray-800 relative z-20 ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      {/* Logo Alanı */}
      <div className="h-20 flex items-center justify-center border-b border-gray-800">
        {isExpanded ? (
          <span className="text-2xl font-black tracking-widest italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">NOYON</span>
        ) : (
          <span className="text-2xl font-black text-blue-400 drop-shadow-sm">N</span>
        )}
      </div>

      {/* Menü Linkleri */}
      <nav className="flex-1 py-6 space-y-1.5 px-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name}
              to={item.path} 
              className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner' : 'hover:bg-gray-800 hover:text-white border border-transparent'
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              <span className={`ml-4 font-semibold whitespace-nowrap transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 overflow-hidden w-0'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ÇIKIŞ YAP */}
      <div className="p-3 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/10 text-red-400 hover:text-red-500 group border border-transparent hover:border-red-500/30"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">🚪</span>
          <span className={`ml-4 font-black uppercase tracking-widest text-[11px] transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 overflow-hidden w-0'}`}>
            Çıkış Yap
          </span>
        </button>
      </div>
    </aside>
  );
}