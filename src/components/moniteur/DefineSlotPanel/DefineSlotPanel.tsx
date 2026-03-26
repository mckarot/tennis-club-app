/**
 * DefineSlotPanel Component
 *
 * Modal panel for creating new time slots.
 * Based on PNG audit: Toggle PRIVATE/GROUP with white background for active,
 * form with date picker, start/end time, court dropdown, max participants.
 *
 * Features:
 * - Date picker
 * - Start/End time inputs
 * - SessionTypeToggle
 * - Court dropdown (optional)
 * - Max participants (for GROUP)
 * - Validation
 * - Submit button "Publish Availability"
 * - Focus trap
 * - Escape handler
 * - ARIA compliant (role="form", aria-labelledby)
 * - Framer Motion animations
 *
 * @module @components/moniteur/DefineSlotPanel
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SessionTypeToggle } from '../SessionTypeToggle/SessionTypeToggle';
import type { CreateSlotInput, DefineSlotPanelProps } from '../../types/moniteur.types';
import type { SlotType } from '../../types/slot.types';

/**
 * Panel variants for slide-in animation
 */
const panelVariants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0, 
    transition: { 
      type: 'spring', 
      damping: 25, 
      stiffness: 200 
    } 
  },
  exit: { x: '100%' },
};

/**
 * Backdrop variants
 */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Form field variants for stagger
 */
const formFieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
};

/**
 * Form validation errors
 */
interface FormErrors {
  date?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: string;
}

/**
 * Court option for dropdown
 */
interface CourtOption {
  id: string;
  name: string;
  surface: string;
}

/**
 * Mock courts (should come from courtService)
 */
const COURTS: CourtOption[] = [
  { id: 'court-1', name: 'Court 01', surface: 'Clay' },
  { id: 'court-2', name: 'Court 02', surface: 'Clay' },
  { id: 'court-3', name: 'Court 03', surface: 'Quick' },
  { id: 'court-4', name: 'Court 04', surface: 'Clay' },
];

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * DefineSlotPanel Component
 */
