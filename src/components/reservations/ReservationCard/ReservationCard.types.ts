/**
 * ReservationCard type definitions
 */

import type { Reservation, ReservationStatus, ReservationType } from '../../../types/reservation.types';

/**
 * Reservation card props
 */
export interface ReservationCardProps {
  reservation: Reservation;
  onClick?: (reservation: Reservation) => void;
  onCancel?: (reservation: Reservation) => void;
  compact?: boolean;
  className?: string;
  showCourtName?: boolean;
}

/**
 * Reservation status badge configuration
 */
export interface ReservationStatusConfig {
  label: string;
  colorClass: string;
  icon: string;
}

/**
 * Reservation status configurations
 */
export const reservationStatusConfig: Record<ReservationStatus, ReservationStatusConfig> = {
  confirmed: {
    label: 'Confirmé',
    colorClass: 'bg-primary-fixed text-on-primary-fixed',
    icon: 'check_circle',
  },
  pending: {
    label: 'En attente',
    colorClass: 'bg-secondary-fixed text-on-secondary-fixed',
    icon: 'schedule',
  },
  pending_payment: {
    label: 'Paiement en attente',
    colorClass: 'bg-surface-container-high text-on-surface/60',
    icon: 'payment',
  },
  cancelled: {
    label: 'Annulé',
    colorClass: 'bg-surface-container-high text-on-surface/60',
    icon: 'cancel',
  },
  completed: {
    label: 'Terminé',
    colorClass: 'bg-surface-container-high text-on-surface/80',
    icon: 'event_available',
  },
};

/**
 * Reservation type configuration
 */
export interface ReservationTypeConfig {
  label: string;
  icon: string;
}

/**
 * Reservation type configurations
 */
export const reservationTypeConfig: Record<ReservationType, ReservationTypeConfig> = {
  location_libre: {
    label: 'Location libre',
    icon: 'sports_tennis',
  },
  cours_collectif: {
    label: 'Cours collectif',
    icon: 'groups',
  },
  cours_private: {
    label: 'Cours particulier',
    icon: 'person',
  },
  individual: {
    label: 'Simple',
    icon: 'tennis',
  },
  doubles: {
    label: 'Double',
    icon: 'groups',
  },
  training: {
    label: 'Entraînement',
    icon: 'fitness_center',
  },
  tournament: {
    label: 'Tournoi',
    icon: 'emoji_events',
  },
  maintenance: {
    label: 'Maintenance',
    icon: 'build',
  },
};
