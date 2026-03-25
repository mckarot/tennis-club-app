/**
 * StatusBadge type definitions
 *
 * 5 variants per PNG audit:
 * - ACTIVE: bg-primary-fixed (#D1F0E2)
 * - MAINTENANCE: bg-secondary-fixed (#FCE8D8)
 * - OPEN: bg-primary-fixed
 * - IN_PLAY: bg-secondary-fixed
 * - RESERVED: bg-surface-container-high
 */

/**
 * Status badge variant enumeration
 */
export type StatusBadgeVariant = 'ACTIVE' | 'MAINTENANCE' | 'OPEN' | 'IN_PLAY' | 'RESERVED';

/**
 * Status badge props
 */
export interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  withIcon?: boolean;
  className?: string;
}

/**
 * Status badge configuration
 */
export interface StatusBadgeConfig {
  label: string;
  colorClass: string;
  icon: string;
}

/**
 * Status badge configurations per variant
 */
export const statusBadgeConfig: Record<StatusBadgeVariant, StatusBadgeConfig> = {
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
 * Size configurations
 */
export const statusBadgeSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-0.5 text-label-xs gap-1',
  md: 'px-3 py-1 text-label gap-1.5',
  lg: 'px-4 py-1.5 text-body-sm gap-2',
};
