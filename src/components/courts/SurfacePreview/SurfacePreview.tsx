import { motion, useReducedMotion } from 'framer-motion';
import type { SurfacePreviewProps } from './SurfacePreview.types';
import { surfaceTextureConfig, courtTypeColors, surfacePreviewSizes } from './SurfacePreview.types';

export function SurfacePreview({
  surface,
  courtType,
  size = 'md',
  showLabel = true,
  className = '',
}: SurfacePreviewProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const config = surfaceTextureConfig[surface];
  const borderClass = courtTypeColors[courtType];
  const sizeClass = surfacePreviewSizes[size];

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      className={`
        relative rounded-lg overflow-hidden border-2
        ${borderClass}
        ${sizeClass}
        ${className}
      `}
      role="img"
      aria-label={`Surface: ${config.label} (${courtType})`}
    >
      {/* Gradient Background */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br
          ${config.gradient}
        `}
      />

      {/* Texture Pattern */}
      <div
        className={`
          absolute inset-0 opacity-50
          ${config.pattern}
        `}
      />

      {/* Court Lines */}
      <div className="absolute inset-2 border-2 border-white/40 rounded-sm" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/40" />

      {/* Label */}
      {showLabel && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md">
          <span className="font-body text-label-xs font-medium text-white">
            {config.label}
          </span>
        </div>
      )}

      {/* Court Type Badge */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md">
        <span className="font-body text-label-xs font-medium text-white uppercase">
          {courtType}
        </span>
      </div>
    </motion.div>
  );
}
