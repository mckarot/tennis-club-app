/**
 * PasswordChangeForm Component
 *
 * Password change form with validation and strength indicator.
 *
 * Features:
 * - Current password verification
 * - New password with strength indicator
 * - Password confirmation
 * - Validation (min 8 chars, uppercase, lowercase, number, special char)
 * - Success/error display
 * - Framer Motion animations
 * - ARIA labels for accessibility
 *
 * @module @pages/client/components/PasswordChangeForm
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PasswordChangeInput } from '../../../firebase/types';

interface PasswordChangeFormProps {
  /** Change password callback */
  onChangePassword: (input: PasswordChangeInput) => Promise<{
    success: boolean;
    error?: string;
  }>;
  /** Loading state */
  loading?: boolean;
}

// ==========================================
// PASSWORD STRENGTH
// ==========================================

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
}

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>[\]\\';/`~_+=|-]/.test(password),
  };

  let score = 0;
  if (requirements.length) score++;
  if (requirements.uppercase) score++;
  if (requirements.lowercase) score++;
  if (requirements.number) score++;
  if (requirements.specialChar) score++;

  const labels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const colors = ['bg-error', 'bg-error', 'bg-tertiary', 'bg-primary', 'bg-primary'];

  return {
    score,
    label: labels[score] || 'Very Weak',
    color: colors[score] || 'bg-error',
    requirements,
  };
}

// ==========================================
// COMPONENT
// ==========================================

