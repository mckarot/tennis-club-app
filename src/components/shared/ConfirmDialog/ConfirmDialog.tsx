/**
 * ConfirmDialog Component
 *
 * Reusable confirmation dialog for destructive actions.
 * Implements proper accessibility with role="alertdialog", focus trap, and Escape handler.
 *
 * @module @components/shared/ConfirmDialog
 */

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  icon?: 'warning' | 'error' | 'info';
}

/**
 * Get icon based on type
 */
function getIcon(icon: 'warning' | 'error' | 'info'): string {
  const icons: Record<'warning' | 'error' | 'info', string> = {
    warning: 'warning',
    error: 'error',
    info: 'info',
  };
  return icons[icon];
}

/**
 * Get color classes based on icon type
 */
function getColorClasses(icon: 'warning' | 'error' | 'info'): {
  bgColor: string;
  textColor: string;
} {
  const colors: Record<'warning' | 'error' | 'info', { bgColor: string; textColor: string }> = {
    warning: {
      bgColor: 'bg-error-container/20',
      textColor: 'text-error',
    },
    error: {
      bgColor: 'bg-error-container/20',
      textColor: 'text-error',
    },
    info: {
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
    },
  };
  return colors[icon];
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Annuler',
  isLoading = false,
  icon = 'warning',
}: ConfirmDialogProps): JSX.Element | null {
  const shouldReduceMotion = useReducedMotion();

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const modal = document.getElementById('confirm-dialog');
    const focusableElements = modal?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement | undefined;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement | undefined;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !firstElement || !lastElement) return;

      if (e.shiftKey) {
        // Shift + Tab: go to last element if on first
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: go to first element if on last
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    modal?.addEventListener('keydown', handleTabKey);

    // Focus first element after modal opens
    setTimeout(() => {
      firstElement?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      modal?.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, onClose]);

  const modalVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: shouldReduceMotion ? 0 : 0.2 },
    },
    exit: {
      opacity: shouldReduceMotion ? 1 : 0,
      scale: shouldReduceMotion ? 1 : 0.9,
      transition: { duration: shouldReduceMotion ? 0 : 0.15 },
    },
  };

  if (!isOpen) return null;

  const colorClasses = getColorClasses(icon);

  return (
    <div
      id="confirm-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-dim/60"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onClick={onClose}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${colorClasses.bgColor}`}
          >
            <span className={`material-symbols-outlined ${colorClasses.textColor}`}>
              {getIcon(icon)}
            </span>
          </div>
          <h3
            id="confirm-dialog-title"
            className="font-headline text-lg font-semibold text-on-surface"
          >
            {title}
          </h3>
        </div>

        <p
          id="confirm-dialog-message"
          className="font-body text-body-sm text-on-surface-variant mb-6"
        >
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg font-body text-body-sm font-medium bg-surface-container-high text-on-surface hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-body text-body-sm font-medium bg-error text-on-error hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                En cours...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ConfirmDialog;
