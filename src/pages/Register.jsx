import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Yeni güvenli AuthContext'ten register fonksiyonunu çekiyoruz
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await register(username, email, password);
      // Kayıt başarılıysa anında içeri al
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Kayıt olurken bir hata oluştu.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center font-sans p-4">
      <div className="max-w-md w-full bg-[#202020] p-10 rounded-md border border-[#2f2f2f] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white italic tracking-widest uppercase">NOYON</h1>
          <p className="text-[#a3a3a3] mt-2 text-sm">Aramıza katıl ve vizyonunu gerçeğe dönüştür.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-[#2a1215] border border-[#5c1a1a] rounded-md text-[#ff6b6b] text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-[#D4D4D4] rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Örn: ssari"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">
              E-Posta Adresi
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-[#D4D4D4] rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="isim@mail.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">
              Şifre
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-[#D4D4D4] rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="En az 8 karakter"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-60 text-black font-bold py-3 rounded-md transition-all shadow-lg"
          >
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#2f2f2f] pt-6">
          <p className="text-[#a3a3a3] text-sm">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}