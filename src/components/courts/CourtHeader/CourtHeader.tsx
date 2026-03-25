import { motion, useReducedMotion } from 'framer-motion';
import type { CourtHeaderProps } from './CourtHeader.types';
import { courtTypeBadgeStyles } from './CourtHeader.types';

export function CourtHeader({
  courtNumber,
  courtName,
  courtType,
  isActive,
  onClick,
}: CourtHeaderProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const badgeStyle = courtTypeBadgeStyles[courtType];

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      onClick={onClick}
      className={`
        bg-surface-container-high rounded-lg p-3 mb-2
        flex items-center justify-between
        ${onClick ? 'cursor-pointer hover:bg-surface-container-highest transition-colors' : ''}
      `}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={`${courtName} - ${courtType} - ${isActive ? 'Actif' : 'Inactif'}`}
    >
      <div className="flex flex-col">
        <span className="font-headline text-headline-sm font-semibold text-on-surface">
          {courtName}
        </span>
        <span className="font-body text-body-xs text-on-surface/60">
          Terrain {courtNumber}
        </span>
      </div>

      {/* Surface Type Badge */}
      <span
        className={`
          inline-flex items-center px-2 py-1 rounded-full
          font-body text-label-xs font-medium uppercase
          ${badgeStyle}
        `}
      >
        {courtType}
      </span>
    </motion.div>
  );
}
