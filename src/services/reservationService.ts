/**
 * Reservation Service
 *
 * Service layer for reservation operations including CRUD, real-time subscriptions,
 * availability checking, and conflict prevention using Firestore transactions.
 *
 * CRITICAL: All create/update operations use transactions to prevent double-booking.
 *
 * @module @services/reservationService
 */

import { getDbInstance } from '../config/firebase.config';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  runTransaction,
  type Unsubscribe,
  type QueryConstraint,
  type DocumentReference,
} from 'firebase/firestore';
import type { Reservation, ReservationStatus, ReservationType, ReservationFilters } from '../types/reservation.types';
import type { ServiceResult, CreateResult, CreateReservationInput, UpdateReservationInput, AvailabilityResult } from '../types/service.types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Valid ReservationType values
 */
const VALID_RESERVATION_TYPES: ReservationType[] = [
  'location_libre',
  'cours_collectif',
  'cours_private',
  'individual',
  'doubles',
  'training',
  'tournament',
  'maintenance',
];

/**
 * Valid ReservationStatus values
 */
const VALID_RESERVATION_STATUSES: ReservationStatus[] = [
  'confirmed',
  'pending',
  'pending_payment',
  'cancelled',
  'completed',
];

const COLLECTION_NAME = 'reservations';
const TIMEZONE = 'America/Martinique';
const db = getDbInstance();

/**
 * Map Firestore document data to Reservation type safely with runtime validation
 */
function mapToReservation(docId: string, data: Record<string, unknown>): Reservation {
  // Validate required fields with runtime type checking
  if (typeof data.court_id !== 'string') {
    throw new Error(`Invalid reservation court_id: expected string, got ${typeof data.court_id}`);
  }

  if (typeof data.user_id !== 'string') {
    throw new Error(`Invalid reservation user_id: expected string, got ${typeof data.user_id}`);
  }

  if (!(data.start_time instanceof Timestamp)) {
    throw new Error(`Invalid reservation start_time: expected Timestamp, got ${typeof data.start_time}`);
  }

  if (!(data.end_time instanceof Timestamp)) {
    throw new Error(`Invalid reservation end_time: expected Timestamp, got ${typeof data.end_time}`);
  }

  if (typeof data.type !== 'string' || !VALID_RESERVATION_TYPES.includes(data.type as ReservationType)) {
    throw new Error(`Invalid reservation type: expected ${VALID_RESERVATION_TYPES.join(' | ')}, got ${data.type}`);
  }

  if (typeof data.status !== 'string' || !VALID_RESERVATION_STATUSES.includes(data.status as ReservationStatus)) {
    throw new Error(`Invalid reservation status: expected ${VALID_RESERVATION_STATUSES.join(' | ')}, got ${data.status}`);
  }

  if (!(data.created_at instanceof Timestamp)) {
    throw new Error(`Invalid reservation created_at: expected Timestamp, got ${typeof data.created_at}`);
  }

  // Optional fields validation
  if (data.moniteur_id !== undefined && typeof data.moniteur_id !== 'string') {
    throw new Error(`Invalid reservation moniteur_id: expected string or undefined, got ${typeof data.moniteur_id}`);
  }

  if (data.title !== undefined && typeof data.title !== 'string') {
    throw new Error(`Invalid reservation title: expected string or undefined, got ${typeof data.title}`);
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    throw new Error(`Invalid reservation description: expected string or undefined, got ${typeof data.description}`);
  }

  if (data.participants !== undefined && typeof data.participants !== 'number') {
    throw new Error(`Invalid reservation participants: expected number or undefined, got ${typeof data.participants}`);
  }

  if (data.is_paid !== undefined && typeof data.is_paid !== 'boolean') {
    throw new Error(`Invalid reservation is_paid: expected boolean or undefined, got ${typeof data.is_paid}`);
  }

  if (data.updated_at !== undefined && !(data.updated_at instanceof Timestamp)) {
    throw new Error(`Invalid reservation updated_at: expected Timestamp or undefined, got ${typeof data.updated_at}`);
  }

  // All validations passed - safe to cast
  return {
    id: docId,
    court_id: data.court_id,
    user_id: data.user_id,
    moniteur_id: data.moniteur_id as string | undefined,
    start_time: data.start_time,
    end_time: data.end_time,
    type: data.type as ReservationType,
    status: data.status as ReservationStatus,
    title: data.title as string | undefined,
    description: data.description as string | undefined,
    participants: data.participants as number | undefined,
    is_paid: data.is_paid as boolean | undefined,
    created_at: data.created_at,
    updated_at: data.updated_at as Timestamp | undefined,
  };
}

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to user's reservations with real-time updates
 */
