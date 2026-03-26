// src/components/users/UserActionsMenu/UserActionsMenu.tsx

import { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const UserActionsMenu: FC<UserActionsMenuProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
    if (event.key === 'Enter' && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={menuRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User actions menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
      >
        <span className="material-symbols-outlined text-on-surface-variant">
          more_vert
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-surface-container-highest z-50"
          >
            <button
              role="menuitem"
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-container-highest transition-colors rounded-t-xl"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                edit
              </span>
              <span className="text-sm font-medium text-on-surface">Edit</span>
            </button>
            <button
              role="menuitem"
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-container-highest transition-colors rounded-b-xl"
            >
              <span className="material-symbols-outlined text-tertiary">
                delete
              </span>
              <span className="text-sm font-medium text-tertiary">Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
