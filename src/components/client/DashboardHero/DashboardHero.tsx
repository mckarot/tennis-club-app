/**
 * DashboardHero Component
 *
 * Hero section with gradient overlay and welcome message.
 * Primary CTA: "Réserver un court" (gradient primary → primary-container).
 * Secondary CTA: "Voir planning" (optional).
 *
 * @module @components/client/DashboardHero
 */

import { motion } from 'framer-motion';

interface DashboardHeroProps {
  userName: string;
  onBookNowClick?: () => void;
  onViewScheduleClick?: () => void;
}

export function DashboardHero({
  userName,
  onBookNowClick,
  onViewScheduleClick,
}: DashboardHeroProps) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-container p-8 sm:p-12"
      aria-label="Section de bienvenue"
      role="banner"
    >
      {/* Background Pattern (decorative) - Inline SVG as background */}
      <div
        className="absolute inset-0 opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Welcome Text */}
        <motion.h1
          className="font-headline text-display-md font-bold text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Bonjour, {userName}
        </motion.h1>

        <motion.p
          className="mt-2 font-body text-body-lg text-white/90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Réservez vos courts en toute simplicité
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-6 flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Primary CTA: Book Now */}
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-body text-body font-semibold text-primary transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            onClick={onBookNowClick}
            aria-label="Réserver un court maintenant"
          >
            <span
              className="material-symbols-outlined text-lg"
              aria-hidden="true"
            >
              add_circle
            </span>
            Réserver un court
          </button>

          {/* Secondary CTA: View Schedule */}
          {onViewScheduleClick && (
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-body text-body font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
              onClick={onViewScheduleClick}
              aria-label="Voir le planning des courts"
            >
              <span
                className="material-symbols-outlined text-lg"
                aria-hidden="true"
              >
                calendar_month
              </span>
              Voir planning
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default DashboardHero;
