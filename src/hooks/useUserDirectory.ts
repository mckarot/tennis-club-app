// src/hooks/useUserDirectory.ts

import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole, UserStatus, CreateUserInput } from '../firebase/types';
import {
  subscribeToAllUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  type UserFilter,
} from '../services/userService';

interface UserDirectoryFilter {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
}

interface UseUserDirectoryReturn {
  users: User[];
  filteredUsers: User[];
  isLoading: boolean;
  error: Error | null;
  filter: UserDirectoryFilter;
  currentPage: number;
  totalPages: number;
  setFilter: (filter: UserDirectoryFilter) => void;
  setPage: (page: number) => void;
  createUser: (input: CreateUserInput) => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  refresh: () => void;
}

const ITEMS_PER_PAGE = 10;

export function useUserDirectory(): UseUserDirectoryReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserDirectoryFilter>({
    search: '',
    role: 'all',
    status: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Subscribe to all users (real-time)
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToAllUsers((fetchedUsers) => {
      console.log('[useUserDirectory] Fetched users from Firestore:', fetchedUsers.length);
      
      // Map Firestore users to expected format immediately
      const mappedUsers = fetchedUsers.map(user => ({
        ...user,
        displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
        name: user.name || user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
        roleLabel: user.role === 'admin' ? 'Admin' : user.role === 'moniteur' ? 'Moniteur' : 'Client',
        avatar: user.avatar || null,
      }));

      console.log('[useUserDirectory] Mapped users:', mappedUsers.length);
      setUsers(mappedUsers);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply filters and search
  useEffect(() => {
    const applyFilters = async () => {
      const roleFilter: UserRole | undefined =
        filter.role !== 'all' ? filter.role : undefined;
      const statusFilter: UserStatus | undefined =
        filter.status !== 'all' ? filter.status : undefined;

      const userFilter: UserFilter = {
        role: roleFilter,
        status: statusFilter,
        orderBy: 'email',
        order: 'asc',
      };

      try {
        // If no search query and no filters, use users from subscription directly
        if (!filter.search && !roleFilter && !statusFilter) {
          console.log('[useUserDirectory] No filters, using subscribed users directly:', users.length);
          setFilteredUsers(users);
          setCurrentPage(1);
          return;
        }

        // Otherwise use searchUsers with filters
        const results = await searchUsers(filter.search, userFilter);

        // Map search results to expected format
        const mappedResults = results.map(user => ({
          ...user,
          displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
          name: user.name || user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
          roleLabel: user.role === 'admin' ? 'Admin' : user.role === 'moniteur' ? 'Moniteur' : 'Client',
          avatar: user.avatar || null,
        }));

        console.log('[useUserDirectory] Filtered users:', mappedResults.length, 'from', results.length);
        setFilteredUsers(mappedResults);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (err) {
        console.error('[useUserDirectory] Error filtering:', err);
        setError(err instanceof Error ? err : new Error('Filter error'));
      }
    };

    applyFilters();
  }, [filter, users, searchUsers]);

  const handleCreateUser = useCallback(async (input: CreateUserInput) => {
    try {
      const result = await createUser(input);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create user');
      }

      // No need to refresh - real-time subscription will update automatically
      return result.userId;
    } catch (err) {
      console.error('[useUserDirectory] Error creating user:', err);
      throw err;
    }
  }, []);

  const handleUpdateUser = useCallback(async (userId: string, data: Partial<User>) => {
    try {
      const result = await updateUser({ uid: userId, ...data });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update user');
      }

      // No need to refresh - real-time subscription will update automatically
    } catch (err) {
      console.error('[useUserDirectory] Error updating user:', err);
      throw err;
    }
  }, []);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      const result = await deleteUser(userId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // No need to refresh - real-time subscription will update automatically
    } catch (err) {
      console.error('[useUserDirectory] Error deleting user:', err);
      throw err;
    }
  }, []);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return {
    users: paginatedUsers,
    filteredUsers,
    isLoading,
    error,
    filter,
    filters: filter, // Alias for compatibility
    searchQuery: filter.search,
    pagination: {
      currentPage,
      totalPages,
      itemsPerPage: ITEMS_PER_PAGE,
    },
    currentPage,
    totalPages,
    setFilter,
    onFilter: setFilter, // Alias for Dashboard Admin compatibility
    setPage: setCurrentPage,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    refresh: () => {
      setIsLoading(true);
      // Trigger re-subscription by resetting users
      setUsers([]);
    },
  };
}
