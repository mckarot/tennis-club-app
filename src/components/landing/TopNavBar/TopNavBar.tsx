/**
 * TopNavBar Component (Landing Page)
 *
 * Fixed top navigation bar with glass effect, 3 links, and 2 icon buttons.
 * Features Framer Motion animations and full accessibility support.
 *
 * Specifications:
 * - Fixed h-16
 * - Glass effect backdrop-blur-md
 * - 3 navigation links (Courts, Pricing, About)
 * - 2 icon buttons (Search, Login)
 *
 * @module @components/landing/TopNavBar
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';

export interface TopNavBarProps {
  /** Logo link href */
  logoHref?: string;
  /** Navigation links */
  links?: NavItem[];
  /** On search click handler */
  onSearchClick?: () => void;
  /** On login click handler */
  onLoginClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export interface NavItem {
  /** Link label */
  label: string;
  /** Link href */
  href: string;
}

/**
 * Default navigation items
 */
const DEFAULT_LINKS: NavItem[] = [
  { label: 'Courts', href: '#courts' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '/about' },
];

/**
 * TopNavBar component for landing page
 */
export function TopNavBar({
  logoHref = '/',
  links = DEFAULT_LINKS,
  onSearchClick,
  onLoginClick,
  className = '',
}: TopNavBarProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile menu escape handler and focus trap
  useEffect(() => {
    if (isMobileMenuOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const firstLink = mobileMenuRef.current?.querySelector('a') as HTMLElement;
      firstLink?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileMenuOpen(false);
          previousFocusRef.current?.focus();
          return;
        }

        // Focus trap
        if (e.key === 'Tab' && mobileMenuRef.current) {
          const focusableElements = mobileMenuRef.current.querySelectorAll('a, button');
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
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        isScrolled
          ? 'bg-surface/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      } ${className}`}
      role="banner"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <a
          href={logoHref}
          className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent"
          aria-label="Tennis Club du François - Home"
        >
          <span className="material-symbols-outlined text-2xl text-primary">
            sports_tennis
          </span>
          <span className="font-headline text-headline-sm font-bold text-primary">
            Tennis Club du François
          </span>
        </a>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-body font-medium text-on-surface/80 transition-colors duration-200 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface rounded-lg px-2 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            onClick={onSearchClick}
            aria-label="Search"
            className="hidden rounded-full p-2 transition-all duration-200 hover:bg-surface-container-highest/50 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface md:inline-flex"
          >
            <span className="material-symbols-outlined text-on-surface">
              search
            </span>
          </button>

          {/* Login button */}
          <a
            href="/login"
            className="hidden items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-body text-body-sm font-semibold text-on-primary shadow-md transition-all duration-200 hover:bg-primary-container hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface md:inline-flex"
            aria-label="Login to your account"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            <span>Login</span>
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            className="inline-flex rounded-full p-2 transition-all duration-200 hover:bg-surface-container-highest/50 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface md:hidden"
          >
            <span className="material-symbols-outlined text-on-surface">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            ref={mobileMenuRef}
            initial={{ opacity: shouldReduceMotion ? 1 : 0, height: shouldReduceMotion ? 0 : 'auto' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: shouldReduceMotion ? 0 : 'auto' }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="absolute top-16 left-0 right-0 bg-surface-container-lowest shadow-xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <nav className="flex flex-col p-4" aria-label="Mobile primary">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 font-body text-body font-medium text-on-surface transition-colors duration-200 hover:bg-surface-container-highest/50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest"
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile actions */}
              <div className="mt-4 flex flex-col gap-3 border-t border-surface-container-highest pt-4">
                <button
                  onClick={() => {
                    onSearchClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 font-body text-body font-medium text-on-surface transition-colors duration-200 hover:bg-surface-container-highest/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest"
                  aria-label="Search"
                >
                  <span className="material-symbols-outlined">search</span>
                  <span>Search</span>
                </button>

                <a
                  href="/login"
                  className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 font-body text-body font-semibold text-on-primary transition-colors duration-200 hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest"
                  aria-label="Login to your account"
                >
                  <span className="material-symbols-outlined">login</span>
                  <span>Login</span>
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default TopNavBar;
