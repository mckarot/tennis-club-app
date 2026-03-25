import { motion, useReducedMotion } from 'framer-motion';
import type { TimeSlotCellProps, TimeSlotState } from './TimeSlotCell.types';
import { getTimeSlotStyle, stateIcons, stateLabels } from './TimeSlotCell.types';

/**
 * Get icon opacity based on state
 */
const getIconOpacity = (state: TimeSlotState): string => {
  return state === 'available' ? 'opacity-60' : 'opacity-100';
};

export function TimeSlotCell({
  hour,
  state,
  courtType,
  onClick,
  label,
}: TimeSlotCellProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const style = getTimeSlotStyle(state, courtType);
  const icon = stateIcons[state];
  const displayLabel = label || stateLabels[state];

  const formatHour = (h: number): string => {
    return `${h.toString().padStart(2, '0')}:00`;
  };

  const isInteractive = state !== 'maintenance' && onClick !== undefined;
  const showIcon: boolean = state !== 'available' || onClick !== undefined;

  return (
    <motion.button
      initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
      onClick={onClick}
      disabled={!isInteractive}
      aria-label={`${formatHour(hour)} - ${displayLabel}${courtType ? ` - ${courtType}` : ''}`}
      className={`
        h-16 rounded-md flex flex-col items-center justify-center gap-1
        transition-all duration-200
        ${style}
        ${isInteractive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50' : 'cursor-default'}
        ${state === 'maintenance' ? 'pointer-events-none' : ''}
      `}
    >
      <span className="font-body text-label font-semibold">
        {formatHour(hour)}
      </span>

      {showIcon && (
        <span className={`material-symbols-outlined text-xs ${getIconOpacity(state)}`}>
          {icon}
        </span>
      )}
    </motion.button>
  );
}
