/**
 * Service Layer Types
 *
 * Type definitions for service layer operations, hooks return types,
 * and common service patterns.
 *
 * @module @types/service.types
 */

import type { Court, CourtInput } from './court.types';
import type { Reservation, ReservationInput, TimeSlot } from './reservation.types';
import type { MoniteurSlot, SlotInput } from './slot.types';
import type { User } from './user.types';
import type { Timestamp } from 'firebase/firestore';

// ==========================================
// SERVICE RESULT PATTERNS
// ==========================================

/**
 * Generic service result wrapper
 * Used for all service operations to ensure consistent error handling
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Result for create operations that return document ID
 */
export interface CreateResult {
  success: boolean;
  id?: string;
  error?: string;
}

// ==========================================
// AVAILABILITY TYPES
// ==========================================

/**
 * Availability check result
 */
export interface AvailabilityResult {
  isAvailable: boolean;
  conflictingReservations?: Reservation[];
  reason?: string;
}

/**
 * Time slot with availability information
 */
export interface TimeSlotWithAvailability extends TimeSlot {
  court_id?: string;
  courtName?: string;
}

// ==========================================
// HOOK RETURN TYPES
// ==========================================

/**
 * Return type for useCourts hook
 */
export interface UseCourtsReturn {
  courts: Court[];
  activeCourts: Court[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Return type for useReservations hook
 */
export interface UseReservationsReturn {
  reservations: Reservation[];
  isLoading: boolean;
  error: Error | null;
  createReservation: (input: CreateReservationInput) => Promise<CreateResult>;
  updateReservation: (id: string, updates: UpdateReservationInput) => Promise<ServiceResult<void>>;
  cancelReservation: (id: string) => Promise<ServiceResult<void>>;
  deleteReservation: (id: string) => Promise<ServiceResult<void>>;
}

/**
 * Return type for useAvailability hook
 */
export interface UseAvailabilityReturn {
  isLoading: boolean;
  error: Error | null;
  checkAvailability: (
    courtId: string,
    startTime: Date,
    endTime: Date
  ) => Promise<AvailabilityResult>;
  getAvailableSlots: (
    courtId: string,
    date: Date
  ) => Promise<TimeSlotWithAvailability[]>;
}

/**
 * Return type for useNavigation hook
 */
export interface UseNavigationReturn {
  navigate: (path: string, options?: { replace?: boolean; state?: unknown }) => void;
  location: {
    pathname: string;
    search: string;
    hash: string;
    state: unknown;
    key: string;
  };
  goBack: () => void;
  goForward: () => void;
}

/**
 * Return type for useRouteGuard hook
 */
export interface UseRouteGuardReturn {
  isAuthenticated: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  user: User | null;
  redirectTo: (path: string) => void;
}

// ==========================================
// RESERVATION INPUT TYPES
// ==========================================

/**
 * Input for creating a reservation
 * Extends ReservationInput with additional fields
 */
export interface CreateReservationInput extends Omit<ReservationInput, 'start_time' | 'end_time'> {
  court_id: string;
  user_id: string;
  moniteur_id?: string;
  start_time: Date;
  end_time: Date;
  title?: string;
  description?: string;
  notes?: string;
}

/**
 * Input for updating a reservation
 * Partial type for reservation updates
 */
export interface UpdateReservationInput {
  title?: string;
  description?: string;
  participants?: number;
  status?: Reservation['status'];
  type?: Reservation['type'];
  moniteur_id?: string;
  notes?: string;
}

// ==========================================
// COURT SERVICE TYPES
// ==========================================

/**
 * Court filters for queries
 */
export interface CourtFilters {
  isActive?: boolean;
  type?: 'Quick' | 'Terre';
  status?: 'active' | 'maintenance' | 'closed';
}

/**
 * Return type for court service operations
 */
export interface CourtServiceResult extends ServiceResult<Court | Court[]> {
  data?: Court | Court[];
}

// ==========================================
// SLOT SERVICE TYPES
// ==========================================

/**
 * Slot filters for queries
 */
export interface SlotFilters {
  moniteurId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: 'PRIVATE' | 'GROUP';
  status?: 'available' | 'booked' | 'cancelled';
}

/**
 * Return type for slot service operations
 */
export interface SlotServiceResult extends ServiceResult<MoniteurSlot | MoniteurSlot[]> {
  data?: MoniteurSlot | MoniteurSlot[];
}

// ==========================================
// USER SERVICE TYPES
// ==========================================

/**
 * User authentication result
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * User registration input
 */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'moniteur' | 'client';
  phone?: string;
}

/**
 * User login input
 */
export interface LoginInput {
  email: string;
  password: string;
}
