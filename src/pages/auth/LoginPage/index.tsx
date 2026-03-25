/**
 * Login Page
 *
 * User authentication page with LoginForm component.
 * Handles login submission via useAuth hook.
 * Redirects to role-based dashboard after successful login.
 *
 * Features:
 * - Auth layout wrapper
 * - LoginForm component
 * - Handle submission via useAuth
 * - Redirect to role-based dashboard
 * - Error boundary
 *
 * Route: /login
 *
 * @module @pages/auth/LoginPage
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { LoginForm } from '../../../components/auth/LoginForm';

// ==========================================
// ROLE-BASED ROUTES
// ==========================================

const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin',
  moniteur: '/moniteur',
  client: '/client',
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  /**
   * Handle login form submission
   */
  const handleLogin = React.useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const result = await login(email, password, rememberMe);

      if (result.success && result.user) {
        // Redirect based on role
        const route = ROLE_ROUTES[result.user.role] || '/client';
        navigate(route, { replace: true });
      }
      // Error is handled by useAuth hook and passed to form
    },
    [login, navigate]
  );

  /**
   * Navigate to register page
   */
  const handleNavigateToRegister = React.useCallback(() => {
    navigate('/register', { replace: false });
  }, [navigate]);

  /**
   * Navigate to forgot password page
   */
  const handleNavigateToForgotPassword = React.useCallback(() => {
    navigate('/forgot-password', { replace: false });
  }, [navigate]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg bg-surface-container-lowest p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Tennis Club du François
          </h1>
          <p className="mt-2 font-body text-base text-on-surface-variant">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Login Form */}
        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error}
          onNavigateToRegister={handleNavigateToRegister}
          onNavigateToForgotPassword={handleNavigateToForgotPassword}
        />

        {/* Demo Credentials (Development Only) */}
        {import.meta.env.DEV && (
          <div className="mt-8 rounded-lg bg-surface-container-high p-4">
            <p className="font-body text-xs font-medium text-on-surface">
              Comptes de démo (Dev only):
            </p>
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
