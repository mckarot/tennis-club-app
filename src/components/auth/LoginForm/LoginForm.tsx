/**
 * Login Form Component
 *
 * User authentication form with:
 * - Email input (bottom-border style)
 * - Password input
 * - Remember Me checkbox
 * - Submit button
 * - Forgot password link
 * - Register link
 * - Field errors display
 * - General error alert
 *
 * Design System:
 * - Inputs: border-b-2 border-surface-container-highest, bg-surface-container-lowest
 * - Focus: border-primary
 * - Error: border-error
 * - Button: bg-gradient-to-br from-primary to-primary-container
 * - Error alert: bg-error-container, text-on-error-container
 *
 * @module @components/auth/LoginForm
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthForm } from '../../../hooks/useAuthForm';
import type { LoginInput } from '../../../firebase/types';
import { isValidEmail } from '../../../utils/validators';

// ==========================================
// COMPONENT PROPS
// ==========================================

export interface LoginFormProps {
  onSubmit: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

// ==========================================
// FORM VALIDATOR
// ==========================================

function validateLoginForm(values: LoginInput) {
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

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function LoginForm({
  onSubmit,
  isLoading = false,
  error: generalError,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}: LoginFormProps) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldError } =
    useAuthForm<LoginInput>({
      initialValues: {
        email: '',
        password: '',
        rememberMe: false,
      },
      validate: validateLoginForm,
      onSubmit: async (vals) => {
        try {
          await onSubmit(vals.email, vals.password, vals.rememberMe ?? false);
        } catch (err) {
          return { error: err instanceof Error ? err.message : 'Login failed' };
        }
      },
      validateOnBlur: true,
    });

  // Clear field error when user starts typing
  useEffect(() => {
    if (touched.email && errors.email) {
      // Error will be cleared by handleChange
    }
  }, [values.email, touched.email, errors.email]);

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

      {/* Email Field */}
      <div>
        <label
          htmlFor="login-email"
          className="block font-body text-sm font-medium text-on-surface"
        >
          Email
        </label>
        <input
          type="email"
          id="login-email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="email"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          className={`mt-1 w-full border-b-2 bg-surface-container-lowest px-4 py-3 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors rounded-t-lg ${
            errors.email ? 'border-error' : 'border-surface-container-highest'
          }`}
          placeholder="votre@email.com"
        />
        {errors.email && (
          <p id="login-email-error" className="mt-1 font-body text-sm text-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="login-password"
          className="block font-body text-sm font-medium text-on-surface"
        >
          Mot de passe
        </label>
        <input
          type="password"
          id="login-password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="current-password"
          required
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'login-password-error' : undefined}
          className={`mt-1 w-full border-b-2 bg-surface-container-lowest px-4 py-3 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors rounded-t-lg ${
            errors.password ? 'border-error' : 'border-surface-container-highest'
          }`}
          placeholder="••••••••"
        />
        {errors.password && (
          <p id="login-password-error" className="mt-1 font-body text-sm text-error" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="rememberMe"
            checked={values.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-outline text-primary focus:ring-primary"
            aria-label="Se souvenir de moi"
          />
          <span className="font-body text-sm text-on-surface-variant">Se souvenir de moi</span>
        </label>
        <button
          type="button"
          onClick={onNavigateToForgotPassword}
          className="font-body text-sm text-primary hover:text-primary/80 focus:outline-none focus:underline"
          aria-label="Mot de passe oublié"
        >
          Mot de passe oublié ?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-4 font-body text-sm font-medium text-on-primary transition-all hover:from-primary/90 hover:to-primary-container/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={isLoading ? 'Connexion en cours' : 'Se connecter'}
      >
        {isLoading && (
          <span className="material-symbols-outlined animate-spin" aria-hidden="true">
            progress_activity
          </span>
        )}
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>

      {/* Register Link */}
      <p className="text-center font-body text-sm text-on-surface-variant">
        Pas encore de compte ?{' '}
        <button
          type="button"
          onClick={onNavigateToRegister}
          className="font-medium text-primary hover:text-primary/80 focus:outline-none focus:underline"
          aria-label="S'inscrire"
        >
          S'inscrire
        </button>
      </p>
    </form>
  );
}

export default LoginForm;
