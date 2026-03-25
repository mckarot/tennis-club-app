/**
 * Error utilities for Firebase error classification and handling
 */

import type { ErrorCategory } from '../types/error.types';
import { FirebaseErrorCode } from '../types/error.types';

/**
 * Classify Firebase error by message content
 */
export function classifyFirebaseError(error: Error): {
  category: ErrorCategory;
  code: string;
  userMessage: string;
} {
  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes('permission-denied') || errorMessage.includes('permission denied')) {
    return {
      category: 'permission',
      code: FirebaseErrorCode.FIRESTORE_PERMISSION_DENIED,
      userMessage: "You don't have permission to perform this action.",
    };
  }

  if (errorMessage.includes('unauthenticated') || errorMessage.includes('authentication')) {
    return {
      category: 'permission',
      code: FirebaseErrorCode.FIRESTORE_UNAUTHENTICATED,
      userMessage: 'Please sign in to continue.',
    };
  }

  if (errorMessage.includes('not-found') || errorMessage.includes('not found')) {
    return {
      category: 'not-found',
      code: FirebaseErrorCode.FIRESTORE_NOT_FOUND,
      userMessage: 'The requested resource was not found.',
    };
  }

  if (errorMessage.includes('network') || errorMessage.includes('offline')) {
    return {
      category: 'network',
      code: FirebaseErrorCode.AUTH_NETWORK_REQUEST_FAILED,
      userMessage: 'Network error. Please check your connection and try again.',
    };
  }

  if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
    return {
      category: 'quota',
      code: FirebaseErrorCode.FIRESTORE_RESOURCE_EXHAUSTED,
      userMessage: 'Too many requests. Please wait a moment and try again.',
    };
  }

  if (errorMessage.includes('conflict') || errorMessage.includes('already exists')) {
    return {
      category: 'conflict',
      code: FirebaseErrorCode.FIRESTORE_ALREADY_EXISTS,
      userMessage: 'This resource already exists or conflicts with another.',
    };
  }

  return {
    category: 'unknown',
    code: FirebaseErrorCode.GENERIC_UNKNOWN_ERROR,
    userMessage: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Get error title by category
 */
export function getErrorTitle(category: ErrorCategory): string {
  const titles: Record<ErrorCategory, string> = {
    permission: 'Access Denied',
    network: 'Connection Error',
    quota: 'Rate Limit Exceeded',
    'not-found': 'Not Found',
    conflict: 'Conflict',
    validation: 'Validation Error',
    firebase: 'Server Error',
    unknown: 'Error',
  };
  return titles[category] || 'Error';
}

/**
 * Get error icon by category
 */
export function getErrorIcon(category: ErrorCategory): 'error' | 'warning' | 'info' {
  if (category === 'permission' || category === 'validation') return 'warning';
  if (category === 'not-found' || category === 'network') return 'info';
  return 'error';
}

/**
 * Get error category from RootErrorBoundary classification
 */
export function classifyRootError(error: Error): {
  category: ErrorCategory;
  code: string;
  isRetryable: boolean;
  userMessage: string;
} {
  const errorMessage = error.message.toLowerCase();

  if (
    errorMessage.includes('permission-denied') ||
    errorMessage.includes('permission denied') ||
    errorMessage.includes('missing or insufficient permissions')
  ) {
    return {
      category: 'permission',
      code: FirebaseErrorCode.FIRESTORE_PERMISSION_DENIED,
      isRetryable: false,
      userMessage: "You don't have permission to access this resource. Please check your account permissions.",
    };
  }

  if (
    errorMessage.includes('unauthenticated') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('id token')
  ) {
    return {
      category: 'permission',
      code: FirebaseErrorCode.FIRESTORE_UNAUTHENTICATED,
      isRetryable: false,
      userMessage: 'Your session has expired. Please sign in again to continue.',
    };
  }

  if (errorMessage.includes('not-found') || errorMessage.includes('not found')) {
    return {
      category: 'not-found',
      code: FirebaseErrorCode.FIRESTORE_NOT_FOUND,
      isRetryable: false,
      userMessage: 'The requested resource could not be found.',
    };
  }

  if (
    errorMessage.includes('network') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection')
  ) {
    return {
      category: 'network',
      code: FirebaseErrorCode.AUTH_NETWORK_REQUEST_FAILED,
      isRetryable: true,
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
    };
  }

  if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return {
      category: 'quota',
      code: FirebaseErrorCode.FIRESTORE_RESOURCE_EXHAUSTED,
      isRetryable: true,
      userMessage: 'Too many requests. Please wait a moment before trying again.',
    };
  }

  if (errorMessage.includes('internal') || errorMessage.includes('server error')) {
    return {
      category: 'firebase',
      code: FirebaseErrorCode.GENERIC_INTERNAL_ERROR,
      isRetryable: true,
      userMessage: 'A server error occurred. Please try again later.',
    };
  }

  return {
    category: 'unknown',
    code: FirebaseErrorCode.GENERIC_UNKNOWN_ERROR,
    isRetryable: true,
    userMessage: 'An unexpected error occurred. Please try again.',
  };
}
