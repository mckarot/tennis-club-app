/**
 * ReservationActions Component
 *
 * Action buttons for reservation management: Cancel, Reschedule.
 *
 * @module @components/reservations/ReservationActions
 */

import { useState } from 'react';
import { ConfirmDialog } from '../../shared/ConfirmDialog/ConfirmDialog';
import type { Reservation } from '../../types/reservation.types';

export interface ReservationActionsProps {
  reservation: Reservation;
  onReschedule?: () => void;
  onCancel?: () => void;
  showReschedule?: boolean;
  showCancel?: boolean;
  isLoading?: boolean;
}

export function ReservationActions({
  reservation,
  onReschedule,
  onCancel,
  showReschedule = true,
  showCancel = true,
  isLoading = false,
}: ReservationActionsProps): JSX.Element | null {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const hasActions = showReschedule || showCancel;

  if (!hasActions) return null;

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel?.();
      setShowCancelDialog(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="flex gap-3 pt-4 border-t border-surface-container-highest">
        {showReschedule && onReschedule && (
          <button
            onClick={onReschedule}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-body text-body-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Reschedule reservation ${reservation.id}`}
          >
            <span className="material-symbols-outlined text-sm">edit_calendar</span>
            Modifier
          </button>
        )}

        {showCancel && onCancel && (
          <button
            onClick={handleCancelClick}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-body text-body-sm font-medium bg-error-container/20 text-error hover:bg-error-container/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Cancel reservation ${reservation.id}`}
          >
            <span className="material-symbols-outlined text-sm">cancel</span>
            Annuler
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleConfirmCancel}
        title="Annuler la réservation"
        message="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée."
        confirmLabel="Annuler la réservation"
        isLoading={isCancelling}
      />
    </>
  );
}

export default ReservationActions;
