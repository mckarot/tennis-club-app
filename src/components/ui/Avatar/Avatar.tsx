import type { AvatarSize, AvatarStatus } from './Avatar.types';
import { avatarSizes, statusColors } from './Avatar.types';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

export function Avatar({
  src,
  alt = 'User avatar',
  name,
  size = 'medium',
  status,
  className = '',
}: AvatarProps) {
  const sizeStyles = avatarSizes[size];
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeStyles} rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden`}
        aria-label={alt}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span className="font-headline font-semibold text-on-surface">{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${statusColors[status]}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
