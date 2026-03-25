# 06. Routing Structure

## React Router v6.4+ Configuration for Tennis Club du François

This document defines the complete routing architecture with protected routes and role-based access.

---

## 1. Route Configuration

### `src/App.tsx`

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PricingPage from './pages/PricingPage';
import CourtsPage from './pages/CourtsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCourtsPage from './pages/admin/AdminCourtsPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import BookingPage from './pages/client/BookingPage';
import MyReservationsPage from './pages/client/MyReservationsPage';
import ClientProfilePage from './pages/client/ClientProfilePage';

// Moniteur Pages
import MoniteurDashboard from './pages/moniteur/MoniteurDashboard';
import MoniteurSchedulePage from './pages/moniteur/MoniteurSchedulePage';
import MoniteurStudentsPage from './pages/moniteur/MoniteurStudentsPage';

// Error Pages
import NotFoundPage from './pages/errors/NotFoundPage';
import UnauthorizedPage from './pages/errors/UnauthorizedPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/courts" element={<CourtsPage />} />

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
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="courts" element={<AdminCourtsPage />} />
            <Route path="reservations" element={<AdminReservationsPage />} />
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
            <Route path="booking" element={<BookingPage />} />
            <Route path="reservations" element={<MyReservationsPage />} />
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
            <Route path="schedule" element={<MoniteurSchedulePage />} />
            <Route path="students" element={<MoniteurStudentsPage />} />
          </Route>

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
```

---

## 2. Route Definitions

### Route Map

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | `LandingPage` | Public | Landing page with live availability |
| `/login` | `LoginPage` | Public | User authentication |
| `/register` | `RegisterPage` | Public | User registration |
| `/pricing` | `PricingPage` | Public | Pricing information |
| `/courts` | `CourtsPage` | Public | Court directory |
| `/admin/dashboard` | `AdminDashboard` | Admin only | Admin command center |
| `/admin/users` | `AdminUsersPage` | Admin only | User management |
| `/admin/courts` | `AdminCourtsPage` | Admin only | Court management |
| `/admin/reservations` | `AdminReservationsPage` | Admin only | All reservations view |
| `/client/dashboard` | `ClientDashboard` | Authenticated | Client home |
| `/client/booking` | `BookingPage` | Authenticated | Court booking |
| `/client/reservations` | `MyReservationsPage` | Authenticated | User's reservations |
| `/client/profile` | `ClientProfilePage` | Authenticated | Profile settings |
| `/moniteur/dashboard` | `MoniteurDashboard` | Moniteur/Admin | Instructor home |
| `/moniteur/schedule` | `MoniteurSchedulePage` | Moniteur/Admin | Weekly schedule |
| `/moniteur/students` | `MoniteurStudentsPage` | Moniteur/Admin | Student roster |
| `/unauthorized` | `UnauthorizedPage` | Public | Access denied |
| `*` | `NotFoundPage` | Public | 404 error |

---

## 3. Protected Route Component

### `src/components/layout/ProtectedRoute/ProtectedRoute.tsx`

```typescript
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/common/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moniteur' | 'client';
  allowRoles?: ('admin' | 'moniteur' | 'client')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowRoles,
}) => {
  const { user, loading, checkSession } = useAuth();
  const location = useLocation();

  useEffect(() => {
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <Skeleton variant="circular" width={64} height={64} className="mx-auto mb-4" />
          <p className="text-on-surface/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

---

## 4. Auth Context

### `src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user.types';
import { onAuthStateChange, signOutUser } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      // Session check logic
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange((userData) => {
      setUser(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## 5. Navigation Hooks

### `src/hooks/useNavigation.ts`

```typescript
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navigateToDashboard = useCallback(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    switch (user.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'moniteur':
        navigate('/moniteur/dashboard');
        break;
      case 'client':
        navigate('/client/dashboard');
        break;
      default:
        navigate('/');
    }
  }, [user, navigate]);

  const navigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const navigateToLogin = useCallback(() => {
    navigate('/login', { state: { from: location } });
  }, [navigate, location]);

  return {
    navigate,
    navigateToDashboard,
    navigateBack,
    navigateToLogin,
    currentPath: location.pathname,
  };
};
```

---

## 6. Role-Based Navigation

### `src/components/layout/Sidebar/Sidebar.tsx`

```typescript
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/classNames';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/users', label: 'Users', icon: 'people' },
  { path: '/admin/courts', label: 'Courts', icon: 'sports_tennis' },
  { path: '/admin/reservations', label: 'Reservations', icon: 'event' },
];

const moniteurNavItems = [
  { path: '/moniteur/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/moniteur/schedule', label: 'Schedule', icon: 'calendar_today' },
  { path: '/moniteur/students', label: 'Students', icon: 'school' },
];

const clientNavItems = [
  { path: '/client/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/client/booking', label: 'Book Court', icon: 'add_circle' },
  { path: '/client/reservations', label: 'My Reservations', icon: 'confirmation_number' },
  { path: '/client/profile', label: 'Profile', icon: 'person' },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavItems;
      case 'moniteur':
        return moniteurNavItems;
      case 'client':
        return clientNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-surface-container-highest/15 min-h-screen">
      <nav className="p-4">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-on-surface/80 hover:bg-surface-container-highest/50'
              )
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
```

---

## 7. Error Pages

### `src/pages/errors/NotFoundPage.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { PageContainer } from '@/components/layout/PageContainer';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="font-headline text-9xl font-bold text-primary/20">404</h1>
        <h2 className="font-headline text-3xl font-semibold text-on-surface mt-4 mb-2">
          Page Not Found
        </h2>
        <p className="text-on-surface/70 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    </PageContainer>
  );
};
```

### `src/pages/errors/UnauthorizedPage.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { PageContainer } from '@/components/layout/PageContainer';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="font-headline text-9xl font-bold text-tertiary/20">403</h1>
        <h2 className="font-headline text-3xl font-semibold text-on-surface mt-4 mb-2">
          Access Denied
        </h2>
        <p className="text-on-surface/70 mb-8 max-w-md">
          You don't have permission to access this page.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Home
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
```

---

## 8. Route Guards

### `src/hooks/useRouteGuard.ts`

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type Role = 'admin' | 'moniteur' | 'client';

interface UseRouteGuardOptions {
  requiredRole?: Role;
  allowRoles?: Role[];
}

export const useRouteGuard = ({ requiredRole, allowRoles }: UseRouteGuardOptions = {}) => {
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setAuthorized(false);
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        setAuthorized(false);
        return;
      }

      if (allowRoles && !allowRoles.includes(user.role)) {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
    }
  }, [user, loading, requiredRole, allowRoles]);

  return { authorized, loading };
};
```

---

## 9. Next Steps

After configuring routing:
1. ✅ Set up all route paths and protected routes
2. ✅ Implement role-based navigation
3. 📖 Proceed to [07_DESIGN_SYSTEM.md](./07_DESIGN_SYSTEM.md)
