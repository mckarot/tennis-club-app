// src/components/admin/CourtStatusToggle/CourtStatusToggle.tsx

import { FC } from 'react';
import { motion } from 'framer-motion';
import type { CourtStatus } from '../../../types/court.types';

export interface CourtStatusToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export const CourtStatusToggle: FC<CourtStatusToggleProps> = ({
  isEnabled,
  onToggle,
  disabled = false,
  ariaLabel = 'Toggle court status',
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEnabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex w-12 h-6 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${isEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        aria-hidden="true"
        className={`pointer-events-none inline-block w-4 h-4 transform rounded-full bg-on-primary shadow-lg ring-0 transition ease-in-out ${
          isEnabled ? 'translate-x-7' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export default CourtStatusToggle;
