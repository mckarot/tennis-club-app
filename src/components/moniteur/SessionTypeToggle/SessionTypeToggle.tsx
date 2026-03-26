/**
 * SessionTypeToggle Component
 *
 * Toggle between PRIVATE and GROUP session types.
 * Based on PNG audit: Active = white background with green text,
 * Inactive = transparent with green border.
 *
 * Features:
 * - Horizontal toggle with two options
 * - Keyboard support (Tab, Space, Enter)
 * - ARIA compliant with radiogroup role
 * - Framer Motion animations
 *
 * @module @components/moniteur/SessionTypeToggle
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { SlotType } from '../../types/slot.types';
import type { SessionTypeToggleProps } from '../../types/moniteur.types';

/**
 * SessionTypeToggle Component
 */
export function SessionTypeToggle({
  value,
  onChange,
  disabled = false,
}: SessionTypeToggleProps) {
  const shouldReduceMotion = useReducedMotion();
  const options: { value: SlotType; label: string }[] = [
    { value: 'PRIVATE', label: 'Private' },
    { value: 'GROUP', label: 'Group' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, option: SlotType) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(option);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Type de session"
      className="inline-flex rounded-lg bg-surface-container-highest/30 p-1"
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <motion.button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, option.value)}
            className={`
              relative px-4 py-2 text-sm font-semibold rounded-md
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            initial={false}
            animate={{
              backgroundColor: isActive ? '#ffffff' : 'transparent',
              color: isActive ? '#006b3f' : '#006b3f',
              transition: { duration: shouldReduceMotion ? 0 : 0.2 }
            }}
            whileHover={!disabled && !isActive && !shouldReduceMotion ? { backgroundColor: 'rgba(0, 107, 63, 0.05)' } : {}}
            whileTap={!disabled && !shouldReduceMotion ? { scale: 0.98 } : {}}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export default SessionTypeToggle;
