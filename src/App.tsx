import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Placeholder components - will be implemented in next phases
const LandingPage = () => <div className="p-8"><h1 className="text-headline-lg">Tennis Club du François</h1></div>;
const LoginPage = () => <div className="p-8"><h1 className="text-headline-lg">Login</h1></div>;
const RegisterPage = () => <div className="p-8"><h1 className="text-headline-lg">Register</h1></div>;
const AdminDashboard = () => <div className="p-8"><h1 className="text-headline-lg">Admin Dashboard</h1></div>;
const ClientDashboard = () => <div className="p-8"><h1 className="text-headline-lg">Client Dashboard</h1></div>;
const MoniteurDashboard = () => <div className="p-8"><h1 className="text-headline-lg">Moniteur Dashboard</h1></div>;
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
