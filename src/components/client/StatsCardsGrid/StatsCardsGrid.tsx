/**
 * StatsCardsGrid Component
 * 
 * Grid of 3 stat cards: Active Bookings, Maintenance, Available Slots
 * PNG spec: 3 cards grid, bg-surface-container-low, text-3xl font-extrabold
 */

import { motion, useReducedMotion } from 'framer-motion';
import { StatCard } from '../StatCard/StatCard';
import type { DashboardStats } from '../../../types/client-dashboard.types';
import type { StatCardData } from '../../../types/client-dashboard.types';

export interface StatsCardsGridProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export function StatsCardsGrid({
  stats,
  isLoading = false,
}: StatsCardsGridProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  // Transform stats into StatCardData array
  const statCards: StatCardData[] = [
    {
      id: 'active-bookings',
      label: 'Réservations actives',
      value: stats.activeBookings,
      icon: 'event_available',
      trend: 'neutral',
    },
    {
      id: 'maintenance',
      label: 'Courts en maintenance',
      value: stats.maintenanceCount,
      icon: 'build',
      trend: 'neutral',
    },
    {
      id: 'available-slots',
      label: 'Créneaux disponibles',
      value: stats.availableSlots,
      icon: 'schedule',
      trend: 'up',
      trendValue: 12,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      role="region"
      aria-label="Statistiques du tableau de bord"
    >
      {statCards.map((stat, index) => (
        <StatCard
          key={stat.id}
          stat={stat}
          isLoading={isLoading}
        />
      ))}
    </motion.div>
  );
}
