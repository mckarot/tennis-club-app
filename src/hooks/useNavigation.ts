/**
 * useNavigation Hook
 *
 * React hook for navigation with role-based routing support.
 * Provides typed navigation functions and location access.
 *
 * @module @hooks/useNavigation
 */

import { useCallback } from 'react';
import { useNavigate, useLocation, type NavigateFunction, type Location } from 'react-router-dom';
import type { UseNavigationReturn } from '../types/service.types';
import type { UserRole } from '../types/user.types';

/**
 * Navigation options
 */
export interface NavigationOptions {
  replace?: boolean;
  state?: unknown;
}

/**
 * Role-based route paths
 */
export const ROLE_ROUTES: Record<UserRole, string> = {
  admin: '/admin',
  moniteur: '/moniteur',
  client: '/client',
};

/**
 * Public route paths
 */
export const PUBLIC_ROUTES = {
  home: '/',
  courts: '/courts',
  login: '/login',
  register: '/register',
  about: '/about',
  contact: '/contact',
};

/**
 * Protected route paths (common)
 */
export const PROTECTED_ROUTES = {
  profile: '/profile',
  settings: '/settings',
  reservations: '/reservations',
};

/**
 * React hook for navigation with role-based routing
 *
 * @returns UseNavigationReturn with navigation functions and location
 *
 * @example
 * // Basic usage
 * const { navigate, location, goBack } = useNavigation();
 *
 * // Navigate to a path
 * navigate('/courts');
 *
 * // Navigate with options
 * navigate('/login', { replace: true });
 *
 * // Navigate with state
 * navigate('/reservation', { state: { courtId: '123' } });
 *
 * // Get current location
 * console.log(location.pathname);
 *
 * @example
 * // Role-based navigation
 * const { navigateToRoleDashboard } = useNavigationWithRoles();
 *
 * navigateToRoleDashboard('admin'); // Navigates to /admin
 * navigateToRoleDashboard('client'); // Navigates to /client
 */
export function useNavigation(): UseNavigationReturn {
  const navigateFn: NavigateFunction = useNavigate();
  const location: Location = useLocation();

  /**
   * Navigate to a path
   */
  const navigate = useCallback(
    (path: string, options?: NavigationOptions): void => {
      const { replace = false, state } = options || {};

      if (replace) {
        navigateFn(path, { replace: true, state });
      } else {
        navigateFn(path, { state });
      }
    },
    [navigateFn]
  );

  /**
   * Go back in history
   */
  const goBack = useCallback((): void => {
    navigateFn(-1);
  }, [navigateFn]);

  /**
   * Go forward in history
   */
  const goForward = useCallback((): void => {
    navigateFn(1);
  }, [navigateFn]);

  return {
    navigate,
    location: {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      key: location.key,
    },
    goBack,
    goForward,
  };
}

/**
 * Extended hook with role-based navigation helpers
 */
export function useNavigationWithRoles() {
  const { navigate, location, goBack, goForward } = useNavigation();

  /**
   * Navigate to role-specific dashboard
   */
  const navigateToRoleDashboard = useCallback(
    (role: UserRole): void => {
      const dashboardPath = ROLE_ROUTES[role];
      navigate(dashboardPath);
    },
    [navigate]
  );

  /**
   * Navigate to login page
   */
  const navigateToLogin = useCallback(
    (redirectTo?: string): void => {
      const path = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : PUBLIC_ROUTES.login;
      navigate(path);
    },
    [navigate]
  );

  /**
   * Navigate to register page
   */
  const navigateToRegister = useCallback((): void => {
    navigate(PUBLIC_ROUTES.register);
  }, [navigate]);

  /**
   * Navigate to profile page
   */
  const navigateToProfile = useCallback((): void => {
    navigate(PROTECTED_ROUTES.profile);
  }, [navigate]);

  /**
   * Navigate to reservations page
   */
  const navigateToReservations = useCallback((): void => {
    navigate(PROTECTED_ROUTES.reservations);
  }, [navigate]);

  /**
   * Navigate to courts page
   */
  const navigateToCourts = useCallback((): void => {
    navigate(PUBLIC_ROUTES.courts);
  }, [navigate]);

  /**
   * Navigate to home page
   */
  const navigateToHome = useCallback((): void => {
    navigate(PUBLIC_ROUTES.home);
  }, [navigate]);

  /**
   * Check if current route is public
   */
  const isPublicRoute = useCallback((): boolean => {
    const publicPaths = Object.values(PUBLIC_ROUTES);
    return publicPaths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
  }, [location.pathname]);

  /**
   * Check if current route is role-specific
   */
  const isRoleRoute = useCallback((): boolean => {
    const rolePaths = Object.values(ROLE_ROUTES);
    return rolePaths.some((path) => location.pathname.startsWith(path));
  }, [location.pathname]);

  /**
   * Get current role from path
   */
  const getCurrentRoleFromPath = useCallback((): UserRole | null => {
    for (const [role, path] of Object.entries(ROLE_ROUTES)) {
      if (location.pathname.startsWith(path)) {
        return role as UserRole;
      }
    }
    return null;
  }, [location.pathname]);

  return {
    navigate,
    location,
    goBack,
    goForward,
    navigateToRoleDashboard,
    navigateToLogin,
    navigateToRegister,
    navigateToProfile,
    navigateToReservations,
    navigateToCourts,
    navigateToHome,
    isPublicRoute,
    isRoleRoute,
    getCurrentRoleFromPath,
  };
}

