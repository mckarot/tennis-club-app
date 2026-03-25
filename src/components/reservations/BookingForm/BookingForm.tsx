/**
 * BookingForm Component
 *
 * 3-step wizard modal for court booking:
 * 1. Select date
 * 2. Select court
 * 3. Select time slot
 *
 * @module @components/reservations/BookingForm
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useBooking, type TimeSlot } from '../../hooks/useBooking';
import { CourtSelector } from './CourtSelector/CourtSelector';
import type { Court } from '../../types/court.types';
import type { ReservationType } from '../../types/reservation.types';

export interface BookingFormProps {
  courts: Court[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface BookingFormData {
  court: Court;
  date: Date;
  timeSlot: TimeSlot;
  type: ReservationType;
  participants: number;
  notes: string;
}

const RESERVATION_TYPES: { value: ReservationType; label: string; icon: string }[] = [
  { value: 'location_libre', label: 'Location libre', icon: 'sports_tennis' },
  { value: 'cours_collectif', label: 'Cours collectif', icon: 'groups' },
  { value: 'cours_private', label: 'Cours particulier', icon: 'person' },
  { value: 'doubles', label: 'Doubles', icon: 'people' },
  { value: 'training', label: 'Entraînement', icon: 'fitness_center' },
];

const TIME_SLOTS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

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
 * Format hour for display
 */
function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

/**
 * Generate next 14 days
 */
function generateAvailableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function BookingForm({
  courts,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: BookingFormProps): JSX.Element | null {
  const shouldReduceMotion = useReducedMotion();
  const booking = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableDates = generateAvailableDates();

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const modal = document.getElementById('booking-modal');
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

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      booking.reset();
      setError(null);
    }
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    booking.selectDate(date);
    setError(null);
  };

  const handleCourtSelect = (court: Court) => {
    booking.selectCourt(court);
    setError(null);
  };

  const handleTimeSelect = (hour: number) => {
    if (!booking.state.selectedCourt || !booking.state.selectedDate) return;

    const start = new Date(booking.state.selectedDate);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(hour + 1, 0, 0, 0);

    const slot: TimeSlot = {
      start,
      end,
      available: true,
    };

    booking.selectTimeSlot(slot);
    setError(null);
  };

  const handleSubmit = async () => {
    const data = booking.getBookingData();
    if (!data) {
      setError('Informations de réservation incomplètes');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        court: data.court,
        date: data.date,
        timeSlot: data.timeSlot,
        type: data.type,
        participants: data.participants,
        notes: data.notes,
      });
      booking.reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: shouldReduceMotion ? 0 : 0.2 },
    },
    exit: {
      opacity: shouldReduceMotion ? 1 : 0,
      scale: shouldReduceMotion ? 1 : 0.95,
      transition: { duration: shouldReduceMotion ? 0 : 0.15 },
    },
  };

  const stepVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3 },
    },
    exit: {
      opacity: shouldReduceMotion ? 1 : 0,
      x: shouldReduceMotion ? 0 : -20,
      transition: { duration: shouldReduceMotion ? 0 : 0.15 },
    },
  };

  if (!isOpen) return null;

  return (
    <div
      id="booking-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-dim/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-form-title"
      onClick={onClose}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-surface-container-highest bg-surface-container-lowest">
          <div>
            <h2
              id="booking-form-title"
              className="font-headline text-xl font-bold text-on-surface"
            >
              Réserver un court
            </h2>
            <p className="font-body text-body-sm text-on-surface-variant mt-1">
              Étape {booking.currentStep === 'date' ? '1' : booking.currentStep === 'court' ? '2' : '3'} sur 3
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            data-booking-focus
            className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {(['date', 'court', 'time'] as const).map((step, index) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  booking.state.currentStep === step
                    ? 'bg-primary'
                    : index < ['date', 'court', 'time'].indexOf(booking.state.currentStep)
                    ? 'bg-primary/50'
                    : 'bg-surface-container-high'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Date Selection */}
            {booking.currentStep === 'date' && (
              <motion.div
                key="date-step"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
                className="space-y-4"
              >
                <h3 className="font-headline text-lg font-semibold text-on-surface">
                  Sélectionnez une date
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableDates.map((date, index) => {
                    const isSelected = booking.state.selectedDate?.toDateString() === date.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        aria-label={`Select ${formatDate(date)}`}
                        aria-pressed={isSelected}
                        className={`
                          p-4 rounded-xl border transition-all duration-200
                          ${
                            isSelected
                              ? 'bg-primary border-primary text-on-primary'
                              : 'bg-surface-container-high border-surface-container-highest text-on-surface hover:border-primary/30'
                          }
                        `}
                      >
                        <div className="font-body text-body-xs uppercase text-center">
                          {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div className="font-headline text-2xl font-bold text-center mt-1">
                          {date.getDate()}
                        </div>
                        <div className="font-body text-body-xs text-center mt-1 opacity-70">
                          {date.toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                        {isToday && (
                          <div className="font-body text-body-xs text-center mt-2 opacity-70">
                            Aujourd'hui
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Court Selection */}
            {booking.currentStep === 'court' && (
              <motion.div
                key="court-step"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
                className="space-y-4"
              >
                <h3 className="font-headline text-lg font-semibold text-on-surface">
                  Sélectionnez un court
                </h3>
                <div className="p-4 bg-surface-container-high rounded-lg">
                  <p className="font-body text-body-sm text-on-surface-variant">
                    Date sélectionnée:{' '}
                    <span className="font-medium text-on-surface">
                      {booking.state.selectedDate && formatDate(booking.state.selectedDate)}
                    </span>
                  </p>
                </div>
                <CourtSelector
                  courts={courts}
                  selectedCourt={booking.state.selectedCourt}
                  onCourtSelect={handleCourtSelect}
                  label="Court"
                />
              </motion.div>
            )}

            {/* Step 3: Time Slot Selection */}
            {booking.currentStep === 'time' && (
              <motion.div
                key="time-step"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-headline text-lg font-semibold text-on-surface">
                    Sélectionnez un horaire
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="font-body text-body-sm text-on-surface-variant">
                      Court:{' '}
                      <span className="font-medium text-on-surface">
                        {booking.state.selectedCourt?.name}
                      </span>
                    </p>
                    <p className="font-body text-body-sm text-on-surface-variant">
                      Date:{' '}
                      <span className="font-medium text-on-surface">
                        {booking.state.selectedDate && formatDate(booking.state.selectedDate)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Time Slots Grid */}
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {TIME_SLOTS.map((hour) => {
                    const isSelected = booking.state.selectedTimeSlot?.start.getHours() === hour;

                    return (
                      <button
                        key={hour}
                        onClick={() => handleTimeSelect(hour)}
                        aria-label={`Select ${formatHour(hour)}`}
                        aria-pressed={isSelected}
                        className={`
                          p-3 rounded-lg font-body text-sm font-medium transition-all duration-200
                          ${
                            isSelected
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-high text-on-surface hover:border-primary/30 border border-surface-container-highest'
                          }
                        `}
                      >
                        {formatHour(hour)}
                      </button>
                    );
                  })}
                </div>

                {/* Reservation Type */}
                <div>
                  <label className="block font-body text-body-sm font-medium text-on-surface-variant mb-2">
                    Type de réservation
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {RESERVATION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => booking.setReservationType(type.value)}
                        aria-pressed={booking.state.reservationType === type.value}
                        className={`
                          flex items-center gap-2 p-3 rounded-lg transition-all duration-200
                          ${
                            booking.state.reservationType === type.value
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'bg-surface-container-high border-2 border-transparent hover:border-surface-container-highest'
                          }
                        `}
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${
                            booking.state.reservationType === type.value
                              ? 'text-primary'
                              : 'text-on-surface-variant'
                          }`}
                        >
                          {type.icon}
                        </span>
                        <span
                          className={`font-body text-body-sm ${
                            booking.state.reservationType === type.value
                              ? 'text-primary font-medium'
                              : 'text-on-surface-variant'
                          }`}
                        >
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <label className="block font-body text-body-sm font-medium text-on-surface-variant mb-2">
                    Nombre de participants
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => booking.setParticipants(booking.state.participants - 1)}
                      aria-label="Decrease participants"
                      disabled={booking.state.participants <= 1}
                      className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="font-headline text-2xl font-bold text-on-surface min-w-12 text-center">
                      {booking.state.participants}
                    </span>
                    <button
                      onClick={() => booking.setParticipants(booking.state.participants + 1)}
                      aria-label="Increase participants"
                      className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="booking-notes"
                    className="block font-body text-body-sm font-medium text-on-surface-variant mb-2"
                  >
                    Notes (optionnel)
                  </label>
                  <textarea
                    id="booking-notes"
                    value={booking.state.notes}
                    onChange={(e) => booking.setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-4 rounded-lg bg-surface-container-high border border-surface-container-highest text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ajoutez des notes..."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mt-4 flex items-center gap-2 p-4 rounded-lg bg-error-container text-on-error-container"
            >
              <span className="material-symbols-outlined">error</span>
              <span className="font-body text-body-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex items-center justify-between p-6 border-t border-surface-container-highest bg-surface-container-lowest">
          <button
            onClick={booking.canGoBack ? booking.prevStep : onClose}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-body text-body-sm font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            {booking.canGoBack ? 'Retour' : 'Annuler'}
          </button>

          {booking.currentStep === 'time' ? (
            <button
              onClick={handleSubmit}
              disabled={!booking.canProceed || isSubmitting || isLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-body text-body-sm font-medium bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting || isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Réservation...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  Confirmer
                </>
              )}
            </button>
          ) : (
            <button
              onClick={booking.nextStep}
              disabled={!booking.canProceed}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-body text-body-sm font-medium bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continuer
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default BookingForm;
