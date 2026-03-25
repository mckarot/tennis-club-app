/**
 * CourtCard (Admin) type definitions
 */

import type { Court, CourtStatus, CourtType, SurfaceType } from '../../../types/court.types';

/**
 * Court card (Admin) props
 */
export interface CourtCardAdminProps {
  court: Court;
  onEdit?: (court: Court) => void;
  onToggleMaintenance?: (courtId: string, isMaintenance: boolean) => void;
  onToggleActive?: (courtId: string, isActive: boolean) => void;
  className?: string;
}

/**
 * Court status badge configuration (5 variants per PNG)
 */
export type AdminCourtStatus = 'ACTIVE' | 'MAINTENANCE' | 'OPEN' | 'IN_PLAY' | 'RESERVED';

/**
 * Status badge configuration
 */
export interface StatusBadgeConfig {
  label: string;
  colorClass: string;
  icon: string;
}

/**
 * Status badge configurations
 */
export const adminStatusConfig: Record<AdminCourtStatus, StatusBadgeConfig> = {
  ACTIVE: {
    label: 'Actif',
    colorClass: 'bg-primary-fixed text-on-primary-fixed',
    icon: 'check_circle',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    colorClass: 'bg-secondary-fixed text-on-secondary-fixed',
    icon: 'build',
  },
  OPEN: {
    label: 'Ouvert',
    colorClass: 'bg-primary-fixed text-on-primary-fixed',
    icon: 'door_open',
  },
  IN_PLAY: {
    label: 'En jeu',
    colorClass: 'bg-secondary-fixed text-on-secondary-fixed',
    icon: 'sports_tennis',
  },
  RESERVED: {
    label: 'Réservé',
    colorClass: 'bg-surface-container-high text-on-surface',
    icon: 'event',
  },
};

/**
 * Map CourtStatus to AdminCourtStatus
 */
export function mapCourtStatusToAdmin(status: CourtStatus, isActive: boolean): AdminCourtStatus {
  if (!isActive) {
    return 'MAINTENANCE';
  }
  if (status === 'active') {
    return 'ACTIVE';
  }
  if (status === 'maintenance') {
    return 'MAINTENANCE';
  }
  return 'OPEN';
}