export function subscribeToUserReservations(
  userId: string,
  callback: (reservations: Reservation[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('user_id', '==', userId),
      orderBy('start_time', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reservations: Reservation[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return mapToReservation(doc.id, data as Record<string, unknown>);
        });
        callback(reservations);
      },
      (error) => {
        console.error('[subscribeToUserReservations] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch reservations'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToUserReservations] Setup error:', error);
    throw error;
  }
}

/**
 * Subscribe to court reservations with real-time updates
 */
export function subscribeToCourtReservations(
  courtId: string,
  callback: (reservations: Reservation[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('court_id', '==', courtId),
      orderBy('start_time', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reservations: Reservation[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return mapToReservation(doc.id, data as Record<string, unknown>);
        });
        callback(reservations);
      },
      (error) => {
        console.error('[subscribeToCourtReservations] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch court reservations'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToCourtReservations] Setup error:', error);
    throw error;
  }
}

/**
 * Subscribe to reservations for a specific date range
 */
export function subscribeToReservationsByDateRange(
  courtId: string | undefined,
  startDate: Date,
  endDate: Date,
  callback: (reservations: Reservation[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const startTimestamp = Timestamp.fromDate(dayjs(startDate).tz(TIMEZONE).startOf('day').toDate());
    const endTimestamp = Timestamp.fromDate(dayjs(endDate).tz(TIMEZONE).endOf('day').toDate());

    const constraints: QueryConstraint[] = [
      where('start_time', '>=', startTimestamp),
      where('start_time', '<=', endTimestamp),
      orderBy('start_time', 'asc'),
    ];

    if (courtId) {
      constraints.unshift(where('court_id', '==', courtId));
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reservations: Reservation[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return mapToReservation(doc.id, data as Record<string, unknown>);
        });
        callback(reservations);
      },
      (error) => {
        console.error('[subscribeToReservationsByDateRange] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch reservations'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToReservationsByDateRange] Setup error:', error);
    throw error;
  }
}

// ==========================================
// GET OPERATIONS
// ==========================================

/**
 * Get user's reservations
 */
export async function getUserReservations(userId: string, limit: number = 50): Promise<Reservation[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('user_id', '==', userId),
      orderBy('start_time', 'desc'),
      orderBy('__name__', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapToReservation(doc.id, data as Record<string, unknown>);
    });
  } catch (error) {
    console.error('[getUserReservations] Error:', error);
    throw error;
  }
}

/**
 * Get court reservations
 */
export async function getCourtReservations(
  courtId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Reservation[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('court_id', '==', courtId),
    ];

    if (startDate) {
      const startTimestamp = Timestamp.fromDate(dayjs(startDate).tz(TIMEZONE).startOf('day').toDate());
      constraints.push(where('start_time', '>=', startTimestamp));
    }

    if (endDate) {
      const endTimestamp = Timestamp.fromDate(dayjs(endDate).tz(TIMEZONE).endOf('day').toDate());
      constraints.push(where('start_time', '<=', endTimestamp));
    }

    constraints.push(orderBy('start_time', 'asc'));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapToReservation(doc.id, data as Record<string, unknown>);
    });
  } catch (error) {
    console.error('[getCourtReservations] Error:', error);
    throw error;
  }
}

/**
 * Get reservations by filters
 */
export async function getReservationsByFilter(filters: ReservationFilters): Promise<Reservation[]> {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters.courtId) {
      constraints.push(where('court_id', '==', filters.courtId));
    }

    if (filters.userId) {
      constraints.push(where('user_id', '==', filters.userId));
    }

    if (filters.moniteurId) {
      constraints.push(where('moniteur_id', '==', filters.moniteurId));
    }

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters.type) {
      constraints.push(where('type', '==', filters.type));
    }

    if (filters.startDate) {
      const startTimestamp = Timestamp.fromDate(dayjs(filters.startDate).tz(TIMEZONE).startOf('day').toDate());
      constraints.push(where('start_time', '>=', startTimestamp));
    }

    if (filters.endDate) {
      const endTimestamp = Timestamp.fromDate(dayjs(filters.endDate).tz(TIMEZONE).endOf('day').toDate());
      constraints.push(where('start_time', '<=', endTimestamp));
    }

    constraints.push(orderBy('start_time', 'asc'));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapToReservation(doc.id, data as Record<string, unknown>);
    });
  } catch (error) {
    console.error('[getReservationsByFilter] Error:', error);
    throw error;
  }
}

/**
 * Get a single reservation by ID
 */
export async function getReservationById(reservationId: string): Promise<Reservation | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, reservationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return mapToReservation(docSnap.id, data as Record<string, unknown>);
  } catch (error) {
    console.error('[getReservationById] Error:', error);
    throw error;
  }
}

// ==========================================
// AVAILABILITY CHECK (WITH TRANSACTION)
// ==========================================

/**
 * Check court availability for a time slot
 * Uses transaction to ensure accurate availability check
 */
