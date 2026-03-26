/**
 * useAdminDashboard Hook
 *
 * Real-time dashboard statistics for admin users.
 * Provides active bookings count, maintenance count, available slots, and trend data.
 *
 * Features:
 * - Real-time stats with onSnapshot
 * - Trend calculations (percentage changes)
 * - Try/catch on all Firestore operations
 * - Explicit TypeScript types (no any)
 *
 * @module @hooks/useAdminDashboard
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
import type { Reservation } from '../types/reservation.types';
import type { ReservationType } from '../types/reservation.types';

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  activeBookings: number;
  maintenanceCount: number;
  availableSlots: number;
  activeBookingsTrend: number;
  maintenanceTrend: number;
  availableSlotsTrend: number;
}

/**
 * Hook return type
 */
export interface UseAdminDashboardReturn {
  stats: DashboardStats;
  isLoading: boolean;
  error: Error | null;
  refreshStats: () => Promise<void>;
}

/**
 * Get start and end of today in local timezone
 */
function getTodayRange(): { start: Timestamp; end: Timestamp } {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return {
    start: Timestamp.fromDate(startOfDay),
    end: Timestamp.fromDate(endOfDay),
  };
}

/**
 * Calculate trend percentage between two values
 */
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Hook for real-time admin dashboard statistics
 */
export function useAdminDashboard(): UseAdminDashboardReturn {
  const [stats, setStats] = useState<DashboardStats>({
    activeBookings: 0,
    maintenanceCount: 0,
    availableSlots: 0,
    activeBookingsTrend: 0,
    maintenanceTrend: 0,
    availableSlotsTrend: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch stats for a specific date range
   */
  const fetchStatsForDate = useCallback(
    async (date: Date): Promise<{ activeBookings: number; maintenanceCount: number }> => {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      try {
        // Query active bookings (confirmed or pending) for the date
        const bookingsQuery = query(
          collection(getDbInstance(), 'reservations'),
          where('start_time', '>=', Timestamp.fromDate(startOfDay)),
          where('start_time', '<=', Timestamp.fromDate(endOfDay)),
          where('status', 'in', ['confirmed', 'pending'])
        );

        // Query maintenance reservations
        const maintenanceQuery = query(
          collection(getDbInstance(), 'reservations'),
          where('type', '==', 'maintenance' as ReservationType),
          where('status', 'in', ['confirmed', 'pending'])
        );

        const [bookingsSnapshot, maintenanceSnapshot] = await Promise.all([
          getDocs(bookingsQuery),
          getDocs(maintenanceQuery),
        ]);

        return {
          activeBookings: bookingsSnapshot.size,
          maintenanceCount: maintenanceSnapshot.size,
        };
      } catch (err) {
        console.error('[useAdminDashboard] fetchStatsForDate error:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Calculate available slots (6 courts × 15 hours × 2 slots/hour = 180 max)
   */
  const calculateAvailableSlots = useCallback(
    (activeBookings: number, maintenanceCount: number): number => {
      const totalSlots = 6 * 15 * 2; // 6 courts, 15 hours (6-21), 2 slots per hour
      const blockedSlots = maintenanceCount * 2; // Assume maintenance blocks 2-hour slots
      return Math.max(0, totalSlots - activeBookings - blockedSlots);
    },
    []
  );

  /**
   * Refresh all stats
   */
  const refreshStats = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Fetch today's stats
      const todayStats = await fetchStatsForDate(today);

      // Fetch yesterday's stats for trend calculation
      const yesterdayStats = await fetchStatsForDate(yesterday);

      // Calculate available slots
      const availableSlots = calculateAvailableSlots(
        todayStats.activeBookings,
        todayStats.maintenanceCount
      );

      // Calculate trends
      const activeBookingsTrend = calculateTrend(
        todayStats.activeBookings,
        yesterdayStats.activeBookings
      );
      const maintenanceTrend = calculateTrend(
        todayStats.maintenanceCount,
        yesterdayStats.maintenanceCount
      );
      const availableSlotsTrend = calculateTrend(
        availableSlots,
        calculateAvailableSlots(yesterdayStats.activeBookings, yesterdayStats.maintenanceCount)
      );

      setStats({
        activeBookings: todayStats.activeBookings,
        maintenanceCount: todayStats.maintenanceCount,
        availableSlots,
        activeBookingsTrend,
        maintenanceTrend,
        availableSlotsTrend,
      });
    } catch (err) {
      console.error('[useAdminDashboard] refreshStats error:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh dashboard stats'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatsForDate, calculateAvailableSlots]);

  /**
   * Setup real-time subscription
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const { start, end } = getTodayRange();

        // Real-time query for today's active bookings
        const q = query(
          collection(getDbInstance(), 'reservations'),
          where('start_time', '>=', start),
          where('start_time', '<=', end),
          where('status', 'in', ['confirmed', 'pending'])
        );

        unsubscribe = onSnapshot(
          q,
          async (snapshot: QuerySnapshot<DocumentData>) => {
            try {
              const activeBookings = snapshot.size;

              // Fetch maintenance count separately
              const maintenanceQuery = query(
                collection(getDbInstance(), 'reservations'),
                where('type', '==', 'maintenance' as ReservationType)
              );
              const maintenanceSnapshot = await getDocs(maintenanceQuery);
              const maintenanceCount = maintenanceSnapshot.size;

              // Calculate available slots
              const availableSlots = calculateAvailableSlots(activeBookings, maintenanceCount);

              // Fetch yesterday's stats for trends
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStats = await fetchStatsForDate(yesterday);

              // Calculate trends
              const activeBookingsTrend = calculateTrend(activeBookings, yesterdayStats.activeBookings);
              const maintenanceTrend = calculateTrend(maintenanceCount, yesterdayStats.maintenanceCount);
              const availableSlotsTrend = calculateTrend(
                availableSlots,
                calculateAvailableSlots(yesterdayStats.activeBookings, yesterdayStats.maintenanceCount)
              );

              setStats({
                activeBookings,
                maintenanceCount,
                availableSlots,
                activeBookingsTrend,
                maintenanceTrend,
                availableSlotsTrend,
              });

              setIsLoading(false);
            } catch (err) {
              console.error('[useAdminDashboard] onSnapshot callback error:', err);
              setError(err instanceof Error ? err : new Error('Failed to process snapshot'));
              setIsLoading(false);
            }
          },
          (err: Error) => {
            console.error('[useAdminDashboard] onSnapshot error:', err);
            setError(err);
            setIsLoading(false);
          }
        );
      } catch (err) {
        console.error('[useAdminDashboard] setupSubscription error:', err);
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
  }, [calculateAvailableSlots, fetchStatsForDate]);

  return {
    stats,
    isLoading,
    error,
    refreshStats,
  };
}

export default useAdminDashboard;
