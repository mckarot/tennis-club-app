import { motion, useReducedMotion } from 'framer-motion';
import type { AvailabilityLegendProps, LegendItem } from './AvailabilityLegend.types';
import { defaultLegendItems } from './AvailabilityLegend.types';

export function AvailabilityLegend({
  items = defaultLegendItems,
  className = '',
}: AvailabilityLegendProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : -8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.2 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`
        flex flex-wrap items-center gap-4
        ${className}
      `}
      role="list"
      aria-label="Legend for court availability states"
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          className="flex items-center gap-2"
          role="listitem"
        >
          {/* Color Indicator */}
          <span
            className={`
              w-4 h-4 rounded-md flex-shrink-0
              ${item.colorClass}
            `}
            aria-hidden="true"
          />

          {/* Label */}
          <span className="font-body text-body-sm text-on-surface/80">
            {item.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
