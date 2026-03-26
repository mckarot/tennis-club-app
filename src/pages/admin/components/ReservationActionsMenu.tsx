/**
 * ReservationActionsMenu Component
 *
 * Dropdown menu for reservation actions (Edit / Cancel / Complete).
 *
 * Features:
 * - Menu dropdown (3 points)
 * - Actions : Edit / Cancel / Complete
 * - Désactivé si status = cancelled
 * - Framer Motion animations
 * - ARIA : role="menu", aria-haspopup="menu"
 *
 * @module @pages/admin/components/ReservationActionsMenu
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Reservation } from '../../../types/reservation.types';

export interface ReservationActionsMenuProps {
  reservation: Reservation;
  onEdit?: (reservation: Reservation) => void;
  onCancel?: (reservation: Reservation) => void;
  onComplete?: (reservation: Reservation) => void;
}

export function ReservationActionsMenu({
  reservation,
  onEdit,
  onCancel,
  onComplete,
}: ReservationActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCancelled = reservation.status === 'cancelled';
  const isCompleted = reservation.status === 'completed';

  /**
   * Close menu on outside click
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Close menu on Escape key
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  /**
   * Handle action click
   */
  const handleAction = (action: 'edit' | 'cancel' | 'complete') => {
    setIsOpen(false);
    switch (action) {
      case 'edit':
        onEdit?.(reservation);
        break;
      case 'cancel':
        onCancel?.(reservation);
        break;
      case 'complete':
        onComplete?.(reservation);
        break;
    }
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Menu Button */}
      <motion.button
        role="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Reservation actions"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isCancelled}
        className={`rounded p-1 transition-colors ${
          isCancelled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:bg-black/10'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <span className="material-symbols-outlined text-sm">more_vert</span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            aria-label="Reservation actions menu"
            className="absolute right-0 z-50 mt-1 min-w-[160px] rounded-lg bg-surface-container-high py-1 shadow-lg ring-1 ring-black/5"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {/* Edit Action */}
            <button
              role="menuitem"
              onClick={() => handleAction('edit')}
              className="flex w-full items-center gap-2 px-3 py-2 font-body text-sm text-on-surface transition-colors hover:bg-black/5"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Edit</span>
            </button>

            {/* Complete Action (only if not cancelled/completed) */}
            {!isCancelled && !isCompleted && (
              <button
                role="menuitem"
                onClick={() => handleAction('complete')}
                className="flex w-full items-center gap-2 px-3 py-2 font-body text-sm text-on-surface transition-colors hover:bg-black/5"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Complete</span>
              </button>
            )}

            {/* Cancel Action (only if not cancelled/completed) */}
            {!isCancelled && !isCompleted && (
              <button
                role="menuitem"
                onClick={() => handleAction('cancel')}
                className="flex w-full items-center gap-2 px-3 py-2 font-body text-sm text-error transition-colors hover:bg-black/5"
              >
                <span className="material-symbols-outlined text-base">cancel</span>
                <span>Cancel</span>
              </button>
            )}

            {/* Cancelled Status */}
            {isCancelled && (
              <div className="px-3 py-2 font-body text-sm text-on-surface-variant">
                Cancelled
              </div>
            )}

            {/* Completed Status */}
            {isCompleted && (
              <div className="px-3 py-2 font-body text-sm text-on-surface-variant">
                Completed
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ReservationActionsMenu;
