/**
 * ReservationCard Component
 * 
 * Card with court badge, time, client name, status dot
 * PNG spec: Right sidebar, court badge, time, client name, status dot
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { ReservationCardProps, UpcomingReservation } from '../../../types/client-dashboard.types';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get court badge style
 */
const getCourtBadgeStyle = (courtType: 'Quick' | 'Terre'): string => {
  return courtType === 'Quick'
    ? 'bg-primary-fixed text-on-primary-container'
    : 'bg-secondary-fixed text-on-secondary-container';
};

/**
 * Get status dot color
 */
const getStatusDotColor = (status: string): string => {
  const colors: Record<string, string> = {
    confirmed: 'bg-success',
    pending: 'bg-warning',
    pending_payment: 'bg-secondary',
    cancelled: 'bg-surface-container-highest',
    completed: 'bg-success-container',
  };

  return colors[status] || 'bg-surface-container-highest';
};

/**
 * Format timestamp to time string
 */
const formatTime = (timestamp: { toDate: () => Date }): string => {
  const date = timestamp.toDate();
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format timestamp to date string
 */
const formatDate = (timestamp: { toDate: () => Date }): string => {
  const date = timestamp.toDate();
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return "Aujourd'hui";
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Demain';
  }

  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

// ==========================================
// COMPONENT
// ==========================================

export function ReservationCard({
  reservation,
  onClick,
}: ReservationCardProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' },
    },
    hover: {
      scale: shouldReduceMotion ? 1 : 1.02,
      transition: { duration: 0.1 },
    },
  };

  return (
    <motion.article
      initial="hidden"
      animate="visible"
      whileHover={onClick ? 'hover' : undefined}
      variants={cardVariants}
      onClick={() => onClick?.(reservation)}
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={`Réservation court ${reservation.courtNumber} le ${formatDate(reservation.startTime)} à ${formatTime(reservation.startTime)}`}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(reservation);
        }
      }}
      className={`
        bg-surface-container-low rounded-lg p-4
        shadow-sm hover:shadow-md
        transition-all duration-200
        ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-fixed' : 'cursor-default'}
      `}
    >
      {/* Header: Court Badge + Status Dot */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`
            font-body text-body-xs font-semibold
            px-2 py-1 rounded-full
            ${getCourtBadgeStyle(reservation.courtType)}
          `}
        >
          Court {reservation.courtNumber}
        </span>

        <div
          className={`w-2 h-2 rounded-full ${getStatusDotColor(reservation.status)}`}
          aria-label={`Statut: ${reservation.status}`}
          role="status"
        />
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-sm text-on-surface-variant">
          schedule
        </span>
        <span className="font-headline text-body-lg font-bold text-on-surface">
          {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
        </span>
      </div>

      {/* Date */}
      <p className="font-body text-body-sm text-on-surface-variant mb-3">
        {formatDate(reservation.startTime)}
      </p>

      {/* Client Name */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary-fixed/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-sm text-primary">
            person
          </span>
        </div>
        <span className="font-body text-body-sm text-on-surface">
          {reservation.userName}
        </span>
      </div>
    </motion.article>
  );
}
