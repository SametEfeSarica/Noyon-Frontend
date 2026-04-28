import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

 const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Şimdilik backend'e gitmeyi deniyoruz, hata alırsak simülasyona geçiyoruz
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      if (response.status === 200) {
        localStorage.setItem('user', JSON.stringify(response.data));
        setIsLoggedIn(true);
        navigate('/dashboard');
      }
    } catch (error) {
      console.log("Backend henüz hazır değil, test girişi yapılıyor...");
      // TEST GİRİŞİ: Backend çalışmasa bile seni içeri alır
      localStorage.setItem('user', JSON.stringify({ email: email, id: 1 }));
      setIsLoggedIn(true);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter italic">NOYON</h2>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Sistem Girişi</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Kurumsal E-posta</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-4 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all text-gray-800 bg-gray-50 shadow-inner"
              placeholder="emrah@noyon.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Şifre</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-4 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all text-gray-800 bg-gray-50 shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg active:scale-95"
          >
            GİRİŞ YAP
          </button>
        </form>

        <div className="mt-10 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-400">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="font-bold text-gray-900 hover:text-gray-600 underline decoration-2 underline-offset-4">
              Kayıt Olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}