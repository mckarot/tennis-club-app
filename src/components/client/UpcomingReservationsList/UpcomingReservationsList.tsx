/**
 * UpcomingReservationsList Component
 *
 * Scrollable list of upcoming reservations (max 5 displayed).
 * Shows "+N autres" if more than 5 reservations.
 * Empty state if no reservations.
 * Skeleton cards if loading.
 *
 * @module @components/client/UpcomingReservationsList
 */

import { ReservationCard } from '../ReservationCard/ReservationCard';
import type { UpcomingReservation } from '../../../types/client-dashboard.types';

interface UpcomingReservationsListProps {
  reservations: UpcomingReservation[];
  loading?: boolean;
  onReservationClick?: (reservation: UpcomingReservation) => void;
  onReservationCancel?: (reservationId: string) => void;
}

const MAX_DISPLAYED_RESERVATIONS = 5;

export function UpcomingReservationsList({
  reservations,
  loading = false,
  onReservationClick,
  onReservationCancel,
}: UpcomingReservationsListProps) {
  const displayedReservations = reservations.slice(0, MAX_DISPLAYED_RESERVATIONS);
  const remainingCount = reservations.length - MAX_DISPLAYED_RESERVATIONS;

  if (loading) {
    return (
      <section
        className="space-y-4"
        aria-label="Prochaines réservations"
        role="region"
        aria-busy="true"
      >
        <h2 className="font-headline text-headline-md font-bold text-on-surface">
          Prochaines réservations
        </h2>

        {/* Skeleton Cards */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-4"
          >
            <div className="h-12 w-12 animate-pulse rounded-full bg-surface-container-highest" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-surface-container-highest" />
              <div className="h-3 w-48 animate-pulse rounded bg-surface-container-highest" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (reservations.length === 0) {
    return (
      <section
        className="rounded-xl bg-surface-container-low p-8"
        aria-label="Prochaines réservations"
        role="region"
      >
        <h2 className="font-headline text-headline-md font-bold text-on-surface">
          Prochaines réservations
        </h2>

        <div className="mt-6 flex flex-col items-center justify-center py-8">
          <span
            className="material-symbols-outlined text-4xl text-on-surface/40"
            aria-hidden="true"
          >
            event_busy
          </span>
          <p className="mt-4 font-body text-body-lg text-on-surface/70">
            Aucune réservation à venir
          </p>
          <p className="mt-2 font-body text-body-sm text-on-surface/60">
            Réservez un court pour commencer
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="space-y-4"
      aria-label="Prochaines réservations"
      role="region"
    >
      <h2 className="font-headline text-headline-md font-bold text-on-surface">
        Prochaines réservations
      </h2>

      {/* Reservations List */}
      <div className="space-y-3">
        {displayedReservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            onClick={onReservationClick}
            onCancel={onReservationCancel}
          />
        ))}
      </div>

      {/* "+N autres" indicator */}
      {remainingCount > 0 && (
        <div className="flex items-center justify-center rounded-lg bg-surface-container-highest py-3">
          <span className="font-body text-body-sm font-medium text-on-surface">
            +{remainingCount} autre{remainingCount > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </section>
  );
}

export default UpcomingReservationsList;
