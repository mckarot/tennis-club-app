/**
 * Register Page
 *
 * User registration page.
 *
 * @module @pages/auth/RegisterPage
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/userService';
import { isValidEmail, isValidPhone, validatePassword } from '../../utils/validators';

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailValidation = isValidEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors[0];
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && formData.phone.trim().length > 0) {
      const phoneValidation = isValidPhone(formData.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.errors[0];
      }
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(formData.email, formData.password, formData.name, 'client');

      if (result.success) {
        navigate('/client', { replace: true });
      } else {
        setErrors((prev) => ({ ...prev, general: result.error || 'Registration failed' }));
      }
    } catch (error) {
      console.error('[RegisterPage] Registration error:', error);
      setErrors((prev) => ({ ...prev, general: 'An unexpected error occurred' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg bg-surface-container p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-headline text-2xl font-bold text-on-surface">Créer un compte</h1>
          <p className="mt-2 font-body text-base text-on-surface-variant">
            Rejoignez le Tennis Club du François
          </p>
        </div>

        {/* Error Alert */}
        {errors.general && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-lg border border-error-container bg-error-container p-4"
          >
            <span className="material-symbols-outlined text-2xl text-error">error</span>
            <p className="font-body text-sm text-on-error-container">{errors.general}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block font-body text-sm font-medium text-on-surface">
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`mt-1 w-full rounded-lg border bg-surface px-4 py-2 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 ${
                errors.name
                  ? 'border-error focus:border-error focus:ring-error'
                  : 'border-outline focus:border-primary focus:ring-primary'
              }`}
              placeholder="Jean Dupont"
            />
            {errors.name && (
              <p id="name-error" className="mt-1 font-body text-sm text-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block font-body text-sm font-medium text-on-surface">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`mt-1 w-full rounded-lg border bg-surface px-4 py-2 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 ${
                errors.email
                  ? 'border-error focus:border-error focus:ring-error'
                  : 'border-outline focus:border-primary focus:ring-primary'
              }`}
              placeholder="votre@email.com"
            />
            {errors.email && (
              <p id="email-error" className="mt-1 font-body text-sm text-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block font-body text-sm font-medium text-on-surface">
              Téléphone <span className="text-on-surface-variant">(optionnel)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={`mt-1 w-full rounded-lg border bg-surface px-4 py-2 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 ${
                errors.phone
                  ? 'border-error focus:border-error focus:ring-error'
                  : 'border-outline focus:border-primary focus:ring-primary'
              }`}
              placeholder="0696 00 00 00"
            />
            {errors.phone && (
              <p id="phone-error" className="mt-1 font-body text-sm text-error" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block font-body text-sm font-medium text-on-surface">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              className={`mt-1 w-full rounded-lg border bg-surface px-4 py-2 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 ${
                errors.password
                  ? 'border-error focus:border-error focus:ring-error'
                  : 'border-outline focus:border-primary focus:ring-primary'
              }`}
              placeholder="••••••••"
            />
            {errors.password ? (
              <p id="password-error" className="mt-1 font-body text-sm text-error" role="alert">
                {errors.password}
              </p>
            ) : (
              <p id="password-hint" className="mt-1 font-body text-xs text-on-surface-variant">
                Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block font-body text-sm font-medium text-on-surface">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              className={`mt-1 w-full rounded-lg border bg-surface px-4 py-2 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 ${
                errors.confirmPassword
                  ? 'border-error focus:border-error focus:ring-error'
                  : 'border-outline focus:border-primary focus:ring-primary'
              }`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="mt-1 font-body text-sm text-error" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                aria-invalid={!!errors.acceptTerms}
                aria-describedby={errors.acceptTerms ? 'terms-error' : undefined}
                className="mt-1 h-4 w-4 rounded border-outline text-primary focus:ring-primary"
              />
              <span className="font-body text-sm text-on-surface-variant">
                J'accepte les{' '}
                <a href="/terms" className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                  conditions générales d'utilisation
                </a>{' '}
                et la{' '}
                <a href="/privacy" className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                  politique de confidentialité
                </a>
              </span>
            </label>
            {errors.acceptTerms && (
              <p id="terms-error" className="mt-1 font-body text-sm text-error" role="alert">
                {errors.acceptTerms}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-body text-sm font-medium text-on-primary transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
            {isLoading ? 'Création du compte...' : "S'inscrire"}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center font-body text-sm text-on-surface-variant">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
