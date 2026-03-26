// src/components/users/UserDirectory/UserDirectory.tsx

import { FC } from 'react';
import { motion } from 'framer-motion';
import type { User, UserRole, UserStatus } from '../../../firebase/types';
import { RoleBadge } from '../RoleBadge/RoleBadge';
import { StatusIndicator } from '../StatusIndicator/StatusIndicator';
import { UserActionsMenu } from '../UserActionsMenu/UserActionsMenu';
import { UserCard } from '../UserCard/UserCard';

/**
 * Convert UserRole (lowercase) to RoleType (uppercase) for RoleBadge
 */
function userRoleToRoleType(role: UserRole): 'ADMIN' | 'MONITEUR' | 'CLIENT' {
  switch (role) {
    case 'admin':
      return 'ADMIN';
    case 'moniteur':
      return 'MONITEUR';
    case 'client':
      return 'CLIENT';
    default:
      return 'CLIENT';
  }
}

interface UserDirectoryFilter {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
}

interface UserDirectoryProps {
  users: User[];
  isLoading: boolean;
  filter: UserDirectoryFilter;
  onFilterChange: (filter: UserDirectoryFilter) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const UserDirectory: FC<UserDirectoryProps> = ({
  users,
  isLoading,
  filter,
  onFilterChange,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, role: e.target.value as UserRole | 'all' });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, status: e.target.value as UserStatus | 'all' });
  };

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading users"
        className="flex items-center justify-center py-12"
      >
        <span className="material-symbols-outlined animate-spin text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div
        role="status"
        aria-label="No users found"
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
          people_outline
        </span>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
          No users found
        </h3>
        <p className="font-body text-sm text-on-surface-variant max-w-md">
          No users match your search criteria. Try adjusting your filters or add a new user.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <input
          type="search"
          aria-label="Search users"
          placeholder="Search by name or email..."
          value={filter.search}
          onChange={handleSearchChange}
          className="flex-1 px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          aria-label="Filter by role"
          value={filter.role}
          onChange={handleRoleChange}
          className="px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moniteur">Moniteur</option>
          <option value="client">Client</option>
        </select>
        <select
          aria-label="Filter by status"
          value={filter.status}
          onChange={handleStatusChange}
          className="px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="away">Away</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-surface rounded-xl border border-surface-container-highest overflow-hidden">
        <table role="table" aria-label="Users directory" className="w-full">
          <thead className="bg-surface-container-low">
            <tr>
              <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-on-surface-variant text-left">
                Full Name
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-on-surface-variant text-left">
                Email
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-on-surface-variant text-left">
                Role
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-on-surface-variant text-left">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-on-surface-variant text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest">
            {users.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-surface-container-low transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center"
                    >
                      <span className="text-sm font-bold text-primary">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <span className="font-headline text-sm font-bold text-on-surface">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{user.email}</td>
                <td className="px-6 py-4">
                  <RoleBadge role={userRoleToRoleType(user.role)} />
                </td>
                <td className="px-6 py-4">
                  <StatusIndicator status={user.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <UserActionsMenu
                    onEdit={() => onEdit(user)}
                    onDelete={() => onDelete(user)}
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          role="navigation"
          aria-label="Pagination"
          className="flex items-center justify-between pt-4"
        >
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="px-4 py-2 bg-surface text-on-surface rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container-highest transition-colors"
          >
            Prev
          </button>
          <span className="text-sm text-on-surface-variant">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
};
