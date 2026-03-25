export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-br from-primary to-primary-container text-white rounded-md hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  secondary: 'border-2 border-secondary text-secondary bg-transparent rounded-md hover:bg-secondary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
  tertiary: 'border-2 border-primary text-primary bg-transparent rounded-lg hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  ghost: 'bg-transparent text-primary hover:bg-primary/10 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  danger: 'bg-tertiary text-white rounded-md hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2',
};

export const buttonSizes: Record<ButtonSize, string> = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-8 py-4 text-base',
  large: 'px-10 py-5 text-lg',
};
