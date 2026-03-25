/**
 * CourtHeader type definitions
 */

import type { CourtType } from '../../../types/court.types';

/**
 * Court header props
 */
export interface CourtHeaderProps {
  courtNumber: number;
  courtName: string;
  courtType: CourtType;
  isActive: boolean;
  onClick?: () => void;
}

/**
 * Court type badge configuration
 */
export const courtTypeBadgeStyles: Record<CourtType, string> = {
  Quick: 'bg-primary-fixed text-on-primary-fixed',
  Terre: 'bg-secondary-fixed text-on-secondary-fixed',
};
