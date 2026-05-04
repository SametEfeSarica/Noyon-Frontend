import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';

// Lazy-loaded pages
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const Notes         = lazy(() => import('./pages/Notes'));
const Tasks         = lazy(() => import('./pages/Task'));
const Library       = lazy(() => import('./pages/Library'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Calendar      = lazy(() => import('./pages/Calendar'));
const TrashBin      = lazy(() => import('./pages/TrashBin'));
const Settings      = lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#191919]">
    <div className="w-6 h-6 border-2 border-[#4f4f4f] border-t-white rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index             element={<DashboardHome />} />
            <Route path="notes"      element={<Notes />} />
            <Route path="gorevler"   element={<Tasks />} />
            <Route path="kutuphane"  element={<Library />} />
            <Route path="abonelikler"element={<Subscriptions />} />
            <Route path="takvim"     element={<Calendar />} />
            <Route path="trash"      element={<TrashBin />} />
            <Route path="settings"   element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
