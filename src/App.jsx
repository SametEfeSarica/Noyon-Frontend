import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import TrashBin from './pages/TrashBin'; // SADECE BİR TANE OLACAK
import Library from './pages/Library';
import Subscriptions from './pages/Subscriptions';
import Tasks from './pages/Task';

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Diğer sayfalar için şimdilik geçici bir "Hazırlanıyor" bileşeni
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center min-h-full bg-[#191919]">
    <h1 className="text-2xl font-black text-gray-500 uppercase tracking-widest">
      {title} Sayfası Yakında Burada Olacak 🚀
    </h1>
  </div>
);

// ANA ROUTER YAPISI
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Tek ve Doğru Dashboard Rotası */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Emrah'ın içe yazdığı kod yerine bizim dosyamız çalışacak! */}
          <Route index element={<Dashboard />} />
          <Route path="trash" element={<TrashBin />} />
          
          <Route path="notlar" element={<PlaceholderPage title="Notlar" />} />
          <Route path="kutuphane" element={<Library />} />
          <Route path="gorevler" element={<Tasks />} />
          <Route path="abonelikler" element={<Subscriptions />} />
          <Route path="favoriler" element={<PlaceholderPage title="Favoriler" />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}