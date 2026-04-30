import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import TrashBin from './pages/TrashBin';
import Library from './pages/Library';
import Subscriptions from './pages/Subscriptions';
import Tasks from './pages/Task';
import Calendar from './pages/Calendar'; // TAKVİM İMPORT EDİLDİ

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    return <Navigate to="/login" />;
  }
  return children;
};

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center min-h-full bg-[#191919]">
    <h1 className="text-2xl font-black text-[#737373] uppercase tracking-widest">
      {title} Sayfası Yakında Burada Olacak
    </h1>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="trash" element={<TrashBin />} />
          <Route path="notlar" element={<PlaceholderPage title="Notlar" />} />
          <Route path="kutuphane" element={<Library />} />
          <Route path="gorevler" element={<Tasks />} />
          <Route path="abonelikler" element={<Subscriptions />} />
          <Route path="favoriler" element={<PlaceholderPage title="Favoriler" />} />
          
          {/* ÇÖZÜM: TAKVİM ROTASI EKLENDİ */}
          <Route path="takvim" element={<Calendar />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}