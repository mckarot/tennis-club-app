/**
 * StatsCardsGrid Component
 *
 * Responsive grid displaying 3 stat cards.
 * 1 column on mobile, 3 columns on desktop.
 *
 * @module @components/client/StatsCardsGrid
 */

import type { DashboardStats } from '../../../types/client-dashboard.types';
import type { StatCardData } from '../../../types/client-dashboard.types';
import { StatCard } from '../StatCard/StatCard';

interface StatsCardsGridProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function StatsCardsGrid({ stats, loading = false }: StatsCardsGridProps) {
  const statCards: StatCardData[] = [
    {
      id: 'active-bookings',
      label: 'Réservations actives',
      value: stats.activeBookings,
      icon: 'event',
      trend: 'neutral',
    },
    {
      id: 'maintenance',
      label: 'Courts en maintenance',
      value: stats.maintenanceCount,
      icon: 'construction',
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
    <section
      className="grid gap-4 sm:grid-cols-1 md:grid-cols-3"
      aria-label="Statistiques du tableau de bord"
      role="region"
    >
      {statCards.map((stat, index) => (
        <StatCard key={stat.id} stat={stat} loading={loading} />
      ))}
    </section>
  );
}

export default StatsCardsGrid;
