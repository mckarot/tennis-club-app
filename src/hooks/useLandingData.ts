/**
 * useLandingData Hook
 *
 * React hook for fetching landing page data with real-time updates.
 * Provides courts with availability status and loading/error states.
 *
 * @module @hooks/useLandingData
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Court } from '../types/court.types';
import type { Reservation } from '../types/reservation.types';
import { subscribeToAllCourts } from '../services/courtService';
import { subscribeToReservationsByDateRange } from '../services/reservationService';
import { enhanceCourtsWithAvailability, getCurrentTimeInMartinique } from '../utils/courtAvailability';
import type { LandingCourt } from '../utils/courtAvailability';
import dayjs from 'dayjs';

/**
 * Return type for useLandingData hook
 */
export interface UseLandingDataReturn {
  /** Courts with availability information */
  courts: LandingCourt[];
  /** Raw courts data */
  rawCourts: Court[];
  /** All reservations */
  reservations: Reservation[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh function */
  refresh: () => Promise<void>;
}

/**
 * Get date range for reservations (today + next 7 days)
 */
function getReservationDateRange(): { startDate: Date; endDate: Date } {
  const now = getCurrentTimeInMartinique();
  const startDate = dayjs(now).startOf('day').toDate();
  const endDate = dayjs(now).add(7, 'day').endOf('day').toDate();
  return { startDate, endDate };
}

/**
 * Hook for fetching landing page data with real-time updates
 *
 * @example
 * const { courts, isLoading, error } = useLandingData();
 *
 * @returns Object with courts, loading state, error, and refresh function
 */
export function useLandingData(): UseLandingDataReturn {
  const [rawCourts, setRawCourts] = useState<Court[]>([]);
  const [courts, setCourts] = useState<LandingCourt[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Refs for latest data to avoid stale closures in callbacks
  const rawCourtsRef = useRef<Court[]>([]);
  const reservationsRef = useRef<Reservation[]>([]);

  /**
   * Refresh data manually
   */
  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getReservationDateRange();

      // Fetch courts
      const courtsData = await new Promise<Court[]>((resolve, reject) => {
        try {
          const unsubscribe = subscribeToAllCourts(
            (fetchedCourts) => {
              resolve(fetchedCourts);
              unsubscribe();
            },
            (err) => {
              unsubscribe();
              reject(err);
            }
          );
        } catch (err) {
          reject(err);
        }
      });

      setRawCourts(courtsData);

      // Fetch reservations
      const reservationsData = await new Promise<Reservation[]>((resolve, reject) => {
        try {
          const unsubscribe = subscribeToReservationsByDateRange(
            undefined,
            startDate,
            endDate,
            (fetchedReservations) => {
              resolve(fetchedReservations);
              unsubscribe();
            },
            (err) => reject(err)
          );
        } catch (err) {
          reject(err);
        }
      });

      setReservations(reservationsData);

      // Enhance courts with availability
      const enhancedCourts = enhanceCourtsWithAvailability(courtsData, reservationsData);
      setCourts(enhancedCourts);
    } catch (err) {
      console.error('[useLandingData] Refresh error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch landing data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initial load and real-time subscription setup
   */
  useEffect(() => {
    let courtsUnsubscribe: (() => void) | undefined;
    let reservationsUnsubscribe: (() => void) | undefined;
    let isMounted = true;

    const initialize = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const { startDate, endDate } = getReservationDateRange();

        // Subscribe to courts
        courtsUnsubscribe = subscribeToAllCourts(
          (fetchedCourts) => {
            if (!isMounted) return;
            
            setRawCourts(fetchedCourts);
            rawCourtsRef.current = fetchedCourts;

            // Update enhanced courts when courts change
            setCourts((prevCourts) =>
              enhanceCourtsWithAvailability(fetchedCourts, reservationsRef.current)
            );
          },
          (err) => {
            if (!isMounted) return;
            
            console.error('[useLandingData] Courts subscription error:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch courts'));
            setIsLoading(false);
          }
        );

        // Subscribe to reservations
        reservationsUnsubscribe = subscribeToReservationsByDateRange(
          undefined,
          startDate,
          endDate,
          (fetchedReservations) => {
            if (!isMounted) return;
            
            setReservations(fetchedReservations);
            reservationsRef.current = fetchedReservations;

            // Update enhanced courts when reservations change
            setCourts((prevCourts) =>
              enhanceCourtsWithAvailability(rawCourtsRef.current, fetchedReservations)
            );
          },
          (err) => {
            if (!isMounted) return;
            
            console.error('[useLandingData] Reservations subscription error:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch reservations'));
            setIsLoading(false);
          }
        );

        // Initial data loaded
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[useLandingData] Initialization error:', err);
          setError(err instanceof Error ? err : new Error('Failed to initialize landing data'));
          setIsLoading(false);
        }
      }
    };

    initialize();

    // Cleanup subscriptions on unmount
    return () => {
      isMounted = false;
      if (courtsUnsubscribe) {
        courtsUnsubscribe();
      }
      if (reservationsUnsubscribe) {
        reservationsUnsubscribe();
      }
    };
  }, []); // Empty dependency array - run once on mount

  return {
    courts,
    rawCourts,
    reservations,
    isLoading,
    error,
    refresh,
  };
}

export default useLandingData;
