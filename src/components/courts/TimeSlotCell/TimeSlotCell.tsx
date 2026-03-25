import type { TimeSlot } from '../../../types/reservation.types';
import type { SlotState } from './TimeSlotCell.types';
import { slotStateStyles } from './TimeSlotCell.types';

export interface TimeSlotCellProps {
  hour: number;
  slot?: TimeSlot;
  onClick?: () => void;
}

export function TimeSlotCell({ hour, slot, onClick }: TimeSlotCellProps) {
  const state: SlotState = slot
    ? slot.available
      ? 'available'
      : 'confirmed'
    : 'empty';

  const styles = slotStateStyles[state];

  const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

  return (
    <button
      onClick={onClick}
      disabled={state === 'empty'}
      aria-label={`${formatHour(hour)} - ${state === 'available' ? 'Disponible' : state === 'confirmed' ? 'Réservé' : 'Indisponible'}`}
      className={`
        h-16 rounded-md flex flex-col items-center justify-center
        transition-all duration-200
        ${styles}
        ${onClick && state !== 'empty' ? 'hover:scale-105 cursor-pointer' : ''}
        ${state === 'empty' ? 'cursor-default' : ''}
      `}
    >
      <span className="font-body text-label font-semibold">
        {formatHour(hour)}
      </span>
      {slot && !slot.available && (
        <span className="material-symbols-outlined text-xs mt-1">
          sports_tennis
        </span>
      )}
    </button>
  );
}
