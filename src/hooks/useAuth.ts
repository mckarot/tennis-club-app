/**
 * Authentication Hook
 *
 * Provides authentication state management and operations.
 * Uses Firebase Auth singleton and Firestore for user data.
 *
 * Features:
 * - User state management
 * - Login with email/password
 * - Registration with user profile creation
 * - Logout with cleanup
 * - Password reset
 * - Auth state persistence
 *
 * @module @hooks/useAuth
 */

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuthInstance, getDbInstance } from '../config/firebase.config';
import type {
  User,
  UserRole,
  CreateUserInput,
  LoginInput,
  AuthResult,
  FirebaseAuthErrorCode,
  ClassifiedAuthError,
} from '../firebase/types';

// ==========================================
// HOOK RETURN TYPE
// ==========================================

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  errorCode: FirebaseAuthErrorCode | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  register: (input: CreateUserInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}

// ==========================================
// ERROR CLASSIFICATION
// ==========================================

/**
 * Classify Firebase auth error into user-friendly message
 */
function classifyAuthError(error: unknown): ClassifiedAuthError {
  const firebaseError = error as { code?: string; message?: string };
  const code = (firebaseError?.code as FirebaseAuthErrorCode) ?? 'unknown';
  const message = firebaseError?.message || 'An unknown error occurred';

  const errorMap: Record<string, Omit<ClassifiedAuthError, 'code' | 'message'>> = {
    [FirebaseAuthErrorCode.INVALID_CREDENTIAL]: {
      userMessage: 'Invalid email or password',
      isRetryable: true,
    },
    [FirebaseAuthErrorCode.INVALID_EMAIL]: {
      userMessage: 'Invalid email format',
      isRetryable: true,
    },
    [FirebaseAuthErrorCode.USER_DISABLED]: {
      userMessage: 'This account has been disabled',
      isRetryable: false,
    },
    [FirebaseAuthErrorCode.USER_NOT_FOUND]: {
      userMessage: 'No account found with this email',
      isRetryable: true,
    },
    [FirebaseAuthErrorCode.WRONG_PASSWORD]: {
      userMessage: 'Incorrect password',
      isRetryable: true,
    },
    [FirebaseAuthErrorCode.EMAIL_ALREADY_IN_USE]: {
      userMessage: 'This email is already registered',
      isRetryable: false,
    },
    [FirebaseAuthErrorCode.WEAK_PASSWORD]: {
      userMessage: 'Password is too weak',
      isRetryable: true,
    },
    [FirebaseAuthErrorCode.OPERATION_NOT_ALLOWED]: {
      userMessage: 'This operation is not allowed',
      isRetryable: false,
    },
    [FirebaseAuthErrorCode.EXPIRED_ACTION_CODE]: {
      userMessage: 'This link has expired',
      isRetryable: false,
    },
    [FirebaseAuthErrorCode.INVALID_ACTION_CODE]: {
      userMessage: 'This link is invalid',
      isRetryable: false,
    },
    [FirebaseAuthErrorCode.REQUIRES_RECENT_LOGIN]: {
      userMessage: 'Please log in again to perform this action',
      isRetryable: true,
    },
    [FirebaseAuthErrorCode.NETWORK_REQUEST_FAILED]: {
      userMessage: 'Network error. Please check your connection',
      isRetryable: true,
    },
    [FirebaseAuthErrorCode.TOO_MANY_REQUESTS]: {
      userMessage: 'Too many attempts. Please try again later',
      isRetryable: true,
    },
    [FirebaseAuthErrorCode.INTERNAL_ERROR]: {
      userMessage: 'Internal error. Please try again',
      isRetryable: true,
    },
    unknown: {
      userMessage: 'An unexpected error occurred',
      isRetryable: true,
    },
  };

  const errorInfo = errorMap[code] || errorMap.unknown;

  return {
    code,
    message,
    userMessage: errorInfo.userMessage,
    isRetryable: errorInfo.isRetryable,
  };
}

/**
 * Convert Firebase user and Firestore data to User entity
 */
function createUserEntity(firebaseUser: FirebaseUser, firestoreData?: User): User {
  if (firestoreData) {
    return firestoreData;
  }

  // Fallback: create from Firebase user
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    role: 'client' as UserRole,
    status: 'online',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
  };
}

