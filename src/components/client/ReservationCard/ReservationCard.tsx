/**
 * ReservationCard Component
 *
 * Displays upcoming reservation with court info, date/time, status, and actions.
 * Uses Framer Motion for hover elevation effect.
 *
 * @module @components/client/ReservationCard
 */

import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import type { UpcomingReservation } from '../../../types/client-dashboard.types';

interface ReservationCardProps {
  reservation: UpcomingReservation;
  onClick?: (reservation: UpcomingReservation) => void;
  onCancel?: (reservationId: string) => void;
}

export function ReservationCard({
  reservation,
  onClick,
  onCancel,
}: ReservationCardProps) {
  const formatTime = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getStatusBadgeStyles = (
    status: UpcomingReservation['status']
  ): { bg: string; text: string; label: string } => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return {
          bg: 'bg-primary-fixed/20',
          text: 'text-primary',
          label: 'Confirmé',
        };
      case 'pending':
      case 'pending_payment':
        return {
          bg: 'bg-secondary-container/20',
          text: 'text-secondary',
          label: 'En attente',
        };
      case 'cancelled':
        return {
          bg: 'bg-tertiary/10',
          text: 'text-tertiary',
          label: 'Annulé',
        };
      default:
        return {
          bg: 'bg-surface-container-highest',
          text: 'text-on-surface',
          label: status,
        };
    }
  };

  const getCourtTypeLabel = (type: UpcomingReservation['courtType']): string => {
    return type === 'Quick' ? 'Quick' : 'Terre';
  };

  const statusStyles = getStatusBadgeStyles(reservation.status);
  const isCancellable = reservation.status === 'confirmed';

  const ariaLabel = `Réservation court ${reservation.courtNumber} ${getCourtTypeLabel(reservation.courtType)} le ${formatDate(reservation.startTime)} à ${formatTime(reservation.startTime)}, statut ${statusStyles.label}`;

  return (
    <motion.div
      className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      role="article"
      aria-label={ariaLabel}
      onClick={() => onClick?.(reservation)}
    >
      {/* Left: Court Info */}
      <div className="flex flex-1 items-center gap-4">
        {/* Court Number Badge */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-white">
          <span className="font-headline text-headline-sm font-bold">
            {reservation.courtNumber}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-headline text-headline-sm font-semibold text-on-surface">
              Court {reservation.courtNumber} - {getCourtTypeLabel(reservation.courtType)}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 font-body text-label font-medium ${statusStyles.bg} ${statusStyles.text}`}
            >
              {statusStyles.label}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <div className="flex items-center gap-1 text-on-surface/70">
              <span
                className="material-symbols-outlined text-sm"
                aria-hidden="true"
              >
                calendar_today
              </span>
              <span className="font-body text-body-sm">{formatDate(reservation.startTime)}</span>
            </div>
            <div className="flex items-center gap-1 text-on-surface/70">
              <span
                className="material-symbols-outlined text-sm"
                aria-hidden="true"
              >
                schedule
              </span>
              <span className="font-body text-body-sm">
                {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Action Button */}
      {isCancellable && onCancel && (
        <button
          className="ml-4 rounded-lg bg-surface-container-highest px-4 py-2 font-body text-body-sm font-medium text-on-surface transition-colors hover:bg-tertiary hover:text-white focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation();
            onCancel(reservation.id);
          }}
          aria-label={`Annuler la réservation du court ${reservation.courtNumber}`}
        >
          Annuler
        </button>
      )}
    </motion.div>
  );
}

export default ReservationCard;
