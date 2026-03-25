import { motion, useReducedMotion } from 'framer-motion';
import type { UpcomingPanelProps } from './UpcomingPanel.types';
import { ReservationCard } from '../ReservationCard/ReservationCard';
import { emptyStateConfig } from './UpcomingPanel.types';

export function UpcomingPanel({
  reservations,
  isLoading = false,
  onReservationClick,
  onViewAll,
  onClose,
  className = '',
  maxDisplay = 5,
}: UpcomingPanelProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.2 },
    },
  };

  const hasReservations = reservations.length > 0;
  const displayReservations = reservations.slice(0, maxDisplay);
  const hasMore = reservations.length > maxDisplay;

  return (
    <motion.aside
      initial={{ opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
      className={`
        bg-surface-container-lowest rounded-xl p-6 shadow-sm
        ${className}
      `}
      role="complementary"
      aria-label="Réservations à venir"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            event
          </span>
          <h3 className="font-headline text-headline-sm font-semibold text-on-surface">
            À venir
          </h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Fermer le panneau"
          >
            <span className="material-symbols-outlined text-sm text-on-surface/60">
              close
            </span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined text-primary animate-spin">
              progress_activity
            </span>
          </div>
        )}

        {!isLoading && !hasReservations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <span className="material-symbols-outlined text-4xl text-on-surface/40 mb-3">
              {emptyStateConfig['no-reservations'].icon}
            </span>
            <p className="font-headline text-headline-sm font-semibold text-on-surface mb-1">
              {emptyStateConfig['no-reservations'].title}
            </p>
            <p className="font-body text-body-sm text-on-surface/60">
              {emptyStateConfig['no-reservations'].message}
            </p>
          </motion.div>
        )}

        {!isLoading && hasReservations && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {displayReservations.map((reservation) => (
              <motion.div key={reservation.id} variants={itemVariants}>
                <ReservationCard
                  reservation={reservation}
                  onClick={() => onReservationClick?.(reservation)}
                  compact
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {hasMore && onViewAll && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onViewAll}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-body text-body-sm font-medium hover:bg-surface-container-highest transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Voir toutes les réservations"
          >
            Voir tout ({reservations.length})
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </motion.button>
        )}
      </div>
    </motion.aside>
  );
}
