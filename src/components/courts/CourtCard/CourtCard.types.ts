import type { CourtStatus as CourtStatusType } from '../../../types/court.types';
import type { BadgeVariant } from '../../ui/Badge/Badge.types';

export interface StatusBadgeConfig {
  label: string;
  variant: BadgeVariant;
  withDot: boolean;
}

export const statusBadgeConfig: Record<CourtStatusType, StatusBadgeConfig> = {
  active: {
    label: 'Actif',
    variant: 'success',
    withDot: true,
  },
  maintenance: {
    label: 'Maintenance',
    variant: 'warning',
    withDot: true,
  },
  closed: {
    label: 'Fermé',
    variant: 'danger',
    withDot: true,
  },
};
