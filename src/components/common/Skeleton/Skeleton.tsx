import React from 'react';
import { cn } from '../../../utils/classNames';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  return (
    <div
      className={cn(
        'bg-surface-container-highest',
        variant === 'text' && 'rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-none',
        variant === 'rounded' && 'rounded-lg',
        animation === 'pulse' && 'animate-pulse',
        className
      )}
      style={{
        width: width || (variant === 'circular' ? height : '100%'),
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className,
}) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        height="1em"
        className={cn('mb-2', i === lines - 1 && 'mb-0', i === lines - 1 && 'w-3/4')}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-surface-container-lowest rounded-xl p-6">
    <Skeleton variant="rectangular" height="160px" className="rounded-lg mb-4" />
    <SkeletonText lines={2} />
    <div className="mt-4 flex gap-2">
      <Skeleton variant="rounded" width="80px" height="36px" />
      <Skeleton variant="rounded" width="80px" height="36px" />
    </div>
  </div>
);
