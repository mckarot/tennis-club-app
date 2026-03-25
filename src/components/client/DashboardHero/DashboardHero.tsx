/**
 * DashboardHero Component
 * 
 * Hero section with gradient overlay, welcome message, and 2 CTAs
 * Height: h-[320px] per PNG audit
 * Gradient: emerald-950/80 → emerald-900/40
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { DashboardHeroProps } from '../../types/client-dashboard.types';

export function DashboardHero({
  userName,
  onBookNowClick,
  onViewScheduleClick,
}: DashboardHeroProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.4,
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative h-[320px] w-full overflow-hidden rounded-2xl"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/tennis-court-hero.jpg')",
        }}
        aria-hidden="true"
      />

      {/* Gradient Overlay - Design System: primary colors */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary-container/60 to-primary-fixed/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end p-8">
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="font-headline text-headline-lg font-bold text-white">
            Bonjour, {userName}
          </h1>
          <p className="font-body text-body-lg text-on-surface-variant mt-2">
            Prêt à jouer aujourd'hui ?
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-4"
        >
          {/* Book Now CTA */}
          <button
            onClick={onBookNowClick}
            aria-label="Réserver un court maintenant"
            className="
              inline-flex items-center gap-2
              bg-primary-container hover:bg-primary
              text-on-primary-container hover:text-on-primary
              font-headline text-body-lg font-semibold
              px-6 py-3 rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-fixed
            "
          >
            <span className="material-symbols-outlined">calendar_add_on</span>
            Réserver
          </button>

          {/* View Schedule CTA */}
          <button
            onClick={onViewScheduleClick}
            aria-label="Voir mon emploi du temps"
            className="
              inline-flex items-center gap-2
              bg-surface-container-highest hover:bg-surface-container
              text-on-surface
              font-headline text-body-lg font-semibold
              px-6 py-3 rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-fixed
            "
          >
            <span className="material-symbols-outlined">event_note</span>
            Voir l'emploi du temps
          </button>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/10 rounded-full blur-3xl"
        aria-hidden="true"
      />
    </motion.div>
  );
}
