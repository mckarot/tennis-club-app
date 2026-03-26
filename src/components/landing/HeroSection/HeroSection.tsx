/**
 * HeroSection Component
 *
 * Landing page hero section with gradient overlay, timezone badge, and dual CTA buttons.
 * Features Framer Motion animations and full accessibility support.
 *
 * Specifications:
 * - Height: h-[870px]
 * - Gradient overlay with backdrop image
 * - Timezone badge (America/Martinique)
 * - Two CTA buttons (Book Now, Learn More)
 *
 * @module @components/landing/HeroSection
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export interface HeroSectionProps {
  /** Main headline text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Background image URL */
  backgroundImage?: string;
  /** Primary CTA button text */
  primaryCtaText?: string;
  /** Primary CTA link href */
  primaryCtaHref?: string;
  /** Secondary CTA button text */
  secondaryCtaText?: string;
  /** Secondary CTA link href */
  secondaryCtaHref?: string;
  /** Timezone label for badge */
  timezoneLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * HeroSection component for landing page
 */
export function HeroSection({
  title = 'PRECISION ON THE CLAY.',
  subtitle = 'Experience the prestige of professional-grade courts at Tennis Club du François. Designed for those who demand excellence in every serve.',
  backgroundImage = 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1920&q=80',
  primaryCtaText = 'Register now',
  primaryCtaHref = '/register',
  secondaryCtaText = 'View Brackets',
  secondaryCtaHref = '/courts',
  timezoneLabel = 'America/Martinique',
  className = '',
}: HeroSectionProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle image load
  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      if (img.complete) {
        setIsImageLoaded(true);
      } else {
        const handleLoad = () => setIsImageLoaded(true);
        img.addEventListener('load', handleLoad);
        return () => img.removeEventListener('load', handleLoad);
      }
    }
  }, []);

  return (
    <section
      className={`relative h-[870px] w-full overflow-hidden ${className}`}
      aria-label="Hero section"
    >
      {/* Background image */}
      <div className="absolute inset-0 bg-surface-container-highest">
        <img
          ref={imageRef}
          src={backgroundImage}
          alt="Tennis court background"
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30"
        aria-hidden="true"
      />

      {/* Dark overlay for better text contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent"
        aria-hidden="true"
      />

      {/* Content container */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        {/* Timezone badge */}
        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.5,
            ease: 'easeOut',
            delay: shouldReduceMotion ? 0 : 0.2,
          }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 backdrop-blur-md"
          role="status"
          aria-label={`Local timezone: ${timezoneLabel}`}
        >
          <span className="material-symbols-outlined text-sm text-secondary">
            schedule
          </span>
          <span className="font-body text-sm font-semibold text-secondary">
            {timezoneLabel}
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            ease: 'easeOut',
            delay: shouldReduceMotion ? 0 : 0.3,
          }}
          className="font-headline text-6xl font-extrabold tracking-tighter text-on-surface md:text-8xl"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            ease: 'easeOut',
            delay: shouldReduceMotion ? 0 : 0.4,
          }}
          className="mt-4 max-w-2xl font-body text-body-lg text-on-surface/90 md:text-body-xl"
        >
          {subtitle}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            ease: 'easeOut',
            delay: shouldReduceMotion ? 0 : 0.5,
          }}
          className="mt-8 flex flex-col gap-4 sm:flex-row"
        >
          {/* Primary CTA */}
          <a
            href={primaryCtaHref}
            className="group inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-4 font-body font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={primaryCtaText}
          >
            <span>{primaryCtaText}</span>
            <span className="material-symbols-outlined text-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              arrow_forward
            </span>
          </a>

          {/* Secondary CTA */}
          <a
            href={secondaryCtaHref}
            className="group inline-flex items-center justify-center gap-2 rounded-md border-2 border-secondary bg-transparent px-8 py-4 font-body font-bold text-secondary shadow-lg transition-all duration-200 hover:bg-secondary/5 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            aria-label={secondaryCtaText}
          >
            <span>{secondaryCtaText}</span>
            <span className="material-symbols-outlined text-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              arrow_forward
            </span>
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1,
            delay: shouldReduceMotion ? 0 : 1,
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-body text-body-xs text-on-surface/60">
              Scroll
            </span>
            <span className="material-symbols-outlined text-on-surface/60">
              keyboard_arrow_down
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
