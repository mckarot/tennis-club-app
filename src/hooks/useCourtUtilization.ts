/**
 * useCourtUtilization Hook
 *
 * Real-time court utilization data for the admin dashboard chart.
 * Provides hourly utilization percentages for 12 time slots (06:00-21:00).
 *
 * Features:
 * - Real-time data with onSnapshot
 * - Selected date state management
 * - Try/catch on all Firestore operations
 * - Explicit TypeScript types (no any)
 *
 * @module @hooks/useCourtUtilization
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  Timestamp,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { getDbInstance } from '../config/firebase.config';
import type { ReservationStatus } from '../types/reservation.types';

/**
 * Court utilization data for a single time slot
 */
export interface CourtUtilizationSlot {
  time: string; // e.g., "06:00", "08:00"
  utilization: number; // 0-100 percentage
  bookings: number; // number of active bookings
  level: 'low' | 'high' | 'peak'; // for color coding
}

/**
 * Hook return type
 */
export interface UseCourtUtilizationReturn {
  data: CourtUtilizationSlot[];
  selectedDate: Date;
  isLoading: boolean;
  error: Error | null;
  setSelectedDate: (date: Date) => void;
  refreshData: () => Promise<void>;
}

/**
 * Time slots configuration (12 slots from 06:00 to 20:00, 2-hour intervals)
 */
const TIME_SLOTS = [
  { start: 6, end: 8, label: '06:00' },
  { start: 8, end: 10, label: '08:00' },
  { start: 10, end: 12, label: '10:00' },
  { start: 12, end: 14, label: '12:00' },
  { start: 14, end: 16, label: '14:00' },
  { start: 16, end: 18, label: '16:00' },
  { start: 18, end: 20, label: '18:00' },
  { start: 20, end: 22, label: '20:00' },
];

/**
 * Total number of courts
 */
const TOTAL_COURTS = 6;

/**
 * Get start and end of a specific date
 */
function getDateRange(date: Date): { start: Timestamp; end: Timestamp } {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  return {
    start: Timestamp.fromDate(startOfDay),
    end: Timestamp.fromDate(endOfDay),
  };
}

/**
 * Determine utilization level based on percentage
 */
function getUtilizationLevel(percentage: number): 'low' | 'high' | 'peak' {
  if (percentage >= 70) return 'peak';
  if (percentage >= 40) return 'high';
  return 'low';
}

/**
 * Hook for court utilization chart data
 */
export function useCourtUtilization(): UseCourtUtilizationReturn {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [data, setData] = useState<CourtUtilizationSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch utilization data for selected date
   */
  const fetchUtilizationData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { start, end } = getDateRange(selectedDate);

      // Fetch all reservations for the selected date
      const q = query(
        collection(getDbInstance(), 'reservations'),
        where('start_time', '>=', start),
        where('start_time', '<=', end),
        where('status', 'in', ['confirmed', 'pending'] as ReservationStatus[])
      );

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);

      // Initialize slot data
      const slotData: CourtUtilizationSlot[] = TIME_SLOTS.map((slot) => ({
        time: slot.label,
        utilization: 0,
        bookings: 0,
        level: 'low',
      }));

      // Count bookings per time slot
      snapshot.docs.forEach((doc) => {
        const reservation = doc.data();
        const startTime = reservation.start_time?.toDate();

        if (startTime) {
          const hour = startTime.getHours();

          // Find matching time slot
          const slotIndex = TIME_SLOTS.findIndex(
            (slot) => hour >= slot.start && hour < slot.end
          );

          if (slotIndex !== -1) {
            slotData[slotIndex].bookings += 1;
          }
        }
      });

      // Calculate utilization percentages
      const maxBookingsPerSlot = TOTAL_COURTS; // Max bookings per 2-hour slot
      const updatedData = slotData.map((slot) => {
        const utilization = Math.min(100, Math.round((slot.bookings / maxBookingsPerSlot) * 100));
        return {
          ...slot,
          utilization,
          level: getUtilizationLevel(utilization),
        };
      });

      setData(updatedData);
    } catch (err) {
      console.error('[useCourtUtilization] fetchUtilizationData error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch utilization data'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  /**
   * Refresh data manually
   */
  const refreshData = useCallback(async (): Promise<void> => {
    await fetchUtilizationData();
  }, [fetchUtilizationData]);

  /**
   * Setup real-time subscription
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = (): void => {
      try {
        setIsLoading(true);
        setError(null);

        const { start, end } = getDateRange(selectedDate);

        const q = query(
          collection(getDbInstance(), 'reservations'),
          where('start_time', '>=', start),
          where('start_time', '<=', end),
          where('status', 'in', ['confirmed', 'pending'] as ReservationStatus[])
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot: QuerySnapshot<DocumentData>) => {
            try {
              // Initialize slot data
              const slotData: CourtUtilizationSlot[] = TIME_SLOTS.map((slot) => ({
                time: slot.label,
                utilization: 0,
                bookings: 0,
                level: 'low',
              }));

              // Count bookings per time slot
              snapshot.docs.forEach((doc) => {
                const reservation = doc.data();
                const startTime = reservation.start_time?.toDate();

                if (startTime) {
                  const hour = startTime.getHours();
                  const slotIndex = TIME_SLOTS.findIndex(
                    (slot) => hour >= slot.start && hour < slot.end
                  );

                  if (slotIndex !== -1) {
                    slotData[slotIndex].bookings += 1;
                  }
                }
              });

              // Calculate utilization percentages
              const maxBookingsPerSlot = TOTAL_COURTS;
              const updatedData = slotData.map((slot) => {
                const utilization = Math.min(
                  100,
                  Math.round((slot.bookings / maxBookingsPerSlot) * 100)
                );
                return {
                  ...slot,
                  utilization,
                  level: getUtilizationLevel(utilization),
                };
              });

              setData(updatedData);
              setIsLoading(false);
            } catch (err) {
              console.error('[useCourtUtilization] onSnapshot callback error:', err);
              setError(err instanceof Error ? err : new Error('Failed to process snapshot'));
              setIsLoading(false);
            }
          },
          (err: Error) => {
            console.error('[useCourtUtilization] onSnapshot error:', err);
            setError(err);
            setIsLoading(false);
          }
        );
      } catch (err) {
        console.error('[useCourtUtilization] setupSubscription error:', err);
        setError(err instanceof Error ? err : new Error('Failed to setup subscription'));
        setIsLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedDate]);

  return {
    data,
    selectedDate,
    isLoading,
    error,
    setSelectedDate,
    refreshData,
  };
}

export default useCourtUtilization;