export function PasswordChangeForm({
  onChangePassword,
  loading = false,
}: PasswordChangeFormProps) {
  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status state
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validation errors
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  /**
   * Calculate password strength
   */
  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(newPassword);
  }, [newPassword]);

  /**
   * Validate current password
   */
  const validateCurrentPassword = useCallback((password: string): string | null => {
    if (!password) {
      return 'Current password is required';
    }
    return null;
  }, []);

  /**
   * Validate new password
   */
  const validateNewPassword = useCallback((password: string): string | null => {
    if (!password) {
      return 'New password is required';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain an uppercase letter';
    }

    if (!/[a-z]/.test(password)) {
      return 'Password must contain a lowercase letter';
    }

    if (!/[0-9]/.test(password)) {
      return 'Password must contain a number';
    }

    if (!/[!@#$%^&*(),.?":{}|<>[\]\\';/`~_+=|-]/.test(password)) {
      return 'Password must contain a special character';
    }

    return null;
  }, []);

  /**
   * Validate confirm password
   */
  const validateConfirmPassword = useCallback((password: string, newPassword: string): string | null => {
    if (!password) {
      return 'Please confirm your password';
    }

    if (password !== newPassword) {
      return 'Passwords do not match';
    }

    return null;
  }, []);

  /**
   * Handle current password change
   */
  const handleCurrentPasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setCurrentPassword(value);
      setCurrentPasswordError(validateCurrentPassword(value));
    },
    [validateCurrentPassword]
  );

  /**
   * Handle new password change
   */
  const handleNewPasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setNewPassword(value);
      setNewPasswordError(validateNewPassword(value));
    },
    [validateNewPassword]
  );

  /**
   * Handle confirm password change
   */
  const handleConfirmPasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setConfirmPassword(value);
      setConfirmPasswordError(validateConfirmPassword(value, newPassword));
    },
    [newPassword, validateConfirmPassword]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);
      setSuccess(false);

      // Validate all fields
      const currentPasswordErr = validateCurrentPassword(currentPassword);
      const newPasswordErr = validateNewPassword(newPassword);
      const confirmPasswordErr = validateConfirmPassword(confirmPassword, newPassword);

      setCurrentPasswordError(currentPasswordErr);
      setNewPasswordError(newPasswordErr);
      setConfirmPasswordError(confirmPasswordErr);

      if (currentPasswordErr || newPasswordErr || confirmPasswordErr) {
        return;
      }

      // Change password
      setIsChanging(true);

      const result = await onChangePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setIsChanging(false);

      if (result.success) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to change password');
      }
    },
    [
      currentPassword,
      newPassword,
      confirmPassword,
      onChangePassword,
      validateCurrentPassword,
      validateNewPassword,
      validateConfirmPassword,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Current Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="current-password"
          className="block font-body text-sm font-medium text-on-surface"
        >
          Mot de passe actuel <span className="text-error">*</span>
        </label>
        <div className="relative">
          <input
            id="current-password"
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            disabled={isChanging || loading}
            required
            aria-required="true"
            aria-invalid={!!currentPasswordError}
            aria-describedby={currentPasswordError ? 'current-password-error' : undefined}
            className={`w-full rounded-lg bg-surface-container-lowest px-4 py-3 font-body text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
              currentPasswordError ? 'ring-2 ring-error' : ''
            }`}
            placeholder="Votre mot de passe actuel"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-on-surface"
            aria-label={showCurrentPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <span className="material-symbols-outlined text-sm">
              {showCurrentPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {currentPasswordError && (
          <p id="current-password-error" className="font-body text-sm text-error" role="alert">
            {currentPasswordError}
          </p>
        )}
      </div>

      {/* New Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="new-password"
          className="block font-body text-sm font-medium text-on-surface"
        >
          Nouveau mot de passe <span className="text-error">*</span>
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={handleNewPasswordChange}
            disabled={isChanging || loading}
            required
            aria-required="true"
            aria-invalid={!!newPasswordError}
            aria-describedby={newPasswordError ? 'new-password-error' : 'new-password-strength'}
            className={`w-full rounded-lg bg-surface-container-lowest px-4 py-3 font-body text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
              newPasswordError ? 'ring-2 ring-error' : ''
            }`}
            placeholder="Nouveau mot de passe"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-on-surface"
            aria-label={showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <span className="material-symbols-outlined text-sm">
              {showNewPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>

        {/* Password Strength Indicator */}
        {newPassword && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
            id="new-password-strength"
          >
            {/* Strength Bar */}
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index < passwordStrength.score ? passwordStrength.color : 'bg-surface-container-highest'
                  }`}
                />
              ))}
            </div>

            {/* Strength Label */}
            <p className="font-body text-xs text-on-surface/60">
              Force: <span className="font-medium">{passwordStrength.label}</span>
            </p>

            {/* Requirements Checklist */}
            <ul className="grid grid-cols-2 gap-1">
              <li
                className={`font-body text-xs ${
                  passwordStrength.requirements.length ? 'text-primary' : 'text-on-surface/40'
                }`}
              >
                <span className="material-symbols-outlined mr-1 inline text-xs">
                  {passwordStrength.requirements.length ? 'check_circle' : 'circle'}
                </span>
                8 caractères min
              </li>
              <li
                className={`font-body text-xs ${
                  passwordStrength.requirements.uppercase ? 'text-primary' : 'text-on-surface/40'
                }`}
              >
                <span className="material-symbols-outlined mr-1 inline text-xs">
                  {passwordStrength.requirements.uppercase ? 'check_circle' : 'circle'}
                </span>
                Majuscule
              </li>
              <li
                className={`font-body text-xs ${
                  passwordStrength.requirements.lowercase ? 'text-primary' : 'text-on-surface/40'
                }`}
              >
                <span className="material-symbols-outlined mr-1 inline text-xs">
                  {passwordStrength.requirements.lowercase ? 'check_circle' : 'circle'}
                </span>
                Minuscule
              </li>
              <li
                className={`font-body text-xs ${
                  passwordStrength.requirements.number ? 'text-primary' : 'text-on-surface/40'
                }`}
              >
                <span className="material-symbols-outlined mr-1 inline text-xs">
                  {passwordStrength.requirements.number ? 'check_circle' : 'circle'}
                </span>
                Chiffre
              </li>
              <li
                className={`font-body text-xs ${
                  passwordStrength.requirements.specialChar ? 'text-primary' : 'text-on-surface/40'
                }`}
              >
                <span className="material-symbols-outlined mr-1 inline text-xs">
                  {passwordStrength.requirements.specialChar ? 'check_circle' : 'circle'}
                </span>
                Caractère spécial
              </li>
            </ul>
          </motion.div>
        )}

        {newPasswordError && (
          <p id="new-password-error" className="font-body text-sm text-error" role="alert">
            {newPasswordError}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="confirm-password"
          className="block font-body text-sm font-medium text-on-surface"
        >
          Confirmer le mot de passe <span className="text-error">*</span>
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            disabled={isChanging || loading}
            required
            aria-required="true"
            aria-invalid={!!confirmPasswordError}
            aria-describedby={confirmPasswordError ? 'confirm-password-error' : undefined}
            className={`w-full rounded-lg bg-surface-container-lowest px-4 py-3 font-body text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
              confirmPasswordError ? 'ring-2 ring-error' : ''
            }`}
            placeholder="Confirmer le nouveau mot de passe"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-on-surface"
            aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <span className="material-symbols-outlined text-sm">
              {showConfirmPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {confirmPasswordError && (
          <p id="confirm-password-error" className="font-body text-sm text-error" role="alert">
            {confirmPasswordError}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isChanging || loading || !!currentPasswordError || !!newPasswordError || !!confirmPasswordError}
        className="w-full rounded-lg bg-primary px-6 py-3 font-body text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
        whileHover={{ scale: isChanging || loading ? 1 : 1.02 }}
        whileTap={{ scale: isChanging || loading ? 1 : 0.98 }}
        aria-label="Changer le mot de passe"
      >
        {isChanging ? (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            <span>Changement en cours...</span>
          </span>
        ) : (
          'Changer le mot de passe'
        )}
      </motion.button>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-primary-fixed/20 p-4 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="font-body text-sm font-medium text-primary">
              Mot de passe changé avec succès
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-error-container p-4 text-center"
            role="alert"
            aria-live="assertive"
          >
            <p className="font-body text-sm font-medium text-error">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export default PasswordChangeForm;
