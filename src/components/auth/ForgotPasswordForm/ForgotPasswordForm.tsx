/**
 * Forgot Password Form Component
 *
 * Password reset request form with:
 * - Email input
 * - Submit button
 * - Success message (email sent)
 * - Back to login link
 * - Field errors display
 * - General error alert
 *
 * Design System:
 * - Inputs: border-b-2 border-surface-container-highest, bg-surface-container-lowest
 * - Focus: border-primary
 * - Error: border-error
 * - Button: bg-gradient-to-br from-primary to-primary-container
 * - Success message: bg-primary-container, text-on-primary-container
 * - Error alert: bg-error-container, text-on-error-container
 *
 * @module @components/auth/ForgotPasswordForm
 */

import React from 'react';
import { useAuthForm } from '../../../hooks/useAuthForm';
import { isValidEmail } from '../../../utils/validators';

// ==========================================
// COMPONENT PROPS
// ==========================================

export interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  isSent?: boolean;
  error?: string | null;
  onNavigateToLogin?: () => void;
}

// ==========================================
// FORM VALIDATOR
// ==========================================

function validateForgotPasswordForm(values: { email: string }) {
  const errors: Record<string, string | undefined> = {};

  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else {
    const emailValidation = isValidEmail(values.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors[0];
    }
  }

  return errors;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ForgotPasswordForm({
  onSubmit,
  isLoading = false,
  isSent = false,
  error: generalError,
  onNavigateToLogin,
}: ForgotPasswordFormProps) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useAuthForm<{
    email: string;
  }>({
    initialValues: {
      email: '',
    },
    validate: validateForgotPasswordForm,
    onSubmit: async (vals) => {
      try {
        await onSubmit(vals.email);
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Password reset failed' };
      }
    },
    validateOnBlur: true,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* General Error Alert */}
      {generalError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-error-container bg-error-container p-4"
        >
          <span className="material-symbols-outlined text-2xl text-error" aria-hidden="true">
            error
          </span>
          <p className="font-body text-sm text-on-error-container">{generalError}</p>
        </div>
      )}

      {/* Success Message */}
      {isSent && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-lg border border-primary-container bg-primary-container p-4"
        >
          <span className="material-symbols-outlined text-2xl text-primary" aria-hidden="true">
            check_circle
          </span>
          <div>
            <p className="font-body text-sm font-medium text-on-primary-container">
              Email sent successfully
            </p>
            <p className="mt-1 font-body text-xs text-on-primary-container/80">
              Check your inbox for password reset instructions.
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isSent && (
        <div className="rounded-lg bg-surface-container-high p-4">
          <p className="font-body text-sm text-on-surface-variant">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label
          htmlFor="forgot-email"
          className="block font-body text-sm font-medium text-on-surface"
        >
          Email
        </label>
        <input
          type="email"
          id="forgot-email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="email"
          required
          disabled={isSent}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'forgot-email-error' : undefined}
          className={`mt-1 w-full border-b-2 bg-surface-container-lowest px-4 py-3 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors rounded-t-lg disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.email ? 'border-error' : 'border-surface-container-highest'
          }`}
          placeholder="votre@email.com"
        />
        {errors.email && (
          <p id="forgot-email-error" className="mt-1 font-body text-sm text-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Submit Button */}
      {!isSent && (
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-4 font-body text-sm font-medium text-on-primary transition-all hover:from-primary/90 hover:to-primary-container/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={isLoading ? 'Sending email...' : 'Send reset email'}
        >
          {isLoading && (
            <span className="material-symbols-outlined animate-spin" aria-hidden="true">
              progress_activity
            </span>
          )}
          {isLoading ? 'Sending...' : 'Send Reset Email'}
        </button>
      )}

      {/* Back to Login Link */}
      <p className="text-center font-body text-sm text-on-surface-variant">
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="font-medium text-primary hover:text-primary/80 focus:outline-none focus:underline"
          aria-label="Back to login"
        >
          ← Back to login
        </button>
      </p>
    </form>
  );
}

export default ForgotPasswordForm;
