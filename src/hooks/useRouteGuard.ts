/**
 * useRouteGuard Hook
 *
 * React hook for route protection with authentication and role-based authorization.
 * Provides auth state, role validation, and redirect utilities.
 *
 * @module @hooks/useRouteGuard
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getAuthInstance, getDbInstance } from '../config/firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import type { UseRouteGuardReturn } from '../types/service.types';
import type { User, UserRole, UserStatus } from '../types/user.types';
import type { ErrorCategory } from '../types/error.types';
import type { Timestamp } from 'firebase/firestore';

/**
 * Hook options for useRouteGuard
 */
export interface UseRouteGuardOptions {
  /** Required role for route access (optional) */
  requiredRole?: UserRole | UserRole[];
  /** Redirect path if not authenticated (default: '/login') */
  redirectTo?: string;
  /** Redirect path if not authorized (default: '/unauthorized') */
  unauthorizedRedirect?: string;
  /** Enable role checking (default: true) */
  checkRole?: boolean;
}

/**
 * Auth state enumeration
 */
export enum AuthState {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
}

/**
 * Valid UserRole values
 */
const VALID_USER_ROLES: UserRole[] = ['admin', 'moniteur', 'client'];

/**
 * Valid UserStatus values
 */
const VALID_USER_STATUSES: UserStatus[] = ['online', 'away', 'inactive'];

const auth = getAuthInstance();
const db = getDbInstance();

/**
 * Map Firestore user data to User type safely with runtime validation
 */
function mapToUser(uid: string, data: Record<string, unknown>): User {
  // Validate required fields with runtime type checking
  if (typeof data.name !== 'string') {
    throw new Error(`Invalid user name: expected string, got ${typeof data.name}`);
  }

  if (typeof data.email !== 'string') {
    throw new Error(`Invalid user email: expected string, got ${typeof data.email}`);
  }

  if (typeof data.role !== 'string' || !VALID_USER_ROLES.includes(data.role as UserRole)) {
    throw new Error(`Invalid user role: expected ${VALID_USER_ROLES.join(' | ')}, got ${data.role}`);
  }

  if (typeof data.status !== 'string' || !VALID_USER_STATUSES.includes(data.status as UserStatus)) {
    throw new Error(`Invalid user status: expected ${VALID_USER_STATUSES.join(' | ')}, got ${data.status}`);
  }

  if (!(data.createdAt instanceof Timestamp)) {
    throw new Error(`Invalid user createdAt: expected Timestamp, got ${typeof data.createdAt}`);
  }

  if (!(data.updatedAt instanceof Timestamp)) {
    throw new Error(`Invalid user updatedAt: expected Timestamp, got ${typeof data.updatedAt}`);
  }

  // Optional fields validation
  if (data.phone !== undefined && typeof data.phone !== 'string') {
    throw new Error(`Invalid user phone: expected string or undefined, got ${typeof data.phone}`);
  }

  if (data.avatar !== undefined && typeof data.avatar !== 'string') {
    throw new Error(`Invalid user avatar: expected string or undefined, got ${typeof data.avatar}`);
  }

  if (data.lastLoginAt !== undefined && !(data.lastLoginAt instanceof Timestamp)) {
    throw new Error(`Invalid user lastLoginAt: expected Timestamp or undefined, got ${typeof data.lastLoginAt}`);
  }

  // All validations passed - safe to cast
  return {
    uid,
    name: data.name,
    email: data.email,
    role: data.role as UserRole,
    phone: data.phone as string | undefined,
    status: data.status as UserStatus,
    avatar: data.avatar as string | undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastLoginAt: data.lastLoginAt as Timestamp | undefined,
  };
}

/**
 * React hook for route protection with authentication and role-based authorization
 */
