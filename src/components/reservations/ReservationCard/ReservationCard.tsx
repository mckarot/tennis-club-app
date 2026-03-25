import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from '../../ui/Badge/Badge';
import { Card } from '../../ui/Card/Card';
import { Button } from '../../ui/Button/Button';
import type { Reservation } from '../../../types/reservation.types';
import type { ReservationStatus } from './ReservationCard.types';
import type { Timestamp } from 'firebase/firestore';
import { statusBadgeConfig, typeLabels } from './ReservationCard.types';

export interface ReservationCardProps {
  reservation: Reservation;
  courtName?: string;
  userName?: string;
  onAction?: (action: 'cancel' | 'confirm' | 'complete') => void;
  className?: string;
}

export function ReservationCard({
  reservation,
  courtName = 'Terrain',
  userName = 'Utilisateur',
  onAction,
  className = '',
}: ReservationCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const statusConfig = statusBadgeConfig[reservation.status];

  const formatTime = (timestamp: Timestamp | Date | null) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Martinique',
    });
  };

  const formatDate = (timestamp: Timestamp | Date | null) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Martinique',
    });
  };

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
    >
      <Card variant="default" className={`bg-surface-container-lowest p-6 rounded-2xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-headline text-headline-md font-semibold mb-1">
            {reservation.title || typeLabels[reservation.type]}
          </h3>
          <p className="font-body text-body-sm text-on-surface/60">
            {courtName}
          </p>
        </div>
        <Badge variant={statusConfig.variant} withDot>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-on-surface/80">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          <span className="font-body text-body-sm capitalize">{formatDate(reservation.start_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-on-surface/80">
          <span className="material-symbols-outlined text-sm">schedule</span>
          <span className="font-body text-body-sm">
            {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)} (America/Martinique)
          </span>
        </div>
        {reservation.participants && (
          <div className="flex items-center gap-2 text-on-surface/80">
            <span className="material-symbols-outlined text-sm">people</span>
            <span className="font-body text-body-sm">{reservation.participants} participant(s)</span>
          </div>
        )}
      </div>

      {/* Description */}
      {reservation.description && (
        <p className="font-body text-body text-on-surface/80 mb-4 line-clamp-2">
          {reservation.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-container-highest">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface/60">person</span>
          <span className="font-body text-body-sm text-on-surface/60">{userName}</span>
        </div>
        <div className="flex gap-2">
          {onAction && reservation.status === 'pending' && (
            <>
              <Button variant="tertiary" size="small" onClick={() => onAction('confirm')}>
                Confirmer
              </Button>
              <Button variant="danger" size="small" onClick={() => onAction('cancel')}>
                Annuler
              </Button>
            </>
          )}
          {onAction && reservation.status === 'confirmed' && (
            <Button variant="ghost" size="small" onClick={() => onAction('complete')}>
              Marquer comme terminé
            </Button>
          )}
        </div>
      </div>
    </Card>
    </motion.div>
  );
}
