// src/components/admin/CourtForm/CourtForm.tsx

import { FC, useState, useEffect, useRef } from 'react';
import type { Court, CourtInput, CourtType, SurfaceType, CourtStatus } from '../../../types/court.types';

export interface CourtFormProps {
  court?: Court | null;
  onSubmit: (data: CourtInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormErrors {
  number?: string;
  name?: string;
  type?: string;
  surface?: string;
}

export const CourtForm: FC<CourtFormProps> = ({
  court,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [number, setNumber] = useState<number>(court?.number || 1);
  const [name, setName] = useState(court?.name || '');
  const [type, setType] = useState<CourtType>(court?.type || 'Quick');
  const [surface, setSurface] = useState<SurfaceType>(court?.surface || 'Hard');
  const [status, setStatus] = useState<CourtStatus>(court?.status || 'active');
  const [description, setDescription] = useState(court?.description || '');
  const [errors, setErrors] = useState<FormErrors>({});

  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (number < 1 || number > 20) {
      newErrors.number = 'Court number must be between 1 and 20';
    }

    if (!name.trim()) {
      newErrors.name = 'Court name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Court name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit({
      number,
      name,
      type,
      surface,
      description: description || undefined,
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="court-number" className="block text-sm font-medium text-on-surface mb-2">
            Court Number *
          </label>
          <input
            ref={firstInputRef}
            id="court-number"
            type="number"
            min="1"
            max="20"
            value={number}
            onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
            aria-invalid={!!errors.number}
            aria-describedby={errors.number ? 'number-error' : undefined}
            className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.number && (
            <p id="number-error" className="mt-1 text-sm text-tertiary">
              {errors.number}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="court-name" className="block text-sm font-medium text-on-surface mb-2">
            Court Name *
          </label>
          <input
            id="court-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            placeholder="e.g., Court Central"
            className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-tertiary">
              {errors.name}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="court-type" className="block text-sm font-medium text-on-surface mb-2">
            Court Type *
          </label>
          <select
            id="court-type"
            value={type}
            onChange={(e) => setType(e.target.value as CourtType)}
            className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Quick">Quick</option>
            <option value="Terre">Terre Battue</option>
          </select>
        </div>

        <div>
          <label htmlFor="court-surface" className="block text-sm font-medium text-on-surface mb-2">
            Surface *
          </label>
          <select
            id="court-surface"
            value={surface}
            onChange={(e) => setSurface(e.target.value as SurfaceType)}
            className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Hard">Hard</option>
            <option value="Clay">Clay</option>
            <option value="Grass">Grass</option>
            <option value="Synthetic">Synthetic</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="court-status" className="block text-sm font-medium text-on-surface mb-2">
          Status
        </label>
        <select
          id="court-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as CourtStatus)}
          className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div>
        <label htmlFor="court-description" className="block text-sm font-medium text-on-surface mb-2">
          Description
        </label>
        <textarea
          id="court-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Optional court description..."
          className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-surface text-on-surface rounded-xl font-medium hover:bg-surface-container-highest transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-label={court ? 'Update court' : 'Create court'}
          className="flex-1 px-4 py-3 bg-primary text-on-primary rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isSubmitting ? (court ? 'Updating...' : 'Creating...') : court ? 'Update Court' : 'Create Court'}
        </button>
      </div>
    </form>
  );
};

export default CourtForm;
