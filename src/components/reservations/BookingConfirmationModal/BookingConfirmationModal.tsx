/**
 * BookingConfirmationModal Component
 *
 * Post-booking summary modal displaying reservation details.
 *
 * @module @components/reservations/BookingConfirmationModal
 */

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Court } from '../../types/court.types';
import type { ReservationType } from '../../types/reservation.types';

export interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  court: Court;
  date: Date;
  startTime: string;
  endTime: string;
  type: ReservationType;
  participants: number;
  reservationId?: string;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Get reservation type label
 */
function getReservationTypeLabel(type: ReservationType): string {
  const labels: Record<ReservationType, string> = {
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

export function BookingConfirmationModal({
  isOpen,
  onClose,
  court,
  date,
  startTime,
  endTime,
  type,
  participants,
  reservationId,
}: BookingConfirmationModalProps): JSX.Element | null {
  const shouldReduceMotion = useReducedMotion();

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const modal = document.getElementById('confirmation-modal');
    const focusableElements = modal?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement | undefined;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement | undefined;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !firstElement || !lastElement) return;

      if (e.shiftKey) {
        // Shift + Tab: go to last element if on first
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: go to first element if on last
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    modal?.addEventListener('keydown', handleTabKey);

    // Focus first element after modal opens
    setTimeout(() => {
      firstElement?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      modal?.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, onClose]);

  const modalVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: shouldReduceMotion ? 0 : 0.3 },
    },
    exit: {
      opacity: shouldReduceMotion ? 1 : 0,
      scale: shouldReduceMotion ? 1 : 0.9,
      transition: { duration: shouldReduceMotion ? 0 : 0.15 },
    },
  };

  if (!isOpen) return null;

  return (
    <div
      id="confirmation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-dim/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      onClick={onClose}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Success Header */}
        <div className="relative bg-primary p-8 text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-on-primary via-transparent transparent" />
          </div>

          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-on-primary/20 mb-4"
            >
              <span className="material-symbols-outlined text-3xl text-on-primary">
                check_circle
              </span>
            </motion.div>

            <h2
              id="confirmation-title"
              className="font-headline text-2xl font-bold text-on-primary"
            >
              Réservation confirmée !
            </h2>
            <p className="font-body text-body-sm text-on-primary/80 mt-2">
              Votre court est réservé
            </p>
          </div>
        </div>

        {/* Reservation Details */}
        <div className="p-6 space-y-4">
          {/* Court Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-high">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-primary">sports_tennis</span>
            </div>
            <div className="flex-1">
              <div className="font-headline text-base font-semibold text-on-surface">
                {court.name}
              </div>
              <div className="font-body text-body-sm text-on-surface-variant">
                {court.type} • {court.surface}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-surface-container-high">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  calendar_today
                </span>
                <span className="font-body text-body-xs text-on-surface-variant">Date</span>
              </div>
              <div className="font-headline text-sm font-semibold text-on-surface">
                {formatDate(date)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-container-high">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  schedule
                </span>
                <span className="font-body text-body-xs text-on-surface-variant">Horaire</span>
              </div>
              <div className="font-headline text-sm font-semibold text-on-surface">
                {startTime} - {endTime}
              </div>
            </div>
          </div>

          {/* Type & Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-surface-container-high">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  category
                </span>
                <span className="font-body text-body-xs text-on-surface-variant">Type</span>
              </div>
              <div className="font-headline text-sm font-semibold text-on-surface">
                {getReservationTypeLabel(type)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-container-high">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  people
                </span>
                <span className="font-body text-body-xs text-on-surface-variant">
                  Participants
                </span>
              </div>
              <div className="font-headline text-sm font-semibold text-on-surface">
                {participants}
              </div>
            </div>
          </div>

          {/* Reservation ID */}
          {reservationId && (
            <div className="p-4 rounded-lg bg-surface-container-high">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  confirmation_number
                </span>
                <span className="font-body text-body-xs text-on-surface-variant">
                  Numéro de réservation
                </span>
              </div>
              <div className="font-mono text-body-sm font-medium text-on-surface">
                {reservationId}
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10">
            <span className="material-symbols-outlined text-primary text-sm">info</span>
            <p className="font-body text-body-sm text-on-surface-variant">
              Un email de confirmation a été envoyé. Pensez à arriver 10 minutes en avance.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            data-confirm-close
            aria-label="Fermer la confirmation"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-body text-body-sm font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default BookingConfirmationModal;
