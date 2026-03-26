/**
 * ParticipantsPanel Component
 *
 * Modal or side panel displaying lesson participants.
 * Based on PNG audit: List with avatar, name + level,
 * status (confirmed/pending), check icon for confirmed.
 *
 * Features:
 * - Modal or side panel
 * - List participants with avatar, name, level
 * - Status (confirmed/pending) with check icon
 * - Empty Slot row if no participants
 * - Focus trap
 * - Escape handler
 * - ARIA compliant (role="dialog", aria-modal="true")
 * - Framer Motion animations
 *
 * @module @components/moniteur/ParticipantsPanel
 */

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AvatarStack } from '../AvatarStack/AvatarStack';
import type { ParticipantsPanelProps, ParticipantInfo } from '../../types/moniteur.types';

/**
 * Backdrop variants
 */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Panel variants for slide-in animation
 */
const panelVariants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0, 
    transition: { 
      type: 'spring', 
      damping: 25, 
      stiffness: 200 
    } 
  },
  exit: { x: '100%' },
};

/**
 * List item variants for stagger
 */
const listItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
};

/**
 * ParticipantsPanel Component
 */
export function ParticipantsPanel({
  isOpen,
  onClose,
  participants,
  lessonId,
  onAddParticipant,
  onRemoveParticipant,
}: ParticipantsPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  // Handle Escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // Add Escape listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  // Focus trap (simple implementation)
  useEffect(() => {
    if (isOpen) {
      const focusableElements = document.querySelectorAll<HTMLElement>(
        '[role="dialog"] button, [role="dialog"] [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      firstElement?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-on-surface/50 z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="participants-panel-title"
            className="fixed inset-y-0 right-0 w-full max-w-md bg-surface-container-lowest shadow-xl z-50
                     flex flex-col"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ 
              type: 'spring', 
              damping: shouldReduceMotion ? 30 : 25, 
              stiffness: shouldReduceMotion ? 100 : 200 
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-container-highest">
              <h2
                id="participants-panel-title"
                className="font-headline text-xl font-bold text-on-surface"
              >
                Participants
              </h2>
              <motion.button
                onClick={onClose}
                aria-label="Close participants panel"
                className="p-2 rounded-lg hover:bg-surface-container-highest/50
                         focus:outline-none focus:ring-2 focus:ring-primary"
                whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
                whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
              >
                <span className="material-symbols-outlined text-on-surface">close</span>
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {participants.length === 0 ? (
                // Empty state
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-container-highest/30
                                flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-on-surface/40">
                      group_add
                    </span>
                  </div>
                  <p className="font-body text-base text-on-surface/70 mb-2">
                    No participants yet
                  </p>
                  <p className="font-body text-sm text-on-surface/50">
                    Add participants to this session
                  </p>
                </motion.div>
              ) : (
                // Participant list
                <div className="space-y-3">
                  {participants.map((participant, index) => (
                    <ParticipantRow
                      key={participant.id}
                      participant={participant}
                      onRemove={onRemoveParticipant}
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {onAddParticipant && (
              <div className="p-6 border-t border-surface-container-highest">
                <motion.button
                  onClick={onAddParticipant}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3
                           rounded-lg bg-primary text-white font-semibold
                           hover:opacity-90 transition-opacity duration-200
                           focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  whileHover={!shouldReduceMotion ? { scale: 1.02 } : {}}
                  whileTap={!shouldReduceMotion ? { scale: 0.98 } : {}}
                >
                  <span className="material-symbols-outlined">person_add</span>
                  Add Participant
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * ParticipantRow Component (internal)
 */
interface ParticipantRowProps {
  participant: ParticipantInfo;
  onRemove?: (participantId: string) => void;
  delay: number;
}

function ParticipantRow({
  participant,
  onRemove,
  delay,
}: ParticipantRowProps) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low
               hover:bg-surface-container-low/70 transition-colors duration-200"
      variants={listItemVariants}
      transition={{ delay: shouldReduceMotion ? 0 : delay, duration: shouldReduceMotion ? 0 : 0.2 }}
    >
      {/* Avatar */}
      <AvatarStack
        participants={[participant]}
        maxVisible={1}
        size="md"
        overlap={0}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-semibold text-on-surface truncate">
          {participant.name}
        </p>
        {participant.level && (
          <p className="font-body text-xs text-on-surface/60">{participant.level}</p>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {participant.status === 'confirmed' ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Confirmed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Pending
          </span>
        )}

        {onRemove && (
          <motion.button
            onClick={() => onRemove(participant.id)}
            aria-label={`Remove ${participant.name}`}
            className="p-1.5 rounded-lg hover:bg-tertiary/10
                     focus:outline-none focus:ring-2 focus:ring-tertiary"
            whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
            whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
          >
            <span className="material-symbols-outlined text-sm text-tertiary">
              remove_circle
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default ParticipantsPanel;
