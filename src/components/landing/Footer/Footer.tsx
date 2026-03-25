/**
 * Footer Component (Landing Page)
 *
 * Two-column footer with copyright and 3 links.
 * Features Framer Motion animations and full accessibility support.
 *
 * Specifications:
 * - 2-col layout
 * - Copyright text
 * - 3 links (Privacy, Terms, Contact)
 * - Social links
 *
 * @module @components/landing/Footer
 */

import { motion, useReducedMotion } from 'framer-motion';

export interface FooterLink {
  /** Link label */
  label: string;
  /** Link href */
  href: string;
}

export interface SocialLink {
  /** Social platform name */
  platform: string;
  /** Link href */
  href: string;
  /** Material icon name */
  icon: string;
}

export interface FooterProps {
  /** Copyright text */
  copyrightText?: string;
  /** Footer links */
  links?: FooterLink[];
  /** Social media links */
  socialLinks?: SocialLink[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default footer links
 */
const DEFAULT_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Default social links
 */
const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'Facebook',
    href: 'https://facebook.com',
    icon: 'facebook',
  },
  {
    platform: 'Instagram',
    href: 'https://instagram.com',
    icon: 'instagram',
  },
  {
    platform: 'Twitter',
    href: 'https://twitter.com',
    icon: 'twitter',
  },
];

/**
 * Footer component for landing page
 */
export function Footer({
  copyrightText = `© ${new Date().getFullYear()} Tennis Club du François. All rights reserved.`,
  links = DEFAULT_LINKS,
  socialLinks = DEFAULT_SOCIAL_LINKS,
  className = '',
}: FooterProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`bg-surface-container-lowest border-t border-surface-container-highest ${className}`}
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left column - Brand info */}
          <motion.div
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
            className="flex flex-col"
          >
            {/* Logo */}
            <a
              href="/"
              className="mb-4 inline-flex items-center gap-3 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest w-fit rounded-lg p-1"
              aria-label="Tennis Club du François - Home"
            >
              <span className="material-symbols-outlined text-2xl text-primary">
                sports_tennis
              </span>
              <span className="font-headline text-headline-md font-bold text-primary">
                Tennis Club du François
              </span>
            </a>

            {/* Description */}
            <p className="mb-6 max-w-md font-body text-body text-on-surface/80">
              Experience world-class tennis facilities in the heart of Martinique.
              Book courts, join clinics, and elevate your game.
            </p>

            {/* Social links */}
            <nav className="flex items-center gap-3" aria-label="Social media">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container transition-all duration-200 hover:bg-primary hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest"
                  aria-label={`Follow us on ${social.platform}`}
                >
                  <span className="material-symbols-outlined text-on-surface transition-colors duration-200 hover:text-on-primary">
                    {social.icon}
                  </span>
                </a>
              ))}
            </nav>
          </motion.div>

          {/* Right column - Links */}
          <motion.div
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.4,
              delay: shouldReduceMotion ? 0 : 0.1,
            }}
            className="flex flex-col items-start md:items-end"
          >
            <h3 className="mb-4 font-headline text-headline-sm font-semibold text-on-surface">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-3" aria-label="Footer">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-body text-body font-medium text-on-surface/80 transition-colors duration-200 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest rounded-lg px-2 py-1"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Contact info */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">
                  location_on
                </span>
                <span className="font-body text-body-sm text-on-surface/80">
                  Le François, Martinique
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">
                  phone
                </span>
                <a
                  href="tel:+596123456789"
                  className="font-body text-body-sm text-on-surface/80 transition-colors duration-200 hover:text-primary"
                >
                  +596 123 456 789
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">
                  email
                </span>
                <a
                  href="mailto:contact@tennis-club-du-francois.fr"
                  className="font-body text-body-sm text-on-surface/80 transition-colors duration-200 hover:text-primary"
                >
                  contact@tennis-club-du-francois.fr
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.4,
            delay: shouldReduceMotion ? 0 : 0.2,
          }}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface-container-highest pt-8 md:flex-row"
        >
          {/* Copyright */}
          <p className="font-body text-body-sm text-on-surface/60">
            {copyrightText.replace('{year}', String(currentYear))}
          </p>

          {/* Made with */}
          <div className="flex items-center gap-2">
            <span className="font-body text-body-sm text-on-surface/60">
              Made with
            </span>
            <span className="material-symbols-outlined text-sm text-error">
              favorite
            </span>
            <span className="font-body text-body-sm text-on-surface/60">
              in Martinique
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