/**
 * Hook for client-specific navigation
 */
export function useClientNavigation() {
  const { navigate, location, goBack, goForward } = useNavigation();

  const CLIENT_ROUTES = {
    dashboard: '/client',
    bookings: '/client/bookings',
    availableCourts: '/client/courts',
    myReservations: '/client/reservations',
    slots: '/client/slots',
    profile: '/client/profile',
  };

  const navigateToDashboard = useCallback((): void => {
    navigate(CLIENT_ROUTES.dashboard);
  }, [navigate]);

  const navigateToBookings = useCallback((): void => {
    navigate(CLIENT_ROUTES.bookings);
  }, [navigate]);

  const navigateToAvailableCourts = useCallback((): void => {
    navigate(CLIENT_ROUTES.availableCourts);
  }, [navigate]);

  const navigateToMyReservations = useCallback((): void => {
    navigate(CLIENT_ROUTES.myReservations);
  }, [navigate]);

  const navigateToSlots = useCallback((): void => {
    navigate(CLIENT_ROUTES.slots);
  }, [navigate]);

  return {
    navigate,
    location,
    goBack,
    goForward,
    navigateToDashboard,
    navigateToBookings,
    navigateToAvailableCourts,
    navigateToMyReservations,
    navigateToSlots,
    routes: CLIENT_ROUTES,
  };
}

/**
 * Hook for admin-specific navigation
 */
export function useAdminNavigation() {
  const { navigate, location, goBack, goForward } = useNavigation();

  const ADMIN_ROUTES = {
    dashboard: '/admin',
    users: '/admin/users',
    courts: '/admin/courts',
    reservations: '/admin/reservations',
    slots: '/admin/slots',
    settings: '/admin/settings',
  };

  const navigateToDashboard = useCallback((): void => {
    navigate(ADMIN_ROUTES.dashboard);
  }, [navigate]);

  const navigateToUsers = useCallback((): void => {
    navigate(ADMIN_ROUTES.users);
  }, [navigate]);

  const navigateToCourts = useCallback((): void => {
    navigate(ADMIN_ROUTES.courts);
  }, [navigate]);

  const navigateToReservations = useCallback((): void => {
    navigate(ADMIN_ROUTES.reservations);
  }, [navigate]);

  const navigateToSlots = useCallback((): void => {
    navigate(ADMIN_ROUTES.slots);
  }, [navigate]);

  return {
    navigate,
    location,
    goBack,
    goForward,
    navigateToDashboard,
    navigateToUsers,
    navigateToCourts,
    navigateToReservations,
    navigateToSlots,
    routes: ADMIN_ROUTES,
  };
}

/**
 * Hook for moniteur-specific navigation
 */
export function useMoniteurNavigation() {
  const { navigate, location, goBack, goForward } = useNavigation();

  const MONITEUR_ROUTES = {
    dashboard: '/moniteur',
    schedule: '/moniteur/schedule',
    slots: '/moniteur/slots',
    students: '/moniteur/students',
    profile: '/moniteur/profile',
  };

  const navigateToDashboard = useCallback((): void => {
    navigate(MONITEUR_ROUTES.dashboard);
  }, [navigate]);

  const navigateToSchedule = useCallback((): void => {
    navigate(MONITEUR_ROUTES.schedule);
  }, [navigate]);

  const navigateToSlots = useCallback((): void => {
    navigate(MONITEUR_ROUTES.slots);
  }, [navigate]);

  const navigateToStudents = useCallback((): void => {
    navigate(MONITEUR_ROUTES.students);
  }, [navigate]);

  return {
    navigate,
    location,
    goBack,
    goForward,
    navigateToDashboard,
    navigateToSchedule,
    navigateToSlots,
    navigateToStudents,
    routes: MONITEUR_ROUTES,
  };
}

export default useNavigation;
