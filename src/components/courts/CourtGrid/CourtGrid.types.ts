/**
 * CourtGrid type definitions
 */

import type { CourtType } from '../../../types/court.types';
import type { ReservationStatus, ReservationType } from '../../../types/reservation.types';

/**
 * Grid view mode enumeration
 */
export type GridViewMode = 'today' | 'weekly';

/**
 * Time slot state enumeration (4 states per PNG audit)
 */
export type TimeSlotState = 'available' | 'confirmed' | 'pending' | 'maintenance';

/**
 * Court grid cell data
 */
export interface GridCell {
  courtId: string;
  courtNumber: number;
  courtType: CourtType;
  hour: number;
  date: Date;
  state: TimeSlotState;
  reservationId?: string;
  onClick?: () => void;
}

/**
 * Court header props
 */
export interface CourtHeaderProps {
  courtNumber: number;
  courtName: string;
  courtType: CourtType;
  isActive: boolean;
}

/**
 * Time column props
 */
export interface TimeColumnProps {
  startHour?: number;
  endHour?: number;
}

/**
 * View toggle props
 */
export interface ViewToggleProps {
  mode: GridViewMode;
  onModeChange: (mode: GridViewMode) => void;
}

/**
 * Availability legend item
 */
export interface LegendItem {
  label: string;
  state: TimeSlotState;
  courtType?: CourtType;
}

/**
 * Availability legend props
 */
export interface AvailabilityLegendProps {
  items?: LegendItem[];
}

/**
 * Court grid props
 */
export interface CourtGridProps {
  courts: GridCell[][];
  viewMode: GridViewMode;
  onViewModeChange?: (mode: GridViewMode) => void;
  onSlotClick?: (cell: GridCell) => void;
  isLoading?: boolean;
  startDate?: Date;
}

/**
 * Time slot style configuration
 */
export interface TimeSlotStyleConfig {
  base: string;
  state: Record<TimeSlotState, string>;
}
