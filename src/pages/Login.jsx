import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Samet Backend'i bağlayana kadar girişi başarılı varsayıp Dashboard'a atıyoruz
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        
        {/* Logo ve Başlık Alanı */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-wide">NOYON</h2>
          <p className="text-gray-500 text-sm">Sisteme erişmek için giriş yapın</p>
        </div>
        
        {/* Giriş Formu */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta Adresi</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all text-gray-700 bg-gray-50"
              placeholder="ornek@noyon.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all text-gray-700 bg-gray-50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600 cursor-pointer hover:text-gray-900">
              <input type="checkbox" className="mr-2 rounded border-gray-300 text-gray-800 focus:ring-gray-800" />
              Beni Hatırla
            </label>
            <a href="#" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Şifremi Unuttum
            </a>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md"
          >
            Giriş Yap
          </button>
        </form>

        {/* Alt Bilgi */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="font-semibold text-gray-900 hover:underline">
            Hemen Kayıt Olun
          </Link>
        </div>

      </div>
    </div>
  );
}