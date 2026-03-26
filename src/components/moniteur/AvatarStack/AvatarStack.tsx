/**
 * AvatarStack Component
 *
 * Displays stacked avatars of participants with overlap.
 * Based on PNG audit: overlap ~8px, badge "+N" with background #dee4dd.
 *
 * Features:
 * - Shows maxVisible avatars with "+N" badge for overflow
 * - Overlap margin-left: -8px
 * - Fallback to initials if no avatar
 * - Tooltip on hover
 * - ARIA compliant
 * - Framer Motion animations
 *
 * @module @components/moniteur/AvatarStack
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { AvatarStackProps } from '../../types/moniteur.types';

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate consistent color from name
 */
function getAvatarColor(name: string): string {
  const colors = [
    '#006b3f', // Primary green
    '#9d431b', // Clay ocre
    '#008751', // Lighter green
    '#fe8c5e', // Vibrant ocre
  ];
  
  const index = name.length % colors.length;
  return colors[index];
}

/**
 * AvatarStack Component
 */
export function AvatarStack({
  participants,
  maxVisible = 3,
  size = 'md',
  overlap = 8,
}: AvatarStackProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const visibleParticipants = participants.slice(0, maxVisible);
  const overflowCount = participants.length - maxVisible;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className="flex items-center"
      aria-label={`${participants.length} participants`}
      role="group"
    >
      {visibleParticipants.map((participant, index) => {
        const initials = getInitials(participant.name);
        const bgColor = participant.avatar ? 'transparent' : getAvatarColor(participant.name);

        return (
          <motion.div
            key={participant.id}
            className="relative"
            style={{
              marginLeft: index > 0 ? `-${overlap}px` : 0,
            }}
            initial={{ opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : index * 0.05, duration: shouldReduceMotion ? 0 : 0.2 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {participant.avatar ? (
              <img
                src={participant.avatar}
                alt={participant.name}
                className={`
                  ${sizeClasses[size]} rounded-full border-2 border-white
                  object-cover shadow-sm
                `}
              />
            ) : (
              <div
                className={`
                  ${sizeClasses[size]} rounded-full border-2 border-white
                  flex items-center justify-center font-semibold text-white shadow-sm
                `}
                style={{ backgroundColor: bgColor }}
              >
                {initials}
              </div>
            )}

            {/* Tooltip */}
            {hoveredIndex === index && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
                           bg-surface-container-highest text-on-surface text-xs rounded shadow-lg
                           whitespace-nowrap z-10"
                  role="tooltip"
                >
                {participant.name}
                {participant.level && (
                  <span className="block text-xs opacity-70">{participant.level}</span>
                )}
              </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        );
      })}

      {/* Overflow badge */}
      {overflowCount > 0 && (
        <motion.div
          className={`
            ${sizeClasses[size]} rounded-full border-2 border-white
            flex items-center justify-center font-semibold
            shadow-sm
          `}
          style={{
            marginLeft: overlap - 0.5,
            backgroundColor: '#dee4dd',
            color: '#171d19',
          }}
          initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: shouldReduceMotion ? 0 : visibleParticipants.length * 0.05, duration: shouldReduceMotion ? 0 : 0.2 }}
        >
          +{overflowCount}
        </motion.div>
      )}

      {/* Empty state */}
      {participants.length === 0 && (
        <div
          className={`
            ${sizeClasses[size]} rounded-full border-2 border-dashed border-surface-container-highest
            flex items-center justify-center text-on-surface/40
          `}
        >
          <span className="material-symbols-outlined text-xs">person_add</span>
        </div>
      )}
    </div>
  );
}

export default AvatarStack;
