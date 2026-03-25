import type { ReservationStatus as ReservationStatusType } from '../../../types/reservation.types';
import type { BadgeVariant } from '../../ui/Badge/Badge.types';
import type { ReservationType } from '../../../types/reservation.types';

export interface StatusBadgeConfig {
  label: string;
  variant: BadgeVariant;
}

export const statusBadgeConfig: Record<ReservationStatusType, StatusBadgeConfig> = {
  confirmed: { label: 'Confirmé', variant: 'success' },
  pending: { label: 'En attente', variant: 'warning' },
  pending_payment: { label: 'Paiement en attente', variant: 'warning' },
  cancelled: { label: 'Annulé', variant: 'danger' },
  completed: { label: 'Terminé', variant: 'neutral' },
};

export const typeLabels: Record<ReservationType, string> = {
  location_libre: 'Location Libre',
  cours_collectif: 'Cours Collectif',
  cours_private: 'Cours Particulier',
  individual: 'Simple',
  doubles: 'Double',
  training: 'Entraînement',
  tournament: 'Tournoi',
  maintenance: 'Maintenance',
};
