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
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
