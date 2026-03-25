/**
 * RealtimeGrid Component
 *
 * CourtGrid with real-time onSnapshot subscription for live updates.
 * Displays court availability with automatic refresh when reservations change.
 *
 * @module @components/reservations/RealtimeGrid
 */

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type Timestamp,
} from 'firebase/firestore';
import { getDbInstance } from '../../config/firebase.config';
import { TimeSlotGrid } from './TimeSlotGrid/TimeSlotGrid';
import type { Court } from '../../types/court.types';
import type { Reservation } from '../../types/reservation.types';

export interface RealtimeGridProps {
  courts: Court[];
  startDate?: Date;
  onSlotSelect: (court: Court, date: Date, hour: number) => void;
  courtId?: string;
  userId?: string;
}

/**
 * Generate date range for query
 */
function getDateRange(startDate: Date) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(startDate);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Map Firestore document to Reservation type
 */
function mapToReservation(docId: string, data: Record<string, unknown>): Reservation {
  return {
    id: docId,
    court_id: data.court_id as string,
    user_id: data.user_id as string,
    moniteur_id: data.moniteur_id as string | undefined,
    start_time: data.start_time as Timestamp,
    end_time: data.end_time as Timestamp,
    type: data.type as Reservation['type'],
    status: data.status as Reservation['status'],
    title: data.title as string | undefined,
    description: data.description as string | undefined,
    participants: data.participants as number | undefined,
    is_paid: data.is_paid as boolean | undefined,
    created_at: data.created_at as Timestamp,
    updated_at: data.updated_at as Timestamp | undefined,
  };
}

export function RealtimeGrid({
  courts,
  startDate = new Date(),
  onSlotSelect,
  courtId,
  userId,
}: RealtimeGridProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // onSnapshot subscription managed directly in useEffect for proper cleanup
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const { start, end } = getDateRange(startDate);
    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);

    const constraints: Array<ReturnType<typeof where> | ReturnType<typeof orderBy>> = [
      where('start_time', '>=', startTimestamp),
      where('start_time', '<=', endTimestamp),
      orderBy('start_time', 'asc'),
    ];

    if (courtId) {
      constraints.unshift(where('court_id', '==', courtId));
    }

    const q = query(collection(getDbInstance(), 'reservations'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reservationData = snapshot.docs.map((doc) =>
          mapToReservation(doc.id, doc.data() as Record<string, unknown>)
        );
        setReservations(reservationData);
        setIsLoading(false);
        setLastUpdated(new Date());
      },
      (err) => {
        console.error('[RealtimeGrid] Error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch reservations'));
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [startDate, courtId]);

  const handleSlotSelect = useCallback(
    (court: Court, date: Date, hour: number) => {
      onSlotSelect(court, date, hour);
    },
    [onSlotSelect]
  );

  return (
    <div className="space-y-4">
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-headline text-lg font-semibold text-on-surface">
            Disponibilité des courts
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-body text-body-xs font-medium text-primary">En direct</span>
          </div>
        </div>

        {lastUpdated && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">update</span>
            <span className="font-body text-body-xs">
              Mis à jour il y a {Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)}s
            </span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 rounded-lg bg-error-container text-on-error-container"
        >
          <span className="material-symbols-outlined">error</span>
          <div>
            <p className="font-body text-body-sm font-medium">Erreur de chargement</p>
            <p className="font-body text-body-xs opacity-80">{error.message}</p>
          </div>
        </div>
      )}

      {/* Grid */}
      <TimeSlotGrid
        courts={courts}
        reservations={reservations}
        startDate={startDate}
        onSlotSelect={handleSlotSelect}
        isLoading={isLoading}
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-surface-container-highest">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-surface-container-high border border-surface-container-highest" />
          <span className="font-body text-body-xs text-on-surface-variant">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="font-body text-body-xs text-on-surface-variant">Réservé (Quick)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary" />
          <span className="font-body text-body-xs text-on-surface-variant">Réservé (Terre)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/50" />
          <span className="font-body text-body-xs text-on-surface-variant">En attente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-surface-dim/40 border-dashed border" />
          <span className="font-body text-body-xs text-on-surface-variant">Maintenance</span>
        </div>
      </div>
    </div>
  );
}

export default RealtimeGrid;
