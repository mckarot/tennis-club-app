/**
 * Error Types
 *
 * Type definitions for error handling, error boundaries,
 * and Firebase error classification.
 *
 * @module @types/error.types
 */

import type { ReactNode } from 'react';

// ==========================================
// FIREBASE ERROR CODES
// ==========================================

/**
 * Firebase error code enumeration
 * Covers common Firebase SDK error codes
 */
export enum FirebaseErrorCode {
  // Auth Errors
  AUTH_INVALID_EMAIL = 'auth/invalid-email',
  AUTH_USER_DISABLED = 'auth/user-disabled',
  AUTH_USER_NOT_FOUND = 'auth/user-not-found',
  AUTH_WRONG_PASSWORD = 'auth/wrong-password',
  AUTH_EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  AUTH_WEAK_PASSWORD = 'auth/weak-password',
  AUTH_OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed',
  AUTH_EXPIRED_ACTION_CODE = 'auth/expired-action-code',
  AUTH_INVALID_ACTION_CODE = 'auth/invalid-action-code',
  AUTH_INVALID_CREDENTIAL = 'auth/invalid-credential',
  AUTH_REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login',
  AUTH_NETWORK_REQUEST_FAILED = 'auth/network-request-failed',

  // Firestore Errors
  FIRESTORE_PERMISSION_DENIED = 'permission-denied',
  FIRESTORE_UNAUTHENTICATED = 'unauthenticated',
  FIRESTORE_NOT_FOUND = 'not-found',
  FIRESTORE_ALREADY_EXISTS = 'already-exists',
  FIRESTORE_RESOURCE_EXHAUSTED = 'resource-exhausted',
  FIRESTORE_FAILED_PRECONDITION = 'failed-precondition',
  FIRESTORE_ABORTED = 'aborted',
  FIRESTORE_OUT_OF_RANGE = 'out-of-range',
  FIRESTORE_UNAVAILABLE = 'unavailable',
  FIRESTORE_DATA_LOSS = 'data-loss',

  // Generic Errors
  GENERIC_INTERNAL_ERROR = 'internal',
  GENERIC_UNKNOWN_ERROR = 'unknown',
}

// ==========================================
// APPLICATION ERROR TYPES
// ==========================================

/**
 * Error category for classification
 */
export type ErrorCategory =
  | 'firebase'
  | 'network'
  | 'validation'
  | 'permission'
  | 'quota'
  | 'not-found'
  | 'conflict'
  | 'unknown';

/**
 * Application error interface
 * Extends Error with additional metadata
 */
export interface AppError extends Error {
  code: FirebaseErrorCode | string;
  category: ErrorCategory;
  details?: Record<string, unknown>;
  retryable: boolean;
  userMessage: string;
}

/**
 * Error options for creating AppError
 */
export interface AppErrorOptions {
  code: FirebaseErrorCode | string;
  category: ErrorCategory;
  details?: Record<string, unknown>;
  retryable?: boolean;
  userMessage?: string;
  cause?: unknown;
}

// ==========================================
// ERROR BOUNDARY TYPES
// ==========================================

/**
 * Error state for error boundaries
 */
export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo?: {
    componentStack: string | null;
  };
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo?: { componentStack: string | null }) => void;
  onReset?: () => void;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    componentStack: string | null;
  } | null;
}

// ==========================================
// ERROR HANDLER TYPES
// ==========================================

/**
 * Error handler function type
 */
export type ErrorHandler = (error: unknown, context?: string) => AppError;

/**
 * Error recovery action
 */
export interface ErrorRecoveryAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

/**
 * Error display configuration
 */
export interface ErrorDisplayConfig {
  title: string;
  message: string;
  icon?: 'error' | 'warning' | 'info';
  actions?: ErrorRecoveryAction[];
  showStackTrace?: boolean;
}

// ==========================================
// ERROR CLASSIFICATION UTILITIES
// ==========================================

/**
 * Error classification result
 */
export interface ErrorClassification {
  category: ErrorCategory;
  code: string;
  isRetryable: boolean;
  userMessage: string;
}

/**
 * Firebase error response structure
 */
export interface FirebaseError {
  code: string;
  message: string;
  name: string;
  stack?: string;
}

// ==========================================
// ERROR RECOVERY STRATEGIES
// ==========================================

/**
 * Error recovery strategy type
 */
export type ErrorRecoveryStrategy =
  | 'retry'
  | 'refresh'
  | 'navigate-home'
  | 'navigate-login'
  | 'contact-support'
  | 'none';

/**
 * Error recovery configuration
 */
export interface ErrorRecoveryConfig {
  strategy: ErrorRecoveryStrategy;
  maxRetries?: number;
  retryDelay?: number;
}
