/**
 * TimeColumn type definitions
 */

/**
 * Time column props
 */
export interface TimeColumnProps {
  startHour?: number;
  endHour?: number;
  currentHour?: number;
}

/**
 * Default hours configuration
 */
export const DEFAULT_START_HOUR = 6;
export const DEFAULT_END_HOUR = 22;
