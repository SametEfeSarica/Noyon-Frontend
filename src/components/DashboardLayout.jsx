import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
}