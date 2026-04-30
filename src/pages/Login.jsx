import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(''); 

    try {
      // 1. NGORK TÜNELİNE İSTEK VE LOCALSTORAGE KAYDI
      const response = await axios.post('https://dentist-antelope-vowel.ngrok-free.dev/api/users/login', { email, password });
      
      if (response.status === 200) {
        // Ensar'ın gönderdiği id'yi yakalayıp localStorage'a güvenle yazıyoruz
        localStorage.setItem("userId", response.data.id); 
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Giriş başarısız:", error);
      setErrorMsg("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center font-sans p-4">
      <div className="max-w-md w-full bg-[#202020] p-10 rounded-md border border-[#2f2f2f] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white italic tracking-widest uppercase">NOYON</h1>
          <p className="text-[#a3a3a3] mt-2 text-sm">Vizyonunu gerçeğe dönüştürmeye hazır mısın?</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-[#2a1215] border border-[#5c1a1a] rounded-md text-[#ff6b6b] text-sm flex items-center gap-3">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">E-Posta Adresi</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-[#D4D4D4] rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="isim@mail.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">Şifre</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-[#D4D4D4] rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition-all shadow-lg flex justify-center items-center gap-2">
            <span>Giriş Yap</span>
            <i className="fa-solid fa-arrow-right-to-bracket text-sm"></i>
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#2f2f2f] pt-6">
          <p className="text-[#a3a3a3] text-sm">Hesabın yok mu? <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">Şimdi Kaydol</Link></p>
        </div>
      </div>
    </div>
  );
}