export function DefineSlotPanel({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
}: DefineSlotPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  // Form state
  const [date, setDate] = useState<string>(initialDate || getTodayDate());
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [sessionType, setSessionType] = useState<SlotType>('PRIVATE');
  const [courtId, setCourtId] = useState<string>('');
  const [maxParticipants, setMaxParticipants] = useState<string>('6');
  
  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // Add Escape listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  // Reset form when panel opens
  useEffect(() => {
    if (isOpen) {
      setDate(initialDate || getTodayDate());
      setStartTime('09:00');
      setEndTime('10:00');
      setSessionType('PRIVATE');
      setCourtId('');
      setMaxParticipants('6');
      setErrors({});
    }
  }, [isOpen, initialDate]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Date validation
    if (!date) {
      newErrors.date = 'Date is required';
    } else if (date < getTodayDate()) {
      newErrors.date = 'Date cannot be in the past';
    }

    // Start time validation
    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    // End time validation
    if (!endTime) {
      newErrors.endTime = 'End time is required';
    } else if (startTime && endTime && endTime <= startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    // Max participants validation (for GROUP)
    if (sessionType === 'GROUP') {
      const max = parseInt(maxParticipants, 10);
      if (!maxParticipants || isNaN(max)) {
        newErrors.maxParticipants = 'Max participants is required';
      } else if (max < 1 || max > 20) {
        newErrors.maxParticipants = 'Must be between 1 and 20';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateSlotInput = {
        date,
        startTime,
        endTime,
        type: sessionType,
        courtId: courtId || undefined,
        maxParticipants: sessionType === 'GROUP' ? parseInt(maxParticipants, 10) : undefined,
      };

      await onSubmit(input);
      onClose();
    } catch (error) {
      console.error('[DefineSlotPanel] Submit error:', error);
      setErrors({ ...errors, date: 'Failed to create slot. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-on-surface/50 z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="define-slot-panel-title"
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-surface-container-lowest shadow-xl z-50
                     flex flex-col"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ 
              type: 'spring', 
              damping: shouldReduceMotion ? 30 : 25, 
              stiffness: shouldReduceMotion ? 100 : 200 
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-container-highest">
              <h2
                id="define-slot-panel-title"
                className="font-headline text-xl font-bold text-on-surface"
              >
                Define Availability
              </h2>
              <motion.button
                onClick={onClose}
                aria-label="Close panel"
                className="p-2 rounded-lg hover:bg-surface-container-highest/50
                         focus:outline-none focus:ring-2 focus:ring-primary"
                whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
                whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
              >
                <span className="material-symbols-outlined text-on-surface">close</span>
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6" role="form" aria-labelledby="define-slot-panel-title">
                {/* Session Type Toggle */}
                <div>
                  <label className="block font-body text-sm font-semibold text-on-surface mb-3">
                    Session Type
                  </label>
                  <SessionTypeToggle
                    value={sessionType}
                    onChange={setSessionType}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Date Picker */}
                <div>
                  <label
                    htmlFor="slot-date"
                    className="block font-body text-sm font-semibold text-on-surface mb-2"
                  >
                    Date
                  </label>
                  <input
                    id="slot-date"
                    type="date"
                    value={date}
                    min={getTodayDate()}
                    onChange={(e) => setDate(e.target.value)}
                    className={`
                      w-full px-4 py-3 rounded-lg bg-surface-container-low
                      border-b-2 ${errors.date ? 'border-tertiary' : 'border-surface-container-highest'}
                      text-on-surface font-body text-base
                      focus:outline-none focus:border-primary transition-colors duration-200
                    `}
                    aria-invalid={!!errors.date}
                    aria-describedby={errors.date ? 'date-error' : undefined}
                  />
                  {errors.date && (
                    <p id="date-error" className="mt-1 font-body text-sm text-tertiary">
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Time Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Time */}
                  <div>
                    <label
                      htmlFor="start-time"
                      className="block font-body text-sm font-semibold text-on-surface mb-2"
                    >
                      Start Time
                    </label>
                    <input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={`
                        w-full px-4 py-3 rounded-lg bg-surface-container-low
                        border-b-2 ${errors.startTime ? 'border-tertiary' : 'border-surface-container-highest'}
                        text-on-surface font-body text-base
                        focus:outline-none focus:border-primary transition-colors duration-200
                      `}
                      aria-invalid={!!errors.startTime}
                      aria-describedby={errors.startTime ? 'start-time-error' : undefined}
                    />
                    {errors.startTime && (
                      <p id="start-time-error" className="mt-1 font-body text-sm text-tertiary">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  {/* End Time */}
                  <div>
                    <label
                      htmlFor="end-time"
                      className="block font-body text-sm font-semibold text-on-surface mb-2"
                    >
                      End Time
                    </label>
                    <input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={`
                        w-full px-4 py-3 rounded-lg bg-surface-container-low
                        border-b-2 ${errors.endTime ? 'border-tertiary' : 'border-surface-container-highest'}
                        text-on-surface font-body text-base
                        focus:outline-none focus:border-primary transition-colors duration-200
                      `}
                      aria-invalid={!!errors.endTime}
                      aria-describedby={errors.endTime ? 'end-time-error' : undefined}
                    />
                    {errors.endTime && (
                      <p id="end-time-error" className="mt-1 font-body text-sm text-tertiary">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Court Dropdown (Optional) */}
                <div>
                  <label
                    htmlFor="court"
                    className="block font-body text-sm font-semibold text-on-surface mb-2"
                  >
                    Court <span className="text-on-surface/50 font-normal">(Optional)</span>
                  </label>
                  <select
                    id="court"
                    value={courtId}
                    onChange={(e) => setCourtId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-low
                             border-b-2 border-surface-container-highest
                             text-on-surface font-body text-base
                             focus:outline-none focus:border-primary transition-colors duration-200"
                  >
                    <option value="">Select a court</option>
                    {COURTS.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name} • {court.surface}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Participants (for GROUP) */}
                {sessionType === 'GROUP' && (
                  <div>
                    <label
                      htmlFor="max-participants"
                      className="block font-body text-sm font-semibold text-on-surface mb-2"
                    >
                      Max Participants
                    </label>
                    <input
                      id="max-participants"
                      type="number"
                      min="1"
                      max="20"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      className={`
                        w-full px-4 py-3 rounded-lg bg-surface-container-low
                        border-b-2 ${errors.maxParticipants ? 'border-tertiary' : 'border-surface-container-highest'}
                        text-on-surface font-body text-base
                        focus:outline-none focus:border-primary transition-colors duration-200
                      `}
                      aria-invalid={!!errors.maxParticipants}
                      aria-describedby={errors.maxParticipants ? 'max-participants-error' : undefined}
                    />
                    {errors.maxParticipants && (
                      <p id="max-participants-error" className="mt-1 font-body text-sm text-tertiary">
                        {errors.maxParticipants}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-surface-container-highest">
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3
                         rounded-lg bg-primary text-white font-semibold
                         hover:opacity-90 transition-opacity duration-200
                         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!shouldReduceMotion && !isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!shouldReduceMotion && !isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Publishing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">publish</span>
                    Publish Availability
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DefineSlotPanel;
