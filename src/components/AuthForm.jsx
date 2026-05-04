import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Context'i import ettik

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Context'ten fonksiyonlarımızı alıyoruz
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Context içindeki login'i tetikle
        await login(email, password);
      } else {
        // Context içindeki register'ı tetikle
        await register(username, email, password);
      }

      // Her şey başarılıysa uygulamaya gir
      navigate('/dashboard');
      
    } catch (err) {
      console.error("Auth hatası:", err);
      setError(
        err.response?.data?.message || 
        (isLogin ? 'E-posta veya şifre hatalı.' : 'Kayıt olurken bir hata oluştu.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center rounded-2xl border border-[#1e1e2c] bg-[#111119] p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
        </h2>
        <p className="mt-2 text-sm text-[#888898]">
          {isLogin ? 'Hesabınıza giriş yaparak devam edin.' : 'Noyon dünyasına katılmak için bilgilerinizi girin.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 w-full rounded-lg bg-red-500/10 p-3 text-center text-sm font-medium text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {!isLogin && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#c0c0cc]">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
              className="w-full rounded-lg border border-[#2a2a38] bg-[#16161f] px-4 py-2.5 text-sm text-white placeholder-[#404058] transition-colors focus:border-[#6c6af6] focus:outline-none focus:ring-1 focus:ring-[#6c6af6]"
              placeholder="Kullanıcı adınız"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#c0c0cc]">E-posta Adresi</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-[#2a2a38] bg-[#16161f] px-4 py-2.5 text-sm text-white placeholder-[#404058] transition-colors focus:border-[#6c6af6] focus:outline-none focus:ring-1 focus:ring-[#6c6af6]"
            placeholder="ornek@eposta.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#c0c0cc]">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-[#2a2a38] bg-[#16161f] px-4 py-2.5 text-sm text-white placeholder-[#404058] transition-colors focus:border-[#6c6af6] focus:outline-none focus:ring-1 focus:ring-[#6c6af6]"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-[#6c6af6] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#7a78f8] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Bekleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[#888898]">
        {isLogin ? 'Hesabınız yok mu?' : 'Zaten bir hesabınız var mı?'}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="ml-1.5 font-medium text-[#6c6af6] hover:text-[#9d9cf8] hover:underline"
        >
          {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>
      </p>
    </div>
  );
}