/**
 * SessionBlock Component
 *
 * Displays a session block in the weekly calendar.
 * Based on PNG audit: PRO=#006b3f, GROUP=#9d431b, Empty=dashed border #dee4dd.
 *
 * Features:
 * - 4 variants: pro, group, empty, maintenance
 * - Displays time (HH:MM - HH:MM)
 * - Shows participant count
 * - Hover effects
 * - Click handler
 * - ARIA compliant
 * - Framer Motion animations
 *
 * @module @components/moniteur/SessionBlock
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { SessionBlockData, SessionBlockVariant } from '../../types/moniteur.types';

/**
 * Get background color for variant based on PNG audit
 */
function getVariantStyles(variant: SessionBlockVariant): {
  bg: string;
  border: string;
  text: string;
} {
  switch (variant) {
    case 'pro':
      return {
        bg: 'bg-[#006b3f]',
        border: 'border-[#006b3f]',
        text: 'text-white',
      };
    case 'group':
      return {
        bg: 'bg-[#9d431b]',
        border: 'border-[#9d431b]',
        text: 'text-white',
      };
    case 'maintenance':
      return {
        bg: 'bg-surface-container-low',
        border: 'border-surface-container-highest',
        text: 'text-on-surface',
      };
    case 'empty':
    default:
      return {
        bg: 'bg-transparent',
        border: 'border-surface-container-highest',
        text: 'text-on-surface',
      };
  }
}

/**
 * SessionBlock Component props
 */
interface SessionBlockProps {
  block: SessionBlockData;
  onClick?: (block: SessionBlockData) => void;
  compact?: boolean;
}

/**
 * SessionBlock Component
 */
export function SessionBlock({
  block,
  onClick,
  compact = false,
}: SessionBlockProps) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getVariantStyles(block.variant);
  const isClickable = onClick && block.variant !== 'empty';

  const handleClick = () => {
    if (isClickable && block.slot) {
      onClick(block);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.div
      role={block.variant !== 'empty' ? 'button' : undefined}
      aria-label={
        block.variant !== 'empty'
          ? `${block.variant} session ${block.startTime} - ${block.endTime}`
          : 'Empty slot'
      }
      tabIndex={isClickable ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative rounded-lg border-2 p-3
        transition-shadow duration-200
        ${isClickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary' : ''}
        ${compact ? 'min-h-[60px]' : 'min-h-[80px]'}
        ${styles.bg} ${styles.border} ${styles.text}
      `}
      initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isClickable && !shouldReduceMotion ? { scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' } : {}}
      whileTap={isClickable && !shouldReduceMotion ? { scale: 0.98 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
    >
      {block.variant === 'empty' ? (
        // Empty slot with dashed border
        <div className="flex items-center justify-center h-full">
          <span className="material-symbols-outlined text-on-surface/30 text-[24px]">
            add
          </span>
        </div>
      ) : block.variant === 'maintenance' ? (
        // Maintenance slot
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">build</span>
            <span className="font-body text-xs font-semibold uppercase tracking-wide">
              Maintenance
            </span>
          </div>
          {block.startTime && (
            <p className="font-body text-xs opacity-70">
              {block.startTime} - {block.endTime}
            </p>
          )}
        </div>
      ) : (
        // Pro or Group session
        <div className="space-y-2">
          {/* Time */}
          <p className={`font-body font-bold ${compact ? 'text-xs' : 'text-sm'}`}>
            {block.startTime} - {block.endTime}
          </p>

          {/* Participant count */}
          {block.maxParticipants && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                people
              </span>
              <span className={`font-body font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
                {block.participantCount}/{block.maxParticipants}
              </span>
            </div>
          )}

          {/* Type badge */}
          <div className="flex items-center gap-1">
            <span
              className={`
                inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                bg-white/20
              `}
            >
              {block.variant === 'pro' ? 'PRO' : 'GRP'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default SessionBlock;
