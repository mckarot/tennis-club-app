/**
 * CourtSelector Component
 *
 * Dropdown selector for courts with surface type filtering.
 * Used in the booking flow to select a court.
 *
 * @module @components/reservations/CourtSelector
 */

import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Court, CourtType, CourtStatus } from '../../types/court.types';

export interface CourtSelectorProps {
  courts: Court[];
  selectedCourt: Court | null;
  onCourtSelect: (court: Court) => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
}

export type SurfaceFilter = 'all' | 'Quick' | 'Terre';

const SURFACE_FILTERS: { value: SurfaceFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'Tous', icon: 'apps' },
  { value: 'Quick', label: 'Quick', icon: 'square' },
  { value: 'Terre', label: 'Terre', icon: 'circle' },
];

/**
 * Get court status badge style
 */
function getStatusStyle(status: CourtStatus, isActive: boolean): string {
  if (!isActive || status === 'closed') {
    return 'bg-surface-dim text-on-surface/40';
  }
  if (status === 'maintenance') {
    return 'bg-error-container text-on-error-container';
  }
  return 'bg-primary text-on-primary';
}

/**
 * Get court type badge style
 */
function getTypeStyle(type: CourtType): string {
  if (type === 'Terre') {
    return 'bg-secondary/20 text-secondary';
  }
  return 'bg-primary/20 text-primary';
}

export function CourtSelector({
  courts,
  selectedCourt,
  onCourtSelect,
  isLoading = false,
  disabled = false,
  label = 'Sélectionner un court',
}: CourtSelectorProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredCourts = useMemo(() => {
    if (surfaceFilter === 'all') return courts;
    return courts.filter((court) => court.type === surfaceFilter);
  }, [courts, surfaceFilter]);

  const activeCourts = useMemo(() => {
    return filteredCourts.filter((court) => court.is_active && court.status !== 'closed');
  }, [filteredCourts]);

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, height: shouldReduceMotion ? 'auto' : 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: { duration: shouldReduceMotion ? 0 : 0.2 },
    },
  };

  const handleCourtSelect = (court: Court) => {
    if (!court.is_active || court.status === 'closed') return;
    onCourtSelect(court);
    setIsExpanded(false);
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block font-body text-body-sm font-medium text-on-surface-variant mb-2">
          {label}
        </label>
      )}

      {/* Surface Filter Tabs */}
      <div className="flex gap-2 mb-4" role="tablist" aria-label="Surface type filter">
        {SURFACE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSurfaceFilter(filter.value)}
            role="tab"
            aria-selected={surfaceFilter === filter.value}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-body text-body-sm font-medium
              transition-all duration-200
              ${
                surfaceFilter === filter.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }
            `}
          >
            <span className="material-symbols-outlined text-sm">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Selected Court Display / Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled || isLoading}
        aria-label={selectedCourt ? `Selected: ${selectedCourt.name}` : 'Select a court'}
        aria-expanded={isExpanded}
        className={`
          w-full flex items-center justify-between p-4 rounded-lg
          bg-surface-container-high border border-surface-container-highest
          transition-all duration-200
          ${
            disabled || isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-on-surface-variant">
            {selectedCourt ? 'sports_tennis' : 'add_circle'}
          </span>
          <div className="text-left">
            <div className="font-headline text-base font-semibold text-on-surface">
              {selectedCourt ? selectedCourt.name : 'Aucun court sélectionné'}
            </div>
            {selectedCourt && (
              <div className="font-body text-body-sm text-on-surface-variant">
                {selectedCourt.type} • {selectedCourt.surface}
              </div>
            )}
          </div>
        </div>
        <span
          className={`material-symbols-outlined transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown Content */}
      {isExpanded && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
          className="mt-2 max-h-64 overflow-y-auto bg-surface-container-low rounded-lg border border-surface-container-highest shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-8" role="status">
              <span className="material-symbols-outlined animate-spin text-2xl text-primary">
                progress_activity
              </span>
              <span className="sr-only">Chargement...</span>
            </div>
          ) : activeCourts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                sports_tennis
              </span>
              <p className="font-body text-body-sm text-on-surface-variant">
                Aucun court disponible pour ce filtre
              </p>
            </div>
          ) : (
            <ul role="listbox" aria-label="Available courts">
              {activeCourts.map((court) => (
                <li key={court.id}>
                  <button
                    onClick={() => handleCourtSelect(court)}
                    role="option"
                    aria-selected={selectedCourt?.id === court.id}
                    className={`
                      w-full flex items-center justify-between p-4
                      transition-all duration-200
                      ${
                        selectedCourt?.id === court.id
                          ? 'bg-primary/10 border-l-4 border-primary'
                          : 'hover:bg-surface-container-high'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        sports_tennis
                      </span>
                      <div className="text-left">
                        <div className="font-headline text-base font-semibold text-on-surface">
                          {court.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-body-xs font-medium ${getTypeStyle(
                              court.type
                            )}`}
                          >
                            {court.type}
                          </span>
                          <span className="font-body text-body-xs text-on-surface-variant">
                            {court.surface}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-body-xs font-medium ${getStatusStyle(
                          court.status,
                          court.is_active
                        )}`}
                      >
                        {court.status === 'maintenance'
                          ? 'Maintenance'
                          : court.is_active
                          ? 'Actif'
                          : 'Fermé'}
                      </span>
                      {selectedCourt?.id === court.id && (
                        <span className="material-symbols-outlined text-primary text-sm">
                          check_circle
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default CourtSelector;
