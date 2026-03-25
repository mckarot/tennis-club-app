/**
 * useAvailability Hook
 *
 * React hook for checking court availability and fetching available time slots.
 * Includes caching mechanism to reduce redundant API calls.
 *
 * @module @hooks/useAvailability
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { UseAvailabilityReturn, AvailabilityResult, TimeSlotWithAvailability } from '../types/service.types';
import { checkCourtAvailability, getCourtReservations } from '../services/reservationService';
import type { Reservation } from '../types/reservation.types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'America/Martinique';

/**
 * Cache entry for availability results
 */
interface AvailabilityCacheEntry {
  result: AvailabilityResult;
  timestamp: number;
  expiresAt: number;
}

/**
 * Cache entry for available slots
 */
interface SlotsCacheEntry {
  slots: TimeSlotWithAvailability[];
  timestamp: number;
  expiresAt: number;
}

/**
 * Hook options for useAvailability
 */
export interface UseAvailabilityOptions {
  /** Cache duration in milliseconds (default: 30000 = 30 seconds) */
  cacheDuration?: number;
  /** Enable caching (default: true) */
  enableCache?: boolean;
}

/**
 * Default slot duration in minutes
 */
const DEFAULT_SLOT_DURATION = 30;

/**
 * Court opening hours
 */
const COURT_OPENING_HOUR = 7; // 7:00 AM
const COURT_CLOSING_HOUR = 22; // 10:00 PM

/**
 * React hook for checking court availability
 */
