// src/pages/admin/AdminUsersPage/index.tsx

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import type { User, CreateUserInput } from '../../../firebase/types';
import { useUserDirectory } from '../../../hooks/useUserDirectory';
import { UserDirectory } from '../../../components/users/UserDirectory/UserDirectory';
import { AddUserModal } from './components/AddUserModal';
import { EditUserModal } from './components/EditUserModal';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';

export const AdminUsersPage: FC = () => {
  const {
    users,
    isLoading,
    filter,
    currentPage,
    totalPages,
    setFilter,
    setPage,
    createUser,
    updateUser,
    deleteUser,
  } = useUserDirectory();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleClose = () => {
    setSelectedUser(null);
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
  };

  const handleAdd = async (data: CreateUserInput) => {
    await createUser(data);
    handleClose();
  };

  const handleUpdate = async (userId: string, data: Partial<User>) => {
    await updateUser(userId, data);
    handleClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      handleClose();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            User Management
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage all users in the Tennis Club du François
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add User
        </button>
      </motion.div>

      {/* User Directory */}
      <UserDirectory
        users={users}
        isLoading={isLoading}
        filter={filter}
        onFilterChange={handleFilterChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Modals */}
      <AddUserModal
        isOpen={isAddOpen}
        onClose={handleClose}
        onSubmit={handleAdd}
      />

      <EditUserModal
        isOpen={isEditOpen}
        user={selectedUser}
        onClose={handleClose}
        onSubmit={handleUpdate}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        user={selectedUser}
        onClose={handleClose}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminUsersPage;
