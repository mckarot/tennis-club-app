/**
 * CourtGridCell Component
 * 
 * Individual court grid cell with 4 states per PNG audit:
 * - available (green)
 * - confirmed (blue)
 * - maintenance (gray)
 * - pending (yellow)
 * 
 * Court badges: QUICK=primary-fixed, TERRE=secondary-fixed
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { CourtGridCellProps, CourtCellState, CourtType } from '../../../types/client-dashboard.types';

// ==========================================
// STYLE CONFIGURATION
// ==========================================

/**
 * Get cell style based on state
 */
const getCellStyle = (state: CourtCellState): string => {
  const styles: Record<CourtCellState, string> = {
    available: `
      bg-success-container/20
      border-2 border-success-container
      text-on-success-container
      hover:bg-success-container/30
    `,
    confirmed: `
      bg-primary-fixed/30
      border-2 border-primary-fixed
      text-on-surface
      hover:bg-primary-fixed/40
    `,
    maintenance: `
      bg-surface-container-highest
      border-2 border-surface-container-highest
      text-on-surface-variant
      opacity-60
    `,
    pending: `
      bg-secondary-container/30
      border-2 border-secondary-container
      text-on-surface
      hover:bg-secondary-container/40
    `,
  };

  return styles[state];
};

/**
 * Get icon for cell state
 */
const getStateIcon = (state: CourtCellState): string => {
  const icons: Record<CourtCellState, string> = {
    available: 'check_circle',
    confirmed: 'event_available',
    maintenance: 'build',
    pending: 'schedule',
  };

  return icons[state];
};

/**
 * Get court badge style
 */
const getCourtBadgeStyle = (courtType: CourtType): string => {
  const styles: Record<CourtType, string> = {
    Quick: `
      bg-primary-fixed
      text-primary
    `,
    Terre: `
      bg-secondary-fixed
      text-secondary
    `,
  };

  return styles[courtType];
};

/**
 * Format hour for display
 */
const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

// ==========================================
// COMPONENT
// ==========================================

export function CourtGridCell({
  cell,
  onClick,
}: CourtGridCellProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const cellVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' },
    },
    hover: {
      scale: shouldReduceMotion ? 1 : 1.02,
      transition: { duration: 0.1 },
    },
    tap: {
      scale: shouldReduceMotion ? 1 : 0.98,
      transition: { duration: 0.1 },
    },
  };

  const isInteractive = cell.state !== 'maintenance' && onClick !== undefined;
  const baseStyle = getCellStyle(cell.state);

  return (
    <motion.button
      initial="hidden"
      animate="visible"
      whileHover={isInteractive ? 'hover' : undefined}
      whileTap={isInteractive ? 'tap' : undefined}
      variants={cellVariants}
      onClick={() => isInteractive && onClick?.(cell)}
      disabled={!isInteractive}
      aria-label={`Court ${cell.courtNumber} - ${formatHour(cell.hour)} - ${cell.state}`}
      aria-pressed={cell.state === 'confirmed'}
      className={`
        h-16 rounded-lg
        flex flex-col items-center justify-center
        gap-1
        transition-all duration-200
        ${baseStyle}
        ${isInteractive
          ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-fixed/50'
          : 'cursor-default'
        }
        ${cell.state === 'maintenance' ? 'pointer-events-none' : ''}
      `}
    >
      {/* Court Badge */}
      <span
        className={`
          font-body text-body-xs font-semibold
          px-2 py-0.5 rounded-full
          ${getCourtBadgeStyle(cell.courtType)}
        `}
      >
        {cell.courtType}
      </span>

      {/* Hour */}
      <span className="font-body text-label font-semibold">
        {formatHour(cell.hour)}
      </span>

      {/* State Icon */}
      <span className="material-symbols-outlined text-sm opacity-80">
        {getStateIcon(cell.state)}
      </span>
    </motion.button>
  );
}
