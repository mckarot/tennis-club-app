/**
 * UpcomingPanel type definitions
 */

import type { Reservation } from '../../../types/reservation.types';

/**
 * Upcoming panel props
 */
export interface UpcomingPanelProps {
  reservations: Reservation[];
  isLoading?: boolean;
  onReservationClick?: (reservation: Reservation) => void;
  onViewAll?: () => void;
  onClose?: () => void;
  className?: string;
  maxDisplay?: number;
}

/**
 * Panel state
 */
export type PanelState = 'loading' | 'empty' | 'has-reservations' | 'error';

/**
 * Empty state configuration
 */
export interface EmptyStateConfig {
  icon: string;
  title: string;
  message: string;
}

/**
 * Empty state configurations
 */
export const emptyStateConfig: Record<'no-reservations' | 'no-today', EmptyStateConfig> = {
  'no-reservations': {
    icon: 'event_busy',
    title: 'Aucune réservation',
    message: 'Vous n\'avez aucune réservation à venir',
  },
  'no-today': {
    icon: 'event_available',
    title: 'Aucune réservation aujourd\'hui',
    message: 'Profitez de votre journée!',
  },
};
