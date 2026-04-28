import React, { useState } from 'react';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    // Sayfanın yenilenmesini engeller
    e.preventDefault(); 
    
    // Verileri bir objede toplayıp JSON'a çeviriyoruz
    const formData = {
      email: email,
      password: password
    };
    
    console.log("Gönderilen Veriler:", JSON.stringify(formData, null, 2));
    
    // API'ye POST atılacaksa buraya eklenebilir
  };

  return (
    <div>
      <h2>Giriş / Kayıt</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>E-posta:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label>Şifre:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}