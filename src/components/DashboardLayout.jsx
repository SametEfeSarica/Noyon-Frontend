import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(true); // Menü açık/kapalı durumu
  const { setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      
      {/* SOL YAN MENÜ (SIDEBAR) */}
      <aside 
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } bg-gray-100 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out relative`}
      >
        {/* LOGO ALANI */}
        <div className="p-6 flex items-center justify-between">
          {isOpen && (
            <span className="text-xl font-black italic tracking-tighter text-gray-900">
              NOYON
            </span>
          )}
          
          {/* 3 ÇİZGİ (HAMBURGER) BUTONU */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none hover:bg-gray-200 rounded-lg transition-colors mx-auto"
          >
            <div className={`w-6 h-0.5 bg-gray-900 transition-all ${!isOpen ? 'rotate-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-gray-900 transition-all ${!isOpen ? 'opacity-100' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-gray-900 transition-all ${!isOpen ? 'rotate-0' : ''}`}></div>
          </button>
        </div>

        {/* MENÜ LİNKLERİ */}
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {[
            { name: 'Notlar', icon: '📝', path: '/dashboard/notlar' },
            { name: 'Kütüphane', icon: '📚', path: '/dashboard/kutuphane' },
            { name: 'Projeler', icon: '📁', path: '/dashboard/projeler' },
            { name: 'Abonelikler', icon: '💳', path: '/dashboard/abonelikler' },
          ].map((item) => (
            <Link 
              key={item.name}
              to={item.path} 
              className="flex items-center p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-gray-900 group"
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && (
                <span className="ml-4 font-bold text-sm tracking-wide transition-opacity duration-200">
                  {item.name}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* ÇIKIŞ BUTONU */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className={`flex items-center justify-center p-3 w-full rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-red-50 hover:text-red-600 transition-all`}
          >
            <span>🚪</span>
            {isOpen && <span className="ml-3 text-sm">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* SAĞ ANA İÇERİK ALANI */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            Panel / <span className="text-gray-400 font-medium">Genel Bakış</span>
          </h1>
        </header>
        
        {/* İçeriklerin Geleceği Beyaz Kart */}
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 min-h-[80vh] shadow-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}