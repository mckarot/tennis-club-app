/**
 * SurfacePreview type definitions
 */

import type { CourtType, SurfaceType } from '../../../types/court.types';

/**
 * Surface preview props
 */
export interface SurfacePreviewProps {
  surface: SurfaceType;
  courtType: CourtType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Surface texture configuration
 */
export interface SurfaceTextureConfig {
  gradient: string;
  pattern: string;
  label: string;
}

/**
 * Surface texture configurations
 */
export const surfaceTextureConfig: Record<SurfaceType, SurfaceTextureConfig> = {
  Hard: {
    gradient: 'from-blue-400 to-blue-600',
    pattern: 'bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:4px_4px]',
    label: 'Dur',
  },
  Clay: {
    gradient: 'from-orange-400 to-orange-700',
    pattern: 'bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] bg-[length:2px_2px]',
    label: 'Terre battue',
  },
  Grass: {
    gradient: 'from-green-400 to-green-700',
    pattern: 'bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)]',
    label: 'Gazon',
  },
  Synthetic: {
    gradient: 'from-emerald-400 to-emerald-600',
    pattern: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:100%_4px]',
    label: 'Synthétique',
  },
};

/**
 * Court type color mapping
 */
export const courtTypeColors: Record<CourtType, string> = {
  Quick: 'border-primary',
  Terre: 'border-secondary',
};

/**
 * Size configurations
 */
export const surfacePreviewSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-16',
  md: 'h-24',
  lg: 'h-32',
};
