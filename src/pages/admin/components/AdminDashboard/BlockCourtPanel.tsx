/**
 * BlockCourtPanel Component
 *
 * Panel for blocking courts for maintenance or events.
 * Features exact #9d431b background color from audit PNG.
 *
 * Features:
 * - Background #9d431b (secondary color)
 * - White text
 * - Court selection dropdown
 * - Time range inputs
 * - Reason input
 * - Block Court button (white)
 * - Form validation
 * - Framer Motion animations
 * - ARIA labels for accessibility
 *
 * @module @pages/admin/components/AdminDashboard/BlockCourtPanel
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { CourtDeployment } from '../../../hooks/useCourtDeployment';

/**
 * Block court form data
 */
export interface BlockCourtFormData {
  courtId: string;
  startTime: string;
  endTime: string;
  reason: string;
  type: 'maintenance' | 'event' | 'other';
}

/**
 * BlockCourtPanel component props
 */
export interface BlockCourtPanelProps {
  courts: CourtDeployment[];
  onSubmit: (data: BlockCourtFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Time options for dropdown (6:00 to 21:00)
 */
const TIME_OPTIONS = [
  { value: '06:00', label: '06:00' },
  { value: '07:00', label: '07:00' },
  { value: '08:00', label: '08:00' },
  { value: '09:00', label: '09:00' },
  { value: '10:00', label: '10:00' },
  { value: '11:00', label: '11:00' },
  { value: '12:00', label: '12:00' },
  { value: '13:00', label: '13:00' },
  { value: '14:00', label: '14:00' },
  { value: '15:00', label: '15:00' },
  { value: '16:00', label: '16:00' },
  { value: '17:00', label: '17:00' },
  { value: '18:00', label: '18:00' },
  { value: '19:00', label: '19:00' },
  { value: '20:00', label: '20:00' },
  { value: '21:00', label: '21:00' },
];

/**
 * BlockCourtPanel component
 */
export function BlockCourtPanel({
  courts,
  onSubmit,
  isLoading = false,
}: BlockCourtPanelProps): JSX.Element {
  const [formData, setFormData] = useState<BlockCourtFormData>({
    courtId: '',
    startTime: '06:00',
    endTime: '08:00',
    reason: '',
    type: 'maintenance',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BlockCourtFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof BlockCourtFormData, string>> = {};

    if (!formData.courtId) {
      newErrors.courtId = 'Please select a court';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time required';
    } else if (formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setFormData({
        courtId: '',
        startTime: '06:00',
        endTime: '08:00',
        reason: '',
        type: 'maintenance',
      });
      setErrors({});
    } catch (err) {
      console.error('[BlockCourtPanel] Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof BlockCourtFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-secondary p-6 shadow-sm"
      role="region"
      aria-label="Block court form"
    >
      <div className="mb-6">
        <h2 className="font-headline text-lg font-bold text-white">
          Block Court
        </h2>
        <p className="font-body text-sm text-white/80">
          Reserve a court for maintenance or special events
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Court Selection */}
        <div>
          <label
            htmlFor="courtId"
            className="block font-body text-sm font-semibold text-white/90"
          >
            Court
          </label>
          <select
            id="courtId"
            name="courtId"
            value={formData.courtId}
            onChange={handleChange}
            className={`mt-1 w-full rounded-lg bg-white/10 px-4 py-3 font-body text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white ${
              errors.courtId ? 'ring-2 ring-white/50' : ''
            }`}
            aria-invalid={!!errors.courtId}
            aria-describedby={errors.courtId ? 'courtId-error' : undefined}
          >
            <option value="" className="text-on-surface">
              Select a court
            </option>
            {courts.map((court) => (
              <option
                key={court.id}
                value={court.id}
                className="text-on-surface"
              >
                Court {court.number} - {court.name}
              </option>
            ))}
          </select>
          {errors.courtId && (
            <p id="courtId-error" className="mt-1 font-body text-xs text-white/80" role="alert">
              {errors.courtId}
            </p>
          )}
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startTime"
              className="block font-body text-sm font-semibold text-white/90"
            >
              Start Time
            </label>
            <select
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg bg-white/10 px-4 py-3 font-body text-base text-white focus:outline-none focus:ring-2 focus:ring-white ${
                errors.startTime ? 'ring-2 ring-white/50' : ''
              }`}
              aria-invalid={!!errors.startTime}
              aria-describedby={errors.startTime ? 'startTime-error' : undefined}
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time.value} value={time.value} className="text-on-surface">
                  {time.label}
                </option>
              ))}
            </select>
            {errors.startTime && (
              <p id="startTime-error" className="mt-1 font-body text-xs text-white/80" role="alert">
                {errors.startTime}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="block font-body text-sm font-semibold text-white/90"
            >
              End Time
            </label>
            <select
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg bg-white/10 px-4 py-3 font-body text-base text-white focus:outline-none focus:ring-2 focus:ring-white ${
                errors.endTime ? 'ring-2 ring-white/50' : ''
              }`}
              aria-invalid={!!errors.endTime}
              aria-describedby={errors.endTime ? 'endTime-error' : undefined}
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time.value} value={time.value} className="text-on-surface">
                  {time.label}
                </option>
              ))}
            </select>
            {errors.endTime && (
              <p id="endTime-error" className="mt-1 font-body text-xs text-white/80" role="alert">
                {errors.endTime}
              </p>
            )}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label
            htmlFor="reason"
            className="block font-body text-sm font-semibold text-white/90"
          >
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            placeholder="e.g., Surface maintenance, Tournament setup..."
            className={`mt-1 w-full rounded-lg bg-white/10 px-4 py-3 font-body text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white ${
              errors.reason ? 'ring-2 ring-white/50' : ''
            }`}
            aria-invalid={!!errors.reason}
            aria-describedby={errors.reason ? 'reason-error' : undefined}
          />
          {errors.reason && (
            <p id="reason-error" className="mt-1 font-body text-xs text-white/80" role="alert">
              {errors.reason}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || isLoading}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="w-full rounded-lg bg-white px-6 py-3 font-body text-base font-bold text-secondary transition-colors hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#9d431b] disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="Block court"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Blocking...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">block</span>
              Block Court
            </span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

export default BlockCourtPanel;