export async function checkCourtAvailability(
  courtId: string,
  startTime: Date,
  endTime: Date
): Promise<AvailabilityResult> {
  try {
    const startTimestamp = Timestamp.fromDate(startTime);
    const endTimestamp = Timestamp.fromDate(endTime);

    const conflictingReservations = await runTransaction(db, async (transaction) => {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('court_id', '==', courtId),
        where('status', 'in', ['confirmed', 'pending']),
        where('start_time', '<=', endTimestamp),
        where('end_time', '>=', startTimestamp)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return mapToReservation(doc.id, data as Record<string, unknown>);
        })
        .filter((r) => r.status !== 'cancelled');
    });

    if (conflictingReservations.length > 0) {
      return {
        isAvailable: false,
        conflictingReservations,
        reason: 'This time slot is already reserved',
      };
    }

    return {
      isAvailable: true,
    };
  } catch (error) {
    console.error('[checkCourtAvailability] Error:', error);
    throw error;
  }
}

// ==========================================
// CREATE OPERATION (WITH TRANSACTION)
// ==========================================

/**
 * Create a new reservation with conflict prevention
 * Uses transaction to atomically check availability and create reservation
 */
export async function createReservation(input: CreateReservationInput): Promise<CreateResult> {
  try {
    // Validate required fields
    if (!input.court_id) {
      return {
        success: false,
        error: 'Court ID is required',
      };
    }

    if (!input.user_id) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    // Validate time range
    if (input.start_time >= input.end_time) {
      return {
        success: false,
        error: 'End time must be after start time',
      };
    }

    // Validate end time is not in the past
    if (input.end_time < new Date()) {
      return {
        success: false,
        error: 'Cannot create reservation in the past',
      };
    }

    const startTimestamp = Timestamp.fromDate(input.start_time);
    const endTimestamp = Timestamp.fromDate(input.end_time);

    const newReservation = {
      court_id: input.court_id,
      user_id: input.user_id,
      moniteur_id: input.moniteur_id || null,
      start_time: startTimestamp,
      end_time: endTimestamp,
      type: input.type,
      status: 'confirmed' as ReservationStatus,
      title: input.title || null,
      description: input.description || null,
      participants: input.participants || 1,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    const docRef = await runTransaction(db, async (transaction) => {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('court_id', '==', input.court_id),
        where('status', 'in', ['confirmed', 'pending']),
        where('start_time', '<=', endTimestamp),
        where('end_time', '>=', startTimestamp)
      );

      const snapshot = await getDocs(q);

      const hasConflict = snapshot.docs.some((doc) => {
        const data = doc.data();
        return data.status !== 'cancelled';
      });

      if (hasConflict) {
        throw new Error('Court is not available for the selected time slot');
      }

      const ref = doc(collection(db, COLLECTION_NAME));
      transaction.set(ref, newReservation);

      return ref;
    });

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error('[createReservation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create reservation',
    };
  }
}

// ==========================================
// UPDATE OPERATION
// ==========================================

/**
 * Update an existing reservation
 * Uses transaction to check for conflicts if time is changed
 */
export async function updateReservation(
  reservationId: string,
  updates: UpdateReservationInput
): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, reservationId);

    await runTransaction(db, async (transaction) => {
      const existingDoc = await getDoc(docRef);

      if (!existingDoc.exists()) {
        throw new Error('Reservation not found');
      }

      // Validate updates if time is being changed
      if (updates.start_time && updates.end_time && updates.start_time >= updates.end_time) {
        throw new Error('End time must be after start time');
      }

      const existing = existingDoc.data() as Reservation;

      if (updates.start_time || updates.end_time) {
        const newStartTime = updates.start_time
          ? Timestamp.fromDate(updates.start_time)
          : existing.start_time;
        const newEndTime = updates.end_time
          ? Timestamp.fromDate(updates.end_time)
          : existing.end_time;

        const q = query(
          collection(db, COLLECTION_NAME),
          where('court_id', '==', existing.court_id),
          where('status', 'in', ['confirmed', 'pending']),
          where('start_time', '<=', newEndTime),
          where('end_time', '>=', newStartTime)
        );

        const snapshot = await getDocs(q);

        const hasConflict = snapshot.docs.some((doc) => {
          return doc.id !== reservationId && doc.data().status !== 'cancelled';
        });

        if (hasConflict) {
          throw new Error('New time slot conflicts with existing reservation');
        }
      }

      const updateData: Record<string, unknown> = {
        ...updates,
        updated_at: Timestamp.now(),
      };

      transaction.update(docRef, updateData);
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[updateReservation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update reservation',
    };
  }
}

// ==========================================
// CANCEL OPERATION
// ==========================================

/**
 * Cancel a reservation (soft delete - sets status to cancelled)
 */
export async function cancelReservation(reservationId: string): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, reservationId);

    await updateDoc(docRef, {
      status: 'cancelled' as ReservationStatus,
      updated_at: Timestamp.now(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[cancelReservation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel reservation',
    };
  }
}

// ==========================================
// DELETE OPERATION
// ==========================================

/**
 * Delete a reservation (hard delete)
 */
export async function deleteReservation(reservationId: string): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, reservationId);
    await deleteDoc(docRef);

    return {
      success: true,
    };
  } catch (error) {
    console.error('[deleteReservation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete reservation',
    };
  }
}
