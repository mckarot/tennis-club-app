/**
 * UserDirectoryTable Component
 *
 * Searchable, filterable user directory table with pagination.
 *
 * Features:
 * - Search input with debounce
 * - Role and status filters
 * - Table with pagination
 * - Role badges (Admin/Moniteur/Client)
 * - Status indicators (🟢 Online/🟡 Away/⚫ Inactive)
 * - Framer Motion animations
 * - ARIA labels for accessibility
 *
 * @module @pages/admin/components/AdminDashboard/UserDirectoryTable
 */

import React from 'react';
import { motion } from 'framer-motion';
import type {
  UserDirectoryEntry,
  UserFilters,
  PaginationState,
} from '../../../hooks/useUserDirectory';

/**
 * UserDirectoryTable component props
 */
export interface UserDirectoryTableProps {
  users: UserDirectoryEntry[];
  isLoading?: boolean;
  searchQuery: string;
  filters: UserFilters;
  pagination: PaginationState;
  onSearch: (query: string) => void;
  onFilter: (filters: Partial<UserFilters>) => void;
  onPageChange: (page: number) => void;
}

/**
 * Get status indicator emoji and color
 */
function getStatusIndicator(status: string): { emoji: string; color: string; label: string } {
  switch (status) {
    case 'online':
      return { emoji: '🟢', color: 'text-primary', label: 'Online' };
    case 'away':
      return { emoji: '🟡', color: 'text-secondary', label: 'Away' };
    case 'inactive':
      return { emoji: '⚫', color: 'text-on-surface-variant', label: 'Inactive' };
    default:
      return { emoji: '⚪', color: 'text-on-surface-variant', label: 'Unknown' };
  }
}

/**
 * Get role badge styles
 */
function getRoleBadgeStyles(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-primary-fixed/30 text-primary';
    case 'moniteur':
      return 'bg-secondary-fixed/30 text-secondary';
    case 'client':
      return 'bg-surface-container-highest text-on-surface';
    default:
      return 'bg-surface-container-highest text-on-surface';
  }
}

/**
 * UserDirectoryTable component
 */
export function UserDirectoryTable({
  users,
  isLoading = false,
  searchQuery,
  filters,
  pagination,
  onSearch,
  onFilter,
  onPageChange,
}: UserDirectoryTableProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-surface-container-lowest shadow-sm"
      role="region"
      aria-label="User directory"
    >
      {/* Header */}
      <div className="border-b border-surface-container-highest p-6">
        <h2 className="font-headline text-lg font-bold text-on-surface">
          User Directory
        </h2>
        <p className="font-body text-sm text-on-surface-variant">
          Manage club members and staff
        </p>
      </div>

      {/* Filters */}
      <div className="border-b border-surface-container-highest p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                aria-hidden="true"
              >
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full rounded-lg bg-surface-container-low pl-10 pr-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Search users"
                data-testid="user-search-input"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {/* Role filter */}
            <select
              value={filters.role}
              onChange={(e) => onFilter({ role: e.target.value as UserFilters['role'] })}
              className="rounded-lg bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moniteur">Moniteur</option>
              <option value="client">Client</option>
            </select>

            {/* Status filter */}
            <select
              value={filters.status}
              onChange={(e) => onFilter({ status: e.target.value as UserFilters['status'] })}
              className="rounded-lg bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          className="w-full"
          role="table"
          aria-label="User directory table"
        >
          <thead>
            <tr className="border-b border-surface-container-highest">
              <th
                scope="col"
                className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                User
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-container-highest">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 rounded bg-surface-container-highest" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 rounded bg-surface-container-highest" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 rounded bg-surface-container-highest" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-surface-container-highest" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 w-8 rounded bg-surface-container-highest" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              // Empty state
              <tr data-testid="empty-state">
                <td colSpan={5} className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined mx-mb-2 block text-4xl text-on-surface-variant">
                    people_outline
                  </span>
                  <p className="font-body text-sm text-on-surface-variant">
                    No users found
                  </p>
                </td>
              </tr>
            ) : (
              // User rows
              users.map((user) => {
                const status = getStatusIndicator(user.status);

                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="transition-colors hover:bg-surface-container-low"
                    data-testid="user-table-row"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                            aria-hidden="true"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed/30">
                            <span className="font-headline text-sm font-bold text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-body text-sm font-semibold text-on-surface">
                            {user.displayName}
                          </p>
                          <p className="font-body text-xs text-on-surface-variant">
                            ID: {user.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-body text-xs font-semibold ${getRoleBadgeStyles(
                          user.role
                        )}`}
                      >
                        {user.roleLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true">{status.emoji}</span>
                        <span className="font-body text-sm text-on-surface">
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="font-body text-sm text-on-surface">
                          {user.displayEmail}
                        </p>
                        {user.phone && (
                          <p className="font-body text-xs text-on-surface-variant">
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="p-2 hover:bg-surface-container-low rounded-full"
                        aria-label="More actions"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant">
                          more_vert
                        </span>
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="border-t border-surface-container-highest px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm text-on-surface-variant">
              Showing{' '}
              <span className="font-semibold text-on-surface">
                {(pagination.currentPage - 1) * pagination.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-on-surface">
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-on-surface">
                {pagination.totalItems}
              </span>{' '}
              users
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="rounded-lg bg-surface-container-highest px-4 py-2 font-body text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>

              <span className="flex items-center px-4 font-body text-sm font-medium text-on-surface">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="rounded-lg bg-surface-container-highest px-4 py-2 font-body text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default UserDirectoryTable;
