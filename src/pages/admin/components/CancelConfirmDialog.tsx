/**
 * CancelConfirmDialog Component
 *
 * Confirmation dialog for reservation cancellation.
 *
 * Features:
 * - Dialog confirmation annulation
 * - Champ reason (optionnel)
 * - Toggle sendNotification
 * - Boutons Cancel / Confirm
 * - Focus trap
 * - Escape handler
 * - Framer Motion animations
 * - ARIA : role="alertdialog"
 *
 * @module @pages/admin/components/CancelConfirmDialog
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Reservation } from '../../../types/reservation.types';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface CancelConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onConfirm: (reason: string, sendNotification: boolean) => Promise<void>;
  isConfirming?: boolean;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function CancelConfirmDialog({
  isOpen,
  onClose,
  reservation,
  onConfirm,
  isConfirming = false,
}: CancelConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  // Refs for focus trap
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  /**
   * Reset form when dialog opens
   */
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setSendNotification(true);
    }
  }, [isOpen]);

  /**
   * Focus trap and Escape handler
   */
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousActiveElement.current = document.activeElement;

      // Focus confirm button
      setTimeout(() => {
        confirmButtonRef.current?.focus();
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
   * Handle confirmation
   */
  const handleConfirm = async () => {
    try {
      await onConfirm(reason, sendNotification);
      onClose();
    } catch (err) {
      console.error('[CancelConfirmDialog] Confirm exception:', err);
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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          ref={dialogRef}
          className="w-full max-w-md rounded-xl bg-surface-container p-6 shadow-xl"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
        >
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
              <span className="material-symbols-outlined text-2xl text-error">
                warning
              </span>
            </div>
          </div>

          {/* Title */}
          <h2
            id="cancel-dialog-title"
            className="mb-2 text-center font-headline text-xl font-bold text-on-surface"
          >
            Cancel Reservation?
          </h2>

          {/* Description */}
          <p
            id="cancel-dialog-description"
            className="mb-6 text-center font-body text-sm text-on-surface-variant"
          >
            Are you sure you want to cancel this reservation? This action cannot
            be undone.
          </p>

          {/* Reservation Info */}
          <div className="mb-6 rounded-lg bg-surface-container-high p-4">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-sm">event</span>
              <span className="font-body text-sm font-medium">
                {reservation.type.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="font-body text-sm">
                {reservation.start_time.toDate().toLocaleString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="mb-4">
            <label
              htmlFor="cancel-reason"
              className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
            >
              Cancellation Reason (optional)
            </label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Please provide a reason for cancellation..."
              className="w-full rounded-lg border border-outline bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Send Notification Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-on-surface">
                Send Notification
              </p>
              <p className="font-body text-xs text-on-surface-variant">
                Notify the user about this cancellation
              </p>
            </div>
            <button
              role="switch"
              aria-checked={sendNotification}
              onClick={() => setSendNotification(!sendNotification)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                sendNotification ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  sendNotification ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
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
              ref={confirmButtonRef}
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="rounded-lg bg-error px-4 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isConfirming ? 'Cancelling...' : 'Confirm Cancellation'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CancelConfirmDialog;
