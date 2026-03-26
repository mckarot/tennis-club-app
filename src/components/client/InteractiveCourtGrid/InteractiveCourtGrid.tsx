/**
 * InteractiveCourtGrid Component
 *
 * Grid 7×8 displaying court availability in real-time.
 * Header: 7 courts with name + surface.
 * Rows: 8 time slots (6h, 8h, 10h, 12h, 14h, 16h, 18h, 20h).
 *
 * @module @components/client/InteractiveCourtGrid
 */

import { CourtGridCell } from '../CourtGridCell/CourtGridCell';
import type { CourtGridCell as CourtGridCellType } from '../../../types/client-dashboard.types';

interface InteractiveCourtGridProps {
  cells: CourtGridCellType[][];
  loading?: boolean;
  onCellClick?: (cell: CourtGridCellType) => void;
}

const GRID_TOTAL_ROWS = 8;
const GRID_START_HOUR = 6;

export function InteractiveCourtGrid({
  cells,
  loading = false,
  onCellClick,
}: InteractiveCourtGridProps) {
  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}h`;
  };

  const getCourtTypeLabel = (type: string): string => {
    return type === 'Quick' ? 'Quick' : 'Terre';
  };

  if (loading) {
    return (
      <section
        className="space-y-4"
        aria-label="Grille des courts"
        role="region"
        aria-busy="true"
      >
        {/* Header Skeleton */}
        <div className="grid grid-cols-8 gap-2">
          <div className="h-12" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-surface-container-highest"
            />
          ))}
        </div>

        {/* Grid Skeleton */}
        {Array.from({ length: GRID_TOTAL_ROWS }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-8 gap-2">
            <div className="h-16 animate-pulse rounded-lg bg-surface-container-highest" />
            {Array.from({ length: 7 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-16 animate-pulse rounded-lg bg-surface-container-highest"
              />
            ))}
          </div>
        ))}
      </section>
    );
  }

  if (cells.length === 0) {
    return (
      <section
        className="flex h-64 items-center justify-center rounded-xl bg-surface-container-low p-8"
        aria-label="Grille des courts"
        role="region"
      >
        <div className="text-center">
          <span
            className="material-symbols-outlined text-4xl text-on-surface/40"
            aria-hidden="true"
          >
            sports_tennis
          </span>
          <p className="mt-4 font-body text-body-lg text-on-surface/70">
            Aucun court disponible pour le moment
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="space-y-4 overflow-x-auto"
      aria-label="Grille des courts"
      role="region"
    >
      {/* Header: Court Names */}
      <div className="grid min-w-[800px] grid-cols-8 gap-2">
        {/* Empty corner */}
        <div className="h-12" aria-hidden="true" />

        {/* Court Headers */}
        {cells.map((courtCells) => (
          <div
            key={courtCells[0]?.courtId}
            className="flex flex-col items-center justify-center rounded-lg bg-surface-container-highest p-2"
          >
            <span className="font-headline text-headline-sm font-bold text-on-surface">
              Court {courtCells[0]?.courtNumber}
            </span>
            <span className="font-body text-body-sm text-on-surface/60">
              {getCourtTypeLabel(courtCells[0]?.courtType || 'Quick')}
            </span>
          </div>
        ))}
      </div>

      {/* Grid: Time Slots */}
      {Array.from({ length: GRID_TOTAL_ROWS }).map((_, rowIndex) => {
        const hour = GRID_START_HOUR + rowIndex * 2;

        return (
          <div key={rowIndex} className="grid min-w-[800px] grid-cols-8 gap-2">
            {/* Time Label */}
            <div className="flex items-center justify-center">
              <span className="font-body text-body-sm font-medium text-on-surface/70">
                {formatHour(hour)}
              </span>
            </div>

            {/* Court Cells */}
            {cells.map((courtCells) => {
              const cell = courtCells[rowIndex];
              if (!cell) return null;

              return (
                <CourtGridCell
                  key={cell.id}
                  cell={cell}
                  onClick={onCellClick}
                />
              );
            })}
          </div>
        );
      })}
    </section>
  );
}

export default InteractiveCourtGrid;
