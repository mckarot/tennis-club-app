/**
 * Application Router
 *
 * React Router v6.4+ configuration with createBrowserRouter.
 * Includes public routes, protected routes for each role, loaders, and error boundaries.
 *
 * Route Structure:
 * - Public: /, /courts, /login, /register, /about, /contact
 * - Client: /client/* (authenticated clients)
 * - Moniteur: /moniteur/* (authenticated moniteurs)
 * - Admin: /admin/* (authenticated admins)
 *
 * @module @router
 */

import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import { createBrowserRouter, type RouteObject, type LoaderFunctionArgs } from 'react-router-dom';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import type { UserRole } from './types/user.types';

// ==========================================
// LAZY LOADING HELPER
// ==========================================

/**
 * Create a lazy-loaded component with error handling
 *
 * @param importFn - Dynamic import function
 * @param componentName - Component name for error logging
 */
function createLazyComponent<T extends ComponentType>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): LazyExoticComponent<T> {
  return lazy(() =>
    importFn().catch((error) => {
      console.error(`[Router] Failed to load component "${componentName}":`, error);
      throw error;
    })
  );
}

// ==========================================
// LAZY LOADED PAGES
// ==========================================

// Public pages
const LandingPage = createLazyComponent(() => import('./pages/LandingPage'), 'LandingPage');
const CourtsPage = createLazyComponent(() => import('./pages/CourtsPage'), 'CourtsPage');
const LoginPage = createLazyComponent(() => import('./pages/auth/LoginPage'), 'LoginPage');
const RegisterPage = createLazyComponent(() => import('./pages/auth/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = createLazyComponent(
  () => import('./pages/auth/ForgotPasswordPage'),
  'ForgotPasswordPage'
);
const AboutPage = createLazyComponent(() => import('./pages/AboutPage'), 'AboutPage');
const ContactPage = createLazyComponent(() => import('./pages/ContactPage'), 'ContactPage');
const UnauthorizedPage = createLazyComponent(() => import('./pages/UnauthorizedPage'), 'UnauthorizedPage');
const NotFoundPage = createLazyComponent(() => import('./pages/NotFoundPage'), 'NotFoundPage');

// Client pages
const ClientDashboard = createLazyComponent(() => import('./pages/client/Dashboard'), 'ClientDashboard');
const ClientBookings = createLazyComponent(() => import('./pages/client/Bookings'), 'ClientBookings');
const ClientReservations = createLazyComponent(() => import('./pages/client/Reservations'), 'ClientReservations');
const ClientSlots = createLazyComponent(() => import('./pages/client/Slots'), 'ClientSlots');
const ClientProfile = createLazyComponent(() => import('./pages/client/Profile'), 'ClientProfile');
const BookingPage = createLazyComponent(() => import('./pages/client/BookingPage'), 'BookingPage');
const MyReservationsPage = createLazyComponent(() => import('./pages/client/MyReservationsPage'), 'MyReservationsPage');

// Moniteur pages
const MoniteurDashboard = createLazyComponent(() => import('./pages/moniteur/Dashboard'), 'MoniteurDashboard');
const MoniteurSchedule = createLazyComponent(() => import('./pages/moniteur/Schedule'), 'MoniteurSchedule');
const MoniteurSlots = createLazyComponent(() => import('./pages/moniteur/Slots'), 'MoniteurSlots');
const MoniteurStudents = createLazyComponent(() => import('./pages/moniteur/Students'), 'MoniteurStudents');
const MoniteurProfile = createLazyComponent(() => import('./pages/moniteur/Profile'), 'MoniteurProfile');

// Admin pages
const AdminDashboard = createLazyComponent(() => import('./pages/admin/Dashboard'), 'AdminDashboard');
const AdminUsers = createLazyComponent(() => import('./pages/admin/Users'), 'AdminUsers');
const AdminCourts = createLazyComponent(() => import('./pages/admin/Courts'), 'AdminCourts');
const AdminReservations = createLazyComponent(() => import('./pages/admin/Reservations'), 'AdminReservations');
const AdminSlots = createLazyComponent(() => import('./pages/admin/Slots'), 'AdminSlots');
const AdminSettings = createLazyComponent(() => import('./pages/admin/Settings'), 'AdminSettings');

// ==========================================
// LAYOUT COMPONENTS
// ==========================================

const MainLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-surface">
    <header className="bg-surface-container px-4 py-4">
      <nav className="container mx-auto">
        <span className="font-headline text-lg font-bold text-on-surface">Tennis Club du François</span>
      </nav>
    </header>
    <main className="container mx-auto py-6">{children}</main>
  </div>
);

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-surface p-4">{children}</div>
);

