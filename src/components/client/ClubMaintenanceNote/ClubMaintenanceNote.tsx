/**
 * ClubMaintenanceNote Component
 *
 * Informative card displaying maintenance notifications.
 * Colors based on severity: info=blue, warning=ocre, urgent=red.
 * Dismissible with close button.
 *
 * @module @components/client/ClubMaintenanceNote
 */

import type { MaintenanceNote } from '../../../types/client-dashboard.types';

interface ClubMaintenanceNoteProps {
  note: MaintenanceNote;
  onDismiss?: () => void;
}

export function ClubMaintenanceNote({ note, onDismiss }: ClubMaintenanceNoteProps) {
  const getSeverityStyles = (
    severity: MaintenanceNote['severity']
  ): { bg: string; border: string; icon: string; iconColor: string } => {
    switch (severity) {
      case 'info':
        return {
          bg: 'bg-primary-fixed/10',
          border: 'border-primary-fixed',
          icon: 'info',
          iconColor: 'text-primary',
        };
      case 'warning':
        return {
          bg: 'bg-secondary-fixed/20',
          border: 'border-secondary-container',
          icon: 'warning',
          iconColor: 'text-secondary',
        };
      case 'urgent':
        return {
          bg: 'bg-tertiary/10',
          border: 'border-tertiary',
          icon: 'error',
          iconColor: 'text-tertiary',
        };
      default:
        return {
          bg: 'bg-surface-container-highest',
          border: 'border-surface-container-highest',
          icon: 'info',
          iconColor: 'text-on-surface',
        };
    }
  };

  const styles = getSeverityStyles(note.severity);

  return (
    <section
      className={`flex items-start gap-4 rounded-xl border-l-4 ${styles.bg} ${styles.border} p-4`}
      role="alert"
      aria-live="polite"
      aria-label={`Note de maintenance: ${note.title}`}
    >
      {/* Icon */}
      <span
        className={`material-symbols-outlined text-2xl ${styles.iconColor}`}
        aria-hidden="true"
      >
        {styles.icon}
      </span>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-headline text-headline-sm font-bold text-on-surface">
          {note.title}
        </h3>
        <p className="mt-1 font-body text-body-sm text-on-surface/80">
          {note.message}
        </p>

        {/* Affected courts (optional) */}
        {note.affectedCourts && note.affectedCourts.length > 0 && (
          <p className="mt-2 font-body text-body-sm text-on-surface/60">
            Courts concernés:{' '}
            <span className="font-medium">{note.affectedCourts.join(', ')}</span>
          </p>
        )}
      </div>

      {/* Close Button */}
      {onDismiss && (
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={onDismiss}
          aria-label="Fermer la note de maintenance"
        >
          <span
            className="material-symbols-outlined text-xl text-on-surface/60"
            aria-hidden="true"
          >
            close
          </span>
        </button>
      )}
    </section>
  );
}

export default ClubMaintenanceNote;
