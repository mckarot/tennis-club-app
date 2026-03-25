import { motion, useReducedMotion } from 'framer-motion';
import type { ViewToggleProps } from './ViewToggle.types';
import { viewModes } from './ViewToggle.types';

export function ViewToggle({
  mode,
  onModeChange,
  className = '',
}: ViewToggleProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`
        inline-flex items-center bg-surface-container-highest rounded-lg p-1
        ${className}
      `}
      role="group"
      aria-label="View mode toggle"
    >
      {viewModes.map((viewMode, index) => {
        const isActive = mode === viewMode.mode;

        return (
          <motion.button
            key={viewMode.mode}
            initial={false}
            animate={{
              scale: isActive ? 1 : shouldReduceMotion ? 1 : 0.95,
            }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
            onClick={() => onModeChange(viewMode.mode)}
            aria-label={`Afficher ${viewMode.label}`}
            aria-pressed={isActive}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
              font-body text-body-sm font-medium
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/50
              ${isActive
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface/60 hover:text-on-surface'
              }
            `}
          >
            <span className="material-symbols-outlined text-sm">
              {viewMode.icon}
            </span>
            <span className="hidden sm:inline">
              {viewMode.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