const DashboardLayout = ({ children, role }: { children: ReactNode; role: UserRole }) => (
  <div className="flex min-h-screen bg-surface">
    <aside className="w-64 bg-surface-container">
      <nav className="p-4">
        <span className="font-headline text-lg font-bold text-on-surface">
          {role === 'admin' ? 'Admin' : role === 'moniteur' ? 'Moniteur' : 'Client'}
        </span>
      </nav>
    </aside>
    <main className="flex-1 p-6">{children}</main>
  </div>
);

// ==========================================
// FALLBACK COMPONENTS
// ==========================================

const LoadingFallback = () => (
  <div className="flex min-h-[400px] items-center justify-center" role="status" aria-label="Loading">
    <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
    <span className="sr-only">Loading...</span>
  </div>
);

const LazyErrorFallback = ({ error }: { error: Error }) => (
  <div role="alert" className="rounded-lg border border-error-container bg-error-container p-6 text-center">
    <span className="material-symbols-outlined mb-2 text-4xl text-error">error</span>
    <h2 className="font-headline text-lg font-bold text-on-surface">Failed to load page</h2>
    <p className="mt-2 font-body text-sm text-on-surface-variant">{error.message}</p>
    <button
      onClick={() => window.location.reload()}
      className="mt-4 rounded-lg bg-primary px-4 py-2 font-body text-sm font-medium text-on-primary hover:bg-primary/90"
      aria-label="Reload page"
    >
      Reload Page
    </button>
  </div>
);

// ==========================================
// ROUTE LOADERS
// ==========================================

interface RouteLoaderData {
  isAuthenticated: boolean;
  userRole: UserRole | null;
}

/**
 * Get auth data from session storage
 */
function getAuthFromStorage(): { isAuthenticated: boolean; userRole: UserRole | null } {
  try {
    const authData = sessionStorage.getItem('auth_data') || localStorage.getItem('auth_data');
    if (authData) {
      const parsed = JSON.parse(authData);
      return {
        isAuthenticated: !!parsed.user,
        userRole: parsed.user?.role || null,
      };
    }
  } catch (error) {
    console.error('[Router] Error reading auth data:', error);
  }
  return { isAuthenticated: false, userRole: null };
}

/**
 * Create auth loader - redirects if already authenticated
 * Returns redirect to role-based dashboard if user is logged in
 */
function createAuthLoader() {
  return async function loader({ request }: LoaderFunctionArgs): Promise<Response | RouteLoaderData> {
    const { isAuthenticated, userRole } = getAuthFromStorage();

    if (isAuthenticated && userRole) {
      // Redirect to role-based dashboard
      const roleRoutes: Record<string, string> = {
        admin: '/admin',
        moniteur: '/moniteur',
        client: '/client',
      };
      return Response.redirect(new URL(roleRoutes[userRole], request.url));
    }

    return { isAuthenticated, userRole };
  };
}

function createRoleLoader(requiredRoles?: UserRole | UserRole[]) {
  return async function loader({ request }: LoaderFunctionArgs): Promise<Response | RouteLoaderData> {
    const { isAuthenticated, userRole } = getAuthFromStorage();

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return Response.redirect(new URL('/login', request.url));
    }

    if (requiredRoles) {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      if (!userRole || !roles.includes(userRole)) {
        // Redirect to unauthorized page
        return Response.redirect(new URL('/unauthorized', request.url));
      }
    }

    return { isAuthenticated, userRole };
  };
}

// ==========================================
// ROUTE HELPERS
// ==========================================

/**
 * Create a route element with Suspense
 */
function createRouteElement(Component: LazyExoticComponent<ComponentType>): ReactNode {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
}

// ==========================================
// ROUTE CONFIGURATION
// ==========================================

