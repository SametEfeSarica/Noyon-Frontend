import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-background font-sans overflow-hidden selection:bg-primary/30 selection:text-primary">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative custom-scrollbar scroll-smooth">
        <Outlet />
      </main>
    </div>
  );
}