export function useRouteGuard(options: UseRouteGuardOptions = {}): UseRouteGuardReturn {
  const {
    requiredRole,
    redirectTo = '/login',
    unauthorizedRedirect = '/unauthorized',
    checkRole = true,
  } = options;

  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = useCallback(async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return mapToUser(userDoc.id, data as Record<string, unknown>);
    } catch (err) {
      console.error('[useRouteGuard] fetchUserProfile error:', err);
      throw err;
    }
  }, []);

  /**
   * Check if user has required role
   */
  const hasRequiredRole = useCallback(
    (userRole: UserRole | undefined): boolean => {
      if (!userRole || !requiredRole) {
        return true;
      }

      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
      }

      return userRole === requiredRole;
    },
    [requiredRole]
  );

  /**
   * Redirect to specified path
   */
  const redirectToPath = useCallback(
    (path: string): void => {
      navigate(path, { replace: true });
    },
    [navigate]
  );

  /**
   * Setup auth state listener
   */
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!isMounted) return;

        try {
          if (!firebaseUser) {
            setFirebaseUser(null);
            setUser(null);
            setIsAuthenticated(false);
            setIsAuthorized(false);
            setIsLoading(false);

            if (checkRole) {
              redirectToPath(redirectTo);
            }
            return;
          }

          setFirebaseUser(firebaseUser);
          setIsAuthenticated(true);

          const userProfile = await fetchUserProfile(firebaseUser.uid);

          if (!isMounted) return;

          if (!userProfile) {
            console.warn('[useRouteGuard] User profile not found:', firebaseUser.uid);
            setUser(null);
            setIsAuthorized(false);
            setIsLoading(false);
            redirectToPath(redirectTo);
            return;
          }

          setUser(userProfile);

          if (checkRole && requiredRole) {
            const authorized = hasRequiredRole(userProfile.role);
            setIsAuthorized(authorized);

            if (!authorized) {
              redirectToPath(unauthorizedRedirect);
            }
          } else {
            setIsAuthorized(true);
          }

          setIsLoading(false);
        } catch (err) {
          console.error('[useRouteGuard] Auth state change error:', err);
          setError(err instanceof Error ? err : new Error('Authentication failed'));
          setIsLoading(false);
          setIsAuthenticated(false);
          setIsAuthorized(false);
        }
      },
      (err) => {
        console.error('[useRouteGuard] Auth listener error:', err);
        setError(err instanceof Error ? err : new Error('Authentication listener failed'));
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [
    checkRole,
    requiredRole,
    redirectTo,
    unauthorizedRedirect,
    fetchUserProfile,
    hasRequiredRole,
    redirectToPath,
  ]);

  return {
    isAuthenticated,
    isAuthorized,
    isLoading,
    user,
    redirectTo: redirectToPath,
  };
}

/**
 * Hook for public routes (redirect if already authenticated)
 */
export function usePublicRouteGuard(redirectIfAuthenticated: string = '/client') {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAlreadyAuthenticated, setIsAlreadyAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsAlreadyAuthenticated(true);
        navigate(redirectIfAuthenticated, { replace: true });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, redirectIfAuthenticated]);

  return {
    isLoading,
    isAlreadyAuthenticated,
  };
}

/**
 * Hook for admin-only routes
 */
export function useAdminGuard() {
  return useRouteGuard({
    requiredRole: 'admin',
    redirectTo: '/login',
    unauthorizedRedirect: '/unauthorized',
  });
}

/**
 * Hook for moniteur-only routes
 */
export function useMoniteurGuard() {
  return useRouteGuard({
    requiredRole: 'moniteur',
    redirectTo: '/login',
    unauthorizedRedirect: '/unauthorized',
  });
}

/**
 * Hook for client-only routes
 */
export function useClientGuard() {
  return useRouteGuard({
    requiredRole: 'client',
    redirectTo: '/login',
    unauthorizedRedirect: '/unauthorized',
  });
}

/**
 * Hook for routes accessible by admin and moniteur
 */
export function useStaffGuard() {
  return useRouteGuard({
    requiredRole: ['admin', 'moniteur'],
    redirectTo: '/login',
    unauthorizedRedirect: '/unauthorized',
  });
}

/**
 * Hook for routes accessible by any authenticated user
 */
export function useAuthGuard() {
  return useRouteGuard({
    checkRole: false,
    redirectTo: '/login',
  });
}

export default useRouteGuard;
