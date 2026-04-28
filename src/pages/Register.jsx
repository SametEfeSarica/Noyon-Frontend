import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // Samet Backend tarafını bağlayana kadar sistemi çalışıyor varsayıyoruz
    // Kayıt başarılı olunca kullanıcıyı giriş yapması için Login sayfasına yönlendiriyoruz
    alert("Kayıt işlemi başarılı! Lütfen giriş yapın.");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        
        {/* Logo ve Başlık Alanı */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-wide">NOYON</h2>
          <p className="text-gray-500 text-sm">Aramıza katılmak için hesap oluşturun</p>
        </div>
        
        {/* Kayıt Formu */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Soyad</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all text-gray-700 bg-gray-50"
              placeholder="Adınız ve Soyadınız"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

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

          <button 
            type="submit" 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md mt-2"
          >
            Kayıt Ol
          </button>
        </form>

        {/* Alt Bilgi */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Zaten bir hesabınız var mı?{' '}
          <Link to="/login" className="font-semibold text-gray-900 hover:underline">
            Giriş Yapın
          </Link>
        </div>

      </div>
    </div>
  );
}