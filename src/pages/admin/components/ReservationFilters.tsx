/**
 * ReservationFilters Component
 *
 * Filter panel for reservations with date range, court, status, type, and search.
 *
 * Features:
 * - Filtre date range (picker)
 * - Filtre court (dropdown)
 * - Filtre status (chips: All/Confirmed/Pending/Cancelled/Completed)
 * - Filtre type (chips: All/PRO/Group/Libre/Maintenance)
 * - Barre de recherche (nom utilisateur/moniteur)
 * - Bouton "Apply Filters"
 * - Framer Motion animations
 * - ARIA : role="search"
 *
 * @module @pages/admin/components/ReservationFilters
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { ReservationStatus, ReservationType } from '../../../types/reservation.types';
import type { Court } from '../../../types/court.types';
import type { ReservationFilters as FiltersType } from '../../../hooks/useAdminReservations';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface ReservationFiltersProps {
  filters: FiltersType;
  courts?: Map<string, Court>;
  onFilterChange: (filters: FiltersType) => void;
}

// ==========================================
// STATUS CHIP CONFIGURATION
// ==========================================

const STATUS_OPTIONS: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

const TYPE_OPTIONS: { value: ReservationType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cours_private', label: 'PRO' },
  { value: 'cours_collectif', label: 'PRO' },
  { value: 'location_libre', label: 'Libre' },
  { value: 'individual', label: 'PRO' },
  { value: 'doubles', label: 'PRO' },
  { value: 'training', label: 'Group' },
  { value: 'tournament', label: 'Group' },
  { value: 'maintenance', label: 'Maintenance' },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ReservationFilters({
  filters,
  courts,
  onFilterChange,
}: ReservationFiltersProps) {
  const [localDateRange, setLocalDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: filters.dateRange.start?.toISOString().split('T')[0] || '',
    end: filters.dateRange.end?.toISOString().split('T')[0] || '',
  });

  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...localDateRange, [field]: value };
    setLocalDateRange(newRange);

    const newFilters: FiltersType = {
      ...filters,
      dateRange: {
        start: newRange.start ? new Date(newRange.start) : null,
        end: newRange.end ? new Date(newRange.end) : null,
      },
    };
    onFilterChange(newFilters);
  };

  /**
   * Handle court change
   */
  const handleCourtChange = (courtId: string) => {
    onFilterChange({
      ...filters,
      courtId: courtId || 'all',
    });
  };

  /**
   * Handle status change
   */
  const handleStatusChange = (status: ReservationStatus | 'all') => {
    onFilterChange({
      ...filters,
      status,
    });
  };

  /**
   * Handle type change
   */
  const handleTypeChange = (type: ReservationType | 'all') => {
    onFilterChange({
      ...filters,
      type,
    });
  };

  /**
   * Handle search input change
   */
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  /**
   * Apply search on blur or Enter
   */
  const applySearch = () => {
    onFilterChange({
      ...filters,
      searchQuery: searchInput,
    });
  };

  /**
   * Handle key down for search input
   */
  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      applySearch();
    }
  };

  /**
   * Reset all filters
   */
  const handleResetFilters = () => {
    setLocalDateRange({ start: '', end: '' });
    setSearchInput('');
    onFilterChange({
      dateRange: { start: null, end: null },
      courtId: 'all',
      status: 'all',
      type: 'all',
      searchQuery: '',
    });
  };

  return (
    <motion.div
      role="search"
      aria-label="Filter reservations"
      className="rounded-xl bg-surface-container-low p-6 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Bar */}
      <div className="mb-6">
        <label htmlFor="search-reservations" className="sr-only">
          Search by user or moniteur name
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              id="search-reservations"
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onBlur={applySearch}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by user or moniteur name..."
              className="w-full rounded-lg border border-outline bg-surface-container-high py-2.5 pl-10 pr-4 font-body text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <motion.button
            onClick={applySearch}
            className="rounded-lg bg-primary px-4 py-2.5 font-body text-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Apply
          </motion.button>
        </div>
      </div>

      {/* Date Range */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="date-start"
            className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
          >
            Start Date
          </label>
          <input
            id="date-start"
            type="date"
            value={localDateRange.start}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
            className="w-full rounded-lg border border-outline bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label
            htmlFor="date-end"
            className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
          >
            End Date
          </label>
          <input
            id="date-end"
            type="date"
            value={localDateRange.end}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
            className="w-full rounded-lg border border-outline bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Court Dropdown */}
      <div className="mb-6">
        <label
          htmlFor="court-filter"
          className="mb-1 block font-body text-sm font-medium text-on-surface-variant"
        >
          Court
        </label>
        <select
          id="court-filter"
          value={filters.courtId}
          onChange={(e) => handleCourtChange(e.target.value)}
          className="w-full rounded-lg border border-outline bg-surface-container-high py-2.5 px-3 font-body text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Courts</option>
          {courts &&
            Array.from(courts.entries()).map(([id, court]) => (
              <option key={id} value={id}>
                Court {court.number} - {court.name}
              </option>
            ))}
        </select>
      </div>

      {/* Status Chips */}
      <div className="mb-6">
        <span className="mb-2 block font-body text-sm font-medium text-on-surface-variant">
          Status
        </span>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors ${
                filters.status === option.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={filters.status === option.value}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Type Chips */}
      <div className="mb-6">
        <span className="mb-2 block font-body text-sm font-medium text-on-surface-variant">
          Type
        </span>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => handleTypeChange(option.value)}
              className={`rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors ${
                filters.type === option.value
                  ? 'bg-[#006b3f] text-white'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={filters.type === option.value}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Reset Filters Button */}
      <motion.button
        onClick={handleResetFilters}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline bg-surface-container py-2.5 font-body text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="material-symbols-outlined text-base">filter_alt_off</span>
        Reset Filters
      </motion.button>
    </motion.div>
  );
}

export default ReservationFilters;
