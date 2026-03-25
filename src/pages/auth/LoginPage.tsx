/**
 * Login Page
 *
 * User authentication page.
 *
 * @module @pages/auth/LoginPage
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInUser } from '../../services/userService';
import { isValidEmail } from '../../utils/validators';

export function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate email
    const emailValidation = isValidEmail(formData.email);
    if (!emailValidation.isValid) {
      setErrors((prev) => ({ ...prev, email: emailValidation.errors[0] }));
      return;
    }

    // Validate password
    if (!formData.password || formData.password.length < 6) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return;
    }

    setIsLoading(true);

    try {
      const result = await signInUser(formData.email, formData.password);

      if (result.success && result.user) {
        // Redirect based on role
        const roleRoutes: Record<string, string> = {
          admin: '/admin',
          moniteur: '/moniteur',
          client: '/client',
        };
        navigate(roleRoutes[result.user.role] || '/client', { replace: true });
      } else {
        setErrors((prev) => ({ ...prev, general: result.error || 'Login failed' }));
      }
    } catch (error) {
      console.error('[LoginPage] Login error:', error);
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
          <h1 className="font-headline text-2xl font-bold text-on-surface">Tennis Club du François</h1>
          <p className="mt-2 font-body text-base text-on-surface-variant">Connectez-vous à votre compte</p>
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
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
              autoComplete="current-password"
              required
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`mt-1 w-full rounded-lg border bg-surface px-4 py-2 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 ${
                errors.password
                  ? 'border-error focus:border-error focus:ring-error'
                  : 'border-outline focus:border-primary focus:ring-primary'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p id="password-error" className="mt-1 font-body text-sm text-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 rounded border-outline text-primary focus:ring-primary"
              />
              <span className="font-body text-sm text-on-surface-variant">Se souvenir de moi</span>
            </label>
            <Link to="/forgot-password" className="font-body text-sm text-primary hover:text-primary/80">
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-body text-sm font-medium text-on-primary transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center font-body text-sm text-on-surface-variant">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary/80">
            S'inscrire
          </Link>
        </p>

        {/* Demo Credentials (Development Only) */}
        {import.meta.env.DEV && (
          <div className="mt-8 rounded-lg bg-surface-container-high p-4">
            <p className="font-body text-xs font-medium text-on-surface">Comptes de démo (Dev only):</p>
            <ul className="mt-2 space-y-1 font-body text-xs text-on-surface-variant">
              <li>
                <strong>Admin:</strong> admin@tennis.mq / Admin123!
              </li>
              <li>
                <strong>Moniteur:</strong> jean.philippe@tennis.mq / Moniteur123!
              </li>
              <li>
                <strong>Client:</strong> jean.dupont@email.mq / Client123!
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
