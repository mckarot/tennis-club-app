/**
 * Forgot Password Hook
 *
 * Handles password reset email functionality.
 * Provides state management for sending reset emails
 * and tracking the reset flow.
 *
 * Features:
 * - Send password reset email
 * - Loading state during send
 * - Success confirmation
 * - Error handling with classification
 * - Reset and clear functions
 *
 * @module @hooks/useForgotPassword
 */

import { useState, useCallback } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getAuthInstance } from '../config/firebase.config';
import type { FirebaseAuthErrorCode, ClassifiedAuthError } from '../firebase/types';

// ==========================================
// HOOK RETURN TYPE
// ==========================================

export interface UseForgotPasswordReturn {
  sendResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  isSending: boolean;
  isSent: boolean;
  error: string | null;
  errorCode: FirebaseAuthErrorCode | null;
  reset: () => void;
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
    [FirebaseAuthErrorCode.INVALID_EMAIL]: {
      userMessage: 'Invalid email format',
      isRetryable: true,
    },
    [FirebaseAuthErrorCode.USER_NOT_FOUND]: {
      userMessage: 'No account found with this email',
      isRetryable: false,
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

// ==========================================
// HOOK IMPLEMENTATION
// ==========================================

export function useForgotPassword(): UseForgotPasswordReturn {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<FirebaseAuthErrorCode | null>(null);

  const auth = getAuthInstance();

  /**
   * Send password reset email
   */
  const sendResetEmail = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      setIsSending(true);
      setError(null);
      setErrorCode(null);
      setIsSent(false);

      try {
        await sendPasswordResetEmail(auth, email);
        setIsSent(true);
        setIsSending(false);
        return { success: true };
      } catch (err) {
        console.error('[useForgotPassword] Password reset error:', err);
        const classified = classifyAuthError(err);
        const errorMessage = classified.userMessage || 'Password reset failed';
        setError(errorMessage);
        setErrorCode(classified.code === 'unknown' ? null : classified.code);
        setIsSending(false);
        return { success: false, error: errorMessage };
      }
    },
    [auth]
  );

  /**
   * Reset hook state to initial values
   */
  const reset = useCallback(() => {
    setIsSending(false);
    setIsSent(false);
    setError(null);
    setErrorCode(null);
  }, []);

  /**
   * Clear error state only
   */
  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  return {
    sendResetEmail,
    isSending,
    isSent,
    error,
    errorCode,
    reset,
    clearError,
  };
}

export default useForgotPassword;
