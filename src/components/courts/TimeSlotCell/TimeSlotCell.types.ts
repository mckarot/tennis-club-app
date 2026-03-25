/**
 * TimeSlotCell type definitions
 *
 * Defines the 4 states per PNG audit:
 * - available: Libre (bg-surface-container-high)
 * - confirmed: Réservé (bg-primary for Quick, bg-secondary for Terre)
 * - pending: En attente (bg-primary/50)
 * - maintenance: Indisponible (bg-surface-dim/40 + border-dashed)
 */

import type { CourtType } from '../../../types/court.types';

/**
 * Time slot state enumeration (4 states)
 */
export type TimeSlotState = 'available' | 'confirmed' | 'pending' | 'maintenance';

/**
 * Time slot cell props
 */
export interface TimeSlotCellProps {
  hour: number;
  state: TimeSlotState;
  courtType?: CourtType;
  onClick?: () => void;
  label?: string;
}

/**
 * Time slot style configuration per state
 * Uses Tailwind design system tokens
 */
export const timeSlotStateStyles: Record<TimeSlotState, string> = {
  available: 'bg-surface-container-high hover:border-primary/30 border border-surface-container-highest text-on-surface',
  confirmed: 'bg-primary text-on-primary hover:scale-105',
  pending: 'bg-primary/50 text-on-primary hover:scale-105',
  maintenance: 'bg-surface-dim/40 border-dashed border-surface-container-highest text-on-surface/40',
};

/**
 * Get state style based on state and court type
 */
export function getTimeSlotStyle(state: TimeSlotState, courtType?: CourtType): string {
  const baseStyle = timeSlotStateStyles[state];

  // Confirmed slots use different colors based on court type
  if (state === 'confirmed') {
    if (courtType === 'Terre') {
      return 'bg-secondary text-on-secondary hover:scale-105';
    }
    return baseStyle;
  }

  return baseStyle;
}

/**
 * State label mapping
 */
export const stateLabels: Record<TimeSlotState, string> = {
  available: 'Libre',
  confirmed: 'Réservé',
  pending: 'En attente',
  maintenance: 'Maintenance',
};

/**
 * State icon mapping
 */
export const stateIcons: Record<TimeSlotState, string> = {
  available: 'check_circle',
  confirmed: 'sports_tennis',
  pending: 'schedule',
  maintenance: 'build',
};
