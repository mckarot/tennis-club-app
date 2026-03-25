export type SlotState = 'available' | 'confirmed' | 'empty';

export const slotStateStyles: Record<SlotState, string> = {
  available: 'bg-surface-container-high hover:border-primary/30 border border-surface-container-highest',
  confirmed: 'bg-primary text-white',
  empty: 'bg-transparent',
};
