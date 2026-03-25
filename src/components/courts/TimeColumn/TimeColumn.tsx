import { motion, useReducedMotion } from 'framer-motion';
import type { TimeColumnProps } from './TimeColumn.types';
import { DEFAULT_START_HOUR, DEFAULT_END_HOUR } from './TimeColumn.types';

export function TimeColumn({
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
  currentHour = new Date().getHours(),
}: TimeColumnProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const formatHour = (h: number): string => {
    return `${h.toString().padStart(2, '0')}:00`;
  };

  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col gap-2">
        {hours.map((hour) => {
          const isCurrentHour = hour === currentHour;
          return (
            <div key={hour} className="h-16 flex items-center justify-center pr-2">
              <div
                className={`
                  flex flex-col items-center justify-center
                  px-2 py-1 rounded-md
                  ${isCurrentHour
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'text-on-surface/60'
                  }
                `}
              >
                <span className={`
                  font-body text-label font-semibold
                  ${isCurrentHour ? 'text-on-primary-fixed' : ''}
                `}>
                  {formatHour(hour)}
                </span>
                {isCurrentHour && (
                  <span className="material-symbols-outlined text-xs mt-0.5">
                    schedule
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
