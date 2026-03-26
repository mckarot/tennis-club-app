/**
 * Firebase Types
 *
 * Central type definitions for Firebase entities, authentication, and Firestore documents.
 * These types are used across the application for type-safe Firebase operations.
 *
 * @module @firebase/types
 */

import type { Timestamp } from 'firebase/firestore';

// ==========================================
// USER ENTITY TYPES
// ==========================================

/**
 * User role enumeration
 * Defines the three roles in the tennis club system
 */
export type UserRole = 'admin' | 'moniteur' | 'client';

/**
 * User status enumeration
 * Tracks user availability and activity state
 */
export type UserStatus = 'online' | 'away' | 'inactive';

/**
 * User entity interface
 * Represents a complete user document in Firestore
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status: UserStatus;
  avatar?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

/**
 * Input type for creating a new user
 * Used in registration forms
 */
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  acceptTerms?: boolean;
}

/**
 * Input type for user login
 * Used in login forms
 */
export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ==========================================
// AUTHENTICATION RESULT TYPES
// ==========================================

/**
 * Authentication result interface
 * Returned from login and registration operations
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: FirebaseAuthErrorCode;
}

/**
 * Registration result interface
 * Specific result type for user registration
 */
export interface RegistrationResult {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: FirebaseAuthErrorCode;
}

/**
 * Password reset result interface
 */
export interface PasswordResetResult {
  success: boolean;
  error?: string;
  errorCode?: FirebaseAuthErrorCode;
}

// ==========================================
// VALIDATION TYPES
// ==========================================

/**
 * Validation errors map
 * Field name to error message mapping
 */
export interface ValidationErrors {
  [field: string]: string | undefined;
}

/**
 * Password strength levels
 */
export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

/**
 * Password strength result interface
 * Contains detailed password validation feedback
 */
export interface PasswordStrengthResult {
  level: PasswordStrengthLevel;
  score: number; // 0-4
  meetsLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  label: string;
  color: string;
}

/**
 * Password requirements checklist
 */
export interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  specialChar: boolean;
}

// ==========================================
// FIREBASE ERROR CODES
// ==========================================

/**
 * Firebase authentication error codes
 * Comprehensive list of Firebase Auth error codes
 */
export enum FirebaseAuthErrorCode {
  // Invalid credentials
  INVALID_CREDENTIAL = 'auth/invalid-credential',
  INVALID_EMAIL = 'auth/invalid-email',
  USER_DISABLED = 'auth/user-disabled',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',

  // Registration errors
  EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  WEAK_PASSWORD = 'auth/weak-password',
  OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed',

  // Session errors
  EXPIRED_ACTION_CODE = 'auth/expired-action-code',
  INVALID_ACTION_CODE = 'auth/invalid-action-code',
  REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login',

  // Network errors
  NETWORK_REQUEST_FAILED = 'auth/network-request-failed',
  TOO_MANY_REQUESTS = 'auth/too-many-requests',

  // Generic errors
  INTERNAL_ERROR = 'auth/internal-error',
  UNKNOWN_ERROR = 'auth/unknown-error',
}

/**
 * Classified authentication error
 * Provides user-friendly error messages
 */
export interface ClassifiedAuthError {
  code: FirebaseAuthErrorCode | 'unknown';
  message: string;
  userMessage: string;
  isRetryable: boolean;
}

// ==========================================
// FIRESTORE DOCUMENT TYPES
// ==========================================

/**
 * Base document interface
 * All Firestore documents extend this
 */
export interface BaseDocument {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Document with ID
 * For documents retrieved from Firestore
 */
export interface DocumentWithId<T> {
  id: string;
  data: T;
}

// ==========================================
// FIREBASE CONFIG TYPES
// ==========================================

/**
 * Firebase configuration interface
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// ==========================================
// HELPER TYPES
// ==========================================

/**
 * Partial user update type
 * For updating user profiles
 */
export type UserUpdateInput = Partial<Omit<User, 'id' | 'createdAt' | 'role'>>;

/**
 * User profile input for forms
 */
export interface UserProfileInput {
  name?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
}

// ==========================================
// CLIENT PROFILE TYPES
// ==========================================

/**
 * Notification preferences for users
 * Controls email and SMS notification settings
 */
export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
}

/**
 * Client profile data
 * Extended user information for profile management
 */
export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  notifications: NotificationPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input for updating client profile
 */
export interface ClientProfileInput {
  name: string;
  phone?: string;
  avatar?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

/**
 * Input for changing password
 */
export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Result of profile save operation
 */
export interface ProfileSaveResult {
  success: boolean;
  error?: string;
}

/**
 * Result of password change operation
 */
export interface PasswordChangeResult {
  success: boolean;
  error?: string;
  errorCode?: FirebaseAuthErrorCode;
}

/**
 * Avatar upload result
 */
export interface AvatarUploadResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}
