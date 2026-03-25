/**
 * Landing Page
 *
 * Home page for Tennis Club du François.
 * Composes 6 major sections: TopNavBar, HeroSection, LiveAvailabilityGrid,
 * PricingSection, FacilitiesBentoGrid, and Footer.
 *
 * Features:
 * - Real-time court availability data
 * - Responsive design
 * - Framer Motion animations
 * - Full accessibility support (WCAG 2.1 AA)
 *
 * @module @pages/LandingPage
 */

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLandingData } from '../hooks/useLandingData';
import { TopNavBar } from '../components/landing/TopNavBar/TopNavBar';
import { HeroSection } from '../components/landing/HeroSection/HeroSection';
import { LiveAvailabilityGrid } from '../components/landing/LiveAvailabilityGrid/LiveAvailabilityGrid';
import { PricingSection } from '../components/landing/PricingSection/PricingSection';
import { FacilitiesBentoGrid } from '../components/landing/FacilitiesBentoGrid/FacilitiesBentoGrid';
import { Footer } from '../components/landing/Footer/Footer';
import type { PricingTier } from '../components/landing/PricingCard/PricingCard';

export function LandingPage(): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const { courts, isLoading, error } = useLandingData();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle book court click
  const handleBookClick = (courtId: string): void => {
    console.log('[LandingPage] Book court:', courtId);
    window.location.href = `/courts?court=${courtId}`;
  };

  // Handle tier selection
  const handleSelectTier = (tier: PricingTier): void => {
    console.log('[LandingPage] Select tier:', tier.title);
    window.location.href = `/courts?tier=${encodeURIComponent(tier.title)}`;
  };

  // Handle search click
  const handleSearchClick = (): void => {
    console.log('[LandingPage] Search clicked');
    const searchQuery = prompt('Search courts, facilities, or services:');
    if (searchQuery) {
      window.location.href = `/courts?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Scroll to top
  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <TopNavBar
        onSearchClick={handleSearchClick}
        onLoginClick={() => {
          window.location.href = '/login';
        }}
      />

      {/* Main content */}
      <main id="main-content" role="main">
        {/* Hero Section */}
        <HeroSection
          title="Tennis Club du François"
          subtitle="Réservez vos courts et cours de tennis en toute simplicité"
          primaryCtaText="Réserver un court"
          primaryCtaHref="#courts"
          secondaryCtaText="En savoir plus"
          secondaryCtaHref="/about"
          timezoneLabel="America/Martinique"
        />

        {/* Live Availability Grid Section */}
        <section
          id="courts"
          className="mx-auto max-w-7xl px-4 py-20"
          aria-label="Court availability section"
        >
          <LiveAvailabilityGrid
            courts={courts}
            isLoading={isLoading}
            error={error}
            onBookClick={handleBookClick}
          />
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="bg-surface-container-low py-20"
          aria-label="Pricing section"
        >
          <div className="mx-auto max-w-7xl px-4">
            <PricingSection onSelectTier={handleSelectTier} />
          </div>
        </section>

        {/* Facilities Bento Grid Section */}
        <section
          id="facilities"
          className="mx-auto max-w-7xl px-4 py-20"
          aria-label="Facilities section"
        >
          <FacilitiesBentoGrid />
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          className="mx-auto max-w-7xl px-4 py-20"
          aria-label="Call to action section"
        >
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center shadow-2xl">
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h2 className="font-headline text-display-sm font-bold text-on-primary">
                Ready to Play?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl font-body text-body-lg text-on-primary/90">
                Join Tennis Club du François today and experience world-class facilities,
                expert coaching, and a vibrant tennis community.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface px-8 py-4 font-body text-body font-semibold text-on-surface shadow-lg transition-all duration-200 hover:bg-surface-container hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-surface focus:ring-offset-2 focus:ring-offset-primary"
                  aria-label="Create an account"
                >
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  <span>Join Now</span>
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-container px-8 py-4 font-body text-body font-semibold text-on-primary-container shadow-lg transition-all duration-200 hover:bg-primary-fixed hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-surface focus:ring-offset-2 focus:ring-offset-primary"
                  aria-label="Contact us"
                >
                  <span className="material-symbols-outlined text-lg">mail</span>
                  <span>Contact Us</span>
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to top button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-200 hover:bg-primary-container hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
          showScrollTop ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-label="Scroll to top"
        aria-hidden={!showScrollTop}
      >
        <span className="material-symbols-outlined text-on-primary">
          keyboard_arrow_up
        </span>
      </motion.button>
    </div>
  );
}

export default LandingPage;
