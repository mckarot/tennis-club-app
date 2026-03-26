/**
 * NotificationPreferences Component
 *
 * Notification settings with email and SMS toggles.
 * Auto-saves on toggle change.
 *
 * Features:
 * - Toggle switches for email and SMS notifications
 * - Auto-save on toggle change
 * - Loading state during save
 * - Framer Motion animations
 * - ARIA labels for accessibility (role="switch")
 *
 * @module @components/client/ClientProfile/NotificationPreferences
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NotificationPreferences as NotificationPreferencesType } from '../../../firebase/types';

interface NotificationPreferencesProps {
  /** Current notification preferences */
  preferences: NotificationPreferencesType;
  /** Save callback */
  onSave: (data: {
    emailNotifications: boolean;
    smsNotifications: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  /** Loading state */
  loading?: boolean;
}

// ==========================================
// TOGGLE COMPONENT
// ==========================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  disabled?: boolean;
  loading?: boolean;
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  loading = false,
}: ToggleProps) {
  const handleChange = useCallback(() => {
    if (!disabled && !loading) {
      onChange(!checked);
    }
  }, [checked, onChange, disabled, loading]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleChange();
      }
    },
    [handleChange]
  );

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-body text-base font-medium text-on-surface">{label}</p>
        <p className="font-body text-sm text-on-surface/60">{description}</p>
      </div>

      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${label} - ${checked ? 'activé' : 'désactivé'}`}
        disabled={disabled || loading}
        onClick={handleChange}
        onKeyDown={handleKeyDown}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-primary' : 'bg-surface-container-highest'
        }`}
        whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      >
        <motion.span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
      </motion.button>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function NotificationPreferences({
  preferences,
  onSave,
  loading = false,
}: NotificationPreferencesProps) {
  const [emailNotifications, setEmailNotifications] = useState(preferences.emailNotifications);
  const [smsNotifications, setSmsNotifications] = useState(preferences.smsNotifications);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /**
   * Sync local state with props
   */
  useEffect(() => {
    setEmailNotifications(preferences.emailNotifications);
    setSmsNotifications(preferences.smsNotifications);
  }, [preferences]);

  /**
   * Handle toggle change with auto-save
   */
  const handleToggleChange = useCallback(
    async (field: 'emailNotifications' | 'smsNotifications', value: boolean) => {
      if (field === 'emailNotifications') {
        setEmailNotifications(value);
      } else {
        setSmsNotifications(value);
      }

      // Auto-save
      setIsSaving(true);
      setSaveSuccess(false);

      const result = await onSave({
        emailNotifications: field === 'emailNotifications' ? value : emailNotifications,
        smsNotifications: field === 'smsNotifications' ? value : smsNotifications,
      });

      setIsSaving(false);

      if (result.success) {
        setSaveSuccess(true);

        // Clear success message after 2 seconds
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    },
    [emailNotifications, smsNotifications, onSave]
  );

  return (
    <div className="space-y-4">
      {/* Email Notifications Toggle */}
      <Toggle
        checked={emailNotifications}
        onChange={(checked) => handleToggleChange('emailNotifications', checked)}
        label="Notifications par email"
        description="Recevoir les confirmations et rappels par email"
        disabled={loading}
        loading={isSaving}
      />

      {/* SMS Notifications Toggle */}
      <Toggle
        checked={smsNotifications}
        onChange={(checked) => handleToggleChange('smsNotifications', checked)}
        label="Notifications par SMS"
        description="Recevoir les confirmations et rappels par SMS"
        disabled={loading}
        loading={isSaving}
      />

      {/* Save Status */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-lg bg-primary-fixed/20 p-3 text-center" role="status">
              <p className="font-body text-sm font-medium text-primary">
                Préférences enregistrées
              </p>
            </div>
          </motion.div>
        )}

        {isSaving && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-on-surface/60">
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              <span>Enregistrement...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationPreferences;
