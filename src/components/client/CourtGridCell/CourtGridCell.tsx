/**
 * CourtGridCell Component
 *
 * Atomic court grid cell with 4 states per PNG audit:
 * - available: fond blanc, border mint #E8F8F0, texte "+"
 * - confirmed-quick: fond vert #006B3F, texte blanc
 * - confirmed-terre: fond terracotta #9E4B1D, texte blanc
 * - maintenance: fond gris, border dashed, icône wrench
 *
 * @module @components/client/CourtGridCell
 */

import { motion } from 'framer-motion';
import type { CourtGridCell as CourtGridCellType } from '../../../types/client-dashboard.types';

interface CourtGridCellProps {
  cell: CourtGridCellType;
  onClick?: (cell: CourtGridCellType) => void;
}

export function CourtGridCell({ cell, onClick }: CourtGridCellProps) {
  const getStateStyles = () => {
    switch (cell.state) {
      case 'available':
        return {
          bg: 'bg-surface-container-lowest',
          border: 'border-2 border-mint',
          text: 'text-on-surface/40',
          content: '+',
        };
      case 'confirmed-quick':
        return {
          bg: 'bg-primary',
          border: 'border-0',
          text: 'text-white',
          content: cell.courtName,
        };
      case 'confirmed-terre':
        return {
          bg: 'bg-terracotta',
          border: 'border-0',
          text: 'text-white',
          content: cell.courtName,
        };
      case 'maintenance':
        return {
          bg: 'bg-surface-container-highest',
          border: 'border-2 border-dashed border-on-surface/30',
          text: 'text-on-surface/60',
          content: (
            <span
              className="material-symbols-outlined text-2xl"
              aria-hidden="true"
            >
              build
            </span>
          ),
        };
      default:
        return {
          bg: 'bg-surface-container-lowest',
          border: 'border-2 border-mint',
          text: 'text-on-surface/40',
          content: '+',
        };
    }
  };

  const styles = getStateStyles();

  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}h`;
  };

  const ariaLabel = `${cell.courtName} - ${formatHour(cell.hour)} - ${
    cell.state === 'available' ? 'Disponible' : cell.state === 'maintenance' ? 'Maintenance' : 'Réservé'
  }`;

  return (
    <motion.button
      className={`flex h-16 w-full flex-col items-center justify-center rounded-lg ${styles.bg} ${styles.border} ${styles.text} transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
      whileHover={
        cell.state !== 'maintenance'
          ? { scale: 1.05, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }
          : {}
      }
      whileTap={cell.state !== 'maintenance' ? { scale: 0.98 } : {}}
      onClick={() => cell.state !== 'maintenance' && onClick?.(cell)}
      disabled={cell.state === 'maintenance'}
      role="button"
      aria-label={ariaLabel}
      tabIndex={cell.state === 'maintenance' ? -1 : 0}
    >
      {typeof styles.content === 'string' ? (
        <span className="font-body text-body-sm font-medium">{styles.content}</span>
      ) : (
        styles.content
      )}
      {cell.state === 'available' && (
        <span className="mt-0.5 font-body text-label text-on-surface/60">
          {formatHour(cell.hour)}
        </span>
      )}
    </motion.button>
  );
}

export default CourtGridCell;
