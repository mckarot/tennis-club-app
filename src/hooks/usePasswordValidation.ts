/**
 * Password Validation Hook
 *
 * Provides real-time password strength validation and feedback.
 * Evaluates password against security requirements and provides
 * visual strength indicators.
 *
 * Features:
 * - Password strength scoring (0-4)
 * - Requirements checklist
 * - Strength label and color
 * - Real-time validation
 *
 * @module @hooks/usePasswordValidation
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { PasswordStrengthResult, PasswordRequirements } from '../firebase/types';

// ==========================================
// HOOK RETURN TYPE
// ==========================================

export interface UsePasswordValidationReturn {
  validatePassword: (password: string) => void;
  strength: PasswordStrengthResult;
  meetsRequirements: PasswordRequirements;
  strengthLabel: string;
  strengthColor: string;
  isValid: boolean;
  errors: string[];
}

// ==========================================
// CONSTANTS
// ==========================================

/**
 * Minimum password length
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Special characters regex
 */
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>[\]\\';/`~_+=|-]/;

/**
 * Uppercase regex
 */
const UPPERCASE_REGEX = /[A-Z]/;

/**
 * Lowercase regex
 */
const LOWERCASE_REGEX = /[a-z]/;

/**
 * Number regex
 */
const NUMBER_REGEX = /[0-9]/;

// ==========================================
// STRENGTH LABELS AND COLORS
// ==========================================

/**
 * Strength labels by level
 */
const STRENGTH_LABELS: Record<number, string> = {
  0: 'Very Weak',
  1: 'Weak',
  2: 'Medium',
  3: 'Strong',
  4: 'Very Strong',
};

/**
 * Strength colors by level (Tailwind color tokens)
 */
const STRENGTH_COLORS: Record<number, string> = {
  0: 'bg-error',
  1: 'bg-error',
  2: 'bg-tertiary',
  3: 'bg-primary',
  4: 'bg-primary',
};

/**
 * Strength color labels
 */
const STRENGTH_COLOR_LABELS: Record<number, string> = {
  0: 'error',
  1: 'error',
  2: 'tertiary',
  3: 'primary',
  4: 'primary',
};

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

/**
 * Calculate password strength score
 */
function calculateStrength(password: string): number {
  let score = 0;

  if (!password) return 0;

  // Length scoring
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 12) score++;

  // Character variety scoring
  if (UPPERCASE_REGEX.test(password)) score++;
  if (LOWERCASE_REGEX.test(password)) score++;
  if (NUMBER_REGEX.test(password)) score++;
  if (SPECIAL_CHAR_REGEX.test(password)) score++;

  // Normalize to 0-4 scale
  return Math.min(4, Math.floor(score / 1.5));
}

/**
 * Check if password meets all requirements
 */
function checkRequirements(password: string): PasswordRequirements {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    uppercase: UPPERCASE_REGEX.test(password),
    lowercase: LOWERCASE_REGEX.test(password),
    number: NUMBER_REGEX.test(password),
    specialChar: SPECIAL_CHAR_REGEX.test(password),
  };
}

/**
 * Get validation errors for password
 */
function getPasswordErrors(password: string): string[] {
  const errors: string[] = [];
  const requirements = checkRequirements(password);

  if (!password) {
    errors.push('Password is required');
    return errors;
  }

  if (!requirements.length) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (!requirements.uppercase) {
    errors.push('Password must contain at least 1 uppercase letter');
  }

  if (!requirements.lowercase) {
    errors.push('Password must contain at least 1 lowercase letter');
  }

  if (!requirements.number) {
    errors.push('Password must contain at least 1 number');
  }

  if (!requirements.specialChar) {
    errors.push('Password must contain at least 1 special character');
  }

  return errors;
}

// ==========================================
// HOOK IMPLEMENTATION
// ==========================================

export function usePasswordValidation(initialPassword?: string): UsePasswordValidationReturn {
  const [password, setPassword] = useState(initialPassword ?? '');
  const [strengthResult, setStrengthResult] = useState<PasswordStrengthResult>({
    level: 'weak',
    score: 0,
    meetsLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    label: 'Very Weak',
    color: 'error',
  });

  /**
   * Validate password and update strength result
   */
  const validatePassword = useCallback((newPassword: string) => {
    setPassword(newPassword);

    const score = calculateStrength(newPassword);
    const requirements = checkRequirements(newPassword);

    // Determine strength level
    let level: PasswordStrengthResult['level'] = 'weak';
    if (score >= 3) level = 'strong';
    else if (score >= 2) level = 'medium';

    const result: PasswordStrengthResult = {
      level,
      score,
      meetsLength: requirements.length,
      hasUppercase: requirements.uppercase,
      hasLowercase: requirements.lowercase,
      hasNumber: requirements.number,
      hasSpecialChar: requirements.specialChar,
      label: STRENGTH_LABELS[score],
      color: STRENGTH_COLOR_LABELS[score],
    };

    setStrengthResult(result);
  }, []);

  // Initialize validation on mount
  useEffect(() => {
    if (initialPassword) {
      validatePassword(initialPassword);
    }
  }, [initialPassword, validatePassword]);

  // Memoized computed values
  const meetsRequirements = useMemo(
    () => checkRequirements(password),
    [password]
  );

  const strengthLabel = useMemo(
    () => strengthResult.label,
    [strengthResult.label]
  );

  const strengthColor = useMemo(
    () => strengthResult.color,
    [strengthResult.color]
  );

  const isValid = useMemo(
    () => {
      const errors = getPasswordErrors(password);
      return errors.length === 0;
    },
    [password]
  );

  const errors = useMemo(
    () => getPasswordErrors(password),
    [password]
  );

  return {
    validatePassword,
    strength: strengthResult,
    meetsRequirements,
    strengthLabel,
    strengthColor,
    isValid,
    errors,
  };
}

export default usePasswordValidation;
