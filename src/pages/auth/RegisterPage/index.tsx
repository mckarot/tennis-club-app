/**
 * Register Page
 *
 * User registration page with RegisterForm component.
 * Handles registration submission via useAuth hook.
 * Redirects to client dashboard after successful registration.
 *
 * Features:
 * - Auth layout wrapper
 * - RegisterForm component
 * - Password strength state
 * - Redirect to client dashboard
 * - Error boundary
 *
 * Route: /register
 *
 * @module @pages/auth/RegisterPage
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { RegisterForm } from '../../../components/auth/RegisterForm';
import type { CreateUserInput } from '../../../firebase/types';

// ==========================================
// MAIN COMPONENT
// ==========================================

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();

  /**
   * Handle registration form submission
   */
  const handleRegister = React.useCallback(
    async (input: CreateUserInput) => {
      const result = await register(input);

      if (result.success && result.user) {
        // Redirect to client dashboard
        navigate('/client', { replace: true });
      }
      // Error is handled by useAuth hook and passed to form
    },
    [register, navigate]
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
            Créer un compte
          </h1>
          <p className="mt-2 font-body text-base text-on-surface-variant">
            Rejoignez le Tennis Club du François
          </p>
        </div>

        {/* Register Form */}
        <RegisterForm
          onSubmit={handleRegister}
          isLoading={isLoading}
          error={error}
          onNavigateToLogin={handleNavigateToLogin}
        />
      </div>
    </div>
  );
}

export default RegisterPage;
