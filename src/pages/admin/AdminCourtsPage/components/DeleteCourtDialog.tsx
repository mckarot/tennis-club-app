// src/pages/admin/AdminCourtsPage/components/DeleteCourtDialog.tsx

import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Court } from '../../../../types/court.types';

interface DeleteCourtDialogProps {
  isOpen: boolean;
  court: Court | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteCourtDialog: FC<DeleteCourtDialogProps> = ({
  isOpen,
  court,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen || !court) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              aria-hidden="true"
              className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-tertiary">
                warning
              </span>
            </div>
            <div>
              <h2
                id="delete-dialog-title"
                className="font-headline text-lg font-bold text-on-surface"
              >
                Delete Court
              </h2>
              <p className="text-sm text-on-surface-variant">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-4 mb-6">
            <p
              id="delete-dialog-description"
              className="text-sm text-on-surface"
            >
              Are you sure you want to delete{' '}
              <span className="font-bold">{court.name}</span> (Court #{court.number})?
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-surface text-on-surface rounded-xl font-medium hover:bg-surface-container-highest transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              aria-label="Delete court"
              className="flex-1 px-4 py-3 bg-error text-on-error rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteCourtDialog;
