/**
 * EditReservationModal Component
 *
 * Modal for editing reservation details.
 *
 * Features:
 * - Modal édition (focus trap)
 * - Formulaire : court, date, heure, type, status, participants
 * - Validation temps réel
 * - Escape pour fermer
 * - Framer Motion animations
 * - ARIA : role="dialog", aria-modal="true"
 *
 * @module @pages/admin/components/EditReservationModal
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import type { Reservation, ReservationStatus, ReservationType } from '../../../types/reservation.types';
import type { Court } from '../../../types/court.types';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface EditReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  courts?: Map<string, Court>;
  onSave: (data: {
    court_id: string;
    start_time: Date;
    end_time: Date;
    type: ReservationType;
    status: ReservationStatus;
    participants?: number;
    description?: string;
    moniteur_id?: string;
  }) => Promise<void>;
  isSaving?: boolean;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Format timestamp to date input value (YYYY-MM-DD)
 */
function formatDateInput(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return date.toISOString().split('T')[0];
}

/**
 * Format timestamp to time input value (HH:MM)
 */
function formatTimeInput(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return date.toTimeString().slice(0, 5);
}

/**
 * Combine date and time inputs to Date
 */
function combineDateTime(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function EditReservationModal({
  isOpen,
  onClose,
  reservation,
  courts,
  onSave,
  isSaving = false,
}: EditReservationModalProps) {
  // Form state
  const [courtId, setCourtId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<ReservationType>('location_libre');
  const [status, setStatus] = useState<ReservationStatus>('pending');
  const [participants, setParticipants] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [moniteurId, setMoniteurId] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for focus trap
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLSelectElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  /**
   * Initialize form with reservation data
   */
  useEffect(() => {
    if (reservation) {
      setCourtId(reservation.court_id);
      setDate(formatDateInput(reservation.start_time));
      setStartTime(formatTimeInput(reservation.start_time));
      setEndTime(formatTimeInput(reservation.end_time));
      setType(reservation.type);
      setStatus(reservation.status);
      setParticipants(reservation.participants || 1);
      setDescription(reservation.description || '');
      setMoniteurId(reservation.moniteur_id || '');
    }
  }, [reservation]);

  /**
   * Focus trap and Escape handler
   */
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousActiveElement.current = document.activeElement;

      // Focus first input
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      // Handle Escape key
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        // Restore focus
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!courtId) {
      newErrors.courtId = 'Court is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (participants < 1) {
      newErrors.participants = 'At least 1 participant required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm() || !reservation) {
      return;
    }

    try {
      const startDateTime = combineDateTime(date, startTime);
      const endDateTime = combineDateTime(date, endTime);

      await onSave({
        court_id: courtId,
        start_time: startDateTime,
        end_time: endDateTime,
        type,
        status,
        participants,
        description: description || undefined,
        moniteur_id: moniteurId || undefined,
      });

      onClose();
    } catch (err) {
      console.error('[EditReservationModal] Submit exception:', err);
    }
  };

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !reservation) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-reservation-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          ref={modalRef}
          className="w-full max-w-lg rounded-xl bg-surface-container p-6 shadow-xl"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2
              id="edit-reservation-title"
              className="font-headline text-xl font-bold text-on-surface"
            >
              Edit Reservation
            </h2>
            <button
              onClick={onClose}
              aria-label="Close edit reservation modal"
              className="rounded p-2 transition-colors hover:bg-black/10"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                close
              </span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Court Selection */}
            <div>
              <label
                htmlFor="edit-court"
                className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
              >
                Court
              </label>
              <select
                id="edit-court"
                ref={firstInputRef}
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
                className={`w-full rounded-lg border bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.courtId
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : 'border-outline focus:border-primary'
                }`}
              >
                <option value="">Select a court</option>
                {courts &&
                  Array.from(courts.entries()).map(([id, court]) => (
                    <option key={id} value={id}>
                      Court {court.number} - {court.name}
                    </option>
                  ))}
              </select>
              {errors.courtId && (
                <p className="mt-1 font-body text-xs text-error">{errors.courtId}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="edit-date"
                className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
              >
                Date
              </label>
              <input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-lg border bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.date
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : 'border-outline focus:border-primary'
                }`}
              />
              {errors.date && (
                <p className="mt-1 font-body text-xs text-error">{errors.date}</p>
              )}
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-start-time"
                  className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
                >
                  Start Time
                </label>
                <input
                  id="edit-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full rounded-lg border bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.startTime
                      ? 'border-error focus:border-error focus:ring-error/20'
                      : 'border-outline focus:border-primary'
                  }`}
                />
                {errors.startTime && (
                  <p className="mt-1 font-body text-xs text-error">{errors.startTime}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="edit-end-time"
                  className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
                >
                  End Time
                </label>
                <input
                  id="edit-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full rounded-lg border bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.endTime
                      ? 'border-error focus:border-error focus:ring-error/20'
                      : 'border-outline focus:border-primary'
                  }`}
                />
                {errors.endTime && (
                  <p className="mt-1 font-body text-xs text-error">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-type"
                  className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
                >
                  Type
                </label>
                <select
                  id="edit-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as ReservationType)}
                  className="w-full rounded-lg border border-outline bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="location_libre">Libre</option>
                  <option value="cours_private">Private Lesson</option>
                  <option value="cours_collectif">Group Lesson</option>
                  <option value="individual">Individual</option>
                  <option value="doubles">Doubles</option>
                  <option value="training">Training</option>
                  <option value="tournament">Tournament</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="edit-status"
                  className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
                >
                  Status
                </label>
                <select
                  id="edit-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReservationStatus)}
                  className="w-full rounded-lg border border-outline bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Participants */}
            <div>
              <label
                htmlFor="edit-participants"
                className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
              >
                Participants
              </label>
              <input
                id="edit-participants"
                type="number"
                min="1"
                value={participants}
                onChange={(e) => setParticipants(parseInt(e.target.value, 10) || 0)}
                className={`w-full rounded-lg border bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.participants
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : 'border-outline focus:border-primary'
                }`}
              />
              {errors.participants && (
                <p className="mt-1 font-body text-xs text-error">{errors.participants}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="edit-description"
                className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-outline bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <motion.button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-outline bg-surface-container px-4 py-2.5 font-body text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-primary px-4 py-2.5 font-body text-sm font-medium text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EditReservationModal;
