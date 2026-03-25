/**
 * ReservationFilters Component
 *
 * Filter controls for reservations: Date range, status, court type.
 *
 * @module @components/reservations/ReservationFilters
 */

import { useState, useCallback } from 'react';
import type { ReservationStatus, ReservationType } from '../../types/reservation.types';
import type { CourtType } from '../../types/court.types';

export interface ReservationFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  showDateRange?: boolean;
  showStatus?: boolean;
  showCourtType?: boolean;
  showReservationType?: boolean;
}

export interface FilterState {
  startDate: Date | null;
  endDate: Date | null;
  status: ReservationStatus | 'all';
  courtType: CourtType | 'all';
  reservationType: ReservationType | 'all';
}

const STATUS_OPTIONS: { value: ReservationStatus | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'Tous', icon: 'filter_list' },
  { value: 'confirmed', label: 'Confirmées', icon: 'check_circle' },
  { value: 'pending', label: 'En attente', icon: 'schedule' },
  { value: 'pending_payment', label: 'En attente de paiement', icon: 'payment' },
  { value: 'cancelled', label: 'Annulées', icon: 'cancel' },
  { value: 'completed', label: 'Terminées', icon: 'event_available' },
];

const COURT_TYPE_OPTIONS: { value: CourtType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'Tous', icon: 'apps' },
  { value: 'Quick', label: 'Quick', icon: 'square' },
  { value: 'Terre', label: 'Terre', icon: 'circle' },
];

const RESERVATION_TYPE_OPTIONS: {
  value: ReservationType | 'all';
  label: string;
  icon: string;
}[] = [
  { value: 'all', label: 'Tous', icon: 'category' },
  { value: 'location_libre', label: 'Location libre', icon: 'sports_tennis' },
  { value: 'cours_collectif', label: 'Cours collectif', icon: 'groups' },
  { value: 'cours_private', label: 'Cours particulier', icon: 'person' },
  { value: 'doubles', label: 'Doubles', icon: 'people' },
  { value: 'training', label: 'Entraînement', icon: 'fitness_center' },
];

const DEFAULT_FILTERS: FilterState = {
  startDate: null,
  endDate: null,
  status: 'all',
  courtType: 'all',
  reservationType: 'all',
};

/**
 * Format date for input
 */
function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

/**
 * Parse date from input
 */
function parseDateFromInput(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function ReservationFilters({
  onFilterChange,
  initialFilters,
  showDateRange = true,
  showStatus = true,
  showCourtType = true,
  showReservationType = false,
}: ReservationFiltersProps): JSX.Element {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseDateFromInput(e.target.value);
    updateFilter('startDate', date);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseDateFromInput(e.target.value);
    updateFilter('endDate', date);
  };

  const handleStatusChange = (status: ReservationStatus | 'all') => {
    updateFilter('status', status);
  };

  const handleCourtTypeChange = (courtType: CourtType | 'all') => {
    updateFilter('courtType', courtType);
  };

  const handleReservationTypeChange = (reservationType: ReservationType | 'all') => {
    updateFilter('reservationType', reservationType);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.startDate !== null ||
    filters.endDate !== null ||
    filters.status !== 'all' ||
    filters.courtType !== 'all' ||
    filters.reservationType !== 'all';

  const activeFilterCount =
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.courtType !== 'all' ? 1 : 0) +
    (filters.reservationType !== 'all' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
          <span className="font-headline text-base font-semibold text-on-surface">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary font-body text-body-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg font-body text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
              aria-label="Clear all filters"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Réinitialiser
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Hide filters' : 'Show filters'}
            className="flex items-center gap-1 px-4 py-2 rounded-lg font-body text-body-sm font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
            {isExpanded ? 'Moins' : 'Plus de filtres'}
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 p-4 rounded-xl bg-surface-container-lowest border border-surface-container-highest">
          {/* Date Range */}
          {showDateRange && (
            <div>
              <label className="block font-body text-body-sm font-medium text-on-surface-variant mb-2">
                Période
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="start-date"
                    className="block font-body text-body-xs text-on-surface-variant mb-1"
                  >
                    Du
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={formatDateForInput(filters.startDate)}
                    onChange={handleStartDateChange}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-high border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end-date"
                    className="block font-body text-body-xs text-on-surface-variant mb-1"
                  >
                    Au
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={formatDateForInput(filters.endDate)}
                    onChange={handleEndDateChange}
                    min={formatDateForInput(filters.startDate) || undefined}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-high border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status Filter */}
          {showStatus && (
            <div>
              <label className="block font-body text-body-sm font-medium text-on-surface-variant mb-2">
                Statut
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    aria-pressed={filters.status === option.value}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-body text-body-sm font-medium transition-all duration-200
                      ${
                        filters.status === option.value
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-sm">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Court Type Filter */}
          {showCourtType && (
            <div>
              <label className="block font-body text-body-sm font-medium text-on-surface-variant mb-2">
                Type de court
              </label>
              <div className="flex flex-wrap gap-2">
                {COURT_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleCourtTypeChange(option.value)}
                    aria-pressed={filters.courtType === option.value}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-body text-body-sm font-medium transition-all duration-200
                      ${
                        filters.courtType === option.value
                          ? option.value === 'Terre'
                            ? 'bg-secondary text-on-secondary'
                            : 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-sm">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reservation Type Filter */}
          {showReservationType && (
            <div>
              <label className="block font-body text-body-sm font-medium text-on-surface-variant mb-2">
                Type de réservation
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {RESERVATION_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleReservationTypeChange(option.value)}
                    aria-pressed={filters.reservationType === option.value}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-lg font-body text-body-sm font-medium transition-all duration-200
                      ${
                        filters.reservationType === option.value
                          ? 'bg-primary/10 border-2 border-primary text-primary'
                          : 'bg-surface-container-high border-2 border-transparent text-on-surface-variant hover:bg-surface-container-highest'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-sm">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReservationFilters;
