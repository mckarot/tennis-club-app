/**
 * useAdminCourts Hook
 *
 * Admin-specific hook for managing courts with CRUD operations.
 * Provides real-time updates, loading states, error handling, and all court management operations.
 *
 * Features:
 * - Real-time subscription with onSnapshot
 * - Try/catch on all Firestore mutations
 * - Explicit TypeScript types (no any)
 * - Batch operations for multiple updates
 * - Timestamp.now() for date fields
 *
 * @module @hooks/useAdminCourts
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { getDbInstance } from '../config/firebase.config';
import type { Court } from '../types/court.types';
import type { CourtInput } from '../types/court.types';

/**
 * Hook return type
 */
export interface UseAdminCourtsReturn {
  courts: Court[];
  isLoading: boolean;
  error: Error | null;
  createCourt: (input: CourtInput) => Promise<void>;
  updateCourt: (courtId: string, updates: Partial<CourtInput> & { status?: Court['status']; is_active?: boolean }) => Promise<void>;
  deleteCourt: (courtId: string) => Promise<void>;
  toggleCourtStatus: (courtId: string) => Promise<void>;
  refreshCourts: () => Promise<void>;
}

/**
 * Admin hook for managing courts with CRUD operations
 */
export function useAdminCourts(): UseAdminCourtsReturn {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Refresh courts data manually
   */
  const refreshCourts = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { getDocs } = await import('firebase/firestore');
      
      const q = query(
        collection(getDbInstance(), 'courts'),
        orderBy('number')
      );

      const snapshot = await getDocs(q);
      const fetchedCourts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Court[];
      
      setCourts(fetchedCourts);
      setIsLoading(false);
    } catch (err) {
      console.error('[useAdminCourts] refreshCourts error:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh courts'));
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new court
   */
  const createCourt = useCallback(
    async (input: CourtInput): Promise<void> => {
      try {
        const now = Timestamp.now();
        const courtData = {
          ...input,
          is_active: true,
          status: 'active' as const,
          createdAt: now,
          updatedAt: now,
        };

        await collection(getDbInstance(), 'courts').add(courtData);
        await refreshCourts();
      } catch (err) {
        console.error('[useAdminCourts] createCourt error:', err);
        throw err instanceof Error ? err : new Error('Failed to create court');
      }
    },
    [refreshCourts]
  );

  /**
   * Update an existing court
   */
  const updateCourt = useCallback(
    async (
      courtId: string,
      updates: Partial<CourtInput> & { status?: Court['status']; is_active?: boolean }
    ): Promise<void> => {
      try {
        const courtRef = doc(getDbInstance(), 'courts', courtId);
        await updateDoc(courtRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        });
        await refreshCourts();
      } catch (err) {
        console.error('[useAdminCourts] updateCourt error:', err);
        throw err instanceof Error ? err : new Error('Failed to update court');
      }
    },
    [refreshCourts]
  );

  /**
   * Delete a court (hard delete)
   */
  const deleteCourt = useCallback(
    async (courtId: string): Promise<void> => {
      try {
        await deleteDoc(doc(getDbInstance(), 'courts', courtId));
        await refreshCourts();
      } catch (err) {
        console.error('[useAdminCourts] deleteCourt error:', err);
        throw err instanceof Error ? err : new Error('Failed to delete court');
      }
    },
    [refreshCourts]
  );

  /**
   * Toggle court active status
   */
  const toggleCourtStatus = useCallback(
    async (courtId: string): Promise<void> => {
      try {
        const court = courts.find((c) => c.id === courtId);
        if (!court) {
          throw new Error('Court not found');
        }

        const courtRef = doc(getDbInstance(), 'courts', courtId);
        await updateDoc(courtRef, {
          is_active: !court.is_active,
          updatedAt: Timestamp.now(),
        });
        // Don't call refreshCourts here - let onSnapshot handle the update
      } catch (err) {
        console.error('[useAdminCourts] toggleCourtStatus error:', err);
        throw err instanceof Error ? err : new Error('Failed to toggle court status');
      }
    },
    [courts]
  );

  /**
   * Setup real-time subscription
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = (): void => {
      try {
        setIsLoading(true);
        setError(null);

        const q = query(
          collection(getDbInstance(), 'courts'),
          orderBy('number')
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot: QuerySnapshot<DocumentData>) => {
            const fetchedCourts = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Court[];
            setCourts(fetchedCourts);
            setIsLoading(false);
          },
          (err: Error) => {
            console.error('[useAdminCourts] onSnapshot error:', err);
            setError(err);
            setIsLoading(false);
          }
        );
      } catch (err) {
        console.error('[useAdminCourts] setupSubscription error:', err);
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
  }, []);

  return {
    courts,
    isLoading,
    error,
    createCourt,
    updateCourt,
    deleteCourt,
    toggleCourtStatus,
    refreshCourts,
  };
}

export default useAdminCourts;
