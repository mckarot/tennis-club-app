import { motion, useReducedMotion } from 'framer-motion';
import { TimeSlotCell } from '../TimeSlotCell/TimeSlotCell';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import { useCourtGrid } from '../../../hooks/useCourtGrid';
import type { TimeSlot } from '../../../types/reservation.types';

export interface CourtGridProps {
  courtId: string;
  date: Date;
  onSlotClick?: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export function CourtGrid({
  courtId,
  date,
  onSlotClick,
  isLoading = false,
}: CourtGridProps) {
  const shouldReduceMotion = useReducedMotion();
  const { timeSlots, handleSlotClick } = useCourtGrid({
    courtId,
    date,
    onSlotClick,
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-surface-container-lowest rounded-xl p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-headline-md font-semibold">
          Disponibilité du jour
        </h3>
        <div className="flex items-center gap-4 text-on-surface/60">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-primary rounded-md" />
            <span className="font-body text-body-sm">Confirmé Quick</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-secondary rounded-md" />
            <span className="font-body text-body-sm">Confirmé Terre</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-surface-container-high rounded-md border border-surface-container-highest" />
            <span className="font-body text-body-sm">Libre</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <motion.div className="grid grid-cols-7 gap-2 overflow-x-auto" variants={containerVariants}>
        {hours.map((hour) => {
          const slot = timeSlots.find((s) => new Date(s.start).getHours() === hour);
          return (
            <motion.div key={hour} variants={itemVariants}>
              <TimeSlotCell
                hour={hour}
                slot={slot}
                onClick={() => slot && handleSlotClick(slot)}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Scroll hint */}
      <div className="flex items-center justify-center gap-2 mt-4 text-on-surface/40 lg:hidden">
        <span className="material-symbols-outlined text-sm">swipe</span>
        <span className="font-body text-body-sm">Faites défiler pour voir plus</span>
      </div>
    </motion.div>
  );
}
