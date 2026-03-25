/**
 * AvailabilityLegend type definitions
 */

import type { CourtType } from '../../../types/court.types';
import type { TimeSlotState } from '../TimeSlotCell/TimeSlotCell.types';

/**
 * Legend item interface
 */
export interface LegendItem {
  id: string;
  label: string;
  state: TimeSlotState;
  courtType?: CourtType;
  colorClass: string;
}

/**
 * Availability legend props
 */
export interface AvailabilityLegendProps {
  items?: LegendItem[];
  className?: string;
}

/**
 * Default legend items based on PNG audit
 */
export const defaultLegendItems: LegendItem[] = [
  {
    id: 'available',
    label: 'Libre',
    state: 'available',
    colorClass: 'bg-surface-container-high border border-surface-container-highest',
  },
  {
    id: 'confirmed-quick',
    label: 'Confirmé Quick',
    state: 'confirmed',
    courtType: 'Quick',
    colorClass: 'bg-primary',
  },
  {
    id: 'confirmed-terre',
    label: 'Confirmé Terre',
    state: 'confirmed',
    courtType: 'Terre',
    colorClass: 'bg-secondary',
  },
  {
    id: 'pending',
    label: 'En attente',
    state: 'pending',
    colorClass: 'bg-primary/50',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    state: 'maintenance',
    colorClass: 'bg-surface-dim/40 border-dashed border-surface-container-highest',
  },
];
