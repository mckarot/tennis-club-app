/**
 * ViewToggle type definitions
 */

import type { GridViewMode } from '../CourtGrid/CourtGrid.types';

/**
 * View toggle props
 */
export interface ViewToggleProps {
  mode: GridViewMode;
  onModeChange: (mode: GridViewMode) => void;
  className?: string;
}

/**
 * View mode configuration
 */
export interface ViewModeConfig {
  label: string;
  icon: string;
  mode: GridViewMode;
}

/**
 * View modes configuration
 */
export const viewModes: ViewModeConfig[] = [
  {
    label: 'Aujourd\'hui',
    icon: 'today',
    mode: 'today',
  },
  {
    label: 'Semaine',
    icon: 'calendar_month',
    mode: 'weekly',
  },
];
