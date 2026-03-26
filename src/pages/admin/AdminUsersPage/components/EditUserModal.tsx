// src/pages/admin/AdminUsersPage/components/EditUserModal.tsx

import { FC, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User, UserRole, UserStatus } from '../../../../firebase/types';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (userId: string, data: Partial<User>) => Promise<void>;
}

interface FormErrors {
  name?: string;
  phone?: string;
}

export const EditUserModal: FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [status, setStatus] = useState<UserStatus>('inactive');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name);
      setPhone(user.phone || '');
      setRole(user.role);
      setStatus(user.status);
      firstInputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [user, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    try {
      await onSubmit(user.id, { name, phone: phone || undefined, role, status });
      handleClose();
    } catch (error) {
      console.error('[EditUserModal] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setRole('client');
    setStatus('inactive');
    setErrors({});
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-modal-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              id="edit-user-modal-title"
              className="font-headline text-xl font-bold text-on-surface"
            >
              Edit User
            </h2>
            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                close
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-on-surface mb-2">
                Name *
              </label>
              <input
                ref={firstInputRef}
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'edit-name-error' : undefined}
                className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.name && (
                <p id="edit-name-error" className="mt-1 text-sm text-tertiary">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-on-surface mb-2">
                Email
              </label>
              <input
                id="edit-email"
                type="email"
                value={user.email}
                readOnly
                aria-readonly="true"
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-surface-container-highest text-on-surface-variant cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-on-surface-variant">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="edit-role" className="block text-sm font-medium text-on-surface mb-2">
                Role
              </label>
              <select
                id="edit-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="client">Client</option>
                <option value="moniteur">Moniteur</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-phone" className="block text-sm font-medium text-on-surface mb-2">
                Phone
              </label>
              <input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'edit-phone-error' : undefined}
                className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.phone && (
                <p id="edit-phone-error" className="mt-1 text-sm text-tertiary">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-on-surface mb-2">
                Status
              </label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="online">Online</option>
                <option value="away">Away</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-surface text-on-surface rounded-xl font-medium hover:bg-surface-container-highest transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-primary text-on-primary rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
