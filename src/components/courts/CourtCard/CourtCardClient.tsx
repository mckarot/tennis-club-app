import { motion, useReducedMotion } from 'framer-motion';
import type { CourtCardClientProps } from './CourtCardClient.types';
import { clientStatusConfig, type ClientStatus } from './CourtCardClient.types';
import { SurfacePreview } from '../SurfacePreview/SurfacePreview';

/**
 * Determine client status based on court state
 */
function getClientStatus(court: CourtCardClientProps['court'], availableSlots: number): ClientStatus {
  if (!court.is_active) {
    return 'maintenance';
  }
  if (court.status === 'maintenance') {
    return 'maintenance';
  }
  if (availableSlots === 0) {
    return 'unavailable';
  }
  if (availableSlots <= 3) {
    return 'limited';
  }
  return 'available';
}

export function CourtCardClient({
  court,
  nextAvailable,
  availableSlots = 0,
  onBook,
  onViewDetails,
  className = '',
}: CourtCardClientProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const status = getClientStatus(court, availableSlots);
  const config = clientStatusConfig[status];

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
      whileHover={{ y: shouldReduceMotion ? 0 : -4 }}
      className={`
        bg-surface-container-lowest rounded-xl p-6 shadow-sm
        hover:shadow-md transition-shadow duration-300
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-headline text-headline-lg font-semibold text-on-surface mb-1">
            {court.name}
          </h3>
          <p className="font-body text-body-sm text-on-surface/60">
            Terrain {court.number} • {court.type}
          </p>
        </div>

        {/* Status Badge */}
        <span
          className={`
            inline-flex items-center gap-1 px-3 py-1 rounded-full
            font-body text-label-xs font-medium
            ${config.colorClass}
          `}
        >
          {config.label}
        </span>
      </div>

      {/* Surface Preview */}
      <div className="mb-4">
        <SurfacePreview surface={court.surface} courtType={court.type} />
      </div>

      {/* Availability Info */}
      <div className="mb-4">
        {nextAvailable && (
          <div className="flex items-center gap-2 text-on-surface/80">
            <span className="material-symbols-outlined text-sm text-primary">
              schedule
            </span>
            <span className="font-body text-body-sm">
              Prochain créneau: {nextAvailable}
            </span>
          </div>
        )}

        {availableSlots > 0 && (
          <div className="flex items-center gap-2 mt-2 text-on-surface/80">
            <span className="material-symbols-outlined text-sm text-primary">
              event_available
            </span>
            <span className="font-body text-body-sm">
              {availableSlots} créneau{availableSlots > 1 ? 'x' : ''} disponible{availableSlots > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {court.description && (
        <p className="font-body text-body text-on-surface/80 mb-4 line-clamp-2">
          {court.description}
        </p>
      )}

      {/* CTA Buttons */}
      <div className="flex items-center gap-3">
        {onBook && court.is_active && court.status !== 'maintenance' && (
          <button
            onClick={() => onBook(court)}
            disabled={availableSlots === 0}
            className={`
              flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
              font-body text-body-sm font-semibold
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/50
              ${availableSlots === 0
                ? 'bg-surface-container-highest text-on-surface/40 cursor-not-allowed'
                : 'bg-primary text-on-primary hover:bg-primary/90'
              }
            `}
            aria-label={`Réserver ${court.name}`}
          >
            <span className="material-symbols-outlined text-sm">
              add_circle
            </span>
            {config.ctaLabel}
          </button>
        )}

        {onViewDetails && (
          <button
            onClick={() => onViewDetails(court)}
            className="inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-body text-body-sm font-medium hover:bg-surface-container-highest transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label={`Voir les détails de ${court.name}`}
          >
            Détails
          </button>
        )}
      </div>
    </motion.div>
  );
}
