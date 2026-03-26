import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Import the real Landing Page component
import LandingPage from './pages/LandingPage';

// Import real Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Import real Dashboard pages
import AdminDashboard from './pages/admin/Dashboard';
import ClientDashboard from './pages/client/Dashboard';
import MoniteurDashboard from './pages/moniteur/Dashboard';

// Import Admin Pages
import AdminUsersPage from './pages/admin/AdminUsersPage';

// Import Client Pages
import ClientProfilePage from './pages/client/Profile';

// Import Moniteur Pages
import MoniteurProfilePage from './pages/moniteur/Profile';

// Temporary placeholder component for pages under development
const ComingSoonPage = ({ title }: { title: string }) => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="rounded-xl bg-surface-container p-8 text-center shadow-lg">
      <span className="material-symbols-outlined text-6xl text-primary">construction</span>
      <h1 className="mt-6 font-headline text-2xl font-bold text-on-surface">{title}</h1>
      <p className="mt-3 font-body text-base text-on-surface-variant">
        Page en cours de développement
      </p>
    </div>
  </div>
);

// Fallback 404 component
const NotFoundPage = () => <div className="p-8"><h1 className="text-headline-lg">404 - Page Not Found</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="courts" element={<ComingSoonPage title="Court Management" />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="reservations" element={<ComingSoonPage title="Reservations Management" />} />
          </Route>

          {/* Protected Client Routes */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowRoles={['admin', 'moniteur', 'client']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="courts" element={<ComingSoonPage title="Book a Court" />} />
            <Route path="bookings" element={<ComingSoonPage title="My Bookings" />} />
            <Route path="profile" element={<ClientProfilePage />} />
          </Route>

          {/* Protected Moniteur Routes */}
          <Route
            path="/moniteur"
            element={
              <ProtectedRoute allowRoles={['admin', 'moniteur']}>
                <MoniteurDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/moniteur/dashboard" replace />} />
            <Route path="dashboard" element={<MoniteurDashboard />} />
            <Route path="profile" element={<MoniteurProfilePage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
