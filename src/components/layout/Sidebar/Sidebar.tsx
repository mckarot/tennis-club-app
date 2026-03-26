/**
 * Sidebar Component
 * 
 * Fixed left sidebar navigation for all dashboards.
 * Features role-specific navigation and filters.
 * 
 * Specifications:
 * - Width: w-64 (256px)
 * - Background: bg-surface-container-low
 * - Padding top: pt-20 (to clear TopNavBar)
 * - Border right: border-r border-outline-variant/15
 * 
 * @module @components/layout/Sidebar
 */

import { motion } from 'framer-motion';
import type { UserRole } from '../../types/user.types';

export interface SidebarProps {
  /** Dashboard role (admin, client, moniteur) */
  role: UserRole;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Sidebar content by role
 */
const SIDEBAR_CONTENT: Record<UserRole, {
  title: string;
  subtitle?: string;
  sections: Array<{
    title?: string;
    items: Array<{
      label: string;
      icon: string;
      href?: string;
      action?: () => void;
    }>;
  }>;
}> = {
  admin: {
    title: 'COMMAND CENTER',
    subtitle: 'Supervision & Management',
    sections: [
      {
        title: 'MANAGEMENT',
        items: [
          { label: 'Dashboard', icon: 'dashboard', href: '/admin/dashboard' },
          { label: 'User Directory', icon: 'people', href: '/admin/users' },
          { label: 'Court Management', icon: 'sports_tennis', href: '/admin/courts' },
          { label: 'Reservations', icon: 'event', href: '/admin/reservations' },
        ],
      },
      {
        title: 'SETTINGS',
        items: [
          { label: 'Configuration', icon: 'settings', href: '/admin/settings' },
          { label: 'Help & Support', icon: 'help', href: '/admin/help' },
        ],
      },
    ],
  },
  client: {
    title: 'Court Manager',
    subtitle: 'America/Martinique',
    sections: [
      {
        title: 'NAVIGATION',
        items: [
          { label: 'Dashboard', icon: 'dashboard', href: '/client/dashboard' },
          { label: 'Book a Court', icon: 'sports_tennis', href: '/client/courts' },
          { label: 'My Reservations', icon: 'event', href: '/client/reservations' },
          { label: 'My Profile', icon: 'person', href: '/client/profile' },
        ],
      },
      {
        title: 'QUICK ACTIONS',
        items: [
          { label: 'Cancel Reservation', icon: 'cancel', href: '/client/cancel' },
          { label: 'Contact Support', icon: 'support_agent', href: '/client/support' },
        ],
      },
    ],
  },
  moniteur: {
    title: 'MONITEUR PORTAL',
    subtitle: 'Daily Schedule',
    sections: [
      {
        title: 'SCHEDULE',
        items: [
          { label: 'Dashboard', icon: 'dashboard', href: '/moniteur/dashboard' },
          { label: 'Weekly Calendar', icon: 'calendar_month', href: '/moniteur/calendar' },
          { label: 'Define Slots', icon: 'add_circle', href: '/moniteur/slots' },
          { label: 'My Students', icon: 'school', href: '/moniteur/students' },
        ],
      },
      {
        title: 'TOOLS',
        items: [
          { label: 'Attendance', icon: 'checklist', href: '/moniteur/attendance' },
          { label: 'Reports', icon: 'assessment', href: '/moniteur/reports' },
        ],
      },
    ],
  },
};

/**
 * Sidebar component
 */
export function Sidebar({
  role,
  className = '',
}: SidebarProps): JSX.Element {
  const content = SIDEBAR_CONTENT[role];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`fixed left-0 top-0 z-40 h-screen w-64 bg-surface-container-low pt-20 flex flex-col border-r border-outline-variant/15 ${className}`}
      role="complementary"
      aria-label="Dashboard navigation"
    >
      {/* Header */}
      <div className="px-6 pb-6">
        <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant">
          {content.title}
        </h2>
        {content.subtitle && (
          <p className="mt-1 font-body text-xs text-on-surface-variant/70">
            {content.subtitle}
          </p>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3">
        {content.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.title && (
              <h3 className="mb-2 px-3 font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm font-medium text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-base">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <button
                      onClick={item.action}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm font-medium text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-base">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-outline-variant/15 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2">
          <span className="material-symbols-outlined text-primary">
            info
          </span>
          <div>
            <p className="font-body text-xs font-semibold text-primary">
              Need Help?
            </p>
            <p className="font-body text-xs text-on-surface-variant/70">
              Contact support
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
