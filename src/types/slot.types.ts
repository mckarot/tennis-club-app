/**
 * Moniteur slot type definitions
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Slot type enumeration
 */
export type SlotType = 'PRIVATE' | 'GROUP';

/**
 * Slot status enumeration
 */
export type SlotStatus = 'available' | 'booked' | 'cancelled';

/**
 * Moniteur availability slot interface
 */
export interface MoniteurSlot {
  id?: string;
  moniteur_id: string;
  date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  type: SlotType;
  court_id?: string;
  status: SlotStatus;
  max_participants?: number;
  current_participants?: number;
  description?: string;
  created_at: Timestamp;
  updated_at?: Timestamp;
}

/**
 * Slot input for forms
 */
export interface SlotInput {
  date: string;
  start_time: string;
  end_time: string;
  type: SlotType;
  court_id?: string;
  max_participants?: number;
  description?: string;
}

/**
 * Slot filters
 */
export interface SlotFilters {
  moniteurId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: SlotType;
  status?: SlotStatus;
}
