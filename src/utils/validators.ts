/**
 * Validation Utilities
 *
 * Validation functions for forms, inputs, and data integrity.
 * All validators return typed validation results.
 *
 * @module @utils/validators
 */

import type { ReservationInput } from '../types/reservation.types';
import type { SlotInput } from '../types/slot.types';
import dayjs from 'dayjs';

// ==========================================
// VALIDATION RESULT TYPES
// ==========================================

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ==========================================
// EMAIL VALIDATION
// ==========================================

/**
 * Email regex pattern (RFC 5322 compliant)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns ValidationResult with validation status and errors
 *
 * @example
 * const result = isValidEmail('user@example.com');
 * if (!result.isValid) {
 *   console.error(result.errors);
 * }
 */
export function isValidEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length > 254) {
    errors.push('Email must be less than 254 characters');
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.push('Invalid email format');
  }

  const parts = trimmedEmail.split('@');
  if (parts.length === 2) {
    const domain = parts[1];
    if (!domain.includes('.')) {
      errors.push('Email domain must contain a dot');
    }
    if (domain.startsWith('.') || domain.endsWith('.')) {
      errors.push('Email domain cannot start or end with a dot');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==========================================
// PHONE VALIDATION
// ==========================================

/**
 * Phone regex pattern (international format)
 * Accepts formats: +1234567890, 123-456-7890, (123) 456-7890, etc.
 */
const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;

/**
 * Validate phone number format
 *
 * @param phone - Phone number to validate
 * @returns ValidationResult with validation status and errors
 *
 * @example
 * const result = isValidPhone('+596 696 12 34 56');
 * if (!result.isValid) {
 *   console.error(result.errors);
 * }
 */
export function isValidPhone(phone: string): ValidationResult {
  const errors: string[] = [];

  if (!phone || phone.trim().length === 0) {
    errors.push('Phone number is required');
    return { isValid: false, errors };
  }

  const cleanedPhone = phone.replace(/[\s\-\.\(\)]/g, '');

  if (cleanedPhone.length < 10) {
    errors.push('Phone number must be at least 10 digits');
  }

  if (cleanedPhone.length > 15) {
    errors.push('Phone number must be at most 15 digits');
  }

  if (!PHONE_REGEX.test(phone)) {
    errors.push('Invalid phone number format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==========================================
// RESERVATION VALIDATION
// ==========================================

/**
 * Minimum reservation duration in minutes
 */
const MIN_RESERVATION_DURATION = 30;

/**
 * Maximum reservation duration in minutes (4 hours)
 */
const MAX_RESERVATION_DURATION = 240;

/**
 * Maximum advance booking in days (30 days)
 */
const MAX_ADVANCE_BOOKING_DAYS = 30;

/**
 * Validate reservation input
 *
 * @param input - Reservation input to validate
 * @returns ValidationResult with validation status and errors
 *
 * @example
 * const result = validateReservation({
 *   court_id: 'court123',
 *   start_time: new Date(),
 *   end_time: new Date(Date.now() + 3600000),
 *   type: 'location_libre'
 * });
 */
export function validateReservation(input: ReservationInput): ValidationResult {
  const errors: string[] = [];

  // Court ID validation
  if (!input.court_id || input.court_id.trim().length === 0) {
    errors.push('Court selection is required');
  }

  // Start time validation
  if (!input.start_time) {
    errors.push('Start time is required');
  } else {
    const now = dayjs();
    const startTime = dayjs(input.start_time);

    if (startTime.isBefore(now, 'minute')) {
      errors.push('Start time cannot be in the past');
    }

    if (startTime.isAfter(now.add(MAX_ADVANCE_BOOKING_DAYS, 'day'))) {
      errors.push(`Reservations cannot be made more than ${MAX_ADVANCE_BOOKING_DAYS} days in advance`);
    }
  }

  // End time validation
  if (!input.end_time) {
    errors.push('End time is required');
  } else if (input.start_time) {
    const startTime = dayjs(input.start_time);
    const endTime = dayjs(input.end_time);

    if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
      errors.push('End time must be after start time');
    }

    const duration = endTime.diff(startTime, 'minute');

    if (duration < MIN_RESERVATION_DURATION) {
      errors.push(`Minimum reservation duration is ${MIN_RESERVATION_DURATION} minutes`);
    }

    if (duration > MAX_RESERVATION_DURATION) {
      errors.push(`Maximum reservation duration is ${MAX_RESERVATION_DURATION} minutes (${MAX_RESERVATION_DURATION / 60} hours)`);
    }
  }

  // Type validation
  const validTypes = [
    'location_libre',
    'cours_collectif',
    'cours_private',
    'individual',
    'doubles',
    'training',
    'tournament',
    'maintenance',
  ];

  if (input.type && !validTypes.includes(input.type)) {
    errors.push('Invalid reservation type');
  }

  // Participants validation
  if (input.participants !== undefined) {
    if (input.participants < 1) {
      errors.push('At least 1 participant is required');
    }
    if (input.participants > 20) {
      errors.push('Maximum 20 participants allowed');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==========================================
// SLOT VALIDATION
// ==========================================

/**
 * Time format regex (HH:MM)
 */
const TIME_FORMAT_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Date format regex (YYYY-MM-DD)
 */
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate slot input
 *
 * @param input - Slot input to validate
 * @returns ValidationResult with validation status and errors
 *
 * @example
 * const result = validateSlot({
 *   date: '2024-03-24',
 *   start_time: '09:00',
 *   end_time: '10:00',
 *   type: 'PRIVATE'
 * });
 */
export function validateSlot(input: SlotInput): ValidationResult {
  const errors: string[] = [];

  // Date validation
  if (!input.date || input.date.trim().length === 0) {
    errors.push('Date is required');
  } else if (!DATE_FORMAT_REGEX.test(input.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  } else {
    const slotDate = dayjs(input.date);
    const today = dayjs().startOf('day');

    if (slotDate.isBefore(today)) {
      errors.push('Date cannot be in the past');
    }

    if (slotDate.isAfter(today.add(MAX_ADVANCE_BOOKING_DAYS, 'day'))) {
      errors.push(`Slots cannot be created more than ${MAX_ADVANCE_BOOKING_DAYS} days in advance`);
    }
  }

  // Start time validation
  if (!input.start_time || input.start_time.trim().length === 0) {
    errors.push('Start time is required');
  } else if (!TIME_FORMAT_REGEX.test(input.start_time)) {
    errors.push('Start time must be in HH:MM format');
  }

  // End time validation
  if (!input.end_time || input.end_time.trim().length === 0) {
    errors.push('End time is required');
  } else if (!TIME_FORMAT_REGEX.test(input.end_time)) {
    errors.push('End time must be in HH:MM format');
  } else if (input.start_time && TIME_FORMAT_REGEX.test(input.start_time)) {
    const [startHours, startMinutes] = input.start_time.split(':').map(Number);
    const [endHours, endMinutes] = input.end_time.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    if (endTotalMinutes <= startTotalMinutes) {
      errors.push('End time must be after start time');
    }

    const duration = endTotalMinutes - startTotalMinutes;
    if (duration < MIN_RESERVATION_DURATION) {
      errors.push(`Minimum slot duration is ${MIN_RESERVATION_DURATION} minutes`);
    }
  }

  // Type validation
  const validTypes = ['PRIVATE', 'GROUP'];

  if (input.type && !validTypes.includes(input.type)) {
    errors.push('Invalid slot type');
  }

  // Max participants validation (for GROUP slots)
  if (input.type === 'GROUP') {
    if (input.max_participants !== undefined) {
      if (input.max_participants < 2) {
        errors.push('Group slots must have at least 2 participants');
      }
      if (input.max_participants > 10) {
        errors.push('Maximum 10 participants for group slots');
      }
    } else {
      errors.push('Max participants is required for group slots');
    }
  }

  // Court ID validation (optional but if provided, must be valid)
  if (input.court_id !== undefined && input.court_id.trim().length === 0) {
    errors.push('Court ID cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==========================================
// GENERIC VALIDATORS
// ==========================================

/**
 * Validate required string field
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @param minLength - Minimum length (default: 1)
 * @param maxLength - Maximum length (optional)
 * @returns ValidationResult
 */
export function validateRequiredString(
  value: string,
  fieldName: string,
  minLength: number = 1,
  maxLength?: number
): ValidationResult {
  const errors: string[] = [];

  if (!value || value.trim().length === 0) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }

  if (value.trim().length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters`);
  }

  if (maxLength && value.trim().length > maxLength) {
    errors.push(`${fieldName} must be at most ${maxLength} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate number range
 *
 * @param value - Number to validate
 * @param fieldName - Name of the field for error message
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns ValidationResult
 */
export function validateNumberRange(
  value: number,
  fieldName: string,
  min: number,
  max: number
): ValidationResult {
  const errors: string[] = [];

  if (isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
    return { isValid: false, errors };
  }

  if (value < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }

  if (value > max) {
    errors.push(`${fieldName} must be at most ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password strength
 *
 * Requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 *
 * @param password - Password to validate
 * @returns ValidationResult
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least 1 special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
