/**
 * useTodaysReservations Hook
 *
 * Hook for fetching today's reservations for the sidebar.
 * Filters reservations for today and sorts by start_time.
 *
 * Features:
 * - onSnapshot pour réservations du jour
 * - Filtre : start_time >= today 00:00 et <= today 23:59
 * - Tri : orderBy('start_time', 'asc')
 * - unsubscribe cleanup
 *
 * @module @hooks/useTodaysReservations
 */

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { getDbInstance } from '../config/firebase.config';
import type { Reservation } from '../types/reservation.types';

/**
 * Hook return type
 */
export interface UseTodaysReservationsReturn {
  reservations: Reservation[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Get today's date bounds (00:00 to 23:59)
 */
function getTodayBounds(): { start: Timestamp; end: Timestamp } {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return {
    start: Timestamp.fromDate(startOfDay),
    end: Timestamp.fromDate(endOfDay),
  };
}

export function useTodaysReservations(): UseTodaysReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const { start, end } = getTodayBounds();

    // Query: Get today's reservations sorted by start_time
    const q = query(
      collection(getDbInstance(), 'reservations'),
      where('start_time', '>=', start),
      where('start_time', '<=', end),
      orderBy('start_time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          const reservation: Reservation = {
            id: doc.id,
            court_id: docData.court_id,
            user_id: docData.user_id,
            moniteur_id: docData.moniteur_id,
            start_time: docData.start_time,
            end_time: docData.end_time,
            type: docData.type,
            status: docData.status,
            title: docData.title,
            description: docData.description,
            participants: docData.participants,
            is_paid: docData.is_paid,
            created_at: docData.created_at,
            updated_at: docData.updated_at,
          };
          return reservation;
        });
        setReservations(data);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useTodaysReservations] Error:', err);
        setError(err instanceof Error ? err : new Error('Firestore error'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    reservations,
    isLoading,
    error,
  };
}

export default useTodaysReservations;
