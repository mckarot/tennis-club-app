// src/pages/admin/AdminCourtsPage/index.tsx

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminCourts } from '../../../hooks/useAdminCourts';
import { CourtList } from '../../../components/admin/CourtList';
import { AddCourtModal } from './components/AddCourtModal';
import { EditCourtModal } from './components/EditCourtModal';
import { DeleteCourtDialog } from './components/DeleteCourtDialog';
import type { Court, CourtInput } from '../../../types/court.types';

export const AdminCourtsPage: FC = () => {
  const {
    courts,
    isLoading,
    createCourt,
    updateCourt,
    deleteCourt,
    toggleCourtStatus,
  } = useAdminCourts();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const handleEdit = (court: Court) => {
    setSelectedCourt(court);
    setIsEditOpen(true);
  };

  const handleDelete = (court: Court) => {
    setSelectedCourt(court);
    setIsDeleteOpen(true);
  };

  const handleClose = () => {
    setSelectedCourt(null);
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
  };

  const handleAdd = async (data: CourtInput) => {
    setIsMutating(true);
    try {
      await createCourt(data);
      handleClose();
    } catch (error) {
      console.error('[AdminCourtsPage] handleAdd error:', error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdate = async (data: CourtInput) => {
    if (!selectedCourt) return;

    setIsMutating(true);
    try {
      await updateCourt(selectedCourt.id, data);
      handleClose();
    } catch (error) {
      console.error('[AdminCourtsPage] handleUpdate error:', error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourt) return;

    setIsMutating(true);
    try {
      await deleteCourt(selectedCourt.id);
      handleClose();
    } catch (error) {
      console.error('[AdminCourtsPage] handleDeleteConfirm error:', error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleStatus = async (courtId: string) => {
    try {
      await toggleCourtStatus(courtId);
    } catch (error) {
      console.error('[AdminCourtsPage] handleToggleStatus error:', error);
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
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tighter">
            Court Management
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage all courts in the Tennis Club du François
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          aria-label="Add new court"
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add Court
        </button>
      </motion.div>

      {/* Court List */}
      <CourtList
        courts={courts}
        isLoading={isLoading}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <AddCourtModal
        isOpen={isAddOpen}
        onClose={handleClose}
        onSubmit={handleAdd}
        isSubmitting={isMutating}
      />

      <EditCourtModal
        isOpen={isEditOpen}
        court={selectedCourt}
        onClose={handleClose}
        onSubmit={handleUpdate}
        isSubmitting={isMutating}
      />

      <DeleteCourtDialog
        isOpen={isDeleteOpen}
        court={selectedCourt}
        onClose={handleClose}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminCourtsPage;
