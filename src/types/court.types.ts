/**
 * Court type definitions
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Court type enumeration (surface category)
 */
export type CourtType = 'Quick' | 'Terre';

/**
 * Surface type enumeration (detailed description)
 */
export type SurfaceType = 'Hard' | 'Clay' | 'Grass' | 'Synthetic';

/**
 * Court status enumeration
 */
export type CourtStatus = 'active' | 'maintenance' | 'closed';

/**
 * Court interface
 */
export interface Court {
  id: string;
  number: number;
  name: string;
  type: CourtType;
  surface: SurfaceType;
  status: CourtStatus;
  is_active: boolean;
  image?: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Court input for forms
 */
export interface CourtInput {
  number: number;
  name: string;
  type: CourtType;
  surface: SurfaceType;
  description?: string;
}

/**
 * Court availability status
 */
export type CourtAvailability = 'available' | 'occupied' | 'reserved';

/**
 * Court with availability information
 */
export interface CourtWithAvailability extends Court {
  availability?: CourtAvailability;
  nextAvailable?: string;
}
