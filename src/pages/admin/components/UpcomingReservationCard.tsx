/**
 * UpcomingReservationCard Component
 *
 * Individual reservation card for the sidebar.
 *
 * Features:
 * - Carte individuelle sidebar
 * - Nom utilisateur + court
 * - Horaire + badge status
 * - Menu actions (3 points)
 * - Framer Motion animations
 * - ARIA : role="article"
 *
 * @module @pages/admin/components/UpcomingReservationCard
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import type { Reservation } from '../../../types/reservation.types';
import { ReservationActionsMenu } from './ReservationActionsMenu';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Format timestamp to HH:MM
 */
function formatTime(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status badge color
 */
function getStatusBadgeColor(status: Reservation['status']): string {
  switch (status) {
    case 'confirmed':
      return 'bg-[#006b3f] text-white';
    case 'pending':
      return 'bg-terracotta text-white';
    case 'pending_payment':
      return 'bg-coral text-white';
    case 'cancelled':
      return 'bg-surface-container-high text-on-surface-variant';
    case 'completed':
      return 'bg-primary-container text-on-primary-container';
    default:
      return 'bg-surface-container text-on-surface-variant';
  }
}

/**
 * Get status label
 */
function getStatusLabel(status: Reservation['status']): string {
  const labels: Record<Reservation['status'], string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    pending_payment: 'Pending Payment',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };
  return labels[status];
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export interface UpcomingReservationCardProps {
  reservation: Reservation;
  userName?: string;
  courtName?: string;
  courtNumber?: number;
  onEdit?: (reservation: Reservation) => void;
  onCancel?: (reservation: Reservation) => void;
  onComplete?: (reservation: Reservation) => void;
}

export function UpcomingReservationCard({
  reservation,
  userName = 'Unknown User',
  courtName,
  courtNumber,
  onEdit,
  onCancel,
  onComplete,
}: UpcomingReservationCardProps) {
  return (
    <motion.article
      role="article"
      aria-label={`Reservation ${userName} at ${formatTime(reservation.start_time)}`}
      className="rounded-lg bg-surface-container-low p-4 shadow-sm"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Header: Time and Actions */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-primary">
            schedule
          </span>
          <span className="font-body text-sm font-semibold text-on-surface">
            {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
          </span>
        </div>
        <ReservationActionsMenu
          reservation={reservation}
          onEdit={onEdit}
          onCancel={onCancel}
          onComplete={onComplete}
        />
      </div>

      {/* User Name */}
      <div className="mb-2">
        <p className="font-body text-base font-medium text-on-surface">
          {userName}
        </p>
      </div>

      {/* Court Info */}
      {(courtName || courtNumber) && (
        <div className="mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">
            sports_tennis
          </span>
          <p className="font-body text-sm text-on-surface-variant">
            {courtNumber && `Court ${courtNumber}`}
            {courtName && ` - ${courtName}`}
          </p>
        </div>
      )}

      {/* Footer: Status and Type */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 font-body text-xs font-medium ${getStatusBadgeColor(reservation.status)}`}
        >
          {getStatusLabel(reservation.status)}
        </span>
        <span className="font-body text-xs capitalize text-on-surface-variant">
          {reservation.type.replace('_', ' ')}
        </span>
      </div>
    </motion.article>
  );
}

export default UpcomingReservationCard;
