/**
 * ProfileSection Component
 *
 * Wrapper component for profile sections.
 * Provides consistent card styling with section title.
 *
 * Features:
 * - Card wrapper with surface-container-lowest background
 * - Section title with headline typography
 * - Optional className prop for customization
 * - Framer Motion entry animation
 *
 * @module @components/client/ClientProfile/ProfileSection
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ProfileSectionProps {
  /** Section title */
  title: string;
  /** Section content */
  children: ReactNode;
  /** Optional additional classes */
  className?: string;
}

/**
 * ProfileSection component
 */
export function ProfileSection({ title, children, className = '' }: ProfileSectionProps) {
  return (
    <motion.section
      className={`rounded-xl bg-surface-container-lowest p-6 shadow-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="region"
      aria-labelledby={`section-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <h2
        id={`section-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className="font-headline text-lg font-bold text-on-surface"
      >
        {title}
      </h2>

      <div className="mt-4">{children}</div>
    </motion.section>
  );
}

export default ProfileSection;
