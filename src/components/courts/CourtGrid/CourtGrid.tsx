import { motion, useReducedMotion } from 'framer-motion';
import { CourtHeader } from './CourtHeader';
import { TimeColumn } from './TimeColumn';
import { ViewToggle } from './ViewToggle';
import { AvailabilityLegend } from './AvailabilityLegend';
import { TimeSlotCell } from '../TimeSlotCell/TimeSlotCell';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import type { CourtGridProps, GridCell, GridViewMode } from './CourtGrid.types';
import type { TimeSlotState } from './CourtGrid.types';

export function CourtGrid({
  courts,
  viewMode,
  onViewModeChange,
  onSlotClick,
  isLoading = false,
  startDate = new Date(),
}: CourtGridProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' },
    },
  };

  if (isLoading) {
    return <LoadingGrid />;
  }

  const startHour = 6;
  const endHour = 22;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-surface-container-lowest rounded-xl p-6 shadow-sm"
    >
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline text-headline-md font-semibold text-on-surface">
          {viewMode === 'today' ? 'Disponibilités du jour' : 'Disponibilités de la semaine'}
        </h3>
        <ViewToggle mode={viewMode} onModeChange={onViewModeChange} />
      </div>

      {/* Legend */}
      <div className="mb-6">
        <AvailabilityLegend />
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-max grid grid-cols-[80px_repeat(7,1fr)] gap-2">
          {/* Time Column Header */}
          <div className="col-start-1 row-start-1" />

          {/* Court Headers */}
          {courts.map((courtCells, courtIndex) => {
            const firstCell = courtCells[0];
            return (
              <motion.div
                key={firstCell.courtId}
                variants={itemVariants}
                className="col-start-2"
                // Inline style required for dynamic grid-column positioning in CSS grid layout
                style={{ gridColumnStart: courtIndex + 2 }}
              >
                <CourtHeader
                  courtNumber={firstCell.courtNumber}
                  courtName={`Court ${firstCell.courtNumber}`}
                  courtType={firstCell.courtType}
                  isActive={true}
                />
              </motion.div>
            );
          })}

          {/* Time Rows */}
          {hours.map((hour, rowIndex) => (
            <motion.div
              key={hour}
              variants={itemVariants}
              className="col-start-1 grid grid-cols-subgrid col-span-8 gap-2"
              // Inline style required for dynamic grid-row positioning in CSS grid layout
              style={{ gridRow: rowIndex + 2 }}
            >
              {/* Time Label */}
              <TimeColumn startHour={startHour} endHour={endHour} />

              {/* Court Cells for this hour */}
              {courts.map((courtCells) => {
                const cell = courtCells.find((c) => c.hour === hour);
                return (
                  <TimeSlotCell
                    key={cell?.courtId || hour}
                    hour={hour}
                    state={cell?.state || 'available'}
                    courtType={cell?.courtType}
                    onClick={() => cell && onSlotClick?.(cell)}
                  />
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll hint for mobile */}
      <div className="flex items-center justify-center gap-2 mt-4 text-on-surface/40 lg:hidden">
        <span className="material-symbols-outlined text-sm">swipe</span>
        <span className="font-body text-body-sm">Faites défiler pour voir plus</span>
      </div>
    </motion.div>
  );
}
