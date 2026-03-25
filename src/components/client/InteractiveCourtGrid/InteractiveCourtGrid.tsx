/**
 * InteractiveCourtGrid Component
 * 
 * Responsive court grid: 7 columns × 8 rows
 * PNG spec: h-16 cells, gap-2
 */

import { motion, useReducedMotion } from 'framer-motion';
import { CourtGridCell } from '../CourtGridCell/CourtGridCell';
import type { CourtGridCell as CourtGridCellType } from '../../../types/client-dashboard.types';

export interface InteractiveCourtGridProps {
  grid: CourtGridCellType[][];
  isLoading?: boolean;
  onCellClick?: (cell: CourtGridCellType) => void;
}

export function InteractiveCourtGrid({
  grid,
  isLoading = false,
  onCellClick,
}: InteractiveCourtGridProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.02,
      },
    },
  };

  const cellVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' },
    },
  };

  if (isLoading) {
    return (
      <div
        className="bg-surface-container-lowest rounded-xl p-6 shadow-sm"
        aria-busy="true"
        aria-label="Chargement du grille des courts"
      >
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 56 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-surface-container-highest rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-surface-container-lowest rounded-xl p-6 shadow-sm"
      role="grid"
      aria-label="Grille interactive des courts"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline text-headline-md font-semibold text-on-surface">
          Disponibilité des courts
        </h2>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-success-container/20 border border-success-container" />
              <span className="font-body text-body-xs text-on-surface-variant">Libre</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary-fixed/30 border border-primary-fixed" />
              <span className="font-body text-body-xs text-on-surface-variant">Réservé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-surface-container-highest border border-surface-container-highest opacity-60" />
              <span className="font-body text-body-xs text-on-surface-variant">Maintenance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-secondary-container/30 border border-secondary-container" />
              <span className="font-body text-body-xs text-on-surface-variant">En attente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max grid grid-cols-7 gap-2">
          {grid.map((courtCells, courtIndex) => (
            <motion.div
              key={courtCells[0]?.courtId || `court-${courtIndex}`}
              variants={cellVariants}
              className="flex flex-col gap-2"
              role="row"
            >
              {/* Court Header */}
              <div className="text-center mb-1">
                <span className="font-headline text-body-sm font-bold text-on-surface">
                  Court {courtCells[0]?.courtNumber || courtIndex + 1}
                </span>
              </div>

              {/* Cells */}
              {courtCells.map((cell) => (
                <CourtGridCell
                  key={cell.id}
                  cell={cell}
                  onClick={onCellClick}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile scroll hint */}
      <div className="flex items-center justify-center gap-2 mt-4 text-on-surface-variant lg:hidden">
        <span className="material-symbols-outlined text-sm">swipe</span>
        <span className="font-body text-body-xs">Faites défiler pour voir plus</span>
      </div>
    </motion.div>
  );
}
