import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    alert("Kayıt başarılı! Giriş yapabilirsiniz.");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center font-sans p-4">
      <div className="max-w-md w-full bg-[#202020] p-10 rounded-xl border border-[#2f2f2f] shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white italic tracking-widest uppercase">NOYON</h1>
          <p className="text-[#a3a3a3] mt-2 text-sm">Kendi çalışma alanını oluşturmaya başla.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">Kullanıcı Adı</label>
            <input 
              type="text" required value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-white rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="noyon_user"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">E-Posta</label>
            <input 
              type="email" required value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-white rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="efe@mail.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">Şifre</label>
            <input 
              type="password" required value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-[#191919] border border-[#3f3f3f] text-white rounded-md py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="en az 6 karakter"
            />
          </div>
          <button type="submit" className="w-full bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white font-bold py-3 rounded-md transition-all border border-[#4f4f4f]">
            Hesap Oluştur
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#2f2f2f] pt-6">
          <p className="text-[#a3a3a3] text-sm">Zaten üye misin? <Link to="/login" className="text-blue-400 hover:underline">Giriş Yap</Link></p>
        </div>
      </div>
    </div>
  );
}