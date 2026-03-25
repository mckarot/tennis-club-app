/**
 * Reservation type definitions
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Reservation type enumeration
 */
export type ReservationType =
  | 'location_libre'
  | 'cours_collectif'
  | 'cours_private'
  | 'individual'
  | 'doubles'
  | 'training'
  | 'tournament'
  | 'maintenance';

/**
 * Reservation status enumeration
 */
export type ReservationStatus =
  | 'confirmed'
  | 'pending'
  | 'pending_payment'
  | 'cancelled'
  | 'completed';

/**
 * Reservation interface
 */
export interface Reservation {
  id?: string;
  court_id: string;
  user_id: string;
  moniteur_id?: string;
  start_time: Timestamp;
  end_time: Timestamp;
  type: ReservationType;
  status: ReservationStatus;
  title?: string;
  description?: string;
  participants?: number;
  is_paid?: boolean;
  created_at: Timestamp;
  updated_at?: Timestamp;
}

/**
 * Reservation input for booking forms
 */
export interface ReservationInput {
  court_id: string;
  start_time: Date;
  end_time: Date;
  type: ReservationType;
  participants?: number;
  notes?: string;
}

/**
 * Reservation filters
 */
export interface ReservationFilters {
  courtId?: string;
  userId?: string;
  moniteurId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ReservationStatus;
  type?: ReservationType;
}

/**
 * Time slot for availability
 */
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  court_id?: string;
}
