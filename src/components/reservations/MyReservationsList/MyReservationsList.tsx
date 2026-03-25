/**
 * MyReservationsList Component
 *
 * List view for user's reservations with filters and actions.
 *
 * @module @components/reservations/MyReservationsList
 */

import { motion, useReducedMotion } from 'framer-motion';
import { ReservationActions } from './ReservationActions/ReservationActions';
import type { Reservation } from '../../types/reservation.types';
import type { Court } from '../../types/court.types';

export interface MyReservationsListProps {
  reservations: Reservation[];
  courts: Court[];
  isLoading?: boolean;
  onReschedule: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
  emptyMessage?: string;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get reservation status style
 */
function getStatusStyle(status: Reservation['status']): string {
  const styles: Record<Reservation['status'], string> = {
    confirmed: 'bg-primary text-on-primary',
    pending: 'bg-primary/50 text-on-primary',
    pending_payment: 'bg-secondary text-on-secondary',
    cancelled: 'bg-surface-dim text-on-surface/60',
    completed: 'bg-surface-container-high text-on-surface-variant',
  };
  return styles[status] || 'bg-surface-container-high text-on-surface-variant';
}

/**
 * Get reservation status label
 */
function getStatusLabel(status: Reservation['status']): string {
  const labels: Record<Reservation['status'], string> = {
    confirmed: 'Confirmée',
    pending: 'En attente',
    pending_payment: 'En attente de paiement',
    cancelled: 'Annulée',
    completed: 'Terminée',
  };
  return labels[status] || status;
}

/**
 * Get reservation type label
 */
function getTypeLabel(type: Reservation['type']): string {
  const labels: Record<Reservation['type'], string> = {
    location_libre: 'Location libre',
    cours_collectif: 'Cours collectif',
    cours_private: 'Cours particulier',
    individual: 'Individuel',
    doubles: 'Doubles',
    training: 'Entraînement',
    tournament: 'Tournoi',
    maintenance: 'Maintenance',
  };
  return labels[type] || type;
}

/**
 * Get court name by ID
 */
function getCourtName(courts: Court[], courtId: string): string {
  const court = courts.find((c) => c.id === courtId);
  return court ? court.name : `Court ${courtId}`;
}

/**
 * Get court type by ID
 */
function getCourtType(courts: Court[], courtId: string): string {
  const court = courts.find((c) => c.id === courtId);
  return court ? court.type : '';
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};

export function MyReservationsList({
  reservations,
  courts,
  isLoading = false,
  onReschedule,
  onCancel,
  emptyMessage = 'Aucune réservation',
}: MyReservationsListProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12" role="status">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
          event_busy
        </span>
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          {emptyMessage}
        </h3>
        <p className="font-body text-body-sm text-on-surface-variant mt-2">
          Réservez un court pour commencer
        </p>
      </div>
    );
  }

  // Sort reservations by start time
  const sortedReservations = [...reservations].sort((a, b) => {
    return a.start_time.toMillis() - b.start_time.toMillis();
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
      role="list"
      aria-label="List of reservations"
    >
      {sortedReservations.map((reservation) => {
        const startTime = reservation.start_time.toDate();
        const endTime = reservation.end_time.toDate();
        const isPast = startTime < new Date();
        const canCancel = !isPast && reservation.status === 'confirmed';
        const canReschedule = !isPast && reservation.status === 'confirmed';

        return (
          <motion.div
            key={reservation.id}
            variants={itemVariants}
            role="listitem"
            className="rounded-xl bg-surface-container-lowest border border-surface-container-highest overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      getCourtType(courts, reservation.court_id) === 'Terre'
                        ? 'bg-secondary/20'
                        : 'bg-primary/20'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined ${
                        getCourtType(courts, reservation.court_id) === 'Terre'
                          ? 'text-secondary'
                          : 'text-primary'
                      }`}
                    >
                      sports_tennis
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline text-base font-semibold text-on-surface">
                      {getCourtName(courts, reservation.court_id)}
                    </h3>
                    <p className="font-body text-body-sm text-on-surface-variant">
                      {getTypeLabel(reservation.type)}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-body text-body-xs font-medium ${getStatusStyle(
                    reservation.status
                  )}`}
                >
                  {getStatusLabel(reservation.status)}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">
                      calendar_today
                    </span>
                    <span className="font-body text-body-xs text-on-surface-variant">
                      Date
                    </span>
                  </div>
                  <div className="font-headline text-sm font-semibold text-on-surface">
                    {formatDate(startTime)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">
                      schedule
                    </span>
                    <span className="font-body text-body-xs text-on-surface-variant">
                      Horaire
                    </span>
                  </div>
                  <div className="font-headline text-sm font-semibold text-on-surface">
                    {formatTime(startTime)} - {formatTime(endTime)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">
                      people
                    </span>
                    <span className="font-body text-body-xs text-on-surface-variant">
                      Participants
                    </span>
                  </div>
                  <div className="font-headline text-sm font-semibold text-on-surface">
                    {reservation.participants || 1}
                  </div>
                </div>

                {reservation.description && (
                  <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">
                        description
                      </span>
                      <span className="font-body text-body-xs text-on-surface-variant">
                        Notes
                      </span>
                    </div>
                    <div className="font-body text-body-sm text-on-surface line-clamp-1">
                      {reservation.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <ReservationActions
                reservation={reservation}
                onReschedule={canReschedule ? () => onReschedule(reservation) : undefined}
                onCancel={canCancel ? () => onCancel(reservation) : undefined}
                showReschedule={canReschedule}
                showCancel={canCancel}
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default MyReservationsList;
