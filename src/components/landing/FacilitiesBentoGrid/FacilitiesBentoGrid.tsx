/**
 * FacilitiesBentoGrid Component
 *
 * Bento grid layout showcasing 4 club facilities.
 * Features Framer Motion animations and full accessibility support.
 *
 * Specifications:
 * - Bento grid: md:grid-cols-4 md:grid-rows-2
 * - 4 cards: Clubhouse, Bistro, Night Play, Pro Coaching
 * - Varied card sizes in bento layout
 *
 * @module @components/landing/FacilitiesBentoGrid
 */

import { motion, useReducedMotion } from 'framer-motion';

export interface FacilityCard {
  /** Facility title */
  title: string;
  /** Facility description */
  description: string;
  /** Material icon name */
  icon: string;
  /** Grid size variant */
  size: 'small' | 'medium' | 'large';
  /** Background image URL (optional) */
  backgroundImage?: string;
  /** Link URL */
  link?: string;
}

export interface FacilitiesBentoGridProps {
  /** Facilities data */
  facilities?: FacilityCard[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default facilities data
 */
const DEFAULT_FACILITIES: FacilityCard[] = [
  {
    title: 'Clubhouse',
    description: 'Modern lounge with panoramic court views, comfortable seating, and complimentary Wi-Fi. Perfect for relaxing before or after your match.',
    icon: 'club',
    size: 'large',
    link: '/about#clubhouse',
  },
  {
    title: 'Bistro',
    description: 'Fresh refreshments, tropical smoothies, and light meals. Enjoy our terrace overlooking the courts.',
    icon: 'lunch_dining',
    size: 'small',
    link: '/about#bistro',
  },
  {
    title: 'Night Play',
    description: 'Professional LED lighting on all courts for evening sessions. Book until 10 PM with our night package.',
    icon: 'light_mode',
    size: 'small',
    link: '/about#night-play',
  },
  {
    title: 'Pro Coaching',
    description: 'Certified coaches available for private lessons and group clinics. All skill levels welcome, from beginners to competitive players.',
    icon: 'sports_tennis',
    size: 'medium',
    link: '/about#coaching',
  },
];

/**
 * FacilitiesBentoGrid component for landing page
 */
export function FacilitiesBentoGrid({
  facilities = DEFAULT_FACILITIES,
  className = '',
}: FacilitiesBentoGridProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  // Grid size mapping
  const sizeClasses: Record<string, string> = {
    small: 'md:col-span-2 md:row-span-1',
    medium: 'md:col-span-2 md:row-span-2',
    large: 'md:col-span-4 md:row-span-2',
  };

  return (
    <section
      aria-label="Club facilities"
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
              resort
            </span>
          </div>
        </div>
        <h2 className="font-headline text-headline-xl font-bold text-on-surface">
          World-Class Facilities
        </h2>
        <p className="mt-3 font-body text-body-lg text-on-surface/70">
          Everything you need for the perfect tennis experience
        </p>
      </motion.div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-2">
        {facilities.map((facility, index) => (
          <motion.div
            key={facility.title}
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.4,
              delay: shouldReduceMotion ? 0 : index * 0.1,
            }}
            whileHover={{
              y: shouldReduceMotion ? 0 : -4,
              transition: { duration: 0.2 },
            }}
            className={`group relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-sm transition-shadow duration-200 hover:shadow-xl ${sizeClasses[facility.size]}`}
          >
            {/* Optional background image overlay */}
            {facility.backgroundImage && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${facility.backgroundImage})` }}
                aria-hidden="true"
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col">
              {/* Icon */}
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed">
                <span className="material-symbols-outlined text-2xl text-primary">
                  {facility.icon}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-headline text-headline-md font-semibold text-on-surface">
                {facility.title}
              </h3>

              {/* Description */}
              <p className="mt-3 flex-1 font-body text-body text-on-surface/80">
                {facility.description}
              </p>

              {/* Link */}
              {facility.link && (
                <a
                  href={facility.link}
                  className="mt-4 inline-flex items-center gap-2 font-body text-body-sm font-semibold text-primary transition-colors duration-200 hover:text-primary-container group/link"
                  aria-label={`Learn more about ${facility.title}`}
                >
                  <span>Learn more</span>
                  <span
                    className="material-symbols-outlined text-sm transition-transform duration-200 group-hover/link:translate-x-1"
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </a>
              )}
            </div>

            {/* Hover gradient overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />
          </motion.div>
        ))}
      </div>

      {/* Additional info */}
      <motion.div
        initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.5,
          delay: shouldReduceMotion ? 0 : 0.4,
        }}
        className="mt-12 text-center"
      >
        <p className="font-body text-body text-on-surface/60">
          Want to see more?{' '}
          <a
            href="/about"
            className="font-semibold text-primary hover:underline"
          >
            Explore all amenities
          </a>
        </p>
      </motion.div>
    </section>
  );
}

export default FacilitiesBentoGrid;
