/**
 * ClubMaintenanceNote Component
 * 
 * Announcement card widget for maintenance notifications
 * Displays severity-based styling (info, warning, urgent)
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { ClubMaintenanceNoteProps } from '../../../types/client-dashboard.types';

// ==========================================
// STYLE CONFIGURATION
// ==========================================

/**
 * Get severity-based styles
 */
const getSeverityStyles = (severity: 'info' | 'warning' | 'urgent'): {
  border: string;
  bg: string;
  icon: string;
  badge: string;
} => {
  const styles = {
    info: {
      border: 'border-primary',
      bg: 'bg-primary-fixed/20',
      icon: 'info',
      badge: 'bg-primary text-on-primary',
    },
    warning: {
      border: 'border-secondary',
      bg: 'bg-secondary-fixed/20',
      icon: 'warning',
      badge: 'bg-secondary text-on-secondary',
    },
    urgent: {
      border: 'border-error',
      bg: 'bg-error-container/30',
      icon: 'error',
      badge: 'bg-error text-on-error',
    },
  };

  return styles[severity];
};

/**
 * Get severity label
 */
const getSeverityLabel = (severity: 'info' | 'warning' | 'urgent'): string => {
  const labels = {
    info: 'Information',
    warning: 'Attention',
    urgent: 'Urgent',
  };

  return labels[severity];
};

// ==========================================
// COMPONENT
// ==========================================

export function ClubMaintenanceNote({
  note,
  onDismiss,
}: ClubMaintenanceNoteProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const styles = getSeverityStyles(note.severity);

  const noteVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : -16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.95,
      transition: { duration: shouldReduceMotion ? 0 : 0.2 },
    },
  };

  return (
    <motion.article
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={noteVariants}
      className={`
        bg-surface-container-lowest rounded-xl p-6
        border-l-4 ${styles.border}
        shadow-sm
      `}
      role="alert"
      aria-live="polite"
      aria-label={`Note de maintenance: ${note.title}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${styles.bg} flex items-center justify-center`}
            aria-hidden="true"
          >
            <span className={`material-symbols-outlined ${note.severity === 'urgent' ? 'text-error' : note.severity === 'warning' ? 'text-secondary' : 'text-primary'}`}>
              {styles.icon}
            </span>
          </div>

          <div>
            <span
              className={`
                inline-block font-body text-body-xs font-semibold
                px-2 py-1 rounded-full mb-1
                ${styles.badge}
              `}
            >
              {getSeverityLabel(note.severity)}
            </span>
            <h3 className="font-headline text-headline-sm font-bold text-on-surface">
              {note.title}
            </h3>
          </div>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Fermer la notification"
            className="
              p-2 rounded-lg
              text-on-surface-variant hover:text-on-surface
              hover:bg-surface-container-highest
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-fixed
            "
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Message */}
      <p className="font-body text-body-md text-on-surface-variant mb-4">
        {note.message}
      </p>

      {/* Footer: Timestamp */}
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-sm">schedule</span>
        <span className="font-body text-body-xs">
          Publié le {note.createdAt.toDate().toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
    </motion.article>
  );
}
