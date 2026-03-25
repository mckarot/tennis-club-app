export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
export type BadgeSize = 'small' | 'medium' | 'large';

export const badgeVariants: Record<BadgeVariant, string> = {
  primary: 'bg-primary-fixed text-primary',
  secondary: 'bg-secondary-fixed text-secondary',
  success: 'bg-primary-fixed text-primary',
  warning: 'bg-secondary-container text-secondary',
  danger: 'bg-tertiary text-white',
  neutral: 'bg-surface-container-highest text-on-surface',
};

export const badgeSizes: Record<BadgeSize, string> = {
  small: 'px-2 py-0.5 text-xs',
  medium: 'px-3 py-1 text-xs',
  large: 'px-4 py-1.5 text-sm',
};
