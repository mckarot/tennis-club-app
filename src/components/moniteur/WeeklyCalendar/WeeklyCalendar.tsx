/**
 * WeeklyCalendar Component
 *
 * Displays a 7-day calendar grid (MON-SUN) with session blocks.
 * Based on PNG audit: 7 columns, current day with #f0f5ee background,
 * dates in bold 24px.
 *
 * Features:
 * - Header with 7 days (MON-SUN)
 * - Dates displayed in bold 24px
 * - Current day with #f0f5ee background
 * - Grid with SessionBlock components
 * - Horizontal scroll on mobile
 * - ARIA compliant with grid role
 * - Framer Motion animations
 *
 * @module @components/moniteur/WeeklyCalendar
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SessionBlock } from '../SessionBlock/SessionBlock';
import type { WeeklyCalendarProps, WeekDay, SessionBlockData } from '../../types/moniteur.types';
import type { MoniteurSlot } from '../../types/slot.types';

/**
 * Container variants for staggered animation
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      duration: 0.3,
    },
  },
};

/**
 * Item variants for day columns
 */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Map MoniteurSlot to SessionBlockData
 */
function mapToSessionBlockData(slot: MoniteurSlot): SessionBlockData {
  return {
    id: slot.id || '',
    variant: slot.type === 'PRIVATE' ? 'pro' : 'group',
    startTime: slot.start_time,
    endTime: slot.end_time,
    participantCount: slot.current_participants || 0,
    maxParticipants: slot.max_participants,
    slot,
  };
}

/**
 * Generate time slots for a day (hourly from 6:00 to 22:00)
 */
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

/**
 * WeeklyCalendar Component
 */
export function WeeklyCalendar({
  calendar,
  onSlotClick,
  onEmptySlotClick,
}: WeeklyCalendarProps) {
  const shouldReduceMotion = useReducedMotion();
  const timeSlots = generateTimeSlots();

  const handleSlotClick = (block: SessionBlockData) => {
    if (block.slot && onSlotClick) {
      onSlotClick(block.slot);
    }
  };

  if (!calendar) {
    return (
      <div
        role="grid"
        aria-label="Calendar loading"
        className="animate-pulse rounded-xl bg-surface-container-low p-4"
      >
        <div className="h-40 bg-surface-container-highest/30 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      role="grid"
      aria-label={`Semaine du ${calendar.weekStart}`}
      className="rounded-xl bg-surface-container-low p-4 md:p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    >
      {/* Header - Day names */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {calendar.days.map((day, index) => (
          <motion.div
            key={day.date}
            className="text-center"
            variants={itemVariants}
            transition={{ 
              delay: shouldReduceMotion ? 0 : index * 0.05, 
              duration: shouldReduceMotion ? 0 : 0.2 
            }}
          >
            <p className="font-body text-xs font-semibold text-on-surface/60 uppercase tracking-wide">
              {day.dayName}
            </p>
            <p
              className={`
                font-headline text-2xl font-bold mt-1
                ${day.isToday ? 'text-primary' : 'text-on-surface'}
              `}
            >
              {day.dayNumber}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[700px]">
          {calendar.days.map((day, dayIndex) => (
            <DayColumn
              key={day.date}
              day={day}
              isToday={day.isToday}
              onSlotClick={handleSlotClick}
              onEmptySlotClick={onEmptySlotClick}
              delay={dayIndex * 0.05}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * DayColumn Component (internal)
 */
interface DayColumnProps {
  day: WeekDay;
  isToday: boolean;
  onSlotClick: (block: SessionBlockData) => void;
  onEmptySlotClick?: (date: string, time: string) => void;
  delay: number;
}

function DayColumn({
  day,
  isToday,
  onSlotClick,
  onEmptySlotClick,
  delay,
}: DayColumnProps) {
  const shouldReduceMotion = useReducedMotion();
  
  // Group slots by hour for display
  const slotsByHour = new Map<string, MoniteurSlot[]>();

  day.slots.forEach(slot => {
    const hour = slot.start_time.split(':')[0] + ':00';
    const existing = slotsByHour.get(hour) || [];
    existing.push(slot);
    slotsByHour.set(hour, existing);
  });

  return (
    <motion.div
      className={`
        rounded-lg p-2 min-h-[400px]
        ${isToday ? 'bg-[#f0f5ee]' : 'bg-transparent'}
      `}
      variants={itemVariants}
      transition={{ delay: shouldReduceMotion ? 0 : delay, duration: shouldReduceMotion ? 0 : 0.2 }}
    >
      <div className="space-y-2">
        {day.slots.length === 0 ? (
          // Empty day state
          <div className="text-center py-8">
            <p className="font-body text-sm text-on-surface/40">No sessions</p>
          </div>
        ) : (
          // Display slots
          day.slots.map((slot, slotIndex) => {
            const blockData = mapToSessionBlockData(slot);
            
            return (
              <SessionBlock
                key={slot.id || slotIndex}
                block={blockData}
                onClick={onSlotClick}
                compact
              />
            );
          })
        )}
      </div>
    </motion.div>
  );
}

export default WeeklyCalendar;
