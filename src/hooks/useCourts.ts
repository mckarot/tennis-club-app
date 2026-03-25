/**
 * useCourts Hook
 *
 * React hook for managing courts with real-time updates.
 * Provides courts list, active courts, loading state, error handling, and CRUD operations.
 *
 * @module @hooks/useCourts
 */

import { useState, useEffect, useCallback } from 'react';
import type { Court } from '../types/court.types';
import type { CourtInput } from '../types/court.types';
import type { UseCourtsReturn } from '../types/service.types';
import {
  subscribeToAllCourts,
  getAllCourts,
  createCourt as createCourtFn,
  updateCourt as updateCourtFn,
  deleteCourt as deleteCourtFn,
  deactivateCourt as deactivateCourtFn,
} from '../services/courtService';
import type { CreateResult, ServiceResult } from '../types/service.types';

/**
 * Hook options for useCourts
 */
export interface UseCourtsOptions {
  /** Subscribe to real-time updates (default: true) */
  subscribe?: boolean;
  /** Only fetch active courts (default: false) */
  activeOnly?: boolean;
}

/**
 * React hook for managing courts with real-time updates
 *
 * @param options - Hook options
 * @returns UseCourtsReturn with courts, loading state, error, and CRUD operations
 *
 * @example
 * // Basic usage with real-time updates
 * const { courts, activeCourts, isLoading, error } = useCourts();
 *
 * @example
 * // Without real-time subscription
 * const { courts, refresh } = useCourts({ subscribe: false });
 *
 * @example
 * // Active courts only
 * const { activeCourts } = useCourts({ activeOnly: true });
 */
export function useCourts(options: UseCourtsOptions = {}): UseCourtsReturn {
  const { subscribe = true, activeOnly = false } = options;

  const [courts, setCourts] = useState<Court[]>([]);
  const [activeCourts, setActiveCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Refresh courts data
   */
  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const allCourts = await getAllCourts();
      setCourts(allCourts);

      const active = allCourts.filter((court) => court.is_active);
      setActiveCourts(active);
    } catch (err) {
      console.error('[useCourts] Refresh error:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh courts'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initial load and subscription setup
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initialize = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        if (subscribe) {
          // Setup real-time subscription
          unsubscribe = subscribeToAllCourts(
            (fetchedCourts) => {
              setCourts(fetchedCourts);
              const active = fetchedCourts.filter((court) => court.is_active);
              setActiveCourts(active);
              setIsLoading(false);
            },
            (err) => {
              console.error('[useCourts] Subscription error:', err);
              setError(err);
              setIsLoading(false);
            }
          );
        } else {
          // One-time fetch
          await refresh();
        }
      } catch (err) {
        console.error('[useCourts] Initialization error:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize courts'));
        setIsLoading(false);
      }
    };

    initialize();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [subscribe, refresh]);

  return {
    courts,
    activeCourts,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Extended hook with CRUD operations
 * Use this when you need to create, update, or delete courts
 *
 * @example
 * const {
 *   courts,
 *   createCourt,
 *   updateCourt,
 *   deleteCourt
 * } = useCourtsWithCRUD();
 *
 * // Create a court
 * await createCourt({
 *   number: 5,
 *   name: 'Court 5',
 *   type: 'Quick',
 *   surface: 'Hard'
 * });
 */
export function useCourtsWithCRUD() {
  const { courts, activeCourts, isLoading, error, refresh } = useCourts();
  const [isMutating, setIsMutating] = useState<boolean>(false);

  /**
   * Create a new court
   */
  const createCourt = useCallback(
    async (input: CourtInput): Promise<CreateResult> => {
      try {
        setIsMutating(true);
        const result = await createCourtFn(input);

        if (result.success) {
          await refresh();
        }

        return result;
      } catch (err) {
        console.error('[useCourtsWithCRUD] createCourt error:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to create court',
        };
      } finally {
        setIsMutating(false);
      }
    },
    [refresh]
  );

  /**
   * Update an existing court
   */
  const updateCourt = useCallback(
    async (courtId: string, updates: Partial<Omit<Court, 'id' | 'createdAt'>>): Promise<ServiceResult<void>> => {
      try {
        setIsMutating(true);
        const result = await updateCourtFn(courtId, updates);

        if (result.success) {
          await refresh();
        }

        return result;
      } catch (err) {
        console.error('[useCourtsWithCRUD] updateCourt error:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update court',
        };
      } finally {
        setIsMutating(false);
      }
    },
    [refresh]
  );

  /**
   * Delete a court (hard delete)
   */
  const deleteCourt = useCallback(
    async (courtId: string): Promise<ServiceResult<void>> => {
      try {
        setIsMutating(true);
        const result = await deleteCourtFn(courtId);

        if (result.success) {
          await refresh();
        }

        return result;
      } catch (err) {
        console.error('[useCourtsWithCRUD] deleteCourt error:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to delete court',
        };
      } finally {
        setIsMutating(false);
      }
    },
    [refresh]
  );

  /**
   * Deactivate a court (soft delete)
   */
  const deactivateCourt = useCallback(
    async (courtId: string): Promise<ServiceResult<void>> => {
      try {
        setIsMutating(true);
        const result = await deactivateCourtFn(courtId);

        if (result.success) {
          await refresh();
        }

        return result;
      } catch (err) {
        console.error('[useCourtsWithCRUD] deactivateCourt error:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to deactivate court',
        };
      } finally {
        setIsMutating(false);
      }
    },
    [refresh]
  );

  return {
    courts,
    activeCourts,
    isLoading: isLoading || isMutating,
    error,
    refresh,
    createCourt,
    updateCourt,
    deleteCourt,
    deactivateCourt,
    isMutating,
  };
}

export default useCourts;
