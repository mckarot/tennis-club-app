// src/components/admin/CourtList/CourtList.tsx

import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Court } from '../../../types/court.types';
import { CourtCard } from '../CourtCard';

export interface CourtListProps {
  courts: Court[];
  isLoading: boolean;
  onToggleStatus: (courtId: string) => void;
  onEdit: (court: Court) => void;
  onDelete: (court: Court) => void;
}

export const CourtList: FC<CourtListProps> = ({
  courts,
  isLoading,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-low rounded-2xl p-5 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest" />
              <div className="flex-1">
                <div className="h-5 bg-surface-container-highest rounded w-24 mb-2" />
                <div className="h-4 bg-surface-container-highest rounded w-16" />
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-surface-container-highest rounded w-20" />
              <div className="h-6 bg-surface-container-highest rounded w-24" />
            </div>
            <div className="flex gap-2 pt-3 border-t border-surface-container-highest">
              <div className="h-9 bg-surface-container-highest rounded flex-1" />
              <div className="h-9 bg-surface-container-highest rounded flex-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
          sports_tennis
        </span>
        <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
          No courts found
        </h3>
        <p className="text-on-surface-variant">
          Add your first court to get started
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {courts.map((court) => (
          <CourtCard
            key={court.id}
            court={court}
            onToggleStatus={onToggleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CourtList;
