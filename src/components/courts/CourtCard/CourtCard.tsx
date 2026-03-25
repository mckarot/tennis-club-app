import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from '../../ui/Badge/Badge';
import { Card } from '../../ui/Card/Card';
import type { Court } from '../../../types/court.types';
import type { CourtStatus } from './CourtCard.types';
import { statusBadgeConfig } from './CourtCard.types';

export interface CourtCardProps {
  court: Court;
  onClick?: () => void;
  className?: string;
}

export function CourtCard({ court, onClick, className = '' }: CourtCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const statusConfig = statusBadgeConfig[court.status];

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
    >
      <Card
      variant="default"
      onClick={onClick}
      className={`bg-surface-container-lowest p-8 rounded-xl shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-headline text-headline-lg font-semibold mb-1">
            {court.name}
          </h3>
          <p className="font-body text-body text-on-surface/60">
            Terrain {court.number}
          </p>
        </div>
        <Badge
          variant={statusConfig.variant}
          withDot={statusConfig.withDot}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Image */}
      {court.image && (
        <div className="mb-4 rounded-xl overflow-hidden h-48">
          <img
            src={court.image}
            alt={court.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface/60">
            sports_tennis
          </span>
          <span className="font-body text-body-sm">{court.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface/60">
            landscape
          </span>
          <span className="font-body text-body-sm">{court.surface}</span>
        </div>
      </div>

      {/* Description */}
      {court.description && (
        <p className="font-body text-body text-on-surface/80 mb-4">
          {court.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              court.is_active ? 'bg-primary' : 'bg-surface-container-highest'
            }`}
          />
          <span className="font-body text-body-sm text-on-surface/60">
            {court.is_active ? 'Actif' : 'Inactif'}
          </span>
        </div>
        {onClick && (
          <button
            onClick={onClick}
            className="font-body text-body-sm text-primary font-semibold hover:underline"
            aria-label={`Réserver ${court.name}`}
          >
            Réserver →
          </button>
        )}
      </div>
    </Card>
    </motion.div>
  );
}
