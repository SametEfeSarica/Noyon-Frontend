import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' }); // error veya success
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    try {
      // GERÇEK BACKEND İSTEĞİ
      const response = await axios.post('http://localhost:8080/api/users/register', formData);
      
      if (response.status === 200 || response.status === 201) {
        setStatusMsg({ type: 'success', text: 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...' });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      console.error("Kayıt başarısız:", error);
      setStatusMsg({ type: 'error', text: 'Kayıt işlemi başarısız. Bu e-posta kullanılıyor olabilir.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center font-sans p-4">
      <div className="max-w-md w-full bg-[#202020] p-10 rounded-md border border-[#2f2f2f] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white italic tracking-widest uppercase">NOYON</h1>
          <p className="text-[#a3a3a3] mt-2 text-sm">Kendi çalışma alanını oluşturmaya başla.</p>
        </div>

        {/* BİLGİ/HATA MESAJI UI */}
        {statusMsg.text && (
          <div className={`mb-6 p-4 rounded-md text-sm flex items-center gap-3 border ${statusMsg.type === 'error' ? 'bg-[#2a1215] border-[#5c1a1a] text-[#ff6b6b]' : 'bg-[#122a1a] border-[#1a5c2d] text-[#6bff87]'}`}>
            <i className={`fa-solid ${statusMsg.type === 'error' ? 'fa-triangle-exclamation' : 'fa-check-circle'}`}></i>
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">Kullanıcı Adı</label>
            <input 
              type="text" required value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-[#D4D4D4] rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="noyon_user"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">E-Posta</label>
            <input 
              type="email" required value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-[#D4D4D4] rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="efe@mail.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">Şifre</label>
            <input 
              type="password" required value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-[#D4D4D4] rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="en az 6 karakter"
            />
          </div>
          <button type="submit" className="w-full bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white font-bold py-3 rounded-md transition-all border border-[#4f4f4f] flex justify-center items-center gap-2">
            <span>Hesap Oluştur</span>
            <i className="fa-solid fa-user-plus text-sm"></i>
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#2f2f2f] pt-6">
          <p className="text-[#a3a3a3] text-sm">Zaten üye misin? <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Giriş Yap</Link></p>
        </div>
      </div>
    </div>
  );
}