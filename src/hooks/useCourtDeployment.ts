/**
 * useCourtDeployment Hook
 *
 * Real-time court deployment status with maintenance toggle.
 * Provides court management capabilities for admin dashboard.
 *
 * Features:
 * - Real-time court status with onSnapshot
 * - Maintenance toggle functionality
 * - Try/catch on all Firestore operations
 * - Explicit TypeScript types (no any)
 *
 * @module @hooks/useCourtDeployment
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  onSnapshot,
  Timestamp,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { getDbInstance } from '../config/firebase.config';
import type { Court, CourtStatus } from '../types/court.types';

/**
 * Court with deployment-specific properties
 */
export interface CourtDeployment extends Court {
  isMaintenance: boolean;
  deploymentLabel: string;
  deploymentColor: 'primary' | 'secondary';
}

/**
 * Hook return type
 */
export interface UseCourtDeploymentReturn {
  courts: CourtDeployment[];
  isLoading: boolean;
  error: Error | null;
  onToggleMaintenance: (courtId: string, isMaintenance: boolean) => Promise<void>;
  refreshCourts: () => Promise<void>;
}

/**
 * Convert Firestore court to deployment court
 */
function courtToDeploymentCourt(court: DocumentData, id: string): CourtDeployment {
  const isMaintenance = court.status === 'maintenance' || !court.is_active;

  return {
    id,
    number: court.number || 0,
    name: court.name || `Court ${court.number || '?'}`,
    type: court.type as Court['type'],
    surface: court.surface as Court['surface'],
    status: court.status as CourtStatus,
    is_active: court.is_active ?? true,
    createdAt: court.createdAt,
    updatedAt: court.updatedAt,
    image: court.image,
    description: court.description,
    isMaintenance,
    deploymentLabel: isMaintenance ? 'Maintenance' : 'Active',
    deploymentColor: isMaintenance ? 'secondary' : 'primary',
  };
}

/**
 * Hook for court deployment management
 */
export function useCourtDeployment(): UseCourtDeploymentReturn {
  const [courts, setCourts] = useState<CourtDeployment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Refresh courts manually
   */
  const refreshCourts = useCallback(async (): Promise<void> => {
    // Real-time subscription handles refresh automatically
    // This is for manual trigger if needed
  }, []);

  /**
   * Toggle maintenance state for a court
   */
  const onToggleMaintenance = useCallback(
    async (courtId: string, isMaintenance: boolean): Promise<void> => {
      try {
        const courtRef = doc(getDbInstance(), 'courts', courtId);

        await updateDoc(courtRef, {
          status: isMaintenance ? 'maintenance' : 'active',
          is_active: !isMaintenance,
          updatedAt: Timestamp.now(),
        });

        console.log(`[useCourtDeployment] Court ${courtId} maintenance toggled to ${isMaintenance}`);
      } catch (err) {
        console.error('[useCourtDeployment] onToggleMaintenance error:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Setup real-time subscription
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      setIsLoading(true);
      setError(null);

      // Query courts sorted by number
      const q = query(
        collection(getDbInstance(), 'courts'),
        orderBy('number', 'asc')
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          try {
            const deploymentCourts = snapshot.docs.map((doc) =>
              courtToDeploymentCourt(doc.data(), doc.id)
            );
            setCourts(deploymentCourts);
            setIsLoading(false);
          } catch (err) {
            console.error('[useCourtDeployment] onSnapshot callback error:', err);
            setError(err instanceof Error ? err : new Error('Failed to process courts snapshot'));
            setIsLoading(false);
          }
        },
        (err: Error) => {
          console.error('[useCourtDeployment] onSnapshot error:', err);
          setError(err);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error('[useCourtDeployment] setupSubscription error:', err);
      setError(err instanceof Error ? err : new Error('Failed to setup subscription'));
      setIsLoading(false);
    }

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
    onToggleMaintenance,
    refreshCourts,
  };
}

export default useCourtDeployment;
