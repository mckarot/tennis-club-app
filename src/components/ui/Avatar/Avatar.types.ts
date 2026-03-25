export type AvatarSize = 'small' | 'medium' | 'large';
export type AvatarStatus = 'online' | 'offline' | 'busy';

export const avatarSizes: Record<AvatarSize, string> = {
  small: 'w-8 h-8 text-sm',
  medium: 'w-12 h-12 text-base',
  large: 'w-16 h-16 text-lg',
};

export const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-primary',
  offline: 'bg-surface-container-highest',
  busy: 'bg-tertiary',
};
