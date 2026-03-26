/**
 * ReservationCell Component
 *
 * Individual reservation cell in the calendar grid.
 * Displays reservation info with color coding by type.
 *
 * Features:
 * - Couleur selon type (PRO #006b3f, GROUP #9d431b, Libre #f0f5ee)
 * - Border-l-4 pour court deployment
 * - Nom utilisateur/moniteur
 * - Horaire (start_time - end_time)
 * - Badge status
 * - Framer Motion hover effects
 * - ARIA : role="article"
 *
 * @module @pages/admin/components/ReservationCell
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import type { Reservation, ReservationStatus, ReservationType } from '../../../types/reservation.types';
import { ReservationActionsMenu } from './ReservationActionsMenu';

// ==========================================
// COLOR TOKENS (Audit PNG - Étape 0)
// ==========================================

/**
 * Get background color by reservation type
 * Audit PNG colors:
 * - PRO: #006b3f → bg-[#006b3f] text-white
 * - GROUP: #9d431b → bg-[#9d431b] text-white
 * - Libre: #f0f5ee → bg-[#f0f5ee] text-on-surface
 */
function getTypeColors(type: ReservationType): { bg: string; text: string } {
  switch (type) {
    case 'cours_private':
    case 'cours_collectif':
      return { bg: 'bg-[#006b3f]', text: 'text-white' }; // PRO
    case 'location_libre':
      return { bg: 'bg-[#f0f5ee]', text: 'text-on-surface' }; // Libre
    case 'individual':
    case 'doubles':
      return { bg: 'bg-[#006b3f]', text: 'text-white' }; // PRO
    case 'training':
    case 'tournament':
      return { bg: 'bg-[#9d431b]', text: 'text-white' }; // GROUP
    case 'maintenance':
      return { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' };
    default:
      return { bg: 'bg-surface-container', text: 'text-on-surface' };
  }
}

/**
 * Get status badge color
 */
function getStatusBadgeColor(status: ReservationStatus): string {
  switch (status) {
    case 'confirmed':
      return 'bg-[#006b3f] text-white'; // Mint green
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
 * Get status label
 */
function getStatusLabel(status: ReservationStatus): string {
  const labels: Record<ReservationStatus, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    pending_payment: 'Pending Payment',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };
  return labels[status];
}

export interface ReservationCellProps {
  reservation: Reservation;
  userName?: string;
  moniteurName?: string;
  courtName?: string;
  onEdit?: (reservation: Reservation) => void;
  onCancel?: (reservation: Reservation) => void;
  onComplete?: (reservation: Reservation) => void;
}

export function ReservationCell({
  reservation,
  userName,
  moniteurName,
  courtName,
  onEdit,
  onCancel,
  onComplete,
}: ReservationCellProps) {
  const colors = getTypeColors(reservation.type);

  return (
    <motion.article
      role="article"
      aria-label={`Reservation ${userName || 'Unknown'} at ${formatTime(reservation.start_time)}`}
      className={`relative h-full rounded-lg ${colors.bg} ${colors.text} p-3 shadow-sm border-l-4 border-primary`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Header: Time */}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-body text-xs font-semibold">
          {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
        </span>
        <ReservationActionsMenu
          reservation={reservation}
          onEdit={onEdit}
          onCancel={onCancel}
          onComplete={onComplete}
        />
      </div>

      {/* User/Moniteur Name */}
      <div className="mb-1">
        <p className="font-body text-sm font-medium">
          {userName || 'Unknown User'}
        </p>
        {moniteurName && (
          <p className="font-body text-xs opacity-80">
            with {moniteurName}
          </p>
        )}
      </div>

      {/* Court Name */}
      {courtName && (
        <p className="mb-2 font-body text-xs opacity-80">
          Court: {courtName}
        </p>
      )}

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-body text-xs font-medium ${getStatusBadgeColor(reservation.status)}`}
        >
          {getStatusLabel(reservation.status)}
        </span>

        {/* Type indicator */}
        <span className="font-body text-xs opacity-70">
          {reservation.type.replace('_', ' ')}
        </span>
      </div>
    </motion.article>
  );
}

export default ReservationCell;
