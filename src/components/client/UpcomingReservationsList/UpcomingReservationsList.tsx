/**
 * UpcomingReservationsList Component
 * 
 * Right sidebar with list of upcoming reservations
 * PNG spec: Right sidebar, court badge, time, client name, status dot
 */

import { motion, useReducedMotion } from 'framer-motion';
import { ReservationCard } from '../ReservationCard/ReservationCard';
import type { UpcomingReservation } from '../../../types/client-dashboard.types';

export interface UpcomingReservationsListProps {
  reservations: UpcomingReservation[];
  isLoading?: boolean;
  onReservationClick?: (reservation: UpcomingReservation) => void;
}

export function UpcomingReservationsList({
  reservations,
  isLoading = false,
  onReservationClick,
}: UpcomingReservationsListProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  if (isLoading) {
    return (
      <div
        className="bg-surface-container-lowest rounded-xl p-6 shadow-sm"
        aria-busy="true"
        aria-label="Chargement des réservations à venir"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-surface-container-highest rounded-full animate-pulse" />
          <div className="w-32 h-6 bg-surface-container-highest rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-low rounded-lg p-4 animate-pulse"
            >
              <div className="w-20 h-6 bg-surface-container-highest rounded mb-3" />
              <div className="w-24 h-5 bg-surface-container-highest rounded mb-2" />
              <div className="w-16 h-4 bg-surface-container-highest rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-surface-container-lowest rounded-xl p-6 shadow-sm"
      role="complementary"
      aria-label="Réservations à venir"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">
          event_upcoming
        </span>
        <h2 className="font-headline text-headline-sm font-semibold text-on-surface">
          Réservations à venir
        </h2>
      </div>

      {/* List */}
      {reservations.length === 0 ? (
        <div
          className="text-center py-8"
          role="status"
          aria-label="Aucune réservation à venir"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">
              event_busy
            </span>
          </div>
          <p className="font-body text-body-md text-on-surface-variant">
            Aucune réservation à venir
          </p>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Réservez un court pour commencer
          </p>
        </div>
      ) : (
        <div className="space-y-3" role="list">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onClick={onReservationClick}
            />
          ))}
        </div>
      )}

      {/* View All Link */}
      {reservations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-surface-container-highest">
          <button
            type="button"
            aria-label="Voir toutes les réservations"
            className="
              w-full inline-flex items-center justify-center gap-2
              font-body text-body-sm font-medium text-primary
              hover:text-primary-container
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-fixed
            "
          >
            Voir toutes les réservations
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      )}
    </motion.aside>
  );
}
