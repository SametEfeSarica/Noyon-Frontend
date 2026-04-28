import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register'; // BURAYI KONTROL ET: Import edilmiş mi?
import DashboardLayout from './components/DashboardLayout';
import Library from './components/Library';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Giriş Sayfası */}
        <Route path="/login" element={<Login />} />
        
        {/* 2. Kayıt Sayfası (Dışarıda olmalı ki Login'den ulaşılabilsin) */}
        <Route path="/register" element={<Register />} />
        
        {/* 3. Dashboard ve İç Sayfaları */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<h1>Dashboard Ana Sayfasına Hoş Geldiniz</h1>} />
          <Route path="notlar" element={<h1>Notlar Bölümü</h1>} />
          <Route path="kutuphane" element={<h1>Kütüphane Bölümü</h1>} />
          <Route path="projeler" element={<h1>Projeler Bölümü</h1>} />
          <Route path="abonelikler" element={<h1>Abonelikler Bölümü</h1>} />
        </Route>

        {/* 4. Yanlış yola girilirse Login'e at */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;