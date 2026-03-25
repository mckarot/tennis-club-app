export type FABVariant = 'primary' | 'secondary' | 'danger';

export const fabVariants: Record<FABVariant, string> = {
  primary: 'bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-lg hover:opacity-90',
  secondary: 'bg-secondary text-white rounded-full shadow-lg hover:opacity-90',
  danger: 'bg-tertiary text-white rounded-full shadow-lg hover:opacity-90',
};
