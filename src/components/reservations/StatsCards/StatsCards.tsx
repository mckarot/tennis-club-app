/**
 * StatsCards Component
 *
 * Three statistics cards for court availability dashboard:
 * - Active Bookings
 * - Maintenance
 * - Available Slots
 *
 * @module @components/reservations/StatsCards
 */

import { motion, useReducedMotion } from 'framer-motion';

export interface StatsCardsProps {
  activeBookings: number;
  maintenanceCount: number;
  availableSlots: number;
  isLoading?: boolean;
  onCardClick?: (type: StatsType) => void;
}

export type StatsType = 'active' | 'maintenance' | 'available';

export interface StatCard {
  type: StatsType;
  label: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Get card configuration based on type
 */
function getCardConfig(type: StatsType, value: number): StatCard {
  const configs: Record<StatsType, Omit<StatCard, 'value'>> = {
    active: {
      type: 'active',
      label: 'Réservations actives',
      icon: 'event_available',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'Réservations confirmées',
    },
    maintenance: {
      type: 'maintenance',
      label: 'En maintenance',
      icon: 'build',
      color: 'text-error',
      bgColor: 'bg-error-container/20',
      description: 'Courts indisponibles',
    },
    available: {
      type: 'available',
      label: 'Créneaux libres',
      icon: 'check_circle',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      description: 'Disponibles maintenant',
    },
  };

  return {
    ...configs[type],
    value,
  };
}

interface StatCardProps {
  card: StatCard;
  onClick?: () => void;
  isLoading?: boolean;
}

function StatCardComponent({ card, onClick, isLoading }: StatCardProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-surface-container-lowest border border-surface-container-highest
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:border-primary/30 hover:shadow-lg' : ''}
      `}
      role={onClick ? 'button' : undefined}
      aria-label={`${card.label}: ${card.value}`}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-8xl">{card.icon}</span>
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.bgColor}`}>
            <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
          </div>
          <div>
            <h3 className="font-headline text-base font-semibold text-on-surface">
              {card.label}
            </h3>
            <p className="font-body text-body-xs text-on-surface-variant">
              {card.description}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2" role="status">
            <span className="material-symbols-outlined animate-spin text-primary">
              progress_activity
            </span>
            <span className="sr-only">Chargement...</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className={`font-headline text-4xl font-bold ${card.color}`}
          >
            {card.value}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function StatsCards({
  activeBookings,
  maintenanceCount,
  availableSlots,
  isLoading = false,
  onCardClick,
}: StatsCardsProps): JSX.Element {
  const cards: StatCard[] = [
    getCardConfig('active', activeBookings),
    getCardConfig('maintenance', maintenanceCount),
    getCardConfig('available', availableSlots),
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      role="region"
      aria-label="Court statistics"
    >
      {cards.map((card) => (
        <StatCardComponent
          key={card.type}
          card={card}
          onClick={onCardClick ? () => onCardClick(card.type) : undefined}
          isLoading={isLoading}
        />
      ))}
    </motion.div>
  );
}

export default StatsCards;
