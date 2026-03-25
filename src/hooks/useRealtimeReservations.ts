/**
 * useRealtimeReservations Hook
 *
 * Real-time subscription hook for reservations with automatic cleanup.
 * Provides real-time updates for user reservations or court reservations.
 *
 * @module @hooks/useRealtimeReservations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
  type Timestamp,
} from 'firebase/firestore';
import { getDbInstance } from '../config/firebase.config';
import type { Reservation, ReservationStatus, ReservationType } from '../types/reservation.types';

export interface UseRealtimeReservationsOptions {
  userId?: string;
  courtId?: string;
  status?: ReservationStatus;
  type?: ReservationType;
  startDate?: Date;
  endDate?: Date;
}

export interface UseRealtimeReservationsReturn {
  reservations: Reservation[];
  isLoading: boolean;
  error: Error | null;
  hasData: boolean;
}

/**
 * Build query constraints based on filters
 */
function buildQueryConstraints(options: UseRealtimeReservationsOptions) {
  const constraints: Array<ReturnType<typeof where> | ReturnType<typeof orderBy>> = [];

  if (options.userId) {
    constraints.push(where('user_id', '==', options.userId));
  }

  if (options.courtId) {
    constraints.push(where('court_id', '==', options.courtId));
  }

  if (options.status) {
    constraints.push(where('status', '==', options.status));
  }

  if (options.type) {
    constraints.push(where('type', '==', options.type));
  }

  if (options.startDate) {
    const startTimestamp = Timestamp.fromDate(options.startDate);
    constraints.push(where('start_time', '>=', startTimestamp));
  }

  if (options.endDate) {
    const endTimestamp = Timestamp.fromDate(options.endDate);
    constraints.push(where('start_time', '<=', endTimestamp));
  }

  constraints.push(orderBy('start_time', 'asc'));

  return constraints;
}

/**
 * Map Firestore document to Reservation type with validation
 */
function mapToReservation(docId: string, data: Record<string, unknown>): Reservation {
  if (typeof data.court_id !== 'string') {
    throw new Error(`Invalid court_id: expected string, got ${typeof data.court_id}`);
  }

  if (typeof data.user_id !== 'string') {
    throw new Error(`Invalid user_id: expected string, got ${typeof data.user_id}`);
  }

  if (!(data.start_time instanceof Object) || !('toDate' in data.start_time)) {
    throw new Error(`Invalid start_time: expected Timestamp`);
  }

  if (!(data.end_time instanceof Object) || !('toDate' in data.end_time)) {
    throw new Error(`Invalid end_time: expected Timestamp`);
  }

  if (typeof data.type !== 'string') {
    throw new Error(`Invalid type: expected string, got ${typeof data.type}`);
  }

  if (typeof data.status !== 'string') {
    throw new Error(`Invalid status: expected string, got ${typeof data.status}`);
  }

  if (!(data.created_at instanceof Object) || !('toDate' in data.created_at)) {
    throw new Error(`Invalid created_at: expected Timestamp`);
  }

  return {
    id: docId,
    court_id: data.court_id,
    user_id: data.user_id,
    moniteur_id: data.moniteur_id as string | undefined,
    start_time: data.start_time as Timestamp,
    end_time: data.end_time as Timestamp,
    type: data.type as ReservationType,
    status: data.status as ReservationStatus,
    title: data.title as string | undefined,
    description: data.description as string | undefined,
    participants: data.participants as number | undefined,
    is_paid: data.is_paid as boolean | undefined,
    created_at: data.created_at as Timestamp,
    updated_at: data.updated_at as Timestamp | undefined,
  };
}

/**
 * Real-time reservations subscription hook
 *
 * Manages onSnapshot subscription directly in useEffect for proper cleanup.
 * Subscription is created and cleaned up on dependency changes.
 */
export function useRealtimeReservations(
  options: UseRealtimeReservationsOptions = {}
): UseRealtimeReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const constraints = buildQueryConstraints(options);
    const q = query(collection(getDbInstance(), 'reservations'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reservationData: Reservation[] = snapshot.docs.map((doc) =>
          mapToReservation(doc.id, doc.data() as Record<string, unknown>)
        );
        setReservations(reservationData);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useRealtimeReservations] Error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch reservations'));
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [
    options.userId,
    options.courtId,
    options.status,
    options.type,
    options.startDate,
    options.endDate,
  ]);

  return {
    reservations,
    isLoading,
    error,
    hasData: reservations.length > 0,
  };
}

export default useRealtimeReservations;
