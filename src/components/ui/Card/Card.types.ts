export type CardVariant = 'default' | 'elevated' | 'overlay' | 'glass';

export const cardVariants: Record<CardVariant, string> = {
  default: 'bg-surface-container-lowest rounded-xl p-6',
  elevated: 'bg-surface-container-lowest rounded-xl p-6 shadow-md',
  overlay: 'bg-surface-container-lowest/95 backdrop-blur-lg rounded-xl p-6 shadow-xl',
  glass: 'bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20',
};
