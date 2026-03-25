/**
 * User type definitions
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * User role enumeration
 */
export type UserRole = 'admin' | 'moniteur' | 'client';

/**
 * User status enumeration
 */
export type UserStatus = 'online' | 'away' | 'inactive';

/**
 * User profile interface
 */
export interface User {
  uid: string;
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
 * User profile input for forms
 */
export interface UserInput {
  name: string;
  email: string;
  role?: UserRole;
  phone?: string;
  password?: string;
}

/**
 * User profile update input
 */
export interface UserUpdateInput {
  name?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
}