// ==========================================
// AUTH HOOK
// ==========================================

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<FirebaseAuthErrorCode | null>(null);

  const auth = getAuthInstance();
  const db = getDbInstance();

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = useCallback(
    async (uid: string): Promise<User | null> => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          return {
            id: userDoc.id,
            name: data.name,
            email: data.email,
            role: data.role as UserRole,
            phone: data.phone,
            status: data.status,
            avatar: data.avatar,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            lastLoginAt: data.lastLoginAt,
          };
        }
        return null;
      } catch (err) {
        console.error('[useAuth] Error fetching user profile:', err);
        return null;
      }
    },
    [db]
  );

  /**
   * Check authentication status on mount
   */
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);

    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          if (firebaseUser) {
            const userProfile = await fetchUserProfile(firebaseUser.uid);
            const userEntity = createUserEntity(firebaseUser, userProfile || undefined);
            setUser(userEntity);
            setIsAuthenticated(true);

            // Update last login
            try {
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                lastLoginAt: Timestamp.now(),
                status: 'online',
              });
            } catch (err) {
              console.error('[useAuth] Error updating last login:', err);
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
          setIsLoading(false);
          unsubscribe();
          resolve();
        },
        (err) => {
          console.error('[useAuth] Auth state change error:', err);
          const classified = classifyAuthError(err);
          setError(classified.userMessage);
          setErrorCode(classified.code);
          setIsLoading(false);
          unsubscribe();
          resolve();
        }
      );
    });
  }, [auth, db, fetchUserProfile]);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string, rememberMe?: boolean): Promise<AuthResult> => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);

      try {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Set persistence if remember me is checked
        if (rememberMe) {
          await auth.setPersistence('local');
        } else {
          await auth.setPersistence('session');
        }

        // Fetch user profile from Firestore
        const userProfile = await fetchUserProfile(firebaseUser.uid);

        if (!userProfile) {
          // User document doesn't exist - this is an error
          await signOut(auth);
          const result: AuthResult = {
            success: false,
            error: 'User profile not found',
            errorCode: FirebaseAuthErrorCode.USER_NOT_FOUND,
          };
          setError(result.error);
          setErrorCode(result.errorCode || null);
          setIsLoading(false);
          return result;
        }

        const userEntity = createUserEntity(firebaseUser, userProfile);
        setUser(userEntity);
        setIsAuthenticated(true);
        setIsLoading(false);

        return {
          success: true,
          user: userEntity,
        };
      } catch (err) {
        console.error('[useAuth] Login error:', err);
        const classified = classifyAuthError(err);
        const result: AuthResult = {
          success: false,
          error: classified.userMessage,
          errorCode: classified.code === 'unknown' ? undefined : classified.code,
        };
        setError(result.error || 'Login failed');
        setErrorCode(result.errorCode || null);
        setIsLoading(false);
        return result;
      }
    },
    [auth, fetchUserProfile]
  );

  /**
   * Register a new user
   */
  const register = useCallback(
    async (input: CreateUserInput): Promise<AuthResult> => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);

      try {
        // Import createUserWithEmailAndPassword dynamically to avoid circular dependency
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const { updateProfile } = await import('firebase/auth');

        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
        const firebaseUser = userCredential.user;

        // Update auth profile with display name
        await updateProfile(firebaseUser, {
          displayName: input.name,
        });

        // Create user document in Firestore
        const userData: Omit<User, 'id'> = {
          name: input.name,
          email: input.email,
          role: input.role || 'client',
          phone: input.phone,
          status: 'online',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          lastLoginAt: Timestamp.now(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);

        const userEntity: User = {
          id: firebaseUser.uid,
          ...userData,
        };

        setUser(userEntity);
        setIsAuthenticated(true);
        setIsLoading(false);

        return {
          success: true,
          user: userEntity,
        };
      } catch (err) {
        console.error('[useAuth] Registration error:', err);
        const classified = classifyAuthError(err);
        const result: AuthResult = {
          success: false,
          error: classified.userMessage,
          errorCode: classified.code === 'unknown' ? undefined : classified.code,
        };
        setError(result.error || 'Registration failed');
        setErrorCode(result.errorCode || null);
        setIsLoading(false);
        return result;
      }
    },
    [auth, db]
  );

  /**
   * Logout current user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setErrorCode(null);
    } catch (err) {
      console.error('[useAuth] Logout error:', err);
      throw err;
    }
  }, [auth]);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);

      try {
        await sendPasswordResetEmail(auth, email);
        setIsLoading(false);
        return { success: true };
      } catch (err) {
        console.error('[useAuth] Password reset error:', err);
        const classified = classifyAuthError(err);
        const errorMessage = classified.userMessage || 'Password reset failed';
        setError(errorMessage);
        setErrorCode(classified.code === 'unknown' ? null : classified.code);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [auth]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    errorCode,
    login,
    register,
    logout,
    resetPassword,
    checkAuthStatus,
    clearError,
  };
}

export default useAuth;