const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout><LoadingFallback /></MainLayout>,
    errorElement: <ErrorBoundary />,
    children: [{ index: true, element: createRouteElement(LandingPage) }],
  },
  {
    path: '/courts',
    element: <MainLayout><LoadingFallback /></MainLayout>,
    errorElement: <ErrorBoundary />,
    children: [{ index: true, element: createRouteElement(CourtsPage) }],
  },
  {
    path: '/about',
    element: <MainLayout><LoadingFallback /></MainLayout>,
    errorElement: <ErrorBoundary />,
    children: [{ index: true, element: createRouteElement(AboutPage) }],
  },
  {
    path: '/contact',
    element: <MainLayout><LoadingFallback /></MainLayout>,
    errorElement: <ErrorBoundary />,
    children: [{ index: true, element: createRouteElement(ContactPage) }],
  },
  {
    path: '/login',
    element: <AuthLayout><LoadingFallback /></AuthLayout>,
    errorElement: <ErrorBoundary />,
    loader: createAuthLoader(),
    children: [{ index: true, element: createRouteElement(LoginPage) }],
  },
  {
    path: '/register',
    element: <AuthLayout><LoadingFallback /></AuthLayout>,
    errorElement: <ErrorBoundary />,
    loader: createAuthLoader(),
    children: [{ index: true, element: createRouteElement(RegisterPage) }],
  },
  {
    path: '/forgot-password',
    element: <AuthLayout><LoadingFallback /></AuthLayout>,
    errorElement: <ErrorBoundary />,
    loader: createAuthLoader(),
    children: [{ index: true, element: createRouteElement(ForgotPasswordPage) }],
  },
  {
    path: '/unauthorized',
    element: <MainLayout><LoadingFallback /></MainLayout>,
    errorElement: <ErrorBoundary />,
    children: [{ index: true, element: createRouteElement(UnauthorizedPage) }],
  },
];

const clientRoutes: RouteObject[] = [
  {
    path: '/client',
    element: <DashboardLayout role="client"><LoadingFallback /></DashboardLayout>,
    errorElement: <ErrorBoundary />,
    loader: createRoleLoader('client'),
    children: [
      { index: true, element: createRouteElement(ClientDashboard) },
      { path: 'dashboard', element: createRouteElement(ClientDashboard) },
      { path: 'bookings', element: createRouteElement(ClientBookings) },
      { path: 'book', element: createRouteElement(BookingPage) },
      { path: 'reservations', element: createRouteElement(MyReservationsPage) },
      { path: 'slots', element: createRouteElement(ClientSlots) },
      { path: 'profile', element: createRouteElement(ClientProfile) },
    ],
  },
];

const moniteurRoutes: RouteObject[] = [
  {
    path: '/moniteur',
    element: <DashboardLayout role="moniteur"><LoadingFallback /></DashboardLayout>,
    errorElement: <ErrorBoundary />,
    loader: createRoleLoader(['moniteur', 'admin']),
    children: [
      { index: true, element: createRouteElement(MoniteurDashboard) },
      { path: 'dashboard', element: createRouteElement(MoniteurDashboard) },
      { path: 'schedule', element: createRouteElement(MoniteurSchedule) },
      { path: 'slots', element: createRouteElement(MoniteurSlots) },
      { path: 'students', element: createRouteElement(MoniteurStudents) },
      { path: 'profile', element: createRouteElement(MoniteurProfile) },
    ],
  },
];

const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <DashboardLayout role="admin"><LoadingFallback /></DashboardLayout>,
    errorElement: <ErrorBoundary />,
    loader: createRoleLoader('admin'),
    children: [
      { index: true, element: createRouteElement(AdminDashboard) },
      { path: 'dashboard', element: createRouteElement(AdminDashboard) },
      { path: 'users', element: createRouteElement(AdminUsers) },
      { path: 'courts', element: createRouteElement(AdminCourts) },
      { path: 'reservations', element: createRouteElement(AdminReservations) },
      { path: 'slots', element: createRouteElement(AdminSlots) },
      { path: 'settings', element: createRouteElement(AdminSettings) },
    ],
  },
];

const notFoundRoute: RouteObject = {
  path: '*',
  element: <MainLayout><LoadingFallback /></MainLayout>,
  errorElement: <ErrorBoundary />,
  children: [{ index: true, element: createRouteElement(NotFoundPage) }],
};

// ==========================================
// ROUTER EXPORT
// ==========================================

export const router = createBrowserRouter([
  ...publicRoutes,
  ...clientRoutes,
  ...moniteurRoutes,
  ...adminRoutes,
  notFoundRoute,
]);

export default router;
