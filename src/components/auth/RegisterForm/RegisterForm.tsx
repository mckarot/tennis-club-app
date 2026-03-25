/**
 * Register Form Component
 *
 * User registration form with:
 * - Name input (required)
 * - Email input (required)
 * - Phone input (optional, Martinique format)
 * - Password input
 * - ConfirmPassword input
 * - Password strength meter
 * - Terms checkbox
 * - Submit button
 * - Login link
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
 * @module @components/auth/RegisterForm
 */

import { useEffect } from 'react';
import { useAuthForm } from '../../../hooks/useAuthForm';
import { usePasswordValidation } from '../../../hooks/usePasswordValidation';
import PasswordStrengthMeter from '../../ui/PasswordStrengthMeter/PasswordStrengthMeter';
import type { CreateUserInput } from '../../../firebase/types';
import { isValidEmail, isValidPhone } from '../../../utils/validators';

// ==========================================
// COMPONENT PROPS
// ==========================================

export interface RegisterFormProps {
  onSubmit: (input: CreateUserInput) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onNavigateToLogin?: () => void;
}

// ==========================================
// FORM VALIDATOR
// ==========================================

function validateRegisterForm(values: CreateUserInput & { confirmPassword: string }) {
  const errors: Record<string, string | undefined> = {};

  // Name validation
  if (!values.name || values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else {
    const emailValidation = isValidEmail(values.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors[0];
    }
  }

  // Phone validation (optional but if provided, must be valid)
  if (values.phone && values.phone.trim().length > 0) {
    const phoneValidation = isValidPhone(values.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.errors[0];
    }
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else {
    if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(values.password)) {
      errors.password = 'Password must contain at least 1 uppercase letter';
    }
    if (!/[a-z]/.test(values.password)) {
      errors.password = 'Password must contain at least 1 lowercase letter';
    }
    if (!/[0-9]/.test(values.password)) {
      errors.password = 'Password must contain at least 1 number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(values.password)) {
      errors.password = 'Password must contain at least 1 special character';
    }
  }

  // Confirm password
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Terms acceptance
  if (!values.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions';
  }

  return errors;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function RegisterForm({
  onSubmit,
  isLoading = false,
  error: generalError,
  onNavigateToLogin,
}: RegisterFormProps) {
  const passwordValidation = usePasswordValidation();

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue } =
    useAuthForm<CreateUserInput & { confirmPassword: string }>({
      initialValues: {
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
        role: 'client',
      },
      validate: validateRegisterForm,
      onSubmit: async (vals) => {
        try {
          await onSubmit({
            name: vals.name,
            email: vals.email,
            password: vals.password,
            phone: vals.phone,
            role: vals.role,
            acceptTerms: vals.acceptTerms,
          });
        } catch (err) {
          return { error: err instanceof Error ? err.message : 'Registration failed' };
        }
      },
      validateOnBlur: true,
    });

  // Update password validation when password changes
  useEffect(() => {
    passwordValidation.validatePassword(values.password);
  }, [values.password, passwordValidation]);

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

      {/* Name Field */}
      <div>
        <label htmlFor="register-name" className="block font-body text-sm font-medium text-on-surface">
          Nom complet
        </label>
        <input
          type="text"
          id="register-name"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="name"
          required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'register-name-error' : undefined}
          className={`mt-1 w-full border-b-2 bg-surface-container-lowest px-4 py-3 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors rounded-t-lg ${
            errors.name ? 'border-error' : 'border-surface-container-highest'
          }`}
          placeholder="Jean Dupont"
        />
        {errors.name && (
          <p id="register-name-error" className="mt-1 font-body text-sm text-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="register-email" className="block font-body text-sm font-medium text-on-surface">
          Email
        </label>
        <input
          type="email"
          id="register-email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="email"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          className={`mt-1 w-full border-b-2 bg-surface-container-lowest px-4 py-3 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors rounded-t-lg ${
            errors.email ? 'border-error' : 'border-surface-container-highest'
          }`}
          placeholder="votre@email.com"
        />
        {errors.email && (
          <p id="register-email-error" className="mt-1 font-body text-sm text-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="register-phone" className="block font-body text-sm font-medium text-on-surface">
          Téléphone <span className="text-on-surface-variant">(optionnel)</span>
        </label>
        <input
          type="tel"
          id="register-phone"
          name="phone"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'register-phone-error' : undefined}
          className={`mt-1 w-full border-b-2 bg-surface-container-lowest px-4 py-3 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors rounded-t-lg ${
            errors.phone ? 'border-error' : 'border-surface-container-highest'
          }`}
          placeholder="0696 00 00 00"
        />
        {errors.phone && (
          <p id="register-phone-error" className="mt-1 font-body text-sm text-error" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="register-password" className="block font-body text-sm font-medium text-on-surface">
          Mot de passe
        </label>
        <input
          type="password"
          id="register-password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="new-password"
          required
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'register-password-error' : 'register-password-hint'}
          className={`mt-1 w-full border-b-2 bg-surface-container-lowest px-4 py-3 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors rounded-t-lg ${
            errors.password ? 'border-error' : 'border-surface-container-highest'
          }`}
          placeholder="••••••••"
        />
        {errors.password ? (
          <p id="register-password-error" className="mt-1 font-body text-sm text-error" role="alert">
            {errors.password}
          </p>
        ) : (
          <p id="register-password-hint" className="mt-1 font-body text-xs text-on-surface-variant">
            Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
          </p>
        )}

        {/* Password Strength Meter */}
        {values.password && (
          <div className="mt-3">
            <PasswordStrengthMeter
              strength={passwordValidation.strength}
              meetsRequirements={passwordValidation.meetsRequirements}
            />
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="register-confirmPassword"
          className="block font-body text-sm font-medium text-on-surface"
        >
          Confirmer le mot de passe
        </label>
        <input
          type="password"
          id="register-confirmPassword"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="new-password"
          required
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'register-confirmPassword-error' : undefined}
          className={`mt-1 w-full border-b-2 bg-surface-container-lowest px-4 py-3 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors rounded-t-lg ${
            errors.confirmPassword ? 'border-error' : 'border-surface-container-highest'
          }`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p
            id="register-confirmPassword-error"
            className="mt-1 font-body text-sm text-error"
            role="alert"
          >
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Terms Checkbox */}
      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={values.acceptTerms}
            onChange={handleChange}
            aria-invalid={!!errors.acceptTerms}
            aria-describedby={errors.acceptTerms ? 'register-terms-error' : undefined}
            className="mt-1 h-4 w-4 rounded border-outline text-primary focus:ring-primary"
          />
          <span className="font-body text-sm text-on-surface-variant">
            J'accepte les{' '}
            <a
              href="/terms"
              className="text-primary hover:text-primary/80 focus:outline-none focus:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              conditions générales d'utilisation
            </a>{' '}
            et la{' '}
            <a
              href="/privacy"
              className="text-primary hover:text-primary/80 focus:outline-none focus:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              politique de confidentialité
            </a>
          </span>
        </label>
        {errors.acceptTerms && (
          <p id="register-terms-error" className="mt-1 font-body text-sm text-error" role="alert">
            {errors.acceptTerms}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-4 font-body text-sm font-medium text-on-primary transition-all hover:from-primary/90 hover:to-primary-container/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={isLoading ? 'Création du compte en cours' : "S'inscrire"}
      >
        {isLoading && (
          <span className="material-symbols-outlined animate-spin" aria-hidden="true">
            progress_activity
          </span>
        )}
        {isLoading ? 'Création du compte...' : "S'inscrire"}
      </button>

      {/* Login Link */}
      <p className="text-center font-body text-sm text-on-surface-variant">
        Déjà un compte ?{' '}
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="font-medium text-primary hover:text-primary/80 focus:outline-none focus:underline"
          aria-label="Se connecter"
        >
          Se connecter
        </button>
      </p>
    </form>
  );
}

export default RegisterForm;
