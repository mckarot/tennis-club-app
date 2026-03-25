/**
 * PricingCard Component (Landing Page)
 *
 * Individual pricing tier card with featured option support.
 * Features Framer Motion animations and full accessibility support.
 *
 * Specifications:
 * - 3 tiers: Morning, Prime Time, Weekend
 * - Central tier with bg-primary and "Popular" badge
 * - Feature list with checkmarks
 * - CTA button
 *
 * @module @components/landing/PricingCard
 */

import { motion, useReducedMotion } from 'framer-motion';

export interface PricingTier {
  /** Tier name */
  title: string;
  /** Price amount */
  price: number;
  /** Currency symbol */
  currency: string;
  /** Billing period */
  period: string;
  /** List of features */
  features: string[];
  /** Whether this is the featured/popular tier */
  isFeatured?: boolean;
  /** Badge text for featured tier */
  badgeText?: string;
}

export interface PricingCardProps {
  /** Pricing tier data */
  tier: PricingTier;
  /** Click handler for selection */
  onSelect?: (tier: PricingTier) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PricingCard component for landing page
 */
export function PricingCard({
  tier,
  onSelect,
  className = '',
}: PricingCardProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const { title, price, currency, period, features, isFeatured = false, badgeText = 'Popular' } = tier;

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: 'easeOut',
      }}
      whileHover={{
        y: shouldReduceMotion ? 0 : -8,
        transition: { duration: 0.2 },
      }}
      className={`relative flex flex-col rounded-3xl p-8 transition-shadow duration-200 ${
        isFeatured
          ? 'bg-primary shadow-xl'
          : 'bg-surface-container-lowest shadow-lg'
      } ${className}`}
      role="article"
      aria-label={`${title} pricing tier`}
    >
      {/* Popular badge */}
      {isFeatured && (
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <span className="inline-flex items-center rounded-full bg-tertiary px-4 py-1 font-body text-body-xs font-bold text-white shadow-lg">
            <span className="material-symbols-outlined mr-1 text-sm">star</span>
            {badgeText}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 text-center">
        <h3
          className={`font-headline text-headline-lg font-semibold ${
            isFeatured ? 'text-on-primary' : 'text-on-surface'
          }`}
        >
          {title}
        </h3>

        {/* Price */}
        <div className="mt-4 flex items-baseline justify-center">
          <span
            className={`font-body text-body-lg ${
              isFeatured ? 'text-on-primary/80' : 'text-on-surface/60'
            }`}
          >
            {currency}
          </span>
          <span
            className={`font-headline text-display-lg font-bold ${
              isFeatured ? 'text-on-primary' : 'text-on-surface'
            }`}
          >
            {price}
          </span>
          <span
            className={`font-body text-body ${
              isFeatured ? 'text-on-primary/80' : 'text-on-surface/60'
            }`}
          >
            /{period}
          </span>
        </div>
      </div>

      {/* Features */}
      <ul className="mb-8 space-y-4 flex-1" role="list">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-3"
          >
            <span
              className={`material-symbols-outlined text-lg ${
                isFeatured ? 'text-on-primary' : 'text-primary'
              }`}
              aria-hidden="true"
            >
              check_circle
            </span>
            <span
              className={`font-body text-body ${
                isFeatured ? 'text-on-primary/90' : 'text-on-surface'
              }`}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <button
        onClick={() => onSelect?.(tier)}
        className={`group inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-body text-body font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isFeatured
            ? 'bg-surface text-on-surface hover:bg-surface-container hover:shadow-lg active:scale-95 focus:ring-offset-primary'
            : 'bg-primary text-on-primary hover:bg-primary-container hover:shadow-lg active:scale-95 focus:ring-offset-surface-container-lowest'
        }`}
        aria-label={`Select ${title} tier`}
      >
        <span>Choose {title}</span>
        <span
          className={`material-symbols-outlined text-lg transition-transform duration-200 group-hover:translate-x-1 ${
            isFeatured ? 'text-on-surface' : 'text-on-primary'
          }`}
          aria-hidden="true"
        >
          arrow_forward
        </span>
      </button>
    </motion.div>
  );
}

export default PricingCard;
