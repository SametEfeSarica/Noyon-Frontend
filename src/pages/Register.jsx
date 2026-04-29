import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/register', { fullName, email, password });
      
      if (response.status === 201 || response.status === 200) {
        alert("Kayıt başarılı!");
        navigate('/login');
      }
    } catch (error) {
      // DEĞİŞEN KISIM BURASI: Sahte simülasyon silindi. Artık gerçek hata veriyor.
      console.error("Kayıt Hatası:", error);
      alert("⚠️ Kayıt işlemi başarısız! Lütfen sunucu bağlantısını kontrol edin veya e-postanın kullanımda olmadığını doğrulayın.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
        
        {/* Logo ve Başlık */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter italic">NOYON</h2>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Yeni Hesap Oluştur</p>
        </div>
        
        {/* Kayıt Formu */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Ad Soyad</label>
            <input 
              type="text" 
              required
              className="w-full px-5 py-4 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all text-gray-800 bg-gray-50 shadow-inner"
              placeholder="Adınız Soyadınız"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">E-posta Adresi</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-4 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all text-gray-800 bg-gray-50 shadow-inner"
              placeholder="ornek@noyon.com"
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
            className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg mt-4 active:scale-95"
          >
            HESAP OLUŞTUR
          </button>
        </form>

        <div className="mt-10 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-400">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="font-bold text-gray-900 hover:text-gray-600 underline decoration-2 underline-offset-4">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}