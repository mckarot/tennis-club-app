// src/pages/admin/AdminCourtsPage/components/EditCourtModal.tsx

import { FC, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourtForm } from '../../../../components/admin/CourtForm';
import type { Court, CourtInput } from '../../../../types/court.types';

interface EditCourtModalProps {
  isOpen: boolean;
  court: Court | null;
  onClose: () => void;
  onSubmit: (data: CourtInput) => Promise<void>;
  isSubmitting?: boolean;
}

export const EditCourtModal: FC<EditCourtModalProps> = ({
  isOpen,
  court,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen || !court) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-court-modal-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface rounded-2xl w-full max-w-lg p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              id="edit-court-modal-title"
              className="font-headline text-xl font-bold text-on-surface"
            >
              Edit Court
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                close
              </span>
            </button>
          </div>

          <CourtForm
            court={court}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditCourtModal;
