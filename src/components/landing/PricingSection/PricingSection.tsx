/**
 * PricingSection Component
 *
 * Pricing section with 3 tiers (Morning, Prime Time, Weekend).
 * Features Framer Motion animations and full accessibility support.
 *
 * Specifications:
 * - 3 cards with central tier featured (bg-primary, "Popular" badge)
 * - Section header with icon
 * - Responsive layout
 *
 * @module @components/landing/PricingSection
 */

import { motion, useReducedMotion } from 'framer-motion';
import { PricingCard } from './PricingCard/PricingCard';
import type { PricingTier } from './PricingCard/PricingCard';

export interface PricingSectionProps {
  /** Pricing tiers data */
  tiers?: PricingTier[];
  /** Click handler for tier selection */
  onSelectTier?: (tier: PricingTier) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default pricing tiers
 */
const DEFAULT_TIERS: PricingTier[] = [
  {
    title: 'Morning',
    price: 15,
    currency: '€',
    period: 'hour',
    features: [
      'Access 6:00 AM - 12:00 PM',
      'All court surfaces',
      'Equipment rental included',
      'Free cancellation',
      'Lighting not included',
    ],
    isFeatured: false,
  },
  {
    title: 'Prime Time',
    price: 25,
    currency: '€',
    period: 'hour',
    features: [
      'Access 12:00 PM - 6:00 PM',
      'All court surfaces',
      'Equipment rental included',
      'Free cancellation',
      'Priority booking',
      'Complimentary drinks',
    ],
    isFeatured: true,
    badgeText: 'Most Popular',
  },
  {
    title: 'Weekend',
    price: 20,
    currency: '€',
    period: 'hour',
    features: [
      'Saturday & Sunday access',
      'All court surfaces',
      'Equipment rental included',
      'Free cancellation',
      'Group discounts available',
      'Extended booking window',
    ],
    isFeatured: false,
  },
];

/**
 * PricingSection component for landing page
 */
export function PricingSection({
  tiers = DEFAULT_TIERS,
  onSelectTier,
  className = '',
}: PricingSectionProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Pricing plans"
      className={className}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
        className="mb-12 text-center"
      >
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed">
            <span className="material-symbols-outlined text-3xl text-primary">
              monetization_on
            </span>
          </div>
        </div>
        <h2 className="font-headline text-headline-xl font-bold text-on-surface">
          Simple, Transparent Pricing
        </h2>
        <p className="mt-3 font-body text-body-lg text-on-surface/70">
          Choose the perfect plan for your tennis schedule
        </p>
      </motion.div>

      {/* Pricing cards grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <PricingCard
            key={tier.title}
            tier={tier}
            onSelect={onSelectTier}
          />
        ))}
      </div>

      {/* Additional info */}
      <motion.div
        initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.5,
          delay: shouldReduceMotion ? 0 : 0.3,
        }}
        className="mt-12 text-center"
      >
        <p className="font-body text-body text-on-surface/60">
          All prices include VAT. Member discounts available.
        </p>
        <p className="mt-2 font-body text-body text-on-surface/60">
          Need a custom plan?{' '}
          <a
            href="/contact"
            className="font-semibold text-primary hover:underline"
          >
            Contact us
          </a>
        </p>
      </motion.div>
    </section>
  );
}

export default PricingSection;
