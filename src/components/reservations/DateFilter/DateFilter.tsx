import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from '../../ui/Icon/Icon';

export interface DateFilterProps {
  selectedDate?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

export function DateFilter({ selectedDate = new Date(), onChange, className = '' }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Escape handler and focus trap
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus input when opened
      inputRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          previousFocusRef.current?.focus();
          return;
        }

        // Focus trap
        if (e.key === 'Tab' && dropdownRef.current) {
          const focusableElements = dropdownRef.current.querySelectorAll('input, button');
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onChange?.(newDate);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Sélectionner une date"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-lg border border-surface-container-highest transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Icon name="calendar_today" size="small" />
        <span className="font-body text-body">
          {formatDate(selectedDate)}
        </span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="date-dropdown"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : -8 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
            ref={dropdownRef}
            className="absolute top-full mt-2 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-highest p-4 z-50"
          >
            <input
              ref={inputRef}
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="font-body text-body w-full"
              aria-label="Sélection de date"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
