import { useState, useEffect, useCallback } from 'react';
import type { TimeSlot } from '../../types/reservation.types';

export interface UseCourtGridOptions {
  courtId: string;
  date: Date;
  onSlotClick?: (slot: TimeSlot) => void;
}

export interface UseCourtGridReturn {
  timeSlots: TimeSlot[];
  isLoading: boolean;
  error: Error | null;
  handleSlotClick: (slot: TimeSlot) => void;
}

export function useCourtGrid({
  courtId,
  date,
  onSlotClick,
}: UseCourtGridOptions): UseCourtGridReturn {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Generate time slots for the day (6 AM to 10 PM)
  const generateTimeSlots = useCallback(() => {
    const slots: TimeSlot[] = [];
    const startHour = 6;
    const endHour = 22;

    for (let hour = startHour; hour < endHour; hour++) {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(date);
      end.setHours(hour + 1, 0, 0, 0);

      // Simulate availability (replace with actual API call)
      const isAvailable = Math.random() > 0.5;

      slots.push({
        start,
        end,
        available: isAvailable,
        court_id: courtId,
      });
    }

    setTimeSlots(slots);
    setIsLoading(false);
  }, [courtId, date]);

  // Load time slots on mount or date change
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      generateTimeSlots();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load time slots'));
      setIsLoading(false);
    }
  }, [generateTimeSlots]);

  const handleSlotClick = useCallback(
    (slot: TimeSlot) => {
      if (slot.available) {
        onSlotClick?.(slot);
      }
    },
    [onSlotClick]
  );

  return {
    timeSlots,
    isLoading,
    error,
    handleSlotClick,
  };
}
