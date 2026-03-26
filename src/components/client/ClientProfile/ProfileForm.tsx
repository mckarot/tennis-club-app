/**
 * ProfileForm Component
 *
 * Profile information form with validation.
 * Handles personal info updates including name, email, phone, and avatar.
 *
 * Features:
 * - Form validation (name required, phone format)
 * - AvatarPicker integration
 * - Loading and success states
 * - Error display
 * - Framer Motion animations
 * - ARIA labels for accessibility
 *
 * @module @components/client/ClientProfile/ProfileForm
 */

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ClientProfile } from '../../../firebase/types';
import { AvatarPicker } from './AvatarPicker';

interface ProfileFormProps {
  /** Current profile data */
  profile: ClientProfile | null;
  /** Save callback */
  onSave: (data: {
    name: string;
    phone?: string;
    avatar?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  /** Loading state */
  loading?: boolean;
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Validate phone number (Martinique format)
 * Accepts: 0696XX XX XX, 0596XX XX XX, +596 XX XX XX XX
 */
function isValidPhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true; // Optional field

  const phoneRegex = /^(\+596|0)[56]96\d{2}\s?\d{2}\s?\d{2}$/;
  const cleaned = phone.replace(/[\s.-]/g, '');
  return phoneRegex.test(cleaned);
}

/**
 * Validate name (2-50 characters)
 */
function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
}

// ==========================================
// COMPONENT
// ==========================================

export function ProfileForm({ profile, onSave, loading = false }: ProfileFormProps) {
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validation state
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  /**
   * Load profile data into form
   */
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || '');
      setAvatar(profile.avatar);
    }
  }, [profile]);

  /**
   * Handle name change with validation
   */
  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setName(value);

    // Validate on change
    if (value && !isValidName(value)) {
      setNameError('Name must be between 2 and 50 characters');
    } else {
      setNameError(null);
    }
  }, []);

  /**
   * Handle phone change with validation
   */
  const handlePhoneChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPhone(value);

    // Validate on change
    if (value && !isValidPhone(value)) {
      setPhoneError('Invalid phone format (e.g., 0696 12 34 56)');
    } else {
      setPhoneError(null);
    }
  }, []);

  /**
   * Handle avatar selection
   */
  const handleAvatarSelect = useCallback((file: File) => {
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setAvatar(objectUrl);

    // In a real implementation, upload to Firebase Storage here
    console.log('[ProfileForm] Avatar selected:', file.name);
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setFormError(null);
      setSaveSuccess(false);

      // Validate form
      let hasError = false;

      if (!isValidName(name)) {
        setNameError('Name must be between 2 and 50 characters');
        hasError = true;
      }

      if (phone && !isValidPhone(phone)) {
        setPhoneError('Invalid phone format');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      // Save profile
      const result = await onSave({
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatar,
      });

      if (result.success) {
        setSaveSuccess(true);
        setIsEditing(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setFormError(result.error || 'Failed to save profile');
      }
    },
    [name, phone, avatar, onSave]
  );

  /**
   * Handle cancel editing
   */
  const handleCancel = useCallback(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || '');
      setAvatar(profile.avatar);
    }
    setIsEditing(false);
    setFormError(null);
    setNameError(null);
    setPhoneError(null);
  }, [profile]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Avatar Picker */}
      <AvatarPicker
        avatarUrl={avatar}
        userName={name || 'User'}
        onAvatarSelect={handleAvatarSelect}
        loading={loading}
        disabled={!isEditing}
      />

      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="block font-body text-sm font-medium text-on-surface">
          Nom <span className="text-error">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={handleNameChange}
          disabled={!isEditing || loading}
          required
          aria-required="true"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'name-error' : undefined}
          className={`w-full rounded-lg bg-surface-container-lowest px-4 py-3 font-body text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
            nameError ? 'ring-2 ring-error' : ''
          }`}
          placeholder="Votre nom"
        />
        {nameError && (
          <p id="name-error" className="font-body text-sm text-error" role="alert">
            {nameError}
          </p>
        )}
      </div>

      {/* Email Field (Read-only) */}
      <div className="space-y-2">
        <label htmlFor="email" className="block font-body text-sm font-medium text-on-surface">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={profile?.email || ''}
          disabled
          aria-readonly="true"
          className="w-full cursor-not-allowed rounded-lg bg-surface-container-highest/50 px-4 py-3 font-body text-on-surface/60"
        />
        <p className="font-body text-xs text-on-surface/40">
          L'email ne peut pas être modifié
        </p>
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <label htmlFor="phone" className="block font-body text-sm font-medium text-on-surface">
          Téléphone <span className="text-on-surface/40">(optionnel)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          disabled={!isEditing || loading}
          aria-invalid={!!phoneError}
          aria-describedby={phoneError ? 'phone-error' : undefined}
          placeholder="0696 12 34 56"
          className={`w-full rounded-lg bg-surface-container-lowest px-4 py-3 font-body text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
            phoneError ? 'ring-2 ring-error' : ''
          }`}
        />
        {phoneError && (
          <p id="phone-error" className="font-body text-sm text-error" role="alert">
            {phoneError}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isEditing ? (
          <motion.button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="flex-1 rounded-lg bg-primary px-6 py-3 font-body text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            aria-label="Modifier le profil"
          >
            Modifier le profil
          </motion.button>
        ) : (
          <>
            <motion.button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 rounded-lg bg-surface-container-highest px-6 py-3 font-body text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest/70 disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              aria-label="Annuler les modifications"
            >
              Annuler
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading || !!nameError || !!phoneError}
              className="flex-1 rounded-lg bg-primary px-6 py-3 font-body text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              aria-label="Enregistrer les modifications"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span>Enregistrement...</span>
                </span>
              ) : (
                'Enregistrer'
              )}
            </motion.button>
          </>
        )}
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-primary-fixed/20 p-4 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="font-body text-sm font-medium text-primary">
            Profil enregistré avec succès
          </p>
        </motion.div>
      )}

      {/* Error Message */}
      {formError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-error-container p-4 text-center"
          role="alert"
          aria-live="assertive"
        >
          <p className="font-body text-sm font-medium text-error">{formError}</p>
        </motion.div>
      )}
    </form>
  );
}

export default ProfileForm;