export function useAvailability(options: UseAvailabilityOptions = {}): UseAvailabilityReturn {
  const { cacheDuration = 30000, enableCache = true } = options;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Cache refs
  const availabilityCache = useRef<Map<string, AvailabilityCacheEntry>>(new Map());
  const slotsCache = useRef<Map<string, SlotsCacheEntry>>(new Map());

  /**
   * Clean expired cache entries
   */
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();

    for (const [key, entry] of availabilityCache.current.entries()) {
      if (now > entry.expiresAt) {
        availabilityCache.current.delete(key);
      }
    }

    for (const [key, entry] of slotsCache.current.entries()) {
      if (now > entry.expiresAt) {
        slotsCache.current.delete(key);
      }
    }
  }, []);

  /**
   * Generate cache key for availability check
   */
  const getAvailabilityCacheKey = useCallback((courtId: string, startTime: Date, endTime: Date): string => {
    return `${courtId}:${startTime.toISOString()}:${endTime.toISOString()}`;
  }, []);

  /**
   * Generate cache key for slots
   */
  const getSlotsCacheKey = useCallback((courtId: string, date: Date): string => {
    return `${courtId}:${dayjs(date).format('YYYY-MM-DD')}`;
  }, []);

  /**
   * Clear all cache entries
   */
  const clearCache = useCallback(() => {
    availabilityCache.current.clear();
    slotsCache.current.clear();
  }, []);

  /**
   * Invalidate cache for a specific court
   */
  const invalidateCourtCache = useCallback((courtId: string) => {
    for (const key of availabilityCache.current.keys()) {
      if (key.startsWith(`${courtId}:`)) {
        availabilityCache.current.delete(key);
      }
    }

    for (const key of slotsCache.current.keys()) {
      if (key.startsWith(`${courtId}:`)) {
        slotsCache.current.delete(key);
      }
    }
  }, []);

  /**
   * Cleanup cache on unmount
   */
  useEffect(() => {
    return () => {
      availabilityCache.current.clear();
      slotsCache.current.clear();
    };
  }, []);

  /**
   * Check court availability for a time slot
   */
  const checkAvailability = useCallback(
    async (courtId: string, startTime: Date, endTime: Date): Promise<AvailabilityResult> => {
      try {
        setIsLoading(true);
        setError(null);

        cleanExpiredCache();

        if (enableCache) {
          const cacheKey = getAvailabilityCacheKey(courtId, startTime, endTime);
          const cachedEntry = availabilityCache.current.get(cacheKey);

          if (cachedEntry && Date.now() < cachedEntry.expiresAt) {
            return cachedEntry.result;
          }
        }

        const result = await checkCourtAvailability(courtId, startTime, endTime);

        if (enableCache) {
          const cacheKey = getAvailabilityCacheKey(courtId, startTime, endTime);
          availabilityCache.current.set(cacheKey, {
            result,
            timestamp: Date.now(),
            expiresAt: Date.now() + cacheDuration,
          });
        }

        return result;
      } catch (err) {
        console.error('[useAvailability] checkAvailability error:', err);
        const appError = err instanceof Error ? err : new Error('Failed to check availability');
        setError(appError);
        return {
          isAvailable: false,
          reason: appError.message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [enableCache, cacheDuration, cleanExpiredCache, getAvailabilityCacheKey]
  );

  /**
   * Generate time slots for a day
   */
  const generateTimeSlots = useCallback((date: Date, durationMinutes: number = DEFAULT_SLOT_DURATION): { start: Date; end: Date }[] => {
    const slots: { start: Date; end: Date }[] = [];
    const startOfDay = dayjs(date).tz(TIMEZONE).startOf('day');

    let currentTime = startOfDay.hour(COURT_OPENING_HOUR).minute(0);
    const endTime = startOfDay.hour(COURT_CLOSING_HOUR).minute(0);

    while (currentTime.isBefore(endTime)) {
      const slotEnd = currentTime.add(durationMinutes, 'minute');

      if (slotEnd.isAfter(endTime)) {
        break;
      }

      slots.push({
        start: currentTime.toDate(),
        end: slotEnd.toDate(),
      });

      currentTime = slotEnd;
    }

    return slots;
  }, []);

  /**
   * Check if a time slot conflicts with existing reservations
   */
  const isSlotAvailable = useCallback((slot: { start: Date; end: Date }, reservations: Reservation[]): boolean => {
    const slotStart = dayjs(slot.start);
    const slotEnd = dayjs(slot.end);

    return !reservations.some((reservation) => {
      const resStart = dayjs(reservation.start_time.toDate());
      const resEnd = dayjs(reservation.end_time.toDate());

      return slotStart.isBefore(resEnd) && slotEnd.isAfter(resStart);
    });
  }, []);

  /**
   * Get available slots for a specific court and date
   */
  const getAvailableSlots = useCallback(
    async (courtId: string, date: Date, durationMinutes: number = DEFAULT_SLOT_DURATION): Promise<TimeSlotWithAvailability[]> => {
      try {
        setIsLoading(true);
        setError(null);

        cleanExpiredCache();

        if (enableCache) {
          const cacheKey = getSlotsCacheKey(courtId, date);
          const cachedEntry = slotsCache.current.get(cacheKey);

          if (cachedEntry && Date.now() < cachedEntry.expiresAt) {
            return cachedEntry.slots;
          }
        }

        const allSlots = generateTimeSlots(date, durationMinutes);

        const startOfDay = dayjs(date).tz(TIMEZONE).startOf('day').toDate();
        const endOfDay = dayjs(date).tz(TIMEZONE).endOf('day').toDate();

        const reservations = await getCourtReservations(courtId, startOfDay, endOfDay);
        const activeReservations = reservations.filter((r) => r.status !== 'cancelled');

        const availableSlots: TimeSlotWithAvailability[] = allSlots
          .filter((slot) => isSlotAvailable(slot, activeReservations))
          .map((slot) => ({
            start: slot.start,
            end: slot.end,
            available: true,
            court_id: courtId,
          }));

        if (enableCache) {
          const cacheKey = getSlotsCacheKey(courtId, date);
          slotsCache.current.set(cacheKey, {
            slots: availableSlots,
            timestamp: Date.now(),
            expiresAt: Date.now() + cacheDuration,
          });
        }

        return availableSlots;
      } catch (err) {
        console.error('[useAvailability] getAvailableSlots error:', err);
        const appError = err instanceof Error ? err : new Error('Failed to get available slots');
        setError(appError);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [enableCache, cacheDuration, cleanExpiredCache, getSlotsCacheKey, generateTimeSlots, isSlotAvailable]
  );

  return {
    isLoading,
    error,
    checkAvailability,
    getAvailableSlots,
    clearCache,
    invalidateCourtCache,
  };
}

export default useAvailability;
