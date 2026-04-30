import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    // bg-gray-50 YERİNE bg-[#191919] GETİRİLDİ. TAM KARANLIK TEMA!
    <div className="flex min-h-screen bg-[#191919] font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-screen relative custom-scrollbar">
        <Outlet />
      </main>
    </div>
  );
}