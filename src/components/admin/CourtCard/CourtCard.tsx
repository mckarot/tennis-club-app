// src/components/admin/CourtCard/CourtCard.tsx

import { FC } from 'react';
import { motion } from 'framer-motion';
import type { Court } from '../../../types/court.types';
import { CourtStatusToggle } from '../CourtStatusToggle';

export interface CourtCardProps {
  court: Court;
  onToggleStatus: (courtId: string) => void;
  onEdit: (court: Court) => void;
  onDelete: (court: Court) => void;
}

export const CourtCard: FC<CourtCardProps> = ({
  court,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const statusColors: Record<Court['status'], string> = {
    active: 'border-primary',
    maintenance: 'border-secondary',
    closed: 'border-outline',
  };

  const statusBadgeColors: Record<Court['status'], string> = {
    active: 'bg-primary/10 text-primary',
    maintenance: 'bg-secondary/10 text-secondary',
    closed: 'bg-surface-container-highest text-on-surface-variant',
  };

  const surfaceIcons: Record<Court['surface'], string> = {
    Hard: 'square',
    Clay: 'grass',
    Grass: 'yard',
    Synthetic: 'blur_on',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-surface-container-lowest rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 ${statusColors[court.status]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl font-bold">
              sports_tennis
            </span>
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              {court.name}
            </h3>
            <p className="text-sm text-on-surface-variant">
              Court #{court.number}
            </p>
          </div>
        </div>
        <CourtStatusToggle
          isEnabled={court.is_active}
          onToggle={() => onToggleStatus(court.id)}
          ariaLabel={`Toggle ${court.name} availability`}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadgeColors[court.status]}`}
        >
          <span className="material-symbols-outlined text-xs mr-1">
            {court.status === 'active' ? 'check_circle' : court.status === 'maintenance' ? 'build' : 'block'}
          </span>
          {court.status}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface-container-highest text-on-surface-variant">
          <span className="material-symbols-outlined text-xs mr-1">
            {surfaceIcons[court.surface]}
          </span>
          {court.type} • {court.surface}
        </span>
      </div>

      {court.description && (
        <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">
          {court.description}
        </p>
      )}

      <div className="flex gap-2 pt-3 border-t border-surface-container-highest">
        <button
          type="button"
          onClick={() => onEdit(court)}
          aria-label={`Edit ${court.name}`}
          className="flex-1 px-4 py-2 bg-surface text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">edit</span>
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(court)}
          aria-label={`Delete ${court.name}`}
          className="flex-1 px-4 py-2 bg-surface text-on-surface rounded-xl text-sm font-medium hover:bg-error-fixed transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">delete</span>
          Delete
        </button>
      </div>
    </motion.div>
  );
};

export default CourtCard;
