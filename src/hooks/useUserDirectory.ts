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
      setUsers(fetchedUsers);
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
        orderBy: 'name',
        order: 'asc',
      };

      try {
        const results = await searchUsers(filter.search, userFilter);
        setFilteredUsers(results);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (err) {
        console.error('[useUserDirectory] Error filtering:', err);
        setError(err instanceof Error ? err : new Error('Filter error'));
      }
    };

    applyFilters();
  }, [filter, users]);

  const handleCreateUser = useCallback(async (input: CreateUserInput) => {
    try {
      const result = await createUser(input);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create user');
      }
      
      // Refresh user list
      await refresh();
      
      return result.userId;
    } catch (err) {
      console.error('[useUserDirectory] Error creating user:', err);
      throw err;
    }
  }, [refresh]);

  const handleUpdateUser = useCallback(async (userId: string, data: Partial<User>) => {
    try {
      const result = await updateUser({ uid: userId, ...data });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update user');
      }
      
      // Refresh user list
      await refresh();
    } catch (err) {
      console.error('[useUserDirectory] Error updating user:', err);
      throw err;
    }
  }, [refresh]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      const result = await deleteUser(userId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Refresh user list
      await refresh();
    } catch (err) {
      console.error('[useUserDirectory] Error deleting user:', err);
      throw err;
    }
  }, [refresh]);

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
    currentPage,
    totalPages,
    setFilter,
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
