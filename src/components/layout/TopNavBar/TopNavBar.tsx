import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Avatar } from '../../ui/Avatar/Avatar';

export interface TopNavBarProps {
  userName?: string;
  userAvatar?: string;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
}

export function TopNavBar({
  userName = 'Utilisateur',
  userAvatar,
  onMenuClick,
  onNotificationClick,
  notificationCount = 0,
}: TopNavBarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Escape handler and focus trap
  useEffect(() => {
    if (isUserMenuOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus first menu item when opened
      const firstMenuItem = userMenuRef.current?.querySelector('[role="menuitem"]') as HTMLElement;
      firstMenuItem?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsUserMenuOpen(false);
          previousFocusRef.current?.focus();
          return;
        }

        // Focus trap
        if (e.key === 'Tab' && userMenuRef.current) {
          const focusableElements = userMenuRef.current.querySelectorAll('[role="menuitem"]');
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
  }, [isUserMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-surface-container-highest">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">sports_tennis</span>
          <h1 className="font-headline text-headline-sm font-bold text-primary">
            Tennis Club du François
          </h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            aria-label="Notifications"
            className="relative p-2 transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none hover:bg-surface-container-highest/50 hover:scale-105 active:scale-95 rounded-full"
          >
            <span className="material-symbols-outlined text-on-surface">notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-tertiary text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label="User menu"
              className="flex items-center gap-2 transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none hover:bg-surface-container-highest/50 hover:scale-[1.02] active:scale-[0.98] rounded-full p-1 pr-3"
            >
              <Avatar src={userAvatar} name={userName} size="small" />
              <span className="font-body text-body-sm hidden md:block">{userName}</span>
              <span className={`material-symbols-outlined text-sm transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  key="user-menu"
                  initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : -8 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
                  ref={userMenuRef}
                  className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-highest overflow-hidden"
                  role="menu"
                  aria-label="User menu"
                >
                  <div className="p-3 border-b border-surface-container-highest">
                    <p className="font-headline text-headline-sm">{userName}</p>
                    <p className="font-body text-body-sm text-on-surface/60">Membre</p>
                  </div>
                  <button
                    className="w-full px-4 py-2 text-left transition-colors duration-150 hover:bg-surface-container-highest/50 flex items-center gap-2"
                    role="menuitem"
                  >
                    <span className="material-symbols-outlined text-sm">person</span>
                    Profil
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left transition-colors duration-150 hover:bg-surface-container-highest/50 flex items-center gap-2"
                    role="menuitem"
                  >
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Paramètres
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left transition-colors duration-150 hover:bg-surface-container-highest/50 flex items-center gap-2 text-tertiary"
                    role="menuitem"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
