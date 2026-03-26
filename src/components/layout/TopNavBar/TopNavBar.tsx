/**
 * TopNavBar Component
 * 
 * Fixed top navigation bar for all dashboards.
 * Features glassmorphism effect with backdrop blur.
 * 
 * Specifications:
 * - Height: h-16 (64px)
 * - Background: bg-surface/80 with backdrop-blur-lg
 * - Logo: "Martinique Tennis Club" text-primary
 * - Navigation items vary by role
 * - Right icons: notifications, account_circle
 * 
 * @module @components/layout/TopNavBar
 */

import { motion } from 'framer-motion';
import type { UserRole } from '../../types/user.types';

export interface TopNavBarProps {
  /** Dashboard role (admin, client, moniteur) */
  role: UserRole;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigation items by role
 */
const NAV_ITEMS: Record<UserRole, Array<{ label: string; href: string }>> = {
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Courts', href: '/admin/courts' },
    { label: 'Reservations', href: '/admin/reservations' },
  ],
  client: [
    { label: 'Dashboard', href: '/client/dashboard' },
    { label: 'Book Court', href: '/client/courts' },
    { label: 'My Reservations', href: '/client/reservations' },
    { label: 'Profile', href: '/client/profile' },
  ],
  moniteur: [
    { label: 'Dashboard', href: '/moniteur/dashboard' },
    { label: 'Schedule', href: '/moniteur/schedule' },
    { label: 'Students', href: '/moniteur/students' },
    { label: 'Profile', href: '/moniteur/profile' },
  ],
};

/**
 * TopNavBar component
 */
export function TopNavBar({
  role,
  className = '',
}: TopNavBarProps): JSX.Element {
  const navItems = NAV_ITEMS[role];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 h-16 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/15 ${className}`}
      role="banner"
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-primary">
            sports_tennis
          </span>
          <span className="font-headline text-xl font-bold text-primary">
            Martinique Tennis Club
          </span>
        </a>

        {/* Navigation - Center */}
        <ul className="flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="rounded-lg px-4 py-2 font-body text-sm font-medium text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Icons */}
        <div className="flex items-center gap-2">
          <button
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-2xl">
              notifications
            </span>
          </button>
          <button
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Account"
          >
            <span className="material-symbols-outlined text-2xl">
              account_circle
            </span>
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
