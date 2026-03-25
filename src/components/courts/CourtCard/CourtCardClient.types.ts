/**
 * CourtCardClient type definitions
 */

import type { Court, CourtType } from '../../../types/court.types';

/**
 * Client status type
 */
export type ClientStatus = 'available' | 'limited' | 'unavailable' | 'maintenance';

/**
 * Court card (Client) props
 */
export interface CourtCardClientProps {
  court: Court;
  nextAvailable?: string;
  availableSlots?: number;
  onBook?: (court: Court) => void;
  onViewDetails?: (court: Court) => void;
  className?: string;
}

/**
 * Client status configuration
 */
export interface ClientStatusConfig {
  label: string;
  colorClass: string;
  ctaLabel: string;
}

/**
 * Client status configurations based on court state
 */
export const clientStatusConfig: Record<ClientStatus, ClientStatusConfig> = {
  available: {
    label: 'Disponible',
    colorClass: 'bg-primary-fixed text-on-primary-fixed',
    ctaLabel: 'Réserver',
  },
  limited: {
    label: 'Places limitées',
    colorClass: 'bg-secondary-fixed text-on-secondary-fixed',
    ctaLabel: 'Voir les créneaux',
  },
  unavailable: {
    label: 'Complet',
    colorClass: 'bg-surface-container-high text-on-surface/60',
    ctaLabel: 'Voir demain',
  },
  maintenance: {
    label: 'Maintenance',
    colorClass: 'bg-secondary-fixed text-on-secondary-fixed',
    ctaLabel: 'Bientôt disponible',
  },
};
