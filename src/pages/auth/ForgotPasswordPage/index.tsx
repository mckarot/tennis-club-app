/**
 * Forgot Password Page
 *
 * Password reset request page with ForgotPasswordForm component.
 * Handles password reset email submission via useForgotPassword hook.
 * Displays success message after email is sent.
 *
 * Features:
 * - Auth layout wrapper
 * - ForgotPasswordForm component
 * - Success message display
 * - Back to login link
 * - Error boundary
 *
 * Route: /forgot-password
 *
 * @module @pages/auth/ForgotPasswordPage
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForgotPassword } from '../../../hooks/useForgotPassword';
import { ForgotPasswordForm } from '../../../components/auth/ForgotPasswordForm';

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { sendResetEmail, isSending, isSent, error, reset } = useForgotPassword();

  /**
   * Handle forgot password form submission
   */
  const handleResetPassword = React.useCallback(
    async (email: string) => {
      const result = await sendResetEmail(email);
      // Error is handled by useForgotPassword hook and passed to form
      if (!result.success) {
        // Error state is already set in the hook
      }
    },
    [sendResetEmail]
  );

  /**
   * Navigate to login page
   */
  const handleNavigateToLogin = React.useCallback(() => {
    navigate('/login', { replace: false });
  }, [navigate]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg bg-surface-container-lowest p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Mot de passe oublié
          </h1>
          <p className="mt-2 font-body text-base text-on-surface-variant">
            Réinitialisez votre mot de passe
          </p>
        </div>

        {/* Forgot Password Form */}
        <ForgotPasswordForm
          onSubmit={handleResetPassword}
          isLoading={isSending}
          isSent={isSent}
          error={error}
          onNavigateToLogin={handleNavigateToLogin}
        />
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
