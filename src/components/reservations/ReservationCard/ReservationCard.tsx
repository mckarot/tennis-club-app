import { motion, useReducedMotion } from 'framer-motion';
import type { ReservationCardProps } from './ReservationCard.types';
import { reservationStatusConfig, reservationTypeConfig } from './ReservationCard.types';

export function ReservationCard({
  reservation,
  onClick,
  onCancel,
  compact = false,
  className = '',
  showCourtName = true,
}: ReservationCardProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const statusConfig = reservationStatusConfig[reservation.status];
  const typeConfig = reservationTypeConfig[reservation.type];

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const startTime = reservation.start_time.toDate();
  const endTime = reservation.end_time.toDate();
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      whileHover={onClick ? { y: shouldReduceMotion ? 0 : -2, scale: shouldReduceMotion ? 1 : 1.02 } : {}}
      onClick={() => onClick?.(reservation)}
      className={`
        bg-surface-container-lowest rounded-lg p-4 shadow-sm
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(reservation);
        }
      } : undefined}
      aria-label={`Réservation ${typeConfig.label} le ${formatDate(startTime)} à ${formatTime(startTime)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">
            {typeConfig.icon}
          </span>
          <span className="font-body text-body-sm font-medium text-on-surface">
            {typeConfig.label}
          </span>
        </div>

        {/* Status Badge */}
        <span
          className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            font-body text-label-xs font-medium
            ${statusConfig.colorClass}
          `}
        >
          <span className="material-symbols-outlined text-xs">
            {statusConfig.icon}
          </span>
          {statusConfig.label}
        </span>
      </div>

      {/* Time Info */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface/60">
            schedule
          </span>
          <div className="flex flex-col">
            <span className="font-body text-body-sm font-semibold text-on-surface">
              {formatTime(startTime)} - {formatTime(endTime)}
            </span>
            <span className="font-body text-body-xs text-on-surface/60">
              {duration}h • {formatDate(startTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Court Info */}
      {showCourtName && (
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-sm text-on-surface/60">
            sports_tennis
          </span>
          <span className="font-body text-body-sm text-on-surface/80">
            Court {reservation.court_id}
          </span>
        </div>
      )}

      {/* Participants */}
      {reservation.participants && (
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-sm text-on-surface/60">
            people
          </span>
          <span className="font-body text-body-sm text-on-surface/80">
            {reservation.participants} participant{reservation.participants > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Description */}
      {reservation.description && !compact && (
        <p className="font-body text-body-sm text-on-surface/60 mb-3 line-clamp-2">
          {reservation.description}
        </p>
      )}

      {/* Footer Actions */}
      {(onCancel && reservation.status === 'confirmed') && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container-highest">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(reservation);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-surface-container-high text-on-surface font-body text-body-sm font-medium hover:bg-surface-container-highest transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Annuler la réservation"
          >
            <span className="material-symbols-outlined text-sm">cancel</span>
            Annuler
          </button>
        </div>
      )}
    </motion.div>
  );
}
