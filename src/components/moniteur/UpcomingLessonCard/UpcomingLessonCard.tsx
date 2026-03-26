/**
 * UpcomingLessonCard Component
 *
 * Displays an upcoming lesson card with all details.
 * Based on PNG audit: Time in bold 28px, duration badge, type badge,
 * court info, avatar stack, NEXT badge for next session.
 *
 * Features:
 * - Time in bold 28px
 * - Duration (e.g., "60 MINS")
 * - Type badge (GROUP/PRIVATE)
 * - Title + description
 * - Court info (Court 04 • Clay)
 * - AvatarStack of participants
 * - Actions: Details, Cancel
 * - "NEXT" badge for next session
 * - ARIA compliant
 * - Framer Motion animations
 *
 * @module @components/moniteur/UpcomingLessonCard
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AvatarStack } from '../AvatarStack/AvatarStack';
import type { UpcomingLessonCardProps } from '../../types/moniteur.types';

/**
 * Pulse animation variants for NEXT badge
 */
const pulseVariants = {
  normal: { scale: 1 },
  pulse: { 
    scale: [1, 1.05, 1], 
    transition: { 
      repeat: Infinity, 
      duration: 2,
      ease: 'easeInOut'
    } 
  },
};

/**
 * Get badge styles based on lesson type
 */
function getTypeBadgeStyles(type: 'PRIVATE' | 'GROUP'): {
  bg: string;
  text: string;
} {
  return type === 'PRIVATE'
    ? { bg: '#006b3f', text: '#ffffff' }
    : { bg: '#9d431b', text: '#ffffff' };
}

/**
 * UpcomingLessonCard Component
 */
export function UpcomingLessonCard({
  lesson,
  onViewDetails,
  onCancel,
}: UpcomingLessonCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const badgeStyles = getTypeBadgeStyles(lesson.type);

  return (
    <motion.article
      role="article"
      aria-label={`Cours de ${lesson.startTime}`}
      className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-sm"
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!shouldReduceMotion ? { y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
    >
      {/* NEXT badge */}
      {lesson.isNext && (
        <motion.div
          className="absolute top-4 right-4"
          initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            ...(shouldReduceMotion ? {} : { scale: [1, 1.05, 1] })
          }}
          transition={{ 
            delay: shouldReduceMotion ? 0 : 0.2, 
            duration: shouldReduceMotion ? 0 : 0.2,
            ...(shouldReduceMotion ? {} : { repeat: Infinity, repeatDelay: 1.5 })
          }}
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            <span className="material-symbols-outlined text-xs">star</span>
            Next
          </span>
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        {/* Header: Time + Duration */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-headline text-[28px] font-bold text-on-surface">
              {lesson.startTime}
            </p>
            <p className="font-body text-sm font-semibold text-on-surface/60 uppercase tracking-wide">
              {lesson.duration} MINS
            </p>
          </div>

          {/* Type badge */}
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: badgeStyles.bg, color: badgeStyles.text }}
          >
            {lesson.type === 'PRIVATE' ? 'Private' : 'Group'}
          </span>
        </div>

        {/* Title + Description */}
        <div className="space-y-1">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            {lesson.title}
          </h3>
          {lesson.description && (
            <p className="font-body text-sm text-on-surface/70">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Court info */}
        {lesson.court && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">
              sports_tennis
            </span>
            <span className="font-body text-sm font-medium text-on-surface">
              Court {lesson.court.number} • {lesson.court.surface}
            </span>
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center justify-between">
          <AvatarStack
            participants={lesson.participants}
            maxVisible={4}
            size="md"
            overlap={8}
          />
          
          {lesson.participants.length > 0 && (
            <span className="font-body text-sm text-on-surface/60">
              {lesson.participants.length} participant{lesson.participants.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-surface-container-highest">
          {onViewDetails && (
            <motion.button
              onClick={() => onViewDetails(lesson)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5
                       rounded-lg bg-primary text-white font-semibold
                       hover:opacity-90 transition-opacity duration-200
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              whileHover={!shouldReduceMotion ? { scale: 1.02 } : {}}
              whileTap={!shouldReduceMotion ? { scale: 0.98 } : {}}
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              Details
            </motion.button>
          )}

          {onCancel && (
            <motion.button
              onClick={() => onCancel(lesson)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5
                       rounded-lg bg-surface-container-highest text-on-surface font-semibold
                       hover:bg-surface-container-highest/70 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-2"
              whileHover={!shouldReduceMotion ? { scale: 1.02 } : {}}
              whileTap={!shouldReduceMotion ? { scale: 0.98 } : {}}
            >
              <span className="material-symbols-outlined text-sm">cancel</span>
              Cancel
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default UpcomingLessonCard;
