import { motion, useReducedMotion } from 'framer-motion';
import type { CourtCardAdminProps } from './CourtCardAdmin.types';
import { adminStatusConfig, mapCourtStatusToAdmin } from './CourtCardAdmin.types';
import { SurfacePreview } from '../SurfacePreview/SurfacePreview';

export function CourtCardAdmin({
  court,
  onEdit,
  onToggleMaintenance,
  onToggleActive,
  className = '',
}: CourtCardAdminProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const adminStatus = mapCourtStatusToAdmin(court.status, court.is_active);
  const statusConfig = adminStatusConfig[adminStatus];

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
      className={`
        bg-surface-container-lowest rounded-xl p-6 shadow-sm
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-headline text-headline-lg font-semibold text-on-surface mb-1">
            {court.name}
          </h3>
          <p className="font-body text-body-sm text-on-surface/60">
            Terrain {court.number}
          </p>
        </div>

        {/* Status Badge */}
        <span
          className={`
            inline-flex items-center gap-1 px-3 py-1 rounded-full
            font-body text-label-xs font-medium uppercase
            ${statusConfig.colorClass}
          `}
        >
          <span className="material-symbols-outlined text-sm">
            {statusConfig.icon}
          </span>
          {statusConfig.label}
        </span>
      </div>

      {/* Surface Preview */}
      <div className="mb-4">
        <SurfacePreview surface={court.surface} courtType={court.type} />
      </div>

      {/* Description */}
      {court.description && (
        <p className="font-body text-body text-on-surface/80 mb-4">
          {court.description}
        </p>
      )}

      {/* Admin Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-container-highest">
        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={court.is_active}
              onChange={(e) => onToggleActive?.(court.id, e.target.checked)}
              className="w-4 h-4 rounded border-surface-container-highest text-primary focus:ring-primary/50"
              aria-label={`Activer ou désactiver ${court.name}`}
            />
            <span className="font-body text-body-sm text-on-surface/80">
              Actif
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={court.status === 'maintenance'}
              onChange={(e) => onToggleMaintenance?.(court.id, e.target.checked)}
              className="w-4 h-4 rounded border-surface-container-highest text-secondary focus:ring-secondary/50"
              aria-label={`Activer mode maintenance pour ${court.name}`}
            />
            <span className="font-body text-body-sm text-on-surface/80">
              Maintenance
            </span>
          </label>
        </div>

        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={() => onEdit(court)}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-body text-body-sm font-medium hover:bg-surface-container-highest transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label={`Modifier ${court.name}`}
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Modifier
          </button>
        )}
      </div>
    </motion.div>
  );
}
